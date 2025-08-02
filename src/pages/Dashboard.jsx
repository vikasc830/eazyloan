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
  ComposedChart,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  FaRupeeSign, 
  FaUsers, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaCalendarAlt,
  FaGem,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaArrowUp,
  FaCoins
} from 'react-icons/fa';
import { calculateLoanInterest, getCurrentBalance, getLoanStatus } from "../utils/interestCalculator";
import "./Dashboard.css";

// Modern color palette
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  gradient: {
    primary: ['#6366f1', '#8b5cf6'],
    secondary: ['#06b6d4', '#0891b2'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626']
  }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-item" style={{ color: entry.color }}>
            <span className="tooltip-name">{entry.name}:</span>
            <span className="tooltip-value">
              {typeof entry.value === 'number' && entry.name.includes('Amount') 
                ? `₹${entry.value.toLocaleString()}` 
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = ({ payload }) => {
  return (
    <div className="custom-legend">
      {payload.map((entry, index) => (
        <div key={index} className="legend-item">
          <div 
            className="legend-color" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="legend-text">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

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
      const response = await fetch("https://localhost:7202/api/Loan", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error("Failed to fetch loans");
      const data = await response.json();
      setLoans(data);
      processChartData(data);
    } catch (err) {
      console.error(err);
      // Set empty array to prevent rendering errors
      setLoans([]);
      setChartData({
        monthlyData: [],
        statusData: [],
        ornamentData: [],
        interestTrendData: [],
        performanceData: []
      });
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
      'Active': COLORS.success,
      'Due Soon': COLORS.warning,
      'Overdue': COLORS.danger,
      'Closed': '#6b7280',
      'Renewed': COLORS.info,
      'Paid': COLORS.success
    };
    return colors[status] || '#6b7280';
  };

  const getOrnamentColor = (type) => {
    const colors = {
      'Gold': COLORS.warning,
      'Silver': '#9ca3af',
      'Gold & Silver': COLORS.accent
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
      color: COLORS.primary,
      trend: loanGrowth,
      subtitle: "Active portfolio"
    },
    { 
      title: "Active Loans", 
      value: activeLoans, 
      icon: FaTrendingUp,
      color: COLORS.success,
      trend: 5.2,
      subtitle: "Currently running"
    },
    { 
      title: "Overdue Loans", 
      value: overdueLoans, 
      icon: FaExclamationTriangle, 
      color: COLORS.danger,
      trend: -2.1,
      subtitle: "Needs attention"
    },
    { 
      title: "Total Principal", 
      value: `₹${(totalPrincipal / 100000).toFixed(1)}L`, 
      icon: FaCoins,
      color: COLORS.info,
      trend: 8.7,
      subtitle: "Principal amount"
    },
    { 
      title: "Interest Earned", 
      value: `₹${(totalInterest / 100000).toFixed(1)}L`, 
      icon: FaArrowUp, 
      color: COLORS.warning,
      trend: 12.3,
      subtitle: "Total interest"
    },
    { 
      title: "Outstanding", 
      value: `₹${(totalOutstanding / 100000).toFixed(1)}L`, 
      icon: FaMoneyBillWave, 
      color: COLORS.secondary,
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
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData.monthlyData}>
                <defs>
                  <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                />
                <YAxis 
                  yAxisId="amount"
                  orientation="left"
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <YAxis 
                  yAxisId="count"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Bar 
                  yAxisId="amount" 
                  dataKey="totalPrincipal" 
                  fill="url(#principalGradient)" 
                  name="Principal Amount" 
                  radius={[6, 6, 0, 0]}
                  stroke={COLORS.primary}
                  strokeWidth={1}
                />
                <Bar 
                  yAxisId="amount" 
                  dataKey="totalInterest" 
                  fill="url(#interestGradient)" 
                  name="Interest Amount" 
                  radius={[6, 6, 0, 0]}
                  stroke={COLORS.warning}
                  strokeWidth={1}
                />
                <Line 
                  yAxisId="count" 
                  type="monotone" 
                  dataKey="loanCount" 
                  stroke={COLORS.success} 
                  strokeWidth={4} 
                  name="Loan Count" 
                  dot={{ fill: COLORS.success, strokeWidth: 2, r: 6, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: COLORS.success, strokeWidth: 2, fill: '#fff' }}
                />
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
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={<CustomLegend />}
                  wrapperStyle={{ paddingTop: '20px' }}
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
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData.monthlyData}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="currentBalance" 
                  stroke={COLORS.secondary}
                  strokeWidth={3}
                  fill="url(#balanceGradient)"
                  name="Outstanding Balance"
                  dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, stroke: COLORS.secondary, strokeWidth: 2, fill: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalAmount" 
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  fill="url(#totalGradient)"
                  name="Total Amount"
                  strokeDasharray="5 5"
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
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData.performanceData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="collectionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.info} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                />
                <YAxis 
                  yAxisId="amount"
                  orientation="left"
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <YAxis 
                  yAxisId="percent"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  yAxisId="amount" 
                  dataKey="revenue" 
                  fill="url(#revenueGradient)" 
                  name="Revenue" 
                  radius={[6, 6, 0, 0]}
                  stroke={COLORS.success}
                  strokeWidth={1}
                />
                <Bar 
                  yAxisId="amount" 
                  dataKey="collections" 
                  fill="url(#collectionsGradient)" 
                  name="Collections" 
                  radius={[6, 6, 0, 0]}
                  stroke={COLORS.info}
                  strokeWidth={1}
                />
                <Line 
                  yAxisId="percent" 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke={COLORS.danger} 
                  strokeWidth={4} 
                  name="Collection Efficiency" 
                  dot={{ fill: COLORS.danger, strokeWidth: 2, r: 6, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: COLORS.danger, strokeWidth: 2, fill: '#fff' }}
                />
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
            <ResponsiveContainer width="100%" height={320}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="90%" 
                data={chartData.ornamentData.map((item, index) => ({
                  ...item,
                  fill: item.color,
                  uv: (item.value / Math.max(...chartData.ornamentData.map(d => d.value))) * 100
                }))}
              >
                <RadialBar 
                  dataKey="uv" 
                  cornerRadius={10} 
                  fill="#8884d8"
                  stroke="#fff"
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={<CustomLegend />}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </RadialBarChart>
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
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData.interestTrendData}>
                <defs>
                  <linearGradient id="interestLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLORS.warning} stopOpacity={1}/>
                    <stop offset="100%" stopColor={COLORS.danger} stopOpacity={1}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={13}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontWeight: 500 }}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="totalInterest" 
                  stroke="url(#interestLineGradient)"
                  strokeWidth={5}
                  name="Total Interest"
                  dot={{ 
                    fill: COLORS.warning, 
                    strokeWidth: 3, 
                    r: 8,
                    stroke: '#fff',
                    filter: 'url(#glow)'
                  }}
                  activeDot={{ 
                    r: 12, 
                    stroke: COLORS.warning, 
                    strokeWidth: 3, 
                    fill: '#fff',
                    filter: 'url(#glow)'
                  }}
                  filter="url(#glow)"
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