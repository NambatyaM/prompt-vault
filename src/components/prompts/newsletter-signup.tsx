"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Check } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus("success")
        setMessage("Thanks for subscribing!")
        setEmail("")
      } else {
        setStatus("error")
        setMessage("Something went wrong. Try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Try again.")
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <Check className="h-5 w-5" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-9"
          required
        />
      </div>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-red-500">{message}</p>
      )}
    </form>
  )
}
