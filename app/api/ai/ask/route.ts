import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { z } from "zod"

const requestSchema = z.object({
  productId: z.string().uuid(),
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, message, history } = requestSchema.parse(body)

    // Fetch the product details
    const supabase = await createClient()
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Build the system prompt with product context
    const systemPrompt = `You are a helpful loan product assistant. You have access to detailed information about a specific loan product and should only answer questions based on this product data.

Product Information:
- Name: ${product.name}
- Bank: ${product.bank}
- Type: ${product.type}
- APR Rate: ${product.rate_apr}%
- Minimum Income: ₹${product.min_income}
- Minimum Credit Score: ${product.min_credit_score}
- Tenure: ${product.tenure_min_months}-${product.tenure_max_months} months
- Processing Fee: ${product.processing_fee_pct}%
- Prepayment Allowed: ${product.prepayment_allowed ? "Yes" : "No"}
- Disbursal Speed: ${product.disbursal_speed}
- Documentation Level: ${product.docs_level}
- Summary: ${product.summary}
${
  product.faq && product.faq.length > 0
    ? `
FAQs:
${product.faq.map((item: any) => `Q: ${item.q}\nA: ${item.a}`).join("\n")}
`
    : ""
}

Guidelines:
1. Only answer questions related to this loan product
2. Provide specific facts from the product information provided
3. If a question is outside the scope of this product, politely redirect the user
4. Be helpful, professional, and concise
5. Always cite specific product features when relevant
6. If you don't have information to answer a question, say so honestly`

    // Call the AI API with context
    const { text: assistantMessage } = await generateText({
      model: "openai/gpt-4-mini",
      system: systemPrompt,
      messages: [...(history || []), { role: "user" as const, content: message }],
    })

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("AI API error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
