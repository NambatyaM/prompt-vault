import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminContent } from "./admin-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?redirect=/admin")

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase())
  const userEmail = user.email?.toLowerCase() ?? ""

  if (!adminEmails.includes(userEmail)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-zinc-500">You do not have admin privileges.</p>
      </div>
    )
  }

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: totalPrompts } = await supabase
    .from("prompts")
    .select("*", { count: "exact", head: true })

  const { count: unmoderated } = await supabase
    .from("prompts")
    .select("*", { count: "exact", head: true })
    .eq("moderated", false)

  const { data: topPrompts } = await supabase
    .from("prompts")
    .select("id, title, slug, created_at, moderated")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <AdminContent
      totalUsers={totalUsers ?? 0}
      totalPrompts={totalPrompts ?? 0}
      unmoderated={unmoderated ?? 0}
      recentPrompts={topPrompts ?? []}
    />
  )
}
