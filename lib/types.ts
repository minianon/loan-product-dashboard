export type LoanProduct = {
  id: string
  name: string
  bank: string
  type: "personal" | "education" | "vehicle" | "home" | "credit_line" | "debt_consolidation"
  rate_apr: number
  min_income: number
  min_credit_score: number
  tenure_min_months: number
  tenure_max_months: number
  processing_fee_pct: number
  prepayment_allowed: boolean
  disbursal_speed: "fast" | "standard"
  docs_level: "minimal" | "standard" | "detailed"
  summary: string
  faq: Array<{ q: string; a: string }>
  created_at: string
}

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type User = {
  id: string
  email: string
  display_name: string
}
