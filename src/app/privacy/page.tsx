import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PromptVault privacy policy — how we handle your data.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">1. Information We Collect</h2>
          <p>
            When you create an account on PromptVault, we collect your email address and the profile
            information you choose to provide (username, bio, avatar). When you submit a prompt, we
            collect the prompt text, description, proof materials, and any other content you include.
          </p>
          <p className="mt-2">
            We also collect standard usage data such as page views, votes, bookmarks, and interactions
            with prompts to improve the platform experience.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">2. How We Use Your Information</h2>
          <p>
            We use your information to operate PromptVault: display your profile and prompts, process
            votes and bookmarks, facilitate purchases (if Stripe is configured), and send transactional
            emails related to your account. We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">3. Payment Processing</h2>
          <p>
            If you make a purchase on PromptVault, payment processing is handled entirely by Stripe.
            We do not store credit card numbers or banking details on our servers. Stripe&apos;s privacy
            policy applies to the payment transaction.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">4. Data Retention</h2>
          <p>
            You may delete your account and associated data at any time through your dashboard.
            Prompt content you have submitted may remain visible to other users after account deletion
            if it was previously published, but it will be anonymized.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">5. Third-Party Services</h2>
          <p>
            PromptVault uses Supabase for database, authentication, and file storage. If enabled, Stripe
            handles payment processing and Sentry handles error monitoring. Each service operates under
            its own privacy policy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">6. Contact</h2>
          <p>
            For questions about this privacy policy, contact the platform administrator at the email
            address listed on the admin account.
          </p>
        </section>
      </div>
    </div>
  )
}
