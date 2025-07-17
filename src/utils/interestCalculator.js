/**
 * Interest Calculator Utility
 * Handles complex interest calculations for loans with partial payments and extra loans
 */

/**
 * Calculate interest for a loan considering all payments and extra loans
 * @param {Object} loan - The loan object
 * @returns {Object} - Interest breakdown and totals
 */
export const calculateLoanInterest = (loan) => {
  const loanDate = new Date(loan.loanDate);
  const today = new Date();
  const interestRate = parseFloat(loan.interestRate) / 100; // Convert percentage to decimal
  
  // Sort payments by date
  const sortedPayments = (loan.payments || []).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let currentPrincipal = parseFloat(loan.loanAmount);
  let totalInterest = 0;
  let lastCalculationDate = loanDate;
  
  const interestBreakdown = [];
  
  // Process each payment chronologically
  for (const payment of sortedPayments) {
    const paymentDate = new Date(payment.date);
    
    // Calculate interest from last calculation date to payment date
    const interestForPeriod = calculateInterestForPeriod(
      currentPrincipal,
      lastCalculationDate,
      paymentDate,
      interestRate
    );
    
    totalInterest += interestForPeriod;
    
    if (interestForPeriod > 0) {
      interestBreakdown.push({
        fromDate: lastCalculationDate,
        toDate: paymentDate,
        principal: currentPrincipal,
        interest: interestForPeriod,
        type: 'period'
      });
    }
    
    // Apply partial payment (reduces outstanding principal for future interest calculation)
    if (payment.partialPayment > 0) {
      // Partial payment first goes towards interest, then principal
      const outstandingInterest = totalInterest;
      
      if (payment.partialPayment >= outstandingInterest) {
        // Payment covers all interest and some principal
        const principalPayment = payment.partialPayment - outstandingInterest;
        currentPrincipal = Math.max(0, currentPrincipal - principalPayment);
        totalInterest = 0; // Interest is fully paid
      } else {
        // Payment only covers part of the interest
        totalInterest -= payment.partialPayment;
      }
      
      interestBreakdown.push({
        date: paymentDate,
        partialPayment: payment.partialPayment,
        type: 'payment'
      });
    }
    
    // Add extra loan to principal
    if (payment.extraLoan > 0) {
      currentPrincipal += payment.extraLoan;
      
      interestBreakdown.push({
        date: paymentDate,
        extraLoan: payment.extraLoan,
        newPrincipal: currentPrincipal,
        type: 'extra_loan'
      });
    }
    
    lastCalculationDate = paymentDate;
  }
  
  // Calculate interest from last payment/loan date to today
  const finalInterest = calculateInterestForPeriod(
    currentPrincipal,
    lastCalculationDate,
    today,
    interestRate
  );
  
  totalInterest += finalInterest;
  
  if (finalInterest > 0) {
    interestBreakdown.push({
      fromDate: lastCalculationDate,
      toDate: today,
      principal: currentPrincipal,
      interest: finalInterest,
      type: 'current'
    });
  }
  
  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    currentPrincipal,
    interestBreakdown,
    totalAmount: currentPrincipal + totalInterest
  };
};

/**
 * Calculate interest for a specific period
 * @param {number} principal - Principal amount
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @param {number} monthlyRate - Monthly interest rate (as decimal)
 * @returns {number} - Interest amount
 */
const calculateInterestForPeriod = (principal, fromDate, toDate, monthlyRate) => {
  if (principal <= 0 || fromDate >= toDate) return 0;
  
  const timeDiff = toDate.getTime() - fromDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  // For the first month, use full monthly rate regardless of days
  const monthsDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                    (toDate.getMonth() - fromDate.getMonth());
  
  if (monthsDiff === 0) {
    // First month - use full monthly rate
    return principal * monthlyRate;
  } else {
    // After first month - calculate day-wise
    const dailyRate = monthlyRate / 30; // Assuming 30 days per month
    return principal * dailyRate * daysDiff;
  }
};

/**
 * Calculate total amount paid by customer
 * @param {Object} loan - The loan object
 * @returns {number} - Total amount paid
 */
export const calculateTotalPaid = (loan) => {
  if (!loan.payments || loan.payments.length === 0) return 0;
  return loan.payments.reduce((total, payment) => total + (payment.partialPayment || 0), 0);
};

/**
 * Calculate total extra loans given
 * @param {Object} loan - The loan object
 * @returns {number} - Total extra loans
 */
export const calculateTotalExtraLoans = (loan) => {
  if (!loan.payments || loan.payments.length === 0) return 0;
  return loan.payments.reduce((total, payment) => total + (payment.extraLoan || 0), 0);
};

/**
 * Get current outstanding balance
 * @param {Object} loan - The loan object
 * @returns {number} - Outstanding balance
 */
export const getCurrentBalance = (loan) => {
  const interestData = calculateLoanInterest(loan);
  const totalPaid = calculateTotalPaid(loan);
  return Math.max(0, interestData.totalAmount - totalPaid);
};

/**
 * Get loan status based on due date and payments
 * @param {Object} loan - The loan object
 * @returns {string} - Loan status
 */
export const getLoanStatus = (loan) => {
  if (loan.status === 'closed') return 'Closed';
  if (loan.status === 'renewed') return 'Renewed';
  
  const today = new Date();
  const dueDate = new Date(loan.dueDate);
  const balance = getCurrentBalance(loan);
  
  if (balance <= 0) return 'Paid';
  if (dueDate < today) return 'Overdue';
  if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) return 'Due Soon';
  return 'Active';
};