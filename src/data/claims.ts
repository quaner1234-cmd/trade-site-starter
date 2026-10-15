// ---------------------------------------------------------------------------
// Claims about the company. Every claim carries an evidence state; the UI
// renders only what the state allows.
//
// WHY THIS FILE EXISTS: the most common failure of an export website is a
// sentence nobody can back — "10 years experience", "ISO certified", "exported
// to 30 countries". Each of those either loses the buyer when they check, or
// quietly becomes a false statement. A claim with no evidence is deleted from
// this file, not softened with a hedge.
//
// STATES:
//   'confirmed'  — the user provided evidence (licence, audit, contract, photo)
//   'capability' — the business can do this; exact terms confirmed per order
//   'practice'   — industry practice, must never read as a company claim
//   'unknown'    — not rendered
// ---------------------------------------------------------------------------

export type ClaimState = 'confirmed' | 'capability' | 'practice' | 'unknown';

export interface Claim {
  id: string;
  statement: string;
  state: ClaimState;
  /** Where the evidence lives (file name, certificate number, email date). */
  evidence?: string;
}

export const CLAIMS: Claim[] = [
  // Example of a safe capability claim. Delete or replace.
  {
    id: 'samples',
    statement: 'Samples can be arranged for evaluation before a bulk order.',
    state: 'capability',
  },
];

/**
 * Claims safe to publish. `unknown` is dropped. `practice` is allowed but the
 * component that renders it must phrase it as practice.
 */
export function publicClaims(): Claim[] {
  return CLAIMS.filter((c) => c.state !== 'unknown' && c.statement.trim() !== '');
}

// ---------------------------------------------------------------------------
// NEVER ADD TO THIS FILE without evidence:
//   - founding year / "N years of experience"
//   - customer names, logos, testimonials, case studies
//   - certification or membership names (ISO, SGS, BSCI, ...)
//   - country counts, export volumes, production capacity
//   - fixed MOQ, fixed lead time, price indications
//   - warehouses, overseas offices, "24/7"
//   - warranties and guarantees
// The banned-claim scan in scripts/verify.mjs fails the build if these leak in.
// Do not weaken the scan to make a build pass — remove the claim.
// ---------------------------------------------------------------------------
