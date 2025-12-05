import type { LoanProduct } from "@/lib/types"

export function getBadges(product: LoanProduct): string[] {
  const badges: string[] = []

  // APR-based badges
  if (product.rate_apr <= 7) {
    badges.push("Low APR")
  }

  // Prepayment badge
  if (product.prepayment_allowed) {
    badges.push("No Prepayment Penalty")
  }

  // Disbursal speed badge
  if (product.disbursal_speed === "fast") {
    badges.push("Fast Disbursal")
  }

  // Tenure flexibility
  if (product.tenure_max_months - product.tenure_min_months >= 50) {
    badges.push("Flexible Tenure")
  }

  // Documentation badge
  if (product.docs_level === "minimal") {
    badges.push("Low Docs")
  }

  // Fee badge
  if (product.processing_fee_pct === 0) {
    badges.push("Zero Processing Fee")
  }

  // Income eligibility badge
  if (product.min_income <= 400000) {
    badges.push(`Salary > ₹${(product.min_income / 100000).toFixed(0)}L Eligible`)
  }

  // Credit score badge
  if (product.min_credit_score <= 700) {
    badges.push(`Credit Score ≥ ${product.min_credit_score}`)
  }

  return badges.slice(0, 5) // Return max 5 badges
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    personal: "Personal Loan",
    education: "Education Loan",
    vehicle: "Vehicle Loan",
    home: "Home Loan",
    credit_line: "Credit Line",
    debt_consolidation: "Debt Consolidation",
  }
  return labels[type] || type
}
