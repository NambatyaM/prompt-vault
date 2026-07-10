"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PromptCard } from "@/components/prompts/prompt-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PromptWithCounts, Profile } from "@/types"
import type { User } from "@supabase/supabase-js"
import { Save, Loader2, History } from "lucide-react"

interface Props {
  user: User
  profile: Profile | null
}

export function DashboardContent({ user, profile }: Props) {
  const supabase = createClient()
  const [myPrompts, setMyPrompts] = useState<PromptWithCounts[]>([])
  const [savedPrompts, setSavedPrompts] = useState<PromptWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [username, setUsername] = useState(profile?.username ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")

  useEffect(() => {
    async function loadData() {
      const { data: prompts } = await supabase
        .from("prompts")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("prompt_id")
        .eq("user_id", user.id)

      const bookmarkedIds = (bookmarks ?? []).map((b) => b.prompt_id)

      const { data: savedData } = bookmarkedIds.length > 0
        ? await supabase
            .from("prompts")
            .select(`
              *,
              profiles:user_id (username, avatar_url)
            `)
            .in("id", bookmarkedIds)
        : { data: null }

      const saved = savedData ?? []

      const withCounts = async (items: typeof prompts) => {
        return Promise.all(
          (items ?? []).map(async (p) => {
            const { count: vc } = await supabase
              .from("votes")
              .select("*", { count: "exact", head: true })
              .eq("prompt_id", p.id)
            const { count: bc } = await supabase
              .from("bookmarks")
              .select("*", { count: "exact", head: true })
              .eq("prompt_id", p.id)
            const record = p as PromptWithCounts
            return {
              ...record,
              vote_count: vc ?? 0,
              bookmark_count: bc ?? 0,
              profiles: record.profiles ?? null,
            } as PromptWithCounts
          }),
        )
      }

      setMyPrompts(await withCounts(prompts ?? []))
      setSavedPrompts(await withCounts(saved))
      setLoading(false)
    }

    loadData()
  }, [supabase, user.id])

  const handleSaveProfile = async () => {
    setSaving(true)

    if (username !== profile?.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .limit(1)

      if (existing?.[0] && existing[0].id !== user.id) {
        setSaving(false)
        return
      }
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username,
      bio: bio || null,
    })
    if (!error) setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Dashboard</h1>

      <Tabs defaultValue="prompts">
        <TabsList className="mb-8">
          <TabsTrigger value="prompts">My Prompts ({myPrompts.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedPrompts.length})</TabsTrigger>
          <TabsTrigger value="settings">Profile Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts">
          {myPrompts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
              <p className="text-zinc-500">You haven&apos;t submitted any prompts yet</p>
              <Button variant="outline" className="mt-4" asChild>
                <a href="/submit">Submit Your First Prompt</a>
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-zinc-500">Click any prompt to manage versions</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {savedPrompts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
              <p className="text-zinc-500">No saved prompts yet</p>
              <Button variant="outline" className="mt-4" asChild>
                <a href="/browse">Browse Prompts</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
