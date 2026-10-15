---
name: seo-geo
description: "Use when writing, reviewing or auditing content for an export B2B site: SEO/GEO rules from Google's official guidance, with research evidence and explicit uncertainty bounds."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [seo, geo, content, export, b2b, google]
    category: research
    related_skills: [grounded-citations]
---

# SEO / GEO for export B2B sites

Two things are being mixed up in most advice about this topic, and mixing them
is how export sites end up publishing nonsense. Keep them separate:

- **Rules** — what Google says not to do. These are normative and actionable.
  Source: Google Search Central documentation. Follow them.
- **Research evidence** — what academic studies measured about generative-engine
  visibility. This is *evidence*, not a guarantee, and most of it is
  conditional. Cite it honestly or do not cite it.

## Rule 0 — the authority order

1. **Google Search Central** documentation = the rules. If Google says a tactic
   is unnecessary or violates a spam policy, that settles it.
2. **Peer-reviewed / survey research** = evidence about what has been measured,
   with conditions. It never overrides rule 1 and it never justifies a tactic
   Google calls spam.
3. **Third-party GEO advice, agencies, tools** = evaluate against
   [Google's guidance on evaluating third-party SEO advice][third-party]. No
   third-party tool has access to Google's internal ranking or AI systems.

When research and Google's rules appear to conflict, **Google's rules win**, and
the research is reported with its actual conditions.

## Rule 1 — there is no separate "GEO"

Google's official position: optimizing for generative AI features **is SEO**.
Their generative features are built on the same core ranking and quality
systems, using retrieval-augmented generation and query fan-out over the Search
index.

Consequence for your work: do not build a separate "AI strategy". Do the basics
well. Do not chase AEO/GEO "hacks".

## Rule 2 — tactics Google explicitly says you do NOT need

Each of these is named in the official guide as unnecessary for Google Search.
Adding them is wasted work at best; some are actively harmful.

| Tactic | Google's position |
|---|---|
| `llms.txt` and other AI-specific files | **Ignored** by Google Search. Neither helps nor harms. Fine to create for other systems, but do not claim a search benefit. |
| "Chunking" content into small pieces | No requirement. Google understands multi-topic pages and surfaces the relevant part. No ideal page length — write for the audience. |
| Rewriting content specifically for AI | Unnecessary. Systems handle synonyms and intent; you do not need every long-tail variation. |
| AI-specific schema.org markup | Not required, and there is none. Use structured data for rich-result eligibility as normal — not "for AI". |
| A separate page per query variation | Creating pages primarily to manipulate rankings or AI responses violates the **scaled content abuse** spam policy. |
| Seeking inauthentic "mentions" | Not useful. Ranking systems reward quality; spam systems block manipulation. |
| Buying "AI visibility" tools claiming Google internals | No third party has access to Google's internal metrics. |

## Rule 3 — what actually matters (official)

Straight from the guide, in priority order:

1. **Unique, non-commodity content.** First-hand, specific, expert. Commodity
   content ("7 Tips for…") restates common knowledge and adds nothing. This is
   the single highest-leverage item.
2. **Clear technical structure.** Indexable, crawlable, semantic HTML where
   practical, good page experience, reduced duplication.
3. **Images and video** where relevant, following image/video SEO basics.
4. **Structured data** as part of normal SEO — for rich results, not for AI.
5. **Business details** — Merchant Center, Google Business Profile where
   applicable.

## Rule 4 — measuring: only one official source

The **Generative AI performance report** in Search Console is the only official
measurement of generative-AI visibility (globally available since 2026-08-31).
Indexing and appearing are never guaranteed even when every requirement is met.

**This is why "SEO has data" is a separate completion state.** A new site has no
Search Console data for weeks. No data is the normal starting state, not a
failure and not a success. Never claim SEO results before data exists.

## Research evidence — and what it does NOT prove

Sources: Aggarwal et al., *GEO: Generative Engine Optimization*, KDD 2024
([arXiv:2311.09735](https://arxiv.org/abs/2311.09735),
[DOI 10.1145/3637528.3671900](https://doi.org/10.1145/3637528.3671900));
Martinez, *Optimizing Visibility in Generative Engines: A Critical Survey of
GEO (2023–2026)*, 2026-07-15 (45 studies).

### The "up to 40%" number — quote it correctly or not at all

The widely circulated "GEO boosts visibility up to 40%" figure comes from the
KDD paper. In that experiment **five documents were already placed in the
context**; the measured effect was on how much those already-retrieved documents
were used and cited. It is **not** evidence that a page will be discovered
organically, and **not** evidence of durable traffic or conversion effects.

Writing "GEO increases visibility by 40%" on a site or in a report is a
misreading. If you cite it, cite the condition.

### What the survey says holds up

| Lever | Support | Condition |
|---|---|---|
| Query–document relevance | Strong (controlled settings) | Well-defined intent; no fabrication |
| Position within retrieved context | Strong | Document already retrieved |
| Extractable evidence (verifiable figures, definitions, comparisons) | Moderate–strong | Truthful, attributed, intent-compatible |
| Recency, prices, dates | Moderate | Time-sensitive / commercial queries only |
| Document structure (headings, tables) | Moderate, heterogeneous | Effects differ per pipeline stage |
| Fluency / simplification | Weak–moderate | Domain- and engine-specific |
| Authoritative tone | **Weak and unstable** | Foundational paper found no significant gain |
| Keyword stuffing | **Negative / ineffective** | Underperformed baseline in the KDD results |

### The three cautions that matter most for real work

1. **Retrieval comes first.** A perfectly optimised page that is never retrieved
   contributes nothing. SAGEO Arena (171,003 documents, 2,700 queries) found
   body-only optimisation *reduced* top-20 presence by ~9%, post-reranking
   top-10 presence by ~16%, and final citation by ~6%. A rewrite can improve
   how a document is used while making it less retrievable.
2. **Generic heuristics transfer poorly.** C-SEO Bench (~1,900 queries, 16,360
   documents, 6 domains): only 3 of 54 method–domain combinations were
   significantly positive in the main experiment; **none** in question
   answering. Several transformations reduced rank. Gains also erode as
   adoption spreads.
3. **Never fabricate a statistic to be citable.** A fabricated number may
   increase reuse while degrading truthfulness. On an export site this also
   breaks the fact boundary — see the repo's `AGENTS.md` §2. **The fact rule
   outranks any visibility tactic.**

### Scope of the evidence — say this plainly

Within the reviewed corpus, the evidence is narrow: already-retrieved content
can causally affect how it is cited or used. **No reviewed technique shows a
stable, longitudinal, cross-platform causal effect on organic discoverability or
downstream behaviour.** Visibility is a distribution that varies by engine,
date, location and query formulation — a single measurement is not a stable
indicator.

## Applying this to an export site

Concrete, and in this order:

1. **Answer one real buyer question per URL.** Not one per keyword variation —
   that is the scaled-content pattern the spam policy targets.
2. **Make facts extractable and attributable.** Real spec tables, dated
   figures, named sources. This is the one research-backed lever that is also
   fully compatible with the fact rule.
3. **Do the technical basics.** Unique title/description/canonical, one H1,
   sitemap, robots, alt text, mobile. `scripts/verify.mjs` enforces these.
4. **Add nothing AI-specific.** No `llms.txt`, no AI schema, no chunking.
5. **Do not promise ranking outcomes** in content, to the client, or in a
   report.

## Hard rule for this repository

**The fact boundary outranks every optimisation on this page.** If a tactic
would require inventing a statistic, a certification, a customer or a
capability, the tactic is not available. A missing fact is rendered as absent.

## References

- [Optimizing your website for generative AI features on Google Search][guide]
  (Google Search Central, published 2026-05-15, updated 2026-07-10) — the
  official rules above.
- [A new resource for optimizing for generative AI in Search][announce]
  (2026-05-15).
- [Generative AI performance reports in Search Console][gsc-genai] (2026-06-03).
- [Guidance on evaluating third-party SEO advice][third-party].
- Aggarwal et al., *GEO: Generative Engine Optimization*, KDD 2024 —
  [arXiv:2311.09735](https://arxiv.org/abs/2311.09735).
- Martinez, *Optimizing Visibility in Generative Engines: A Critical Survey of
  GEO (2023–2026)*, 2026-07-15.

[guide]: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
[announce]: https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing
[gsc-genai]: https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
[third-party]: https://developers.google.com/search/docs/fundamentals/third-party-seo
