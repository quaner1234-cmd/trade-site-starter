# Worked example 2 — Verdant Hollow Botanicals (fictional)

Dried botanicals and herbal ingredients for tea, cosmetic and food
manufacturers. A **different** business from example 1, run against a fresh
clone after the round-2 hardening.

Purpose of this run: verify the new gates actually fire on real mistakes, and
test the corrected inquiry rule and the preview/production isolation.

No real customer, supplier or project data appears anywhere in this repository.

---

## 1. What was in `intake/`

One brief: registered name, city, 3 product families with confirmed spec values
(moisture limits, cut size, shelf life, packing), buyer types, owner-confirmed
capabilities — and a must-not-claim list specifying **no organic
certification**, no customer names, no tonnage or farm area, no published MOQ or
lead time, and no implication of third-party laboratory testing.

## 2. What the gates caught — all genuine

This run is useful precisely because the first pass **failed**. Three real
defects, found by three different checks:

| Check | Finding | Root cause |
|---|---|---|
| `verify` | `LEAKED TEMPLATE TEXT "your company"` on `/` | The fill of `SITE.category` was a **silent no-op** (the source comment text had changed), so the home page fell back to template copy |
| `verify` | `BANNED CLAIM "accredited"` in the guide | Legitimate usage ("accredited laboratory results"), but the substring scan is blunt — reworded to "an independent laboratory" |
| `seo` | `NEAR-DUPLICATE (76% shared vocabulary)` between two product pages | Real content defect: two families shared too much boilerplate vocabulary |

None were suppressed. The category was actually filled, the wording was actually
changed, and the two product pages were genuinely differentiated (distinct
summaries, distinct application lists).

**The first one is the most instructive**: a silent string-replacement no-op is
exactly the kind of bug that ships as template text on a live commercial
homepage. The gate caught it because the template's fallback copy is on the
leak list.

## 3. The inquiry-rule fix, verified live

`SITE.rfqEndpoint` was deliberately left **empty**; only `SITE.email` was set —
the exact case that was previously inconsistent between `verify.mjs`,
`intake.mjs` and `site.ts`.

Result: `verify` **passes** and prints the tradeoff instead of failing:

```
note: inquiry channel is email-only (mailto fallback).
      A Formspree endpoint is more reliable — see DEPLOY.md §6.
verify: OK
```

Live `/contact/` confirms it: `data-email` set, `data-endpoint` absent,
`mailto:` fallback present, form rendered.

## 4. Final checks

```
npm run build   → 9 pages
npm run verify  → verify: OK  (email-only channel: noted, not failed)
npm run seo     → seo-check: OK
                → note: 1 page cites external sources
                → note: 3 pages use real tables (extractable evidence)
```

Independent scan of the **live** HTML — terms checked and **absent**: organic,
EU organic, USDA, GMP, HACCP, FSSC, ISO 9001, ISO certified, customer name,
tonnage, farm area, MOQ, guarantee, warranty, accredited.

Unverified spec rows (`Pesticide residue`, `Other cut sizes`) appear **0 times**
in the built output — dropped, not guessed.

"lead time" does appear. Inspected in context: it is the honest disclaimer
("published figures would be guesses, so we do not publish them"), not a claim.
A substring scan alone cannot tell those apart; a human reading can.

## 5. Deploy and the isolation test

Renamed the Worker to `tss-v2-verdant`, then deployed **the same build twice**,
exactly as CI would:

| Worker | Role | Observed result |
|---|---|---|
| `tss-v2-verdant` | production | 11 routes → 200; served its own title |
| `tss-v2-verdant-preview` | preview | 200 on its own hostname, separate from production |

The production Worker kept serving its existing content while the preview Worker
came up independently — **isolation confirmed by observation**, not by reading
the workflow file.

Both test Workers were deleted afterwards; the account was left exactly as found.

## 6. Defect this run exposed in the platform

**A fresh Worker can return 404 for ~20–30 seconds after a successful deploy.**
Immediately after upload, `/products/dried-flower-heads/`, `/about/`,
`/contact/` and `/sitemap-index.xml` all returned 404 while `/` and `/products/`
returned 200. Roughly 25 seconds later every path returned 200 with **no
redeploy**.

This is edge propagation, not a missing asset — and it looks alarming if you
check the instant the deploy finishes. Documented in `DEPLOY.md`.

## 7. What this run does NOT prove

| State | Status |
|---|---|
| **Built** | ✅ build + verify + seo all pass |
| **Deployed** | ✅ 11 URLs returned 200 on the free tier |
| **Inquiry received** | ❌ **NOT verified** — no real Formspree form and no real mailbox existed for a fictional company. No live inquiry was ever sent or received. **This is the one thing a real user must test themselves**, and it is the most important. |
| **SEO has data** | ❌ **NOT verified** — impossible for a fictional, deleted domain. A new site has no Search Console data for weeks; no data is the normal starting state, not a failure and not a success. |

No domain was bought. No ranking outcome is claimed or implied.
