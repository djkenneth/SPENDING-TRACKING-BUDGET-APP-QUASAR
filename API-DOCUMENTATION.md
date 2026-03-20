# SpendWise API Documentation

> **Base URL:** `http://localhost:8000/api`
> **Auth:** Laravel Sanctum — Bearer token in `Authorization` header
> **Content-Type:** `application/json` (unless noted as multipart)

---

## Global Headers

| Header | Value | Required |
|---|---|---|
| `Content-Type` | `application/json` | All requests with body |
| `Accept` | `application/json` | All requests |
| `Authorization` | `Bearer {token}` | Protected endpoints |

---

## Response Envelope

All responses follow this structure:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {}
}
```

**Error responses:**
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Accounts](#3-accounts)
4. [Transactions](#4-transactions)
5. [Categories](#5-categories)
6. [Budgets](#6-budgets)
7. [Financial Goals](#7-financial-goals)
8. [Debts](#8-debts)
9. [Bills & Subscriptions](#9-bills--subscriptions)
10. [Notifications](#10-notifications)
11. [Analytics](#11-analytics)
12. [Currencies & Exchange Rates](#12-currencies--exchange-rates)
13. [Settings](#13-settings)
14. [Sync](#14-sync)
15. [Health](#15-health)

---

## 1. Authentication

Base path: `/api/auth`

### POST `/api/auth/register`
**Public** — Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "currency": "PHP",
  "timezone": "Asia/Manila",
  "language": "en"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Full display name |
| `email` | string | Yes | Unique email address |
| `password` | string | Yes | Min 8 characters |
| `password_confirmation` | string | Yes | Must match `password` |
| `currency` | string | No | Default: `PHP` |
| `timezone` | string | No | Default: `Asia/Manila` |
| `language` | string | No | Default: `en` |

**Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ...UserObject },
    "token": "1|abcdefghijklmnop",
    "token_type": "Bearer"
  }
}
```

---

### POST `/api/auth/login`
**Public** — Authenticate user and receive a Sanctum token.

**Request Body:**
```json
{
  "login": "john@example.com",
  "password": "password123",
  "remember": false
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `login` | string | Yes | Email or username |
| `password` | string | Yes | Account password |
| `remember` | boolean | No | Extend token lifetime |

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ...UserObject },
    "token": "2|xyzabcdefghijk",
    "token_type": "Bearer"
  }
}
```

> **Note:** No access level restrictions on the API login — any registered user can authenticate.

---

### POST `/api/auth/logout`
**Protected** — Revoke the current access token.

**Response `200`:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### POST `/api/auth/logout-all`
**Protected** — Revoke all access tokens (all devices).

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

### GET `/api/auth/user`
**Protected** — Get the currently authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...UserObject }
}
```

---

### POST `/api/auth/refresh`
**Protected** — Revoke current token and issue a new one.

**Response `200`:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "3|newtoken123456",
    "token_type": "Bearer"
  }
}
```

---

### POST `/api/auth/change-password`
**Protected** — Change the authenticated user's password.

**Request Body:**
```json
{
  "current_password": "currentPassword123",
  "password": "newPassword123!",
  "password_confirmation": "newPassword123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### POST `/api/auth/forgot-password`
**Public** — Send a password reset link to email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

---

### POST `/api/auth/reset-password`
**Public** — Reset password using the token from email.

**Request Body:**
```json
{
  "email": "john@example.com",
  "token": "reset-token-from-email",
  "password": "newPassword123!",
  "password_confirmation": "newPassword123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### POST `/api/auth/verify-email`
**Protected** — Mark the authenticated user's email as verified.

**Request Body:**
```json
{
  "token": "verification-token"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### POST `/api/auth/resend-verification`
**Protected** — Resend the email verification notification.

**Response `200`:**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

## 2. User Management

Base path: `/api/user` — All endpoints **Protected**.

### GET `/api/user/profile`
Get the authenticated user's full profile.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "john_doe",
    "avatar": null,
    "phone": "+639123456789",
    "date_of_birth": "1990-01-01",
    "currency": "PHP",
    "timezone": "Asia/Manila",
    "language": "en",
    "preferences": {},
    "last_login_at": "2024-01-15T10:00:00Z",
    "is_active": true
  }
}
```

---

### PUT `/api/user/profile`
Update the authenticated user's profile.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+639123456789",
  "date_of_birth": "1990-01-01",
  "currency": "USD",
  "timezone": "America/New_York",
  "language": "en"
}
```

All fields are optional — send only what needs updating.

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ...UserObject }
}
```

---

### PUT `/api/user/password`
Change the user's password.

**Request Body:**
```json
{
  "current_password": "currentPass123",
  "password": "newPass123!",
  "password_confirmation": "newPass123!"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### POST `/api/user/avatar`
Upload a new avatar image.

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `avatar` | file (image) | Yes |

**Response `200`:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "https://example.com/storage/avatars/user1.jpg"
  }
}
```

---

### DELETE `/api/user/avatar`
Remove the user's avatar.

**Response `200`:**
```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

---

### GET `/api/user/preferences`
Get user preferences (currency, timezone, language).

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "currency": "PHP",
    "timezone": "Asia/Manila",
    "language": "en",
    "preferences": {},
    "currency_symbol": "₱"
  }
}
```

---

### PUT `/api/user/preferences`
Update user preferences.

**Request Body:**
```json
{
  "currency": "USD",
  "timezone": "America/New_York",
  "language": "en",
  "preferences": {
    "theme": "dark",
    "notifications_enabled": true
  }
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": { ...preferences }
}
```

---

### GET `/api/user/settings`
Get all user settings as key-value pairs.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "budget_alerts": "true",
    "bill_reminders": "true"
  }
}
```

---

### PUT `/api/user/settings`
Update user settings.

**Request Body:**
```json
{
  "settings": {
    "theme": "dark",
    "date_format": "MM/DD/YYYY"
  }
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

### GET `/api/user/dashboard-stats`
**Cached (5 min)** — Get dashboard statistics for the current user.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "net_worth": 50000,
    "total_accounts": 5,
    "total_categories": 15,
    "current_month_income": 5000,
    "current_month_expenses": 3000,
    "total_transactions": 250,
    "active_budgets": 8,
    "active_goals": 3,
    "active_debts": 2,
    "upcoming_bills": 4,
    "unread_notifications": 2,
    "currency_symbol": "₱"
  }
}
```

---

### GET `/api/user/activity-summary`
**Cached (5 min)** — Get user activity summary.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `days` | integer | 30 | Number of days to look back |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "transactions_count": 45,
    "recent_transactions": [
      {
        "id": 1,
        "description": "Groceries",
        "amount": 150.50,
        "type": "expense",
        "date": "2024-01-15",
        "account": "Cash",
        "category": "Food & Dining"
      }
    ],
    "budget_utilization": 75.5,
    "goals_progress": 60.0
  }
}
```

---

