# PromptVault — Business Summary

## The Problem

AI prompt marketplaces exist (PromptBase, FlowGPT, etc.), but they all share the same flaw: **there is no verification that a prompt actually works.** Anyone can upload a prompt claiming it produces great results. Buyers have to take it on faith. This creates a race to the bottom where quality is impossible to distinguish from hype.

## The Solution

PromptVault is a marketplace where **every prompt must include proof of a real outcome** — a screenshot, a link to a live product, or a specific metric. This creates trust and makes the platform valuable to serious AI users who want prompts that actually produce results.

Examples of proof:
- A product photo prompt that shows the Etsy listing with sales
- A copywriting prompt that links to a tweet showing open rates
- A code scaffold prompt that links to a shipped project

## Target Customer

| Persona              | Pain Point                                    | Why PromptVault                                      |
|----------------------|-----------------------------------------------|------------------------------------------------------|
| Freelancers          | Need reliable prompts to deliver client work  | Confirmed outcomes save trial-and-error time         |
| Solopreneurs         | Building with AI but can't afford to guess    | Proof-backed prompts = faster path to revenue        |
| AI power users       | Know prompts can produce results, want a edge | Discover high-performing prompts others verified     |
| Prompt creators      | Have effective prompts, no way to monetize    | Marketplace with trust signals commands higher prices|

## Current Status

- **Code**: Fully built and tested (Next.js 16, TypeScript, Supabase, Stripe)
- **Auth**: Email/password + Google OAuth
- **Payments**: Stripe Checkout for premium prompts
- **Moderation**: Admin dashboard for reviewing submissions
- **Testing**: 19 unit tests passing, build producing 15 routes
- **Documentation**: Setup guide, seed data, deployment guide

## What's needed before launch

- [ ] Seed with 30-50 real prompts (this is the hardest part — each needs real proof)
- [ ] Set up Stripe live keys and webhook
- [ ] Deploy to Vercel with a custom domain
- [ ] Optionally: write 3-5 "prompt that made X" stories for social media marketing
- [ ] Optionally: configure Sentry for production error monitoring

## Monetization

- **Free prompts** — browsable by anyone, drives traffic and SEO
- **Premium prompts** — creator sets a price, PromptVault takes a cut via Stripe
- **Future potential**: featured listings, subscription tiers, affiliate program

## Competitive advantages

| Competitor   | Approach                    | Weakness                                       |
|--------------|-----------------------------|------------------------------------------------|
| PromptBase   | Manual curation             | No proof, just reputation                      |
| FlowGPT      | Community voting            | Gamified, low signal-to-noise                  |
| PromptHero   | Image prompt gallery        | Narrow focus (image only)                      |
| **PromptVault** | **Proof of outcome required** | **Trust = willingness to pay higher prices** |

## Revenue model

Flat 10-15% commission on each premium prompt sale, processed through Stripe. No subscription fees for creators.
