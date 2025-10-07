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
  FiUsers,
  FiRefreshCw,
  FiInfo,
  FiTarget,
  FiCreditCard,
  FiFileText
} from 'react-icons/fi';

interface FinancialData {
  invoiceAnalytics: any;
  metrics: any;
}

export default function FinancialPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'spending' | 'invoices' | 'insights'>('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [invoiceRes, metricsRes] = await Promise.all([
        fetch('/api/sponsor/invoice-analytics'),
        fetch('/api/sponsor/metrics')
      ]);

      if (!invoiceRes.ok || !metricsRes.ok) {
        throw new Error('Failed to fetch financial data');
      }

      const [invoiceAnalytics, metrics] = await Promise.all([
        invoiceRes.json(),
        metricsRes.json()
      ]);

      setData({ invoiceAnalytics, metrics });
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
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <FiDollarSign className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Financial Data</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load financial data'}</p>
          <button
            onClick={fetchAllData}
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

  const invoiceData = data.invoiceAnalytics;
  const metricsData = data.metrics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Tracking</h1>
            <p className="text-gray-600">Monitor spending, invoices, and financial performance</p>
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'overview', label: 'Overview', icon: FiBarChart },
              { key: 'spending', label: 'Spending Analysis', icon: FiTrendingUp },
              { key: 'invoices', label: 'Invoice Management', icon: FiFileText },
              { key: 'insights', label: 'Financial Insights', icon: FiTarget }
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
                  {formatCurrency(invoiceData?.summary?.totalAmount || 0)}
                </div>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(invoiceData?.spending?.growthAnalysis?.monthOverMonth || 0)}
                  <span className={`ml-1 text-sm ${getGrowthColor(invoiceData?.spending?.growthAnalysis?.monthOverMonth || 0)}`}>
                    {invoiceData?.spending?.growthAnalysis?.monthOverMonth || 0}% MoM
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiShoppingCart className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Total Invoices</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {invoiceData?.totalInvoices || 0}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Avg: {formatCurrency(invoiceData?.summary?.averageInvoiceValue || 0)}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="w-8 h-8 text-purple-600" />
                  <span className="text-sm font-medium text-gray-500">Active Suppliers</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {invoiceData?.summary?.activeSuppliers || 0}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {invoiceData?.summary?.totalUniqueProducts || 0} unique products
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiTarget className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-gray-500">Investment Score</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {metricsData?.impactScore || 0}/100
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Performance rating
                </div>
              </div>
            </div>

            {/* Financial Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiPieChart className="w-5 h-5 mr-2" />
                  Spending by Category
                </h3>
                <div className="space-y-3">
                  {invoiceData?.categories?.breakdown?.slice(0, 5).map((category: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{category.category}</div>
                        <div className="text-xs text-gray-500">{category.itemCount} items</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{formatCurrency(category.totalSpent)}</div>
                        <div className="text-xs text-green-600">{category.percentage}%</div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">No category data available</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiCalendar className="w-5 h-5 mr-2" />
                  Monthly Trends
                </h3>
                <div className="space-y-3">
                  {invoiceData?.spending?.monthlyTrends?.slice(-6).map((month: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{month.period}</span>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{formatCurrency(month.amount)}</div>
                        <div className="text-xs text-gray-500">
                          {month.invoiceCount} invoices
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">No trend data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Insights */}
            {invoiceData?.insights?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiInfo className="w-5 h-5 mr-2" />
                  Financial Insights
                </h3>
                <div className="space-y-4">
                  {invoiceData.insights.map((insight: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-medium text-gray-800">{insight.title}</h4>
                      <p className="text-gray-600 text-sm">{insight.description}</p>
                      <p className="text-xs text-blue-600 italic mt-1">{insight.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  {getGrowthIcon(invoiceData?.spending?.growthAnalysis?.monthOverMonth || 0)}
                  <span className={`text-2xl font-bold ${getGrowthColor(invoiceData?.spending?.growthAnalysis?.monthOverMonth || 0)}`}>
                    {invoiceData?.spending?.growthAnalysis?.monthOverMonth || 0}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Trend: {invoiceData?.spending?.growthAnalysis?.trend || 'stable'}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quarter over Quarter</h3>
                <div className="flex items-center space-x-2">
                  {getGrowthIcon(invoiceData?.spending?.growthAnalysis?.quarterOverQuarter || 0)}
                  <span className={`text-2xl font-bold ${getGrowthColor(invoiceData?.spending?.growthAnalysis?.quarterOverQuarter || 0)}`}>
                    {invoiceData?.spending?.growthAnalysis?.quarterOverQuarter || 0}%
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Year over Year</h3>
                <div className="flex items-center space-x-2">
                  {getGrowthIcon(invoiceData?.spending?.growthAnalysis?.yearOverYear || 0)}
                  <span className={`text-2xl font-bold ${getGrowthColor(invoiceData?.spending?.growthAnalysis?.yearOverYear || 0)}`}>
                    {invoiceData?.spending?.growthAnalysis?.yearOverYear || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Spending Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Day of Week</h3>
                <div className="space-y-3">
                  {invoiceData?.spending?.spendingPatterns?.dayOfWeek?.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{day.day}</span>
                      <span className="font-medium">{formatCurrency(day.amount)}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500">No day-of-week data available</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Size Distribution</h3>
                <div className="space-y-3">
                  {invoiceData?.spending?.spendingPatterns?.sizeDistribution?.map((size: any, index: number) => (
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
                  )) || (
                    <p className="text-gray-500">No size distribution data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Spending Detail */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Spending Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Month</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Amount</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Invoices</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Items</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData?.spending?.monthlyTrends?.slice(-12).map((month: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{month.period}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(month.amount)}</td>
                        <td className="py-3 px-4 text-right">{month.invoiceCount}</td>
                        <td className="py-3 px-4 text-right">{month.itemCount}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(month.averageInvoiceValue)}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No monthly data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeView === 'invoices' && (
          <div className="space-y-6">
            {/* Invoice Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Invoices</h3>
                <div className="text-2xl font-bold text-gray-800">{invoiceData?.totalInvoices || 0}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Average Value</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(invoiceData?.summary?.averageInvoiceValue || 0)}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Largest Invoice</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(invoiceData?.summary?.largestInvoice || 0)}</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Items per Invoice</h3>
                <div className="text-2xl font-bold text-gray-800">{invoiceData?.summary?.averageItemsPerInvoice || 0}</div>
              </div>
            </div>

            {/* Top Suppliers */}
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
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData?.suppliers?.analysis?.slice(0, 10).map((supplier: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{supplier.supplierName}</div>
                          <div className="text-xs text-gray-500">{supplier.itemCount} items</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(supplier.totalSpent)}</td>
                        <td className="py-3 px-4 text-right">{supplier.invoiceCount}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(supplier.averageInvoiceValue)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                            {supplier.percentage}%
                          </span>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No supplier data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                    {invoiceData?.products?.topProducts?.slice(0, 15).map((product: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{product.productName}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(product.totalSpent)}</td>
                        <td className="py-3 px-4 text-right">{product.totalQuantity?.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{product.purchaseCount}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(product.averagePrice)}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No product data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeView === 'insights' && (
          <div className="space-y-6">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Efficiency</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {invoiceData?.products?.priceAnalysis?.averagePrice || 0}
                </div>
                <p className="text-gray-600">Average item cost</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier Diversity</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {invoiceData?.summary?.activeSuppliers || 0}
                </div>
                <p className="text-gray-600">Active suppliers</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Frequency</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round((invoiceData?.totalInvoices || 0) / 12)}
                </div>
                <p className="text-gray-600">Invoices per month</p>
              </div>
            </div>

            {/* Financial Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Strategic Recommendations</h3>
              <div className="space-y-4">
                {invoiceData?.insights?.map((insight: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        insight.impact === 'high' ? 'bg-red-500' :
                        insight.impact === 'medium' ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
                        <p className="text-xs text-blue-600 italic">{insight.recommendation}</p>
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
                )) || (
                  <p className="text-gray-500">No insights available</p>
                )}
              </div>
            </div>

            {/* Price Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {formatCurrency(invoiceData?.products?.priceAnalysis?.averagePrice || 0)}
                  </div>
                  <p className="text-gray-600">Average Price</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {formatCurrency(invoiceData?.products?.priceAnalysis?.medianPrice || 0)}
                  </div>
                  <p className="text-gray-600">Median Price</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    {formatCurrency(invoiceData?.products?.priceAnalysis?.priceRange?.min || 0)} - {formatCurrency(invoiceData?.products?.priceAnalysis?.priceRange?.max || 0)}
                  </div>
                  <p className="text-gray-600">Price Range</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}