### GET `/api/user/account-summary`
**Cached (5 min)** — Get a summary of all user accounts.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_balance": 25000,
    "accounts_by_type": {
      "bank": { "count": 2, "total_balance": 20000 },
      "cash": { "count": 1, "total_balance": 5000 }
    },
    "accounts": [ ...AccountObjects ]
  }
}
```

---

### GET `/api/user/notification-settings`
Get notification preferences.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "budget_alerts": true,
    "bill_reminders": true,
    "goal_milestones": true,
    "low_balance_alerts": true,
    "transaction_notifications": false,
    "email_notifications": true,
    "push_notifications": true,
    "sms_notifications": false
  }
}
```

---

### PUT `/api/user/notification-settings`
Update notification preferences. All fields are optional.

**Request Body:**
```json
{
  "budget_alerts": true,
  "bill_reminders": false,
  "goal_milestones": true,
  "low_balance_alerts": true,
  "transaction_notifications": false,
  "email_notifications": true,
  "push_notifications": true,
  "sms_notifications": false
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully"
}
```

---

### GET `/api/user/security-info`
Get account security information.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "email_verified": true,
    "email_verified_at": "2024-01-01T00:00:00Z",
    "last_login_at": "2024-01-15T10:00:00Z",
    "last_login_ip": "192.168.1.1",
    "active_sessions": 3,
    "two_factor_enabled": false,
    "backup_codes_generated": false
  }
}
```

---

### GET `/api/user/active-sessions`
List all active Sanctum tokens.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "auth_token",
      "last_used_at": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "is_current": true
    }
  ]
}
```

---

### DELETE `/api/user/sessions/{token_id}`
Revoke a specific session by token ID.

**Path Parameter:** `token_id` (integer)

> Cannot revoke the currently active session.

**Response `200`:**
```json
{
  "success": true,
  "message": "Session revoked successfully"
}
```

---

### GET `/api/user/export-data`
Export all user data as JSON.

**Response `200`:**
```json
{
  "success": true,
  "message": "Data exported successfully",
  "data": {
    "user": { ...UserObject },
    "accounts": [...],
    "categories": [...],
    "transactions": [...],
    "budgets": [...],
    "financial_goals": [...],
    "debts": [...],
    "bills": [...],
    "settings": {},
    "exported_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### DELETE `/api/user/delete-account`
Permanently delete the user account and all data.

**Request Body:**
```json
{
  "password": "password123",
  "confirmation": "DELETE"
}
```

> `confirmation` must be the string `"DELETE"` exactly.

**Response `200`:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## 3. Accounts

Base path: `/api/accounts` — All endpoints **Protected**.

### GET `/api/accounts`
List all user accounts.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `type` | string | Filter: `cash`, `bank`, `credit_card`, `investment`, `ewallet` |
| `is_active` | boolean | Filter by active status |
| `include_inactive` | boolean | Include inactive accounts (default: false) |

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...AccountObjects ],
  "meta": {
    "total": 5,
    "total_balance": 50000,
    "net_worth": 45000,
    "currency": "PHP",
    "currency_symbol": "₱"
  }
}
```

---

### POST `/api/accounts`
Create a new account.

**Request Body:**
```json
{
  "name": "Main Bank Account",
  "type": "bank",
  "balance": 1000.50,
  "currency": "PHP",
  "color": "#2196F3",
  "icon": "account_balance",
  "description": "My primary savings account",
  "account_number": "1234567890",
  "institution": "BDO",
  "credit_limit": null,
  "include_in_net_worth": true,
  "is_active": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Account name |
| `type` | string | Yes | `cash`, `bank`, `credit_card`, `investment`, `ewallet` |
| `balance` | number | Yes | Initial balance |
| `currency` | string | No | Default: user currency |
| `color` | string | No | Hex color code |
| `icon` | string | No | Icon identifier |
| `description` | string | No | Description |
| `account_number` | string | No | Account number |
| `institution` | string | No | Bank/institution name |
| `credit_limit` | number | No | Credit cards only |
| `include_in_net_worth` | boolean | No | Default: true |
| `is_active` | boolean | No | Default: true |

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": { ...AccountObject }
}
```

---

### GET `/api/accounts/{account}`
Get a specific account with statistics.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Bank",
    "type": "bank",
    "balance": 15000,
    "statistics": {
      "total_income": 10000,
      "total_expenses": 8000,
      "transaction_count": 150,
      "average_transaction": 133.33
    }
  }
}
```

---

### PUT `/api/accounts/{account}`
Update an account.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Account Name",
  "balance": 2000,
  "color": "#4CAF50",
  "icon": "account_balance_wallet",
  "description": "Updated description",
  "credit_limit": 75000,
  "include_in_net_worth": true,
  "is_active": true
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Account updated successfully",
  "data": { ...AccountObject }
}
```

---

### DELETE `/api/accounts/{account}`
Delete an account.

> Returns `400` if the account has transactions that prevent deletion.

**Response `200`:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### GET `/api/accounts/types`
Get all available account types and configurations.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "cash": {
      "name": "Cash",
      "description": "Physical cash and petty cash",
      "icon": "account_balance_wallet",
      "color": "#4CAF50",
      "supports_credit_limit": false,
      "default_include_in_net_worth": true
    },
    "bank": { ... },
    "credit_card": { ... },
    "investment": { ... },
    "ewallet": { ... }
  }
}
```

---

### GET `/api/accounts/summary`
**Cached (5 min)** — Get accounts summary with totals and credit utilization.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_accounts": 5,
    "total_balance": 50000,
    "net_worth": 45000,
    "accounts_by_type": {
      "bank": { "count": 2, "total_balance": 40000, "average_balance": 20000 }
    },
    "currency": "PHP",
    "currency_symbol": "₱",
    "credit_utilization": {
      "total_credit_used": 5000,
      "total_credit_limit": 50000,
      "utilization_percentage": 10.00,
      "available_credit": 45000
    }
  }
}
```

---

### GET `/api/accounts/{account}/transactions`
Get paginated transactions for a specific account.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number |
| `per_page` | integer | Items per page (max 100, default 20) |
| `type` | string | `income`, `expense`, `transfer` |
| `start_date` | date | Filter from date (YYYY-MM-DD) |
| `end_date` | date | Filter to date (YYYY-MM-DD) |
| `category_id` | integer | Filter by category |

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...TransactionObjects ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100,
    "from": 1,
    "to": 20
  }
}
```

---

### GET `/api/accounts/{account}/balance-history`
Get account balance history over time.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `period` | string | `week`, `month`, `quarter`, `year` (default: `month`) |
| `start_date` | date | Custom start date |
| `end_date` | date | Custom end date |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "balance": 10000,
      "change_amount": 500,
      "change_type": "transaction"
    }
  ]
}
```

---

### POST `/api/accounts/transfer`
Transfer money between two accounts.

**Request Body:**
```json
{
  "from_account_id": 1,
  "to_account_id": 2,
  "amount": 500,
  "description": "Transfer to savings",
  "date": "2024-01-15",
  "notes": "Monthly savings transfer"
}
```

| Field | Type | Required |
|---|---|---|
| `from_account_id` | integer | Yes |
| `to_account_id` | integer | Yes |
| `amount` | number | Yes |
| `description` | string | No |
| `date` | date | No |
| `notes` | string | No |

