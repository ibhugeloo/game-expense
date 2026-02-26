# Mosaic -- Game Expense Tracker

A single-page application to track, analyze, and manage your gaming expenses. Built with React 19 and Supabase.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Premium Plan](#premium-plan)
- [Analytics](#analytics)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Mosaic helps gamers keep track of every purchase -- full games, DLCs, micro-transactions, and subscriptions -- with multi-currency support, visual analytics, and budget alerts. The app supports French and English, dark and light themes, and works on desktop, tablet, and mobile.

---

## Features

### Authentication and Onboarding

- Landing page with hero, feature highlights, pricing, and inline auth form
- Email/password sign-up and sign-in via Supabase Auth
- Password reset flow with email link
- 4-step onboarding wizard (avatar, display name, feature tour, confirmation)
- Language toggle (FR/EN) on the landing page

### Dashboard

- Stats overview: total games, total spent, average price, micro-transaction count
- Year filter with compact pill selector
- Analytics charts: breakdown by platform, genre, and store (Recharts)
- Sortable transaction table with inline edit and delete
- Monthly budget widget with progress bar (Premium)
- Skeleton loaders with shimmer animation during data fetch

### Transaction Management

- Add, edit, and delete transactions via modal form
- Transaction types: Game, DLC, Micro-transaction, Subscription
- Fields: name, price, currency, platform, genre, store, date, status, parent game, notes
- Multi-currency support (EUR, USD, GBP, JPY) with live exchange rates
- Status tracking: Backlog, Playing, Completed, Dropped, Wishlist
- CSV export with UTF-8 BOM for Excel compatibility (Premium)

### Wishlist

- Dedicated Wishlist view with card grid layout
- Cover art, title, platform/genre tags, and price on each card
- Quick actions: move to Backlog, edit, delete
- Empty state with call to action

### Search and Notifications

- Global search overlay triggered by Cmd+K / Ctrl+K
- Instant search across all transactions
- Notification dropdown with budget alerts (80%+ threshold) and monthly summaries

### Settings

- Profile: emoji avatar, display name, default currency
- Theme: dark / light mode toggle
- Language: French / English (react-i18next with browser detection)
- Subscription management: view current plan, cancel

### Reliability and UX

- Error boundary with fallback page and reload button
- Offline detection banner (fixed at bottom on network loss)
- Full SEO meta tags, Open Graph, and Twitter Card
- Custom SVG favicon
- Responsive layout verified on mobile, tablet, and desktop

---

## Tech Stack

| Layer        | Technology                                     |
| ------------ | ---------------------------------------------- |
| Framework    | React 19                                       |
| Build        | Vite 7                                         |
| Backend      | Supabase (Auth, PostgreSQL with RLS)           |
| Payments     | Stripe Checkout                                |
| Charts       | Recharts                                       |
| Icons        | Lucide React                                   |
| i18n         | react-i18next + i18next-browser-languagedetector |
| Analytics    | PostHog                                        |
| CSS          | Custom CSS with glassmorphism design system    |

---

## Project Structure

```
game-history/
  client/
    public/
      favicon.svg
    src/
      components/
        AnalyticsCharts.jsx
        AuthForm.jsx
        BudgetForm.jsx
        BudgetWidget.jsx
        ErrorBoundary.jsx
        LandingPage.jsx
        NotificationDropdown.jsx
        OfflineBanner.jsx
        OnboardingFlow.jsx
        SearchOverlay.jsx
        SettingsModal.jsx
        SkeletonLoader.jsx
        StatsOverview.jsx
        Toast.jsx
        TransactionForm.jsx
        TransactionList.jsx
        UpgradeModal.jsx
        WishlistView.jsx
      hooks/
        useAuth.js
        useBudget.js
        usePlan.js
        useProfile.js
        useTransactions.js
      locales/
        en.json
        fr.json
      utils/
        currency.js
        exportCsv.js
        formatters.js
      App.jsx
      constants.js
      index.css
      main.jsx
      posthog.js
      supabase.js
    index.html
    .env.example
    package.json
    vite.config.js
  CHECKLIST_PROD.md
  README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with Auth enabled and the required tables/RLS policies
- A Stripe account (for Premium features)

### Installation

```bash
git clone https://github.com/your-username/game-history.git
cd game-history/client
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

---

## Environment Variables

Create a `.env` file inside the `client/` directory based on `.env.example`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAWG_API_KEY=your-rawg-api-key
VITE_POSTHOG_KEY=your-posthog-project-api-key
VITE_POSTHOG_HOST=https://eu.i.posthog.com
```

| Variable               | Required | Description                              |
| ---------------------- | -------- | ---------------------------------------- |
| VITE_SUPABASE_URL      | Yes      | Supabase project URL                     |
| VITE_SUPABASE_ANON_KEY | Yes      | Supabase anonymous/public key            |
| VITE_RAWG_API_KEY      | No       | RAWG API key for game cover art (Premium)|
| VITE_POSTHOG_KEY       | No       | PostHog project API key for analytics    |
| VITE_POSTHOG_HOST      | No       | PostHog ingestion host (defaults to EU)  |

Stripe keys are configured server-side through Supabase Edge Functions.

---

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start development server       |
| `npm run build`   | Build for production           |
| `npm run preview` | Preview production build       |
| `npm run lint`    | Run ESLint                     |

---

## Premium Plan

The free plan allows up to 50 transactions with basic analytics. The Premium plan (via Stripe Checkout) unlocks:

- Unlimited transactions
- Multi-currency conversion
- Advanced analytics charts
- Monthly budget tracking
- CSV export
- Game cover art via RAWG API

---

## Analytics

PostHog is used for product analytics. When `VITE_POSTHOG_KEY` is not set, all tracking calls are no-ops and the app runs without any external requests.

Tracked events:

- `onboarding_completed` -- user finishes or skips onboarding
- `transaction_added` -- new transaction created
- `transaction_edited` -- existing transaction modified
- `transaction_deleted` -- transaction removed
- `budget_set` -- monthly budget defined
- `csv_exported` -- CSV file downloaded
- `upgrade_clicked` -- user clicks the upgrade button

Autocapture is disabled. Session recording is disabled. Data is sent to the EU endpoint by default.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a pull request

---

## License

This project is not currently under a specific open-source license. All rights reserved.
