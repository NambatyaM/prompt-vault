"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"

interface BookmarkButtonProps {
  promptId: string
  initialBookmarked: boolean
}

export function BookmarkButton({ promptId, initialBookmarked }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleToggle = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      router.push("/auth/login")
      return
    }

    if (bookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", promptId)

      if (!error) setBookmarked(false)
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, prompt_id: promptId })

      if (!error) setBookmarked(true)
    }

    setLoading(false)
  }

  return (
    <Button
      variant={bookmarked ? "secondary" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className="gap-1.5"
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
      {bookmarked ? "Saved" : "Save"}
    </Button>
  )
}
