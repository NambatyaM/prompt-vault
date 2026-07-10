# PromptVault

AI prompts with proven outcomes. Every prompt includes proof — a screenshot, link, or metric showing it actually worked.

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Framework   | Next.js 16 (App Router, Turbopack)               |
| Language    | TypeScript                                        |
| Styling     | Tailwind CSS v4                                   |
| Database    | Supabase (Postgres + Auth + Storage)              |
| Payments    | Stripe                                            |
| Hosting     | Vercel                                            |
| Monitoring  | Sentry                                            |
| Testing     | Vitest + Testing Library                          |

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- A Supabase account (free tier works)
- A Stripe account (test mode)

### Step 1 — Clone and install

```bash
git clone <repo-url> promptvault
cd promptvault
npm install
```

### Step 2 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings > API** and copy your URL, anon key, and service_role key
3. Open the **SQL Editor** and paste the contents of `SEED.md` to create all tables, RLS policies, and storage
4. Create a **proof-images** storage bucket (public) as described in `SEED.md`
5. Enable **Auth providers**: Email/Password and Google OAuth in the Supabase Auth dashboard

### Step 3 — Set up Stripe

1. Go to [Stripe Dashboard > Developers > API keys](https://dashboard.stripe.com/test/apikeys)
2. Copy your publishable key (`pk_test_...`) and secret key (`sk_test_...`)
3. Go to **Developers > Webhooks > Add endpoint**
4. Set the endpoint URL to `http://localhost:3000/api/stripe/webhook`
5. Select the `checkout.session.completed` event
6. Copy the signing secret (`whsec_...`)

### Step 4 — Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all the values from steps 2 and 3.

### Step 5 — Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Step 6 — Seed data (optional)

Follow the seed instructions in `SEED.md` to populate the site with example prompts.

## Scripts

| Command            | Description                         |
|--------------------|-------------------------------------|
| `npm run dev`      | Start development server (Turbopack)|
| `npm run build`    | Production build                    |
| `npm run start`    | Start production server             |
| `npm run lint`     | Run ESLint                          |
| `npm run test`     | Run Vitest test suite               |
| `npm run test:watch` | Run tests in watch mode          |

## Project Structure

```
src/
├── app/
│   ├── admin/               # Admin dashboard (moderation)
│   ├── api/                 # API routes
│   │   ├── bookmark/        # Toggle bookmark
│   │   ├── checkout/        # Stripe checkout session
│   │   ├── newsletter/      # Email signup
│   │   ├── stripe/webhook/  # Stripe webhook handler
│   │   ├── upload/          # Image upload to Supabase Storage
│   │   └── vote/            # Toggle vote
│   ├── auth/                # Login, signup, callback
│   ├── browse/              # Browse/discover prompts
│   ├── dashboard/           # User dashboard (my prompts, saved, settings)
│   ├── profile/[username]/  # Public creator profile
│   ├── prompt/[slug]/       # Prompt detail page
│   ├── submit/              # Submit a new prompt
│   ├── page.tsx             # Homepage
│   └── middleware.ts        # Auth middleware (protects /submit, /dashboard)
├── components/
│   ├── auth/                # SignupForm, LoginForm
│   ├── layout/              # Header, Footer
│   ├── prompts/             # PromptCard, VoteButton, BookmarkButton, SubmitForm
│   └── ui/                  # Button, Input, Badge, Card, etc.
└── lib/
    ├── supabase/            # Server, client, admin, middleware clients
    ├── stripe.ts            # Lazy Stripe instance
    ├── utils.ts             # cn(), slugify(), formatDate(), formatPrice()
    └── validations.ts       # Zod schemas
```

## Key Design Decisions

- **Proof is required.** Every submission must include either a proof image upload or a proof link. The homepage and browse page prominently surface the stated outcome.
- **Votes and bookmarks are toggles.** Clicking again removes your vote/bookmark. No API endpoints for deletion — the toggle API handles it.
- **Stripe client is lazy.** `getStripe()` initializes on first call to avoid build-time errors in `next build`.
- **All `.single()` replaced with `.limit(1)`.** PostgREST returns an error when `.single()` gets zero rows, so we use `.limit(1)` and access `data[0]` everywhere.
- **Dynamic pages are forced dynamic.** Pages using Supabase have `force-dynamic` to prevent prerender errors.
- **`useSearchParams()` is wrapped in `<Suspense>`.** Required by Next.js 16 for client components that read search params.