**Response `200`:**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "transfer_id": 1,
    "from_transaction": { ...TransactionObject },
    "to_transaction": { ...TransactionObject },
    "from_account_balance": 9500,
    "to_account_balance": 5500
  }
}
```

---

### POST `/api/accounts/{account}/adjust-balance`
Manually adjust an account balance to a specific value.

**Request Body:**
```json
{
  "balance": 5000,
  "reason": "Monthly reconciliation"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Account balance adjusted successfully",
  "data": { ...AccountObject }
}
```

---

### POST `/api/accounts/{account}/sync-balance`
Sync account balance with actual (reconciliation).

**Request Body:**
```json
{
  "actual_balance": 10000,
  "reason": "Bank statement reconciliation"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Account balance synced successfully",
  "data": {
    "old_balance": 9800,
    "new_balance": 10000,
    "difference": 200,
    "account": { ...AccountObject }
  }
}
```

---

### GET `/api/accounts/{account}/performance-metrics`
Get monthly performance metrics for an account.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `months` | integer | 6 | Number of months to analyze (1-24) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "monthly_data": [
      {
        "month": "2024-01",
        "income": 5000,
        "expenses": 3000,
        "net": 2000,
        "transaction_count": 25
      }
    ],
    "average_income": 5000,
    "average_expenses": 3000,
    "average_net": 2000
  }
}
```

---

### PUT `/api/accounts/bulk/update`
Update multiple accounts at once.

**Request Body:**
```json
{
  "accounts": [
    {
      "id": 1,
      "name": "Updated Name",
      "color": "#FF0000",
      "is_active": true,
      "include_in_net_worth": true
    },
    {
      "id": 2,
      "is_active": false
    }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Accounts updated successfully",
  "data": [ ...UpdatedAccountObjects ]
}
```

---

## 4. Transactions

Base path: `/api/transactions` — All endpoints **Protected**.

### GET `/api/transactions`
Get paginated transactions with filtering.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number |
| `per_page` | integer | Items per page (max 100, default 20) |
| `account_id` | integer | Filter by account |
| `category_id` | integer | Filter by category |
| `type` | string | `income`, `expense`, `transfer` |
| `start_date` | date | From date (YYYY-MM-DD) |
| `end_date` | date | To date (YYYY-MM-DD) |
| `date_from` | date | Alias for `start_date` |
| `date_to` | date | Alias for `end_date` |
| `min_amount` | number | Minimum amount |
| `max_amount` | number | Maximum amount |
| `search` | string | Search description, notes, reference |
| `tags[]` | array | Filter by tags |
| `is_cleared` | boolean | Filter cleared transactions |
| `is_recurring` | boolean | Filter recurring transactions |
| `sort_by` | string | `date`, `amount`, `description`, `created_at` |
| `sort_direction` | string | `asc`, `desc` |

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...TransactionObjects ],
  "meta": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 20,
    "total": 200,
    "from": 1,
    "to": 20,
    "summary": {
      "total_transactions": 200,
      "total_income": 50000,
      "total_expenses": 30000,
      "total_transfers": 5000,
      "net_amount": 20000,
      "average_transaction": 425,
      "transactions_by_type": {
        "income": 50,
        "expense": 130,
        "transfer": 20
      }
    }
  }
}
```

---

### POST `/api/transactions`
Create a new transaction.

**Request Body:**
```json
{
  "account_id": 1,
  "category_id": 5,
  "type": "expense",
  "amount": 150.50,
  "description": "Grocery shopping",
  "date": "2024-01-15",
  "notes": "Weekly groceries",
  "tags": ["food", "essential"],
  "is_cleared": true,
  "is_recurring": false,
  "reference_number": "TXN001",
  "transfer_account_id": null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `account_id` | integer | Yes | Source account |
| `category_id` | integer | Yes | Transaction category |
| `type` | string | Yes | `income`, `expense`, `transfer` |
| `amount` | number | Yes | Transaction amount (positive) |
| `description` | string | Yes | Transaction description |
| `date` | date | Yes | Transaction date (YYYY-MM-DD) |
| `notes` | string | No | Additional notes |
| `tags` | array | No | String tags |
| `is_cleared` | boolean | No | Default: false |
| `is_recurring` | boolean | No | Default: false |
| `reference_number` | string | No | External reference |
| `transfer_account_id` | integer | No | Required when `type = transfer` |

**Response `201`:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": { ...TransactionObject }
}
```

---

### GET `/api/transactions/{transaction}`
Get a specific transaction.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...TransactionObject }
}
```

---

### PUT `/api/transactions/{transaction}`
### PATCH `/api/transactions/{transaction}`
Update a transaction.

**Request Body:** (same fields as create, all optional)
```json
{
  "amount": 200,
  "description": "Updated description",
  "category_id": 6
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": { ...TransactionObject }
}
```

---

### DELETE `/api/transactions/{transaction}`
Delete a transaction.

**Response `200`:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

### POST `/api/transactions/bulk`
Bulk create multiple transactions.

**Request Body:**
```json
{
  "transactions": [
    {
      "account_id": 1,
      "category_id": 5,
      "type": "expense",
      "amount": 100,
      "description": "Transaction 1",
      "date": "2024-01-15"
    },
    {
      "account_id": 1,
      "category_id": 3,
      "type": "income",
      "amount": 5000,
      "description": "Salary",
      "date": "2024-01-15"
    }
  ]
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Transactions created successfully",
  "data": {
    "created_count": 2,
    "transactions": [ ...TransactionObjects ]
  }
}
```

---

### DELETE `/api/transactions/bulk`
Bulk delete transactions.

**Request Body:**
```json
{
  "transaction_ids": [1, 2, 3, 4]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Transactions deleted successfully",
  "data": {
    "deleted_count": 4
  }
}
```

---

### GET `/api/transactions/search/query`
Search transactions by text.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `query` | string | Yes | Search text (min 2 chars) |
| `type` | string | No | Filter by type |
| `account_id` | integer | No | Filter by account |
| `category_id` | integer | No | Filter by category |
| `limit` | integer | No | Max results (default 20, max 50) |

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...TransactionObjects ],
  "meta": {
    "query": "groceries",
    "total_results": 15
  }
}
```

---

### GET `/api/transactions/recent/list`
Get the most recent transactions.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 10 | Max results (max 50) |
| `days` | integer | 30 | Look-back window in days (max 90) |

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...TransactionObjects ],
  "meta": {
    "limit": 10,
    "days": 30,
    "total": 10
  }
}
```

---

