'use client';

import { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown,
  FiBarChart,
  FiPieChart,
  FiCalendar,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo
} from 'react-icons/fi';

interface InvoiceAnalytics {
  totalInvoices: number;
  summary: {
    totalAmount: number;
    averageInvoiceValue: number;
    largestInvoice: number;
    smallestInvoice: number;
    averageItemsPerInvoice: number;
    totalUniqueProducts: number;
    activeSuppliers: number;
    totalQuantityPurchased: number;
  };
  spending: {
    timeBasedSpending: {
      monthly: Array<{ period: string; amount: number }>;
      quarterly: Array<{ period: string; amount: number }>;
    };
    monthlyTrends: Array<{
      period: string;
      amount: number;
      invoiceCount: number;
      itemCount: number;
      averageInvoiceValue: number;
    }>;
    spendingPatterns: {
      dayOfWeek: Array<{ day: string; amount: number }>;
      sizeDistribution: Array<{
        label: string;
        count: number;
        amount: number;
        averageValue: number;
      }>;
    };
    growthAnalysis: {
      monthOverMonth: number;
      quarterOverQuarter: number;
      yearOverYear: number;
      trend: string;
    };
  };
  suppliers: {
    analysis: Array<{
      supplierId: string;
      supplierName: string;
      totalSpent: number;
      invoiceCount: number;
      itemCount: number;
      averageInvoiceValue: number;
      percentage: number;
    }>;
    performance: Array<{
      supplierId: string;
      supplierName: string;
      totalSpent: number;
      efficiency: string;
      reliability: string;
    }>;
  };
  categories: {
    breakdown: Array<{
      category: string;
      totalSpent: number;
      itemCount: number;
      percentage: number;
      averageItemValue: number;
    }>;
  };
  products: {
    topProducts: Array<{
      productName: string;
      totalSpent: number;
      totalQuantity: number;
      purchaseCount: number;
      averagePrice: number;
    }>;
    categoryDistribution: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    priceAnalysis: {
      averagePrice: number;
      medianPrice: number;
      priceRange: { min: number; max: number };
    };
  };
  insights: Array<{
    type: string;
    title: string;
    description: string;
    impact: string;
    recommendation: string;
  }>;
}

