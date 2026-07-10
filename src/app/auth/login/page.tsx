import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sign In",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Sparkles className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your PromptVault account
          </p>
        </div>
        <Suspense fallback={<div className="py-8 text-center text-sm text-zinc-500">Loading...</div>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
