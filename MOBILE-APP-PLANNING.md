# SpendWise Mobile — Tech Stack & Feature Planning

> React Native + Expo mobile companion for the SpendWise budget tracking platform.
> All API endpoints are defined in `API-DOCUMENTATION.md`.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Architecture Philosophy](#2-architecture-philosophy)
3. [Project Structure](#3-project-structure)
4. [State Management Strategy](#4-state-management-strategy)
5. [API Integration Layer](#5-api-integration-layer)
6. [Screen Inventory & Feature Map](#6-screen-inventory--feature-map)
7. [Navigation Structure](#7-navigation-structure)
8. [UI/UX Design System](#8-uiux-design-system)
9. [Authentication Flow](#9-authentication-flow)
10. [Offline & Sync Strategy](#10-offline--sync-strategy)
11. [Forms & Validation](#11-forms--validation)
12. [Development Phases](#12-development-phases)

---

## 1. Tech Stack

| Layer | Library | Version | Purpose |
|---|---|---|---|
| **Runtime** | React Native | 0.74+ | Cross-platform mobile framework |
| **Build** | Expo SDK | 51+ | Managed workflow, OTA updates, native modules |
| **Language** | TypeScript | 5+ | Type safety across the entire codebase |
| **Navigation** | React Navigation v6 | 6+ | Stack, Tab, and Drawer navigators |
| **Server State** | TanStack Query | 5+ | API fetching, caching, sync, optimistic updates |
| **Client State** | Zustand | 4+ | UI state, auth tokens, preferences |
| **HTTP Client** | Axios | 1+ | API calls with interceptors (mirrors web app) |
| **Forms** | React Hook Form | 7+ | Performant forms with minimal re-renders |
| **Validation** | Zod | 3+ | Schema validation (shared with forms) |
| **Styling** | NativeWind | 4+ | Tailwind CSS utility classes for React Native |
| **Charts** | Victory Native XL | latest | Bar, line, pie charts with D3-backed rendering |
| **Date** | date-fns | 3+ | Date formatting and calculations |
| **Storage** | AsyncStorage | 1+ | Persistent local key-value storage |
| **Secure Storage** | Expo SecureStore | latest | Token storage (encrypted on-device) |
| **Image** | Expo Image Picker | latest | Avatar and icon upload |
| **Image Crop** | Expo Image Manipulator | latest | Client-side image crop/resize |
| **Notifications** | Expo Notifications | latest | Budget alerts, bill reminders |
| **Haptics** | Expo Haptics | latest | Tactile feedback on actions |
| **Biometrics** | Expo Local Authentication | latest | FaceID / fingerprint unlock |

---

## 2. Architecture Philosophy

### Server State vs Client State — Hard Rule

```
TanStack Query  →  anything that comes from the API
Zustand         →  anything that lives only in the UI
```

**Never put API fetch functions inside a Zustand store.** That pattern creates
manual loading flags, manual error handling, and duplicate requests — all of which
TanStack Query already solves.

#### What goes in Zustand

```ts
// stores/ui.store.ts
interface UIStore {
  isDrawerOpen: boolean;
  isDarkMode: boolean;
  activeBottomSheet: string | null;
  selectedPeriod: 'week' | 'month' | 'quarter' | 'year';
  showBalances: boolean;        // balance masking toggle
  toggleDrawer: () => void;
  setActiveBottomSheet: (id: string | null) => void;
  setSelectedPeriod: (p: Period) => void;
  toggleBalances: () => void;
}

// stores/auth.store.ts
interface AuthStore {
  token: string | null;
  user: { id: number; name: string; email: string; currency: string; avatar_url: string | null } | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
}
```

#### What goes in TanStack Query

```ts
// hooks/useAccounts.ts
export const useAccounts = () =>
  useQuery({ queryKey: ['accounts'], queryFn: accountsService.getAccounts });

// hooks/useTransactions.ts
export const useTransactions = (filters: TransactionFilters) =>
  useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: ({ pageParam = 1 }) =>
      transactionsService.getTransactions({ ...filters, page: pageParam }),
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
  });

// hooks/useCreateTransaction.ts
export const useCreateTransaction = () =>
  useMutation({
    mutationFn: transactionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
```

---

## 3. Project Structure

```
spendwise-mobile/
├── app/                          # Expo Router app directory (or src/screens/ if using React Navigation directly)
│
├── src/
│   ├── screens/                  # One folder per feature/screen group
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── accounts/
│   │   │   ├── AccountsScreen.tsx
│   │   │   ├── AccountDetailScreen.tsx
│   │   │   └── components/
│   │   │       ├── AccountCard.tsx
│   │   │       ├── TransferSheet.tsx
│   │   │       └── AddAccountSheet.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionsScreen.tsx
│   │   │   ├── TransactionDetailScreen.tsx
│   │   │   └── components/
│   │   │       ├── TransactionItem.tsx
│   │   │       ├── FilterSheet.tsx
│   │   │       └── AddTransactionSheet.tsx
│   │   ├── categories/
│   │   ├── budget/
│   │   ├── goals/
│   │   ├── debts/
│   │   ├── analytics/
│   │   └── settings/
│   │
│   ├── navigation/               # Navigator definitions
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── types.ts              # TypeScript navigation param types
│   │
│   ├── services/                 # Raw API call functions (no state)
│   │   ├── api.ts                # Axios instance + interceptors
│   │   ├── auth.service.ts
│   │   ├── accounts.service.ts
│   │   ├── transactions.service.ts
│   │   ├── categories.service.ts
│   │   ├── budgets.service.ts
│   │   ├── goals.service.ts
│   │   ├── debts.service.ts
│   │   ├── analytics.service.ts
│   │   ├── user.service.ts
│   │   └── icons.service.ts
│   │
│   ├── hooks/                    # TanStack Query hooks (server state)
│   │   ├── useAccounts.ts
│   │   ├── useTransactions.ts
│   │   ├── useCategories.ts
│   │   ├── useBudgets.ts
│   │   ├── useGoals.ts
│   │   ├── useDebts.ts
│   │   ├── useAnalytics.ts
│   │   └── useUser.ts
│   │
│   ├── stores/                   # Zustand stores (client/UI state only)
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── preferences.store.ts
│   │
│   ├── components/               # Shared, reusable UI components
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Sheet.tsx         # Bottom sheet wrapper
│   │   │   ├── Dialog.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── CurrencyText.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── types/                    # Shared TypeScript interfaces
│   │   ├── account.types.ts
│   │   ├── transaction.types.ts
│   │   ├── category.types.ts
│   │   ├── budget.types.ts
│   │   ├── goal.types.ts
│   │   ├── debt.types.ts
│   │   ├── analytics.types.ts
│   │   ├── auth.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/
│   │   ├── currency.ts           # formatCurrency, currencySymbol
│   │   ├── date.ts               # formatDate, parseDate helpers
│   │   ├── color.ts              # progress color thresholds
│   │   └── storage.ts            # AsyncStorage + SecureStore helpers
│   │
│   └── constants/
│       ├── queryKeys.ts          # Centralized TanStack Query key factory
│       ├── theme.ts              # Colors, spacing, font sizes
│       └── config.ts             # API base URL, timeouts
│
├── assets/
├── app.json
├── babel.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 4. State Management Strategy

### Zustand Stores

#### `auth.store.ts`
```ts
token: string | null
user: AuthUser | null
isAuthenticated: boolean
─────────────────────
setToken(token)         → writes to SecureStore + updates state
setUser(user)           → updates state
clearAuth()             → removes SecureStore token + resets state
```

#### `ui.store.ts`
```ts
showBalances: boolean           → balance masking on all currency values
selectedPeriod: Period          → 'week' | 'month' | 'quarter' | 'year'
activeSheet: string | null      → which bottom sheet is open
isDarkMode: boolean             → synced with AsyncStorage
─────────────────────
toggleBalances()
setSelectedPeriod(p)
setActiveSheet(id)
toggleDarkMode()
```

#### `preferences.store.ts`
```ts
currency: string                → 'PHP' | 'USD' | ...
currencySymbol: string
dateFormat: string
language: string
─────────────────────
setPreferences(prefs)           → loaded from /api/user/preferences on login
```

### TanStack Query Key Factory

All query keys are defined in a single `queryKeys.ts` constant to prevent
typo mismatches when invalidating:

```ts
export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    summary: ['accounts', 'summary'] as const,
    types: ['accounts', 'types'] as const,
    detail: (id: number) => ['accounts', id] as const,
    transactions: (id: number) => ['accounts', id, 'transactions'] as const,
  },
  transactions: {
    all: (filters?: TransactionFilters) => ['transactions', filters] as const,
    recent: ['transactions', 'recent'] as const,
    favorites: ['transactions', 'favorites'] as const,
    detail: (id: number) => ['transactions', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    summary: ['categories', 'summary'] as const,
    spending: (period: string) => ['categories', 'spending', period] as const,
  },
  budgets: {
    all: ['budgets'] as const,
    summary: ['budgets', 'summary'] as const,
    detail: (id: number) => ['budgets', id] as const,
  },
  goals: {
    all: ['goals'] as const,
    detail: (id: number) => ['goals', id] as const,
  },
  debts: {
    all: ['debts'] as const,
    summary: ['debts', 'summary'] as const,
  },
  analytics: {
    overview: (period: string) => ['analytics', 'overview', period] as const,
    cashFlow: (period: string) => ['analytics', 'cashflow', period] as const,
    trends: (months: number) => ['analytics', 'trends', months] as const,
  },
  user: {
    profile: ['user', 'profile'] as const,
    preferences: ['user', 'preferences'] as const,
  },
};
```

---

## 5. API Integration Layer

### Axios Instance (`services/api.ts`)

```ts
// Mirrors the web app's src/boot/axios.ts
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,   // from .env
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Request: attach Bearer token from SecureStore
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      useAuthStore.getState().clearAuth();
      // navigate to Login (via navigation ref)
    }
    return Promise.reject(error);
  },
);
```

### Service Functions (pure, no state)

Each service file exports plain async functions that TanStack Query hooks consume:

```ts
// services/accounts.service.ts
export const accountsService = {
  getAccounts: async (): Promise<ApiResponse<Account[]>> => {
    const r = await api.get('/accounts');
    return r.data;
  },
  getSummary: async (): Promise<ApiResponse<AccountSummary>> => {
    const r = await api.get('/accounts/summary');
    return r.data;
  },
  create: async (data: CreateAccountDto): Promise<ApiResponse<Account>> => {
    const r = await api.post('/accounts', data);
    return r.data;
  },
  // ...
};
```

---

## 6. Screen Inventory & Feature Map

### 6.1 Dashboard Screen
**Route:** `/` (default tab)
**API:** `GET /accounts/summary`, `GET /transactions/recent/list?limit=5`, `GET /budgets` (summary)

| Feature | Component | Notes |
|---|---|---|
| Net worth hero card | `NetWorthCard` | Gradient bg, assets vs liabilities, balance masking |
| Recent transactions list | `TransactionList` | Last 5, link to Transactions tab |
| Budget category progress | `BudgetProgressList` | Color-coded bars, spent/limit |
| Add transaction FAB | `FAB` | Opens `AddTransactionSheet` |
| Loading skeleton | `DashboardSkeleton` | Shown on initial fetch |
| Empty state (no data) | `EmptyDashboard` | Prompt to add account & transaction |

---

### 6.2 Accounts Screen
**Route:** `/accounts`
**API:** `GET /accounts`, `GET /accounts/summary`, `GET /accounts/types`

| Feature | Component | API Endpoint |
|---|---|---|
| Net worth card | `NetWorthCard` | `/accounts/summary` |
| Account list/grid | `AccountCard` | `/accounts` |
| Add account | `AddAccountSheet` | `POST /accounts` |
| Edit account | `EditAccountSheet` | `PUT /accounts/{id}` |
| Delete account | `ConfirmDialog` | `DELETE /accounts/{id}` |
| Transfer funds | `TransferSheet` | `POST /accounts/transfer` |
| Adjust balance | `AdjustBalanceSheet` | `POST /accounts/{id}/adjust-balance` |
| Account type picker | `AccountTypeSheet` | `/accounts/types` (static) |
| Icon picker + upload | `IconPickerSheet` | `GET /icons`, `POST /icons` |
| Color picker | `ColorPickerRow` | Local, saved with account |
| Balance masking | `CurrencyText` | Reads `showBalances` from Zustand |

**Account Types:** cash, bank, credit_card, investment, ewallet

---

### 6.3 Transactions Screen
**Route:** `/transactions`
**API:** `GET /transactions` (paginated + filters), favorites CRUD

| Feature | Component | Notes |
|---|---|---|
| Infinite scroll list | `TransactionList` | `useInfiniteQuery`, 20 per page |
| Quick filter chips | `FilterChips` | All, Today, This Week, Month, Income, Expenses |
| Search bar | `SearchInput` | Debounced 300ms, `?search=` param |
| Advanced filter sheet | `AdvancedFilterSheet` | Type, account, category, date range, amount range |
| Sort options | `SortSheet` | date, amount, description |
| Add transaction | `AddTransactionSheet` | `POST /transactions` |
| Edit transaction | `EditTransactionSheet` | `PUT /transactions/{id}` |
| Delete transaction | `ConfirmDialog` | `DELETE /transactions/{id}` |
| Duplicate transaction | action menu | Pre-fills form with same values |
| Recurring config | inside Add/Edit form | Frequency, interval, end date |
| Save as favorite | | `POST /transactions/favorites` |
| Quick-fill from favorite | `FavoritesSheet` | `GET /transactions/favorites` |
| Tags input | `TagInput` | Multi-tag with pill display |
| Reference number | text field | Optional |
| Bulk create | `BulkTransactionSheet` | `POST /transactions/bulk` |
| Transaction status badge | `Badge` | `is_cleared`, `is_recurring` |

**Filters map to API query params:**
```
type          → income | expense | transfer
account_id    → integer
category_id   → integer
start_date    → YYYY-MM-DD
end_date      → YYYY-MM-DD
min_amount    → number
max_amount    → number
is_recurring  → boolean
is_cleared    → boolean
sort_by       → date | amount | description
sort_direction → asc | desc
```

---

### 6.4 Categories Screen
**Route:** `/categories`
**API:** `GET /categories`, `GET /categories/analytics/summary`

| Feature | Component | Notes |
|---|---|---|
| Category list | `CategoryList` | Hierarchical (parent + subcategories) |
| Summary stats bar | `CategorySummaryBar` | Total categories, budget, spent |
| Expand/collapse tree | `CategoryRow` | Toggle children |
| Search | `SearchInput` | Client-side filter |
| Progress bar per category | `ProgressBar` | Color: red ≥100%, yellow ≥90%, orange ≥75%, green |
| Add category | `AddCategorySheet` | `POST /categories` |
| Edit category | `EditCategorySheet` | `PUT /categories/{id}` |
| Delete category | `ConfirmDialog` | `DELETE /categories/{id}` |
| Budget amount per category | inside edit form | |
| Type selector | `SegmentedControl` | income / expense / both |
| Parent category picker | `CategoryPicker` | For subcategories |
| Icon selector | `IconPicker` | Predefined icon names |
| Color picker | `ColorPicker` | Predefined palette |

---

### 6.5 Budget Screen
**Route:** `/budget`
**API:** `GET /budgets`, `GET /budgets/summary`

| Feature | Component | Notes |
|---|---|---|
| Period tabs | `PeriodTabs` | Monthly / Quarterly / Yearly |
| Period overview card | `BudgetOverviewCard` | Total spent / total budget, progress ring |
| Category breakdown list | `BudgetCategoryList` | Color-coded progress bars |
| Spending velocity card | `SpendingVelocityCard` | Daily avg, projected month-end, days left |
| Velocity warning alert | `AlertBanner` | Shows when on-track/over-track |
| Quick adjust buttons | action sheet | +5%, +10%, -5%, -10% |
| Alert config sheet | `AlertConfigSheet` | Warning %, overspend alert, email/push toggle |
| Create budget | `AddBudgetSheet` | `POST /budgets` |
| Edit budget | `EditBudgetSheet` | `PUT /budgets/{id}` |
| Delete budget | `ConfirmDialog` | `DELETE /budgets/{id}` |
| Category allocation | inside form | Per-category amount inputs |

---

### 6.6 Goals Screen
**Route:** `/goals`
**API:** `GET /goals`, `GET /goals/summary`

| Feature | Component | Notes |
|---|---|---|
| Summary stats | `GoalsSummaryBar` | Total goals, total target, total saved, progress % |
| Goal cards | `GoalCard` | Name, description, progress bar, target date, days left |
| Priority badges | `PriorityBadge` | High / Medium / Low, color-coded |
| Status badge | `StatusBadge` | Active / Completed / Paused / Cancelled |
| On-track indicator | inside card | "On Track" / "Behind" based on monthly target |
| Add goal | `AddGoalSheet` | `POST /goals` |
| Edit goal | `EditGoalSheet` | `PUT /goals/{id}` |
| Contribute to goal | `ContributeSheet` | `POST /goals/{id}/contribute` |
| Mark complete | `ConfirmDialog` | `PATCH /goals/{id}/complete` |
| Pause / Resume | action menu | `PATCH /goals/{id}/pause` |
| Delete goal | `ConfirmDialog` | `DELETE /goals/{id}` |
| Sort + filter sheet | `GoalFilterSheet` | Status, priority, sort by (progress, date, name) |

---

### 6.7 Debts Screen
**Route:** `/debts`
**API:** `GET /debts`, `GET /debts/summary`

| Feature | Component | Notes |
|---|---|---|
| Summary banner | `DebtSummaryBanner` | Active debts, total monthly payment, avg interest, paid off count |
| Debt cards | `DebtCard` | Type icon, progress bar (% paid off), stats grid |
| Stats grid per debt | inline | Current balance, interest rate, minimum payment |
| Due date + frequency badge | `Badge` | Payment frequency, next due date |
| Record payment | `RecordPaymentSheet` | `POST /debts/{id}/payments` |
| Edit debt | `EditDebtSheet` | `PUT /debts/{id}` |
| Mark as paid off | `ConfirmDialog` | `PATCH /debts/{id}/paid-off` |
| Delete debt | `ConfirmDialog` | `DELETE /debts/{id}` |
| Add debt | `AddDebtSheet` | `POST /debts` |
| Debt type selector | `DebtTypeSheet` | credit_card, personal_loan, mortgage, auto_loan, student_loan |
| Payment frequency | `FrequencyPicker` | monthly, weekly, bi-weekly |
| Paid-off debts section | collapsible | Separate list at bottom |
| Balance masking | `CurrencyText` | Reads Zustand `showBalances` |

---

### 6.8 Analytics Screen
**Route:** `/analytics`
**API:** `GET /analytics/*`

| Feature | Component | API Endpoint |
|---|---|---|
| Period selector | `PeriodPicker` | Controls all cards |
| Key metrics cards | `MetricCard` | `/analytics/overview?period=` |
| MoM comparison % | inside card | Shows ↑↓ trend arrow + % change |
| Income vs Expenses bar chart | `BarChart` (Victory) | `/analytics/cash-flow?period=` |
| Top spending categories | `CategorySpendingList` | `/categories/analytics/spending-analysis` |
| Next month forecast card | `ForecastCard` | `/analytics/forecast` |
| Forecast confidence level | `ConfidenceBadge` | Low / Medium / High |
| Forecast scenarios | expandable | Optimistic / Realistic / Pessimistic |
| Cash flow summary | `CashFlowCard` | Daily avg income, expense, net |
| Category trends table | `TrendsTable` | `/analytics/category-trends` |
| Export sheet | `ExportSheet` | `/transactions/export/data` |
| Pull-to-refresh | native | Invalidates all analytics queries |

---

### 6.9 Settings Screen
**Route:** `/settings`
**API:** `GET/PUT /user/profile`, `/user/preferences`, `/user/notification-settings`

**Tabs:** Profile · Preferences · Notifications · Privacy · Data

| Tab | Feature | API |
|---|---|---|
| **Profile** | Avatar display | `GET /user/avatar` |
| | Avatar upload + crop | `POST /user/avatar` |
| | Avatar delete | `DELETE /user/avatar` |
| | Name, email, phone, DOB display | `GET /user/profile` |
| | Edit profile form | `PUT /user/profile` |
| | Change password form | `PUT /user/password` |
| **Preferences** | Show balances toggle | Zustand `showBalances` |
| | Currency picker | `PUT /user/preferences` |
| | Date format picker | local preference |
| | Language picker | `PUT /user/preferences` |
| | Theme picker (Light/Dark/Auto) | Zustand + AsyncStorage |
| **Notifications** | Budget alerts toggle | `PUT /user/notification-settings` |
| | Bill reminders toggle | same |
| | Monthly report toggle | same |
| | Push notifications toggle | same |
| **Privacy** | Biometric auth toggle | Expo Local Authentication |
| | Auto-lock toggle | AsyncStorage |
| | Auto-lock interval | AsyncStorage |
| **Data** | Export data (JSON/CSV) | `GET /user/export-data` |
| | Clear notifications | local |
| | Sign out | clears SecureStore + Zustand |
| | App version | `Constants.expoConfig.version` |

---

### 6.10 Auth Screens

| Screen | API | Notes |
|---|---|---|
| `LoginScreen` | `POST /auth/login` | Email/password, remember me |
| `RegisterScreen` | `POST /auth/register` | Name, email, password, currency |
| `ForgotPasswordScreen` | `POST /auth/forgot-password` | Email input |
| `ResetPasswordScreen` | `POST /auth/reset-password` | Token from email deep link |

---

## 7. Navigation Structure

```
RootNavigator
├── AuthStack  (shown when !isAuthenticated)
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── ResetPassword
│
└── MainStack  (shown when isAuthenticated)
    ├── BottomTabNavigator
    │   ├── Tab: Dashboard
    │   ├── Tab: Accounts
    │   ├── Tab: Transactions     ← FAB in center
    │   ├── Tab: Budget
    │   └── Tab: More → Settings / Goals / Debts / Analytics
    │
    └── Modal Stack (full-screen modals over tabs)
        ├── TransactionDetail
        ├── AccountDetail
        ├── GoalDetail
        └── DebtDetail
```

### Bottom Tab Bar Layout (Mobile-first)

```
[ Dashboard ]  [ Accounts ]  [ + Add ]  [ Budget ]  [ More ]
      🏠              💳          ⊕          🐷         ≡
```

The center `+` FAB opens a quick-action sheet:
- Add Transaction
- Add Account
- Add Goal
- Transfer Funds

---

## 8. UI/UX Design System

### Color Palette (NativeWind / Tailwind config)

```js
// tailwind.config.js
colors: {
  primary:    { DEFAULT: '#6366f1', dark: '#818cf8' },  // Indigo
  success:    { DEFAULT: '#22c55e' },
  warning:    { DEFAULT: '#f59e0b' },
  danger:     { DEFAULT: '#ef4444' },
  background: { DEFAULT: '#ffffff', dark: '#0f172a' },
  card:       { DEFAULT: '#f8fafc', dark: '#1e293b' },
  border:     { DEFAULT: '#e2e8f0', dark: '#334155' },
  muted:      { DEFAULT: '#94a3b8' },
}
```

### Progress Bar Color Thresholds

| Usage | Condition | Color |
|---|---|---|
| Budget/Category spending | ≥ 100% | `danger` red |
| Budget/Category spending | ≥ 80% | `warning` amber |
| Budget/Category spending | < 80% | `primary` indigo |
| Debt payoff progress | any | `success` green |
| Goal progress | ≥ 100% | `success` green |
| Goal progress | on-track | `primary` indigo |
| Goal progress | behind | `warning` amber |

### Typography Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `display` | 28sp | 700 | Net worth hero number |
| `title` | 20sp | 600 | Screen headers |
| `heading` | 17sp | 600 | Card titles |
| `body` | 15sp | 400 | List items, descriptions |
| `caption` | 12sp | 400 | Dates, secondary info |
| `badge` | 10sp | 500 | Status badges |

### Spacing System

All spacing uses multiples of 4: `4 8 12 16 20 24 32 48`.

### Component Patterns

#### `CurrencyText`
All monetary values go through this component.
```tsx
<CurrencyText amount={balance} masked={!showBalances} currency="PHP" />
// shows: ₱ 15,420.50
// masked: ₱ ****
```

#### `ProgressBar`
```tsx
<ProgressBar value={spent} max={budget} size="md" colorThreshold="budget" />
```

#### `Sheet` (Bottom Sheet)
Wraps `@gorhom/bottom-sheet`. Used for Add/Edit forms instead of modals to
follow the native mobile pattern. All forms open as bottom sheets, not
full-screen pushes.

#### `ConfirmDialog`
Destructive actions (delete, mark paid off, reset data) always require
a two-tap confirmation dialog.

### Loading States

- **Initial load:** Full-page skeleton (not spinner)
- **Refetch / pull-to-refresh:** Subtle spinner in nav bar, no layout shift
- **Mutations (create/update/delete):** Button shows loading state, then optimistic update

### Haptic Feedback Points

| Action | Haptic |
|---|---|
| Swipe to delete | `impactMedium` |
| Successful mutation | `notificationSuccess` |
| Error | `notificationError` |
| Pull-to-refresh | `impactLight` |
| FAB press | `impactMedium` |

---

## 9. Authentication Flow

```
App Launch
    │
    ▼
Load token from SecureStore
    │
    ├── token exists → GET /auth/user
    │       │
    │       ├── 200 → setUser() + setToken() → MainStack
    │       └── 401 → clearAuth() → AuthStack
    │
    └── no token → AuthStack

Login Success:
    POST /auth/login → { user, token }
        │
        ├── SecureStore.setItemAsync('auth_token', token)
        ├── authStore.setToken(token)
        ├── authStore.setUser(user)
        ├── preferencesStore.setPreferences(user)
        └── navigate to MainStack

Logout:
    POST /auth/logout → then clearAuth()
        ├── SecureStore.deleteItemAsync('auth_token')
        ├── authStore.clearAuth()
        ├── queryClient.clear()              ← wipe all cached server state
        └── navigate to AuthStack
```

---

## 10. Offline & Sync Strategy

### TanStack Query Cache Config

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 min — mirrors backend cache TTL
      gcTime: 10 * 60 * 1000,         // 10 min — keep in memory
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: false,    // not applicable in mobile
      refetchOnReconnect: true,       // re-fetch when network returns
    },
  },
});
```

### Offline Behavior

| Scenario | Behavior |
|---|---|
| No network on open | Show cached data with "Offline" banner |
| Create transaction offline | Show toast "Saved locally, will sync when online" (future: optimistic + queue) |
| Network returns | TanStack Query auto-refetches stale queries |
| 401 received | Force logout, clear cache |

### Optimistic Updates (Phase 2)

For `create` and `delete` mutations, implement optimistic updates so the UI
responds instantly:

```ts
useMutation({
  mutationFn: transactionsService.delete,
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.transactions.all() });
    const previous = queryClient.getQueryData(queryKeys.transactions.all());
    queryClient.setQueryData(queryKeys.transactions.all(), (old) =>
      old.filter((t) => t.id !== id)
    );
    return { previous };
  },
  onError: (_err, _id, context) => {
    queryClient.setQueryData(queryKeys.transactions.all(), context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() });
  },
});
```

---

## 11. Forms & Validation

### React Hook Form + Zod Pattern

Every Add/Edit sheet uses the same pattern:

```ts
// schemas/transaction.schema.ts
export const createTransactionSchema = z.object({
  account_id:   z.number({ required_error: 'Account is required' }),
  category_id:  z.number({ required_error: 'Category is required' }),
  type:         z.enum(['income', 'expense', 'transfer']),
  amount:       z.number({ required_error: 'Amount is required' }).positive(),
  description:  z.string().min(1, 'Description is required'),
  date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  notes:        z.string().optional(),
  tags:         z.array(z.string()).optional(),
  is_recurring: z.boolean().default(false),
  is_cleared:   z.boolean().default(false),
  transfer_account_id: z.number().optional(),
}).refine(
  (v) => v.type !== 'transfer' || v.transfer_account_id !== undefined,
  { message: 'Destination account required for transfers', path: ['transfer_account_id'] }
);

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
```

```tsx
// screens/transactions/components/AddTransactionSheet.tsx
const { control, handleSubmit, watch, formState: { errors } } = useForm<CreateTransactionDto>({
  resolver: zodResolver(createTransactionSchema),
  defaultValues: { type: 'expense', is_cleared: false, is_recurring: false },
});

const mutation = useCreateTransaction();

const onSubmit = handleSubmit(async (data) => {
  await mutation.mutateAsync(data);
  onClose();
});
```

### Form Validation Rules (matches API)

| Field | Rule |
|---|---|
| `amount` | positive number, required |
| `date` | YYYY-MM-DD, not future for transfers |
| `password` | min 8 chars, mixed case, number, symbol |
| `email` | valid email format |
| `currency` | 3-char code |
| `transfer_account_id` | required when type = transfer, must differ from source |
| `interest_rate` | 0–100 |
| `balance` | non-negative for most account types |

---

## 12. Development Phases

### Phase 1 — Foundation (Weeks 1–2)
- [x] Expo project setup with TypeScript, NativeWind, ESLint/Prettier
- [x] Axios instance with Bearer token interceptors
- [x] Zustand stores: `auth`, `ui`, `preferences`
- [x] TanStack Query client with default config
- [x] React Navigation: RootNavigator, AuthStack, MainTabNavigator
- [x] Design system: colors, typography, spacing in `tailwind.config.js`
- [x] Shared UI components: Button, Card, Input, Badge, ProgressBar, Sheet, Dialog, Skeleton, CurrencyText

### Phase 2 — Auth & Dashboard (Weeks 3–4)
- [ ] LoginScreen, RegisterScreen, ForgotPasswordScreen
- [ ] Token persistence via SecureStore, initAuth on startup
- [ ] DashboardScreen: NetWorthCard, RecentTransactions, BudgetProgress
- [ ] AccountsScreen: account list/grid, AddAccountSheet, EditAccountSheet
- [ ] TransferSheet, AdjustBalanceSheet
- [ ] Icon picker integration with `/api/icons`

### Phase 3 — Transactions (Weeks 5–6)
- [ ] TransactionsScreen with infinite scroll
- [ ] Quick filter chips, search bar (debounced)
- [ ] AddTransactionSheet with full form (account, category, recurring, tags)
- [ ] Advanced filter sheet, sort options
- [ ] Favorites: save + quick-fill
- [ ] Duplicate transaction
- [ ] Bulk create sheet

### Phase 4 — Categories & Budget (Weeks 7–8)
- [ ] CategoriesScreen with hierarchical tree
- [ ] Add/Edit/Delete category sheets
- [ ] BudgetScreen with period tabs
- [ ] BudgetOverviewCard with spending velocity
- [ ] Add/Edit/Delete budget sheets
- [ ] Alert config sheet

### Phase 5 — Goals & Debts (Weeks 9–10)
- [ ] GoalsScreen with sort + filter
- [ ] AddGoalSheet, ContributeSheet, pause/complete/delete
- [ ] DebtsScreen with summary banner
- [ ] AddDebtSheet, RecordPaymentSheet, mark paid off

### Phase 6 — Analytics & Settings (Weeks 11–12)
- [ ] AnalyticsScreen with Victory Native XL charts
- [ ] Forecast card, category trends table
- [ ] Export sheet
- [ ] SettingsScreen tabs: Profile, Preferences, Notifications, Privacy, Data
- [ ] Avatar upload with Expo Image Picker + Manipulator
- [ ] Biometric auth with Expo Local Authentication
- [ ] Change password form

### Phase 7 — Polish (Weeks 13–14)
- [ ] Optimistic updates for create/delete mutations
- [ ] Offline banner + cached data display
- [ ] Haptic feedback on all key interactions
- [ ] Deep links for password reset
- [ ] Expo Notifications: budget alerts, bill reminders
- [ ] Pull-to-refresh on all list screens
- [ ] Performance profiling, memo/callback optimizations

---

## API Endpoint Quick Reference

| Feature | Method | Endpoint |
|---|---|---|
| Login | POST | `/auth/login` |
| Register | POST | `/auth/register` |
| Logout | POST | `/auth/logout` |
| Get current user | GET | `/auth/user` |
| Get accounts | GET | `/accounts` |
| Accounts summary | GET | `/accounts/summary` |
| Create account | POST | `/accounts` |
| Update account | PUT | `/accounts/{id}` |
| Delete account | DELETE | `/accounts/{id}` |
| Transfer | POST | `/accounts/transfer` |
| Adjust balance | POST | `/accounts/{id}/adjust-balance` |
| Get transactions | GET | `/transactions` |
| Create transaction | POST | `/transactions` |
| Update transaction | PUT | `/transactions/{id}` |
| Delete transaction | DELETE | `/transactions/{id}` |
| Recent transactions | GET | `/transactions/recent/list` |
| Favorites list | GET | `/transactions/favorites` |
| Save favorite | POST | `/transactions/favorites` |
| Delete favorite | DELETE | `/transactions/favorites/{id}` |
| Bulk create | POST | `/transactions/bulk` |
| Get categories | GET | `/categories` |
| Categories summary | GET | `/categories/analytics/summary` |
| Spending analysis | GET | `/categories/analytics/spending-analysis` |
| Create category | POST | `/categories` |
| Update category | PUT | `/categories/{id}` |
| Delete category | DELETE | `/categories/{id}` |
| Get budgets | GET | `/budgets` |
| Create budget | POST | `/budgets` |
| Update budget | PUT | `/budgets/{id}` |
| Delete budget | DELETE | `/budgets/{id}` |
| Get goals | GET | `/goals` |
| Create goal | POST | `/goals` |
| Contribute to goal | POST | `/goals/{id}/contribute` |
| Complete goal | PATCH | `/goals/{id}/complete` |
| Get debts | GET | `/debts` |
| Create debt | POST | `/debts` |
| Record debt payment | POST | `/debts/{id}/payments` |
| Mark debt paid off | PATCH | `/debts/{id}/paid-off` |
| Analytics overview | GET | `/analytics/overview` |
| Cash flow | GET | `/analytics/cash-flow` |
| Forecast | GET | `/analytics/forecast` |
| User profile | GET | `/user/profile` |
| Update profile | PUT | `/user/profile` |
| Upload avatar | POST | `/user/avatar` |
| Delete avatar | DELETE | `/user/avatar` |
| User preferences | GET | `/user/preferences` |
| Update preferences | PUT | `/user/preferences` |
| Notification settings | GET/PUT | `/user/notification-settings` |
| Export data | GET | `/user/export-data` |
| Get icons | GET | `/icons` |
| Upload icon | POST | `/icons` |

---

*Full API contract in `API-DOCUMENTATION.md`.*

---

## 13. TypeScript Type Definitions

All types live in `src/types/`. They mirror the web app's types but are stripped
of Vue-specific imports so they are framework-agnostic.

### `api.types.ts`
```ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    summary?: Record<string, unknown>;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
```

### `auth.types.ts`
```ts
export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | null;
  avatar_url?: string | null;
  currency: string;
  timezone: string;
  language: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginDto {
  login: string;
  password: string;
  remember?: boolean;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  currency?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: 'Bearer';
}
```

### `account.types.ts`
```ts
export type AccountType = 'cash' | 'bank' | 'credit_card' | 'investment' | 'ewallet';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: AccountType;
  balance: number;
  initial_balance: number;
  currency: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  is_included_in_total: boolean;
  credit_limit?: number;
  description?: string;
  institution?: string;
  account_number?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountSummary {
  total_accounts: number;
  total_balance: number;
  net_worth: number;
  accounts_by_type: Record<string, { count: number; total_balance: number }>;
  currency: string;
  currency_symbol: string;
  credit_utilization?: {
    total_credit_used: number;
    total_credit_limit: number;
    utilization_percentage: number;
    available_credit: number;
  };
}

export interface CreateAccountDto {
  name: string;
  type: AccountType;
  balance: number;
  currency?: string;
  color?: string;
  icon?: string;
  description?: string;
  account_number?: string;
  institution?: string;
  credit_limit?: number;
  is_included_in_total?: boolean;
}

export interface UpdateAccountDto extends Partial<CreateAccountDto> {
  is_active?: boolean;
}

export interface TransferDto {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  description: string;
  transaction_fee?: number;
  date?: string;
  notes?: string;
  reference_number?: string;
}
```

### `transaction.types.ts`
```ts
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  notes?: string;
  tags?: string[];
  is_cleared: boolean;
  is_recurring: boolean;
  reference_number?: string;
  transfer_account_id?: number;
  created_at: string;
  updated_at: string;
  // Relations
  account?: { id: number; name: string; type: string; icon?: string; color?: string };
  category?: { id: number; name: string; icon: string; color: string };
}

export interface FavoriteTransaction {
  id: number;
  name: string;
  type: TransactionType;
  amount?: number;
  description?: string;
  account_id?: number;
  category_id?: number;
  notes?: string;
  tags?: string[];
}

export interface TransactionFilters {
  page?: number;
  per_page?: number;
  account_id?: number;
  category_id?: number;
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  tags?: string[];
  is_cleared?: boolean;
  is_recurring?: boolean;
  sort_by?: 'date' | 'amount' | 'description';
  sort_direction?: 'asc' | 'desc';
}

export interface CreateTransactionDto {
  account_id: number;
  category_id: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  notes?: string;
  tags?: string[];
  is_cleared?: boolean;
  is_recurring?: boolean;
  reference_number?: string;
  transfer_account_id?: number;
}
```

### `category.types.ts`
```ts
export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  is_active: boolean;
  parent_id: number | null;
  sort_order: number;
  budget_amount?: number;
  spent_amount?: number;
  transaction_count?: number;
  children?: Category[];
}

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  description?: string;
  parent_id?: number;
  sort_order?: number;
  budget_amount?: number;
  is_active?: boolean;
}
```

### `budget.types.ts`
```ts
export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly';

export interface Budget {
  id: number;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  period: BudgetPeriod;
  category_id?: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  category?: { id: number; name: string; icon: string; color: string };
}

export interface CreateBudgetDto {
  name: string;
  amount: number;
  period: BudgetPeriod;
  category_id?: number;
  start_date: string;
  end_date?: string;
  is_active?: boolean;
}
```

### `goal.types.ts`
```ts
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type GoalPriority = 'high' | 'medium' | 'low';

export interface Goal {
  id: number;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  target_date: string;
  status: GoalStatus;
  priority: GoalPriority;
  color?: string;
  monthly_target?: number;
  days_remaining?: number;
  is_on_track?: boolean;
  created_at: string;
}

export interface CreateGoalDto {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  priority?: GoalPriority;
  color?: string;
}

export interface ContributeGoalDto {
  amount: number;
  date?: string;
  notes?: string;
}
```

### `debt.types.ts`
```ts
export type DebtType =
  | 'credit_card'
  | 'personal_loan'
  | 'mortgage'
  | 'auto_loan'
  | 'student_loan';
export type DebtStatus = 'active' | 'paid_off' | 'closed';
export type PaymentFrequency = 'monthly' | 'weekly' | 'bi_weekly';

export interface Debt {
  id: number;
  name: string;
  type: DebtType;
  original_balance: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: string;
  payment_frequency: PaymentFrequency;
  status: DebtStatus;
  notes?: string;
  paid_off_percentage: number;
  created_at: string;
}

export interface DebtSummary {
  total_active_debts: number;
  total_debt_balance: number;
  total_monthly_payment: number;
  average_interest_rate: number;
  paid_off_count: number;
}

export interface CreateDebtDto {
  name: string;
  type: DebtType;
  original_balance: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: string;
  payment_frequency: PaymentFrequency;
  notes?: string;
}

export interface RecordPaymentDto {
  amount: number;
  date?: string;
  notes?: string;
}
```

---

## 14. Complete TanStack Query Hook Implementations

All hooks live in `src/hooks/`. They import from services and use
the centralized `queryKeys` constant.

### `useAccounts.ts`
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '@/services/accounts.service';
import { queryKeys } from '@/constants/queryKeys';
import { CreateAccountDto, TransferDto, UpdateAccountDto } from '@/types/account.types';

export const useAccounts = () =>
  useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => accountsService.getAccounts().then((r) => r.data),
  });

export const useAccountsSummary = () =>
  useQuery({
    queryKey: queryKeys.accounts.summary,
    queryFn: () => accountsService.getSummary().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useAccountTypes = () =>
  useQuery({
    queryKey: queryKeys.accounts.types,
    queryFn: () => accountsService.getTypes().then((r) => r.data),
    staleTime: Infinity, // static data, never stale
  });

export const useCreateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccountDto) => accountsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.summary });
    },
  });
};

export const useUpdateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccountDto }) =>
      accountsService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.summary });
    },
  });
};

export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.summary });
    },
  });
};

export const useTransfer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferDto) => accountsService.transfer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.summary });
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all() });
    },
  });
};
```

### `useTransactions.ts`
```ts
import {
  useInfiniteQuery, useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import { transactionsService } from '@/services/transactions.service';
import { queryKeys } from '@/constants/queryKeys';
import { CreateTransactionDto, TransactionFilters } from '@/types/transaction.types';

export const useTransactions = (filters: TransactionFilters = {}) =>
  useInfiniteQuery({
    queryKey: queryKeys.transactions.all(filters),
    queryFn: ({ pageParam = 1 }) =>
      transactionsService.getAll({ ...filters, page: pageParam as number }),
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

export const useRecentTransactions = (limit = 5) =>
  useQuery({
    queryKey: queryKeys.transactions.recent,
    queryFn: () =>
      transactionsService.getRecent({ limit }).then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  });

export const useFavoriteTransactions = () =>
  useQuery({
    queryKey: queryKeys.transactions.favorites,
    queryFn: () => transactionsService.getFavorites().then((r) => r.data),
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionDto) =>
      transactionsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.summary });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTransactionDto> }) =>
      transactionsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.summary });
    },
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transactionsService.delete(id),
    onMutate: async (id) => {
      // Optimistic update — remove from all cached transaction pages
      await qc.cancelQueries({ queryKey: ['transactions'] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: queryKeys.accounts.summary });
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export const useSaveFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactionsService.saveFavorite,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.transactions.favorites }),
  });
};

export const useDeleteFavorite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transactionsService.deleteFavorite(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.transactions.favorites }),
  });
};
```

### `useCategories.ts`
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { queryKeys } from '@/constants/queryKeys';
import { CreateCategoryDto } from '@/types/category.types';

export const useCategories = (type?: 'income' | 'expense') =>
  useQuery({
    queryKey: [...queryKeys.categories.all, { type }],
    queryFn: () =>
      categoriesService.getAll({ type }).then((r) => r.data),
  });

export const useCategoriesSummary = () =>
  useQuery({
    queryKey: queryKeys.categories.summary,
    queryFn: () => categoriesService.getSummary().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useSpendingAnalysis = (period: string) =>
  useQuery({
    queryKey: queryKeys.categories.spending(period),
    queryFn: () =>
      categoriesService.getSpendingAnalysis({ period }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCategoryDto> }) =>
      categoriesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
};
```

### `useDebts.ts`
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debtsService } from '@/services/debts.service';
import { queryKeys } from '@/constants/queryKeys';
import { CreateDebtDto, RecordPaymentDto, UpdateDebtDto } from '@/types/debt.types';

export const useDebts = () =>
  useQuery({
    queryKey: queryKeys.debts.all,
    queryFn: () => debtsService.getAll().then((r) => r.data),
  });

export const useDebtsSummary = () =>
  useQuery({
    queryKey: queryKeys.debts.summary,
    queryFn: () => debtsService.getSummary().then((r) => r.data),
  });

export const useCreateDebt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDebtDto) => debtsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.debts.all }),
  });
};

export const useUpdateDebt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDebtDto }) =>
      debtsService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.debts.all }),
  });
};

export const useDeleteDebt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => debtsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.debts.all }),
  });
};

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecordPaymentDto }) =>
      debtsService.recordPayment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      qc.invalidateQueries({ queryKey: queryKeys.debts.summary });
    },
  });
};

export const useMarkDebtPaidOff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => debtsService.markPaidOff(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.debts.all });
      qc.invalidateQueries({ queryKey: queryKeys.debts.summary });
    },
  });
};
```

### `useAnalytics.ts`
```ts
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { queryKeys } from '@/constants/queryKeys';

export const useAnalyticsOverview = (period: string) =>
  useQuery({
    queryKey: queryKeys.analytics.overview(period),
    queryFn: () =>
      analyticsService.getOverview({ period }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useCashFlow = (period: string) =>
  useQuery({
    queryKey: queryKeys.analytics.cashFlow(period),
    queryFn: () =>
      analyticsService.getCashFlow({ period }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

export const useForecast = () =>
  useQuery({
    queryKey: ['analytics', 'forecast'],
    queryFn: () => analyticsService.getForecast().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

export const useCategoryTrends = (months = 6) =>
  useQuery({
    queryKey: queryKeys.analytics.trends(months),
    queryFn: () =>
      analyticsService.getCategoryTrends({ months }).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
```

---

## 15. Zod Validation Schemas

All schemas live in `src/schemas/`. Used by React Hook Form via `zodResolver`.

### `auth.schema.ts`
```ts
import { z } from 'zod';

export const loginSchema = z.object({
  login:    z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const registerSchema = z.object({
  name:                  z.string().min(2, 'Name must be at least 2 characters'),
  email:                 z.string().email('Invalid email address'),
  password:              z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  password_confirmation: z.string(),
  currency:              z.string().length(3).optional(),
}).refine((v) => v.password === v.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

export const changePasswordSchema = z.object({
  current_password:      z.string().min(1, 'Current password is required'),
  new_password:          z
    .string()
    .min(8)
    .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  new_password_confirmation: z.string(),
}).refine((v) => v.new_password === v.new_password_confirmation, {
  message: 'Passwords do not match',
  path: ['new_password_confirmation'],
});
```

### `account.schema.ts`
```ts
import { z } from 'zod';

const ACCOUNT_TYPES = ['cash', 'bank', 'credit_card', 'investment', 'ewallet'] as const;

export const createAccountSchema = z.object({
  name:                    z.string().min(1, 'Account name is required'),
  type:                    z.enum(ACCOUNT_TYPES, { required_error: 'Account type is required' }),
  balance:                 z.number({ required_error: 'Balance is required' }),
  currency:                z.string().length(3).optional(),
  color:                   z.string().optional(),
  icon:                    z.string().optional(),
  description:             z.string().optional(),
  account_number:          z.string().optional(),
  institution:             z.string().optional(),
  credit_limit:            z.number().positive().optional(),
  is_included_in_total:    z.boolean().optional(),
});

export const transferSchema = z.object({
  from_account_id: z.number({ required_error: 'Source account is required' }),
  to_account_id:   z.number({ required_error: 'Destination account is required' }),
  amount:          z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
  description:     z.string().min(1, 'Description is required'),
  transaction_fee: z.number().min(0).optional(),
  date:            z.string().optional(),
  notes:           z.string().optional(),
  reference_number: z.string().optional(),
}).refine((v) => v.from_account_id !== v.to_account_id, {
  message: 'Source and destination accounts must differ',
  path: ['to_account_id'],
});
```

### `transaction.schema.ts`
```ts
import { z } from 'zod';

const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const;

export const createTransactionSchema = z.object({
  account_id:          z.number({ required_error: 'Account is required' }),
  category_id:         z.number({ required_error: 'Category is required' }),
  type:                z.enum(TRANSACTION_TYPES, { required_error: 'Type is required' }),
  amount:              z.number({ required_error: 'Amount is required' }).positive('Must be positive'),
  description:         z.string().min(1, 'Description is required'),
  date:                z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  notes:               z.string().optional(),
  tags:                z.array(z.string()).optional(),
  is_cleared:          z.boolean().default(false),
  is_recurring:        z.boolean().default(false),
  reference_number:    z.string().optional(),
  transfer_account_id: z.number().optional(),
}).refine(
  (v) => v.type !== 'transfer' || v.transfer_account_id !== undefined,
  { message: 'Destination account required for transfers', path: ['transfer_account_id'] },
);

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
```

### `category.schema.ts`
```ts
import { z } from 'zod';

const CATEGORY_TYPES = ['income', 'expense', 'both'] as const;

export const createCategorySchema = z.object({
  name:          z.string().min(1, 'Category name is required'),
  type:          z.enum(CATEGORY_TYPES, { required_error: 'Type is required' }),
  color:         z.string().optional(),
  icon:          z.string().optional(),
  description:   z.string().optional(),
  parent_id:     z.number().optional(),
  budget_amount: z.number().min(0).optional(),
  is_active:     z.boolean().optional(),
});
```

### `goal.schema.ts`
```ts
import { z } from 'zod';

const PRIORITIES = ['high', 'medium', 'low'] as const;

export const createGoalSchema = z.object({
  name:          z.string().min(1, 'Goal name is required'),
  description:   z.string().optional(),
  target_amount: z.number({ required_error: 'Target amount is required' }).positive(),
  target_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  priority:      z.enum(PRIORITIES).default('medium'),
  color:         z.string().optional(),
});

export const contributeGoalSchema = z.object({
  amount: z.number({ required_error: 'Amount is required' }).positive(),
  date:   z.string().optional(),
  notes:  z.string().optional(),
});
```

### `debt.schema.ts`
```ts
import { z } from 'zod';

const DEBT_TYPES = [
  'credit_card', 'personal_loan', 'mortgage', 'auto_loan', 'student_loan',
] as const;
const FREQUENCIES = ['monthly', 'weekly', 'bi_weekly'] as const;

export const createDebtSchema = z.object({
  name:              z.string().min(1, 'Name is required'),
  type:              z.enum(DEBT_TYPES, { required_error: 'Debt type is required' }),
  original_balance:  z.number({ required_error: 'Original balance is required' }).positive(),
  current_balance:   z.number({ required_error: 'Current balance is required' }).min(0),
  interest_rate:     z.number().min(0).max(100),
  minimum_payment:   z.number().min(0),
  due_date:          z.string().optional(),
  payment_frequency: z.enum(FREQUENCIES).default('monthly'),
  notes:             z.string().optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.number({ required_error: 'Amount is required' }).positive(),
  date:   z.string().optional(),
  notes:  z.string().optional(),
});
```

---

## 16. React Navigation Type Definitions

```ts
// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// ── Auth Stack ─────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string; email: string };
};

// ── Main Bottom Tabs ───────────────────────────────────────────────────────────
export type MainTabParamList = {
  Dashboard:    undefined;
  Accounts:     undefined;
  Transactions: { prefilter?: { account_id?: number; category_id?: number } };
  Budget:       undefined;
  More:         undefined;
};

// ── More Stack (Goals, Debts, Analytics, Settings) ────────────────────────────
export type MoreStackParamList = {
  MoreMenu:    undefined;
  Goals:       undefined;
  Debts:       undefined;
  Analytics:   undefined;
  Settings:    undefined;
  // Settings sub-screens
  EditProfile: undefined;
  ChangePassword: undefined;
};

// ── Root Navigator ─────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth:            NavigatorScreenParams<AuthStackParamList>;
  Main:            NavigatorScreenParams<MainTabParamList>;
  // Full-screen modals (render over tabs)
  AccountDetail:   { accountId: number };
  TransactionDetail: { transactionId: number };
  GoalDetail:      { goalId: number };
  DebtDetail:      { debtId: number };
};

// ── Typed navigation hooks ─────────────────────────────────────────────────────
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type RootNavProp = NativeStackNavigationProp<RootStackParamList>;

// Per-screen props factory
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainScreenProps<T extends keyof MainTabParamList> =
  NativeStackScreenProps<MainTabParamList, T>;
```

```tsx
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores/auth.store';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import AccountDetailScreen from '@/screens/accounts/AccountDetailScreen';
import TransactionDetailScreen from '@/screens/transactions/TransactionDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="AccountDetail"
              component={AccountDetailScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 17. Screen Component Templates

### Dashboard Screen
```tsx
// src/screens/dashboard/DashboardScreen.tsx
import { ScrollView, View, RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAccountsSummary } from '@/hooks/useAccounts';
import { useRecentTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useUIStore } from '@/stores/ui.store';
import NetWorthCard from './components/NetWorthCard';
import RecentTransactionsList from './components/RecentTransactionsList';
import BudgetProgressList from './components/BudgetProgressList';
import DashboardSkeleton from './components/DashboardSkeleton';
import EmptyDashboard from './components/EmptyDashboard';

export default function DashboardScreen() {
  const qc = useQueryClient();
  const { data: summary, isLoading: summaryLoading } = useAccountsSummary();
  const { data: transactions, isLoading: txLoading } = useRecentTransactions(5);
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const showBalances = useUIStore((s) => s.showBalances);

  const isLoading = summaryLoading || txLoading || budgetsLoading;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['accounts', 'transactions', 'budgets'] });
    setRefreshing(false);
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="p-4 gap-4">
        <NetWorthCard summary={summary} showBalances={showBalances} />
        <RecentTransactionsList transactions={transactions ?? []} />
        <BudgetProgressList budgets={budgets ?? []} />
      </View>
    </ScrollView>
  );
}
```

### Transactions Screen
```tsx
// src/screens/transactions/TransactionsScreen.tsx
import { FlatList, View } from 'react-native';
import { useState, useCallback } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionFilters } from '@/types/transaction.types';
import SearchInput from '@/components/ui/SearchInput';
import FilterChips from './components/FilterChips';
import TransactionItem from './components/TransactionItem';
import TransactionSkeleton from './components/TransactionSkeleton';
import AddTransactionSheet from './components/AddTransactionSheet';
import FilterSheet from './components/FilterSheet';
import FAB from '@/components/ui/FAB';
import { useDebounce } from '@/hooks/useDebounce';

export default function TransactionsScreen() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactions({ ...filters, search: debouncedSearch });

  const transactions = data?.pages.flatMap((p) => p.data) ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 gap-2">
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search transactions..."
          onFilterPress={() => setFilterSheetOpen(true)}
        />
        <FilterChips filters={filters} onChange={setFilters} />
      </View>

      {isLoading ? (
        <TransactionSkeleton />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => String(t.id)}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isFetchingNextPage ? <TransactionSkeleton count={3} /> : null}
          contentContainerClassName="px-4 pb-24"
        />
      )}

      <FAB onPress={() => setAddSheetOpen(true)} />
      <AddTransactionSheet open={addSheetOpen} onClose={() => setAddSheetOpen(false)} />
      <FilterSheet
        open={filterSheetOpen}
        filters={filters}
        onApply={(f) => { setFilters(f); setFilterSheetOpen(false); }}
        onClose={() => setFilterSheetOpen(false)}
      />
    </View>
  );
}
```

### Add Transaction Sheet
```tsx
// src/screens/transactions/components/AddTransactionSheet.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema, CreateTransactionFormValues } from '@/schemas/transaction.schema';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import Sheet from '@/components/ui/Sheet';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import * as Haptics from 'expo-haptics';
import { toast } from '@/utils/toast';

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: Partial<CreateTransactionFormValues>;
}

export default function AddTransactionSheet({ open, onClose, prefill }: Props) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();

  const { control, handleSubmit, watch, reset, formState: { errors } } =
    useForm<CreateTransactionFormValues>({
      resolver: zodResolver(createTransactionSchema),
      defaultValues: {
        type: 'expense',
        is_cleared: false,
        is_recurring: false,
        date: new Date().toISOString().split('T')[0],
        ...prefill,
      },
    });

  const type = watch('type');

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync(data);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Transaction added');
      reset();
      onClose();
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  });

  return (
    <Sheet open={open} onClose={onClose} title="Add Transaction" snapPoints={['90%']}>
      {/* Type selector */}
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <SegmentedControl
            options={['income', 'expense', 'transfer']}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {/* Amount */}
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <Input
            label="Amount"
            keyboardType="decimal-pad"
            value={field.value?.toString() ?? ''}
            onChangeText={(v) => field.onChange(parseFloat(v) || 0)}
            error={errors.amount?.message}
            prefix="₱"
          />
        )}
      />

      {/* Account */}
      <Controller
        control={control}
        name="account_id"
        render={({ field }) => (
          <Select
            label="Account"
            options={accounts?.map((a) => ({ label: a.name, value: a.id })) ?? []}
            value={field.value}
            onChange={field.onChange}
            error={errors.account_id?.message}
          />
        )}
      />

      {/* Category — filtered by type */}
      <Controller
        control={control}
        name="category_id"
        render={({ field }) => (
          <Select
            label="Category"
            options={
              categories
                ?.filter((c) => c.type === type || c.type === 'both')
                .map((c) => ({ label: c.name, value: c.id, icon: c.icon, color: c.color })) ?? []
            }
            value={field.value}
            onChange={field.onChange}
            error={errors.category_id?.message}
          />
        )}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Input
            label="Description"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.description?.message}
          />
        )}
      />

      {/* Date */}
      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <DatePicker
            label="Date"
            value={field.value}
            onChange={field.onChange}
            error={errors.date?.message}
          />
        )}
      />

      {/* Submit */}
      <Button
        onPress={onSubmit}
        loading={createMutation.isPending}
        className="mt-4"
      >
        Add Transaction
      </Button>
    </Sheet>
  );
}
```

---

## 18. Environment Setup & Configuration

### `.env` (root of project)
```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_APP_NAME=SpendWise
EXPO_PUBLIC_APP_VERSION=1.0.0
```

> **Never commit `.env`.** Add it to `.gitignore`.
> For CI/CD, inject via EAS Secrets or GitHub Actions secrets.

### `app.json`
```json
{
  "expo": {
    "name": "SpendWise",
    "slug": "spendwise-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6366f1"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.spendwise.mobile",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID to unlock the app"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6366f1"
      },
      "package": "com.spendwise.mobile"
    },
    "plugins": [
      "expo-secure-store",
      "expo-local-authentication",
      [
        "expo-notifications",
        { "icon": "./assets/notification-icon.png", "color": "#6366f1" }
      ]
    ],
    "extra": {
      "eas": { "projectId": "YOUR_EAS_PROJECT_ID" }
    }
  }
}
```

### `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: '#6366f1', foreground: '#ffffff', dark: '#818cf8' },
        background: { DEFAULT: '#ffffff', dark: '#0f172a' },
        card:       { DEFAULT: '#f8fafc', dark: '#1e293b' },
        border:     { DEFAULT: '#e2e8f0', dark: '#334155' },
        muted:      { DEFAULT: '#94a3b8', foreground: '#64748b' },
        success:    '#22c55e',
        warning:    '#f59e0b',
        danger:     '#ef4444',
      },
      fontFamily: {
        sans:    ['Inter_400Regular', 'sans-serif'],
        medium:  ['Inter_500Medium', 'sans-serif'],
        semibold: ['Inter_600SemiBold', 'sans-serif'],
        bold:    ['Inter_700Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### `tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Initial `package.json` dependencies
```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-secure-store": "~13.0.0",
    "expo-local-authentication": "~14.0.0",
    "expo-notifications": "~0.28.0",
    "expo-image-picker": "~15.0.0",
    "expo-image-manipulator": "~12.0.0",
    "expo-haptics": "~13.0.0",
    "react-native": "0.74.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.6.0",
    "zod": "^3.23.0",
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "@gorhom/bottom-sheet": "^4.6.0",
    "victory-native": "^41.0.0",
    "date-fns": "^3.6.0",
    "@react-native-async-storage/async-storage": "^2.0.0",
    "react-native-gesture-handler": "~2.16.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "~3.31.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.57.0",
    "prettier": "^3.3.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.5.0",
    "jest-expo": "~51.0.0"
  }
}
```

---

## 19. Testing Strategy

### Layer Breakdown

| Layer | Tool | What to Test |
|---|---|---|
| **Unit** | Jest | Pure utilities, Zod schemas, formatCurrency, color thresholds |
| **Hook** | `@testing-library/react-hooks` + MSW | TanStack Query hooks — loading, success, error, cache invalidation |
| **Component** | `@testing-library/react-native` | UI rendering, user interactions, form validation messages |
| **E2E** | Detox (or Maestro) | Critical flows: login, add transaction, check balance |

### Test Coverage Targets

| Module | Priority | Target |
|---|---|---|
| `schemas/*.schema.ts` | High | 100% — all valid + invalid inputs |
| `utils/currency.ts` | High | 100% |
| `hooks/useTransactions` | High | 90% — loading, error, infinite scroll |
| `hooks/useAccounts` | High | 90% |
| `components/ui/*` | Medium | 80% — rendering, accessibility labels |
| `screens/auth` | High | 85% — login/register flows |
| `screens/transactions` | High | 80% — add, filter, delete |

### Example Schema Test
```ts
// src/schemas/__tests__/transaction.schema.test.ts
import { createTransactionSchema } from '../transaction.schema';

describe('createTransactionSchema', () => {
  const valid = {
    account_id: 1, category_id: 2, type: 'expense' as const,
    amount: 100, description: 'Test', date: '2024-01-15',
  };

  it('accepts a valid expense', () => {
    expect(createTransactionSchema.parse(valid)).toMatchObject(valid);
  });

  it('rejects negative amount', () => {
    expect(() =>
      createTransactionSchema.parse({ ...valid, amount: -1 })
    ).toThrow('Must be positive');
  });

  it('requires transfer_account_id when type is transfer', () => {
    expect(() =>
      createTransactionSchema.parse({ ...valid, type: 'transfer' })
    ).toThrow('Destination account required');
  });

  it('rejects invalid date format', () => {
    expect(() =>
      createTransactionSchema.parse({ ...valid, date: '15-01-2024' })
    ).toThrow('Invalid date format');
  });
});
```

### Example Hook Test (MSW)
```ts
// src/hooks/__tests__/useAccounts.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { useAccounts } from '../useAccounts';
import { wrapper } from '@/test-utils/queryWrapper';

describe('useAccounts', () => {
  it('returns accounts on success', async () => {
    server.use(
      http.get('/api/accounts', () =>
        HttpResponse.json({ success: true, data: [{ id: 1, name: 'Cash', balance: 1000 }] })
      )
    );

    const { result } = renderHook(() => useAccounts(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe('Cash');
  });

  it('handles network errors gracefully', async () => {
    server.use(http.get('/api/accounts', () => HttpResponse.error()));
    const { result } = renderHook(() => useAccounts(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

### E2E Flow: Add Transaction (Maestro)
```yaml
# .maestro/add_transaction.yaml
appId: com.spendwise.mobile
---
- launchApp
- tapOn: "Transactions"
- tapOn:
    id: "fab-add-transaction"
- tapOn: "expense"
- tapOn:
    id: "input-amount"
- inputText: "150"
- tapOn:
    id: "select-account"
- tapOn: "Cash"
- tapOn:
    id: "select-category"
- tapOn: "Food & Dining"
- tapOn:
    id: "input-description"
- inputText: "Lunch"
- tapOn: "Add Transaction"
- assertVisible: "Transaction added"
- assertVisible: "Lunch"
```

---

## 20. Common Pitfalls & Rules

### Never Do These

```ts
// ❌ WRONG — service call inside Zustand
const useAccountsStore = create(() => ({
  accounts: [],
  fetch: async () => { /* API call here */ },
}));

// ❌ WRONG — calling service directly in a component
const MyScreen = () => {
  useEffect(() => {
    accountsService.getAccounts().then(setAccounts); // bypasses cache, no error handling
  }, []);
};

// ❌ WRONG — hardcoded query keys (typo-prone)
useQuery({ queryKey: ['account', 'sumary'], ... }); // won't invalidate correctly

// ❌ WRONG — storing server data in Zustand
authStore.setState({ userAccounts: response.data }); // this is TanStack Query's job
```

### Always Do These

```ts
// ✅ CORRECT — TanStack Query for server state
const { data: accounts } = useAccounts();

// ✅ CORRECT — Zustand only for UI state
const showBalances = useUIStore((s) => s.showBalances);

// ✅ CORRECT — centralized query keys
useQuery({ queryKey: queryKeys.accounts.all, ... });

// ✅ CORRECT — invalidate related queries after mutation
onSuccess: () => {
  qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
  qc.invalidateQueries({ queryKey: queryKeys.accounts.summary });
  qc.invalidateQueries({ queryKey: ['transactions'] }); // transactions affect balances
},

// ✅ CORRECT — balance masking via shared Zustand selector
<CurrencyText amount={account.balance} masked={!showBalances} />
```

### Invalidation Rules

When any transaction is created/updated/deleted, always invalidate:
- `['transactions']` — transaction lists
- `queryKeys.accounts.all` — balances change
- `queryKeys.accounts.summary` — net worth changes
- `['budgets']` — spending totals change
- `['analytics']` — all analytics metrics change

When any account is created/updated/deleted, always invalidate:
- `queryKeys.accounts.all`
- `queryKeys.accounts.summary`

---

*Full API contract: `API-DOCUMENTATION.md` — Full web app reference: `src/pages/`*
