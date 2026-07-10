import type { Metadata } from "next"
import { Suspense } from "react"
import { BrowseContent } from "./browse-content"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Browse Prompts",
  description: "Browse AI prompts with proven outcomes. Filter by category, AI tool, and more.",
}

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Prompts</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Discover AI prompts with real, proven outcomes
        </p>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>}>
        <BrowseContent />
      </Suspense>
    </div>
  )
}
