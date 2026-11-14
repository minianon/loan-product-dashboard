# Loan Picks Dashboard: Low-Level Design

For the big picture see the [High-Level Design](hld.md).

## 1. Database (`scripts/001_create_schema.sql`)

```mermaid
erDiagram
  PRODUCTS ||--o{ AI_CHAT_MESSAGES : about
  USERS ||--o{ AI_CHAT_MESSAGES : writes
  PRODUCTS {
    uuid id PK
    text name
    text bank
    text type
    numeric rate_apr
    numeric min_income
    int min_credit_score
    int tenure_min_months
    int tenure_max_months
    numeric processing_fee_pct
    bool prepayment_allowed
    text disbursal_speed
    text docs_level
    text summary
    jsonb faq
  }
  USERS {
    uuid id PK
    text email
    text display_name
  }
  AI_CHAT_MESSAGES {
    uuid id PK
    uuid user_id FK
    uuid product_id FK
    text role
    text content
  }
```

Row-level security: anyone can read products; users can only read or write their own user row and chat messages. Product types: personal, education, vehicle, home, credit line, debt consolidation. Seed data is in `scripts/002_seed_products.sql`.

## 2. `GET /api/products`

| Query param | Filter |
|---|---|
| `bank` | `ilike %bank%` |
| `minApr`, `maxApr` | `rate_apr` range |
| `minIncome` | products with `min_income ≤` value (you qualify) |
| `minCreditScore` | products with `min_credit_score ≤` value |
| `type` | exact type |
| `limit` | 1–100 |

Results are sorted by APR, lowest first. Params are validated with zod.

## 3. Badges (`getBadges`)

| Badge | Rule |
|---|---|
| Low APR | `rate_apr ≤ 7` |
| No Prepayment Penalty | `prepayment_allowed` |
| Fast Disbursal | `disbursal_speed = fast` |
| Flexible Tenure | max − min tenure ≥ 50 months |
| Low Docs | `docs_level = minimal` |
| Zero Processing Fee | `processing_fee_pct = 0` |
| Salary > ₹nL Eligible | `min_income ≤ 4,00,000` |

## 4. Ask the AI

```mermaid
sequenceDiagram
  actor U as User
  participant D as Chat drawer
  participant A as /api/ai/ask
  participant DB as Supabase
  participant G as Gemini REST
  U->>D: question about a loan
  D->>A: POST { productId, message, history }
  A->>A: validate with zod
  A->>DB: select product by id (404 if missing)
  A->>A: system prompt with product fields + history + question
  A->>G: GET /v1/models (find models that support generateContent)
  loop models, gemini-2.5-flash first
    A->>G: POST /v1/models/{model}:generateContent
  end
  G-->>A: answer
  A-->>D: { answer }
```

The route tries each available model in turn until one succeeds, so the assistant keeps working if a model is retired.
