# Database Schema

PromptVault uses Supabase (Postgres) with Row Level Security enabled on all tables.

## Entity Relationship Diagram

```
auth.users
    │
    │ (1)
    ▼
profiles ──────┐
    │           │ (1)
    │           ▼
    │        prompts
    │           │  │
    │           │  │ (1)
    │           │  ▼
    │           │ bookmarks
    │           │
    │           │ (1)
    │           ▼
    │        votes
    │
    └────── purchases
```

## Tables

### `profiles`

Extends Supabase `auth.users`. Created when a user signs up or logs in via OAuth.

| Column       | Type         | Constraints                        |
|--------------|--------------|------------------------------------|
| id           | UUID         | PK, FK → auth.users(id) ON DELETE CASCADE |
| username     | TEXT         | UNIQUE, NOT NULL                   |
| bio          | TEXT         | nullable                           |
| avatar_url   | TEXT         | nullable                           |
| created_at   | TIMESTAMPTZ  | DEFAULT NOW()                      |

**RLS:**
- SELECT: everyone (public profiles)
- INSERT: own row only (`auth.uid() = id`)
- UPDATE: own row only

### `prompts`

The core entity — an AI prompt submission with proof.

| Column          | Type         | Constraints                        |
|-----------------|--------------|------------------------------------|
| id              | UUID         | PK, DEFAULT gen_random_uuid()      |
| user_id         | UUID         | FK → profiles(id) ON DELETE CASCADE |
| title           | TEXT         | NOT NULL                           |
| slug            | TEXT         | UNIQUE, NOT NULL                   |
| prompt_text     | TEXT         | NOT NULL (full prompt content)     |
| tool_used       | TEXT         | NOT NULL (e.g. "ChatGPT", "Midjourney") |
| category        | TEXT         | NOT NULL (image, copywriting, code, business, video, other) |
| description     | TEXT         | NOT NULL (short summary)           |
| proof_image_url | TEXT         | nullable                           |
| proof_link      | TEXT         | nullable                           |
| outcome_text    | TEXT         | nullable (e.g. "$400 in first week") |
| is_premium      | BOOLEAN      | DEFAULT FALSE                      |
| price           | INTEGER      | nullable (amount in cents)         |
| moderated       | BOOLEAN      | DEFAULT FALSE                      |
| view_count      | INTEGER      | DEFAULT 0                          |
| created_at      | TIMESTAMPTZ  | DEFAULT NOW()                      |
| updated_at      | TIMESTAMPTZ  | DEFAULT NOW()                      |

**RLS:**
- SELECT: everyone
- INSERT: authenticated users
- UPDATE: own row only

### `votes`

Tracks upvotes on prompts. One vote per user per prompt (enforced by UNIQUE constraint).

| Column    | Type         | Constraints                        |
|-----------|--------------|------------------------------------|
| id        | UUID         | PK, DEFAULT gen_random_uuid()      |
| user_id   | UUID         | FK → profiles(id) ON DELETE CASCADE |
| prompt_id | UUID         | FK → prompts(id) ON DELETE CASCADE |
| created_at| TIMESTAMPTZ  | DEFAULT NOW()                      |

**Uniques:** `(user_id, prompt_id)`

**RLS:**
- SELECT: everyone
- INSERT: own vote only
- DELETE: own vote only

### `bookmarks`

Tracks saved prompts. One bookmark per user per prompt (enforced by UNIQUE constraint).

| Column    | Type         | Constraints                        |
|-----------|--------------|------------------------------------|
| id        | UUID         | PK, DEFAULT gen_random_uuid()      |
| user_id   | UUID         | FK → profiles(id) ON DELETE CASCADE |
| prompt_id | UUID         | FK → prompts(id) ON DELETE CASCADE |
| created_at| TIMESTAMPTZ  | DEFAULT NOW()                      |

**Uniques:** `(user_id, prompt_id)`

**RLS:**
- SELECT: everyone
- INSERT: own bookmark only
- DELETE: own bookmark only

### `purchases`

Tracks Stripe payments for premium prompts. Inserted by the Stripe webhook handler.

| Column             | Type         | Constraints                        |
|--------------------|--------------|------------------------------------|
| id                 | UUID         | PK, DEFAULT gen_random_uuid()      |
| user_id            | UUID         | FK → profiles(id) ON DELETE CASCADE |
| prompt_id          | UUID         | FK → prompts(id) ON DELETE CASCADE |
| stripe_session_id  | TEXT         | nullable                           |
| amount             | INTEGER      | NOT NULL (cents)                   |
| status             | TEXT         | NOT NULL, DEFAULT 'pending'        |
| created_at         | TIMESTAMPTZ  | DEFAULT NOW()                      |

**RLS:**
- SELECT: own purchases only

### `newsletter_signups`

Email subscriptions from the homepage newsletter form.

| Column    | Type         | Constraints                        |
|-----------|--------------|------------------------------------|
| id        | UUID         | PK, DEFAULT gen_random_uuid()      |
| email     | TEXT         | UNIQUE, NOT NULL                   |
| created_at| TIMESTAMPTZ  | DEFAULT NOW()                      |

**RLS:**
- ALL: authenticated users only (managed via API)

## Storage

### `proof-images` bucket

Public bucket storing proof-of-outcome screenshots/images.

**Policies:**
- SELECT: everyone (public read)
- INSERT: authenticated users only

## Relationships

| From         | To            | Type   | Foreign Key                     |
|--------------|---------------|--------|----------------------------------|
| profiles     | auth.users    | 1:1    | profiles.id → auth.users.id     |
| prompts      | profiles      | N:1    | prompts.user_id → profiles.id   |
| votes        | profiles      | N:1    | votes.user_id → profiles.id     |
| votes        | prompts       | N:1    | votes.prompt_id → prompts.id    |
| bookmarks    | profiles      | N:1    | bookmarks.user_id → profiles.id |
| bookmarks    | prompts       | N:1    | bookmarks.prompt_id → prompts.id|
| purchases    | profiles      | N:1    | purchases.user_id → profiles.id |
| purchases    | prompts       | N:1    | purchases.prompt_id → prompts.id|

All foreign keys use `ON DELETE CASCADE` — deleting a user or prompt removes associated votes, bookmarks, and purchases.
