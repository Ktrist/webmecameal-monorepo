# Webmecameal - Meal Subscription Platform

A full-stack meal subscription platform similar to Quitoque, allowing users to browse weekly meal menus, place orders, and manage subscriptions with integrated payment processing.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend**: Strapi v5 CMS (Headless CMS) for content management
- **Frontend**: React 18 + Vite SPA with Chakra UI
- **Services**:
  - Supabase (Authentication & Database)
  - Stripe (Payment processing)
  - Supabase Edge Functions (Deno runtime)

## 📋 Prerequisites

- Node.js >= 20.0.0 (recommended: 20.x LTS)
- npm >= 6.0.0
- Supabase account and project
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd webmecameal-monorepo
```

### 2. Backend Setup (Strapi CMS)

```bash
cd backend

# Install dependencies
npm install

# The .env file is already configured with secure random secrets
# You can modify it if needed

# Start development server
npm run dev
```

The Strapi admin panel will be available at: `http://localhost:1337/admin`

**First time setup:**
- Create an admin account when prompted
- Configure your content types (Menu, Page, Fiche Recette, Global)

### 3. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# The .env file contains your Supabase credentials
# Update them if needed:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### 4. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Set up the following tables:
   - `user_roles` (user_id, role)
   - `profiles` (id, first_name, last_name, phone, address)
   - `orders` (id, user_id, delivery_date, status, total_price, shipping_name, shipping_phone, shipping_address, comments, created_at)
   - `order_items` (id, order_id, menu_id, quantity, unit_price)
   - `menus` (id, week_name, description, price, image_url, is_active)

3. Update frontend/.env with your Supabase credentials

### 5. Stripe Setup

1. Get your Stripe API keys from https://dashboard.stripe.com/apikeys
2. Configure Supabase Edge Functions:
   ```bash
   cd frontend/supabase/functions

   # Set Stripe secret key
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...

   # Set application URL (optional, defaults to localhost:3000)
   supabase secrets set APP_URL=http://localhost:3000
   ```

3. Deploy Edge Functions:
   ```bash
   supabase functions deploy create-stripe-checkout
   supabase functions deploy stripe-webhook
   ```

4. Configure Stripe Webhook:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://<your-supabase-project>.supabase.co/functions/v1/stripe-webhook`
   - Select event: `checkout.session.completed`

## 📝 Development Scripts

### Backend (Strapi)

```bash
npm run dev          # Start with auto-reload
npm run start        # Production mode
npm run build        # Build admin panel
npm run console      # Open Strapi console
```

### Frontend (React)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🌍 Environment Variables

### Backend (.env)

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS="<generated-secret>"
API_TOKEN_SALT=<generated-secret>
ADMIN_JWT_SECRET=<generated-secret>
JWT_SECRET=<generated-secret>
ENCRYPTION_KEY=<generated-secret>
```

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRAPI_URL=http://localhost:1337
VITE_APP_URL=http://localhost:3000
```

## 📂 Project Structure

```
webmecameal-monorepo/
├── backend/                    # Strapi CMS
│   ├── config/                # Configuration files
│   ├── src/
│   │   ├── api/              # Content types & API endpoints
│   │   ├── components/       # Reusable Strapi components
│   │   └── index.ts          # Main entry point
│   ├── .env                  # Environment variables
│   └── package.json
│
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/       # Page components
│   │   ├── config.js         # Centralized configuration
│   │   ├── supabaseClient.js # Supabase client
│   │   ├── CartContext.jsx   # Shopping cart state
│   │   ├── theme.js          # Chakra UI theme
│   │   └── main.jsx          # Entry point
│   ├── supabase/
│   │   └── functions/        # Edge functions (Stripe)
│   ├── .env                  # Environment variables
│   ├── .env.example          # Environment template
│   └── package.json
│
└── README.md                  # This file
```

## 🎨 Key Features

- **Dynamic Page Builder**: Create pages with Strapi components
- **Menu Management**: Weekly meal menus with pricing
- **Shopping Cart**: Add/remove items, manage quantities
- **User Authentication**: Supabase Auth integration
- **Order Management**: Admin dashboard for orders
- **Payment Processing**: Stripe Checkout integration
- **Responsive Design**: Mobile-first with Chakra UI

## 🔐 Security Notes

- All sensitive keys are now in environment variables
- Backend uses secure random secrets (generated automatically)
- TypeScript strict mode enabled for better type safety
- CORS configured for localhost development
- Supabase RLS (Row Level Security) should be configured

## 🐛 Common Issues

### Port Already in Use

If port 3000 or 1337 is already in use:

```bash
# Change frontend port in vite.config.js
# Change backend port in backend/.env (PORT=1337)
```

### Supabase Connection Failed

- Check your credentials in frontend/.env
- Ensure Supabase project is running
- Verify network connection

### Stripe Webhook Not Working

- Ensure Edge Functions are deployed
- Check Stripe webhook endpoint URL
- Verify STRIPE_SECRET_KEY is set in Supabase secrets

## 📦 Production Deployment

### Backend (Strapi)

1. Set up production database (PostgreSQL recommended)
2. Update `backend/config/database.ts`
3. Set production environment variables
4. Deploy to your hosting provider (Heroku, Railway, etc.)

### Frontend (React)

1. Update environment variables for production URLs
2. Build the application: `npm run build`
3. Deploy `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

### Edge Functions

```bash
supabase functions deploy --project-ref <your-project-ref>
```

## 🧪 Testing

Testing framework is not yet configured. To add tests:

```bash
# Frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Backend
# Strapi has built-in testing utilities
```

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

Please follow the existing code style and conventions:
- Use ESLint for linting
- Follow React best practices
- Use TypeScript strict mode in backend
- Write descriptive commit messages

## 📞 Support

For questions or issues, please contact the development team.

---

Built with ❤️ using Strapi, React, Supabase, and Stripe
