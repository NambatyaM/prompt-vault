import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PromptCard } from "@/components/prompts/prompt-card"
import { formatDate } from "@/lib/utils"
import type { PromptWithCounts } from "@/types"
import { CheckCircle } from "lucide-react"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} - Creator Profile`,
    description: `View AI prompts submitted by ${username}`,
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .limit(1)

  const profile = profileRows?.[0]
  if (!profile) notFound()

  const { data: prompts } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  const promptsWithCounts = await Promise.all(
    (prompts ?? []).map(async (p) => {
      const { count: voteCount } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("prompt_id", p.id)

      const { count: bookmarkCount } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("prompt_id", p.id)

      return {
        ...p,
        vote_count: voteCount ?? 0,
        bookmark_count: bookmarkCount ?? 0,
        profiles: (p as PromptWithCounts).profiles ?? null,
      } as PromptWithCounts
    }),
  )

  const totalVotes = promptsWithCounts.reduce((sum, p) => sum + p.vote_count, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar
            src={profile.avatar_url}
            alt={profile.username}
            fallback={profile.username[0].toUpperCase()}
            className="h-20 w-20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              {profile.verified_builder && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified Builder
                </Badge>
              )}
            </div>
            {profile.bio && (
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
            )}
            <p className="mt-1 text-sm text-zinc-400">
              Joined {formatDate(profile.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-6 sm:justify-start">
          <div className="text-center">
            <p className="text-2xl font-bold">{promptsWithCounts.length}</p>
            <p className="text-sm text-zinc-500">Prompts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{totalVotes}</p>
            <p className="text-sm text-zinc-500">Upvotes</p>
          </div>
        </div>
      </div>

      <h2 className="mb-6 text-xl font-bold">Submitted Prompts</h2>

      {promptsWithCounts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-500">No prompts submitted yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promptsWithCounts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  )
}
