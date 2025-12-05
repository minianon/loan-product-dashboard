import { createClient } from "@/lib/supabase/server"
import ProductsPage from "@/components/products/products-page"
import type { LoanProduct } from "@/lib/types"

async function getAllProducts(): Promise<LoanProduct[]> {
  const supabase = await createClient()

  const { data: products, error } = await supabase.from("products").select("*").order("rate_apr", { ascending: true })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return products || []
}

export default async function Products() {
  const allProducts = await getAllProducts()

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <ProductsPage allProducts={allProducts} />
    </main>
  )
}
