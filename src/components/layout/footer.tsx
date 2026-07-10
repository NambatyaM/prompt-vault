import Link from "next/link"
import { isStripeConfigured, getStripePublishableKey } from "@/lib/stripe"
import { Sparkles } from "lucide-react"

export function Footer() {
  const stripeConfigured = isStripeConfigured()

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-lg font-bold">PromptVault</span>
            </Link>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              AI prompts that actually worked. Proven outcomes, real results.
            </p>
            {stripeConfigured && (
              <p className="mt-3 text-xs text-zinc-400">
                Payments powered by{" "}
                <a
                  href="https://stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Stripe
                </a>
              </p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold">Browse</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/browse?category=image" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Image</Link></li>
              <li><Link href="/browse?category=copywriting" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Copywriting</Link></li>
              <li><Link href="/browse?category=code" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Code</Link></li>
              <li><Link href="/browse?category=business" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Business</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/submit" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Submit a Prompt</Link></li>
              <li><Link href="/browse" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Browse All</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} PromptVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
