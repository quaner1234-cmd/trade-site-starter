# DEPLOY — free Cloudflare Workers static hosting

Everything here runs on free tiers. The only thing that costs money is the
domain (~$10–15/year), and buying it needs your explicit decision.

Some steps **cannot** be done by an agent — they need your hands on your own
accounts. Those are marked **🧑 YOU** and the agent must stop and hand them
over rather than guess.

---

## Verified working path

Tested 2026-10-15 with wrangler 4.151.0, Astro 5.18 static output, free plan:

```bash
npm run build
npx wrangler deploy          # reads wrangler.jsonc, uploads dist/
```

That produces `https://<worker-name>.<your-subdomain>.workers.dev`.

### Three real pitfalls found in testing

1. **Rename the Worker first.** `wrangler.jsonc` `name` becomes the deploy
   target. If that name already exists in your account, you will overwrite it.
   Change `name` to something unique before the first deploy.
2. **Do not run wrangler from a scratch/temp directory on Windows.** It can fail
   with `A permission error occurred while accessing the file system` on
   `C:\Users\<you>\Application Data`. Run it from a normal project directory
   (e.g. `D:\Projects\...`). Same applies to `npm install` there.
3. **A fresh deploy can 404 for ~20–30 seconds.** Paths that exist in `dist/`
   may return 404 immediately after the upload completes, then resolve. This is
   edge propagation, not a missing asset — re-check before debugging. New
   Workers on a fresh account were affected; already-served Workers were not.

### Production and previews are separate Workers

`main` deploys to `wrangler.jsonc`'s `name`; other branches and PRs deploy to
`<name>-preview`. Both are derived from a single config field; the default
starter name is rejected. **Verified by deploying the same build to both**: the
preview Worker came up on its own hostname while the production Worker kept
serving its existing content unchanged.

This matters because a Worker has exactly one live version. Deploying a preview
branch into the production Worker would replace the live site — keeping two
Workers makes that impossible rather than merely unlikely.

---

## 1. GitHub repository — 🧑 YOU (one click)

Push this repo to your own GitHub account. Using the template's "Use this
template" button keeps your copy independent of the original.

---

## 2. Cloudflare account + API token — 🧑 YOU

1. Create a free account at <https://dash.cloudflare.com>.
2. **Account ID**: dashboard → right sidebar, copy it.
3. **API token**: My Profile → API Tokens → Create Token → use the
   **"Edit Cloudflare Workers"** template (or a custom token with
   *Account → Workers Scripts → Edit*).
   - Scope it to the one account. No expiry you cannot remember.

⚠️ The token is shown **once**. Never paste it into a file, a commit, a chat, or
a screenshot. If a coding agent asks you for it, put it in GitHub Actions
secrets yourself (step 3) — do not send it to the agent.

---

## 3. GitHub Actions secrets — 🧑 YOU

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | the token from step 2 |
| `CLOUDFLARE_ACCOUNT_ID` | the account ID from step 2 |

Add an Actions **repository variable**, `PUBLIC_SITE_URL`, containing the real
HTTPS origin (`https://my-worker.my-subdomain.workers.dev` is fine before
purchasing a domain). Do not leave this unset or use `example.com` — the SEO
verification rejects placeholder canonicals.

After this, **every configured push to `main` deploys to production**; other
branches and same-repository PRs get a preview Worker. An empty starter skips
the pipeline by design. The workflow runs `npm ci` → `npm run build` →
`npm run verify` → `wrangler deploy`, so a commit that breaks a link, a
canonical or the sitemap **cannot reach production**.

---

## 4. Free `*.workers.dev` URL — automatic

Your first deploy gives you `https://<worker-name>.<subdomain>.workers.dev`.
This works as a real public site with no domain purchase. Use it to test
everything end-to-end before spending money on a domain.

---

## 5. Custom domain — 🧑 YOU, and it costs money

**The agent must not buy a domain. Stop and ask first.**

1. Buy a domain. Cloudflare Registrar sells at cost with no markup; any
   registrar works.