### GET `/api/transactions/statistics/summary`
**Cached (5 min)** — Get transaction statistics for a period.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `period` | string | `week`, `month`, `quarter`, `year` (default: `month`) |
| `start_date` | date | Custom start date |
| `end_date` | date | Custom end date |
| `account_id` | integer | Filter by account |
| `category_id` | integer | Filter by category |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_income": 50000,
    "total_expenses": 30000,
    "net_income": 20000,
    "transaction_count": 150,
    "average_transaction": 266.67,
    "largest_expense": 5000,
    "largest_income": 25000
  }
}
```

---

### POST `/api/transactions/import/csv`
Import transactions from a CSV file.

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `csv_file` | file | CSV file to import |
| `column_mappings` | object | Map CSV columns to fields |
| `import_options` | object | Import options |

**Response `200`:**
```json
{
  "success": true,
  "message": "Transactions imported successfully",
  "data": {
    "imported": 45,
    "skipped": 3,
    "errors": []
  }
}
```

---

### GET `/api/transactions/export/data`
Export transactions to file.

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `format` | string | `csv` | `csv`, `xlsx`, `pdf` |
| `start_date` | date | | Filter from date |
| `end_date` | date | | Filter to date |
| `account_id` | integer | | Filter by account |
| `category_id` | integer | | Filter by category |
| `type` | string | | Filter by type |
| `include_attachments` | boolean | false | Include attachments |

**Response `200`:**
```json
{
  "success": true,
  "message": "Export completed successfully",
  "data": {
    "download_url": "https://example.com/storage/exports/transactions.csv",
    "file_name": "transactions_2024-01-15.csv",
    "file_size": 15240,
    "total_records": 200,
    "expires_at": "2024-01-15T11:00:00Z"
  }
}
```

---

### GET `/api/transactions/favorites`
Get saved favorite transaction templates.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Grocery Shopping",
      "type": "expense",
      "amount": 500,
      "description": "Weekly groceries",
      "account_id": 1,
      "category_id": 5
    }
  ]
}
```

---

### POST `/api/transactions/favorites`
Save a favorite transaction template.

**Request Body:**
```json
{
  "name": "Grocery Shopping",
  "type": "expense",
  "account_id": 1,
  "category_id": 5,
  "amount": 500,
  "description": "Weekly groceries",
  "notes": "",
  "tags": ["food"]
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Favorite saved successfully",
  "data": { ...FavoriteObject }
}
```

---

### DELETE `/api/transactions/favorites/{favorite}`
Delete a favorite transaction template.

**Response `200`:**
```json
{
  "success": true,
  "message": "Favorite deleted successfully"
}
```

---

## 5. Categories

Base path: `/api/categories` — All endpoints **Protected**.

### GET `/api/categories`
List all user categories.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `type` | string | Filter: `income`, `expense`, `transfer` |
| `is_active` | boolean | Filter by active status |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Food & Dining",
      "type": "expense",
      "color": "#F44336",
      "icon": "restaurant",
      "is_active": true,
      "parent_id": null,
      "sort_order": 1
    }
  ]
}
```

---

### POST `/api/categories`
Create a new category.

**Request Body:**
```json
{
  "name": "Groceries",
  "type": "expense",
  "color": "#4CAF50",
  "icon": "shopping_cart",
  "description": "Grocery purchases",
  "parent_id": null,
  "sort_order": 1,
  "is_active": true
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | Yes |
| `type` | string | Yes — `income`, `expense`, `transfer` |
| `color` | string | No — hex code |
| `icon` | string | No |
| `description` | string | No |
| `parent_id` | integer | No — for subcategories |
| `sort_order` | integer | No |
| `is_active` | boolean | No — default true |

**Response `201`:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": { ...CategoryObject }
}
```

---

### GET `/api/categories/{category}`
Get a specific category.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...CategoryObject }
}
```

---

### PUT `/api/categories/{category}`
Update a category.

**Request Body:** (same fields as create, all optional)

**Response `200`:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ...CategoryObject }
}
```

---

### DELETE `/api/categories/{category}`
Delete a category.

**Response `200`:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### GET `/api/categories/{category}/transactions`
Get transactions for a specific category.

**Query Parameters:** `page`, `per_page`, `start_date`, `end_date`

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...TransactionObjects ],
  "meta": { ...PaginationMeta }
}
```

---

### GET `/api/categories/analytics/spending-analysis`
**Cached (5 min)** — Get spending analysis by category.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `period` | string | `week`, `month`, `quarter`, `year` |
| `start_date` | date | Custom start date |
| `end_date` | date | Custom end date |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Food & Dining",
        "total": 3500,
        "percentage": 35.0,
        "transaction_count": 45,
        "average": 77.78
      }
    ],
    "total_spending": 10000,
    "period": "month"
  }
}
```

---

### GET `/api/categories/analytics/trends`
**Cached (5 min)** — Get category spending trends over time.

**Query Parameters:** `period`, `months` (default 6)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "months": ["2024-01", "2024-02"],
    "categories": [
      {
        "id": 1,
        "name": "Food & Dining",
        "data": [3500, 3200]
      }
    ]
  }
}
```

---

### GET `/api/categories/analytics/summary`
**Cached (5 min)** — Get summary of all categories.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_categories": 15,
    "income_categories": 4,
    "expense_categories": 10,
    "transfer_categories": 1,
    "most_used": { ...CategoryObject },
    "highest_spending": { ...CategoryObject }
  }
}
```

---

### GET `/api/categories/meta/icons-and-colors`
Get available icons and color palette for categories.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "icons": ["restaurant", "shopping_cart", "car", ...],
    "colors": ["#F44336", "#E91E63", "#9C27B0", ...]
  }
}
```

---

### GET `/api/categories/meta/defaults`
Get default category templates.

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...DefaultCategoryObjects ]
}
```

---

### POST `/api/categories/meta/create-defaults`
Create default categories for the user.

**Response `201`:**
```json
{
  "success": true,
  "message": "Default categories created successfully",
  "data": [ ...CreatedCategoryObjects ]
}
```

---

### PUT `/api/categories/bulk/update`
Bulk update multiple categories.

**Request Body:**
```json
{
  "categories": [
    { "id": 1, "name": "Updated Name", "color": "#FF0000" },
    { "id": 2, "is_active": false }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Categories updated successfully",
  "data": [ ...UpdatedCategoryObjects ]
}
```

---

### PUT `/api/categories/bulk/reorder`
Reorder categories.

**Request Body:**
```json
{
  "categories": [
    { "id": 1, "sort_order": 1 },
    { "id": 2, "sort_order": 2 }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Categories reordered successfully"
}
```

---

### POST `/api/categories/merge`
Merge one category into another.

**Request Body:**
```json
{
  "source_id": 3,
  "target_id": 5
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Category merged successfully"
}
```

---

## 6. Budgets

Base path: `/api/budgets` — All endpoints **Protected**.

### GET `/api/budgets`
List all budgets.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `period` | string | `monthly`, `weekly`, `yearly` |
| `is_active` | boolean | Filter active budgets |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Food Budget",
      "amount": 5000,
      "spent": 3200,
      "remaining": 1800,
      "percentage_used": 64.0,
      "period": "monthly",
      "category_id": 5,
      "is_active": true,
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    }
  ]
}
```

---

### POST `/api/budgets`
Create a new budget.

**Request Body:**
```json
{
  "name": "Food Budget",
  "category_id": 5,
  "amount": 5000,
  "period": "monthly",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "alert_threshold": 80,
  "is_active": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Budget name |
| `category_id` | integer | Yes | Linked category |
| `amount` | number | Yes | Budget limit |
| `period` | string | Yes | `monthly`, `weekly`, `yearly` |
| `start_date` | date | Yes | Budget start |
| `end_date` | date | Yes | Budget end |
| `alert_threshold` | integer | No | Alert at % (default: 80) |
| `is_active` | boolean | No | Default: true |

**Response `201`:**
```json
{
  "success": true,
  "message": "Budget created successfully",
  "data": { ...BudgetObject }
}
```

---

### GET `/api/budgets/{budget}`
Get a specific budget.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...BudgetObject }
}
```

---

### PUT `/api/budgets/{budget}`
Update a budget.

**Request Body:** (same as create, all optional)

**Response `200`:**
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "data": { ...BudgetObject }
}
```

---

### DELETE `/api/budgets/{budget}`
Delete a budget.

**Response `200`:**
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

---

### GET `/api/budgets/current/month`
**Cached (5 min)** — Get all active budgets for the current month with spending data.

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...BudgetWithSpendingObjects ]
}
```

---

### GET `/api/budgets/{budget}/analysis`
Get detailed analysis for a specific budget.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "budget": { ...BudgetObject },
    "spending_by_day": [...],
    "top_transactions": [...],
    "projection": {
      "estimated_total": 4800,
      "will_exceed": false,
      "days_remaining": 15
    }
  }
}
```

---

### POST `/api/budgets/{budget}/reset`
Reset a budget's spending tracking.

**Response `200`:**
```json
{
  "success": true,
  "message": "Budget reset successfully"
}
```

---

### GET `/api/budgets/analytics/spending-velocity`
**Cached (5 min)** — Analyze daily spending velocity vs budget.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": 1,
        "name": "Food Budget",
        "daily_budget": 166.67,
        "daily_actual": 130,
        "velocity": 0.78
      }
    ]
  }
}
```

