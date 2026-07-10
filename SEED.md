# PromptVault — Seed & Setup Guide

## Overview

PromptVault is a web platform where users submit AI prompts that produced a specific, provable outcome. Every prompt must include proof (image or link).

## Tech Stack

- Next.js (App Router), TypeScript
- Supabase (Postgres, Auth, Storage)
- Tailwind CSS
- Stripe (payments)
- Vercel (hosting)
- Sentry (error tracking)

## Quick Start

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (for admin operations) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_...) |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (whsec_...) |
| `ADMIN_EMAILS` | Comma-separated emails with admin access |

### 2. Supabase Setup

#### Database Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  prompt_text TEXT NOT NULL,
  tool_used TEXT NOT NULL,
  ai_model_version TEXT, -- e.g. "GPT-4o", "Claude Sonnet 4.6"
  category TEXT NOT NULL,
  license_type TEXT DEFAULT 'personal' CHECK (license_type IN ('personal', 'commercial', 'resell')),
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL,
  proof_image_url TEXT,
  proof_link TEXT,
  outcome_text TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  price INTEGER, -- amount in cents
  moderated BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Newsletter signups table
CREATE TABLE newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt versions (version control for creators)
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  prompt_text TEXT NOT NULL,
  tool_used TEXT NOT NULL,
  description TEXT NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt verifications (reproducibility score — "Works for me")
CREATE TABLE prompt_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Prompt flags (community reports — "Stopped working")
CREATE TABLE prompt_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Add verified_builder to profiles
ALTER TABLE profiles ADD COLUMN verified_builder BOOLEAN DEFAULT FALSE;
```

#### Storage Setup

Create a `proof-images` bucket in Supabase Storage (public bucket). Set the following policy on the bucket:

```sql
-- Allow public read
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'proof-images');

-- Allow authenticated upload
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proof-images' AND auth.role() = 'authenticated'
  );
```

#### Row Level Security (RLS)

Enable RLS on all tables and create policies:

```sql
-- Profiles: users can read all, update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Prompts: anyone can read, only owners can update
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompts are viewable by everyone"
  ON prompts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert prompts"
  ON prompts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE USING (auth.uid() = user_id);

-- Votes: anyone can read, authenticated users can insert/delete own
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT USING (true);

CREATE POLICY "Users can insert own votes"
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: anyone can read, authenticated users can insert/delete own
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bookmarks are viewable by everyone"
  ON bookmarks FOR SELECT USING (true);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Newsletter: authenticated users only (via API)
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage newsletter"
  ON newsletter_signups FOR ALL USING (auth.role() = 'authenticated');

-- Purchases: users can see own purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT USING (auth.uid() = user_id);

-- Prompt versions: anyone can read, only prompt owners can insert
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompt versions are viewable by everyone"
  ON prompt_versions FOR SELECT USING (true);

CREATE POLICY "Prompt owners can insert versions"
  ON prompt_versions FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prompts WHERE id = prompt_id AND user_id = auth.uid()
    )
  );

-- Prompt verifications: anyone can read, authenticated users can insert
ALTER TABLE prompt_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verifications are viewable by everyone"
  ON prompt_verifications FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert verifications"
  ON prompt_verifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own verifications"
  ON prompt_verifications FOR DELETE USING (auth.uid() = user_id);

-- Prompt flags: admins can view, authenticated users can insert
ALTER TABLE prompt_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flags are viewable by admins"
  ON prompt_flags FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND verified_builder = true)
  );

CREATE POLICY "Authenticated users can insert flags"
  ON prompt_flags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 3. Seed Data

To populate the site with example prompts, create an API endpoint or run the following SQL:

```sql
-- Create a test user first (use Supabase Auth UI or API to create a user),
-- then get the user ID and insert as their profile:
INSERT INTO profiles (id, username, bio) VALUES
  ('<user-id>', 'promptmaster', 'AI prompt expert specializing in marketing copy'),
  ('<user-id-2>', 'codecraft', 'Full-stack developer exploring AI-assisted coding');

-- Insert seed prompts (replace user_id with actual UUIDs)
INSERT INTO prompts (user_id, title, slug, prompt_text, tool_used, category, description, proof_link, outcome_text, moderated) VALUES
  ('<uuid>', 'Midjourney Product Photography That Converts', 'midjourney-product-photography', 'A product on a minimalist white background, studio lighting, soft shadows, high resolution, commercial photography style --ar 4:5 --v 6', 'Midjourney', 'image', 'Created product photos for an Etsy store that doubled conversion rate.', 'https://etsy.com/shop/example', 'Doubled conversion rate in 2 weeks', true),

  ('<uuid>', 'ChatGPT Sales Email That Got 40% Open Rate', 'chatgpt-sales-email', 'Write a sales email for [product] targeting [audience]. Use the PAS framework: identify the problem, agitate it, present the solution. Keep it under 150 words. Include a single CTA.', 'ChatGPT', 'copywriting', 'Used this prompt template for a SaaS launch. Generated emails that outperformed hand-written ones.', 'https://twitter.com/user/status/123', '40% open rate, 12% click-through', true),

  ('<uuid>', 'Claude Code Scaffold Generator', 'claude-code-scaffold', 'Generate a Next.js API route handler that validates the request body with Zod, handles errors gracefully, and returns proper HTTP status codes. The route should handle POST requests for creating a resource. Include TypeScript types.', 'Claude', 'code', 'Used this to scaffold 15 API routes in one afternoon. Saved 3 days of work.', 'https://github.com/user/repo', 'Saved 3 days of development time', true);
```

### 4. Stripe Setup

#### Test Mode (for development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (pk_test_...) to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy your **Secret key** (sk_test_...) to `STRIPE_SECRET_KEY`
4. Go to **Developers > Webhooks > Add endpoint**
5. Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook` (or `https://YOUR_NGROK.ngrok-free.app/api/stripe/webhook` for local)
6. Select event: `checkout.session.completed`
7. Copy the **Signing secret** (whsec_...) to `STRIPE_WEBHOOK_SECRET`

#### Switch to Live Mode

1. Go to Stripe Dashboard > **Activate your account** and complete onboarding
2. Copy the **Live** keys (pk_live_..., sk_live_...) to your environment variables
3. Create a new webhook endpoint with your production domain
4. That's it — no code changes needed

### 5. Moderation Flow

Prompts have a `moderated` boolean field (defaults to `false`). The admin dashboard shows unmoderated prompts. An admin can update the flag:

```sql
UPDATE prompts SET moderated = TRUE WHERE id = '<prompt-id>';
```

You can also add a moderation button to the admin dashboard.

### 6. Deployment

```bash
# Build
npm run build

# Deploy to Vercel
npx vercel --prod
```

Add all environment variables in the Vercel dashboard under Project Settings > Environment Variables.

### 7. Launch Checklist

- [ ] Seed 30-50 real prompt entries (site should never show empty state)
- [ ] Write 3-5 "prompt that made X" stories formatted for LinkedIn/Twitter
- [ ] Confirm Sentry is receiving events
- [ ] Confirm Vercel Analytics shows page views
- [ ] Confirm newsletter signup stores emails in Supabase
- [ ] Test Stripe checkout flow (use test card: 4242 4242 4242 4242)
- [ ] Verify sitemap.xml and robots.txt are generated
- [ ] Verify Open Graph tags render correctly on social preview
- [ ] Test auth flow (email/password and Google OAuth)
- [ ] Test submission flow with proof upload
