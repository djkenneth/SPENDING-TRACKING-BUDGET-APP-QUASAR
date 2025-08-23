// src/utils/date.ts

export type DateFormat =
  | 'MM/dd/yyyy'
  | 'dd/MM/yyyy'
  | 'yyyy-MM-dd'
  | 'MMM dd, yyyy'
  | 'dd MMM yyyy';

/**
 * Format a date according to the specified format
 * @param date - Date to format
 * @param format - Date format string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, format: DateFormat = 'MM/dd/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  switch (format) {
    case 'MM/dd/yyyy':
      return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    case 'dd/MM/yyyy':
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    case 'MMM dd, yyyy':
      return `${monthNames[month - 1]} ${day}, ${year}`;
    case 'dd MMM yyyy':
      return `${day} ${monthNames[month - 1]} ${year}`;
    default:
      return dateObj.toLocaleDateString();
  }
};

/**
 * Format a date with time
 * @param date - Date to format
 * @param includeSeconds - Whether to include seconds
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string, includeSeconds: boolean = false): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const dateStr = formatDate(dateObj);
  const timeStr = includeSeconds
    ? dateObj.toLocaleTimeString()
    : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${dateStr} ${timeStr}`;
};

/**
 * Format a date in relative terms (e.g., "2 days ago", "in 3 hours")
 * @param date - Date to format
 * @returns Relative date string
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

/**
 * Get the start of the current month
 * @returns Date object for the start of the current month
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the end of the current month
 * @returns Date object for the end of the current month
 */
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Get the start of the current week
 * @param date - Reference date
 * @param startOfWeek - Day of week to start (0 = Sunday, 1 = Monday)
 * @returns Date object for the start of the week
 */
export const getStartOfWeek = (date: Date = new Date(), startOfWeek: number = 1): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : startOfWeek);
  return new Date(d.setDate(diff));
};

/**
 * Get the end of the current week
 * @param date - Reference date
 * @param startOfWeek - Day of week to start (0 = Sunday, 1 = Monday)
 * @returns Date object for the end of the week
 */
export const getEndOfWeek = (date: Date = new Date(), startOfWeek: number = 1): Date => {
  const startDate = getStartOfWeek(date, startOfWeek);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return endDate;
};

/**
 * Get the start of the current year
 * @returns Date object for the start of the current year
 */
export const getStartOfYear = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

/**
 * Get the end of the current year
 * @returns Date object for the end of the current year
 */
export const getEndOfYear = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), 11, 31);
};

/**
 * Calculate the number of days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days
 */
export const daysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is this month
 * @param date - Date to check
 * @returns True if date is in current month
 */
export const isThisMonth = (date: Date): boolean => {
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

/**
 * Check if a date is this week
 * @param date - Date to check
 * @returns True if date is in current week
 */
export const isThisWeek = (date: Date): boolean => {
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek();
  return date >= startOfWeek && date <= endOfWeek;
};

/**
 * Add days to a date
 * @param date - Original date
 * @param days - Number of days to add
 * @returns New date with added days
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add months to a date
 * @param date - Original date
 * @param months - Number of months to add
 * @returns New date with added months
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Get the next occurrence of a recurring date
 * @param date - Original date
 * @param frequency - Frequency type
 * @returns Next occurrence date
 */
export const getNextRecurrence = (
  date: Date,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
): Date => {
  const result = new Date(date);

  switch (frequency) {
    case 'daily':
      return addDays(result, 1);
    case 'weekly':
      return addDays(result, 7);
    case 'monthly':
      return addMonths(result, 1);
    case 'yearly':
      result.setFullYear(result.getFullYear() + 1);
      return result;
    default:
      return result;
  }
};

/**
 * Parse a date string in various formats
 * @param dateString - Date string to parse
 * @returns Parsed Date object or null if invalid
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Get month name
 * @param monthIndex - Month index (0-11)
 * @param short - Whether to return short name
 * @returns Month name
 */
export const getMonthName = (monthIndex: number, short: boolean = false): string => {
  const months = short
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

  return months[monthIndex] || '';
};

/**
 * Get day name
 * @param dayIndex - Day index (0-6, Sunday = 0)
 * @param short - Whether to return short name
 * @returns Day name
 */
export const getDayName = (dayIndex: number, short: boolean = false): string => {
  const days = short
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return days[dayIndex] || '';
};
