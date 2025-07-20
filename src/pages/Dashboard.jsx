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
  Area,
  ComposedChart
} from 'recharts';
import { 
  FaRupeeSign, 
  FaUsers, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaTrendingUp,
  FaCalendarAlt,
  FaGem,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaEquals
} from 'react-icons/fa';
import { calculateLoanInterest, getCurrentBalance, getLoanStatus } from "../utils/interestCalculator";
import "./Dashboard.css";

const Dashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('12'); // months
  const [chartData, setChartData] = useState({
    monthlyData: [],
    statusData: [],
    ornamentData: [],
    interestTrendData: [],
    performanceData: []
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

  useEffect(() => {
    if (loans.length > 0) {
      processChartData(loans);
    }
  }, [selectedTimeframe]);

  // Process data for charts
  const processChartData = (loansData) => {
    const monthsToShow = parseInt(selectedTimeframe);
    const monthlyMap = new Map();
    const statusMap = new Map();
    const ornamentMap = new Map();
    const interestTrendMap = new Map();
    const performanceMap = new Map();

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
          currentBalance: 0,
          newLoans: 0,
          avgLoanAmount: 0
        });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.totalPrincipal += interestData.currentPrincipal;
      monthData.totalInterest += interestData.totalInterest;
      monthData.totalAmount += interestData.totalAmount;
      monthData.currentBalance += currentBalance;
      monthData.loanCount += 1;
      monthData.newLoans += 1;
      
      // Status data
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
      
      // Ornament type data with values
      const ornamentType = loan.ornamentType === 'both' ? 'Gold & Silver' : 
                          loan.ornamentType.charAt(0).toUpperCase() + loan.ornamentType.slice(1);
      if (!ornamentMap.has(ornamentType)) {
        ornamentMap.set(ornamentType, { count: 0, value: 0 });
      }
      const ornamentData = ornamentMap.get(ornamentType);
      ornamentData.count += 1;
      ornamentData.value += interestData.currentPrincipal;
      
      // Performance data
      const today = new Date();
      const monthsBack = Math.floor((today - loanDate) / (1000 * 60 * 60 * 24 * 30));
      if (monthsBack <= monthsToShow) {
        if (!performanceMap.has(monthKey)) {
          performanceMap.set(monthKey, {
            month: monthName,
            revenue: 0,
            collections: 0,
            newBusiness: 0,
            efficiency: 0
          });
        }
        const perfData = performanceMap.get(monthKey);
        perfData.revenue += interestData.totalInterest;
        perfData.newBusiness += interestData.currentPrincipal;
        if (loan.payments && loan.payments.length > 0) {
          perfData.collections += loan.payments.reduce((sum, p) => sum + (p.partialPayment || 0), 0);
        }
      }
    });

    // Calculate average loan amounts and efficiency
    monthlyMap.forEach((data, key) => {
      data.avgLoanAmount = data.loanCount > 0 ? data.totalPrincipal / data.loanCount : 0;
    });

    performanceMap.forEach((data, key) => {
      data.efficiency = data.newBusiness > 0 ? (data.collections / data.newBusiness) * 100 : 0;
    });

    // Convert maps to arrays and sort
    const monthlyData = Array.from(monthlyMap.values())
      .sort((a, b) => new Date(a.month + ' 1') - new Date(b.month + ' 1'))
      .slice(-monthsToShow);

    const statusData = Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: getStatusColor(name)
    }));

    const ornamentData = Array.from(ornamentMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value,
      color: getOrnamentColor(name)
    }));

    const interestTrendData = Array.from(monthlyMap.values())
      .sort((a, b) => new Date(a.month + ' 1') - new Date(b.month + ' 1'))
      .slice(-monthsToShow);

    const performanceData = Array.from(performanceMap.values())
      .sort((a, b) => new Date(a.month + ' 1') - new Date(b.month + ' 1'))
      .slice(-monthsToShow);

    setChartData({
      monthlyData,
      statusData,
      ornamentData,
      interestTrendData,
      performanceData
    });
  };

  // Helper functions for colors
  const getStatusColor = (status) => {
    const colors = {
      'Active': '#10b981',
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

  // Calculate growth metrics
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const currentMonthLoans = loans.filter(loan => new Date(loan.loanDate).getMonth() === currentMonth).length;
  const lastMonthLoans = loans.filter(loan => new Date(loan.loanDate).getMonth() === lastMonth).length;
  const loanGrowth = lastMonthLoans > 0 ? ((currentMonthLoans - lastMonthLoans) / lastMonthLoans) * 100 : 0;

  const metrics = [
    { 
      title: "Total Loans", 
      value: totalLoans, 
      icon: FaUsers, 
      color: "#00adb5",
      trend: loanGrowth,
      subtitle: "Active portfolio"
    },
    { 
      title: "Active Loans", 
      value: activeLoans, 
      icon: FaChartLine, 
      color: "#10b981",
      trend: 5.2,
      subtitle: "Currently running"
    },
    { 
      title: "Overdue Loans", 
      value: overdueLoans, 
      icon: FaExclamationTriangle, 
      color: "#ef4444",
      trend: -2.1,
      subtitle: "Needs attention"
    },
    { 
      title: "Total Principal", 
      value: `₹${(totalPrincipal / 100000).toFixed(1)}L`, 
      icon: FaRupeeSign, 
      color: "#3b82f6",
      trend: 8.7,
      subtitle: "Principal amount"
    },
    { 
      title: "Interest Earned", 
      value: `₹${(totalInterest / 100000).toFixed(1)}L`, 
      icon: FaTrendingUp, 
      color: "#f59e0b",
      trend: 12.3,
      subtitle: "Total interest"
    },
    { 
      title: "Outstanding", 
      value: `₹${(totalOutstanding / 100000).toFixed(1)}L`, 
      icon: FaMoneyBillWave, 
      color: "#8b5cf6",
      trend: -3.4,
      subtitle: "To be collected"
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Business Dashboard</h1>
          <p>Real-time insights into your loan portfolio performance</p>
        </div>
        <div className="header-controls">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="timeframe-selector"
          >
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
            <option value="24">Last 24 months</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        {metrics.map((metric, idx) => {
          const IconComponent = metric.icon;
          const isPositive = metric.trend > 0;
          const TrendIcon = isPositive ? FaArrowUp : metric.trend < 0 ? FaArrowDown : FaEquals;
          
          return (
            <div key={idx} className="metric-card">
              <div className="metric-header">
                <div className="metric-icon" style={{ backgroundColor: metric.color }}>
                  <IconComponent />
                </div>
                <div className={`metric-trend ${isPositive ? 'positive' : metric.trend < 0 ? 'negative' : 'neutral'}`}>
                  <TrendIcon />
                  <span>{Math.abs(metric.trend).toFixed(1)}%</span>
                </div>
              </div>
              <div className="metric-content">
                <h3>{metric.value}</h3>
                <p className="metric-title">{metric.title}</p>
                <span className="metric-subtitle">{metric.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Monthly Performance Overview */}
        <div className="chart-card featured">
          <div className="chart-header">
            <div className="header-content">
              <h3>Monthly Performance Overview</h3>
              <p>Principal amounts, interest earned, and loan counts by month</p>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#00adb5' }}></div>
                Principal
              </span>
              <span className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                Interest
              </span>
              <span className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                Count
              </span>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="amount"
                  orientation="left"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <YAxis 
                  yAxisId="count"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'Loan Count') return [value, name];
                    return [`₹${value.toLocaleString()}`, name];
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar yAxisId="amount" dataKey="totalPrincipal" fill="#00adb5" name="Principal Amount" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="amount" dataKey="totalInterest" fill="#f59e0b" name="Interest Amount" radius={[4, 4, 0, 0]} />
                <Line yAxisId="count" type="monotone" dataKey="loanCount" stroke="#10b981" strokeWidth={3} name="Loan Count" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Status Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-content">
              <h3>Loan Status Distribution</h3>
              <p>Current status breakdown of all loans</p>
            </div>
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
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  formatter={(value) => [value, 'Loans']} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outstanding Balance Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-content">
              <h3>Outstanding Balance Trend</h3>
              <p>Monthly outstanding amounts and collection efficiency</p>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
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
                  fillOpacity={0.3}
                  name="Total Amount"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Performance Metrics */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-content">
              <h3>Business Performance</h3>
              <p>Revenue, collections, and efficiency metrics</p>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="amount"
                  orientation="left"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <YAxis 
                  yAxisId="percent"
                  orientation="right"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'Collection Efficiency') return [`${value.toFixed(1)}%`, name];
                    return [`₹${value.toLocaleString()}`, name];
                  }}
                />
                <Bar yAxisId="amount" dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="amount" dataKey="collections" fill="#3b82f6" name="Collections" radius={[4, 4, 0, 0]} />
                <Line yAxisId="percent" type="monotone" dataKey="efficiency" stroke="#ef4444" strokeWidth={3} name="Collection Efficiency" dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ornament Type Analysis */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-content">
              <h3>Ornament Portfolio</h3>
              <p>Distribution by ornament type and value</p>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.ornamentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.ornamentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interest Accumulation Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-content">
              <h3>Interest Accumulation</h3>
              <p>Monthly interest earned and growth trend</p>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.interestTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalInterest" 
                  stroke="#f59e0b" 
                  strokeWidth={4}
                  name="Total Interest"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;