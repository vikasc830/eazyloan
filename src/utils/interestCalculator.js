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
  
  // Sort payments by date
  const sortedPayments = (loan.payments || []).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let totalInterest = 0;
  const interestBreakdown = [];
  
  // Create timeline of principal changes
  const principalTimeline = [];
  
  // Add initial loan
  principalTimeline.push({
    date: loanDate,
    type: 'loan',
    amount: parseFloat(loan.loanAmount),
    description: 'Initial loan amount'
  });
  
  // Add all payments to timeline
  sortedPayments.forEach(payment => {
    const paymentDate = new Date(payment.date);
    
    if (payment.extraLoan > 0) {
      principalTimeline.push({
        date: paymentDate,
        type: 'extra_loan',
        amount: payment.extraLoan,
        description: `Extra loan given`
      });
    }
    
    if (payment.partialPayment > 0) {
      principalTimeline.push({
        date: paymentDate,
        type: 'payment',
        amount: -payment.partialPayment,
        description: `Partial payment received`
      });
    }
  });
  
  // Sort timeline by date
  principalTimeline.sort((a, b) => a.date - b.date);
  
  // Calculate interest for each period
  let currentPrincipal = parseFloat(loan.loanAmount);
  let lastDate = loanDate;
  
  // If there are no payments, calculate interest from loan date to today
  if (principalTimeline.length === 1) {
    // Only the initial loan entry exists
    const monthsDiff = calculateMonthsDifference(loanDate, today);
    if (monthsDiff > 0) {
      totalInterest = currentPrincipal * monthlyInterestRate * monthsDiff;
      
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
    // Process timeline with payments
    for (let i = 1; i < principalTimeline.length; i++) {
    const event = principalTimeline[i];
    const eventDate = event.date;
    
    // Calculate interest for the period before this event (if there's outstanding principal)
    if (currentPrincipal > 0 && eventDate > lastDate) {
      const monthsDiff = calculateMonthsDifference(lastDate, eventDate);
      const periodInterest = currentPrincipal * monthlyInterestRate * monthsDiff;
      
      if (periodInterest > 0) {
        totalInterest += periodInterest;
        
        interestBreakdown.push({
          fromDate: lastDate,
          toDate: eventDate,
          principal: currentPrincipal,
          months: monthsDiff,
          interest: periodInterest,
          type: 'period',
          description: `Interest for ${monthsDiff.toFixed(2)} months on ₹${currentPrincipal.toLocaleString()}`
        });
      }
    }
    
    // Update principal based on event
    if (event.type === 'loan' || event.type === 'extra_loan') {
      currentPrincipal += event.amount;
    } else if (event.type === 'payment') {
      currentPrincipal = Math.max(0, currentPrincipal + event.amount); // amount is negative for payments
    }
    
    // Add event to breakdown
    interestBreakdown.push({
      date: eventDate,
      type: event.type,
      amount: event.amount,
      newPrincipal: currentPrincipal,
      description: event.description
    });
    
    lastDate = eventDate;
    }
    
    // Calculate interest from last event to today (if there's outstanding principal)
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
  const originalLoanAmount = parseFloat(loan.loanAmount);
  const totalExtraLoans = calculateTotalExtraLoans(loan);
  const totalPrincipal = originalLoanAmount + totalExtraLoans;
  
  return {
    totalInterest: Math.round(totalInterest * 100) / 100,
    currentPrincipal: Math.max(0, currentPrincipal),
    interestBreakdown,
    totalAmount: Math.max(0, currentPrincipal) + totalInterest,
    originalLoanAmount,
    totalExtraLoans,
    totalPrincipal
  };
};

/**
 * Calculate difference in months between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Difference in months (decimal)
 */
const calculateMonthsDifference = (startDate, endDate) => {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  const dayDiff = endDate.getDate() - startDate.getDate();
  
  let totalMonths = yearDiff * 12 + monthDiff;
  
  // Add fractional month based on days
  const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
  totalMonths += dayDiff / daysInMonth;
  
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