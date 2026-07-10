import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from("prompt_versions")
    .select("*")
    .eq("prompt_id", id)
    .order("version_number", { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    return NextResponse.json({ error: "Only the owner can create versions" }, { status: 403 })
  }

  const { prompt_text, tool_used, description, changelog } = await req.json()

  if (!prompt_text || !tool_used || !description) {
    return NextResponse.json({ error: "prompt_text, tool_used, and description are required" }, { status: 400 })
  }

  const { data: latestRows } = await supabase
    .from("prompt_versions")
    .select("version_number")
    .eq("prompt_id", id)
    .order("version_number", { ascending: false })
    .limit(1)

  const nextVersion = (latestRows?.[0]?.version_number ?? 0) + 1

  const { data: newVersion, error } = await supabase
    .from("prompt_versions")
    .insert({
      prompt_id: id,
      version_number: nextVersion,
      prompt_text,
      tool_used,
      description,
      changelog: changelog ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 })
  }

  return NextResponse.json(newVersion, { status: 201 })
}
