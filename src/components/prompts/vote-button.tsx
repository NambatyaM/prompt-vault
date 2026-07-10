"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

interface VoteButtonProps {
  promptId: string
  initialCount: number
  initialVoted: boolean
}

export function VoteButton({ promptId, initialCount, initialVoted }: VoteButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [voted, setVoted] = useState(initialVoted)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleVote = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      router.push("/auth/login")
      return
    }

    if (voted) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("user_id", user.id)
        .eq("prompt_id", promptId)

      if (!error) {
        setCount((c) => c - 1)
        setVoted(false)
      }
    } else {
      const { error } = await supabase
        .from("votes")
        .insert({ user_id: user.id, prompt_id: promptId })

      if (!error) {
        setCount((c) => c + 1)
        setVoted(true)
      }
    }

    setLoading(false)
  }

  return (
    <Button
      variant={voted ? "default" : "outline"}
      size="sm"
      onClick={handleVote}
      disabled={loading}
      className="gap-1.5"
    >
      <ArrowUp className={`h-4 w-4 ${voted ? "text-white" : ""}`} />
      {count}
    </Button>
  )
}
