import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NewsletterSignup } from "@/components/prompts/newsletter-signup"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import { CATEGORIES, type PromptWithCounts } from "@/types"
import { ArrowUp, Bookmark, Sparkles, Search, Zap, Award, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

async function getTopPrompts(timeRange: string): Promise<PromptWithCounts[]> {
  const supabase = await createServerSupabaseClient()
  const sinceDate = timeRange === "week"
    ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(0).toISOString()

  const { data: prompts } = await supabase
    .from("prompts")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .gte("created_at", sinceDate)
    .order("created_at", { ascending: false })
    .limit(6)

  if (!prompts) return []

  const promptsWithCounts = await Promise.all(
    prompts.map(async (p) => {
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
      }
    }),
  )

  return promptsWithCounts
}

function CategoryCard({ category }: { category: typeof CATEGORIES[number] }) {
  const icons: Record<string, React.ReactNode> = {
    image: <Zap className="h-6 w-6" />,
    copywriting: <Award className="h-6 w-6" />,
    code: <TrendingUp className="h-6 w-6" />,
    business: <TrendingUp className="h-6 w-6" />,
    video: <Zap className="h-6 w-6" />,
    other: <Search className="h-6 w-6" />,
  }

  return (
    <Link href={`/browse?category=${category.value}`}>
      <Card className="group cursor-pointer transition-all hover:shadow-md">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="rounded-full bg-amber-50 p-3 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
            {icons[category.value] ?? <Search className="h-6 w-6" />}
          </div>
          <span className="font-medium">{category.label}</span>
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function HomePage() {
  const topThisWeek = await getTopPrompts("week")

  return (
    <div>
      <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Sparkles className="h-4 w-4" />
              AI prompts with proven outcomes
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              AI Prompts That{" "}
              <span className="text-amber-500">Actually Worked</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Every prompt on PromptVault comes with proof of outcome. 
              See what a prompt actually made before you use it.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/browse">
                <Button size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  Browse Prompts
                </Button>
              </Link>
              <Link href="/submit">
                <Button variant="outline" size="lg">
                  Submit Yours
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Find proven prompts for your next project
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.value} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {topThisWeek.length > 0 && (
        <section className="border-t border-zinc-200 py-16 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Top This Week</h2>
                <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                  Most upvoted prompts this week
                </p>
              </div>
              <Link href="/browse?sort=most_viewed">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topThisWeek.map((prompt: PromptWithCounts) => (
                <Link key={prompt.id} href={`/prompt/${prompt.slug}`}>
                  <Card className="group h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary">
                          {CATEGORIES.find((c) => c.value === prompt.category)?.label ?? prompt.category}
                        </Badge>
                        {prompt.is_premium && (
                          <Badge variant="premium" className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {formatPrice(prompt.price)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-base font-semibold group-hover:text-amber-600">
                        {prompt.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                        {prompt.description}
                      </p>
                      {prompt.outcome_text && (
                        <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                          {prompt.outcome_text}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <ArrowUp className="h-3.5 w-3.5" />
                          {prompt.vote_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark className="h-3.5 w-3.5" />
                          {prompt.bookmark_count}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold">Get Weekly Proven Prompts</h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Join creators who are already using prompts that actually work.
            </p>
            <div className="mt-6">
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
