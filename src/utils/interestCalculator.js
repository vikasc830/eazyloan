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
  const payments = loan.payments || [];
  const sortedPayments = payments.sort(
    (a, b) => new Date(a.date || a.Date) - new Date(b.date || b.Date)
  );

  let totalInterest = 0;
  const interestBreakdown = [];
  let runningPrincipal = originalLoanAmount; // This is the principal that earns interest
  let lastDate = loanDate;

  console.log(`Starting calculation for loan: ${loan.id}`);
  console.log(`Original amount: ₹${originalLoanAmount}, Rate: ${loan.interestRate}%`);

  // Calculate totals separately (don't modify these in the loop)
  // Only sum extra loans that are not part of the original loan
  const totalExtraLoans = sortedPayments.reduce((sum, payment) => {
    return sum + parseFloat(payment.extraLoan || payment.ExtraLoan || 0);
  }, 0);

  const totalPayments = sortedPayments.reduce((sum, payment) => {
    return sum + parseFloat(payment.partialPayment || payment.PartialPayment || 0);
  }, 0);

  console.log(`Total extra loans: ₹${totalExtraLoans}, Total payments: ₹${totalPayments}`);

  // Create timeline of all events
  const events = [];
  
  // Add payment events
  sortedPayments.forEach((payment) => {
    const paymentDate = new Date(payment.date || payment.Date);
    const extraLoan = parseFloat(payment.extraLoan || payment.ExtraLoan || 0);
    const partialPayment = parseFloat(payment.partialPayment || payment.PartialPayment || 0);
    
    if (extraLoan > 0 || partialPayment > 0) {
      events.push({
        date: paymentDate,
        extraLoan: extraLoan,
        partialPayment: partialPayment
      });
    }
  });

  // Sort events by date
  events.sort((a, b) => a.date - b.date);

  // Track extra loans already added to avoid double-counting
  let extraLoanTotalAdded = 0;
  for (let i = 0; i < events.length; i++) {
    const currentEvent = events[i];

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

    // Apply extra loan first (increases principal for interest calculation)
    if (currentEvent.extraLoan > 0) {
      // Only add extra loan if not already added
      if (extraLoanTotalAdded + currentEvent.extraLoan <= totalExtraLoans) {
        runningPrincipal += currentEvent.extraLoan;
        extraLoanTotalAdded += currentEvent.extraLoan;
        interestBreakdown.push({
          date: currentEvent.date,
          type: 'extra_loan',
          amount: currentEvent.extraLoan,
          newPrincipal: runningPrincipal,
          description: `Extra loan given: ₹${currentEvent.extraLoan.toLocaleString()}`
        });
        console.log(`Extra loan: ₹${currentEvent.extraLoan}, New principal: ₹${runningPrincipal}`);
      }
    }

    // Apply payment (reduces principal for interest calculation)
    if (currentEvent.partialPayment > 0) {
      // Payments reduce the principal that earns interest going forward
      runningPrincipal = Math.max(0, runningPrincipal - currentEvent.partialPayment);

      interestBreakdown.push({
        date: currentEvent.date,
        type: 'payment',
        amount: -currentEvent.partialPayment,
        newPrincipal: runningPrincipal,
        description: `Payment received: ₹${currentEvent.partialPayment.toLocaleString()}`
      });

      console.log(`Payment: ₹${currentEvent.partialPayment}, New principal: ₹${runningPrincipal}`);
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

  // Calculate totals correctly - using the pre-calculated totals
  // totalPrincipalGiven = original loan + all extra loans (not double-counted)
  const totalPrincipalGiven = originalLoanAmount + totalExtraLoans;
  const totalAmountDue = totalPrincipalGiven + totalInterest;
  const currentOutstanding = totalAmountDue - totalPayments;

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
  console.log(`Breakdown: Original: ₹${originalLoanAmount}, Extra: ₹${totalExtraLoans}, Total Given: ₹${totalPrincipalGiven}`);
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
  const payments = loan.payments || [];
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
  const payments = loan.payments || [];
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
  // Check explicit status first
  if (loan.status && loan.status.toLowerCase() === 'closed') return 'Closed';
  if (loan.status && loan.status.toLowerCase() === 'renewed') return 'Renewed';
  if (loan.Status && loan.Status.toLowerCase() === 'closed') return 'Closed';
  if (loan.Status && loan.Status.toLowerCase() === 'renewed') return 'Renewed';

  const today = new Date();
  const loanDate = new Date(loan.loanDate || loan.LoanDate);
  const balance = getCurrentBalance(loan);

  // If balance is zero or negative, loan is effectively closed
  if (balance <= 0) return 'Paid';
  
  // Calculate months since loan date
  const monthsDiff = (today.getFullYear() - loanDate.getFullYear()) * 12 + 
                     (today.getMonth() - loanDate.getMonth());
  
  // If loan is more than 11 months old, it's overdue
  if (monthsDiff > 11) return 'Overdue';
  
  // Otherwise, it's active
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