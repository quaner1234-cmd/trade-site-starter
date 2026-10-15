// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// PUBLIC_SITE_URL overrides the canonical domain for preview/staging builds.
// Set it in CI so preview deployments never get indexed as duplicates of
// production (their canonical still points at the production domain).
const site = process.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'https://example.com';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
});
