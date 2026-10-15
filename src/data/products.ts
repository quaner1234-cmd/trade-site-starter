// ---------------------------------------------------------------------------
// Product catalogue.
//
// ONE product family = one entry. Each entry carries an evidence state so the
// site can be honest about what is confirmed and what is quoted per order.
//
// EVIDENCE STATES (the Agent must assign one per row — never leave a guess
// unlabelled):
//   'confirmed'    — the user gave the value (datasheet, label, contract)
//   'range'        — the value is a normal range the business can supply;
//                    exact figures are confirmed per inquiry
//   'unknown'      — no evidence; the row is omitted from the page entirely
//
// Hard rule: a row whose value is 'unknown' must NOT be rendered. Omitting a
// spec is always acceptable; inventing one never is.
// ---------------------------------------------------------------------------

export type Evidence = 'confirmed' | 'range' | 'unknown';

export interface Spec {
  label: string; // e.g. 'Material'
  value: string; // e.g. 'Stainless steel 304'
  evidence: Evidence;
}

export interface Product {
  slug: string; // URL segment
  name: string;
  summary: string; // one or two sentences a buyer can judge in 10 seconds
  specs: Spec[];
  applications: string[]; // only applications the user can evidence
  image?: string; // /images/... — real product photo only
  imageAlt?: string;
}

export const PRODUCTS: Product[] = [
  // Replace with the user's real families. Keep the first version small:
  // 2–4 families beat 20 thin ones.
  {
    slug: 'example-family',
    name: 'Example Product Family',
    summary:
      'Placeholder copy. Replace with a sentence naming the product and who buys it.',
    specs: [
      { label: 'Material', value: '', evidence: 'unknown' },
      { label: 'Size range', value: '', evidence: 'unknown' },
      { label: 'Packing', value: '', evidence: 'unknown' },
    ],
    applications: [],
  },
];

/** Specs that are safe to show: confirmed values and stated ranges only. */
export function visibleSpecs(product: Product): Spec[] {
  return product.specs.filter((s) => s.evidence !== 'unknown' && s.value.trim() !== '');
}
