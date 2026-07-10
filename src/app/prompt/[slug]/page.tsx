import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { PromptPageContent } from "./prompt-page-content"
import { CATEGORIES } from "@/types"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: promptRows } = await supabase
    .from("prompts")
    .select("title, description, category")
    .eq("slug", slug)
    .limit(1)

  const prompt = promptRows?.[0]

  if (!prompt) return { title: "Prompt Not Found" }

  const categoryLabel = CATEGORIES.find((c) => c.value === prompt.category)?.label ?? "AI"

  return {
    title: prompt.title,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.title,
      description: prompt.description,
    },
    category: categoryLabel,
  }
}

export default async function PromptPage({ params, searchParams }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: promptRows } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles:user_id (username, avatar_url, bio, verified_builder)
    `)
    .eq("slug", slug)
    .limit(1)

  const prompt = promptRows?.[0]

  if (!prompt) notFound()

  const { count: voteCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("prompt_id", prompt.id)

  const { count: bookmarkCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("prompt_id", prompt.id)

  const { count: verificationCount } = await supabase
    .from("prompt_verifications")
    .select("*", { count: "exact", head: true })
    .eq("prompt_id", prompt.id)
    .eq("verified", true)

  let hasAccess = true
  if (prompt.is_premium) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      hasAccess = false
    } else if (prompt.user_id === user.id) {
      hasAccess = true
    } else {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("prompt_id", prompt.id)
        .eq("status", "completed")
        .limit(1)

      hasAccess = !!purchase?.length
    }
  }

  return (
    <PromptPageContent
      prompt={prompt}
      voteCount={voteCount ?? 0}
      bookmarkCount={bookmarkCount ?? 0}
      verificationCount={verificationCount ?? 0}
      hasAccess={hasAccess}
    />
  )
}
