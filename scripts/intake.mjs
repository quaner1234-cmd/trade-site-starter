#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Intake helper. Run it FIRST, before writing any page.
//
// It scans ./intake (where the user drops company material — catalogue PDFs,
// product photos, emails, spreadsheets, notes) and reports:
//   1. what material exists,
//   2. which required facts are still missing from src/config/site.ts,
//   3. the smallest set of questions worth asking the user.
//
// It never invents a fact. It tells you what to ask.
//
// Usage: node scripts/intake.mjs [path/to/material]
// ---------------------------------------------------------------------------

import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2] || join(root, 'intake');

console.log('trade-site-starter — intake\n');

// --- 1. Material found -------------------------------------------------------
if (!existsSync(dir)) {
  console.log(`No material folder at ${dir}.`);
  console.log('Create it and drop in whatever you have: catalogue, product photos,');
  console.log('business licence, old quotations, emails from buyers, spec sheets.\n');
} else {
  const files = [];
  (function walk(d) {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else files.push(p);
    }
  })(dir);

  const kinds = {
    image: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic'],
    doc: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'],
    text: ['.txt', '.md', '.eml', '.html'],
  };
  const count = (exts) => files.filter((f) => exts.includes(extname(f).toLowerCase()));

  console.log(`Material in ${dir}:`);
  console.log(`  ${count(kinds.image).length} image(s) — real product photos are evidence`);
  console.log(`  ${count(kinds.doc).length} document(s)`);
  console.log(`  ${count(kinds.text).length} text file(s)`);
  if (files.length) {
    console.log('\n  Files:');
    for (const f of files.slice(0, 30)) console.log(`    - ${f.slice(dir.length + 1)}`);
    if (files.length > 30) console.log(`    … and ${files.length - 30} more`);
  }
  console.log();
}

// --- 2. Facts still missing --------------------------------------------------
const sitePath = join(root, 'src', 'config', 'site.ts');
const site = existsSync(sitePath) ? readFileSync(sitePath, 'utf8') : '';
const filled = (key) => {
  const m = site.match(new RegExp(`^\\s*${key}:\\s*'([^']*)'`, 'm'));
  return m ? m[1].trim() : '';
};
const listFilled = (key) => {
  const m = site.match(new RegExp(`^\\s*${key}:\\s*\\[([^\\]]*)\\]`, 'm'));
  return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
};

const required = [
  ['name', 'English company name buyers will see'],
  ['email', 'public inbox for inquiries'],
  ['category', 'what you sell, in the buyer’s own words'],
  ['country', 'ISO country code, e.g. CN'],
  ['rfqEndpoint', 'Formspree endpoint (https://formspree.io)'],
];
const optional = [
  ['legalName', 'registered legal name'],
  ['city', 'city'],
  ['address', 'street address (one line)'],
  ['phone', 'phone / WhatsApp number'],
  ['responseCommitment', 'reply time you will actually honour'],
];

console.log('Required facts (site cannot publish without these):');
let blockers = 0;
for (const [key, label] of required) {
  const ok = Boolean(filled(key));
  if (!ok) blockers++;
  console.log(`  ${ok ? '[x]' : '[ ]'} ${key.padEnd(14)} ${label}`);
}

console.log('\nOptional (hidden when empty — the site still works):');
for (const [key, label] of optional) {
  console.log(`  ${filled(key) ? '[x]' : '[ ]'} ${key.padEnd(20)} ${label}`);
}

console.log(`\nBuyer types configured: ${listFilled('buyers').join(', ') || '(none)'}`);
console.log(`Markets configured:     ${listFilled('markets').join(', ') || '(none — safe default)'}`);

// --- 3. What to ask ----------------------------------------------------------
console.log('\nAsk the user only about what blocks publishing:');
const questions = [];
if (!filled('name')) questions.push('What is the English company name buyers should see?');
if (!filled('email'))
  questions.push('Which email address should receive inquiries? (must be one you actually read)');
if (!filled('category'))
  questions.push('In one line, what do you sell — using the words your buyers use?');
if (!filled('country')) questions.push('Which country is the company registered in?');
if (!filled('rfqEndpoint'))
  questions.push(
    'Create a free Formspree form and give me its endpoint URL — or confirm I should use email-only for now.',
  );
if (!listFilled('buyers').length)
  questions.push('Who buys from you — distributors, contractors, brand owners, factories?');

if (questions.length === 0) {
  console.log('  Nothing blocking. Run `npm run check`.');
} else {
  questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
}

console.log('\nDo NOT ask about: colours, fonts, framework, "shall I start?".');
console.log('Do NOT invent: years in business, certifications, customer names, MOQ,');
console.log('lead times, prices, capacity, export volumes. Leave them out and put');
console.log('them in FACTS_TO_CONFIRM.md instead.\n');

process.exit(blockers > 0 ? 1 : 0);
