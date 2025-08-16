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
  
  // Debug logging
  console.log('Calculating interest for loan:', {
    loanId: loan.id,
    loanDate: loanDate.toISOString(),
    today: today.toISOString(),
    monthlyInterestRate,
    originalLoanAmount,
    payments: loan.payments || loan.Payments,
    paymentsCount: (loan.payments || loan.Payments) ? (loan.payments || loan.Payments).length : 0
  });
  
  // Sort payments by date
  const payments = loan.payments || loan.Payments || [];
  const sortedPayments = payments.sort((a, b) => new Date(a.date || a.Date) - new Date(b.date || b.Date));
  
  let totalInterest = 0;
  const interestBreakdown = [];
  let currentPrincipal = originalLoanAmount;
  let totalExtraLoans = 0;
  
  // Calculate interest on original loan amount from loan date to today
  const originalLoanMonths = calculateMonthsDifference(loanDate, today);
  const originalLoanInterest = originalLoanAmount * monthlyInterestRate * originalLoanMonths;
  totalInterest += originalLoanInterest;
  
  console.log('Original loan interest calculation:', {
    amount: originalLoanAmount,
    months: originalLoanMonths,
    interest: originalLoanInterest
  });
  
  interestBreakdown.push({
    fromDate: loanDate,
    toDate: today,
    principal: originalLoanAmount,
    months: originalLoanMonths,
    interest: originalLoanInterest,
    type: 'loan',
    date: loanDate,
    amount: originalLoanAmount,
    newPrincipal: originalLoanAmount,
    description: `Original loan: ₹${originalLoanAmount.toLocaleString()} from ${loanDate.toLocaleDateString()}`
  });
  
  // Process each payment/extra loan
  if (sortedPayments && sortedPayments.length > 0) {
    console.log('Processing payments:', sortedPayments);
    
    sortedPayments.forEach((payment, index) => {
      const paymentDate = new Date(payment.date || payment.Date);
      console.log(`Processing payment ${index + 1}:`, {
        date: paymentDate.toISOString(),
        partialPayment: payment.partialPayment || payment.PartialPayment,
        extraLoan: payment.extraLoan || payment.ExtraLoan
      });
      
      // Process extra loan - calculate interest from extra loan date to today
      const extraLoan = payment.extraLoan || payment.ExtraLoan || 0;
      if (extraLoan > 0) {
        console.log(`Processing extra loan: ₹${extraLoan}`);
        
        // Calculate interest on this extra loan from its date to today
        const extraLoanMonths = calculateMonthsDifference(paymentDate, today);
        const extraLoanInterest = extraLoan * monthlyInterestRate * extraLoanMonths;
        totalInterest += extraLoanInterest;
        totalExtraLoans += extraLoan;
        currentPrincipal += extraLoan;
        
        console.log('Extra loan interest calculation:', {
          amount: extraLoan,
          months: extraLoanMonths,
          interest: extraLoanInterest,
          newPrincipal: currentPrincipal
        });
        
        interestBreakdown.push({
          date: paymentDate,
          fromDate: paymentDate,
          toDate: today,
          principal: extraLoan,
          months: extraLoanMonths,
          interest: extraLoanInterest,
          type: 'extra_loan',
          amount: extraLoan,
          newPrincipal: currentPrincipal,
          description: `Extra loan: ₹${extraLoan.toLocaleString()} from ${paymentDate.toLocaleDateString()}`
        });
      }
      
      // Process payment
      const partialPayment = payment.partialPayment || payment.PartialPayment || 0;
      if (partialPayment > 0) {
        console.log(`Processing partial payment: ₹${partialPayment}`);
        interestBreakdown.push({
          date: paymentDate,
          type: 'payment',
          amount: -partialPayment,
          newPrincipal: currentPrincipal, // Principal doesn't change with payments
          description: `Payment received: ₹${partialPayment.toLocaleString()} on ${paymentDate.toLocaleDateString()}`
        });
      }
    });
  }
  
  const result = {
    totalInterest: Math.round(totalInterest * 100) / 100,
    currentPrincipal: Math.max(0, currentPrincipal), // Original + Extra loans
    interestBreakdown,
    totalAmount: Math.max(0, currentPrincipal) + totalInterest,
    originalLoanAmount,
    totalExtraLoans,
    totalPrincipal: currentPrincipal // This should be originalLoanAmount + totalExtraLoans
  };
  
  console.log('Final result:', result);
  return result;
};

/**
 * Calculate difference in months between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Difference in months (decimal)
 */
const calculateMonthsDifference = (startDate, endDate) => {
  // Calculate total days difference
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  // Convert days to months (using 30 days per month for consistency)
  const monthsDiff = daysDiff / 30;
  
  console.log('Date calculation:', {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    daysDiff: daysDiff.toFixed(2),
    monthsDiff: monthsDiff.toFixed(4)
  });
  
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
 * Get current outstanding balance (Current Principal + Interest - Total Paid)
 * @param {Object} loan - The loan object
 * @returns {number} - Outstanding balance
 */
export const getCurrentBalance = (loan) => {
  const interestData = calculateLoanInterest(loan);
  const totalPaid = calculateTotalPaid(loan);
  
  // Outstanding balance = Current Principal + Total Interest - Total Paid
  const outstandingBalance = interestData.currentPrincipal + interestData.totalInterest - totalPaid;
  
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
  return (principal * (rate / 100) * months);
};