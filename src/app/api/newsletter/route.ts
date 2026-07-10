import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from("newsletter_signups")
      .insert({ email })

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "Already subscribed" })
      }
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
    }

    return NextResponse.json({ message: "Subscribed successfully" })
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
