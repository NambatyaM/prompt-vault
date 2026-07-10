import type { MetadataRoute } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabaseClient()

  const { data: prompts } = await supabase
    .from("prompts")
    .select("slug, updated_at")
    .order("created_at", { ascending: false })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://promptvault.vercel.app"

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ]

  const promptPages = (prompts ?? []).map((prompt) => ({
    url: `${baseUrl}/prompt/${prompt.slug}`,
    lastModified: new Date(prompt.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...promptPages]
}
