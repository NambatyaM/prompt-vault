import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form"
import { Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Create Account",
}

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Sparkles className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Join PromptVault and share your proven prompts
          </p>
        </div>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
