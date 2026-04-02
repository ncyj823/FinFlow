export const CAT_COLORS = {
  Food: '#4f8fff',
  Transport: '#2dd4a0',
  Shopping: '#f5a742',
  Utilities: '#7c5cfc',
  Health: '#f06a6a',
  Entertainment: '#e879f9',
  Salary: '#2dd4a0',
  Freelance: '#4f8fff',
  Investment: '#f5a742',
};

export const CATEGORIES = ['Food','Transport','Shopping','Utilities','Health','Entertainment','Salary','Freelance','Investment'];
export const EXPENSE_CATS = ['Food','Transport','Shopping','Utilities','Health','Entertainment'];

export const INITIAL_TRANSACTIONS = [
  { id: 1,  date: '2026-04-01', desc: 'April Salary',       cat: 'Salary',        type: 'income',  amount: 7200 },
  { id: 2,  date: '2026-04-02', desc: 'Grocery Store',      cat: 'Food',          type: 'expense', amount: 128.50 },
  { id: 3,  date: '2026-04-03', desc: 'Uber Ride',          cat: 'Transport',     type: 'expense', amount: 18.30 },
  { id: 4,  date: '2026-04-04', desc: 'Netflix',            cat: 'Entertainment', type: 'expense', amount: 15.99 },
  { id: 5,  date: '2026-04-05', desc: 'Freelance Project',  cat: 'Freelance',     type: 'income',  amount: 1250 },
  { id: 6,  date: '2026-04-07', desc: 'Electric Bill',      cat: 'Utilities',     type: 'expense', amount: 94 },
  { id: 7,  date: '2026-04-08', desc: 'Restaurant',         cat: 'Food',          type: 'expense', amount: 67.20 },
  { id: 8,  date: '2026-04-09', desc: 'Gym Membership',     cat: 'Health',        type: 'expense', amount: 45 },
  { id: 9,  date: '2026-04-10', desc: 'Amazon Shopping',    cat: 'Shopping',      type: 'expense', amount: 189.90 },
  { id: 10, date: '2026-04-11', desc: 'Dividend Income',    cat: 'Investment',    type: 'income',  amount: 320 },
  { id: 11, date: '2026-04-12', desc: 'Coffee Shop',        cat: 'Food',          type: 'expense', amount: 22.40 },
  { id: 12, date: '2026-04-14', desc: 'Bus Pass',           cat: 'Transport',     type: 'expense', amount: 35 },
  { id: 13, date: '2026-04-15', desc: 'Doctor Visit',       cat: 'Health',        type: 'expense', amount: 80 },
  { id: 14, date: '2026-04-16', desc: 'Streaming Bundle',   cat: 'Entertainment', type: 'expense', amount: 28 },
  { id: 15, date: '2026-04-17', desc: 'Supermarket',        cat: 'Food',          type: 'expense', amount: 156.70 },
  { id: 16, date: '2026-04-18', desc: 'Consulting Fee',     cat: 'Freelance',     type: 'income',  amount: 480 },
  { id: 17, date: '2026-04-20', desc: 'Water Bill',         cat: 'Utilities',     type: 'expense', amount: 42 },
  { id: 18, date: '2026-04-21', desc: 'New Sneakers',       cat: 'Shopping',      type: 'expense', amount: 120 },
  { id: 19, date: '2026-04-22', desc: 'Lunch Out',          cat: 'Food',          type: 'expense', amount: 34.50 },
  { id: 20, date: '2026-04-24', desc: 'Taxi',               cat: 'Transport',     type: 'expense', amount: 22 },
  { id: 21, date: '2026-04-25', desc: 'Pharmacy',           cat: 'Health',        type: 'expense', amount: 29.90 },
  { id: 22, date: '2026-04-27', desc: 'Concert Ticket',     cat: 'Entertainment', type: 'expense', amount: 75 },
  { id: 23, date: '2026-04-28', desc: 'Online Course',      cat: 'Shopping',      type: 'expense', amount: 49.99 },
  { id: 24, date: '2026-04-29', desc: 'Gas Bill',           cat: 'Utilities',     type: 'expense', amount: 65 },
  { id: 25, date: '2026-04-30', desc: 'Bonus Payment',      cat: 'Salary',        type: 'income',  amount: 200 },
];

export const INITIAL_BUDGETS = [
  { id: 1, cat: 'Food',          limit: 400, alertAt: 80 },
  { id: 2, cat: 'Entertainment', limit: 150, alertAt: 80 },
  { id: 3, cat: 'Shopping',      limit: 300, alertAt: 75 },
  { id: 4, cat: 'Transport',     limit: 100, alertAt: 80 },
];

export const INITIAL_RECURRING = [
  { id: 1, desc: 'Netflix',         cat: 'Entertainment', type: 'expense', amount: 15.99, freq: 'monthly', nextDate: '2026-05-04', active: true },
  { id: 2, desc: 'Gym Membership',  cat: 'Health',        type: 'expense', amount: 45,    freq: 'monthly', nextDate: '2026-05-09', active: true },
  { id: 3, desc: 'Spotify',         cat: 'Entertainment', type: 'expense', amount: 9.99,  freq: 'monthly', nextDate: '2026-05-01', active: true },
  { id: 4, desc: 'Electric Bill',   cat: 'Utilities',     type: 'expense', amount: 94,    freq: 'monthly', nextDate: '2026-05-07', active: true },
  { id: 5, desc: 'Water Bill',      cat: 'Utilities',     type: 'expense', amount: 42,    freq: 'monthly', nextDate: '2026-05-20', active: false },
  { id: 6, desc: 'Dividend Income', cat: 'Investment',    type: 'income',  amount: 320,   freq: 'monthly', nextDate: '2026-05-11', active: true },
];

export const TREND_DATA = {
  '6m': {
    labels: ['Nov','Dec','Jan','Feb','Mar','Apr'],
    balance:  [14200,15800,17200,19400,22500,24381],
    income:   [5200, 5800, 6400, 7100, 7520, 8450],
    expenses: [3800, 4100, 4200, 4000, 3640, 3820],
  },
  '3m': {
    labels: ['Feb','Mar','Apr'],
    balance:  [19400,22500,24381],
    income:   [7100, 7520, 8450],
    expenses: [4000, 3640, 3820],
  },
  '1m': {
    labels: ['Wk1','Wk2','Wk3','Wk4'],
    balance:  [22500,23100,23700,24381],
    income:   [8450, 0,    0,    0],
    expenses: [920,  740,  820,  860],
  },
};

export const REC_ICONS = {
  Food:'🍔', Transport:'🚗', Shopping:'🛍️', Utilities:'💡',
  Health:'💊', Entertainment:'🎬', Salary:'💼', Freelance:'💻', Investment:'📈',
};
