/**
 * Real Estate Investment Calculator Utilities
 * Provides financial calculations for property analysis
 */

/**
 * Calculate monthly mortgage payment (Principal + Interest)
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (e.g., 0.07 for 7%)
 * @param {number} years - Loan term in years
 * @returns {number} Monthly payment
 */
export function calculateMortgagePayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return payment;
}

/**
 * Calculate Net Operating Income (NOI)
 * NOI = Gross Rental Income - Operating Expenses
 * @param {number} monthlyRent - Expected monthly rent
 * @param {number} vacancyRate - Vacancy rate (e.g., 0.08 for 8%)
 * @param {number} monthlyExpenses - Total monthly operating expenses
 * @returns {number} Annual NOI
 */
export function calculateNOI(monthlyRent, vacancyRate, monthlyExpenses) {
  const effectiveGrossIncome = monthlyRent * 12 * (1 - vacancyRate);
  const annualExpenses = monthlyExpenses * 12;
  return effectiveGrossIncome - annualExpenses;
}

/**
 * Calculate Cap Rate
 * Cap Rate = NOI / Purchase Price
 * @param {number} noi - Net Operating Income (annual)
 * @param {number} purchasePrice - Property purchase price
 * @returns {number} Cap rate as decimal (e.g., 0.08 for 8%)
 */
export function calculateCapRate(noi, purchasePrice) {
  if (purchasePrice === 0) return 0;
  return noi / purchasePrice;
}

/**
 * Calculate Cash-on-Cash Return
 * CoC = Annual Cash Flow / Total Cash Invested
 * @param {number} annualCashFlow - Annual cash flow after debt service
 * @param {number} totalCashInvested - Total cash invested (down payment + closing + repairs)
 * @returns {number} Cash-on-cash return as decimal
 */
export function calculateCashOnCash(annualCashFlow, totalCashInvested) {
  if (totalCashInvested === 0) return 0;
  return annualCashFlow / totalCashInvested;
}

/**
 * Calculate DSCR (Debt Service Coverage Ratio)
 * DSCR = NOI / Annual Debt Service
 * @param {number} noi - Net Operating Income (annual)
 * @param {number} annualDebtService - Annual mortgage payments (P&I)
 * @returns {number} DSCR ratio
 */
export function calculateDSCR(noi, annualDebtService) {
  if (annualDebtService === 0) return Infinity;
  return noi / annualDebtService;
}

/**
 * Calculate monthly operating expenses
 * @param {Object} params - Expense parameters
 * @returns {number} Total monthly expenses
 */
export function calculateMonthlyExpenses({
  propertyTaxes,    // Annual property taxes
  insurance,        // Annual insurance
  hoa = 0,          // Monthly HOA
  maintenance,      // Monthly maintenance/repairs (typically 1% of value / 12)
  capex,            // Monthly CapEx reserves
  management,       // Monthly property management fee
  utilities = 0,    // Monthly utilities if owner-paid
}) {
  const monthlyTaxes = propertyTaxes / 12;
  const monthlyInsurance = insurance / 12;
  
  return monthlyTaxes + monthlyInsurance + hoa + maintenance + capex + management + utilities;
}

/**
 * Estimate monthly rent based on property characteristics
 * This is a simplified estimation - real values come from market data
 * @param {Object} property - Property details
 * @returns {number} Estimated monthly rent
 */
export function estimateRent(property) {
  const { sqft, beds, baths, yearBuilt, city } = property;
  
  // Base rent per sqft (varies by market - this is simplified)
  let baseRentPerSqft = 1.2;
  
  // Adjust for age
  const age = new Date().getFullYear() - yearBuilt;
  if (age < 10) baseRentPerSqft *= 1.15;
  else if (age < 30) baseRentPerSqft *= 1.0;
  else baseRentPerSqft *= 0.9;
  
  // Base calculation
  let rent = sqft * baseRentPerSqft;
  
  // Bedroom premium
  rent += (beds - 2) * 100;
  
  // Bathroom premium
  rent += (baths - 1) * 50;
  
  return Math.round(rent);
}

/**
 * Calculate full property deal analysis
 * @param {Object} property - Property data from database
 * @param {Object} assumptions - User-adjustable assumptions
 * @returns {Object} Complete deal analysis
 */
