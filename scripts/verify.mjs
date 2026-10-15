#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Post-build verification. Run after every build; it gates the deploy pipeline.
//
// It checks the things that actually break a live export site:
//   - technical SEO (title/description/canonical/H1/sitemap/robots)
//   - broken internal links and missing image alts
//   - fabricated claims (the banned-claim scan)
//   - placeholder leakage (TO_CONFIRM, lorem ipsum, example.com emails)
//   - an inquiry path that actually exists
//
// NEVER weaken a check to make a build pass. If a check fires, the content is
// wrong — remove the claim or add the fact.
//
// Usage: node scripts/verify.mjs      (after `npm run build`)
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '');

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const problems = [];
const pages = [];
const searchable = [];

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else {
      if (p.endsWith('.html')) pages.push(p);
      if (/\.(?:html|css|js|json|xml|txt|svg)$/i.test(p)) searchable.push(p);
    }
  }
}
walk(dist);

// dist has no trailing separator, so slice() leaves a leading one.
const rel = (p) => {
  const rest = p.slice(dist.length).replace(/\\/g, '/').replace(/^\/+/, '');
  return '/' + rest;
};
const internalPaths = new Set(
  pages.map((p) => rel(p).replace(/index\.html$/, '')),
);

// ---------------------------------------------------------------------------
// 1. Technical SEO: every page needs a unique title, a real description, a
//    canonical, exactly one H1.
// ---------------------------------------------------------------------------
const titles = new Map();
const descriptions = new Map();
let canonicalCount = 0;

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const route = rel(page);

  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
  const description =
    html.match(/<meta name="description" content="([\s\S]*?)"/)?.[1] ?? '';
  const canonical = html.match(/<link rel="canonical" href="([\s\S]*?)"/)?.[1] ?? '';

  if (title.length < 10) problems.push(`WEAK title (${title.length} chars): ${route}`);
  if (description.length < 50)
    problems.push(`WEAK description (${description.length} chars): ${route}`);
  if (!canonical) problems.push(`MISSING canonical: ${route}`);
  else if (!canonical.startsWith(siteUrl))
    problems.push(`CANONICAL points off-site (${canonical} vs ${siteUrl}): ${route}`);
  else canonicalCount++;

  const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1 !== 1) problems.push(`H1 COUNT ${h1} (expected 1): ${route}`);

  if (titles.has(title)) problems.push(`DUPLICATE title with ${titles.get(title)}: ${route}`);
  if (descriptions.has(description))
    problems.push(`DUPLICATE description with ${descriptions.get(description)}: ${route}`);
  titles.set(title, route);
  descriptions.set(description, route);
}

// ---------------------------------------------------------------------------
// 2. Links: no broken internal link; sitemap entries must all resolve.
// ---------------------------------------------------------------------------
let linkCount = 0;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    linkCount++;
    const raw = m[1].split('?')[0];
    const target = /\.[a-z0-9]+$/i.test(raw) || raw.endsWith('/') ? raw : raw + '/';
    if (!internalPaths.has(target) && !existsSync(join(dist, raw))) {
      problems.push(`BROKEN LINK ${m[1]} (from ${rel(page)})`);
    }
  }
}

if (!existsSync(join(dist, 'sitemap-index.xml')))
  problems.push('MISSING sitemap-index.xml');
else {
  const sitemap = readFileSync(join(dist, 'sitemap-index.xml'), 'utf8');
  const child = sitemap.match(/<loc>(.*?)<\/loc>/)?.[1];
  if (child && existsSync(join(dist, child.replace(siteUrl, '')))) {
    const urls = [
      ...readFileSync(join(dist, child.replace(siteUrl, '')), 'utf8').matchAll(
        /<loc>(.*?)<\/loc>/g,
      ),
    ].map((m) => m[1]);
    for (const u of urls) {
      const p = new URL(u).pathname;
      const target = /\.[a-z0-9]+$/i.test(p) ? join(dist, p) : join(dist, p, 'index.html');
      if (!existsSync(target)) problems.push(`SITEMAP entry does not resolve: ${u}`);
    }
  }
}

const robotsPath = join(dist, 'robots.txt');
if (!existsSync(robotsPath)) problems.push('MISSING robots.txt');
else if (!readFileSync(robotsPath, 'utf8').includes('Sitemap:'))
  problems.push('robots.txt missing Sitemap directive');

// ---------------------------------------------------------------------------
// 3. Images: every <img> needs an alt attribute.
// ---------------------------------------------------------------------------
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const m of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)) {
    problems.push(`IMG MISSING ALT: ${rel(page)} ${m[0].slice(0, 60)}`);
  }
}

