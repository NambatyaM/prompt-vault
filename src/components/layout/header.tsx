"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Menu, Sparkles } from "lucide-react"

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profileRows } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .limit(1)
        setProfile(profileRows?.[0] ?? null)
      }
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <span className="text-xl font-bold tracking-tight">PromptVault</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/browse" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Browse
          </Link>
          <Link href="/submit" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
            Submit
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                Dashboard
              </Link>
              <Link href={`/profile/${profile?.username ?? "me"}`}>
                <Avatar
                  src={profile?.avatar_url}
                  alt={profile?.username ?? "User"}
                  fallback={profile?.username?.[0]?.toUpperCase() ?? "U"}
                  className="h-8 w-8"
                />
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-200 px-4 pb-4 pt-2 md:hidden dark:border-zinc-800">
          <nav className="flex flex-col gap-2">
            <Link href="/browse" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
              Browse
            </Link>
            <Link href="/submit" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
              Submit
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href={`/profile/${profile?.username ?? "me"}`} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/auth/signup" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
