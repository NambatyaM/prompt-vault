import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { signupSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email, password, username } = parsed.data

    const supabase = createAdminClient()

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .limit(1)

    if (existingProfile && existingProfile.length > 0) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 })
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
      bio: null,
      avatar_url: null,
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: "Failed to create profile. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
