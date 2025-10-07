'use client';

import { useState, useEffect } from 'react';
import { 
  FiHeart, 
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiInfo,
  FiShield,
  FiZap,
  FiTarget,
  FiBarChart,
  FiPieChart
} from 'react-icons/fi';

interface StockItem {
  _id: string;
  productName?: string;
  name?: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reorderLevel: number;
  daysUntilExpiry: number | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isLowStock: boolean;
  isCriticalStock: boolean;
  availabilityScore: number;
  status: string;
  expiryDate?: string;
  type?: string;
  feedType?: string;
}

interface CategoryAnalysis {
  name: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  expiringSoonItems: number;
  healthScore: number;
  items: StockItem[];
}

interface StockData {
  medicine: {
    items: StockItem[];
    categories: CategoryAnalysis[];
    medicineUnits: {
      byCategory: Array<{ name: string; count: number; units: any[] }>;
      total: number;
    };
    metrics: {
      totalItems: number;
      totalValue: number;
      totalQuantity: number;
      lowStockCount: number;
      criticalStockCount: number;
      expiredCount: number;
      expiringSoonCount: number;
      availableCategories: number;
      averageHealthScore: number;
    };
    alerts: any[];
  };
  feed: {
    items: StockItem[];
    categories: CategoryAnalysis[];
    feedTypes: Array<{ name: string; totalItems: number; totalQuantity: number; totalValue: number }>;
    metrics: {
      totalItems: number;
      totalValue: number;
      totalQuantity: number;
      lowStockCount: number;
      criticalStockCount: number;
      expiredCount: number;
      expiringSoonCount: number;
      availableCategories: number;
      averageHealthScore: number;
    };
    alerts: any[];
  };
  overall: any[];
  availability: {
    medicine: {
      score: number;
      status: string;
      categories: Array<{ name: string; score: number; status: string }>;
    };
    feed: {
      score: number;
      status: string;
      categories: Array<{ name: string; score: number; status: string }>;
    };
    overall: {
      score: number;
      status: string;
    };
  };
  summary: {
    totalMedicineItems: number;
    totalFeedItems: number;
    totalMedicineUnits: number;
    totalMedicineValue: number;
    totalFeedValue: number;
    combinedValue: number;
  };
  lastUpdated: string;
}