---

### POST `/api/budgets/bulk/quick-adjust`
Quickly adjust multiple budget amounts.

**Request Body:**
```json
{
  "adjustments": [
    { "id": 1, "amount": 6000 },
    { "id": 2, "amount": 2000 }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Budgets adjusted successfully"
}
```

---

### GET `/api/budgets/alerts/config`
Get budget alert configuration.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "default_threshold": 80,
    "budgets": [
      { "id": 1, "name": "Food Budget", "threshold": 80 }
    ]
  }
}
```

---

### PUT `/api/budgets/alerts/config`
Update budget alert configuration.

**Request Body:**
```json
{
  "default_threshold": 85,
  "budgets": [
    { "id": 1, "threshold": 90 }
  ]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Alert configuration updated successfully"
}
```

---

### GET `/api/budgets/analytics/comparison`
Compare budget vs actual spending.

**Query Parameters:** `month` (YYYY-MM), `year` (YYYY)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": 1,
        "name": "Food Budget",
        "budgeted": 5000,
        "actual": 4200,
        "variance": 800,
        "variance_percent": 16.0
      }
    ],
    "totals": {
      "budgeted": 15000,
      "actual": 12000,
      "variance": 3000
    }
  }
}
```

---

### GET `/api/budgets/analytics/category-breakdown`
**Cached (5 min)** — Get budget breakdown by category.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...CategoryBreakdownObject }
}
```

---

### GET `/api/budgets/export/csv`
Export budgets to CSV file.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "download_url": "...",
    "file_name": "budgets_2024-01.csv"
  }
}
```

---

## 7. Financial Goals

Base path: `/api/goals` — All endpoints **Protected**.

### GET `/api/goals`
List all financial goals.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `active`, `completed`, `paused` |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Emergency Fund",
      "target_amount": 50000,
      "current_amount": 30000,
      "progress_percentage": 60.0,
      "deadline": "2024-12-31",
      "status": "active",
      "category": "savings"
    }
  ]
}
```

---

### POST `/api/goals`
Create a new financial goal.

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "target_amount": 50000,
  "current_amount": 0,
  "deadline": "2024-12-31",
  "description": "6-month emergency fund",
  "category": "savings",
  "icon": "savings",
  "color": "#4CAF50",
  "account_id": 2
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | Yes |
| `target_amount` | number | Yes |
| `current_amount` | number | No — default 0 |
| `deadline` | date | No |
| `description` | string | No |
| `category` | string | No |
| `icon` | string | No |
| `color` | string | No |
| `account_id` | integer | No |

**Response `201`:**
```json
{
  "success": true,
  "message": "Financial goal created successfully",
  "data": { ...GoalObject }
}
```

---

### GET `/api/goals/{goal}`
Get a specific goal.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...GoalObject }
}
```

---

### PUT `/api/goals/{goal}`
Update a goal.

**Request Body:** (same as create, all optional)

**Response `200`:**
```json
{
  "success": true,
  "message": "Financial goal updated successfully",
  "data": { ...GoalObject }
}
```

---

### DELETE `/api/goals/{goal}`
Delete a goal.

**Response `200`:**
```json
{
  "success": true,
  "message": "Financial goal deleted successfully"
}
```

---

### POST `/api/goals/{goal}/contribute`
Add a contribution to a goal.

**Request Body:**
```json
{
  "amount": 5000,
  "notes": "Monthly contribution",
  "account_id": 2
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Contribution added successfully",
  "data": {
    "goal": { ...GoalObject },
    "transaction": { ...TransactionObject }
  }
}
```

---

### GET `/api/goals/{goal}/progress`
Get detailed progress tracking for a goal.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "goal": { ...GoalObject },
    "progress_percentage": 60.0,
    "remaining_amount": 20000,
    "days_remaining": 350,
    "required_monthly": 1714.29,
    "contributions_history": [...]
  }
}
```

---

### POST `/api/goals/{goal}/complete`
Mark a goal as completed.

**Response `200`:**
```json
{
  "success": true,
  "message": "Goal marked as completed",
  "data": { ...GoalObject }
}
```

---

## 8. Debts

Base path: `/api/debts` — All endpoints **Protected**.

### GET `/api/debts`
List all debts.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `active`, `paid_off` |
| `type` | string | Debt type |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Car Loan",
      "type": "loan",
      "principal_amount": 200000,
      "current_balance": 150000,
      "interest_rate": 12.5,
      "minimum_payment": 5000,
      "due_date": 15,
      "status": "active"
    }
  ]
}
```

---

### POST `/api/debts`
Create a new debt.

**Request Body:**
```json
{
  "name": "Car Loan",
  "type": "loan",
  "principal_amount": 200000,
  "current_balance": 200000,
  "interest_rate": 12.5,
  "minimum_payment": 5000,
  "due_date": 15,
  "lender": "BDO Bank",
  "account_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2027-01-01",
  "notes": "Car loan for Honda City"
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | Yes |
| `type` | string | Yes — `loan`, `credit_card`, `mortgage`, `personal` |
| `principal_amount` | number | Yes |
| `current_balance` | number | Yes |
| `interest_rate` | number | No |
| `minimum_payment` | number | No |
| `due_date` | integer | No — day of month (1-31) |
| `lender` | string | No |
| `account_id` | integer | No |
| `start_date` | date | No |
| `end_date` | date | No |
| `notes` | string | No |

**Response `201`:**
```json
{
  "success": true,
  "message": "Debt created successfully",
  "data": { ...DebtObject }
}
```

---

### GET `/api/debts/{debt}`
Get a specific debt.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...DebtObject }
}
```

