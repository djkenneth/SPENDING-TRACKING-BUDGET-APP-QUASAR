// src/utils/calculations.ts

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
}

export interface BudgetAnalysis {
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface InvestmentProjection {
  principal: number;
  rate: number;
  years: number;
  compoundingFrequency: number;
  futureValue: number;
  totalInterest: number;
}

/**
 * Calculate net worth from assets and liabilities
 * @param assets - Total assets
 * @param liabilities - Total liabilities
 * @returns Net worth
 */
export const calculateNetWorth = (assets: number, liabilities: number = 0): number => {
  return assets - liabilities;
};

/**
 * Calculate savings rate
 * @param income - Total income
 * @param expenses - Total expenses
 * @returns Savings rate as percentage
 */
export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};

/**
 * Calculate budget utilization percentage
 * @param spent - Amount spent
 * @param budgeted - Budgeted amount
 * @returns Utilization percentage
 */
export const calculateBudgetUtilization = (spent: number, budgeted: number): number => {
  if (budgeted === 0) return 0;
  return (spent / budgeted) * 100;
};

/**
 * Calculate remaining budget
 * @param budgeted - Budgeted amount
 * @param spent - Amount spent
 * @returns Remaining budget amount
 */
export const calculateRemainingBudget = (budgeted: number, spent: number): number => {
  return Math.max(0, budgeted - spent);
};

/**
 * Calculate monthly average from transactions
 * @param transactions - Array of transaction amounts
 * @param months - Number of months to average over
 * @returns Monthly average
 */
export const calculateMonthlyAverage = (transactions: number[], months: number = 12): number => {
  if (transactions.length === 0 || months === 0) return 0;
  const total = transactions.reduce((sum, amount) => sum + amount, 0);
  return total / months;
};

/**
 * Calculate compound interest
 * @param principal - Initial principal amount
 * @param rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param years - Number of years
 * @param compoundingFrequency - Times compounded per year (default: 12 for monthly)
 * @returns Future value with compound interest
 */
export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  years: number,
  compoundingFrequency: number = 12,
): number => {
  return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years);
};

/**
 * Calculate investment projection
 * @param principal - Initial investment
 * @param rate - Annual return rate (as decimal)
 * @param years - Investment period in years
 * @param compoundingFrequency - Compounding frequency per year
 * @returns Investment projection details
 */
export const calculateInvestmentProjection = (
  principal: number,
  rate: number,
  years: number,
  compoundingFrequency: number = 12,
): InvestmentProjection => {
  const futureValue = calculateCompoundInterest(principal, rate, years, compoundingFrequency);
  const totalInterest = futureValue - principal;

  return {
    principal,
    rate,
    years,
    compoundingFrequency,
    futureValue,
    totalInterest,
  };
};

/**
 * Calculate monthly payment for a loan
 * @param principal - Loan amount
 * @param rate - Monthly interest rate (as decimal)
 * @param periods - Number of payments
 * @returns Monthly payment amount
 */
export const calculateLoanPayment = (principal: number, rate: number, periods: number): number => {
  if (rate === 0) return principal / periods;

  const numerator = rate * Math.pow(1 + rate, periods);
  const denominator = Math.pow(1 + rate, periods) - 1;

  return principal * (numerator / denominator);
};

/**
 * Calculate debt-to-income ratio
 * @param totalDebtPayments - Total monthly debt payments
 * @param monthlyIncome - Monthly gross income
 * @returns Debt-to-income ratio as percentage
 */
export const calculateDebtToIncomeRatio = (
  totalDebtPayments: number,
  monthlyIncome: number,
): number => {
  if (monthlyIncome === 0) return 0;
  return (totalDebtPayments / monthlyIncome) * 100;
};

/**
 * Calculate emergency fund coverage
 * @param emergencyFund - Current emergency fund amount
 * @param monthlyExpenses - Monthly expenses
 * @returns Number of months covered
 */
export const calculateEmergencyFundCoverage = (
  emergencyFund: number,
  monthlyExpenses: number,
): number => {
  if (monthlyExpenses === 0) return 0;
  return emergencyFund / monthlyExpenses;
};

/**
 * Calculate financial summary from transactions
 * @param transactions - Array of transactions with amount and type
 * @returns Financial summary
 */
export const calculateFinancialSummary = (
  transactions: Array<{ amount: number; type: 'income' | 'expense' }>,
): FinancialSummary => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;
  const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

  return {
    totalIncome,
    totalExpenses,
    netIncome,
    savingsRate,
  };
};

/**
 * Calculate budget analysis for categories
 * @param budgetCategories - Array of budget categories with spent and limit
 * @returns Array of budget analysis
 */
export const calculateBudgetAnalysis = (
  budgetCategories: Array<{ name: string; spent: number; limit: number }>,
): BudgetAnalysis[] => {
  return budgetCategories.map((category) => {
    const remaining = calculateRemainingBudget(category.limit, category.spent);
    const percentageUsed = calculateBudgetUtilization(category.spent, category.limit);
    const isOverBudget = category.spent > category.limit;

    return {
      categoryName: category.name,
      budgeted: category.limit,
      spent: category.spent,
      remaining,
      percentageUsed,
      isOverBudget,
    };
  });
};

/**
 * Calculate investment allocation percentages
 * @param investments - Array of investments with amounts
 * @returns Array of investments with allocation percentages
 */
export const calculateInvestmentAllocation = (
  investments: Array<{ name: string; amount: number }>,
): Array<{ name: string; amount: number; percentage: number }> => {
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);

  return investments.map((investment) => ({
    ...investment,
    percentage: totalInvestment > 0 ? (investment.amount / totalInvestment) * 100 : 0,
  }));
};

