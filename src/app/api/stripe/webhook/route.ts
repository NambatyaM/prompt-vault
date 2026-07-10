import { NextResponse } from "next/server"
import { getStripe, isStripeConfigured } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Please set up Stripe keys." },
      { status: 503 },
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 503 },
    )
  }

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const promptId = session.metadata?.prompt_id
    const userId = session.metadata?.user_id

    if (promptId && userId) {
      const supabase = createAdminClient()

      await supabase.from("purchases").insert({
        user_id: userId,
        prompt_id: promptId,
        stripe_session_id: session.id,
        amount: session.amount_total ?? 0,
        status: "completed",
      })
    }
  }

  return NextResponse.json({ received: true })
}
