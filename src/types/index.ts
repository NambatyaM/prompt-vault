export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Profile {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
  created_at: string
  verified_builder: boolean
}

export interface Prompt {
  id: string
  user_id: string
  title: string
  slug: string
  prompt_text: string
  tool_used: string
  ai_model_version: string | null
  category: PromptCategory
  description: string
  proof_image_url: string | null
  proof_link: string | null
  outcome_text: string | null
  is_premium: boolean
  price: number | null
  license_type: string | null
  last_verified_at: string | null
  created_at: string
  updated_at: string
  moderated: boolean
  view_count: number
}

export interface Vote {
  id: string
  user_id: string
  prompt_id: string
  created_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  prompt_id: string
  created_at: string
}

export interface NewsletterSignup {
  id: string
  email: string
  created_at: string
}

export interface Purchase {
  id: string
  user_id: string
  prompt_id: string
  stripe_session_id: string
  amount: number
  status: string
  created_at: string
}

export interface PromptVersion {
  id: string
  prompt_id: string
  version_number: number
  prompt_text: string
  tool_used: string
  description: string
  changelog: string | null
  created_at: string
}

export type LicenseType = "personal" | "commercial" | "resell"

export const LICENSE_LABELS: Record<LicenseType, string> = {
  personal: "Personal Use",
  commercial: "Commercial Use",
  resell: "Resell Rights",
}

export interface PromptVerification {
  id: string
  prompt_id: string
  user_id: string
  verified: boolean
  notes: string | null
  created_at: string
}

export interface PromptFlag {
  id: string
  prompt_id: string
  user_id: string
  reason: string
  created_at: string
}

export type PromptCategory =
  | "image"
  | "copywriting"
  | "code"
  | "business"
  | "video"
  | "agents"
  | "chatbot"
  | "data"
  | "seo"
  | "other"

export const CATEGORIES: { value: PromptCategory; label: string }[] = [
  { value: "image", label: "Image Generation" },
  { value: "copywriting", label: "Copywriting" },
  { value: "code", label: "Code" },
  { value: "business", label: "Business" },
  { value: "video", label: "Video" },
  { value: "agents", label: "AI Agents & Automations" },
  { value: "chatbot", label: "Chatbot Personas" },
  { value: "data", label: "Data Analysis" },
  { value: "seo", label: "SEO & Marketing" },
  { value: "other", label: "Other" },
]

export const AI_TOOLS = [
  "ChatGPT",
  "Claude",
  "Midjourney",
  "DALL-E",
  "Stable Diffusion",
  "Gemini",
  "Copilot",
  "Cursor",
  "Claude Code",
  "Windsurf",
  "Replit",
  "Bolt",
  "v0",
  "Lovable",
  "Perplexity",
  "Other",
] as const

export type SortOption = "newest" | "most_saved" | "most_viewed"

export interface PromptWithCounts extends Prompt {
  profiles: Pick<Profile, "username" | "avatar_url"> | null
  vote_count: number
  bookmark_count: number
  user_voted?: boolean
  user_bookmarked?: boolean
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at">
        Update: Partial<Omit<Profile, "id">>
      }
      prompts: {
        Row: Prompt
        Insert: Omit<Prompt, "id" | "created_at" | "updated_at" | "slug">
        Update: Partial<Omit<Prompt, "id" | "user_id">>
      }
      votes: {
        Row: Vote
        Insert: Omit<Vote, "id" | "created_at">
        Update: Partial<Omit<Vote, "id">>
      }
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, "id" | "created_at">
        Update: Partial<Omit<Bookmark, "id">>
      }
      newsletter_signups: {
        Row: NewsletterSignup
        Insert: Omit<NewsletterSignup, "id" | "created_at">
        Update: Partial<Omit<NewsletterSignup, "id">>
      }
      purchases: {
        Row: Purchase
        Insert: Omit<Purchase, "id" | "created_at">
        Update: Partial<Omit<Purchase, "id">>
      }
      prompt_versions: {
        Row: PromptVersion
        Insert: Omit<PromptVersion, "id" | "created_at">
        Update: Partial<Omit<PromptVersion, "id" | "prompt_id">>
      }
      prompt_verifications: {
        Row: PromptVerification
        Insert: Omit<PromptVerification, "id" | "created_at">
        Update: Partial<Omit<PromptVerification, "id">>
      }
      prompt_flags: {
        Row: PromptFlag
        Insert: Omit<PromptFlag, "id" | "created_at">
        Update: Partial<Omit<PromptFlag, "id">>
      }
    }
  }
}
