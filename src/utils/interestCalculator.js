/**
 * Interest Calculator Utility
 * Calculates interest based on principal amount and time duration
 * Interest = Principal × Rate × Time (in months)
 */

/**
 * Calculate interest for a loan considering all payments and extra loans
 * @param {Object} loan - The loan object
 * @returns {Object} - Interest breakdown and totals
 */
export const calculateLoanInterest = (loan) => {
  const loanDate = new Date(loan.loanDate);
  const today = new Date();
  const monthlyInterestRate = parseFloat(loan.interestRate) / 100;
  const originalLoanAmount = parseFloat(loan.loanAmount);

  // Sort payments by date
  const payments = loan.payments || loan.Payments || [];
  const sortedPayments = payments.sort(
    (a, b) => new Date(a.date || a.Date) - new Date(b.date || b.Date)
  );

  let totalInterest = 0;
  const interestBreakdown = [];
  let currentPrincipal = originalLoanAmount;
  let totalExtraLoans = 0;
  let lastDate = loanDate;

  // Process each event (payment or extra loan)
  sortedPayments.forEach((payment) => {
    const paymentDate = new Date(payment.date || payment.Date);

    // Calculate interest for the period before this transaction
    const months = calculateMonthsDifference(lastDate, paymentDate);
    if (months > 0 && currentPrincipal > 0) {
      const interest = currentPrincipal * monthlyInterestRate * months;
      totalInterest += interest;
      interestBreakdown.push({
        fromDate: lastDate,
        toDate: paymentDate,
        principal: currentPrincipal,
        months,
        interest,
        type: 'interest_period',
        description: `Interest on ₹${currentPrincipal.toLocaleString()} from ${lastDate.toLocaleDateString()} to ${paymentDate.toLocaleDateString()}`
      });
    }

    // Apply extra loan
    const extraLoan = payment.extraLoan || payment.ExtraLoan || 0;
    if (extraLoan > 0) {
      currentPrincipal += extraLoan;
      totalExtraLoans += extraLoan;
      interestBreakdown.push({
        date: paymentDate,
        type: 'extra_loan',
        amount: extraLoan,
        newPrincipal: currentPrincipal,
        description: `Extra loan: ₹${extraLoan.toLocaleString()} on ${paymentDate.toLocaleDateString()}`
      });
    }

    // Apply payment
    const partialPayment = payment.partialPayment || payment.PartialPayment || 0;
    if (partialPayment > 0) {
      currentPrincipal -= partialPayment;
      if (currentPrincipal < 0) currentPrincipal = 0;
      interestBreakdown.push({
        date: paymentDate,
        type: 'payment',
        amount: -partialPayment,
        newPrincipal: currentPrincipal,
        description: `Payment received: ₹${partialPayment.toLocaleString()} on ${paymentDate.toLocaleDateString()}`
      });
    }

    lastDate = paymentDate;
  });

  // Final interest from last transaction to today
  const remainingMonths = calculateMonthsDifference(lastDate, today);
  if (remainingMonths > 0 && currentPrincipal > 0) {
    const interest = currentPrincipal * monthlyInterestRate * remainingMonths;
    totalInterest += interest;
    interestBreakdown.push({
      fromDate: lastDate,
      toDate: today,
      principal: currentPrincipal,
      months: remainingMonths,
      interest,
      type: 'interest_period',
      description: `Interest on ₹${currentPrincipal.toLocaleString()} from ${lastDate.toLocaleDateString()} to ${today.toLocaleDateString()}`
    });
  }

  const result = {
    totalInterest: Math.round(totalInterest * 100) / 100,
    currentPrincipal: Math.max(0, currentPrincipal), // after payments
    interestBreakdown,
    originalLoanAmount,
    totalExtraLoans,
    totalPrincipal: originalLoanAmount + totalExtraLoans, // always original + extra
    totalAmount: (originalLoanAmount + totalExtraLoans) + totalInterest // before payments
  };

  return result;
};

/**
 * Calculate difference in months between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Difference in months (decimal)
 */
const calculateMonthsDifference = (startDate, endDate) => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  const monthsDiff = daysDiff / 30; // approx
  return Math.max(0, monthsDiff);
};

/**
 * Calculate total amount paid by customer
 * @param {Object} loan - The loan object
 * @returns {number} - Total amount paid
 */
export const calculateTotalPaid = (loan) => {
  const payments = loan.payments || loan.Payments || [];
  if (payments.length === 0) return 0;
  return payments.reduce((total, payment) => {
    const partialPayment = payment.partialPayment || payment.PartialPayment || 0;
    return total + partialPayment;
  }, 0);
};

/**
 * Calculate total extra loans given
 * @param {Object} loan - The loan object
 * @returns {number} - Total extra loans
 */
export const calculateTotalExtraLoans = (loan) => {
  const payments = loan.payments || loan.Payments || [];
  if (payments.length === 0) return 0;
  return payments.reduce((total, payment) => {
    const extraLoan = payment.extraLoan || payment.ExtraLoan || 0;
    return total + extraLoan;
  }, 0);
};

/**
 * Get current outstanding balance (Total Principal + Interest - Total Paid)
 * @param {Object} loan - The loan object
 * @returns {number} - Outstanding balance
 */
export const getCurrentBalance = (loan) => {
  const interestData = calculateLoanInterest(loan);
  const totalPaid = calculateTotalPaid(loan);

  // Correct: Original + Extra + Interest – Paid
  const outstandingBalance = (interestData.originalLoanAmount + interestData.totalExtraLoans + interestData.totalInterest) - totalPaid;

  return Math.max(0, outstandingBalance);
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

/**
 * Calculate interest for a specific amount and duration
 * @param {number} principal - Principal amount
 * @param {number} rate - Monthly interest rate (as percentage)
 * @param {number} months - Duration in months
 * @returns {number} - Interest amount
 */
export const calculateSimpleInterest = (principal, rate, months) => {
  return principal * (rate / 100) * months;
};
