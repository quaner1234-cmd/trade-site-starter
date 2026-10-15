# FACTS TO CONFIRM

Everything here is **unknown until the owner provides it**. The site is built to
render correctly with every one of these empty — a missing fact hides, it is
never filled with a plausible guess.

Only list items that block publishing or affect credibility. Do not turn this
into a 40-question survey.

| # | Item | Status | Where it plugs in |
|---|------|--------|-------------------|
| 1 | English company name buyers see | ❓ **Blocking** | `SITE.name` → every page, Organization JSON-LD |
| 2 | Public inquiry email | ❓ **Blocking** | `SITE.email` → footer, contact, mailto fallback |
| 3 | What you sell, in the buyer's words | ❓ **Blocking** | `SITE.category` → H1, titles, descriptions |
| 4 | Country of registration | ❓ **Blocking** | `SITE.country` → About, JSON-LD |
| 5 | Form endpoint (Formspree free plan) | ❓ **Blocking** unless #2 works | `SITE.rfqEndpoint` |
| 6 | Buyer types you sell to | ❓ Recommended | `SITE.buyers` → home, about copy |
| 7 | Registered legal name | ❓ Optional | `SITE.legalName` → About |
| 8 | City / address | ❓ Optional | `SITE.city`, `SITE.address` → About, footer |
| 9 | Phone / WhatsApp | ❓ Optional — publish only with consent | `SITE.phone` |
| 10 | Reply-time commitment | ❓ Optional — **only if you will honour it** | `SITE.responseCommitment` |
| 11 | Product families + real specs | ❓ **Blocking** for a real site | `src/data/products.ts` |
| 12 | Real product photos | ❓ Recommended | `public/images/` |
| 13 | Domain name | ❓ **Blocking for launch** — costs money | `astro.config.mjs`, `wrangler.jsonc` |

## Explicit non-claims

The site must never contain, without evidence in hand:

- founding year, "N years of experience", "since …"
- customer names, logos, testimonials, case studies
- certification or membership names (ISO, SGS, BSCI, CE, FDA …)
- country counts, export volumes, capacity, factory area, line counts
- fixed MOQ, fixed lead time, price indications
- warehouses, overseas offices, "24/7", warranties, guarantees
- "leading manufacturer", "best price", "trusted by"

`scripts/verify.mjs` fails the build on these. **Remove the claim; do not
weaken the check.**

## Evidence taxonomy

Use one of these for every product spec row and every claim:

1. **Confirmed** — the owner provided evidence (datasheet, label, contract,
   licence, photo). Published as fact.
2. **Range** — a normal range the business can supply. Published with
   "confirmed per inquiry"; exact values are never published as fixed.
3. **Practice** — general industry knowledge. Allowed in guides, but must read
   as practice, never as "we hold / we supply / we are certified for".
4. **Unknown** — not rendered at all.

## Note on previous employers

If the founder previously worked elsewhere: that company's customers, capacity,
certifications, export history and project photos are **not** this company's
evidence. They do not transfer.
