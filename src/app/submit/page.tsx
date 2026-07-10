import type { Metadata } from "next"
import { SubmitForm } from "@/components/prompts/submit-form"

export const metadata: Metadata = {
  title: "Submit a Prompt",
  description: "Share your proven AI prompt with the community.",
}

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Submit a Prompt</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Share a prompt that produced real results. Every submission must include proof.
        </p>
      </div>
      <SubmitForm />
    </div>
  )
}
