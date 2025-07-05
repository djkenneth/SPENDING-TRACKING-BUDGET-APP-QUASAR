// src/utils/validators.ts

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface TransactionValidation {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  date: string;
}

export interface AccountValidation {
  name: string;
  type: string;
  balance: number;
  number?: string;
}

export interface BudgetValidation {
  name: string;
  limit: number;
  category: string;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (Philippine format)
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+63|0)9\d{9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

/**
 * Validate currency amount
 * @param amount - Amount to validate
 * @param min - Minimum allowed amount
 * @param max - Maximum allowed amount
 * @returns Validation result
 */
export const validateAmount = (
  amount: number | string,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
): ValidationResult => {
  const errors: string[] = [];

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    errors.push('Amount must be a valid number');
  } else {
    if (numAmount < min) {
      errors.push(`Amount must be at least ${min}`);
    }
    if (numAmount > max) {
      errors.push(`Amount cannot exceed ${max}`);
    }
    if (numAmount < 0) {
      errors.push('Amount cannot be negative');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate transaction data
 * @param transaction - Transaction data to validate
 * @returns Validation result
 */
export const validateTransaction = (transaction: TransactionValidation): ValidationResult => {
  const errors: string[] = [];

  // Description validation
  if (!transaction.description || transaction.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (transaction.description.length > 100) {
    errors.push('Description cannot exceed 100 characters');
  }

  // Amount validation
  const amountValidation = validateAmount(transaction.amount, 0.01, 999999999);
  if (!amountValidation.isValid) {
    errors.push(...amountValidation.errors);
  }

  // Type validation
  if (!['income', 'expense'].includes(transaction.type)) {
    errors.push('Type must be either income or expense');
  }

  // Category validation
  if (!transaction.category || transaction.category.trim().length === 0) {
    errors.push('Category is required');
  }

  // Account validation
  if (!transaction.account || transaction.account.trim().length === 0) {
    errors.push('Account is required');
  }

  // Date validation
  if (!transaction.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      errors.push('Date must be a valid date');
    } else if (date > new Date()) {
      errors.push('Date cannot be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate account data
 * @param account - Account data to validate
 * @returns Validation result
 */
export const validateAccount = (account: AccountValidation): ValidationResult => {
  const errors: string[] = [];

  // Name validation
  if (!account.name || account.name.trim().length === 0) {
    errors.push('Account name is required');
  } else if (account.name.length > 50) {
    errors.push('Account name cannot exceed 50 characters');
  }

  // Type validation
  const validTypes = ['cash', 'bank', 'ewallet', 'investment', 'credit'];
  if (!validTypes.includes(account.type)) {
    errors.push('Account type must be one of: cash, bank, ewallet, investment, credit');
  }

  // Balance validation
  const balanceValidation = validateAmount(account.balance, -999999999, 999999999);
  if (!balanceValidation.isValid) {
    errors.push(...balanceValidation.errors);
  }

  // Account number validation (if provided)
  if (account.number && account.number.trim().length > 0) {
    if (account.number.length > 30) {
      errors.push('Account number cannot exceed 30 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate budget data
 * @param budget - Budget data to validate
 * @returns Validation result
 */
export const validateBudget = (budget: BudgetValidation): ValidationResult => {
  const errors: string[] = [];

  // Name validation
  if (!budget.name || budget.name.trim().length === 0) {
    errors.push('Budget name is required');
  } else if (budget.name.length > 50) {
    errors.push('Budget name cannot exceed 50 characters');
  }

  // Limit validation
  const limitValidation = validateAmount(budget.limit, 0.01, 999999999);
  if (!limitValidation.isValid) {
    errors.push(...limitValidation.errors);
  }

  // Category validation
  if (!budget.category || budget.category.trim().length === 0) {
    errors.push('Budget category is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Validation result with strength score
 */
export const validatePassword = (password: string): ValidationResult & { strength: number } => {
  const errors: string[] = [];
  let strength = 0;

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, strength: 0 };
  }

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    strength += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strength += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strength += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strength += 1;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    strength += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

/**
 * Validate date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Validation result
 */
export const validateDateRange = (startDate: string, endDate: string): ValidationResult => {
  const errors: string[] = [];

  if (!startDate) {
    errors.push('Start date is required');
  }

  if (!endDate) {
    errors.push('End date is required');
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      errors.push('Start date must be a valid date');
    }

    if (isNaN(end.getTime())) {
      errors.push('End date must be a valid date');
    }

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (start > end) {
        errors.push('Start date cannot be after end date');
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 365) {
        errors.push('Date range cannot exceed 365 days');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate required fields
 * @param data - Object with data to validate
 * @param requiredFields - Array of required field names
 * @returns Validation result
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[],
): ValidationResult => {
  const errors: string[] = [];

  requiredFields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
      errors.push(`${field} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate numeric range
 * @param value - Value to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Field name for error messages
 * @returns Validation result
 */
export const validateNumericRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Value',
): ValidationResult => {
  const errors: string[] = [];

  if (isNaN(value)) {
    errors.push(`${fieldName} must be a valid number`);
  } else {
    if (value < min) {
      errors.push(`${fieldName} must be at least ${min}`);
    }
    if (value > max) {
      errors.push(`${fieldName} cannot exceed ${max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate string length
 * @param value - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @param fieldName - Field name for error messages
 * @returns Validation result
 */
export const validateStringLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string = 'Field',
): ValidationResult => {
  const errors: string[] = [];

  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
  } else {
    if (value.length < min) {
      errors.push(`${fieldName} must be at least ${min} characters long`);
    }
    if (value.length > max) {
      errors.push(`${fieldName} cannot exceed ${max} characters`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize input string
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
};

/**
 * Validate file upload
 * @param file - File object
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSizeInMB - Maximum file size in MB
 * @returns Validation result
 */
export const validateFileUpload = (
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'],
  maxSizeInMB: number = 5,
): ValidationResult => {
  const errors: string[] = [];

  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    errors.push(`File size cannot exceed ${maxSizeInMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