2. Cloudflare dashboard → Workers & Pages → your Worker → Settings →
   Domains & Routes → Add → Custom Domain.
3. Cloudflare creates the DNS record and the certificate automatically when the
   domain is on Cloudflare DNS. If your DNS is elsewhere, add the CNAME it
   shows you.
4. Set the canonical origin so sitemap and canonical tags use the real domain:
   - locally: `PUBLIC_SITE_URL=https://yourdomain.com npm run build`
   - CI: change the repository Actions variable `PUBLIC_SITE_URL` and redeploy.
   - Do not change the placeholder fallback to bypass verification.

---

## 6. Inquiry channel — 🧑 YOU (needs your email)

The site has no backend. Inquiry delivery uses the free Formspree plan.

1. <https://formspree.io> → sign up → New form → give it a name.
2. Copy the endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Put it in `src/config/site.ts`:
   ```ts
   rfqEndpoint: 'https://formspree.io/f/abcdwxyz',
   ```
4. Rebuild and redeploy.

**Free plan limits:** a monthly submission cap (currently 50/month) and the
form's action URL is rate-limited — fine for a real export site's early
traffic. Upgrade only when you outgrow it.

**Then test it for real:** open the live site, submit a test inquiry, and
confirm it arrives in the inbox tied to your Formspree account. A form that
builds is not a form that delivers.

Alternatives if you outgrow Formspree: Cloudflare Workers + Email Routing
(your own Worker receives and forwards), or any paid form service.

---

## 7. Company email on your domain — optional, free

Cloudflare Email Routing: dashboard → your domain → Email → Email Routing →
Enable. Create `sales@yourdomain.com` → forwards to your Gmail. Free.

After enabling, **add the SPF TXT record** Cloudflare shows you — forwarding
works without it, but without SPF your replies are far more likely to land in
the buyer's spam folder.

---

## 8. Google Search Console — 🧑 YOU (needs your Google login)

1. <https://search.google.com/search-console> → Add property → **Domain**
   (enter `yourdomain.com`).
2. Verify with the DNS TXT record it gives you (Cloudflare dashboard → DNS →
   add TXT). Domain properties cover all subdomains and are the most durable
   choice.
3. Sitemaps → submit `sitemap-index.xml`.
4. **Wait.** Search Console shows no data for days to weeks. No data is not a
   failure — it is the normal state of a new site. Do not conclude "SEO is
   working" or "SEO is not working" before data exists.

---

## 9. Launch checklist

- [ ] `npm run build` + `npm run verify` pass with zero problems
- [ ] Worker renamed in `wrangler.jsonc`
- [ ] `SITE.name`, `SITE.category`, `SITE.country` filled
- [ ] `SITE.email` **or** `SITE.rfqEndpoint` configured
- [ ] `PUBLIC_SITE_URL` set to the real HTTPS origin (not `example.com`)
- [ ] **Test inquiry submitted through the LIVE site and received**
- [ ] Site checked on a phone (375px) and desktop
- [ ] Custom domain resolves over HTTPS
- [ ] `/robots.txt` and `/sitemap-index.xml` reachable
- [ ] Search Console property verified, sitemap submitted

---

## Manual deploy (fallback)

```bash
PUBLIC_SITE_URL=https://my-worker.my-subdomain.workers.dev npm run build
PUBLIC_SITE_URL=https://my-worker.my-subdomain.workers.dev npm run verify
npm run seo
node scripts/worker-name.mjs # confirms Worker was renamed
npx wrangler login          # opens a browser, once
npx wrangler deploy
```

Local `wrangler login` produces an OAuth token with **no DNS permissions** —
DNS changes stay a dashboard operation.

---

## Costs

| Item | Cost |
|---|---|
| Cloudflare Workers static assets (free tier) | $0 |
| Formspree free plan | $0 |
| Cloudflare Email Routing | $0 |
| Google Search Console | $0 |
| Domain name | ~$10–15/year |

There is no required paid service anywhere in this template.
