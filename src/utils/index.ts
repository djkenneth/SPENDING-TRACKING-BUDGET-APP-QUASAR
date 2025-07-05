// src/utils/index.ts

// Currency utilities
export * from './currency';

// Date utilities
export * from './date';

// Calculation utilities
export * from './calculations';

// Validation utilities
export * from './validators';

// Re-export commonly used functions for convenience
export {
  formatCurrency,
  formatCompactCurrency,
  parseCurrency,
  SUPPORTED_CURRENCIES,
} from './currency';

export {
  formatDate,
  formatDateTime,
  formatRelativeDate,
  getStartOfMonth,
  getEndOfMonth,
  daysBetween,
  isToday,
  isThisMonth,
} from './date';

export {
  calculateNetWorth,
  calculateSavingsRate,
  calculateBudgetUtilization,
  calculateFinancialSummary,
  calculateCompoundInterest,
} from './calculations';

export {
  validateTransaction,
  validateAccount,
  validateBudget,
  validateAmount,
  isValidEmail,
  isValidPhoneNumber,
} from './validators';