---

### PUT `/api/debts/{debt}`
Update a debt.

**Request Body:** (same as create, all optional)

**Response `200`:**
```json
{
  "success": true,
  "message": "Debt updated successfully",
  "data": { ...DebtObject }
}
```

---

### DELETE `/api/debts/{debt}`
Delete a debt.

**Response `200`:**
```json
{
  "success": true,
  "message": "Debt deleted successfully"
}
```

---

### GET `/api/debts/types`
Get all available debt types.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "loan": { "name": "Loan", "description": "Personal or auto loans" },
    "credit_card": { "name": "Credit Card", "description": "Credit card debt" },
    "mortgage": { "name": "Mortgage", "description": "Home mortgage" }
  }
}
```

---

### GET `/api/debts/summary`
Get debt summary totals.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_debt": 350000,
    "total_monthly_payment": 15000,
    "debts_by_type": { ... },
    "debt_to_income_ratio": 0.25,
    "payoff_date_estimate": "2027-06-01"
  }
}
```

---

### POST `/api/debts/consolidation-options`
Get debt consolidation options.

**Request Body:**
```json
{
  "debt_ids": [1, 2, 3],
  "target_interest_rate": 8.0
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "potential_savings": 25000,
    "consolidation_plans": [...]
  }
}
```

---

### POST `/api/debts/{debt}/payment`
Record a payment for a debt.

**Request Body:**
```json
{
  "amount": 5000,
  "payment_date": "2024-01-15",
  "account_id": 1,
  "notes": "January payment"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "debt": { ...DebtObject },
    "transaction": { ...TransactionObject }
  }
}
```

---

### GET `/api/debts/{debt}/payment-history`
Get payment history for a debt.

**Query Parameters:** `page`, `per_page`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 5000,
      "payment_date": "2024-01-15",
      "balance_after": 145000
    }
  ],
  "meta": { ...PaginationMeta }
}
```

---

### GET `/api/debts/{debt}/payoff-schedule`
Get the full payoff schedule for a debt.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_payments": 36,
    "total_interest": 30000,
    "payoff_date": "2027-01-01",
    "schedule": [
      {
        "payment_number": 1,
        "date": "2024-02-15",
        "payment": 5000,
        "principal": 2916.67,
        "interest": 2083.33,
        "balance": 147083.33
      }
    ]
  }
}
```

---

### POST `/api/debts/{debt}/mark-paid-off`
Mark a debt as fully paid off.

**Response `200`:**
```json
{
  "success": true,
  "message": "Debt marked as paid off",
  "data": { ...DebtObject }
}
```

---

## 9. Bills & Subscriptions

Base path: `/api/bills` — All endpoints **Protected**.

### GET `/api/bills`
List all bills and subscriptions.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `active`, `paused`, `cancelled` |
| `frequency` | string | `weekly`, `monthly`, `yearly` |
| `category_id` | integer | Filter by category |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Netflix",
      "amount": 459,
      "frequency": "monthly",
      "due_date": 15,
      "category_id": 8,
      "status": "active",
      "next_due_date": "2024-02-15",
      "account_id": 1,
      "auto_pay": false
    }
  ]
}
```

---

### POST `/api/bills`
Create a new bill or subscription.

**Request Body:**
```json
{
  "name": "Netflix",
  "amount": 459,
  "frequency": "monthly",
  "due_date": 15,
  "category_id": 8,
  "account_id": 1,
  "description": "Netflix subscription",
  "website": "https://netflix.com",
  "auto_pay": false,
  "reminder_days": 3,
  "start_date": "2024-01-01"
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | Yes |
| `amount` | number | Yes |
| `frequency` | string | Yes — `weekly`, `monthly`, `quarterly`, `yearly` |
| `due_date` | integer | Yes — day of month |
| `category_id` | integer | No |
| `account_id` | integer | No |
| `description` | string | No |
| `website` | string | No |
| `auto_pay` | boolean | No |
| `reminder_days` | integer | No — days before due |
| `start_date` | date | No |

**Response `201`:**
```json
{
  "success": true,
  "message": "Bill created successfully",
  "data": { ...BillObject }
}
```

---

### GET `/api/bills/{bill}`
Get a specific bill.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...BillObject }
}
```

---

### PUT `/api/bills/{bill}`
Update a bill.

**Request Body:** (same as create, all optional)

**Response `200`:**
```json
{
  "success": true,
  "message": "Bill updated successfully",
  "data": { ...BillObject }
}
```

---

### DELETE `/api/bills/{bill}`
Delete a bill.

**Response `200`:**
```json
{
  "success": true,
  "message": "Bill deleted successfully"
}
```

---

### POST `/api/bills/{bill}/pay`
Mark a bill as paid for the current period.

**Request Body:**
```json
{
  "amount": 459,
  "payment_date": "2024-01-15",
  "account_id": 1,
  "notes": "Paid via GCash"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Bill marked as paid",
  "data": {
    "bill": { ...BillObject },
    "transaction": { ...TransactionObject },
    "next_due_date": "2024-02-15"
  }
}
```

---

### POST `/api/bills/{bill}/duplicate`
Duplicate a bill.

**Response `201`:**
```json
{
  "success": true,
  "message": "Bill duplicated successfully",
  "data": { ...NewBillObject }
}
```

---

### GET `/api/bills/status/upcoming`
Get bills due in the next 7 days.

**Query Parameters:** `days` (default 7)

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...BillObjects ],
  "meta": {
    "total": 3,
    "total_amount": 1500
  }
}
```

---

### GET `/api/bills/status/overdue`
Get overdue bills.

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...OverdueBillObjects ],
  "meta": {
    "total": 2,
    "total_amount": 800
  }
}
```

---

### GET `/api/bills/{bill}/payment-history`
Get payment history for a bill.

**Query Parameters:** `page`, `per_page`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 459,
      "payment_date": "2024-01-15",
      "notes": "Paid via GCash"
    }
  ],
  "meta": { ...PaginationMeta }
}
```

---

### GET `/api/bills/analytics/statistics`
**Cached (5 min)** — Get bill statistics and spending analysis.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total_bills": 8,
    "total_monthly_amount": 5500,
    "total_yearly_amount": 66000,
    "paid_this_month": 3,
    "overdue": 1,
    "upcoming": 4,
    "by_frequency": {
      "monthly": { "count": 6, "total": 4500 },
      "yearly": { "count": 2, "total": 1000 }
    }
  }
}
```

---

## 10. Notifications

Base path: `/api/notifications` — All endpoints **Protected**.

### GET `/api/notifications`
List all notifications with pagination.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number |
| `per_page` | integer | Items per page |
| `is_read` | boolean | Filter read/unread |
| `type` | string | Notification type |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "budget_alert",
      "title": "Budget Alert",
      "message": "Food & Dining budget is 85% used",
      "is_read": false,
      "data": {},
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": { ...PaginationMeta }
}
```

---

### POST `/api/notifications`
Create a notification (admin use).

**Request Body:**
```json
{
  "type": "budget_alert",
  "title": "Budget Alert",
  "message": "Your budget is 85% used",
  "data": {}
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": { ...NotificationObject }
}
```

