#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Executable SEO/GEO rule check. Run after `npm run build`.
//
// This is the mechanical half of skills/seo-geo/SKILL.md. It enforces the
// things that can be checked against built HTML:
//   - Google's "you don't need this" list (llms.txt, AI schema, chunking tells)
//   - the scaled-content-abuse pattern (near-duplicate pages)
//   - thin/commodity content signals
//   - GEO overclaiming in the copy itself
//
// It deliberately does NOT check rankings or "AI visibility" — no third party
// has access to those, and a new site has no Search Console data. See SKILL.md.
//
// Usage: node scripts/seo-check.mjs
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) pages.push(p);
  }
})(dist);

const rel = (p) => '/' + p.slice(dist.length).replace(/\\/g, '/').replace(/^\/+/, '');
const problems = [];
const notes = [];

/** Visible text: drop script/style, strip tags, collapse whitespace. */
function text(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
/** Normalised word multiset, for near-duplicate detection. */
function fingerprint(t) {
  const stop = new Set(
    'a an the and or of to in for on with is are be this that we you your our it its as at from by'.split(
      ' ',
    ),
  );
  return new Set(
    t
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stop.has(w)),
  );
}

const docs = pages.map((p) => {
  const html = readFileSync(p, 'utf8');
  return { path: rel(p), html, text: text(html) };
});

// ---------------------------------------------------------------------------
// 1. Tactics Google says you do NOT need (SKILL.md Rule 2).
// ---------------------------------------------------------------------------
const prohibited = [
  [/llms\.txt/i, 'llms.txt reference — Google Search ignores it; no benefit'],
  [
    /<script[^>]+application\/ld\+json[^>]*>[\s\S]*?"@type"\s*:\s*"FAQPage"/i,
    'FAQPage structured data — deprecated for rich results; do not add "for AI"',
  ],
  [/"speakable"/i, 'speakable schema — no search benefit, not for AI'],
  [/"aimode"|"ai_overview"|for ai (search|overview|mode)/i, 'AI-specific markup/claim — not a thing Google supports'],
];

for (const doc of docs) {
  for (const [re, why] of prohibited) {
    if (re.test(doc.html)) problems.push(`${doc.path}: ${why}`);
  }
}

// ---------------------------------------------------------------------------
// 2. Scaled content abuse pattern: near-duplicate pages.
//    Two pages sharing almost all their vocabulary are the fan-out pattern
//    Google's spam policy targets. Real pages differ substantially.
// ---------------------------------------------------------------------------
const prints = docs.map((d) => ({ path: d.path, set: fingerprint(d.text) }));
for (let i = 0; i < prints.length; i++) {
  for (let j = i + 1; j < prints.length; j++) {
    const a = prints[i].set;
    const b = prints[j].set;
    if (!a.size || !b.size) continue;
    let shared = 0;
    for (const w of a) if (b.has(w)) shared++;
    const jaccard = shared / (a.size + b.size - shared);
    if (jaccard > 0.75 && Math.min(a.size, b.size) > 25) {
      problems.push(
        `NEAR-DUPLICATE (${(jaccard * 100).toFixed(0)}% shared vocabulary): ` +
          `${prints[i].path} vs ${prints[j].path} — one intent per URL`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Thin content. A page with almost no unique text is commodity filler and
//    wastes crawl budget. (No ideal length exists — this flags the extremes.)
// ---------------------------------------------------------------------------
const MIN_WORDS = 60;
for (const doc of docs) {
  const words = doc.text.split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS) {
    problems.push(`${doc.path}: thin content (${words} words, min ${MIN_WORDS})`);
  }
}

// ---------------------------------------------------------------------------
// 4. GEO overclaiming in the copy itself. Claiming an AI-visibility guarantee
//    is exactly the misreading the survey warns about.
// ---------------------------------------------------------------------------
const overclaims = [
  [/guarantee[d]?\s+(?:top\s+)?ranking/i, 'guarantees a ranking'],
  [/#1\s+(?:on|in)\s+google/i, 'claims a #1 position'],
  [/increase[s]?\s+visibility\s+by\s+\d+%/i, 'states a visibility-increase percentage'],
  [/40%\s+(?:visibility|boost|increase)/i, 'cites the GEO "40%" figure as a promise'],
];
for (const doc of docs) {
  for (const [re, why] of overclaims) {
    if (re.test(doc.text)) problems.push(`${doc.path}: GEO overclaim — ${why}`);
  }
}

// ---------------------------------------------------------------------------
// 5. Positive signals worth reporting (not gating).
// ---------------------------------------------------------------------------
const withSources = docs.filter((d) => d.html.includes('rel="noopener nofollow"'));
if (withSources.length) {
  notes.push(`${withSources.length} page(s) cite external sources`);
}
const withTables = docs.filter((d) => /<table[\s>]/.test(d.html));
if (withTables.length) {
  notes.push(`${withTables.length} page(s) use real tables (extractable evidence)`);
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`seo-check: ${docs.length} page(s)`);
for (const n of notes) console.log(`  note: ${n}`);

if (problems.length) {
  console.error(`\n${problems.length} SEO PROBLEM(S):`);
  for (const p of problems) console.error('  - ' + p);
  console.error('\nSee skills/seo-geo/SKILL.md. Fix the content; do not weaken this check.');
  process.exit(1);
}
console.log('seo-check: OK');