// ---------------------------------------------------------------------------
// 4. Fabricated claims. These phrases are false until someone produces
//    evidence. A site that says them without evidence loses the buyer at the
//    first check — and can become a false statement.
// ---------------------------------------------------------------------------
const bannedClaims = [
  'years of experience', 'years experience', 'years in business', 'founded in',
  'since 19', 'since 20', 'established in',
  'trusted by', 'our customers', 'our clients', 'customer testimonial',
  'countries worldwide', 'countries served', 'exported to',
  'iso 9001', 'iso9001', 'iso 14001', 'ce certified', 'sgs certified',
  'fda approved', 'rohs certified', 'bsci', 'accredited',
  'award-winning', 'leading manufacturer', 'no. 1', 'best price', 'cheapest',
  'annual capacity', 'annual output', 'square meters factory', 'production lines',
  '24/7', '24 hours', 'ready stock', 'in stock',
  'guarantee', 'warranty', 'lifetime warranty',
];

// ---------------------------------------------------------------------------
// 5. Placeholder leakage. A published page must never show template text.
// ---------------------------------------------------------------------------
const leakedTokens = [
  'to_confirm', 'to-confirm', 'todo:', 'lorem ipsum', 'placeholder copy',
  'example product family', 'example buyer question', 'example-family',
  'example-buyer-question', 'your company', 'company name here',
  'xxx@', 'email@example', '@example.com',
];

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const text = html.toLowerCase();

  for (const bad of bannedClaims) {
    if (text.includes(bad)) problems.push(`BANNED CLAIM "${bad}": ${rel(page)}`);
  }
  for (const bad of leakedTokens) {
    if (text.includes(bad)) problems.push(`LEAKED TEMPLATE TEXT "${bad}": ${rel(page)}`);
  }

  // JSON-LD must parse.
  for (const m of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    try {
      const obj = JSON.parse(m[1]);
      if (!obj['@type'] || !obj['@context'])
        problems.push(`JSON-LD missing @type/@context: ${rel(page)}`);
    } catch {
      problems.push(`JSON-LD PARSE ERROR: ${rel(page)}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Inquiry path. A site that cannot receive an inquiry is not finished.
//
//    RULE (single, shared by verify.mjs, intake.mjs and site.ts):
//    an inquiry channel exists when a contact email OR a form endpoint is set.
//    Email alone is sufficient — the form falls back to mailto:. Formspree is
//    recommended but not required. All three places must use the same rule.
// ---------------------------------------------------------------------------
if (!internalPaths.has('/contact/')) problems.push('MISSING ROUTE: /contact/');

const contactHtml = existsSync(join(dist, 'contact', 'index.html'))
  ? readFileSync(join(dist, 'contact', 'index.html'), 'utf8')
  : '';
const hasEndpoint = /data-endpoint="https?:\/\//.test(contactHtml);
const hasEmail = /data-email="[^"]+@[^"]+"/.test(contactHtml);
if (!hasEndpoint && !hasEmail) {
  problems.push(
    'NO INQUIRY PATH: set SITE.email or SITE.rfqEndpoint in src/config/site.ts. ' +
      'Either one is enough — publishing with neither means inquiries are silently lost.',
  );
} else if (!hasEndpoint && hasEmail) {
  // Not a failure: mailto works. Recorded so the tradeoff stays visible.
  console.log(
    'note: inquiry channel is email-only (mailto fallback). A Formspree endpoint ' +
      'is more reliable — see DEPLOY.md §6.',
  );
}
if (contactHtml) {
  const form = contactHtml.match(/<form[\s\S]*?<\/form>/)?.[0] ?? '';
  if (!form) problems.push('/contact/: inquiry form missing');
  else {
    for (const field of ['name', 'email']) {
      const tag = form.match(
        new RegExp(`<(?:input|textarea)[^>]*name="${field}"[^>]*>`),
      )?.[0];
      if (!tag || !tag.includes('required'))
        problems.push(`/contact/: "${field}" must be required`);
    }
  }
}

// ---------------------------------------------------------------------------
// 7. Essentials from src/config/site.ts (source read, not build output).
// ---------------------------------------------------------------------------
const siteSource = readFileSync(join(root, 'src', 'config', 'site.ts'), 'utf8');
const filled = (key) => {
  const m = siteSource.match(new RegExp(`^\\s*${key}:\\s*'(.*)'`, 'm'));
  return m ? m[1].trim() : '';
};
if (!filled('name')) problems.push('SITE.name is empty — the site has no identity');
if (!filled('email') && !filled('rfqEndpoint'))
  problems.push('SITE.email and SITE.rfqEndpoint are both empty');

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(
  `Checked ${pages.length} pages, ${linkCount} internal links, ` +
    `${canonicalCount} canonicals, ${titles.size} unique titles.`,
);

if (problems.length) {
  console.error(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems) console.error('  - ' + p);
  console.error(
    '\nDo not relax these checks to make the build pass. Remove the claim or add the fact.',
  );
  process.exit(1);
}
console.log('verify: OK');
