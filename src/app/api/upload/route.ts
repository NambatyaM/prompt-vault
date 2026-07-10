import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
      .from("proof-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from("proof-images")
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl })
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
