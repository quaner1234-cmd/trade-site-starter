# trade-site-starter

A public template repository for building a **low-cost, honest, SEO-ready
export website that can actually receive overseas inquiries** — without
writing code yourself.

You describe your business to an AI coding agent (Codex, Claude Code, Hermes,
Cursor, Copilot — anything that can read files and run commands). It reads your
material, asks only about what is genuinely missing, and builds the site.

- **Stack:** Astro 5 static output. No database, no backend, no CMS.
- **Hosting:** free — Cloudflare Workers static assets.
- **Inquiries:** free — Formspree (or plain email).
- **Cost:** a domain name, roughly $10–15/year. Nothing else required.

---

## The one-sentence start

Put this in Codex, Claude Code, or any agent with file + terminal access:

> Use the template at https://github.com/quaner1234-cmd/trade-site-starter to
> build me an English export website. My company material is in `./intake`.
> Read `AGENTS.md` first and follow it. Ask me only about facts you cannot
> find — and never invent anything about my company.

That is the whole onboarding. `AGENTS.md` tells the agent to read your material,
find the gaps, and ask you the minimum number of questions.

---

## What you need before starting

A folder (call it `intake/`) with whatever you already have:

- product catalogue or spec sheets (PDF, Excel, Word)
- real product photos
- your business licence or company registration
- old quotations or buyer emails, if you have them

You do **not** need a design brief, a sitemap, or technical knowledge.

---

## What the agent will ask you

Only what blocks publishing:

1. The English company name buyers should see.
2. The email address that should receive inquiries.
3. In one line, what you sell — using the words your buyers use.
4. Which country the company is registered in.
5. A free Formspree form endpoint (or confirm email-only).

It will **not** ask about colours, fonts, frameworks or whether to start.

---

## What the agent will never invent

These are the claims that get export websites into trouble, and they are all
blocked by a build check:

- years in business / "since 19xx"
- customer names, logos, testimonials
- certifications (ISO, SGS, BSCI, CE …) with no certificate in hand
- country counts, export volumes, factory area, capacity
- fixed MOQ, fixed lead time, price indications
- warehouses, overseas offices, "24/7", warranties

A missing fact is normal — the page renders without it. A made-up fact is not
acceptable, because it loses the buyer the moment they check.

---

## Local commands

```bash
npm install
npm run dev        # local preview at http://localhost:4321
npm run build      # build to dist/
npm run verify     # facts + technical SEO + links + inquiry path
npm run seo        # SEO/GEO rule check (skills/seo-geo/SKILL.md)
npm run check      # build + verify + seo
npm run intake     # report what material and facts are still missing
```

`npm run verify` is not decorative. It fails on:

- weak or duplicate titles/descriptions, missing canonical, wrong H1 count
- broken internal links, sitemap entries that don't resolve
- images without `alt`
- banned fabricated claims
- template placeholder text leaking into a published page
- **no working inquiry path** (neither email nor form endpoint)

`npm run seo` enforces the SEO/GEO rules from `skills/seo-geo/SKILL.md`:
it rejects `llms.txt`, deprecated FAQPage schema and other AI-specific markup
Google ignores; flags near-duplicate pages (the scaled-content pattern); flags
thin content; and flags GEO overclaims such as promising a visibility
percentage.

If either fires, the fix is to remove the claim or add the real fact — never to
relax the check. **A starter with no company information is *supposed* to fail
these gates.** That is the point: an empty template must not be publishable.

---

## Deploy (free)

Push to `main` and GitHub Actions deploys to Cloudflare Workers static assets.
Other branches get preview deployments.

**Before the first deploy, rename the Worker** in `wrangler.jsonc`. The
GitHub Actions workflow derives both production and `-preview` Worker names
from this single value; the default is rejected. Also set the Actions variable
`PUBLIC_SITE_URL` to your actual HTTPS origin (`*.workers.dev` works before
a domain purchase); `example.com` canonicals are blocked.

Full step-by-step setup — Cloudflare account, domain, DNS, Formspree, Google
Search Console — is in **[DEPLOY.md](DEPLOY.md)**. It names every step that
needs *your* hands and tells the agent when to stop and hand over.

---

## Repository layout

```
AGENTS.md                 instructions for the coding agent (read this first)
README.md                 this file
DEPLOY.md                 accounts, domain, DNS, GSC — step by step
FACTS_TO_CONFIRM.md       what is still unknown; never invent these
src/config/site.ts        identity + contact (empty = hidden, never guessed)
src/data/products.ts      product families with per-row evidence states
src/data/claims.ts        capability claims with evidence states
src/data/knowledge.ts     buyer-guides: one question, one URL, with sources
src/layouts/Base.astro    <head> SEO/OG/JSON-LD, header, footer
src/components/           InquiryForm, SpecTable, CtaBand
src/pages/                home, products, guides, about, contact
scripts/verify.mjs        fact + technical SEO + link gate (runs in CI)
scripts/seo-check.mjs     SEO/GEO rule gate (runs in CI)
scripts/intake.mjs        material + missing-facts report
skills/seo-geo/SKILL.md   SEO/GEO rules: Google official + research evidence
wrangler.jsonc            Cloudflare Workers static-asset config
```

---

## Worked example

`docs/example-northbay.md` walks through a complete build for a **fictional**
company (Northbay Marine Hardware, stainless steel marine hardware) — the
questions asked, the facts filled, the pages produced, and the checks run.

`docs/example-verdant.md` is a second run on a different fictional business
(dried botanicals), which documents the three real defects the gates caught, the
email-only inquiry path, and the production/preview isolation test.

No real customer data is used anywhere in this repository.

---

## SEO / GEO rules

`skills/seo-geo/SKILL.md` is the rule set the Agent must apply when writing or
reviewing any page, and `npm run seo` enforces its mechanical half in CI.

It keeps two things separate, because conflating them is how bad advice spreads:

- **Rules** from Google Search Central — what is unnecessary or violates policy.
  Google states there is no separate "GEO": optimizing for AI features *is* SEO.
  Explicitly unnecessary: `llms.txt`, chunking, AI-specific schema, a page per
  query variation (scaled content abuse), inauthentic mentions.
- **Research evidence** from the KDD 2024 GEO paper and the 2026 critical
  survey — reported with conditions. The famous "up to 40%" figure measured
  already-retrieved documents, **not** organic discovery; no reviewed technique
  shows a durable cross-platform effect on discoverability.

Full sources and scope limits are in the skill. **The fact boundary outranks
every optimisation**: no tactic justifies inventing a statistic.

---

## Four different things — do not confuse them

| State | What it actually means |
|---|---|
| **Built** | `npm run build` and `npm run verify` pass on your machine |
| **Deployed** | a public URL serves the site |
| **Inquiry received** | a real test inquiry landed in your inbox |
| **SEO has data** | Search Console shows impressions — this takes weeks |

A local build is not a live site. A live site is not proof that inquiries
arrive. Neither is proof that search traffic exists yet.

---

## Designed to stay open

No vendor, model or paid service is required anywhere in this template. Astro
is MIT-licensed; the form endpoint, host and DNS are all swappable; the agent
instructions are plain Markdown that any coding agent can read.

---

## Licence

[MIT](LICENSE).
