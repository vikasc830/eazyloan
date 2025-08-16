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
  
  // If no payments, calculate simple interest from loan date to today
  if (!sortedPayments || sortedPayments.length === 0) {
    const monthsDiff = calculateMonthsDifference(loanDate, today);
    console.log('No payments, months difference:', monthsDiff);
    
    if (monthsDiff > 0) {
      totalInterest = currentPrincipal * monthlyInterestRate * monthsDiff;
      console.log('Calculated interest:', totalInterest);
      
      interestBreakdown.push({
        fromDate: loanDate,
        toDate: today,
        principal: currentPrincipal,
        months: monthsDiff,
        interest: totalInterest,
        type: 'current',
        description: `Interest for ${monthsDiff.toFixed(2)} months on ₹${currentPrincipal.toLocaleString()}`
      });
    }
  } else {
    console.log('Processing payments:', sortedPayments);
    // Process payments timeline
    let lastDate = loanDate;
    
    sortedPayments.forEach((payment, index) => {
      const paymentDate = new Date(payment.date || payment.Date);
      console.log(`Processing payment ${index + 1}:`, {
        date: paymentDate.toISOString(),
        partialPayment: payment.partialPayment || payment.PartialPayment,
        extraLoan: payment.extraLoan || payment.ExtraLoan,
        currentPrincipal
      });
      
      // Calculate interest for period before this payment/extra loan
      if (currentPrincipal > 0 && paymentDate > lastDate) {
        const monthsDiff = calculateMonthsDifference(lastDate, paymentDate);
        const periodInterest = currentPrincipal * monthlyInterestRate * monthsDiff;
        
        console.log(`Interest for period ${lastDate.toISOString()} to ${paymentDate.toISOString()}:`, {
          monthsDiff,
          periodInterest,
          principal: currentPrincipal
        });
        
        if (periodInterest > 0) {
          totalInterest += periodInterest;
          
          interestBreakdown.push({
            fromDate: lastDate,
            toDate: paymentDate,
            principal: currentPrincipal,
            months: monthsDiff,
            interest: periodInterest,
            type: 'period',
            description: `Interest for ${monthsDiff.toFixed(2)} months on ₹${currentPrincipal.toLocaleString()}`
          });
        }
      }
      
      // Process extra loan FIRST (this increases the principal)
      const extraLoan = payment.extraLoan || payment.ExtraLoan || 0;
      if (extraLoan > 0) {
        console.log(`Processing extra loan: ₹${extraLoan}, old principal: ${currentPrincipal}`);
        currentPrincipal += extraLoan;
        console.log(`New principal after extra loan: ${currentPrincipal}`);
        interestBreakdown.push({
          date: paymentDate,
          type: 'extra_loan',
          amount: extraLoan,
          newPrincipal: currentPrincipal,
          description: `Extra loan given: ₹${extraLoan.toLocaleString()}`
        });
      }
      
      // Process payment AFTER extra loan (this reduces the outstanding amount, not principal)
      const partialPayment = payment.partialPayment || payment.PartialPayment || 0;
      if (partialPayment > 0) {
        console.log(`Processing partial payment: ₹${partialPayment}`);
        interestBreakdown.push({
          date: paymentDate,
          type: 'payment',
          amount: -partialPayment,
          newPrincipal: currentPrincipal, // Principal doesn't change with payments
          description: `Partial payment received: ₹${partialPayment.toLocaleString()}`
        });
      }
      
      lastDate = paymentDate;
    });
    
    // Calculate interest from last payment to today
    if (currentPrincipal > 0 && today > lastDate) {
      const monthsDiff = calculateMonthsDifference(lastDate, today);
      const finalInterest = currentPrincipal * monthlyInterestRate * monthsDiff;
      
      console.log(`Final interest calculation from ${lastDate.toISOString()} to ${today.toISOString()}:`, {
        monthsDiff,
        finalInterest,
        currentPrincipal
      });
      
      if (finalInterest > 0) {
        totalInterest += finalInterest;
        
        interestBreakdown.push({
          fromDate: lastDate,
          toDate: today,
          principal: currentPrincipal,
          months: monthsDiff,
          interest: finalInterest,
          type: 'current',
          description: `Current interest for ${monthsDiff.toFixed(2)} months on ₹${currentPrincipal.toLocaleString()}`
        });
      }
    }
  }
  
  // Calculate totals
  const totalExtraLoans = calculateTotalExtraLoans(loan);
  const totalPrincipal = originalLoanAmount + totalExtraLoans;
  
  const result = {
    totalInterest: Math.round(totalInterest * 100) / 100,
    currentPrincipal: Math.max(0, currentPrincipal), // This now includes extra loans
    interestBreakdown,
    totalAmount: Math.max(0, currentPrincipal) + totalInterest,
    originalLoanAmount,
    totalExtraLoans,
    totalPrincipal
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