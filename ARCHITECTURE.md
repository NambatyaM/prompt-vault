# Architecture Overview

## What it does

PromptVault is a marketplace for AI prompts. The twist: every prompt must include proof that it produced real results (a screenshot, a link, a metric). Users browse, vote, bookmark, and purchase premium prompts. Creators submit prompts and track their performance.

## High-level flow

```
Visitor ──► Homepage ──► Browse ──► Prompt Detail
                │                      │
                │                 Vote / Bookmark
                │                 Buy (premium)
                │
                ├──► Submit ──► Upload proof ──► Published
                │
                └──► Auth ──► Dashboard (my prompts, saved, settings)
```

## Pages

| Route                     | Type     | Purpose                                     |
|---------------------------|----------|---------------------------------------------|
| `/`                       | Server   | Landing page with categories & top prompts  |
| `/browse`                 | Client   | Filterable prompt directory                 |
| `/prompt/[slug]`          | Server   | Prompt detail + purchase                    |
| `/profile/[username]`     | Server   | Public creator profile                      |
| `/submit`                 | Client   | Prompt submission form                      |
| `/dashboard`              | Client   | User's prompts, saved, settings             |
| `/admin`                  | Server   | Moderation dashboard                        |
| `/auth/login`             | Client   | Email/password + Google OAuth               |
| `/auth/signup`            | Client   | Account creation                            |
| `/auth/callback`          | Server   | OAuth redirect handler                      |

## API Routes

| Route                     | Method | Purpose                               |
|---------------------------|--------|---------------------------------------|
| `/api/vote`               | POST   | Toggle vote on a prompt               |
| `/api/bookmark`           | POST   | Toggle bookmark on a prompt           |
| `/api/checkout`           | POST   | Create Stripe checkout session        |
| `/api/stripe/webhook`     | POST   | Handle Stripe payment events          |
| `/api/upload`             | POST   | Upload proof image to Supabase Storage|
| `/api/newsletter`         | POST   | Subscribe email to newsletter          |

## Auth flow

- Two methods: **Email/password** and **Google OAuth**
- `src/middleware.ts` checks auth on `/submit` and `/dashboard` — redirects to login if not authenticated
- OAuth callback (`/auth/callback`) creates a `profiles` row for new users
- `@supabase/ssr` manages cookies via the middleware pattern (refresh session on every request)

## Supabase clients

| Client    | Key            | Where used                        |
|-----------|----------------|-----------------------------------|
| `server`  | anon key       | Server components, API routes     |
| `client`  | anon key       | Client components (browser)       |
| `admin`   | service_role   | Stripe webhook (bypasses RLS)     |
| `middleware` | anon key    | Next.js middleware — refreshes auth|

## Payments flow

1. User clicks "Buy Access" on a premium prompt
2. Client calls `POST /api/checkout` with `{ promptId }`
3. Server creates a Stripe Checkout Session, returns the URL
4. User completes payment on Stripe's hosted page
5. Stripe sends `checkout.session.completed` webhook to `/api/stripe/webhook`
6. Webhook inserts a row into `purchases` using the service_role client
7. Prompt detail page checks `purchases` to determine if the user has access

## Key architectural decisions

- **Proof-first design.** The entire premise is that every submission has verifiable proof. The submission form enforces this (image upload or link required). The UI surfaces the outcome text prominently on cards and detail pages.
- **Toggle pattern for votes/bookmarks.** A single `POST` endpoint handles both create and delete — the server checks if a row exists and toggles accordingly. No separate "delete" endpoint needed.
- **Lazy Stripe initialization.** `getStripe()` creates the Stripe instance on first call, avoiding build-time crashes during `next build` when env vars aren't available.
- **No `.single()`.** All database queries use `.limit(1)` with array access to avoid PostgREST errors on empty result sets.
- **Middleware-based auth.** Session refresh happens declaratively in middleware, not in individual routes.
