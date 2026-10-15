---
# AGENTS.md — the operating manual for any coding Agent working in this repo
#
# Works with Codex, Claude Code, Hermes, Cursor, Copilot, Windsurf or any agent
# that can read files and run terminal commands. No vendor lock-in.
#
# The user is a non-programmer in export/foreign trade. They describe a business;
# you build a real, publishable, SEO-ready website from facts they actually have.
name: trade-site-starter
---

# AGENTS.md — how to build a site from this starter

## 0. What this repository is

A minimal Astro 5 static site for an export (foreign-trade) business: cheap to
run, honest about facts, ready for search, and able to receive overseas
inquiries. It deploys free to Cloudflare Workers static assets.

The user is **not a programmer**. Translate everything into plain language and
never ask them to make technical choices.

## 1. Read this first, in this order

1. `intake/` — material the user dropped in (catalogue, photos, emails, notes).
   If it does not exist, run `npm run intake` and ask for material.
2. `src/config/site.ts` — identity and contact. Empty = not confirmed.
3. `src/data/products.ts`, `src/data/claims.ts`, `src/data/knowledge.ts` —
   product families, capability claims, buyer guides.
4. `FACTS_TO_CONFIRM.md` — what is still missing.
5. **`skills/seo-geo/SKILL.md`** — the SEO/GEO rules to apply when writing or
   reviewing any page. Load it before writing content.

## 2. The one rule that matters most

> **Never invent a fact about the company.**

A missing fact is fine: the page renders without it. A made-up fact is not: it
loses the buyer at the first check and can become a false statement.

These must **never** appear without evidence from the user:

- years in business / founding year / "since …"
- customer names, logos, testimonials, case studies
- certifications or memberships (ISO, SGS, BSCI, CE, FDA …)
- country counts, export volumes, production capacity, factory area, line counts
- fixed MOQ, fixed lead time, price indications
- warehouses, overseas offices, "24/7", warranties, guarantees
- "leading manufacturer", "best price", "trusted by"

`scripts/verify.mjs` scans for these and **fails the build**. When it fires:
**remove the claim**. Never weaken the scan to make a build pass.

The founder's previous employer is not this company. Its customers, capacity,
certifications and photos are not this company's evidence.

## 3. Facts the site needs before it can publish