/**
 * Calculate retirement savings needed
 * @param currentAge - Current age
 * @param retirementAge - Planned retirement age
 * @param currentSavings - Current retirement savings
 * @param annualIncome - Annual income needed in retirement
 * @param inflationRate - Annual inflation rate (as decimal)
 * @param returnRate - Annual return rate (as decimal)
 * @returns Amount needed to save monthly
 */
export const calculateRetirementSavings = (
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  annualIncome: number,
  inflationRate: number = 0.03,
  returnRate: number = 0.07,
): number => {
  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = 25; // Assume 25 years in retirement

  // Calculate future value of current savings
  const futureValueCurrentSavings = calculateCompoundInterest(
    currentSavings,
    returnRate,
    yearsToRetirement,
    1,
  );

  // Calculate income needed adjusted for inflation
  const inflationAdjustedIncome = annualIncome * Math.pow(1 + inflationRate, yearsToRetirement);

  // Calculate present value of retirement income stream
  const presentValueRetirementIncome = inflationAdjustedIncome * yearsInRetirement;

  // Calculate additional savings needed
  const additionalSavingsNeeded = presentValueRetirementIncome - futureValueCurrentSavings;

  if (additionalSavingsNeeded <= 0) return 0;

  // Calculate monthly savings needed using future value of annuity formula
  const monthlyRate = returnRate / 12;
  const totalMonths = yearsToRetirement * 12;

  const monthlySavingsNeeded =
    additionalSavingsNeeded /
    (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
      Math.pow(1 + monthlyRate, totalMonths));

  return monthlySavingsNeeded;
};

/**
 * Calculate tax implications (simplified)
 * @param income - Gross income
 * @param taxRate - Tax rate (as decimal)
 * @param deductions - Total deductions
 * @returns Tax calculation details
 */
export const calculateTaxes = (
  income: number,
  taxRate: number,
  deductions: number = 0,
): { taxableIncome: number; taxes: number; netIncome: number } => {
  const taxableIncome = Math.max(0, income - deductions);
  const taxes = taxableIncome * taxRate;
  const netIncome = income - taxes;

  return {
    taxableIncome,
    taxes,
    netIncome,
  };
};

/**
 * Calculate break-even point
 * @param fixedCosts - Fixed costs per period
 * @param variableCostPerUnit - Variable cost per unit
 * @param pricePerUnit - Price per unit
 * @returns Break-even point in units
 */
export const calculateBreakEvenPoint = (
  fixedCosts: number,
  variableCostPerUnit: number,
  pricePerUnit: number,
): number => {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) return Infinity;

  return fixedCosts / contributionMargin;
};

/**
 * Calculate cash flow projection
 * @param initialBalance - Starting balance
 * @param monthlyIncome - Monthly income
 * @param monthlyExpenses - Monthly expenses
 * @param months - Number of months to project
 * @returns Array of monthly cash flow projections
 */
export const calculateCashFlowProjection = (
  initialBalance: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  months: number,
): Array<{ month: number; income: number; expenses: number; netFlow: number; balance: number }> => {
  const projections = [];
  let currentBalance = initialBalance;

  for (let month = 1; month <= months; month++) {
    const netFlow = monthlyIncome - monthlyExpenses;
    currentBalance += netFlow;

    projections.push({
      month,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      netFlow,
      balance: currentBalance,
    });
  }

  return projections;
};

/**
 * Calculate financial ratios
 * @param assets - Total assets
 * @param liabilities - Total liabilities
 * @param income - Total income
 * @param expenses - Total expenses
 * @returns Object with various financial ratios
 */
export const calculateFinancialRatios = (
  assets: number,
  liabilities: number,
  income: number,
  expenses: number,
): {
  debtToAssetRatio: number;
  debtToEquityRatio: number;
  expenseRatio: number;
  liquidityRatio: number;
} => {
  const equity = assets - liabilities;

  return {
    debtToAssetRatio: assets > 0 ? (liabilities / assets) * 100 : 0,
    debtToEquityRatio: equity > 0 ? (liabilities / equity) * 100 : 0,
    expenseRatio: income > 0 ? (expenses / income) * 100 : 0,
    liquidityRatio: liabilities > 0 ? assets / liabilities : 0,
  };
};

/**
 * Calculate goal progress
 * @param currentAmount - Current amount saved
 * @param targetAmount - Target amount
 * @param timeFrameMonths - Time frame in months
 * @returns Goal progress details
 */
export const calculateGoalProgress = (
  currentAmount: number,
  targetAmount: number,
  timeFrameMonths: number,
): {
  percentageComplete: number;
  remainingAmount: number;
  monthlyNeeded: number;
  isOnTrack: boolean;
} => {
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const percentageComplete = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const monthlyNeeded = timeFrameMonths > 0 ? remainingAmount / timeFrameMonths : 0;
  const isOnTrack = percentageComplete >= 100 || remainingAmount === 0;

  return {
    percentageComplete,
    remainingAmount,
    monthlyNeeded,
    isOnTrack,
  };
};

/**
 * Calculate optimal emergency fund
 * @param monthlyExpenses - Monthly expenses
 * @param incomeStability - Income stability factor (0-1, where 1 is most stable)
 * @param dependents - Number of dependents
 * @returns Recommended emergency fund amount
 */
export const calculateOptimalEmergencyFund = (
  monthlyExpenses: number,
  incomeStability: number = 0.8,
  dependents: number = 0,
): number => {
  let baseMonths = 6; // Default 6 months

  // Adjust based on income stability
  if (incomeStability < 0.5) {
    baseMonths = 12; // Less stable income needs more months
  } else if (incomeStability < 0.7) {
    baseMonths = 9;
  }

  // Adjust for dependents
  baseMonths += dependents * 1.5;

  return monthlyExpenses * baseMonths;
};
