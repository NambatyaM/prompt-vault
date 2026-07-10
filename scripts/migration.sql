-- ============================================================
-- PromptVault Phase 1 Migration
-- New columns, tables, and RLS policies
-- ============================================================

-- 1. Add columns to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS ai_model_version TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'personal' CHECK (license_type IN ('personal', 'commercial', 'resell'));

-- 2. Add verified_builder to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_builder BOOLEAN DEFAULT FALSE;

-- 3. Prompt verifications table (for "Works for me" / reproducibility score)
CREATE TABLE IF NOT EXISTS prompt_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 4. Prompt flags table (for "Stopped working" / community reports)
CREATE TABLE IF NOT EXISTS prompt_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- 5. Enable RLS on new tables
ALTER TABLE prompt_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_flags ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for prompt_verifications
CREATE POLICY "Verifications are viewable by everyone"
  ON prompt_verifications FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert verifications"
  ON prompt_verifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own verifications"
  ON prompt_verifications FOR DELETE USING (auth.uid() = user_id);

-- 7. RLS policies for prompt_flags
CREATE POLICY "Flags are viewable by admins"
  ON prompt_flags FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND verified_builder = true)
  );

CREATE POLICY "Authenticated users can insert flags"
  ON prompt_flags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Update existing prompts with sensible defaults
UPDATE prompts SET license_type = 'personal' WHERE license_type IS NULL;
UPDATE prompts SET last_verified_at = created_at WHERE last_verified_at IS NULL;

-- 9. RLS policies for profiles (belt-and-suspenders with server-side admin client)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 10. Mark seed users as verified builders
UPDATE profiles SET verified_builder = true WHERE username IN ('sarahchen', 'marcusdev');
