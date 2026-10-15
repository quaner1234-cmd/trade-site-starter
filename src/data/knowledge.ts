// ---------------------------------------------------------------------------
// Buyer questions the site answers. This is the SEO/GEO engine of the site.
//
// One article = ONE buyer question = one URL. Two articles must never answer
// the same question in different words (that is duplicate content and it
// dilutes both).
//
// SOURCE RULE: the answer must come from the business's own knowledge or from
// a public source the Agent actually fetched and recorded in `sources`. Never
// invent a standard number, a certificate name, a duty rate or a test result.
//
// EVIDENCE:
//   'practice'      — general industry practice; must read as practice, never
//                     as a claim about this company's scale or capability
//   'company'       — a fact about this company, confirmed by the user
//
// Writing a `practice` article about a topic the company does not supply is
// fine and useful. What is forbidden is letting it read as "we hold / we
// supply / we are certified for" that topic.
// ---------------------------------------------------------------------------

export type KnowledgeEvidence = 'practice' | 'company';

export interface KnowledgeArticle {
  slug: string;
  question: string; // the buyer's question, in their words — becomes the H1
  title: string; // <title>, keep under ~60 chars
  description: string; // meta description, ~150 chars
  evidence: KnowledgeEvidence;
  /** Sources actually consulted. Empty list = do not publish the article. */
  sources: { label: string; url: string }[];
  /** Body paragraphs. Plain prose; the Agent writes these. */
  body: string[];
  /** Short next-step block shown at the end of every article. */
  nextStep: string;
}

export const ARTICLES: KnowledgeArticle[] = [
  {
    slug: 'example-buyer-question',
    question: 'Example: how do I compare quotations for this product?',
    title: 'Example buyer question',
    description:
      'Placeholder. Replace with a real question your buyers ask, then delete this entry once real articles exist.',
    evidence: 'practice',
    sources: [],
    body: [
      'Placeholder paragraph. Replace with the real answer, grounded in sources you actually read.',
    ],
    nextStep: 'Send us the specification you are comparing and we will quote against it.',
  },
];

/** Articles without a recorded source are not published. */
export function publishableArticles(): KnowledgeArticle[] {
  return ARTICLES.filter((a) => a.sources.length > 0);
}
