"use client"

import { useState, useMemo } from "react"
import type { LoanProduct } from "@/lib/types"
import ProductCard from "@/components/dashboard/product-card"
import Navigation from "@/components/dashboard/navigation"
import ChatDrawer from "@/components/dashboard/chat-drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"

interface ProductsPageProps {
  allProducts: LoanProduct[]
}

export default function ProductsPage({ allProducts }: ProductsPageProps) {
  const [searchBank, setSearchBank] = useState("")
  const [aprRange, setAprRange] = useState([0, 15])
  const [minIncome, setMinIncome] = useState(0)
  const [minCreditScore, setMinCreditScore] = useState(0)

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesBank = product.bank.toLowerCase().includes(searchBank.toLowerCase())
      const matchesApr = product.rate_apr >= aprRange[0] && product.rate_apr <= aprRange[1]
      const matchesIncome = product.min_income >= minIncome
      const matchesCredit = product.min_credit_score >= minCreditScore

      return matchesBank && matchesApr && matchesIncome && matchesCredit
    })
  }, [searchBank, aprRange, minIncome, minCreditScore, allProducts])

  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null)

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">All Loan Products</h1>
          <p className="text-lg text-muted-foreground">Browse and compare {allProducts.length} loan products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-foreground">Filters</h2>

              {/* Bank Search */}
              <div className="mb-6">
                <Label htmlFor="bank-search" className="text-sm font-semibold mb-2 block">
                  Search Bank
                </Label>
                <Input
                  id="bank-search"
                  placeholder="e.g., HDFC, ICICI"
                  value={searchBank}
                  onChange={(e) => setSearchBank(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* APR Range */}
              <div className="mb-6">
                <Label className="text-sm font-semibold mb-3 block">
                  APR Range: {aprRange[0]}% - {aprRange[1]}%
                </Label>
                <Slider min={0} max={15} step={0.5} value={aprRange} onValueChange={setAprRange} className="w-full" />
              </div>

              {/* Min Income */}
              <div className="mb-6">
                <Label htmlFor="min-income" className="text-sm font-semibold mb-2 block">
                  Min Income: ₹{(minIncome / 100000).toFixed(1)}L
                </Label>
                <Slider
                  min={0}
                  max={1000000}
                  step={50000}
                  value={[minIncome]}
                  onValueChange={(value) => setMinIncome(value[0])}
                  className="w-full"
                />
              </div>

              {/* Min Credit Score */}
              <div className="mb-6">
                <Label htmlFor="min-credit" className="text-sm font-semibold mb-2 block">
                  Min Credit Score: {minCreditScore}
                </Label>
                <Slider
                  min={300}
                  max={900}
                  step={10}
                  value={[minCreditScore]}
                  onValueChange={(value) => setMinCreditScore(value[0])}
                  className="w-full"
                />
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSearchBank("")
                  setAprRange([0, 15])
                  setMinIncome(0)
                  setMinCreditScore(0)
                }}
                className="w-full px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
              >
                Reset Filters
              </button>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-lg text-muted-foreground">No products match your filters</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isBestMatch={false}
                    onAsk={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Drawer */}
      <ChatDrawer product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}
