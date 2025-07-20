import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { FaRupeeSign, FaUsers, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { calculateLoanInterest, getCurrentBalance, getLoanStatus } from "../utils/interestCalculator";
import "./Dashboard.css";

const Dashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    monthlyData: [],
    statusData: [],
    ornamentData: [],
    interestTrendData: []
  });

  // Fetch loans data
  const fetchLoans = async () => {
    try {
      const response = await fetch("https://localhost:7202/api/Loan");
      if (!response.ok) throw new Error("Failed to fetch loans");
      const data = await response.json();
      setLoans(data);
      processChartData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // Process data for charts
  const processChartData = (loansData) => {
    // Monthly loan data
    const monthlyMap = new Map();
    const statusMap = new Map();
    const ornamentMap = new Map();
    const interestTrendMap = new Map();

    loansData.forEach(loan => {
      const loanDate = new Date(loan.loanDate);
      const monthKey = `${loanDate.getFullYear()}-${String(loanDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = loanDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      // Calculate interest data
      const interestData = calculateLoanInterest(loan);
      const currentBalance = getCurrentBalance(loan);
      const status = getLoanStatus(loan);
      
      // Monthly data aggregation
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          totalPrincipal: 0,
          totalInterest: 0,
          totalAmount: 0,
          loanCount: 0,
          currentBalance: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.totalPrincipal += interestData.currentPrincipal;
      monthData.totalInterest += interestData.totalInterest;
      monthData.totalAmount += interestData.totalAmount;
      monthData.currentBalance += currentBalance;
      monthData.loanCount += 1;
      
      // Status data
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
      
      // Ornament type data
      const ornamentType = loan.ornamentType === 'both' ? 'Gold & Silver' : 
                          loan.ornamentType.charAt(0).toUpperCase() + loan.ornamentType.slice(1);
      ornamentMap.set(ornamentType, (ornamentMap.get(ornamentType) || 0) + 1);
      
      // Interest trend data (last 12 months)
      const today = new Date();
      const monthsBack = Math.floor((today - loanDate) / (1000 * 60 * 60 * 24 * 30));
      if (monthsBack <= 12) {
        if (!interestTrendMap.has(monthKey)) {
          interestTrendMap.set(monthKey, {
            month: monthName,
            cumulativeInterest: 0,
            newLoans: 0
          });
        }
        const trendData = interestTrendMap.get(monthKey);
        trendData.cumulativeInterest += interestData.totalInterest;
        trendData.newLoans += 1;
      }
    });

    // Convert maps to arrays and sort
    const monthlyData = Array.from(monthlyMap.values())
      .sort((a, b) => new Date(a.month + ' 1') - new Date(b.month + ' 1'))
      .slice(-12); // Last 12 months

    const statusData = Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: getStatusColor(name)
    }));

    const ornamentData = Array.from(ornamentMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: getOrnamentColor(name)
    }));

    const interestTrendData = Array.from(interestTrendMap.values())
      .sort((a, b) => new Date(a.month + ' 1') - new Date(b.month + ' 1'))
      .slice(-12);

    setChartData({
      monthlyData,
      statusData,
      ornamentData,
      interestTrendData
    });
  };

  // Helper functions for colors
  const getStatusColor = (status) => {
    const colors = {
      'Active': '#22c55e',
      'Due Soon': '#f59e0b',
      'Overdue': '#ef4444',
      'Closed': '#6b7280',
      'Renewed': '#3b82f6',
      'Paid': '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const getOrnamentColor = (type) => {
    const colors = {
      'Gold': '#fbbf24',
      'Silver': '#9ca3af',
      'Gold & Silver': '#f59e0b'
    };
    return colors[type] || '#6b7280';
  };

  // Calculate metrics
  const totalLoans = loans.length;
  const activeLoans = loans.filter(loan => getLoanStatus(loan) === 'Active').length;
  const overdueLoans = loans.filter(loan => getLoanStatus(loan) === 'Overdue').length;
  const totalPrincipal = loans.reduce((sum, loan) => {
    const interestData = calculateLoanInterest(loan);
    return sum + interestData.currentPrincipal;
  }, 0);
  const totalInterest = loans.reduce((sum, loan) => {
    const interestData = calculateLoanInterest(loan);
    return sum + interestData.totalInterest;
  }, 0);
  const totalOutstanding = loans.reduce((sum, loan) => {
    return sum + getCurrentBalance(loan);
  }, 0);

  const metrics = [
    { title: "Total Loans", value: totalLoans, icon: FaUsers, color: "#00adb5" },
    { title: "Active Loans", value: activeLoans, icon: FaChartLine, color: "#22c55e" },
    { title: "Overdue Loans", value: overdueLoans, icon: FaExclamationTriangle, color: "#ef4444" },
    { title: "Total Principal", value: `₹${totalPrincipal.toLocaleString()}`, icon: FaRupeeSign, color: "#3b82f6" },
    { title: "Total Interest", value: `₹${totalInterest.toLocaleString()}`, icon: FaRupeeSign, color: "#f59e0b" },
    { title: "Outstanding Amount", value: `₹${totalOutstanding.toLocaleString()}`, icon: FaRupeeSign, color: "#8b5cf6" },
  ];

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Metrics Cards */}
      <div className="dashboard-grid">
        {metrics.map((metric, idx) => {
          const IconComponent = metric.icon;
          return (
            <div key={idx} className="dashboard-card">
              <div className="card-content">
                <div className="card-icon" style={{ backgroundColor: metric.color }}>
                  <IconComponent />
                </div>
                <div className="card-info">
                  <h4>{metric.title}</h4>
                  <p>{metric.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        {/* Monthly Principal vs Interest */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Principal vs Interest</h3>
            <p>Comparison of principal amounts and interest earned by month</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="totalPrincipal" fill="#00adb5" name="Principal Amount" />
                <Bar dataKey="totalInterest" fill="#f59e0b" name="Interest Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Status Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Loan Status Distribution</h3>
            <p>Current status of all loans in the system</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Loans']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outstanding Balance Trend */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Outstanding Balance Trend</h3>
            <p>Monthly trend of outstanding balances and loan counts</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="currentBalance" 
                  stackId="1" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                  name="Outstanding Balance"
                />
                <Area 
                  type="monotone" 
                  dataKey="totalAmount" 
                  stackId="2" 
                  stroke="#00adb5" 
                  fill="#00adb5" 
                  fillOpacity={0.4}
                  name="Total Amount"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interest Accumulation Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Interest Accumulation</h3>
            <p>Cumulative interest earned over time</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.interestTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeInterest" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  name="Cumulative Interest"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ornament Type Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Ornament Type Distribution</h3>
            <p>Distribution of loans by ornament type</p>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.ornamentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.ornamentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Loans']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;