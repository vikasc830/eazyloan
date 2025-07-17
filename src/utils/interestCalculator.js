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
  const monthlyInterestRate = parseFloat(loan.interestRate) / 100; // Convert percentage to decimal
  
  // Sort payments by date
  const sortedPayments = (loan.payments || []).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let currentPrincipal = parseFloat(loan.loanAmount);
  let totalInterest = 0;
  let lastCalculationDate = loanDate;
  
  const interestBreakdown = [];
  
  // Calculate first month interest (always full amount regardless of payments)
  const firstMonthEnd = new Date(loanDate);
  firstMonthEnd.setMonth(firstMonthEnd.getMonth() + 1);
  
  const firstMonthInterest = currentPrincipal * monthlyInterestRate;
  totalInterest += firstMonthInterest;
  
  interestBreakdown.push({
    fromDate: loanDate,
    toDate: firstMonthEnd,
    principal: currentPrincipal,
    interest: firstMonthInterest,
    type: 'first_month',
    description: 'First month - Full interest on original amount'
  });
  
  lastCalculationDate = firstMonthEnd;
  
  // Process payments that occurred in the first month
  const firstMonthPayments = sortedPayments.filter(payment => 
    new Date(payment.date) <= firstMonthEnd
  );
  
  // Apply first month payments to reduce principal for future calculations
  for (const payment of firstMonthPayments) {
    if (payment.partialPayment > 0) {
      // Partial payment reduces principal for future interest calculation
      currentPrincipal = Math.max(0, currentPrincipal - payment.partialPayment);
      
      interestBreakdown.push({
        date: new Date(payment.date),
        partialPayment: payment.partialPayment,
        newPrincipal: currentPrincipal,
        type: 'payment',
        description: `Payment reduces principal for future interest`
      });
    }
    
    // Add extra loan to principal
    if (payment.extraLoan > 0) {
      currentPrincipal += payment.extraLoan;
      
      interestBreakdown.push({
        date: new Date(payment.date),
        extraLoan: payment.extraLoan,
        newPrincipal: currentPrincipal,
        type: 'extra_loan',
        description: `Extra loan increases principal`
      });
    }
  }
  
  // Process remaining payments (after first month)
  const remainingPayments = sortedPayments.filter(payment => 
    new Date(payment.date) > firstMonthEnd
  );
  
  for (const payment of remainingPayments) {
    const paymentDate = new Date(payment.date);
    
    // Calculate interest from last calculation date to payment date (day-wise after first month)
    if (currentPrincipal > 0 && paymentDate > lastCalculationDate) {
      const interestForPeriod = calculateInterestForPeriod(
        currentPrincipal,
        lastCalculationDate,
        paymentDate,
        monthlyInterestRate
      );
      
      totalInterest += interestForPeriod;
      
      if (interestForPeriod > 0) {
        interestBreakdown.push({
          fromDate: lastCalculationDate,
          toDate: paymentDate,
          principal: currentPrincipal,
          interest: interestForPeriod,
          type: 'period',
          description: 'Day-wise interest calculation'
        });
      }
    }
    
    // Apply partial payment (reduces principal for future interest calculation)
    if (payment.partialPayment > 0) {
      currentPrincipal = Math.max(0, currentPrincipal - payment.partialPayment);
      
      interestBreakdown.push({
        date: paymentDate,
        partialPayment: payment.partialPayment,
        newPrincipal: currentPrincipal,
        type: 'payment',
        description: `Payment reduces principal for future interest`
      });
    }
    
    // Add extra loan to principal
    if (payment.extraLoan > 0) {
      currentPrincipal += payment.extraLoan;
      
      interestBreakdown.push({
        date: paymentDate,
        extraLoan: payment.extraLoan,
        newPrincipal: currentPrincipal,
        type: 'extra_loan',
        description: `Extra loan increases principal`
      });
    }
    
    lastCalculationDate = paymentDate;
  }
  
  // Calculate interest from last payment/calculation date to today (if after first month)
  if (today > lastCalculationDate && currentPrincipal > 0) {
    const finalInterest = calculateInterestForPeriod(
      currentPrincipal,
      lastCalculationDate,
      today,
      monthlyInterestRate
    );
    
    totalInterest += finalInterest;
    
    if (finalInterest > 0) {
      interestBreakdown.push({
        fromDate: lastCalculationDate,
        toDate: today,
        principal: currentPrincipal,
        interest: finalInterest,
        type: 'current',
        description: 'Current period interest'
      });
    }
  }
  
  // Calculate total amount (original loan + all extra loans + total interest)
  const totalExtraLoans = calculateTotalExtraLoans(loan);
  const originalLoanAmount = parseFloat(loan.loanAmount);
  const totalPrincipal = originalLoanAmount + totalExtraLoans;
  
  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    currentPrincipal: totalPrincipal, // Original + extra loans
    interestBreakdown,
    totalAmount: totalPrincipal + totalInterest,
    originalLoanAmount,
    totalExtraLoans
  };
};

/**
 * Calculate interest for a specific period (after first month - day-wise)
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
  
  // Calculate day-wise interest (assuming 30 days per month)
  const dailyRate = monthlyRate / 30;
  return principal * dailyRate * daysDiff;
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
 * Get current outstanding balance (Total Amount - Total Paid)
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