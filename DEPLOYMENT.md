# Deployment Guide

PromptVault is ready to deploy to **Vercel** or **Netlify**. You only need Supabase keys to get running — Stripe is optional and only needed for premium prompt payment processing.

## Prerequisites

- A GitHub / GitLab / Bitbucket account
- A Vercel or Netlify account (free tier works)
- A Supabase account (free tier works)
- A Stripe account *(optional — only if you want premium purchases)*

---

## Step 1 — Push the code to your own repository

```bash
git remote set-url origin https://github.com/your-account/promptvault.git
git push -u origin main
```

---

## Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a strong database password and save it
3. Wait for the project to provision (~2 minutes)
4. Go to **Project Settings > API** — copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Run the schema

Open the **SQL Editor** in Supabase, create a new query, and paste the full SQL from `scripts/migration.sql` (tables + RLS policies + new columns). Run it.

### Set up Storage

1. Go to **Storage** in Supabase
2. Create a new bucket named `proof-images`
3. Set it to **public**
4. Run the storage policies from `SEED.md` to allow public read and authenticated upload

### Set up Auth

1. Go to **Authentication > Providers**
2. **Email/Password** is enabled by default
3. Enable **Google** if desired:
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
   - Set the redirect URL to `https://your-project.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret into Supabase

---

## Step 3 — Deploy

### Option A: Vercel (recommended)

**CLI:**
```bash
npx vercel --prod
```

**Dashboard:**
1. Go to [vercel.com](https://vercel.com) → **Add New > Project**
2. Import your repository
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `.next`
6. Add environment variables (see table below)
7. Click **Deploy**

### Option B: Netlify

**CLI:**
```bash
npx netlify deploy --prod
```

**Dashboard:**
1. Go to [netlify.com](https://netlify.com) → **Add New > Import from Git**
2. Import your repository
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables (see table below)
6. Click **Deploy**

> Netlify requires the **Essential Next.js plugin** — it's already configured in `netlify.toml` and will be auto-installed.

### Environment variables to set

| Variable | Required | Value |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | From Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | From Supabase project settings |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Your deployed URL (e.g. `https://promptvault.vercel.app`) |
| `ADMIN_EMAILS` | **Yes** | Comma-separated emails with admin access |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | From Stripe — skip for free-only mode |
| `STRIPE_SECRET_KEY` | No | From Stripe — skip for free-only mode |
| `STRIPE_WEBHOOK_SECRET` | No | From Stripe webhook — skip for free-only mode |
| `SENTRY_DSN` | No | From Sentry project |

**The platform works fully without Stripe keys.** Free prompts function normally. Premium prompts show a "Payments not configured" message and can't be purchased until Stripe is set up.

---

## Step 4 — Set up Stripe *(optional)*

Only needed if you want to sell premium prompts.

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
4. Select event: `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (`whsec_...`) → set as `STRIPE_WEBHOOK_SECRET`

### Keys

- **Publishable key** (`pk_live_...`): Set as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Secret key** (`sk_live_...`): Set as `STRIPE_SECRET_KEY`

> Use **test keys** (`pk_test_...` / `sk_test_...`) for development. Switch to **live keys** when ready to accept real payments.

### Webhook for local development

Use ngrok to tunnel to your local server:

```bash
npx ngrok http 3000
```

Update the Stripe webhook endpoint URL to `https://your-ngrok.ngrok-free.app/api/stripe/webhook`.

---

## Step 5 — Verify the deployment

1. Visit the deployed URL
2. Create an account (email/password or Google OAuth)
3. Submit a prompt with proof
4. Browse and search prompts
5. Test voting and bookmarking
6. Test premium purchase with Stripe test card: `4242 4242 4242 4242`
7. Verify `/sitemap.xml` and `/robots.txt` are accessible
8. Verify Open Graph preview works (paste a prompt URL into Twitter/LinkedIn debugger)

---

## Step 6 — Custom domain *(optional)*

1. In your hosting dashboard, go to **Project Settings > Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

---

## Launch checklist

- [ ] Seed the database with 25 sample prompts: `node scripts/seed.mjs`
- [ ] Run the migration SQL in `scripts/migration.sql` (new columns + tables)
- [ ] Confirm Stripe webhook is receiving events (if configured)
- [ ] Test full purchase flow end-to-end (if Stripe is configured)
- [ ] Verify sitemap.xml includes all prompt pages
- [ ] Test mobile layout on all pages
- [ ] Update `ADMIN_EMAILS` to your email
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your production domain