---

### GET `/api/notifications/{notification}`
Get a specific notification.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...NotificationObject }
}
```

---

### DELETE `/api/notifications/{notification}`
Delete a notification.

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### PUT `/api/notifications/{notification}/read`
Mark a notification as read.

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### PUT `/api/notifications/read-all`
Mark all notifications as read.

**Response `200`:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### GET `/api/notifications/status/unread-count`
Get count of unread notifications.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

---

### GET `/api/notifications/analytics/statistics`
Get notification statistics.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "unread": 5,
    "read": 145,
    "by_type": {
      "budget_alert": 30,
      "bill_reminder": 50,
      "goal_milestone": 20
    }
  }
}
```

---

### GET `/api/notifications/user/settings`
Get notification delivery settings.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "budget_alerts": true,
    "bill_reminders": true,
    "goal_milestones": true,
    "low_balance_alerts": true,
    "email_notifications": true,
    "push_notifications": true
  }
}
```

---

### PUT `/api/notifications/user/settings`
Update notification delivery settings.

**Request Body:**
```json
{
  "budget_alerts": true,
  "bill_reminders": false,
  "email_notifications": true,
  "push_notifications": false
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully"
}
```

---

### DELETE `/api/notifications/bulk/delete`
Bulk delete notifications.

**Request Body:**
```json
{
  "notification_ids": [1, 2, 3]
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Notifications deleted successfully",
  "data": { "deleted_count": 3 }
}
```

---

### POST `/api/notifications/test/send`
Send a test notification (development only).

**Request Body:**
```json
{
  "type": "budget_alert",
  "message": "Test notification"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Test notification sent"
}
```

---

## 11. Analytics

Base path: `/api/analytics` — All endpoints **Protected** and **Cached (5 min)**.

### GET `/api/analytics/dashboard`
Get complete dashboard analytics.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "net_worth": 50000,
    "monthly_income": 25000,
    "monthly_expenses": 18000,
    "savings_rate": 28.0,
    "budget_utilization": 72.0,
    "top_spending_categories": [...],
    "recent_transactions": [...],
    "upcoming_bills": [...],
    "goal_progress": [...]
  }
}
```

---

### GET `/api/analytics/monthly-summary`
Get monthly income/expense summary.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `month` | string | Month (YYYY-MM, default: current) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "month": "2024-01",
    "total_income": 25000,
    "total_expenses": 18000,
    "net": 7000,
    "savings_rate": 28.0,
    "transaction_count": 85,
    "income_by_category": [...],
    "expense_by_category": [...]
  }
}
```

---

### GET `/api/analytics/yearly-summary`
Get yearly financial summary.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `year` | integer | Year (default: current) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "total_income": 300000,
    "total_expenses": 216000,
    "net": 84000,
    "monthly_breakdown": [...],
    "average_monthly_income": 25000,
    "average_monthly_expenses": 18000
  }
}
```

---

### GET `/api/analytics/income-vs-expenses`
Get income vs expenses comparison over time.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `period` | string | `week`, `month`, `quarter`, `year` |
| `months` | integer | Number of periods to show |
| `start_date` | date | Custom start |
| `end_date` | date | Custom end |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "income": [25000, 26000, 24000],
    "expenses": [18000, 19000, 17000],
    "net": [7000, 7000, 7000]
  }
}
```

---

### GET `/api/analytics/spending-trends`
Get spending trends over time.

**Query Parameters:** `period`, `months`, `category_id`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "total_spending": [18000, 19000, 17000],
    "categories": [
      {
        "name": "Food & Dining",
        "data": [3500, 3800, 3200]
      }
    ],
    "trend": "decreasing",
    "average": 18000
  }
}
```

---

### GET `/api/analytics/category-breakdown`
Get spending breakdown by category with percentages.

**Query Parameters:** `period`, `start_date`, `end_date`, `type` (`income`/`expense`)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Food & Dining",
        "color": "#F44336",
        "total": 3500,
        "percentage": 19.4,
        "transaction_count": 45
      }
    ],
    "total": 18000
  }
}
```

---

### GET `/api/analytics/cash-flow`
Get cash flow analysis.

**Query Parameters:** `period`, `months`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "labels": ["Jan", "Feb"],
    "inflows": [25000, 26000],
    "outflows": [18000, 19000],
    "net_cash_flow": [7000, 7000],
    "cumulative": [7000, 14000]
  }
}
```

---

### GET `/api/analytics/net-worth`
Get net worth history over time.

**Query Parameters:** `months` (default 12)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "current_net_worth": 250000,
    "history": [
      { "date": "2024-01", "net_worth": 243000, "assets": 300000, "liabilities": 57000 }
    ],
    "change_percentage": 2.9
  }
}
```

---

### GET `/api/analytics/goal-progress`
Get progress overview of all financial goals.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": 1,
        "name": "Emergency Fund",
        "target_amount": 50000,
        "current_amount": 30000,
        "progress_percentage": 60.0
      }
    ],
    "overall_progress": 58.5
  }
}
```

---

### GET `/api/analytics/budget-performance`
Get budget performance analysis.

**Query Parameters:** `month` (YYYY-MM)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": 1,
        "name": "Food Budget",
        "budgeted": 5000,
        "actual": 4200,
        "percentage_used": 84.0,
        "status": "warning"
      }
    ],
    "overall_utilization": 75.0
  }
}
```

---

### GET `/api/analytics/predictions`
Get spending/income predictions for next period.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "next_month_income": 25500,
    "next_month_expenses": 18200,
    "confidence": 0.85,
    "category_predictions": [...],
    "alerts": []
  }
}
```

---

### GET `/api/analytics/health-score`
Get overall financial health score.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "score": 72,
    "grade": "B",
    "breakdown": {
      "savings_rate": { "score": 80, "value": 28 },
      "budget_adherence": { "score": 70, "value": 75 },
      "debt_ratio": { "score": 75, "value": 25 },
      "emergency_fund": { "score": 60, "value": 3.5 }
    },
    "recommendations": [
      "Increase emergency fund to 6 months of expenses"
    ]
  }
}
```

---

### GET `/api/analytics/insights`
Get personalized financial insights and tips.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "type": "spending_pattern",
        "title": "High food spending this month",
        "message": "Food spending increased 15% vs last month",
        "severity": "warning",
        "action": "Review food budget"
      }
    ]
  }
}
```

---

### POST `/api/analytics/custom-report`
Generate a custom analytics report.

**Request Body:**
```json
{
  "report_type": "spending_analysis",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "group_by": "category",
  "include_charts": true,
  "filters": {
    "account_ids": [1, 2],
    "category_ids": [1, 2, 3],
    "transaction_types": ["expense"]
  }
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "report": { ...ReportData },
    "generated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## 12. Currencies & Exchange Rates

### GET `/api/currencies`
**Public, Cached (10 min)** — List all supported currencies.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "code": "PHP",
      "name": "Philippine Peso",
      "symbol": "₱",
      "flag": "🇵🇭"
    },
    {
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "flag": "🇺🇸"
    }
  ]
}
```

---

