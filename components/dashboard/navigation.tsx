"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl text-foreground">
            Loan Picks
          </Link>

          <div className="flex gap-3">
            <Link href="/products">
              <Button variant="ghost">All Products</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
