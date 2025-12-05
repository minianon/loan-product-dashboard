"use client"

import type { LoanProduct } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBadges, getTypeLabel } from "@/lib/utils/badge-logic"
import { MessageCircle } from "lucide-react"

interface ProductCardProps {
  product: LoanProduct
  isBestMatch: boolean
  onAsk: () => void
}

export default function ProductCard({ product, isBestMatch, onAsk }: ProductCardProps) {
  const badges = getBadges(product)

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-lg ${
        isBestMatch ? "border-2 border-green-600 shadow-lg" : ""
      }`}
    >
      {isBestMatch && (
        <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 text-sm font-semibold rounded-bl-lg">
          Best Match
        </div>
      )}

      <CardHeader className={isBestMatch ? "pb-3" : ""}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{product.name}</CardTitle>
            <CardDescription className="text-base">{product.bank}</CardDescription>
          </div>
          <Badge variant="outline" className="ml-2 whitespace-nowrap">
            {getTypeLabel(product.type)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        {product.summary && <p className="text-sm text-muted-foreground line-clamp-2">{product.summary}</p>}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-accent/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-medium">APR Rate</p>
            <p className="text-lg font-bold text-foreground">{product.rate_apr}%</p>
          </div>
          <div className="bg-accent/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-medium">Processing Fee</p>
            <p className="text-lg font-bold text-foreground">{product.processing_fee_pct}%</p>
          </div>
          <div className="bg-accent/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-medium">Min Credit Score</p>
            <p className="text-lg font-bold text-foreground">{product.min_credit_score}</p>
          </div>
          <div className="bg-accent/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-medium">Tenure</p>
            <p className="text-lg font-bold text-foreground">
              {product.tenure_min_months}-{product.tenure_max_months} mo
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {badges.map((badge) => (
            <Badge key={badge} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>

        {/* CTA Button */}
        <Button onClick={onAsk} className="w-full bg-primary hover:bg-primary/90 text-white mt-4" size="lg">
          <MessageCircle className="w-4 h-4 mr-2" />
          Ask About Product
        </Button>
      </CardContent>
    </Card>
  )
}
