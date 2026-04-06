# FinFlow — Personal Finance Dashboard

> A production-grade personal finance dashboard built with React 18, featuring animated UI, role-based access control, AI-powered financial advisor, multilingual support, and full CRUD operations — built as a frontend developer internship assessment.

🔗 **Live Demo:** [https://fin-flow-f1ez.vercel.app](https://fin-flow-f1ez.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Features](#features)
- [Architecture & Approach](#architecture--approach)
- [State Management](#state-management)
- [Role-Based Access Control](#role-based-access-control)
- [Animation System](#animation-system)
- [AI Integration](#ai-integration)
- [Multilingual Support](#multilingual-support)
- [Responsiveness](#responsiveness)
- [Performance Optimizations](#performance-optimizations)
- [Design Decisions](#design-decisions)
- [Screenshots](#screenshots)

---

## Overview

FinFlow is a single-page finance dashboard that lets users track income, expenses, budgets, and recurring payments — with an AI advisor that understands your actual transaction data and can answer financial questions in plain English, Hindi, or Telugu.

The project was built to evaluate frontend development skills including component architecture, state management, data visualization, UI/UX design, and API integration.

---

## Tech Stack

| Category | Technology | Why |
|----------|-----------|-----|
| Framework | React 18 | Component model, hooks, ecosystem |
| Charts | Chart.js + react-chartjs-2 | Flexible, performant, customizable |
| Animations | Framer Motion | GPU-accelerated, spring physics |
| State | Custom hooks + localStorage | No overhead, persistence built-in |
| AI | Anthropic Claude API | Best-in-class language understanding |
| Deployment | Vercel | Zero-config, instant previews |
| Styling | CSS Custom Properties | Theming, dark mode, no build overhead |

**No UI library. No Redux. No Tailwind.** Every component is hand-built.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/finflow.git
cd finflow

# Install dependencies
npm install

# Start development server
npm start
# Opens at http://localhost:3000

# Build for production
npm run build
```

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@finflow.com | admin123 | Admin — full CRUD access |
| viewer@finflow.com | viewer123 | Viewer — read only |
| demo@finflow.com | demo123 | Admin — for evaluators |

---

## Project Structure

```
src/
├── App.jsx                   # Root layout, routing, global state, auth check
├── index.js                  # React entry point
├── index.css                 # Global styles, CSS variables, keyframe animations
│
├── auth/
│   ├── users.js              # Hardcoded user accounts + login validator
│   ├── useAuth.js            # Auth hook — session read/write from localStorage
│   └── LoginPage.jsx         # Full-page login UI with demo quick-login buttons
│
├── components/
│   ├── Sidebar.jsx           # Navigation, role switcher, language selector, logout
│   ├── Dashboard.jsx         # Summary cards, trend chart, donut chart, recent transactions
│   ├── Transactions.jsx      # Filterable/sortable table with full CRUD
│   ├── Insights.jsx          # KPI cards, monthly bar chart, category breakdown
│   ├── Budgets.jsx           # Budget goals, progress bars, performance chart
│   ├── Recurring.jsx         # Subscription tracker with pause/resume
│   ├── AIInsights.jsx        # Claude-powered conversational financial advisor
│   └── UI.jsx                # Shared primitives: Card, Badge, Btn, Modal, Toast, etc.
│
├── hooks/
│   └── index.js              # useTransactions, useBudgets, useRecurring, useCountUp
│
└── data/
    └── mockData.js           # Seed transactions, budget data, chart data, category colors
```

---

## Features

### 🏠 Dashboard
- 4 animated summary cards — **Total Balance**, **Monthly Income**, **Monthly Expenses**, **Savings Rate**
- Count-up animation on all monetary values on page load
- **Balance Trend** line chart with 6M / 3M / 1M tab switching
- **Spending Breakdown** donut chart grouped by category
- Recent transactions preview table with color-coded rows

### 💳 Transactions
- Full transaction table with **Date, Description, Category, Type, Amount**
- **Search** across description and category simultaneously
- **Filter** by type (Income / Expense) and by category
- **Sort** by date (newest/oldest) or amount (highest/lowest)
- Admin: **Add, Edit, Delete** via animated spring modal
- New row flash animation (green highlight) on add
- Staggered row entrance on filter change
- Export as **CSV** available to all roles
- Empty state with friendly message when no results match

### 📊 Insights
- Top spending category with progress bar
- Monthly savings summary
- Average transaction value
- 6-month income vs expenses comparison bar chart
- Full category spending distribution with animated progress bars

### 🎯 Budget Goals
- Per-category monthly spending limits
- Colour-coded progress bars: green → amber → red as budget fills
- Alert threshold warnings when approaching limit
- Bar chart comparing spent vs budget per category
- Admin: add new budget goals, delete existing ones

### 🔄 Recurring Transactions
- Monthly outflow / inflow / net summary cards
- Subscription cards showing active/paused status
- Admin: pause, resume, delete, add new subscriptions

### 🤖 AI Financial Advisor
- Powered by **Claude Sonnet** (Anthropic API)
- Full financial context injected — income, expenses, savings rate, category breakdown, budget status
- Quick-prompt chips for common questions
- Animated typing indicator while AI responds
- Conversation memory across the session (last 10 messages)
- Finance literacy mode — detects "what is X?" questions and explains in plain English
- Responds in selected language (English / Hindi / Telugu)
- Proactive insights auto-generated on page load

### 🔐 Authentication (Mock)
- Login screen with email + password
- 3 hardcoded demo accounts with different roles
- Quick-login buttons for evaluators
- Session persisted in localStorage — survives page refresh
- Logout clears session and returns to login
- Animated error shake on wrong credentials

---

## Architecture & Approach

### Component Design
Each page is a self-contained component that receives data via props from `App.jsx`. There is no prop drilling beyond one level — `App.jsx` acts as the single data hub, passing transactions/budgets/handlers down to page components.

```
App.jsx
├── useAuth()           → session, login, logout
├── useTransactions()   → transactions, addTransaction, updateTransaction, deleteTransaction
├── useBudgets()        → budgets, addBudget, deleteBudget
├── useRecurring()      → recurring, addRecurring, toggleRecurring, deleteRecurring
└── renders → Sidebar + active page component
```

### Routing
No React Router. Navigation is handled by a single `page` state in `App.jsx`. This keeps the bundle small and avoids URL complexity for a dashboard use case.

```jsx
const [page, setPage] = useState('dashboard');
// ...
{page === 'dashboard'    && <Dashboard ... />}
{page === 'transactions' && <Transactions ... />}
```

### Data Flow
All user interactions flow upward through callbacks:

```
User action → Component → callback prop → App.jsx hook → localStorage update → re-render
```

Example — adding a transaction:
```
Transactions.jsx (modal submit)
  → onAdd(data)
  → App.jsx: addTransaction(data)
  → useTransactions hook: setTransactions([newTx, ...prev])
  → localStorage.setItem('finflow_tx', JSON.stringify(...))
  → React re-renders with new data
```

---

## State Management

No Redux or Zustand. State is managed with custom hooks using `useState` + `useEffect` + `localStorage`.

| State | Location | Persistence |
|-------|----------|-------------|
| Auth session | `useAuth()` | localStorage (`finflow_session`) |
| Transactions | `useTransactions()` | localStorage (`finflow_tx`) |
| Budgets | `useBudgets()` | localStorage (`finflow_budgets`) |
| Recurring | `useRecurring()` | In-memory |
| Active page | `App.jsx useState` | In-memory |
| Role | `App.jsx useState` | In-memory |
| Language | `App.jsx useState` | localStorage |
| Filters | `Transactions.jsx` | In-memory |
| AI chat history | `AIInsights.jsx` | In-memory |

### useTransactions Hook

```js
export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage('finflow_tx', INITIAL_TRANSACTIONS);

  const addTransaction = useCallback((tx) => {
    const newId = Date.now();
    setTransactions(prev => [{ ...tx, id: newId }, ...prev]);
    setLastAddedId(newId); // triggers row flash animation
  }, [setTransactions]);

  // updateTransaction, deleteTransaction ...
  return { transactions, addTransaction, updateTransaction, deleteTransaction };
}
```

---

## Role-Based Access Control

Roles are simulated on the frontend. The role is set via the sidebar dropdown or determined from the logged-in user's account.

| Feature | Viewer | Admin |
|---------|--------|-------|
| View all data | ✅ | ✅ |
| Export CSV | ✅ | ✅ |
| Ask AI advisor | ✅ | ✅ |
| Add transaction | ❌ | ✅ |
| Edit / Delete transaction | ❌ | ✅ |
| Add budget goal | ❌ | ✅ |
| Remove budget goal | ❌ | ✅ |
| Pause / delete recurring | ❌ | ✅ |

RBAC is enforced at the UI level — admin controls are conditionally rendered based on the `role` prop:

```jsx
{role === 'admin' && <Btn onClick={openAdd}>+ Add</Btn>}
{role === 'admin' && <Btn onClick={() => handleDelete(t.id)}>Delete</Btn>}
```

---

## Animation System

FinFlow uses a custom **antigravity motion system** combining CSS keyframes and Framer Motion.

### CSS Keyframe Animations

| Animation | Used On | Effect |
|-----------|---------|--------|
| `springIn` | All cards and panels | Scale + translateY spring entrance |
| `fadeUp` | Table rows, labels | Opacity + translateY fade |
| `levitate` | Summary cards | Continuous gentle float |
| `orbitSpin` | Logo mark | Perpetual rotation |
| `countUp` | Stat numbers | Value count from 0 to target |
| `rowFlash` | New transaction row | Green background fade |
| `rippleAnim` | Buttons | Click ripple spread |
| `typingDot` | AI chat indicator | Bouncing dots |
| `modalPop` | Modals | Scale overshoot spring pop |

### Framer Motion Animations

| Animation | Component | Technique |
|-----------|-----------|-----------|
| 3D magnetic card tilt | `Card` in UI.jsx | `useMotionValue` + `useTransform` + `useSpring` |
| Sidebar ink indicator | `Sidebar.jsx` | Spring `animate={{ y: indicatorY }}` |
| Page transitions | `App.jsx` | `AnimatePresence mode="wait"` |
| Staggered row entrance | `Transactions.jsx` | `motion.tbody` key change + `staggerChildren` |
| Row exit on delete | `Transactions.jsx` | `AnimatePresence mode="popLayout"` |
| Spring modal | `Modal` in UI.jsx | `scale(0.88 → 1) + translateY` with spring |
| Toast slide | `Toast` in UI.jsx | `AnimatePresence` + spring |
| Number scramble | `ScrambleNumber` in UI.jsx | `requestAnimationFrame` + random digit flicker |
| Role badge swap | `Sidebar.jsx` | `AnimatePresence mode="wait"` |

### Performance Rules
- Only `opacity`, `x`, `y`, `scale`, `rotate` are animated via Framer Motion — no layout properties
- `will-change: transform` on sidebar and cards for GPU layer promotion
- `backdrop-filter: blur()` removed — replaced with solid semi-transparent backgrounds
- `isAnimationActive={false}` on all Recharts components — custom draw-on handles chart animation
- Stagger capped at 10 items max — beyond that, items appear instantly

---

## AI Integration

The AI advisor is powered by **Claude Sonnet** via the Anthropic Messages API.

### Context Building
Before every API call, a rich financial context string is built from live data:

```js
function buildContext(transactions, budgets) {
  // Income, expenses, savings rate
  // Top spending categories with amounts and % of total
  // Budget status — how much used per category
  // Total transaction count
  // Month-over-month comparison
  return contextString;
}
```

### System Prompt
The system prompt instructs Claude to:
- Respond in the user's selected language
- Use plain English (no finance jargon) for beginner users
- Keep responses under 130 words unless a breakdown is needed
- Avoid markdown symbols in output

### Finance Literacy Mode
The component detects beginner questions before hitting the API:
```js
if (lowerText.includes('what is savings rate') || lowerText.includes('explain budget')) {
  // Return instant plain-English explanation without API call
}
```

### Conversation Memory
The last 10 messages are sent with every API call so Claude remembers context across the conversation.

---

## Multilingual Support

Supported languages: **English**, **हिन्दी (Hindi)**, **తెలుగు (Telugu)**

All UI strings are stored in a `LANGS` translation object in `App.jsx` and provided via `LangContext`. The AI system prompt, quick-prompt chips, welcome message, placeholder text, and button labels all update instantly when the language is changed from the sidebar dropdown. Selection is persisted in localStorage.

---

## Responsiveness

| Breakpoint | Layout |
|-----------|--------|
| Desktop (> 900px) | Sidebar always visible, sticky, 220px wide |
| Tablet (768–900px) | Sidebar hidden, hamburger menu, 2-col cards |
| Mobile (< 768px) | Sidebar fixed drawer, 1-col cards, scrollable table |

The sidebar on mobile uses a CSS `transform: translateX(-100%)` toggle via className — this runs on the compositor thread with no JavaScript jank. A dark backdrop overlay closes the sidebar on tap.

---

## Performance Optimizations

- **Compositor-thread sidebar** — CSS class toggle instead of JS animation
- **GPU layers** — `will-change: transform` + `translateZ(0)` on animated elements
- **No backdrop-filter** — replaced with solid backgrounds (10x cheaper on mobile)
- **Recharts animations disabled** — `isAnimationActive={false}` on all chart components
- **Stagger cap** — transaction row stagger limited to first 10 rows
- **useCallback** on all data mutation functions — prevents unnecessary re-renders
- **Infinite animations only on hover** — levitate and spin only run on hover, not always

---

## Design Decisions

**Why no routing library?**
The dashboard is a single logical context — no deep linking needed. A `page` state in `App.jsx` is simpler, faster to load, and avoids the URL complexity that would confuse a finance tool user.

**Why custom hooks instead of Zustand/Redux?**
The data flow is simple and linear. Custom hooks with `useLocalStorage` give the same persistence and co-location benefits without adding a dependency or learning curve for reviewers.

**Why Chart.js over Recharts for Dashboard charts?**
Chart.js gives more control over the draw-on line animation (stroke-dashoffset technique) which is a key visual moment on the dashboard. Recharts is used in the Insights and Budgets bar charts where its declarative API is simpler.

**Why mock auth instead of Firebase?**
The assignment focuses on frontend skills. Mock auth demonstrates understanding of session management, protected routes, and RBAC patterns without backend complexity.

---

## Keywords

`React` `React 18` `Framer Motion` `Chart.js` `Recharts` `Anthropic API` `Claude AI` `Role Based Access Control` `RBAC` `Custom Hooks` `localStorage` `State Management` `CSS Animations` `Dark Theme` `Responsive Design` `Mobile First` `Finance Dashboard` `Data Visualization` `CRUD` `REST API` `Multilingual` `i18n` `Hindi` `Telugu` `Vercel` `Create React App` `Performance Optimization` `GPU Animation` `Spring Physics` `Magnetic Hover` `Number Scramble` `Stagger Animation` `AnimatePresence` `useMotionValue` `useSpring` `useTransform`
