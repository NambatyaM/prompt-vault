"use client"

"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatRelativeDate } from "@/lib/utils"
import { Users, FileText, AlertTriangle, Eye, Loader2, Check, X } from "lucide-react"

interface AdminContentProps {
  totalUsers: number
  totalPrompts: number
  unmoderated: number
  recentPrompts: { id: string; title: string; slug: string; created_at: string; moderated: boolean }[]
}

export function AdminContent({ totalUsers, totalPrompts, unmoderated, recentPrompts }: AdminContentProps) {
  const [prompts, setPrompts] = useState(recentPrompts)
  const [toggling, setToggling] = useState<string | null>(null)

  const toggleModeration = async (promptId: string, currentlyModerated: boolean) => {
    setToggling(promptId)
    const res = await fetch("/api/admin/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptId, moderated: !currentlyModerated }),
    })
    if (res.ok) {
      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? { ...p, moderated: !currentlyModerated } : p)),
      )
    }
    setToggling(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-500">Overview and moderation</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Users</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Prompts</CardTitle>
            <FileText className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPrompts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Pending Moderation</CardTitle>
            <AlertTriangle className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unmoderated}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-zinc-400" />
                  <Link
                    href={`/prompt/${prompt.slug}`}
                    className="text-sm font-medium hover:text-amber-600"
                  >
                    {prompt.title}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  {prompt.moderated ? (
                    <Badge variant="secondary" className="text-xs">Approved</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Unmoderated</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={toggling === prompt.id}
                    onClick={() => toggleModeration(prompt.id, prompt.moderated)}
                  >
                    {toggling === prompt.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : prompt.moderated ? (
                      <X className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    )}
                  </Button>
                  <span className="text-xs text-zinc-400">
                    {formatRelativeDate(prompt.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
