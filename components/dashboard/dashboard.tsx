"use client"

import { useState } from "react"
import type { LoanProduct } from "@/lib/types"
import ProductCard from "./product-card"
import Navigation from "./navigation"
import ChatDrawer from "./chat-drawer"
import { Badge } from "@/components/ui/badge"

interface DashboardProps {
  topProducts: LoanProduct[]
}

export default function Dashboard({ topProducts }: DashboardProps) {
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null)

  if (topProducts.length === 0) {
    return (
      <div className="p-6">
        <Navigation />
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No loan products available</p>
        </div>
      </div>
    )
  }

  const bestMatch = topProducts[0]
  const otherProducts = topProducts.slice(1)

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Your Personalized Loan Matches</h1>
          <p className="text-lg text-muted-foreground">Discover the best loan products tailored for you</p>
        </div>

        {/* Best Match Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-green-600 hover:bg-green-700 text-white">Best Match</Badge>
            <h2 className="text-2xl font-bold text-foreground">Top Recommended</h2>
          </div>
          <ProductCard product={bestMatch} isBestMatch={true} onAsk={() => setSelectedProduct(bestMatch)} />
        </div>

        {/* Other Top Products */}
        {otherProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Other Top Picks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {otherProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isBestMatch={false}
                  onAsk={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Drawer */}
      <ChatDrawer product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}
