import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { CATEGORIES } from "@/types"
import { formatRelativeDate, formatPrice } from "@/lib/utils"
import { ArrowUp, Bookmark, Eye, Sparkles, CheckCircle } from "lucide-react"
import type { PromptWithCounts } from "@/types"

interface PromptCardProps {
  prompt: PromptWithCounts
}

export function PromptCard({ prompt }: PromptCardProps) {
  const categoryLabel = CATEGORIES.find((c) => c.value === prompt.category)?.label ?? prompt.category

  return (
    <Link href={`/prompt/${prompt.slug}`}>
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="secondary" className="shrink-0">
              {categoryLabel}
            </Badge>
            {prompt.is_premium && (
              <Badge variant="premium" className="flex items-center gap-1 shrink-0">
                <Sparkles className="h-3 w-3" />
                {formatPrice(prompt.price)}
              </Badge>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug group-hover:text-amber-600">
            {prompt.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {prompt.description}
          </p>

          {prompt.outcome_text && (
            <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
              {prompt.outcome_text}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            {prompt.profiles && (
              <div className="flex items-center gap-1.5">
                <Avatar
                  src={prompt.profiles.avatar_url}
                  alt={prompt.profiles.username}
                  fallback={prompt.profiles.username[0]?.toUpperCase()}
                  className="h-5 w-5"
                />
                <span className="flex items-center gap-1">
                  {prompt.profiles.username}
                  {(prompt as any).profiles?.verified_builder && (
                    <CheckCircle className="h-3 w-3 text-amber-500" />
                  )}
                </span>
              </div>
            )}
            <span>{formatRelativeDate(prompt.created_at)}</span>
            {prompt.ai_model_version && (
              <span className="ml-auto text-xs text-zinc-400">{prompt.ai_model_version}</span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3.5 w-3.5" />
              {prompt.vote_count}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5" />
              {prompt.bookmark_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {prompt.view_count ?? 0}
            </span>
            <span className="ml-auto text-xs text-zinc-400">{prompt.tool_used}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
