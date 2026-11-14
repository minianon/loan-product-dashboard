# Loan Picks Dashboard
<img width="1916" height="967" alt="image" src="https://github.com/user-attachments/assets/12f73b99-9621-433e-b75f-22e67850c25f" />

A modern Next.js web application for exploring personalized loan products with an AI-powered chat assistant.


## Table of Contents

- [Demo Video](#demo-video)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Diagram](#architecture-diagram)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#step-1-clone-the-repository)
  - [Install Dependencies](#step-2-install-dependencies)
  - [Set Up Supabase](#step-3-set-up-supabase)
  - [Get Google AI API Key](#step-4-get-google-ai-studio-api-key)
  - [Configure Environment Variables](#step-5-configure-environment-variables)
  - [Run Development Server](#step-6-run-the-development-server)
  - [Deploy to Vercel](#step-7-deploy-to-vercel)
- [Badge Logic](#badge-logic)
  - [Badge Rules](#badge-rules)
  - [Implementation](#implementation)
- [AI Grounding Strategy](#ai-grounding-strategy)
  - [Product Context Fetching](#1-product-context-fetching)
  - [System Prompt Construction](#2-system-prompt-construction)
  - [Message History Management](#3-message-history-management)
  - [API Request Flow](#4-api-request-flow)
  - [Google Gemini Integration](#5-google-gemini-integration)
  - [Fail-Safe Mechanism](#6-fail-safe-mechanism)
  - [Response Validation](#7-response-validation)
- [Usage](#usage)
  - [Dashboard](#dashboard)
  - [All Products](#all-products)
  - [AI Chat](#ai-chat)
  - [Authentication](#authentication)
- [API Routes](#api-routes)
  - [GET /api/products](#get-apiproducts)
  - [POST /api/ai/ask](#post-apiaisk)
- [Data Model](#data-model)
  - [Products Table](#products-table)
  - [Users Table](#users-table)
  - [AI Chat Messages Table](#ai-chat-messages-table)
  - [RLS Policies](#rls-policies)
- [Performance Optimizations](#performance-optimizations)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)
- [Support](#support)
- [Contact](#contact)

## Demo Video
See Live Demo - [Click Me!](https://www.loom.com/share/4ff163d6c6614201b2ab6dc428fe9ba9)

## Features

- **Personalized Dashboard**: View your top 5 loan product matches with the best match highlighted
- **Dynamic Badges**: Smart badge system that highlights key product features (3-5 badges per product)
- **Product Filtering**: Browse all loan products with filters for bank, APR range, minimum income, and credit score
- **AI Chat Assistant**: Ask questions about any loan product with grounded, product-specific answers
- **Secure Authentication**: Email/password authentication with Supabase - all routes are protected and require login
- **Responsive Design**: Fully responsive UI built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode, no `any` types)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with JWT
- **Validation**: Zod
- **AI**: Google Gemini 2.5 Flash (via REST API)
- **Deployment**: Vercel

## Architecture Diagram

<img width="1538" height="836" alt="supabase-schema-xjebhrdycmairluhojtn" src="https://github.com/user-attachments/assets/6b6bb354-b78a-4f6d-b6d4-2972bc39f762" />

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────────────────┐  │
│  │  Dashboard   │   │ All Products │  │   AI Chat Drawer     │  │
│  │  (Top 5)     │   │   (Filter)   │  │   (Product Context)  │  │
│  └──────┬───────┘   └──────┬───────┘  └──────────┬───────────┘  │
│         │                  │                     │              │
│         └──────────────────┼─────────────────────┘              │
│                            │                                    │
│                    ┌───────▼────────┐                           │
│                    │  Navigation    │                           │
│                    └───────┬────────┘                           │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Next.js App Router                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐        ┌───────────────────┐              │
│  │  Server Pages    │        │   API Routes      │              │
│  │  • / (Dashboard) │        │   • /api/products │              │
│  │  • /products     │        │   • /api/ai/ask   │              │
│  │  • /auth/*       │        └─────────┬─────────┘              │
│  └──────────────────┘                  │                        │
└────────────────────────────────────────┼────────────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────┐
│                             API Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  GET /api/products                                      │    │ 
│  │  • Zod validation for query params                      │    │
│  │  • Filters: bank, APR, income, credit score, type       │    │
│  │  • Returns filtered product list                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  POST /api/ai/ask                                        │   │
│  │  • Zod validation for request body                       │   │
│  │  • Fetches product details from database                 │   │
│  │  • Builds system prompt with product context             │   │
│  │  • Calls Google Gemini API with grounded data            │   │
│  │  • Returns AI response                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────┐
│                    Data & External Services                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐          │
│  │   Supabase/Postgres  │      │   Google Gemini AI   │          │
│  │                      │      │                      │          │
│  │  • products table    │      │  • gemini-2.5-flash  │          │
│  │  • users table       │      │  • REST API v1       │          │
│  │  • ai_chat_messages  │      │  • Product-grounded  │          │
│  │  • RLS policies      │      │    responses         │          │
│  └──────────────────────┘      └──────────────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Authentication (Supabase Auth)                          │    │
│  │  • JWT-based sessions                                    │    │
│  │  • Email/password                                        │    │
│  │  • Session management via middleware                     │    │
│  │  • All routes protected (require authentication)        │    │
│  │  • Automatic redirect to login for unauthenticated users │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘

Data Flow:
1. User requests dashboard → Server fetches top 5 products from DB
2. User clicks "Ask About Product" → Opens chat drawer
3. User sends message → POST /api/ai/ask
4. API fetches product details → Builds context prompt
5. API calls Google Gemini → Returns grounded response
6. Response displayed in chat drawer
```


## Setup Instructions

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm** or **pnpm**: Package manager
- **Supabase Account**: Free account at [supabase.com](https://supabase.com)
- **Google AI Studio API Key**: Get free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd loan-product-dashboard
```

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

### Step 3: Set Up Supabase

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details and wait for setup to complete

2. **Get Your Credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon public` key
   - Go to Project Settings → Database
   - Copy your `Connection string` (optional, for direct PostgreSQL access)

3. **Configure Authentication Redirect URLs** (Important for email verification):
   - Go to Project Settings → Authentication → URL Configuration
   - Set **Site URL** to your production URL: `https://v0-loan-product-dashboard-pi.vercel.app`
   - Add to **Redirect URLs**:
     - `https://v0-loan-product-dashboard-pi.vercel.app/auth/confirm`
     - `http://localhost:3000/auth/confirm` (for local development)
   - This ensures email verification links work in both development and production
   - **Note**: Make sure your email templates use the correct placeholders. The confirmation email should include `{{ .ConfirmationURL }}` to generate valid verification links

4. **Run Database Migrations**:
   - In Supabase Dashboard, go to SQL Editor
   - Run `scripts/001_create_schema.sql` to create tables and RLS policies
   - Run `scripts/002_seed_products.sql` to seed 12 sample loan products

### Step 4: Get Google AI Studio API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (starts with `AIza...`)

### Step 6: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google AI API Key (for AI chat features)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# Optional: Direct PostgreSQL connection
POSTGRES_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Next.js App URL (for email verification)
# Local: http://localhost:3000
# Production: https://v0-loan-product-dashboard-pi.vercel.app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: 
- Never commit `.env.local` to version control. It's already in `.gitignore`.
- For production deployment on Vercel, set `NEXT_PUBLIC_APP_URL` to your production URL (`https://v0-loan-product-dashboard-pi.vercel.app`) in Vercel environment variables.
- Make sure to configure Supabase redirect URLs in Step 3 above.
- For production deployment on Vercel, set `NEXT_PUBLIC_APP_URL` to your production URL in Vercel environment variables.
- Make sure to configure Supabase redirect URLs (see Step 3 above).

### Step 7: Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 7: Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `GOOGLE_GENERATIVE_AI_API_KEY`
   - Click "Deploy"

3. **Verify Deployment**:
   - Visit your Vercel deployment URL
   - Test the dashboard and AI chat functionality

## Badge Logic

The application automatically displays **3-5 dynamic badges** for each loan product card based on product attributes. Badges are calculated in `lib/utils/badge-logic.ts`.

### Badge Rules

| Badge | Condition | Priority |
|-------|-----------|----------|
| **Low APR** | `rate_apr ≤ 7%` | High |
| **No Prepayment Penalty** | `prepayment_allowed === true` | High |
| **Fast Disbursal** | `disbursal_speed === "fast"` | Medium |
| **Flexible Tenure** | `(tenure_max_months - tenure_min_months) ≥ 50` | Medium |
| **Low Docs** | `docs_level === "minimal"` | Medium |
| **Zero Processing Fee** | `processing_fee_pct === 0` | High |
| **Salary Eligible** | `min_income ≤ ₹400,000` | Low |
| **Credit Score** | `min_credit_score ≤ 700` | Low |

### Implementation

```typescript
export function getBadges(product: LoanProduct): string[] {
  const badges: string[] = []
  
  if (product.rate_apr <= 7) badges.push("Low APR")
  if (product.prepayment_allowed) badges.push("No Prepayment Penalty")
  if (product.disbursal_speed === "fast") badges.push("Fast Disbursal")
  // ... more conditions
  
  return badges.slice(0, 5) // Maximum 5 badges per product
}
```

### Badge Display

- Badges appear below the product metrics
- Displayed as secondary variant badges
- Automatically wraps on smaller screens
- Maximum of 5 badges shown per product

## AI Grounding Strategy

The AI chat assistant uses a **strict grounding approach** to ensure all responses are based solely on the selected loan product's data.

### 1. Product Context Fetching

When a user clicks "Ask About Product", the system:

```typescript
// Fetches complete product details from database
const product = await supabase
  .from("products")
  .select("*")
  .eq("id", productId)
  .single()
```

### 2. System Prompt Construction

The system builds a comprehensive prompt including:

- **Product Information**: Name, bank, type, APR, income requirements, credit score, tenure
- **Financial Details**: Processing fee, prepayment policy, disbursal speed
- **Documentation**: Documentation level, summary
- **FAQs**: Pre-defined questions and answers from the database
- **Guidelines**: Strict instructions to only answer based on provided data

```typescript
const systemPrompt = `You are a helpful loan product assistant. 
You have access to detailed information about a specific loan product 
and should only answer questions based on this product data.

Product Information:
- Name: ${product.name}
- Bank: ${product.bank}
- APR Rate: ${product.rate_apr}%
- Minimum Income: ₹${product.min_income}
- Minimum Credit Score: ${product.min_credit_score}
// ... more fields

Guidelines:
1. Only answer questions related to this loan product
2. Provide specific facts from the product information provided
3. If a question is outside the scope, politely redirect the user
4. Be helpful, professional, and concise
5. Always cite specific product features when relevant`
```

### 3. Message History Management

- Conversation history is maintained in the chat drawer
- Each message includes role (`user` or `assistant`) and content
- History is sent with each API request for context
- Allows for follow-up questions and natural conversation flow

### 4. API Request Flow

```typescript
POST /api/ai/ask
{
  "productId": "uuid",
  "message": "What is the minimum credit score?",
  "history": [
    { "role": "user", "content": "Tell me about this loan" },
    { "role": "assistant", "content": "This is a personal loan..." }
  ]
}
```

### 5. Google Gemini Integration

- **Model**: `gemini-2.5-flash` (optimized for Google AI Studio)
- **API Version**: v1 (stable REST API)
- **Method**: Direct REST API calls (not SDK) for better control
- **Fallback**: Tries multiple models if primary fails

### 6. Fail-Safe Mechanism

If a question is outside the product scope:

1. The system prompt explicitly instructs the AI to redirect
2. The AI responds with: *"I can only answer questions about [Product Name]. Could you ask something specific about this loan product?"*
3. Error handling catches API failures and displays user-friendly messages

### 7. Response Validation

- All responses are validated before display
- Error states are handled gracefully
- Loading states provide user feedback
- Conversation history is preserved on errors

## Usage

### Dashboard

1. Navigate to `/` to see your top 5 personalized loan matches
2. The **"Best Match"** card is highlighted with a green border and badge
3. Click **"Ask About Product"** on any card to open the AI chat
4. Browse product details: APR, processing fee, credit score, tenure

### All Products

1. Go to `/products` to browse all available loan products
2. Use the sidebar filters:
   - **Search Bank**: Type bank name to filter
   - **APR Range**: Drag slider to set min/max APR
   - **Min Income**: Set minimum income requirement
   - **Min Credit Score**: Set minimum credit score
3. Click **"Reset Filters"** to clear all filters
4. Click **"Ask About Product"** on any product card

### AI Chat

1. Click **"Ask About Product"** from any loan card
2. A chat drawer opens on the right side (full screen on mobile)
3. The drawer shows:
   - Product name, bank, and type
   - Key metrics (APR, credit score)
   - Chat interface
4. Ask questions like:
   - "What is the minimum credit score?"
   - "Can I prepay this loan?"
   - "What documents do I need?"
   - "What is the processing fee?"
5. The AI provides answers based solely on that product's data
6. Click the X button (top right) to close the chat

### Authentication

**All routes are protected** - Users must be authenticated to access the dashboard, products page, or any other content.

- **Protected Routes**: `/` (dashboard) and `/products` require authentication
- **Public Routes**: `/auth/login`, `/auth/signup`, `/auth/verify-email` are accessible without login
- **Auto-Redirect**: Unauthenticated users are automatically redirected to login page
- **Post-Login Redirect**: After successful login, users are redirected back to the page they originally tried to access
- **Sign Up**: Navigate to `/auth/signup` or click "Sign Up" in navigation
- **Sign In**: Navigate to `/auth/login` or click "Sign In" in navigation (or automatically redirected)
- **Sign Out**: Click "Sign Out" in navigation (visible when logged in)
- **Email Verification**: Check your email for verification link after signup
- **Session Management**: Automatic via Supabase middleware with JWT tokens
- **Navigation**: Shows Sign In/Sign Up when logged out, Sign Out when logged in

**Testing Authentication**:
1. Open an incognito/private window
2. Visit `http://localhost:3000/` or `http://localhost:3000/products`
3. You should be automatically redirected to `/auth/login`
4. After logging in, you'll be redirected back to the original page

## API Routes

### GET /api/products

Fetch all loan products with optional filters.

**Query Parameters:**
- `bank` (string, optional): Filter by bank name (case-insensitive partial match)
- `minApr` (number, optional): Minimum APR rate
- `maxApr` (number, optional): Maximum APR rate
- `minIncome` (number, optional): Maximum minimum income (products with min_income <= value)
- `minCreditScore` (number, optional): Maximum minimum credit score (products with min_credit_score <= value)
- `type` (enum, optional): Filter by loan type (`personal`, `education`, `vehicle`, `home`, `credit_line`, `debt_consolidation`)
- `limit` (number, optional): Maximum number of results (1-100, default: all)

**Example:**
```bash
GET /api/products?minApr=6&maxApr=8&minIncome=500000&limit=10
```

**Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Quick Personal Loan",
      "bank": "HDFC Bank",
      "type": "personal",
      "rate_apr": 7.5,
      "min_income": 300000,
      "min_credit_score": 650,
      "tenure_min_months": 6,
      "tenure_max_months": 60,
      "processing_fee_pct": 0.5,
      "prepayment_allowed": true,
      "disbursal_speed": "fast",
      "docs_level": "minimal",
      "summary": "Quick approval personal loan...",
      "faq": [{"q": "...", "a": "..."}]
    }
  ]
}
```

### POST /api/ai/ask

Ask questions about a specific loan product using AI.

**Request Body:**
```json
{
  "productId": "uuid",
  "message": "What is the minimum credit score?",
  "history": [
    { "role": "user", "content": "Tell me about this loan" },
    { "role": "assistant", "content": "This is a personal loan..." }
  ]
}
```

**Response:**
```json
{
  "message": "The minimum credit score for this product is 650."
}
```

**Error Response:**
```json
{
  "error": "Product not found"
}
```

## Data Model

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN 
    ('personal','education','vehicle','home','credit_line','debt_consolidation')),
  rate_apr NUMERIC NOT NULL,
  min_income NUMERIC NOT NULL,
  min_credit_score INT NOT NULL,
  tenure_min_months INT DEFAULT 6,
  tenure_max_months INT DEFAULT 60,
  processing_fee_pct NUMERIC DEFAULT 0,
  prepayment_allowed BOOLEAN DEFAULT TRUE,
  disbursal_speed TEXT DEFAULT 'standard',
  docs_level TEXT DEFAULT 'standard',
  summary TEXT,
  faq JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### AI Chat Messages Table

```sql
CREATE TABLE ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### RLS Policies

- **Products**: Public read access (everyone can view)
- **Users**: Users can only access their own data
- **Chat Messages**: Users can only access their own messages

## Performance Optimizations

1. **Server Components**: Dashboard uses server components for initial data fetch
2. **Edge Caching**: Products are cached at the edge via Next.js
3. **Lazy Loading**: Chat component loads only when "Ask" is clicked
4. **Database Indexes**: Indexes on frequently filtered columns (type, bank, rate_apr)
5. **Optimized Queries**: Efficient filtering and pagination

## Future Enhancements

- User preference profiles to improve personalization
- Loan comparison tool (side-by-side comparison)
- Application tracking for submitted loans
- Loan calculator (EMI, interest calculations)
- Email notifications for rate changes
- Admin dashboard for product management
- Social proof (customer reviews/ratings)
- Advanced filtering (loan amount, purpose)
- Saved searches and favorites

## Troubleshooting

### Chat Not Working

1. Check `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
2. Verify API key is valid in Google AI Studio
3. Check browser console for errors
4. Ensure product data exists in database

### Database Connection Issues

1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is active
3. Ensure RLS policies are set correctly
4. Run database migrations again

### Build Errors

1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run lint`

## Support

For issues or questions:
- Create an issue in the repository
- Check existing issues for solutions
- Review the documentation above


## Contact

**Find me everywhere →** [link.minianon.in/tusharbhardwaj](https://link.minianon.in/tusharbhardwaj)

If my work helps you, you can support it on [GitHub Sponsors](https://github.com/sponsors/minianon) · [Buy me a chai](https://buymeachai.ezee.li/minianon).

---

**Built with ❤️ using Next.js, Supabase, and Google Gemini**

## Design docs

| Doc | What's inside |
|---|---|
| [High-Level Design](docs/hld.md) | Architecture, components, data flow, tech choices, deployment |
| [Low-Level Design](docs/lld.md) | Modules, data models, APIs and functions, key sequences |

