"use client"

import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { VoteButton } from "@/components/prompts/vote-button"
import { BookmarkButton } from "@/components/prompts/bookmark-button"
import { VersionHistory } from "@/components/prompts/version-history"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { CATEGORIES, LICENSE_LABELS, type Prompt, type Profile } from "@/types"
import { formatDate, formatPrice, formatRelativeDate } from "@/lib/utils"
import { Sparkles, ExternalLink, ArrowLeft, Loader2, CheckCircle, Flag, ThumbsUp } from "lucide-react"

export interface PromptPageContentProps {
  prompt: Prompt & { profiles: Pick<Profile, "username" | "avatar_url" | "bio" | "verified_builder"> | null }
  voteCount: number
  bookmarkCount: number
  verificationCount: number
  hasAccess: boolean
}

export function PromptPageContent({ prompt, voteCount, bookmarkCount, verificationCount, hasAccess: initialAccess }: PromptPageContentProps) {
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])

  const [purchasing, setPurchasing] = useState(false)
  const [hasAccess, setHasAccess] = useState(initialAccess)
  const [verifying, setVerifying] = useState(false)
  const [userVerified, setUserVerified] = useState(false)
  const [flagReason, setFlagReason] = useState("")
  const [flagged, setFlagged] = useState(false)

  const stripeConfigured = useMemo(() => !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, [])
  const categoryLabel = CATEGORIES.find((c) => c.value === prompt.category)?.label ?? prompt.category
  const licenseLabel = prompt.license_type ? LICENSE_LABELS[prompt.license_type as keyof typeof LICENSE_LABELS] ?? prompt.license_type : null

  useEffect(() => {
    const purchased = searchParams.get("purchased")
    if (purchased === "true" && !hasAccess) {
      verifyPurchase()
    }
  }, [searchParams])

  useEffect(() => {
    supabase.from("prompts").update({
      view_count: (prompt.view_count ?? 0) + 1,
    }).eq("id", prompt.id).then(() => {})
  }, [])

  async function verifyPurchase() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("prompt_id", prompt.id)
      .eq("status", "completed")
      .limit(1)

    if (purchase?.length) {
      setHasAccess(true)
    }
  }

  async function handleVerify() {
    setVerifying(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setVerifying(false); return }

    const { error } = await supabase.from("prompt_verifications").upsert({
      prompt_id: prompt.id,
      user_id: user.id,
      verified: true,
    }, { onConflict: "user_id,prompt_id" })

    if (!error) setUserVerified(true)
    setVerifying(false)
  }

  async function handleFlag() {
    if (!flagReason.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("prompt_flags").upsert({
      prompt_id: prompt.id,
      user_id: user.id,
      reason: flagReason,
    }, { onConflict: "user_id,prompt_id" })

    setFlagged(true)
  }

  const showFullPrompt = !prompt.is_premium || hasAccess

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/browse"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to browse
      </Link>

      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categoryLabel}</Badge>
          <Badge variant="outline">{prompt.tool_used}</Badge>
          {prompt.ai_model_version && (
            <Badge variant="outline" className="text-xs">
              {prompt.ai_model_version}
            </Badge>
          )}
          {prompt.is_premium && (
            <Badge variant="premium" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {formatPrice(prompt.price)}
            </Badge>
          )}
          {licenseLabel && !prompt.is_premium && (
            <Badge variant="secondary" className="text-xs">
              {licenseLabel}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {prompt.title}
        </h1>

        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          {prompt.description}
        </p>

        {prompt.outcome_text && (
          <div className="mt-4 inline-block rounded-lg bg-green-50 px-4 py-3 text-base font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
            {prompt.outcome_text}
          </div>
        )}

        {prompt.last_verified_at && (
          <p className="mt-3 text-xs text-zinc-400">
            Last verified {formatRelativeDate(prompt.last_verified_at)}
          </p>
        )}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <VoteButton promptId={prompt.id} initialCount={voteCount} initialVoted={false} />
        <BookmarkButton promptId={prompt.id} initialBookmarked={false} />
        <span className="text-sm text-zinc-500">{bookmarkCount} saved</span>
        {verificationCount > 0 && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <ThumbsUp className="h-3.5 w-3.5" />
            {verificationCount} verified
          </span>
        )}
      </div>

      <div className={`mb-8 rounded-xl border p-6 ${!showFullPrompt ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950" : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"}`}>
        <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Full Prompt
        </h2>
        <div className="relative">
          {!showFullPrompt && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-amber-50/80 backdrop-blur-sm dark:bg-amber-950/80">
              <div className="text-center">
                <Sparkles className="mx-auto h-8 w-8 text-amber-500" />
                <p className="mt-2 font-semibold text-amber-700 dark:text-amber-300">
                  Premium Prompt
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Purchase to unlock the full prompt
                </p>
              </div>
            </div>
          )}
          <pre className={`whitespace-pre-wrap rounded-lg bg-white p-4 text-sm font-mono leading-relaxed dark:bg-zinc-950 ${!showFullPrompt ? "select-none blur-sm" : ""}`}>
            {prompt.prompt_text}
          </pre>
        </div>
      </div>

      {prompt.is_premium && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {hasAccess ? "You own this prompt" : "Premium Prompt"}
              </h2>
              {hasAccess ? (
                <p className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Access granted — view the full prompt above
                </p>
              ) : stripeConfigured ? (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Unlock the full prompt for {formatPrice(prompt.price)}
                  {licenseLabel && <span className="ml-1">({licenseLabel})</span>}
                </p>
              ) : (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Payments are not configured yet — this prompt is free until Stripe is set up
                </p>
              )}
            </div>
            {!hasAccess && stripeConfigured && (
              <Button
                variant="premium"
                size="lg"
                disabled={purchasing}
                onClick={async () => {
                  setPurchasing(true)
                  const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ promptId: prompt.id }),
                  })
                  const data = await res.json()
                  setPurchasing(false)
                  if (data.url) window.location.href = data.url
                }}
              >
                {purchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buy Access - {formatPrice(prompt.price)}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {prompt.proof_image_url && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Proof Image
            </h2>
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={prompt.proof_image_url}
                alt="Proof of outcome"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        )}

        {prompt.proof_link && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Proof Link
            </h2>
            <a
              href={prompt.proof_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              <ExternalLink className="h-4 w-4" />
              View Proof
            </a>
          </div>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={verifying || userVerified}
          onClick={handleVerify}
        >
          <ThumbsUp className={`mr-1.5 h-4 w-4 ${userVerified ? "text-green-500" : ""}`} />
          {userVerified ? "Verified it works" : "Works for me"}
        </Button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Flag as stopped working..."
            className="w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-950"
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            disabled={flagged}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={flagged || !flagReason.trim()}
            onClick={handleFlag}
          >
            <Flag className={`mr-1.5 h-4 w-4 ${flagged ? "text-red-500" : ""}`} />
            {flagged ? "Reported" : "Report"}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <VersionHistory
          promptId={prompt.id}
          currentPromptText={prompt.prompt_text}
          currentTool={prompt.tool_used}
          currentDescription={prompt.description}
        />
      </div>

      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Avatar
            src={prompt.profiles?.avatar_url}
            alt={prompt.profiles?.username ?? "User"}
            fallback={prompt.profiles?.username?.[0]?.toUpperCase() ?? "U"}
          />
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${prompt.profiles?.username}`}
                className="font-medium hover:text-amber-600"
              >
                {prompt.profiles?.username ?? "Anonymous"}
              </Link>
              {prompt.profiles?.verified_builder && (
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Verified Builder
                </Badge>
              )}
            </div>
            <p className="text-sm text-zinc-500">
              Submitted {formatDate(prompt.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
