import React, { useState, useEffect } from 'react';
import { 
  FaFileDownload, 
  FaFilePdf, 
  FaFileExcel, 
  FaChartBar, 
  FaCalendarAlt,
  FaUsers,
  FaRupeeSign,
  FaExclamationTriangle
} from 'react-icons/fa';
import { calculateLoanInterest, getLoanStatus } from '../utils/interestCalculator';
import './Reports.css';

const Reports = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportData, setReportData] = useState(null);

  // Fetch loans data
  const fetchLoans = async () => {
    try {
      const response = await fetch("https://localhost:7133/api/Loan");
      if (!response.ok) throw new Error("Failed to fetch loans");
      const data = await response.json();
      setLoans(data);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Set default date range (current month)
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Filter loans based on date range
  const getFilteredLoans = () => {
    if (!fromDate || !toDate) return loans;
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999); // Include the entire end date
    
    return loans.filter(loan => {
      const loanDate = new Date(loan.loanDate);
      return loanDate >= from && loanDate <= to;
    });
  };

  // Generate report data
  const generateReportData = () => {
    const filteredLoans = getFilteredLoans();
    
    if (filteredLoans.length === 0) {
      setReportData({
        totalLoans: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        totalOutstanding: 0,
        activeLoans: 0,
        overdueLoans: 0,
        closedLoans: 0,
        loans: []
      });
      return;
    }

    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalOutstanding = 0;
    let activeLoans = 0;
    let overdueLoans = 0;
    let closedLoans = 0;

    const processedLoans = filteredLoans.map(loan => {
      const interestData = calculateLoanInterest(loan);
      const status = getLoanStatus(loan);
      
      // Only include Active and Overdue loans in financial calculations
      if (status === 'Active' || status === 'Overdue') {
        totalPrincipal += interestData.totalPrincipalGiven;
        totalInterest += interestData.totalInterest;
        totalOutstanding += interestData.currentOutstanding;
      }
      
      // Count loan statuses
      if (status === 'Active') activeLoans++;
      else if (status === 'Overdue') overdueLoans++;
      else if (status === 'Closed') closedLoans++;

      return {
        ...loan,
        status,
        interestData,
        totalAmount: interestData.totalPrincipalGiven + interestData.totalInterest,
        outstanding: interestData.currentOutstanding
      };
    });

    setReportData({
      totalLoans: filteredLoans.length,
      totalPrincipal: Math.round(totalPrincipal),
      totalInterest: Math.round(totalInterest),
      totalOutstanding: Math.round(totalOutstanding),
      activeLoans,
      overdueLoans,
      closedLoans,
      loans: processedLoans
    });
  };

  // Generate report when dates change
  useEffect(() => {
    if (loans.length > 0 && fromDate && toDate) {
      generateReportData();
    }
  }, [loans, fromDate, toDate]);

  // Quick filter functions
  const setQuickFilter = (type) => {
    const today = new Date();
    let from, to;

    switch (type) {
      case 'today':
        from = to = today;
        break;
      case 'week':
        from = new Date(today);
        from.setDate(today.getDate() - 7);
        to = today;
        break;
      case 'month':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), quarter * 3, 1);
        to = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setFromDate(from.toISOString().split('T')[0]);
    setToDate(to.toISOString().split('T')[0]);
  };

  // Download functions
  const downloadCSV = () => {
    if (!reportData || reportData.loans.length === 0) {
      alert('No data available for the selected date range.');
      return;
    }

    setDownloadLoading(true);
    
    try {
      const headers = [
        'Loan ID',
        'Customer Name',
        'Phone Number',
        'Ornament Type',
        'Loan Amount',
        'Interest Rate',
        'Total Interest',
        'Total Amount',
        'Outstanding',
        'Loan Date',
        'Status'
      ];

      const csvContent = [
        headers.join(','),
        ...reportData.loans.map(loan => [
          loan.LoanId || loan.loanId || loan.id,
          `"${loan.customerName}"`,
          loan.phoneNumber,
          loan.ornamentType,
          loan.loanAmount,
          `${loan.interestRate}%`,
          loan.interestData.totalInterest,
          loan.totalAmount,
          loan.outstanding,
          new Date(loan.loanDate).toLocaleDateString(),
          loan.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `loan_report_${fromDate}_to_${toDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error generating CSV file.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData || reportData.loans.length === 0) {
      alert('No data available for the selected date range.');
      return;
    }

    setDownloadLoading(true);
    
    try {
      // Create a printable HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Loan Report - ${fromDate} to ${toDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; color: #00adb5; }
            .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .amount { text-align: right; }
            .status { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
            .status-active { background: #dcfce7; color: #166534; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .status-closed { background: #f1f5f9; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Loan Report</h1>
            <p>Period: ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value">${reportData.totalLoans}</div>
                <div class="summary-label">Total Loans</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">₹${reportData.totalPrincipal.toLocaleString()}</div>
                <div class="summary-label">Total Principal</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">₹${reportData.totalInterest.toLocaleString()}</div>
                <div class="summary-label">Total Interest</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">₹${reportData.totalOutstanding.toLocaleString()}</div>
                <div class="summary-label">Outstanding</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Ornament</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Outstanding</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.loans.map(loan => `
                <tr>
                  <td>${loan.LoanId || loan.loanId || loan.id}</td>
                  <td>${loan.customerName}</td>
                  <td>${loan.phoneNumber}</td>
                  <td>${loan.ornamentType}</td>
                  <td class="amount">₹${loan.interestData.totalPrincipalGiven.toLocaleString()}</td>
                  <td class="amount">₹${loan.interestData.totalInterest.toLocaleString()}</td>
                  <td class="amount">₹${loan.outstanding.toLocaleString()}</td>
                  <td>${new Date(loan.loanDate).toLocaleDateString()}</td>
                  <td><span class="status status-${loan.status.toLowerCase()}">${loan.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } catch (error) {
      alert('Error generating PDF file.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!reportData || reportData.loans.length === 0) {
      alert('No data available for the selected date range.');
      return;
    }

    setDownloadLoading(true);
    
    try {
      // Create Excel-compatible CSV with UTF-8 BOM
      const headers = [
        'Loan ID',
        'Customer Name',
        'Phone Number',
        'Ornament Type',
        'Gold Weight (g)',
        'Silver Weight (g)',
        'Loan Amount',
        'Interest Rate (%)',
        'Total Interest',
        'Total Amount',
        'Outstanding Balance',
        'Loan Date',
        'Status'
      ];

      const csvContent = '\uFEFF' + [
        headers.join(','),
        ...reportData.loans.map(loan => [
          loan.LoanId || loan.loanId || loan.id,
          `"${loan.customerName}"`,
          loan.phoneNumber,
          loan.ornamentType,
          loan.goldWeight || 0,
          loan.silverWeight || 0,
          loan.loanAmount,
          loan.interestRate,
          loan.interestData.totalInterest,
          loan.totalAmount,
          loan.outstanding,
          new Date(loan.loanDate).toLocaleDateString(),
          loan.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `loan_report_${fromDate}_to_${toDate}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Error generating Excel file.');
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="error-message">
          <FaExclamationTriangle /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Header Section */}
      <div className="reports-header">
        <div className="reports-title">
          <h1>Reports & Analytics</h1>
          <p>Generate and download comprehensive loan reports</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="reports-grid">
        {/* Loan Reports Card */}
        <div className="report-card">
          <div className="report-card-header">
            <div className="report-icon">
              <FaChartBar />
            </div>
            <div className="report-card-title">
              <h3>Loan Reports</h3>
              <p>Generate detailed reports for loans within a specific date range</p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="quick-filters">
            <button 
              className="quick-filter-btn" 
              onClick={() => setQuickFilter('today')}
            >
              Today
            </button>
            <button 
              className="quick-filter-btn" 
              onClick={() => setQuickFilter('week')}
            >
              This Week
            </button>
            <button 
              className="quick-filter-btn active" 
              onClick={() => setQuickFilter('month')}
            >
              This Month
            </button>
            <button 
              className="quick-filter-btn" 
              onClick={() => setQuickFilter('quarter')}
            >
              This Quarter
            </button>
            <button 
              className="quick-filter-btn" 
              onClick={() => setQuickFilter('year')}
            >
              This Year
            </button>
          </div>

          {/* Date Range Form */}
          <div className="date-range-form">
            <div className="form-row">
              <div className="form-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Report Summary */}
          {reportData && (
            <div className="report-summary">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-value">{reportData.totalLoans}</div>
                  <div className="summary-label">Total Loans</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">₹{reportData.totalPrincipal.toLocaleString()}</div>
                  <div className="summary-label">Principal</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">₹{reportData.totalInterest.toLocaleString()}</div>
                  <div className="summary-label">Interest</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">₹{reportData.totalOutstanding.toLocaleString()}</div>
                  <div className="summary-label">Outstanding</div>
                </div>
              </div>
            </div>
          )}

          {/* Download Actions */}
          <div className="download-actions">
            <button 
              className="btn-download primary" 
              onClick={downloadCSV}
              disabled={downloadLoading || !reportData || reportData.totalLoans === 0}
            >
              {downloadLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FaFileDownload />
                  Download CSV
                </>
              )}
            </button>
            <button 
              className="btn-download secondary" 
              onClick={downloadExcel}
              disabled={downloadLoading || !reportData || reportData.totalLoans === 0}
            >
              <FaFileExcel />
              Download Excel
            </button>
            <button 
              className="btn-download tertiary" 
              onClick={downloadPDF}
              disabled={downloadLoading || !reportData || reportData.totalLoans === 0}
            >
              <FaFilePdf />
              Print/PDF
            </button>
          </div>
        </div>

        {/* Additional Report Cards can be added here */}
        <div className="report-card">
          <div className="report-card-header">
            <div className="report-icon">
              <FaUsers />
            </div>
            <div className="report-card-title">
              <h3>Customer Reports</h3>
              <p>Generate customer-wise loan analysis and payment history</p>
            </div>
          </div>
          <div className="download-actions">
            <button className="btn-download primary" disabled>
              <FaFileDownload />
              Coming Soon
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div className="report-icon">
              <FaRupeeSign />
            </div>
            <div className="report-card-title">
              <h3>Financial Reports</h3>
              <p>Detailed financial analysis including profit/loss statements</p>
            </div>
          </div>
          <div className="download-actions">
            <button className="btn-download primary" disabled>
              <FaFileDownload />
              Coming Soon
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div className="report-icon">
              <FaCalendarAlt />
            </div>
            <div className="report-card-title">
              <h3>Due Date Reports</h3>
              <p>Track upcoming due dates and overdue loans</p>
            </div>
          </div>
          <div className="download-actions">
            <button className="btn-download primary" disabled>
              <FaFileDownload />
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;