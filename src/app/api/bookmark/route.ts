import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { promptId } = await req.json()

  const { data: existingRows } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .eq("prompt_id", promptId)
    .limit(1)

  const existing: { id: string } | undefined = existingRows?.[0]

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id)
    return NextResponse.json({ bookmarked: false })
  }

  await supabase.from("bookmarks").insert({
    user_id: user.id,
    prompt_id: promptId,
  })

  return NextResponse.json({ bookmarked: true })
}
