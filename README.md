# Loan Picks Dashboard

A modern Next.js web application for exploring personalized loan products with an AI-powered chat assistant.

## Features

- **Personalized Dashboard**: View your top 5 loan product matches with the best match highlighted
- **Dynamic Badges**: Smart badge system that highlights key product features
- **Product Filtering**: Browse all loan products with filters for bank, APR range, minimum income, and credit score
- **AI Chat Assistant**: Ask questions about any loan product with grounded, product-specific answers
- **Secure Authentication**: Email/password authentication with Supabase
- **Responsive Design**: Fully responsive UI built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **AI**: Vercel AI SDK with OpenAI GPT-4
- **Deployment**: Vercel

## Architecture

\`\`\`
┌─────────────────────────────────────────────┐
│          Next.js Frontend                   │
├─────────────────────────────────────────────┤
│ • Dashboard (Top 5 Products)                │
│ • All Products Page (Filterable)            │
│ • AI Chat Drawer Component                  │
│ • Auth Pages (Login/Signup)                 │
├─────────────────────────────────────────────┤
│          API Routes                         │
├─────────────────────────────────────────────┤
│ • POST /api/ai/ask (Product Q&A)            │
├─────────────────────────────────────────────┤
│          Data Layer                         │
├─────────────────────────────────────────────┤
│ • Products Table (loan product catalog)     │
│ • Users Table (user profiles)               │
│ • AI Chat Messages (conversation history)   │
├─────────────────────────────────────────────┤
│          Supabase (PostgreSQL + Auth)       │
└─────────────────────────────────────────────┘
\`\`\`

## Badge Logic

The dashboard automatically displays 3-5 dynamic badges for each product based on attributes:

- **Low APR**: Applied when APR ≤ 7%
- **No Prepayment Penalty**: Applied when prepayment is allowed
- **Fast Disbursal**: Applied for fast disbursal speed
- **Flexible Tenure**: Applied when tenure range ≥ 50 months
- **Low Docs**: Applied for minimal documentation requirements
- **Zero Processing Fee**: Applied when processing fee is 0%
- **Salary Eligible**: Applied when min income ≤ ₹4L
- **Credit Score**: Applied when min credit score ≤ 700

## AI Grounding Strategy

The AI chat assistant uses a strict grounding approach:

1. **Product Context**: When a user asks about a product, the system fetches complete product details (name, bank, rates, eligibility, FAQs, etc.)
2. **System Prompt**: The AI receives a detailed system prompt that includes all product information and instructions to only answer based on this data
3. **Message History**: Conversation history is maintained to provide context for follow-up questions
4. **Fail-Safe**: If a question is outside the product scope, the AI politely redirects the user

Example AI Request:
\`\`\`
POST /api/ai/ask
{
  "productId": "uuid-here",
  "message": "What's the minimum credit score?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key (for AI features)

### 1. Clone and Install
\`\`\`bash
git clone <your-repo>
cd loan-dashboard
npm install
\`\`\`

### 2. Set Up Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. In v0, connect your Supabase integration

### 3. Run Database Scripts
Execute the SQL scripts in order:
1. `scripts/001_create_schema.sql` - Creates tables and RLS policies
2. `scripts/002_seed_products.sql` - Seeds 12 loan products

### 4. Environment Variables
Set in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `POSTGRES_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - For AI chat features

### 5. Run Locally
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the dashboard.

### 6. Deploy to Vercel
\`\`\`bash
vercel deploy
\`\`\`

## Usage

### Dashboard
1. Navigate to `/` to see your top 5 personalized loan matches
2. The "Best Match" card is highlighted and shows your top recommendation
3. Click "Ask About Product" on any card to open the AI chat

### All Products
1. Go to `/products` to browse all available loan products
2. Use filters to narrow down options:
   - Search by bank name
   - Filter by APR range
   - Set minimum income requirement
   - Set minimum credit score

### AI Chat
1. Click "Ask About Product" from any loan card
2. A chat drawer opens on the right side (bottom on mobile)
3. Ask any question about the loan product
4. The AI provides answers based solely on that product's data

### Authentication
- Sign up with email and password
- Verify email address via confirmation link
- Log in to access personalized features
- Optional: Add authentication middleware to protect routes

## Data Model

### Products Table
\`\`\`sql
id (UUID) - Primary key
name (TEXT) - Product name
bank (TEXT) - Bank/lender name
type (TEXT) - Loan type enum
rate_apr (NUMERIC) - Annual percentage rate
min_income (NUMERIC) - Minimum income requirement
min_credit_score (INT) - Minimum credit score
tenure_min_months (INT) - Minimum loan tenure
tenure_max_months (INT) - Maximum loan tenure
processing_fee_pct (NUMERIC) - Processing fee percentage
prepayment_allowed (BOOLEAN) - Prepayment penalty status
disbursal_speed (TEXT) - 'fast' or 'standard'
docs_level (TEXT) - 'minimal', 'standard', or 'detailed'
summary (TEXT) - Product description
faq (JSONB) - Array of {q, a} objects
\`\`\`

### RLS Policies
- **Products**: Public read access (everyone can view)
- **Users**: Users can only access their own data
- **Chat Messages**: Users can only access their own messages

## Performance Optimizations

1. **Server Components**: Dashboard uses server components for initial data fetch
2. **Caching**: Products are cached at the edge
3. **Lazy Chat Loading**: Chat component loads only when "Ask" is clicked
4. **Indexed Queries**: Database indexes on frequently filtered columns

## Future Enhancements

- User preference profiles to improve personalization
- Loan comparison tool side-by-side
- Application tracking for submitted loans
- Loan calculator
- Email notifications for rate changes
- Admin dashboard for product management
- Social proof (customer reviews/ratings)

## Support

For issues or questions, create an issue in the repository or contact support at [your-email].

---

Built with ❤️ using Next.js and Supabase
