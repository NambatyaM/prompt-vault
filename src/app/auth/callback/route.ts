import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("redirect") ?? "/"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // ignore
            }
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .limit(1)

        if (!existingProfile || existingProfile.length === 0) {
          const admin = createAdminClient()
          const username = user.email?.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() ?? `user_${user.id.slice(0, 8)}`

          const { data: usernameCheck } = await admin
            .from("profiles")
            .select("username")
            .eq("username", username)
            .limit(1)

          const finalUsername = usernameCheck && usernameCheck.length > 0
            ? `${username}_${user.id.slice(0, 4)}`
            : username

          await admin.from("profiles").insert({
            id: user.id,
            username: finalUsername,
            bio: null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}?error=auth_callback_error`)
}
