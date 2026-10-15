// ---------------------------------------------------------------------------
// Single source of truth for identity and contact facts.
//
// RULE: empty string / empty array = "not confirmed yet". Every component that
// reads this MUST hide silently when a value is empty. Never render "TBD",
// "TO_CONFIRM", "placeholder" or a guessed value into HTML.
//
// The Agent fills this file from the user's own material (business licence,
// catalogue, emails, photos, notes). Anything the user has not actually
// provided stays empty and is listed in FACTS_TO_CONFIRM.md.
// ---------------------------------------------------------------------------

// Canonical origin. PUBLIC_SITE_URL overrides it so preview builds keep
// pointing at production and are never indexed as duplicates.
const url = import.meta.env.PUBLIC_SITE_URL || 'https://example.com';

export const SITE = {
  // --- identity: the site cannot publish without these ----------------------
  name: '', // English company name as a buyer should see it
  legalName: '', // registered legal name, if it differs
  url,
  email: '', // public inbox displayed on the site
  country: '', // ISO code, e.g. 'CN'
  city: '',
  address: '', // one line is enough

  // --- positioning: drives the home page, titles and descriptions -----------
  category: '', // what you sell, in the buyer's words, e.g. 'stainless steel wire mesh'
  buyers: [] as string[], // who buys it, e.g. ['distributors', 'contractors']
  // Only fill `markets` if the user can back the claim. Empty = the site makes
  // no geographic claim at all, which is always safe.
  markets: [] as string[],

  // --- inquiry channel ------------------------------------------------------
  // Formspree free plan: create a form at https://formspree.io, paste its
  // endpoint below. If both rfqEndpoint and email are empty, `npm run verify`
  // FAILS on purpose — a published site with no working inquiry path is worse
  // than no site.
  rfqEndpoint: '',
  // Optional second channel shown next to the form.
  altContactLabel: '', // e.g. 'WhatsApp'
  altContactHref: '', // e.g. 'https://wa.me/...' — only with the user's consent

  // --- optional, hidden when empty ------------------------------------------
  phone: '',
  // Only state a response time the team will actually honour.
  responseCommitment: '',
  tagline: '',
} as const;

/**
 * True when the minimum facts needed to publish are present.
 *
 * An inquiry channel exists when a contact email OR a form endpoint is set —
 * email alone is sufficient, because the form falls back to mailto:. This rule
 * is shared by scripts/verify.mjs and scripts/intake.mjs; changing it here
 * without changing them produces contradictory advice.
 */
export function publishReady(): boolean {
  return Boolean(SITE.name && SITE.email);
}

/** True when at least one inquiry channel is configured. */
export function hasInquiryChannel(): boolean {
  return Boolean(SITE.email || SITE.rfqEndpoint);
}

export type SiteConfig = typeof SITE;
