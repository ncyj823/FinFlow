# FinFlow Dashboard — React

A production-grade personal finance dashboard built with React, featuring animated UI, role-based access, AI-powered insights, and full CRUD operations on transaction data.

---

## Tech Stack

- **React 18** — component architecture, hooks-based state
- **Chart.js + react-chartjs-2** — line, bar, doughnut charts
- **CSS animations** — antigravity motion system (levitate, spring, orbit)
- **No other dependencies** — no Redux, no Tailwind, no UI library

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Build for production
npm run build
```

Opens at **https://fin-flow-teal-one.vercel.app/**

---

## Project Structure

```
src/
├── App.jsx                   # Root — layout, routing, global state
├── index.js / index.css      # Entry point + global styles + animations
├── components/
│   ├── Sidebar.jsx           # Navigation + role switcher
│   ├── Dashboard.jsx         # Summary cards, trend chart, donut, recent tx
│   ├── Transactions.jsx      # Filterable/sortable table + CRUD modal
│   ├── Insights.jsx          # KPI cards, monthly bar chart, category bars
│   ├── Budgets.jsx           # Budget goals with progress bars + performance chart
│   ├── Recurring.jsx         # Subscription tracker with pause/resume
│   ├── AIInsights.jsx        # Claude-powered chat advisor
│   └── UI.jsx                # Shared primitives: Card, Badge, Btn, Modal, Toast
├── hooks/
│   └── index.js              # useTransactions, useBudgets, useRecurring, useFilters, useCountUp
└── data/
    └── mockData.js           # Seed data, constants, chart data
```

---

## Features

### Dashboard
- 4 animated summary cards (Balance, Income, Expenses, Savings Rate) with count-up animation
- Balance trend line chart with 6M / 3M / 1M tab switching
- Spending breakdown donut chart with category legend
- Recent transactions preview table

### Transactions
- Search, filter by type/category, sort by date/amount
- Admin: Add, Edit, Delete via animated modal
- Empty state for no-match filters

### Insights
- Top spending category, monthly savings, average transaction
- 6-month income vs expenses bar chart
- Spending distribution with animated progress bars

### Budget Goals
- Per-category monthly limits with alert thresholds
- Colour-coded progress: green → amber → red
- Bar chart comparing spent vs. budget
- Empty state with role-appropriate guidance

### Recurring Transactions
- Monthly outflow / inflow / net summary cards
- Subscription cards with active/paused status
- Admin: pause, resume, delete, add new

### AI Financial Advisor
- Powered by Claude (Anthropic API)
- Full context of user's real transaction/budget data injected
- Quick-prompt chips, typing indicator, graceful error handling

---

## State Management

| State             | Location              | Persistence    |
|-------------------|-----------------------|----------------|
| Transactions      | `useTransactions()`   | localStorage   |
| Budgets           | `useBudgets()`        | localStorage   |
| Recurring         | `useRecurring()`      | in-memory      |
| Active page       | `App.jsx` useState    | in-memory      |
| Role              | `App.jsx` useState    | in-memory      |
| Filters           | `Transactions.jsx`    | in-memory      |
| AI chat history   | `AIInsights.jsx`      | in-memory      |

Custom hooks encapsulate all data logic and expose clean CRUD APIs to components. No prop drilling beyond one level — all data operations flow through `App.jsx`.

---

## Role-Based UI

Switch roles using the **sidebar dropdown**:

| Feature              | Viewer | Admin |
|----------------------|--------|-------|
| View all data        | ✅     | ✅    |
| Add transaction      | ❌     | ✅    |
| Edit / Delete tx     | ❌     | ✅    |
| Add budget goal      | ❌     | ✅    |
| Remove budget        | ❌     | ✅    |
| Pause/delete recurring | ❌   | ✅    |
| Export CSV           | ✅     | ✅    |

---

## Animations

The dashboard uses a custom **antigravity motion system**:

- **Levitation** — summary, insight, budget, and recurring cards float continuously with unique timing per card
- **Spring entries** — all panels and cards enter with a spring overshoot
- **Orbital logo** — the FinFlow logo mark spins perpetually
- **Floating badge** — role badge drifts in zero-gravity
- **AI orb** — the AI avatar pulses and rises
- **Count-up numbers** — all monetary values animate from 0 on load
- **Progress bar sweep** — budget and category bars animate width from 0
- **Row stagger** — transaction rows fade in with cascading delay
- **Ripple buttons** — click ripple on all interactive buttons
- **Modal spring** — modals pop in with scale + translate spring
- **Toast bounce** — notification bounces up from bottom
