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

  // Sort payments by date
  const payments = loan.payments || loan.Payments || [];
  const sortedPayments = payments.sort(
    (a, b) => new Date(a.date || a.Date) - new Date(b.date || b.Date)
  );

  let totalInterest = 0;
  const interestBreakdown = [];
  let runningPrincipal = originalLoanAmount; // This is the principal that earns interest
  let totalExtraLoans = 0;
  let totalPayments = 0;
  let lastDate = loanDate;

  console.log(`Starting calculation for loan: ${loan.id}`);
  console.log(`Original amount: ₹${originalLoanAmount}, Rate: ${loan.interestRate}%`);

  // Create timeline of all events
  const events = [];
  
  // Add loan start event
  events.push({
    date: loanDate,
    type: 'loan_start',
    amount: originalLoanAmount,
    description: 'Loan started'
  });

  // Add payment events
  sortedPayments.forEach((payment) => {
    const paymentDate = new Date(payment.date || payment.Date);
    
    // Add extra loan event if exists
    const extraLoan = parseFloat(payment.extraLoan || payment.ExtraLoan || 0);
    if (extraLoan > 0) {
      events.push({
        date: paymentDate,
        type: 'extra_loan',
        amount: extraLoan,
        description: `Extra loan given: ₹${extraLoan.toLocaleString()}`
      });
    }
    
    // Add payment event if exists
    const partialPayment = parseFloat(payment.partialPayment || payment.PartialPayment || 0);
    if (partialPayment > 0) {
      events.push({
        date: paymentDate,
        type: 'payment',
        amount: partialPayment,
        description: `Payment received: ₹${partialPayment.toLocaleString()}`
      });
    }
  });

  // Sort events by date
  events.sort((a, b) => a.date - b.date);

  // Process each period between events
  for (let i = 0; i < events.length; i++) {
    const currentEvent = events[i];
    const nextEvent = events[i + 1];

    // Calculate interest for the period from lastDate to current event date
    if (lastDate < currentEvent.date && runningPrincipal > 0) {
      const days = calculateDaysDifference(lastDate, currentEvent.date);
      const months = days / 30; // Convert days to months for interest calculation
      const periodInterest = runningPrincipal * monthlyInterestRate * months;
      
      totalInterest += periodInterest;
      
      interestBreakdown.push({
        fromDate: lastDate,
        toDate: currentEvent.date,
        principal: runningPrincipal,
        days: days,
        months: months,
        interest: periodInterest,
        type: 'period',
        description: `Interest on ₹${runningPrincipal.toLocaleString()} for ${days} days (${months.toFixed(2)} months)`
      });

      console.log(`Period: ${lastDate.toDateString()} to ${currentEvent.date.toDateString()}`);
      console.log(`Principal: ₹${runningPrincipal}, Days: ${days}, Interest: ₹${periodInterest.toFixed(2)}`);
    }

    // Apply the current event
    if (currentEvent.type === 'extra_loan') {
      runningPrincipal += currentEvent.amount;
      totalExtraLoans += currentEvent.amount;
      
      interestBreakdown.push({
        date: currentEvent.date,
        type: 'extra_loan',
        amount: currentEvent.amount,
        newPrincipal: runningPrincipal,
        description: currentEvent.description
      });
      
      console.log(`Extra loan: ₹${currentEvent.amount}, New principal: ₹${runningPrincipal}`);
    } else if (currentEvent.type === 'payment') {
      // Payments reduce the principal that earns interest going forward
      runningPrincipal = Math.max(0, runningPrincipal - currentEvent.amount);
      totalPayments += currentEvent.amount;
      
      interestBreakdown.push({
        date: currentEvent.date,
        type: 'payment',
        amount: -currentEvent.amount,
        newPrincipal: runningPrincipal,
        description: currentEvent.description
      });
      
      console.log(`Payment: ₹${currentEvent.amount}, New principal: ₹${runningPrincipal}`);
    }

    lastDate = currentEvent.date;
  }

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

  // Calculate totals correctly
  const totalPrincipalGiven = originalLoanAmount + totalExtraLoans; // Total money given to customer
  const totalAmountDue = totalPrincipalGiven + totalInterest; // Total amount customer owes
  const currentOutstanding = totalAmountDue - totalPayments; // What customer still owes

  const result = {
    totalInterest: Math.round(totalInterest * 100) / 100,
    currentPrincipal: runningPrincipal, // Principal that's currently earning interest
    totalPrincipalGiven: totalPrincipalGiven, // Total money given to customer
    currentOutstanding: Math.max(0, currentOutstanding), // Current outstanding balance
    interestBreakdown,
    originalLoanAmount,
    totalExtraLoans,
    totalPayments,
    totalAmount: Math.round(totalAmountDue * 100) / 100 // Total amount due (before payments)
  };

  console.log(`Final calculation:`, result);
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
 * Get current outstanding balance (what customer still owes)
 * @param {Object} loan - The loan object
 * @returns {number} - Outstanding balance
 */
export const getCurrentBalance = (loan) => {
  const interestData = calculateLoanInterest(loan);
  return interestData.currentOutstanding;
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