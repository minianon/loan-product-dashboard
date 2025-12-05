import { createClient } from "@/lib/supabase/server"
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

    // Check for Google AI API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(JSON.stringify({ error: "Google AI API key not configured" }), {
        status: 500,
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
${product.faq.map((item: { q: string; a: string }) => `Q: ${item.q}\nA: ${item.a}`).join("\n")}
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

    // Build conversation history as text
    const historyText = (history || [])
      .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")
    
    // Combine everything into a single prompt
    const fullPrompt = `${systemPrompt}\n\n${historyText ? `Previous conversation:\n${historyText}\n\n` : ""}User: ${message}\nAssistant:`
    
    // Use REST API directly - First, let's list available models
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    
    // Try to list available models first
    let availableModels: string[] = []
    try {
      console.log("Fetching available models...")
      const listResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      )
      if (listResponse.ok) {
        const listData = await listResponse.json()
        if (listData.models) {
          availableModels = listData.models
            .filter((m: { name: string; supportedGenerationMethods?: string[] }) => 
              m.supportedGenerationMethods?.includes("generateContent")
            )
            .map((m: { name: string }) => m.name.replace("models/", ""))
          console.log("Available models:", availableModels)
        }
      }
    } catch (listError) {
      console.log("Could not list models, using defaults:", listError)
    }
    
    // Use available models if found, otherwise try common ones
    // Prioritize gemini-2.5-flash since we know it works with Google AI Studio
    const modelsToTry = availableModels.length > 0 
      ? availableModels.sort((a, b) => {
          // Put gemini-2.5-flash first if available
          if (a.includes("gemini-2.5-flash")) return -1
          if (b.includes("gemini-2.5-flash")) return 1
          return 0
        })
      : ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
    
    let assistantMessage: string | null = null
    let lastError: Error | null = null
    
    for (const modelName of modelsToTry) {
      try {
        // Remove "models/" prefix if present for the API call
        const cleanModelName = modelName.replace("models/", "")
        console.log(`Trying model: ${cleanModelName} with v1 API`)
        
        // Try v1 API endpoint
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${cleanModelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: fullPrompt,
                    },
                  ],
                },
              ],
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            `API returned ${response.status}: ${JSON.stringify(errorData)}`
          )
        }

        const data = await response.json()
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          assistantMessage = data.candidates[0].content.parts[0].text
          console.log(`Success with model: ${cleanModelName}`)
          break
        } else {
          throw new Error("Invalid response format from API")
        }
      } catch (error) {
        lastError = error as Error
        console.error(`Model ${modelName} failed:`, error instanceof Error ? error.message : String(error))
        continue
      }
    }

    if (!assistantMessage) {
      const errorMsg = lastError instanceof Error ? lastError.message : "All models failed"
      console.error("All models failed. Last error:", errorMsg)
      throw new Error(`Failed to generate response: ${errorMsg}`)
    }

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("AI API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate response"
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
    } : String(error)
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorDetails : undefined
      }), 
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
