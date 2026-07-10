"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type { PromptVersion } from "@/types"
import { History, RotateCcw, Loader2, Plus, ChevronDown, ChevronUp } from "lucide-react"

interface VersionHistoryProps {
  promptId: string
  currentPromptText: string
  currentTool: string
  currentDescription: string
}

export function VersionHistory({
  promptId,
  currentPromptText,
  currentTool,
  currentDescription,
}: VersionHistoryProps) {
  const [open, setOpen] = useState(false)
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkOwner() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: promptRows } = await supabase
        .from("prompts")
        .select("user_id")
        .eq("id", promptId)
        .limit(1)

      if (promptRows?.[0]?.user_id === user.id) {
        setIsOwner(true)
      }
    }
    checkOwner()
  }, [supabase, promptId])

  const fetchVersions = async () => {
    setLoading(true)
    const res = await fetch(`/api/prompts/${promptId}/versions`)
    const data = await res.json()
    setVersions(data)
    setLoading(false)
  }

  const toggleOpen = () => {
    const next = !open
    setOpen(next)
    if (next && versions.length === 0) fetchVersions()
  }

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId)
    await fetch(`/api/prompts/${promptId}/versions/${versionId}`, { method: "POST" })
    setRestoring(null)
  }

  const handleCreateVersion = async () => {
    setCreating(true)
    await fetch(`/api/prompts/${promptId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt_text: currentPromptText,
        tool_used: currentTool,
        description: currentDescription,
        changelog: `Snapshot from ${formatDate(new Date().toISOString())}`,
      }),
    })
    await fetchVersions()
    setCreating(false)
  }

  if (!isOwner) return null

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <button
        onClick={toggleOpen}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-500" />
          <span className="font-medium">Version History</span>
          {versions.length > 0 && (
            <Badge variant="secondary" className="text-xs">{versions.length}</Badge>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">Previous versions of this prompt</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateVersion}
              disabled={creating}
              className="gap-1.5"
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Snapshot Current
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
          ) : versions.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-400">
              No versions saved yet. Click "Snapshot Current" to save the current state.
            </p>
          ) : (
            <div className="space-y-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <p className="text-sm font-medium">
                      v{v.version_number}
                      {v.changelog && <span className="ml-2 font-normal text-zinc-500">— {v.changelog}</span>}
                    </p>
                    <p className="text-xs text-zinc-400">{formatDate(v.created_at)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={restoring === v.id}
                    onClick={() => handleRestore(v.id)}
                    className="gap-1.5"
                  >
                    {restoring === v.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
