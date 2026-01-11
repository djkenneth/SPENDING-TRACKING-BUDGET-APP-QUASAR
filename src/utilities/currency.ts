// src/utils/currency.ts

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    locale: 'en-PH',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    decimals: 0,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    decimals: 2,
  },
};

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencyCode - The currency code (e.g., 'PHP', 'USD')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'PHP',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    locale?: string;
    decimals?: number;
  } = {},
): string => {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.PHP;
  const {
    showSymbol = true,
    showCode = false,
    locale = currency.locale,
    decimals = currency.decimals,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    let formatted = formatter.format(amount);

    // Custom symbol handling if needed
    if (showSymbol && currency.symbol !== formatted.charAt(0)) {
      formatted = formatted.replace(/[^\d,.\s-]/g, '');
      formatted = `${currency.symbol}${formatted.trim()}`;
    }

    if (showCode) {
      formatted = `${formatted} ${currency.code}`;
    }

    return formatted;
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency.symbol}${amount.toFixed(decimals)}`;
  }
};

/**
 * Format currency without symbol (just the number)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export const formatAmount = (amount: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Parse a currency string to number
 * @param currencyString - The currency string to parse
 * @returns Parsed number or null if invalid
 */
export const parseCurrency = (currencyString: string): number | null => {
  if (!currencyString) return null;

  // Remove all non-numeric characters except decimal point and minus sign
  const cleanString = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleanString);

  return isNaN(parsed) ? null : parsed;
};

/**
 * Convert amount between currencies (placeholder - would need real exchange rates)
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param exchangeRate - Exchange rate (from -> to)
 * @returns Converted amount
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number,
): number => {
  if (fromCurrency === toCurrency) return amount;
  return amount * exchangeRate;
};

/**
 * Format a compact currency representation (e.g., 1.2K, 1.5M)
 * @param amount - The amount to format
 * @param currencyCode - The currency code
 * @returns Compact formatted currency string
 */
export const formatCompactCurrency = (amount: number, currencyCode: string = 'PHP'): string => {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.PHP;
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1000000000) {
    return `${sign}${currency.symbol}${(absAmount / 1000000000).toFixed(1)}B`;
  } else if (absAmount >= 1000000) {
    return `${sign}${currency.symbol}${(absAmount / 1000000).toFixed(1)}M`;
  } else if (absAmount >= 1000) {
    return `${sign}${currency.symbol}${(absAmount / 1000).toFixed(1)}K`;
  } else {
    return `${sign}${currency.symbol}${absAmount.toFixed(currency.decimals)}`;
  }
};

/**
 * Calculate percentage change between two amounts
 * @param current - Current amount
 * @param previous - Previous amount
 * @returns Percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format percentage
 * @param percentage - Percentage to format
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (percentage: number, decimals: number = 1): string => {
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Check if amount is valid for currency operations
 * @param amount - Amount to validate
 * @returns True if valid, false otherwise
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
};

/**
 * Round amount to currency precision
 * @param amount - Amount to round
 * @param decimals - Number of decimal places
 * @returns Rounded amount
 */
export const roundToCurrency = (amount: number, decimals: number = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
};
