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
    loanDate: loanDate.toISOString(),
    today: today.toISOString(),
    monthlyInterestRate,
    originalLoanAmount,
    payments: loan.payments
  });
  
  // Sort payments by date
  const sortedPayments = (loan.payments || []).sort((a, b) => new Date(a.date) - new Date(b.date));
  
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
    // Process payments timeline
    let lastDate = loanDate;
    
    sortedPayments.forEach(payment => {
      const paymentDate = new Date(payment.date);
      
      // Calculate interest for period before this payment
      if (currentPrincipal > 0 && paymentDate > lastDate) {
        const monthsDiff = calculateMonthsDifference(lastDate, paymentDate);
        const periodInterest = currentPrincipal * monthlyInterestRate * monthsDiff;
        
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
      
      // Process payment
      if (payment.partialPayment > 0) {
        interestBreakdown.push({
          date: paymentDate,
          type: 'payment',
          amount: -payment.partialPayment,
          newPrincipal: currentPrincipal,
          description: `Partial payment received: ₹${payment.partialPayment.toLocaleString()}`
        });
      }
      
      // Process extra loan
      if (payment.extraLoan > 0) {
        currentPrincipal += payment.extraLoan;
        interestBreakdown.push({
          date: paymentDate,
          type: 'extra_loan',
          amount: payment.extraLoan,
          newPrincipal: currentPrincipal,
          description: `Extra loan given: ₹${payment.extraLoan.toLocaleString()}`
        });
      }
      
      lastDate = paymentDate;
    });
    
    // Calculate interest from last payment to today
    if (currentPrincipal > 0 && today > lastDate) {
      const monthsDiff = calculateMonthsDifference(lastDate, today);
      const finalInterest = currentPrincipal * monthlyInterestRate * monthsDiff;
      
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
    currentPrincipal: Math.max(0, currentPrincipal),
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
  // Calculate months difference more accurately
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  const dayDiff = endDate.getDate() - startDate.getDate();
  
  // Total months difference
  let totalMonths = yearDiff * 12 + monthDiff;
  
  // Add fractional month based on days
  if (dayDiff > 0) {
    const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    totalMonths += dayDiff / daysInMonth;
  } else if (dayDiff < 0) {
    totalMonths -= 1;
    const daysInPrevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
    totalMonths += (daysInPrevMonth + dayDiff) / daysInPrevMonth;
  }
  
  // For very new loans (less than a day), consider minimum of 1 day
  if (totalMonths < 0.001) {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    totalMonths = Math.max(daysDiff / 30, 0.001); // Minimum calculation
  }
  
  console.log('Date calculation:', {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalMonths: totalMonths.toFixed(4)
  });
  
  return Math.max(0, totalMonths);
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