export function analyzeProperty(property, assumptions = {}) {
  const {
    price,
    sqft,
    yearBuilt,
    estimatedTaxes,
    hoa = 0,
    beds,
    baths,
  } = property;
  
  const {
    downPaymentPercent = 0.25,
    interestRate = 0.07,
    loanTermYears = 30,
    closingCostPercent = 0.03,
    rehabBudget = 0,
    vacancyRate = 0.08,
    maintenancePercent = 0.01, // 1% of property value annually
    capexPercent = 0.01,       // 1% of property value annually
    managementPercent = 0.10,  // 10% of rent
    insuranceRate = 0.005,     // 0.5% of property value annually
    estimatedRent = null,      // Override rent estimate
  } = assumptions;
  
  // Calculate loan details
  const downPayment = price * downPaymentPercent;
  const loanAmount = price - downPayment;
  const closingCosts = price * closingCostPercent;
  const totalCashInvested = downPayment + closingCosts + rehabBudget;
  
  // Calculate monthly mortgage
  const monthlyMortgage = calculateMortgagePayment(loanAmount, interestRate, loanTermYears);
  
  // Estimate rent if not provided
  const monthlyRent = estimatedRent || estimateRent({ sqft, beds, baths, yearBuilt, city: property.city });
  
  // Calculate expenses
  const monthlyTaxes = estimatedTaxes / 12;
  const monthlyInsurance = (price * insuranceRate) / 12;
  const monthlyMaintenance = (price * maintenancePercent) / 12;
  const monthlyCapex = (price * capexPercent) / 12;
  const monthlyManagement = monthlyRent * managementPercent;
  
  const totalMonthlyExpenses = monthlyTaxes + monthlyInsurance + hoa + 
    monthlyMaintenance + monthlyCapex + monthlyManagement;
  
  // Calculate NOI and cash flow
  const effectiveGrossIncome = monthlyRent * (1 - vacancyRate);
  const monthlyNOI = effectiveGrossIncome - totalMonthlyExpenses;
  const annualNOI = monthlyNOI * 12;
  
  const monthlyCashFlow = monthlyNOI - monthlyMortgage;
  const annualCashFlow = monthlyCashFlow * 12;
  
  // Calculate returns
  const capRate = calculateCapRate(annualNOI, price);
  const cashOnCash = calculateCashOnCash(annualCashFlow, totalCashInvested);
  const dscr = calculateDSCR(annualNOI, monthlyMortgage * 12);
  
  // Calculate break-even occupancy
  const breakEvenOccupancy = (totalMonthlyExpenses + monthlyMortgage) / monthlyRent;
  
  // 1% Rule check
  const onePercentRule = monthlyRent / price;
  const passesOnePercent = onePercentRule >= 0.01;
  
  // Deal score (0-100)
  let dealScore = 0;
  if (cashOnCash >= 0.12) dealScore += 30;
  else if (cashOnCash >= 0.08) dealScore += 20;
  else if (cashOnCash >= 0.05) dealScore += 10;
  
  if (capRate >= 0.08) dealScore += 25;
  else if (capRate >= 0.06) dealScore += 15;
  else if (capRate >= 0.04) dealScore += 5;
  
  if (dscr >= 1.5) dealScore += 20;
  else if (dscr >= 1.25) dealScore += 15;
  else if (dscr >= 1.0) dealScore += 5;
  
  if (passesOnePercent) dealScore += 15;
  else if (onePercentRule >= 0.008) dealScore += 8;
  
  if (monthlyCashFlow >= 300) dealScore += 10;
  else if (monthlyCashFlow >= 200) dealScore += 5;
  
  return {
    // Loan Details
    downPayment,
    loanAmount,
    closingCosts,
    totalCashInvested,
    monthlyMortgage,
    
    // Income
    monthlyRent,
    effectiveGrossIncome,
    
    // Expenses
    expenses: {
      taxes: monthlyTaxes,
      insurance: monthlyInsurance,
      hoa,
      maintenance: monthlyMaintenance,
      capex: monthlyCapex,
      management: monthlyManagement,
      total: totalMonthlyExpenses,
    },
    
    // Returns
    monthlyNOI,
    annualNOI,
    monthlyCashFlow,
    annualCashFlow,
    capRate,
    cashOnCash,
    dscr,
    breakEvenOccupancy,
    onePercentRule,
    passesOnePercent,
    dealScore,
    
    // Formatted values for display
    formatted: {
      downPayment: formatCurrency(downPayment),
      monthlyMortgage: formatCurrency(monthlyMortgage),
      monthlyRent: formatCurrency(monthlyRent),
      totalExpenses: formatCurrency(totalMonthlyExpenses),
      monthlyCashFlow: formatCurrency(monthlyCashFlow),
      annualCashFlow: formatCurrency(annualCashFlow),
      capRate: formatPercent(capRate),
      cashOnCash: formatPercent(cashOnCash),
      dscr: dscr.toFixed(2),
    },
  };
}

/**
 * Format number as currency
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercent(value) {
  return (value * 100).toFixed(1) + '%';
}

/**
 * Format large numbers with K/M suffix
 */
export function formatCompact(value) {
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(0) + 'K';
  }
  return '$' + value;
}

/**
 * Get color based on deal score
 */
export function getDealScoreColor(score) {
  if (score >= 70) return '#22c55e'; // Green - great deal
  if (score >= 50) return '#eab308'; // Yellow - decent deal
  if (score >= 30) return '#f97316'; // Orange - marginal
  return '#ef4444'; // Red - poor deal
}

/**
 * Get label for deal score
 */
export function getDealScoreLabel(score) {
  if (score >= 70) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 30) return 'Fair';
  return 'Poor';
}
