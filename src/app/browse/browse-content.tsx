"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PromptCard } from "@/components/prompts/prompt-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, AI_TOOLS, type PromptWithCounts, type SortOption } from "@/types"
import { Search, SlidersHorizontal, Loader2 } from "lucide-react"

export function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [prompts, setPrompts] = useState<PromptWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "all")
  const [tool, setTool] = useState(searchParams.get("tool") ?? "all")
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) ?? "newest")
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get("verified") === "true")
  const [page, setPage] = useState(1)
  const pageSize = 12

  const fetchPrompts = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from("prompts")
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (category !== "all") {
      query = query.eq("category", category)
    }
    if (tool !== "all") {
      query = query.eq("tool_used", tool)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (verifiedOnly) {
      query = query.not("proof_image_url", "is", null)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data } = await query

    if (data) {
      const promptsWithCounts: PromptWithCounts[] = await Promise.all(
        data.map(async (prompt) => {
          const { count: voteCount } = await supabase
            .from("votes")
            .select("*", { count: "exact", head: true })
            .eq("prompt_id", prompt.id)

          const { count: bookmarkCount } = await supabase
            .from("bookmarks")
            .select("*", { count: "exact", head: true })
            .eq("prompt_id", prompt.id)

          const p = prompt as PromptWithCounts
          return {
            ...p,
            vote_count: voteCount ?? 0,
            bookmark_count: bookmarkCount ?? 0,
          }
        }),
      )

      if (sort === "most_saved") {
        promptsWithCounts.sort((a, b) => b.bookmark_count - a.bookmark_count)
      } else if (sort === "most_viewed") {
        promptsWithCounts.sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
      }

      setPrompts(promptsWithCounts)
    }

    setLoading(false)
  }, [supabase, category, tool, search, sort, verifiedOnly, page])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set("q", search)
    if (category !== "all") params.set("category", category)
    if (tool !== "all") params.set("tool", tool)
    if (sort !== "newest") params.set("sort", sort)
    if (verifiedOnly) params.set("verified", "true")
    const qs = params.toString()
    router.replace(`/browse${qs ? `?${qs}` : ""}`, { scroll: false })
  }, [search, category, tool, sort, verifiedOnly, router])

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={category}
            onValueChange={(v) => { setCategory(v); setPage(1) }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={tool}
            onValueChange={(v) => { setTool(v); setPage(1) }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="AI Tool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tools</SelectItem>
              {AI_TOOLS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(v) => { setSort(v as SortOption); setPage(1) }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most_saved">Most Saved</SelectItem>
              <SelectItem value="most_viewed">Most Viewed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={verifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => { setVerifiedOnly(!verifiedOnly); setPage(1) }}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Verified Only
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : prompts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
          <h3 className="text-lg font-medium text-zinc-500">No prompts found</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-zinc-500">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={prompts.length < pageSize}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
