import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getStripe, isStripeConfigured } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Please set up Stripe keys." },
        { status: 503 },
      )
    }

    const { promptId } = await req.json()

    const { data: promptRows, error: promptError } = await supabase
      .from("prompts")
      .select("id, title, slug, price, is_premium, user_id")
      .eq("id", promptId)
      .limit(1)

    const prompt = promptRows?.[0]

    if (promptError || !prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    if (!prompt.is_premium) {
      return NextResponse.json({ error: "Prompt is not premium" }, { status: 400 })
    }

    if (prompt.price === null || prompt.price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    const { data: existingRows } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("prompt_id", promptId)
      .eq("status", "completed")
      .limit(1)

    if (existingRows?.[0]) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: prompt.title,
            },
            unit_amount: prompt.price,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email ?? undefined,
      metadata: {
        prompt_id: promptId,
        user_id: user.id,
      },
      success_url: `${req.headers.get("origin") ?? "http://localhost:3000"}/prompt/${prompt.slug}?purchased=true`,
      cancel_url: `${req.headers.get("origin") ?? "http://localhost:3000"}/prompt/${prompt.slug}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
