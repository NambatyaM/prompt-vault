import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  const { id, versionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: promptRows } = await supabase
    .from("prompts")
    .select("user_id")
    .eq("id", id)
    .limit(1)

  const prompt = promptRows?.[0]
  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
  }
  if (prompt.user_id !== user.id) {
    return NextResponse.json({ error: "Only the owner can restore versions" }, { status: 403 })
  }

  const { data: versionRows } = await supabase
    .from("prompt_versions")
    .select("*")
    .eq("id", versionId)
    .eq("prompt_id", id)
    .limit(1)

  const version = versionRows?.[0]
  if (!version) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 })
  }

  const { error } = await supabase
    .from("prompts")
    .update({
      prompt_text: version.prompt_text,
      tool_used: version.tool_used,
      description: version.description,
    })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
