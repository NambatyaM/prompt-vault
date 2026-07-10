import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase())
  if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { promptId, moderated } = await req.json()

  const { error } = await supabase
    .from("prompts")
    .update({ moderated })
    .eq("id", promptId)

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
