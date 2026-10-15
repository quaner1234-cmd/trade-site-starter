# Worked example — Northbay Marine Hardware (fictional)

A complete run from empty template to deployed site, using a **fictional**
company. No real customer, supplier or project data appears anywhere in this
repository.

This is the reference for what a real run looks like, including what the agent
asks and what it refuses to write.

---

## 1. The one-sentence start

> Use the template at `trade-site-starter` to build me an English export
> website. My company material is in `./intake`. Read `AGENTS.md` first and
> follow it. Ask me only about facts you cannot find — and never invent
> anything about my company.

## 2. What was in `intake/`

A single markdown brief (`intake/company-brief.md`) containing: registered
name, city, product families, a few confirmed spec values from a 2026
datasheet, buyer types, what the owner can do (samples, packing, private
label), and — importantly — an explicit list of what must **not** be claimed.

That last section is what makes the run safe. The brief said: *no certificate
held, no customer names, no capacity figures, no published MOQ or lead time,
no test data.*

## 3. What the agent asked

Running `npm run intake` first reported 5 blocking gaps. All five were
answerable from the brief, so **no question was actually needed**. Where a real
user has not supplied something, the agent asks only that — never about colours,
fonts or layout.

## 4. What the agent filled in

| File | What went in |
|---|---|
| `src/config/site.ts` | name, legal name, Ningbo/CN, email, category `316 stainless steel marine hardware`, three buyer types |
| `src/data/products.ts` | 3 families; 12 spec rows, all `confirmed` or `range` |
| `src/data/claims.ts` | 4 capability claims, each with an evidence pointer |
| `src/data/knowledge.ts` | 1 buyer-question article with 2 fetched sources |

### The fact boundary, applied

- **Breaking load** was left as `unknown` in two product families, because the
  owner has not tested it. It is **not rendered**. Verified: the phrase
  "breaking load" appears nowhere in the built output.
- **Rope diameter 6–16 mm** was marked `range`, so it renders with
  "confirmed per inquiry" rather than as a fixed value.
- **Markets** was left empty. The owner mentioned buyer regions, but mentioning
  regions is not evidence for "we export to N countries", so the site makes no
  geographic claim.
- **No certificate**: the brief says none is held. The site says testing *can be
  arranged* — a capability — and never names ISO, SGS, CE or GOTS.
- **`practice` article**: the 316-vs-304 guide covers industry metallurgy with
  two real sources. It explicitly states it is general practice, not a claim
  about this company.

## 5. Checks run

```
npm run build
→ 9 pages built

PUBLIC_SITE_URL=https://northbayhardware.example npm run verify
→ Checked 9 pages, 69 internal links, 9 canonicals, 9 unique titles.
→ verify: OK
```

Independent greps over `dist/`:

| Check | Result |
|---|---|
| "breaking load" present anywhere | **absent** ✓ |
| banned claims (years/ISO/trusted by/certified/guarantee/warranty/24/7) | **absent** ✓ |
| one H1 per page | ✓ all 9 |
| `<img>` without `alt` | 0 ✓ |
| unique titles | 9/9 ✓ |

## 6. Deploy

Renamed the Worker in `wrangler.jsonc` to `tss-example-northbay`, then:

```
npx wrangler deploy
→ https://tss-example-northbay.quaner1234.workers.dev
```

All 12 URLs returned **200** live on the free tier:

`/` · `/products/` · 3 product pages · `/guides/` · 1 guide · `/about/` ·
`/contact/` · `/robots.txt` · `/sitemap-index.xml` · `/sitemap-0.xml`

Live HTML re-checked for banned claims: clean.

## 7. What this example does NOT prove

Being precise about the four states from `AGENTS.md`:

| State | Status here |
|---|---|
| **Built** | ✅ PASS — build + verify pass |
| **Deployed** | ✅ PASS — 12 URLs returned 200 on the free tier |
| **Inquiry received** | ❌ **NOT verified** — no Formspree endpoint was created for a fictional company, so no live inquiry was ever sent or received. This is the single most important thing a real user must test themselves. |
| **SEO has data** | ❌ **NOT verified** — impossible to verify for a fictional domain that was deleted. Search Console needs a real verified domain and weeks of data. |

The deploy was on a temporary `*.workers.dev` URL and was **deleted** after the
test. No domain was bought.

## 8. Two defects the run exposed (and fixed in the template)

1. **Duplicate company name in `<title>`** — product pages rendered
   `Bow & Stern Eyes | Northbay | Northbay`. Fixed in `Base.astro`: the name is
   appended only when the page title does not already contain it.
2. **Path double-slash in verify** — `rel()` produced `//about/index.html`, so
   `/contact/` was reported missing when it existed. Fixed.

Both are the kind of thing that only shows up when you actually run the thing.