| Fact | Where | Blocking? |
|---|---|---|
| English company name | `SITE.name` | yes |
| Inquiry channel: contact email **or** Formspree endpoint | `SITE.email` / `SITE.rfqEndpoint` | yes — **either one is enough** |
| What you sell (buyer's own words) | `SITE.category` | yes — needed for real titles |
| Country | `SITE.country` | yes — About + Organization JSON-LD |
| Buyer types | `SITE.buyers` | no, but drives the copy |

**Email alone is sufficient.** `verify.mjs`, `intake.mjs` and
`hasInquiryChannel()` in `site.ts` share this one rule: an inquiry channel
exists when an email OR an endpoint is set. Email works via the form's `mailto:`
fallback. Formspree is recommended (it does not depend on the visitor's mail
client) but is **not** required — never tell the user it is mandatory.

**Ask only about blockers.** Do not ask about colours, fonts, layout, framework
or "shall I start?". Make a professional reversible choice yourself.

## 4. How to add content

### Products — `src/data/products.ts`
One entry per product family. Every spec row carries an evidence state:

- `confirmed` — the user gave the value (label, datasheet, contract)
- `range` — a normal range the business can supply; rendered with "confirmed
  per inquiry"
- `unknown` — **not rendered at all**

Keep the first version to 2–4 families. Twenty thin ones are worse.

### Claims — `src/data/claims.ts`
Same states, plus `practice` (industry knowledge — must read as practice, never
as a claim about this company).

### Guides — `src/data/knowledge.ts`
One article = **one buyer question = one URL**. Two articles must never answer
the same question in different words.

An article **without a recorded source is not published**
(`publishableArticles()` filters it out). Fetch the source, read it, record the
URL. Never invent a standard number, duty rate, certificate name or test result.

Covering a topic the company does not supply is fine and useful. What is
forbidden is letting it read as "we hold" or "we supply" it.

**Search coverage ≠ company claim.** This distinction is the whole SEO game
here: write about what buyers search, claim only what you can prove.

## 5. Images

Real product photography only. No stock photos, no AI-generated "factory"
photos passed off as evidence, no competitor images.

Every `<img>` needs an `alt`. `scripts/verify.mjs` enforces it.

## 6. SEO / GEO — apply `skills/seo-geo/SKILL.md`

Load that skill before writing or reviewing content. Its two parts are not the
same thing and must not be blended:

- **Rules (Google Search Central) — follow these.** There is no separate "GEO";
  optimizing for AI features *is* SEO. Do NOT add `llms.txt`, AI-specific
  schema, "chunking", a page per query variation (that is scaled content abuse),
  or inauthentic mentions. Google ignores or penalises these.
- **Research evidence (KDD 2024 GEO paper, 2026 critical survey) — cite with
  conditions.** The "up to 40%" figure measured documents that were *already
  retrieved*; it is not proof of organic discovery, and no reviewed technique
  shows a durable cross-platform effect on discoverability or traffic.

**The fact boundary outranks every optimisation.** If a tactic would require a
fabricated statistic, certification, customer or capability, the tactic is not
available here.

## 7. Definition of done (for any change)

1. `npm run build` succeeds.
2. `npm run verify` passes with **zero** problems.
3. `npm run seo` passes — the SEO/GEO rule check.
4. Checked at 375px and 1280px — no overflow.
5. `/contact/` reachable from every page in one click.
6. No new unevidenced claim; `FACTS_TO_CONFIRM.md` updated if new input is
   needed.

All three checks (`build`, `verify`, `seo`) also run in CI and gate the deploy.

## 8. Deploy

`main` → production Worker; every other branch and PR → a **separate**
`-preview` Worker, so a preview can never overwrite production.

Rename the Worker before the first deploy: `wrangler.jsonc` `name` becomes
`https://<name>.<subdomain>.workers.dev`, and a stale default can overwrite an
existing Worker with the same name in the account.

A fresh Worker can 404 for ~20–30 seconds after a successful deploy while the
edge propagates. Re-check before concluding an asset is missing.

Full setup — Cloudflare account, domain, DNS, Formspree, Google Search Console —
is in `DEPLOY.md`.

## 9. What "done" does NOT mean

Keep these four states separate in every report. They are not the same thing:

| State | Means |
|---|---|
| **Built** | `npm run build` + `npm run verify` + `npm run seo` pass locally |
| **Deployed** | A public URL serves the site |
| **Inquiry received** | A real test inquiry arrived in the inbox |
| **SEO has data** | Search Console has collected impressions/clicks |

Never report "the site is live and working" from a local build. Never report
"SEO is working" before Search Console has data (typically weeks) — and never
promise a ranking outcome.

## 10. Hard stops — stop and ask the user

- **Buying a domain** — costs money, needs their decision.
- **Production publish under a real domain** — needs their go-ahead.
- **Any credential** — never commit tokens, API keys or secrets.
- **External accounts** (Cloudflare, Formspree, Google) — if you lack
  permission, say exactly which step you cannot do and hand it to the user with
  the precise instruction. Do not guess or fabricate a result.

## 11. Style of the site

Clean, technical, industrial, restrained. One border treatment, one accent
(`#1b365d`), no shadows, no gradients, no decorative rules. Product photography
carries the page.

Not a SaaS landing page. Not an Alibaba template. No "Quality First, Best
Service, Competitive Price".

A buyer should be able to answer, in 30–90 seconds: *is this what I buy, is it
for someone like me, and what do I do next?*