export default function InvoiceAnalyticsPage() {
  const [analytics, setAnalytics] = useState<InvoiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'spending' | 'suppliers' | 'products'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sponsor/invoice-analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load invoice analytics'}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <FiTrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <FiTrendingDown className="w-4 h-4 text-red-500" />;
    return <FiBarChart className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return <FiAlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'growth': return <FiTrendingUp className="w-5 h-5 text-green-500" />;
      case 'opportunity': return <FiCheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <FiInfo className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-orange-50 border-orange-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Invoice Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor spending patterns, supplier performance, and financial insights</p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'overview', label: 'Overview', icon: FiBarChart },
              { key: 'spending', label: 'Spending Trends', icon: FiTrendingUp },
              { key: 'suppliers', label: 'Suppliers', icon: FiUsers },
              { key: 'products', label: 'Products', icon: FiPackage }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiDollarSign className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-medium text-gray-500">Total Spent</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(analytics.summary.totalAmount)}
                </div>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(analytics.spending.growthAnalysis.monthOverMonth)}
                  <span className={`ml-1 text-sm ${getGrowthColor(analytics.spending.growthAnalysis.monthOverMonth)}`}>
                    {analytics.spending.growthAnalysis.monthOverMonth}% MoM
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiShoppingCart className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Total Invoices</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {analytics.totalInvoices.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Avg: {formatCurrency(analytics.summary.averageInvoiceValue)}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="w-8 h-8 text-purple-600" />
                  <span className="text-sm font-medium text-gray-500">Active Suppliers</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {analytics.summary.activeSuppliers}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {analytics.summary.totalUniqueProducts} unique products
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiPackage className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-gray-500">Items Purchased</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {analytics.summary.totalQuantityPurchased.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Avg: {analytics.summary.averageItemsPerInvoice} per invoice
                </div>
              </div>
            </div>

            {/* Insights */}
            {analytics.insights.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiInfo className="w-5 h-5 mr-2" />
                  Financial Insights
                </h3>
                <div className="space-y-4">
                  {analytics.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getInsightColor(insight.impact)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
                          <p className="text-xs text-gray-500 italic">{insight.recommendation}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                          insight.impact === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {insight.impact} impact
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Trends */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Spending Trends</h3>
              <div className="space-y-3">
                {analytics.spending.monthlyTrends.slice(-6).map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FiCalendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">{month.period}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{formatCurrency(month.amount)}</div>
                      <div className="text-xs text-gray-500">
                        {month.invoiceCount} invoices, {month.itemCount} items
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Spending Tab */}
        {activeView === 'spending' && (
          <div className="space-y-6">
            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Month over Month</h3>
                <div className="flex items-center space-x-2">
                  {getGrowthIcon(analytics.spending.growthAnalysis.monthOverMonth)}
                  <span className={`text-2xl font-bold ${getGrowthColor(analytics.spending.growthAnalysis.monthOverMonth)}`}>
                    {analytics.spending.growthAnalysis.monthOverMonth}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Trend: {analytics.spending.growthAnalysis.trend}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quarter over Quarter</h3>
                <div className="flex items-center space-x-2">
                  {getGrowthIcon(analytics.spending.growthAnalysis.quarterOverQuarter)}
                  <span className={`text-2xl font-bold ${getGrowthColor(analytics.spending.growthAnalysis.quarterOverQuarter)}`}>
                    {analytics.spending.growthAnalysis.quarterOverQuarter}%
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Year over Year</h3>
                <div className="flex items-center space-x-2">
                  {getGrowthIcon(analytics.spending.growthAnalysis.yearOverYear)}
                  <span className={`text-2xl font-bold ${getGrowthColor(analytics.spending.growthAnalysis.yearOverYear)}`}>
                    {analytics.spending.growthAnalysis.yearOverYear}%
                  </span>
                </div>
              </div>
            </div>

            {/* Spending Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Day of Week</h3>
                <div className="space-y-3">
                  {analytics.spending.spendingPatterns.dayOfWeek.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{day.day}</span>
                      <span className="font-medium">{formatCurrency(day.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Size Distribution</h3>
                <div className="space-y-3">
                  {analytics.spending.spendingPatterns.sizeDistribution.map((size, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-700">{size.label}</div>
                        <div className="text-xs text-gray-500">{size.count} invoices</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(size.amount)}</div>
                        <div className="text-xs text-gray-500">
                          Avg: {formatCurrency(size.averageValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeView === 'suppliers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Supplier</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Spent</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Invoices</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Invoice</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Share</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.suppliers.analysis.slice(0, 10).map((supplier, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{supplier.supplierName}</div>
                          <div className="text-xs text-gray-500">{supplier.itemCount} items</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(supplier.totalSpent)}
                        </td>
                        <td className="py-3 px-4 text-right">{supplier.invoiceCount}</td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(supplier.averageInvoiceValue)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                            {supplier.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-sm ${
                            analytics.suppliers.performance.find(p => p.supplierId === supplier.supplierId)?.efficiency === 'High' 
                              ? 'bg-green-100 text-green-700'
                              : analytics.suppliers.performance.find(p => p.supplierId === supplier.supplierId)?.efficiency === 'Medium'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {analytics.suppliers.performance.find(p => p.supplierId === supplier.supplierId)?.efficiency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeView === 'products' && (
          <div className="space-y-6">
            {/* Price Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Average Price</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(analytics.products.priceAnalysis.averagePrice)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Median Price</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(analytics.products.priceAnalysis.medianPrice)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Price Range</h3>
                <div className="text-lg font-bold text-gray-800">
                  {formatCurrency(analytics.products.priceAnalysis.priceRange.min)} - {formatCurrency(analytics.products.priceAnalysis.priceRange.max)}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products by Spending</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Spent</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Purchases</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.products.topProducts.slice(0, 15).map((product, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{product.productName}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(product.totalSpent)}
                        </td>
                        <td className="py-3 px-4 text-right">{product.totalQuantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{product.purchaseCount}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(product.averagePrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {analytics.categories.breakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{category.category}</div>
                      <div className="text-xs text-gray-500">
                        {category.itemCount} items • Avg: {formatCurrency(category.averageItemValue)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{formatCurrency(category.totalSpent)}</div>
                      <div className="text-xs text-green-600">{category.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}