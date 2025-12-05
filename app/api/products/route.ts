import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import type { NextRequest } from "next/server"

const querySchema = z.object({
  bank: z.string().optional(),
  minApr: z.coerce.number().optional(),
  maxApr: z.coerce.number().optional(),
  minIncome: z.coerce.number().optional(),
  minCreditScore: z.coerce.number().optional(),
  type: z
    .enum(["personal", "education", "vehicle", "home", "credit_line", "debt_consolidation"])
    .optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    // Parse and validate query parameters
    const query = querySchema.parse({
      bank: searchParams.get("bank") || undefined,
      minApr: searchParams.get("minApr") || undefined,
      maxApr: searchParams.get("maxApr") || undefined,
      minIncome: searchParams.get("minIncome") || undefined,
      minCreditScore: searchParams.get("minCreditScore") || undefined,
      type: searchParams.get("type") || undefined,
      limit: searchParams.get("limit") || undefined,
    })

    // Build query
    let queryBuilder = supabase.from("products").select("*")

    // Apply filters
    if (query.bank) {
      queryBuilder = queryBuilder.ilike("bank", `%${query.bank}%`)
    }

    if (query.minApr !== undefined) {
      queryBuilder = queryBuilder.gte("rate_apr", query.minApr)
    }

    if (query.maxApr !== undefined) {
      queryBuilder = queryBuilder.lte("rate_apr", query.maxApr)
    }

    if (query.minIncome !== undefined) {
      queryBuilder = queryBuilder.lte("min_income", query.minIncome)
    }

    if (query.minCreditScore !== undefined) {
      queryBuilder = queryBuilder.lte("min_credit_score", query.minCreditScore)
    }

    if (query.type) {
      queryBuilder = queryBuilder.eq("type", query.type)
    }

    // Order by APR (ascending)
    queryBuilder = queryBuilder.order("rate_apr", { ascending: true })

    // Apply limit
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit)
    }

    const { data: products, error } = await queryBuilder

    if (error) {
      console.error("Error fetching products:", error)
      return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ products: products || [] }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Invalid query parameters", details: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.error("API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

