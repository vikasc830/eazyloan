/**
 * Interest Calculator Utility
 * Calculates interest based on principal amount and time duration
 * Interest = Principal × Rate × Time (in days/months)
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
  let totalPaid = 0;
  
  // Create timeline of events (loan start, payments, extra loans)
  const events = [];
  
  // Add loan start event
  events.push({
    date: loanDate,
    type: 'loan_start',
    amount: originalLoanAmount,
    description: 'Original loan started'
  });
  
  // Add payment events
  sortedPayments.forEach(payment => {
    const paymentDate = new Date(payment.date || payment.Date);
    const partialPayment = parseFloat(payment.partialPayment || payment.PartialPayment || 0);
    const extraLoan = parseFloat(payment.extraLoan || payment.ExtraLoan || 0);
    
    if (partialPayment > 0) {
      events.push({
        date: paymentDate,
        type: 'payment',
        amount: partialPayment,
        description: `Payment received: ₹${partialPayment.toLocaleString()}`
      });
      totalPaid += partialPayment;
    }
    
    if (extraLoan > 0) {
      events.push({
        date: paymentDate,
        type: 'extra_loan',
        amount: extraLoan,
        description: `Extra loan given: ₹${extraLoan.toLocaleString()}`
      });
      totalExtraLoans += extraLoan;
    }
  });
  
  // Sort events by date
  events.sort((a, b) => a.date - b.date);
  
  // Calculate interest for each period
  let runningPrincipal = 0;
  let lastDate = loanDate;
  
  events.forEach((event, index) => {
    const eventDate = event.date;
    
    // Calculate interest for the period from lastDate to eventDate
    if (runningPrincipal > 0 && eventDate > lastDate) {
      const days = calculateDaysDifference(lastDate, eventDate);
      const months = days / 30; // Convert days to months for interest calculation
      const periodInterest = runningPrincipal * monthlyInterestRate * months;
      
      totalInterest += periodInterest;
      
      interestBreakdown.push({
        fromDate: lastDate,
        toDate: eventDate,
        principal: runningPrincipal,
        days: days,
        months: months,
        interest: periodInterest,
        type: 'period',
        description: `Interest on ₹${runningPrincipal.toLocaleString()} for ${days} days (${months.toFixed(2)} months)`
      });
      
      console.log(`Period ${index}: ₹${runningPrincipal} for ${days} days = ₹${periodInterest.toFixed(2)} interest`);
    }
    
    // Update running principal based on event type
    if (event.type === 'loan_start' || event.type === 'extra_loan') {
      runningPrincipal += event.amount;
      currentPrincipal = runningPrincipal; // Update current principal
    }
    // Note: Payments don't reduce principal for interest calculation, they reduce outstanding balance
    
    // Add event to breakdown
    interestBreakdown.push({
      date: eventDate,
      type: event.type,
      amount: event.type === 'payment' ? -event.amount : event.amount,
      newPrincipal: runningPrincipal,
      description: event.description
    });
    
    lastDate = eventDate;
  });
  
  // Calculate interest from last event date to today
  if (runningPrincipal > 0 && today > lastDate) {
    const days = calculateDaysDifference(lastDate, today);
    const months = days / 30;
    const finalPeriodInterest = runningPrincipal * monthlyInterestRate * months;
    
    totalInterest += finalPeriodInterest;
    
    interestBreakdown.push({
      fromDate: lastDate,
      toDate: today,
      principal: runningPrincipal,
      days: days,
      months: months,
      interest: finalPeriodInterest,
      type: 'current',
      description: `Current interest on ₹${runningPrincipal.toLocaleString()} for ${days} days (${months.toFixed(2)} months)`
    });
    
    console.log(`Final period: ₹${runningPrincipal} for ${days} days = ₹${finalPeriodInterest.toFixed(2)} interest`);
  }
  
  const result = {
    totalInterest: Math.round(totalInterest * 100) / 100,
    currentPrincipal: Math.max(0, currentPrincipal), // Original + Extra loans
    interestBreakdown,
    totalAmount: Math.max(0, currentPrincipal) + totalInterest,
    originalLoanAmount,
    totalExtraLoans,
    totalPaid,
    totalPrincipal: currentPrincipal // This should be originalLoanAmount + totalExtraLoans
  };
  
  console.log('Final result:', result);
  return result;
};

/**
 * Calculate difference in days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Difference in days
 */
const calculateDaysDifference = (startDate, endDate) => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  console.log('Date calculation:', {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    daysDiff: daysDiff
  });
  
  return Math.max(0, daysDiff);
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
  
  // Convert days to months (using actual days per month calculation)
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
    return total + parseFloat(partialPayment);
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
    return total + parseFloat(extraLoan);
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