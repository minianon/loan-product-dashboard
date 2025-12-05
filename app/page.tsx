import { createClient } from "@/lib/supabase/server"
import Dashboard from "@/components/dashboard/dashboard"
import type { LoanProduct } from "@/lib/types"

async function getTopProducts(): Promise<LoanProduct[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("rate_apr", { ascending: true })
    .limit(5)

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return products || []
}

export default async function Home() {
  const topProducts = await getTopProducts()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Dashboard topProducts={topProducts} />
    </main>
  )
}