export default function StockAvailabilityPage() {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'medicine' | 'feed'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sponsor/stock-availability');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock availability data');
      }
      
      const result = await response.json();
      setData(result);
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
          <p className="text-gray-600">Loading stock availability data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load stock availability data'}</p>
          <button
            onClick={fetchData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring-soon': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <FiCheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <FiShield className="w-5 h-5 text-blue-600" />;
    if (score >= 40) return <FiClock className="w-5 h-5 text-yellow-600" />;
    return <FiAlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <FiZap className="w-5 h-5 text-red-600" />;
      case 'danger': return <FiAlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning': return <FiClock className="w-5 h-5 text-orange-600" />;
      default: return <FiInfo className="w-5 h-5 text-blue-600" />;
    }
  };

  const allCategories = [
    ...data.medicine.categories.map(cat => cat.name),
    ...data.feed.categories.map(cat => cat.name)
  ];
  const uniqueCategories = Array.from(new Set(allCategories));

  const filteredMedicineItems = data.medicine.items.filter(item => {
    const itemName = item.productName || item.name || '';
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFeedItems = data.feed.items.filter(item => {
    const itemName = item.productName || item.name || '';
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Availability Monitor</h1>
            <p className="text-gray-600">Real-time tracking of animal medicine and feed inventory</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              disabled={loading}
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'overview', label: 'Overview', icon: FiBarChart },
              { key: 'medicine', label: 'Animal Medicine', icon: FiHeart },
              { key: 'feed', label: 'Animal Feed', icon: FiActivity }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === key
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiHeart className="w-8 h-8 text-red-600" />
                  <span className="text-sm font-medium text-gray-500">Medicine Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(data.summary.totalMedicineValue)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {data.summary.totalMedicineItems} items • {data.medicine.categories.length} categories
                </div>
                <div className="flex items-center mt-2">
                  {getHealthIcon(data.availability.medicine.score)}
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(data.availability.medicine.status)}`}>
                    {data.availability.medicine.status}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiActivity className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-gray-500">Feed Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(data.summary.totalFeedValue)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {data.summary.totalFeedItems} items • {data.feed.categories.length} categories
                </div>
                <div className="flex items-center mt-2">
                  {getHealthIcon(data.availability.feed.score)}
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(data.availability.feed.status)}`}>
                    {data.availability.feed.status}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiTarget className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Overall Health</span>
                </div>
                <div className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block ${getStatusColor(data.availability.overall.status)}`}>
                  {data.availability.overall.score}/100
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Combined availability score
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiAlertTriangle className="w-8 h-8 text-red-600" />
                  <span className="text-sm font-medium text-gray-500">Active Alerts</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {data.medicine.alerts.length + data.feed.alerts.length}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {data.medicine.metrics.criticalStockCount + data.feed.metrics.criticalStockCount} critical items
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiHeart className="w-5 h-5 mr-2 text-red-600" />
                  Medicine Categories Health
                </h3>
                <div className="space-y-3">
                  {data.availability.medicine.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getHealthIcon(category.score)}
                        <span className="font-medium text-gray-700">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">{category.score}/100</div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(category.status)}`}>
                          {category.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiActivity className="w-5 h-5 mr-2 text-orange-600" />
                  Feed Categories Health
                </h3>
                <div className="space-y-3">
                  {data.availability.feed.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getHealthIcon(category.score)}
                        <span className="font-medium text-gray-700">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">{category.score}/100</div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(category.status)}`}>
                          {category.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {(data.medicine.alerts.length > 0 || data.feed.alerts.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiAlertTriangle className="w-5 h-5 mr-2" />
                  Active Alerts
                </h3>
                <div className="space-y-3">
                  {[...data.medicine.alerts, ...data.feed.alerts].map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{alert.title}</h4>
                        <p className="text-gray-600 text-sm">{alert.message}</p>
                        {alert.items && alert.items.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Items affected:</p>
                            <p className="text-xs text-gray-700">{alert.items.slice(0, 3).join(', ')}{alert.items.length > 3 ? ` and ${alert.items.length - 3} more...` : ''}</p>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                        alert.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Insights */}
            {data.overall.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Strategic Insights</h3>
                <div className="space-y-4">
                  {data.overall.map((insight, index) => (
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

        {/* Medicine Tab */}
        {activeTab === 'medicine' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search medicine items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {data.medicine.categories.map((category, index) => (
                    <option key={index} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Medicine Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(data.medicine.metrics.totalValue)}</div>
                <div className="text-sm text-gray-600 mt-1">{data.medicine.metrics.totalItems} items</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Health Score</h3>
                <div className="text-2xl font-bold text-gray-800">{data.medicine.metrics.averageHealthScore}/100</div>
                <div className="text-sm text-gray-600 mt-1">Average category health</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Low Stock</h3>
                <div className="text-2xl font-bold text-orange-600">{data.medicine.metrics.lowStockCount}</div>
                <div className="text-sm text-gray-600 mt-1">{data.medicine.metrics.criticalStockCount} critical</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Expiry Issues</h3>
                <div className="text-2xl font-bold text-red-600">{data.medicine.metrics.expiredCount + data.medicine.metrics.expiringSoonCount}</div>
                <div className="text-sm text-gray-600 mt-1">{data.medicine.metrics.expiredCount} expired</div>
              </div>
            </div>

            {/* Medicine Categories */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medicine Categories</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.medicine.categories.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">{category.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        category.healthScore >= 80 ? 'bg-green-100 text-green-700' :
                        category.healthScore >= 60 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {category.healthScore}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Items:</span>
                        <span className="ml-2 font-medium">{category.totalItems}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <span className="ml-2 font-medium">{formatCurrency(category.totalValue)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Low Stock:</span>
                        <span className="ml-2 font-medium text-orange-600">{category.lowStockItems}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expired:</span>
                        <span className="ml-2 font-medium text-red-600">{category.expiredItems}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medicine Items Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medicine Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Value</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Expiry</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicineItems.slice(0, 50).map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{item.productName || item.name}</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-medium">{item.quantity.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Min: {item.reorderLevel}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.totalValue)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStockStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm">
                          {item.daysUntilExpiry !== null ? (
                            item.daysUntilExpiry < 0 ? (
                              <span className="text-red-600 font-medium">Expired</span>
                            ) : item.daysUntilExpiry <= 30 ? (
                              <span className="text-orange-600">{item.daysUntilExpiry} days</span>
                            ) : (
                              <span className="text-green-600">{item.daysUntilExpiry} days</span>
                            )
                          ) : (
                            <span className="text-gray-400">No expiry</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={`text-sm font-medium ${
                            item.availabilityScore >= 80 ? 'text-green-600' :
                            item.availabilityScore >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {item.availabilityScore}/100
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search feed items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {data.feed.categories.map((category, index) => (
                    <option key={index} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Feed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(data.feed.metrics.totalValue)}</div>
                <div className="text-sm text-gray-600 mt-1">{data.feed.metrics.totalItems} items</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Health Score</h3>
                <div className="text-2xl font-bold text-gray-800">{data.feed.metrics.averageHealthScore}/100</div>
                <div className="text-sm text-gray-600 mt-1">Average category health</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Low Stock</h3>
                <div className="text-2xl font-bold text-orange-600">{data.feed.metrics.lowStockCount}</div>
                <div className="text-sm text-gray-600 mt-1">{data.feed.metrics.criticalStockCount} critical</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Expiry Issues</h3>
                <div className="text-2xl font-bold text-red-600">{data.feed.metrics.expiredCount + data.feed.metrics.expiringSoonCount}</div>
                <div className="text-sm text-gray-600 mt-1">{data.feed.metrics.expiredCount} expired</div>
              </div>
            </div>

            {/* Feed Types */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Feed Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.feed.feedTypes.map((feedType, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">{feedType.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Items:</span>
                        <span className="font-medium">{feedType.totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-medium">{feedType.totalQuantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Value:</span>
                        <span className="font-medium">{formatCurrency(feedType.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed Categories */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Feed Categories</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {data.feed.categories.map((category, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">{category.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        category.healthScore >= 80 ? 'bg-green-100 text-green-700' :
                        category.healthScore >= 60 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {category.healthScore}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Items:</span>
                        <span className="ml-2 font-medium">{category.totalItems}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Value:</span>
                        <span className="ml-2 font-medium">{formatCurrency(category.totalValue)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Low Stock:</span>
                        <span className="ml-2 font-medium text-orange-600">{category.lowStockItems}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expired:</span>
                        <span className="ml-2 font-medium text-red-600">{category.expiredItems}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feed Items Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Feed Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Value</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Expiry</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeedItems.slice(0, 50).map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{item.productName || item.name}</div>
                          <div className="text-xs text-gray-500">{item.category} • {item.feedType || item.type}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-medium">{item.quantity.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Min: {item.reorderLevel}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.totalValue)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStockStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm">
                          {item.daysUntilExpiry !== null ? (
                            item.daysUntilExpiry < 0 ? (
                              <span className="text-red-600 font-medium">Expired</span>
                            ) : item.daysUntilExpiry <= 60 ? (
                              <span className="text-orange-600">{item.daysUntilExpiry} days</span>
                            ) : (
                              <span className="text-green-600">{item.daysUntilExpiry} days</span>
                            )
                          ) : (
                            <span className="text-gray-400">No expiry</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className={`text-sm font-medium ${
                            item.availabilityScore >= 80 ? 'text-green-600' :
                            item.availabilityScore >= 60 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {item.availabilityScore}/100
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}