### POST `/api/currencies/convert`
**Public, Cached (10 min)** — Convert an amount between currencies.

**Request Body:**
```json
{
  "amount": 1000,
  "from": "PHP",
  "to": "USD",
  "date": "2024-01-15"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | number | Yes | Amount to convert |
| `from` | string | Yes | Source currency code |
| `to` | string | Yes | Target currency code |
| `date` | date | No | Rate date (default: today) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "amount": 1000,
    "from_currency": "PHP",
    "to_currency": "USD",
    "exchange_rate": 0.01786,
    "converted_amount": 17.86,
    "rate_date": "2024-01-15"
  }
}
```

---

### GET `/api/exchange-rates`
**Protected** — Get current exchange rates for user's currency.

**Query Parameters:** `base` (default: user's currency)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "base_currency": "PHP",
    "rates": {
      "USD": 0.01786,
      "EUR": 0.01643,
      "JPY": 2.67
    },
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

---

### POST `/api/exchange-rates/refresh`
**Protected** — Force refresh of exchange rates from external source.

**Response `200`:**
```json
{
  "success": true,
  "message": "Exchange rates refreshed successfully",
  "data": {
    "updated_count": 150,
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### GET `/api/exchange-rates/history`
**Protected** — Get historical exchange rate data.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `from` | string | Source currency |
| `to` | string | Target currency |
| `start_date` | date | Start date |
| `end_date` | date | End date |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "from": "PHP",
    "to": "USD",
    "history": [
      { "date": "2024-01-01", "rate": 0.01789 },
      { "date": "2024-01-02", "rate": 0.01786 }
    ]
  }
}
```

---

## 13. Settings

Base path: `/api/settings` — All endpoints **Protected**.

### GET `/api/settings`
Get all app settings.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "currency": "PHP",
    "timezone": "Asia/Manila",
    "language": "en",
    "theme": "light",
    "date_format": "MM/DD/YYYY",
    "number_format": "1,234.56"
  }
}
```

---

### PUT `/api/settings`
Update app settings.

**Request Body:**
```json
{
  "currency": "USD",
  "timezone": "America/New_York",
  "theme": "dark",
  "date_format": "DD/MM/YYYY",
  "number_format": "1.234,56"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": { ...SettingsObject }
}
```

---

### GET `/api/settings/preferences`
Get user preferences.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...PreferencesObject }
}
```

---

### PUT `/api/settings/preferences`
Update user preferences.

**Request Body:**
```json
{
  "theme": "dark",
  "language": "en",
  "compact_view": false,
  "show_cents": true
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Preferences updated successfully"
}
```

---

### POST `/api/settings/backup`
Create a data backup.

**Response `200`:**
```json
{
  "success": true,
  "message": "Backup created successfully",
  "data": {
    "backup_id": "backup_2024-01-15",
    "created_at": "2024-01-15T10:00:00Z",
    "size": 52428
  }
}
```

---

### POST `/api/settings/restore`
Restore from a backup.

**Request Body:**
```json
{
  "backup_id": "backup_2024-01-15"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Data restored successfully"
}
```

---

### POST `/api/settings/export`
Export all user data.

**Request Body:**
```json
{
  "format": "json",
  "include": ["transactions", "accounts", "categories", "budgets"]
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "download_url": "...",
    "expires_at": "2024-01-15T11:00:00Z"
  }
}
```

---

### POST `/api/settings/import`
Import data from a file.

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | file | JSON/CSV file to import |
| `type` | string | Data type to import |

**Response `200`:**
```json
{
  "success": true,
  "message": "Data imported successfully",
  "data": { "imported_count": 150 }
}
```

---

### GET `/api/settings/notifications`
Get notification settings.

**Response `200`:**
```json
{
  "success": true,
  "data": { ...NotificationSettingsObject }
}
```

---

### PUT `/api/settings/notifications`
Update notification settings.

**Request Body:**
```json
{
  "budget_alerts": true,
  "bill_reminders": true,
  "email_notifications": false,
  "push_notifications": true
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully"
}
```

---

## 14. Sync

Base path: `/api/sync` — All endpoints **Protected**.

### GET `/api/sync/status`
Get the current sync status.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "last_sync_at": "2024-01-15T09:00:00Z",
    "status": "synced",
    "pending_changes": 0,
    "conflicts": 0
  }
}
```

---

### POST `/api/sync/transactions`
Sync transactions from a client device.

**Request Body:**
```json
{
  "transactions": [
    {
      "client_id": "uuid-1234",
      "account_id": 1,
      "category_id": 5,
      "type": "expense",
      "amount": 150,
      "description": "Groceries",
      "date": "2024-01-15",
      "created_at": "2024-01-15T08:00:00Z"
    }
  ],
  "last_sync_at": "2024-01-15T08:00:00Z"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "synced_count": 5,
    "conflicts": 0,
    "server_changes": [ ...NewServerTransactions ]
  }
}
```

---

### POST `/api/sync/full`
Perform a full data sync.

**Request Body:**
```json
{
  "last_sync_at": "2024-01-10T00:00:00Z"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accounts": [ ...AccountChanges ],
    "transactions": [ ...TransactionChanges ],
    "categories": [ ...CategoryChanges ],
    "budgets": [ ...BudgetChanges ],
    "goals": [ ...GoalChanges ],
    "synced_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### GET `/api/sync/conflicts`
Get all unresolved sync conflicts.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "transaction",
      "client_version": { ... },
      "server_version": { ... },
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/sync/resolve-conflicts`
Resolve sync conflicts.

**Request Body:**
```json
{
  "resolutions": [
    {
      "conflict_id": 1,
      "resolution": "keep_server"
    }
  ]
}
```

> `resolution` options: `keep_server`, `keep_client`, `merge`

**Response `200`:**
```json
{
  "success": true,
  "message": "Conflicts resolved successfully",
  "data": { "resolved_count": 1 }
}
```

---

### GET `/api/sync/last-sync`
Get the last successful sync timestamp.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "last_sync_at": "2024-01-15T09:00:00Z",
    "synced_by": "mobile_app"
  }
}
```

---

### DELETE `/api/sync/clear`
Clear all sync data and reset sync state.

**Response `200`:**
```json
{
  "success": true,
  "message": "Sync data cleared successfully"
}
```

---

## 15. Health

### GET `/api/health`
**Public** — Check API health status.

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthenticated — missing or invalid token |
| `403` | Forbidden — no permission |
| `404` | Not Found |
| `422` | Validation Error — check `errors` object |
| `429` | Too Many Requests — rate limited |
| `500` | Server Error |

---

## Rate Limiting

Login endpoints are rate limited to **5 attempts** per minute per IP/login combination. On lockout, the `auth.throttle` message is returned with `seconds` and `minutes` until unlock.

---

## Caching Notes

Some endpoints are cached per-user for performance. Cached durations:
- **5 minutes (300s):** Dashboard stats, analytics, budget summaries, category analytics
- **10 minutes (600s):** Currency list, conversion results

Cache is automatically invalidated when relevant data changes (e.g., creating a transaction clears transaction and analytics caches).

---

*Generated for SpendWise API — Laravel 11 + Sanctum*
