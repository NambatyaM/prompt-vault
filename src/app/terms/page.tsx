import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PromptVault terms of service — rules for using the platform.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">1. Acceptance of Terms</h2>
          <p>
            By accessing or using PromptVault, you agree to be bound by these Terms of Service. If you
            do not agree, do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">2. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for
            all activity that occurs under your account. You must provide accurate information when
            creating an account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">3. Content Submission</h2>
          <p>
            By submitting a prompt to PromptVault, you represent that the content is your original work
            or that you have the right to share it. You grant PromptVault a non-exclusive, worldwide,
            royalty-free license to display and distribute your submitted content on the platform.
          </p>
          <p className="mt-2">
            Submissions must include genuine proof of outcome. Knowingly submitting false or misleading
            information may result in account suspension or termination.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">4. Purchases</h2>
          <p>
            Premium prompts are sold as digital goods. All sales are final. If you purchase a prompt
            and the content is significantly different from its description, contact the platform
            administrator for resolution.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">5. Prohibited Conduct</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submitting content that violates intellectual property rights</li>
            <li>Falsifying proof of outcome</li>
            <li>Attempting to manipulate votes, bookmarks, or verification signals</li>
            <li>Using the platform for spam, scams, or illegal activity</li>
            <li>Attempting to access other users&apos; accounts or data</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">6. Limitation of Liability</h2>
          <p>
            PromptVault is provided &quot;as is&quot; without warranties of any kind. We are not responsible for
            the accuracy, reliability, or effectiveness of any prompt submitted by users. Results
            described in prompt outcomes are not guaranteed for all users.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">7. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the platform after changes
            constitutes acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  )
}
