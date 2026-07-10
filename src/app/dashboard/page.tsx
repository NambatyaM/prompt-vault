import type { Metadata } from "next"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "./dashboard-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login?redirect=/dashboard")

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .limit(1)

  return <DashboardContent user={user} profile={profileRows?.[0] ?? null} />
}
