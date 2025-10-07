'use client';

import { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiUsers, 
  FiShoppingCart,
  FiAlertTriangle,
  FiCheckCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiDollarSign,
  FiBarChart,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiDownload,
  FiHeart,
  FiActivity,
  FiInfo,
  FiCalendar
} from 'react-icons/fi';

interface InventoryData {
  summary: {
    totalSuppliers: number;
    activeSuppliers: number;
    totalProducts: number;
    medicineItems: number;
    foodItems: number;
    medicineUnits: number;
    totalInvoices: number;
    inventoryValue: number;
  };
  suppliers: {
    all: any[];
    active: any[];
    top: any[];
    metrics: {
      concentration: number;
      averageOrderValue: number;
      diversityScore: number;
    };
  };
  products: {
    all: any[];
    byCategory: any[];
    top: {
      bySpending: any[];
      byQuantity: any[];
      byFrequency: any[];
    };
    metrics: {
      totalProducts: number;
      activeProducts: number;
      averagePrice: number;
    };
  };
  stock: {
    medical: {
      items: any[];
      totalValue: number;
      totalQuantity: number;
      lowStockItems: number;
      expiringItems: number;
    };
    food: {
      items: any[];
      totalValue: number;
      totalQuantity: number;
      lowStockItems: number;
      expiringItems: number;
    };
    medicineUnits: {
      items: any[];
      totalUnits: number;
      categories: string[];
    };
    combined: {
      totalValue: number;
      totalItems: number;
      lowStockAlerts: number;
      expiryAlerts: number;
    };
  };
  health: {
    overallScore: number;
    stockLevels: {
      good: number;
      low: number;
      critical: number;
    };
    expiry: {
      fresh: number;
      expiringSoon: number;
      expired: number;
    };
    recommendations: string[];
  };
  activity: any[];
  alerts: any[];
  timestamps: {
    lastUpdated: string;
    lastInvoice: string | null;
    lastStockUpdate: string | null;
  };
}

export default function InventoryMonitorPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'suppliers' | 'products' | 'stock'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sponsor/inventory-monitor');
      
      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
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
          <p className="text-gray-600">Loading inventory data...</p>
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
          <p className="text-gray-600 mb-4">{error || 'Failed to load inventory data'}</p>
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
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <FiAlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'error': return <FiAlertTriangle className="w-5 h-5 text-red-500" />;
      case 'info': return <FiInfo className="w-5 h-5 text-blue-500" />;
      default: return <FiInfo className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FiShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'stock': return <FiPackage className="w-4 h-4 text-green-500" />;
      case 'medical': return <FiHeart className="w-4 h-4 text-red-500" />;
      case 'food': return <FiActivity className="w-4 h-4 text-orange-500" />;
      default: return <FiInfo className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredSuppliers = data.suppliers.all.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = data.products.all.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredStock = [...data.stock.medical.items, ...data.stock.food.items].filter(item => {
    const itemName = item.productName || item.name || '';
    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory Monitor</h1>
            <p className="text-gray-600">Track suppliers, products, invoices, and stock levels</p>
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
              Last updated: {formatDate(data.timestamps.lastUpdated)}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'overview', label: 'Overview', icon: FiBarChart },
              { key: 'suppliers', label: 'Suppliers', icon: FiUsers },
              { key: 'products', label: 'Products', icon: FiPackage },
              { key: 'stock', label: 'Stock Levels', icon: FiActivity }
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
                  <span className="text-sm font-medium text-gray-500">Inventory Value</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(data.summary.inventoryValue)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {data.stock.combined.totalItems} total items
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Suppliers</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {data.summary.activeSuppliers} / {data.summary.totalSuppliers}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Active suppliers
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiPackage className="w-8 h-8 text-purple-600" />
                  <span className="text-sm font-medium text-gray-500">Products</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {data.summary.totalProducts}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {data.products.metrics.activeProducts} recently ordered
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiActivity className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-gray-500">Health Score</span>
                </div>
                <div className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block ${getHealthColor(data.health.overallScore)}`}>
                  {data.health.overallScore}/100
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Inventory health
                </div>
              </div>
            </div>

            {/* Alerts */}
            {data.alerts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiAlertTriangle className="w-5 h-5 mr-2" />
                  Active Alerts ({data.alerts.length})
                </h3>
                <div className="space-y-3">
                  {data.alerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{alert.title}</h4>
                        <p className="text-gray-600 text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-500 italic mt-1">{alert.action}</p>
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

            {/* Health Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Levels</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 flex items-center">
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      Good Stock
                    </span>
                    <span className="font-medium">{data.health.stockLevels.good} items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 flex items-center">
                      <FiClock className="w-4 h-4 mr-2" />
                      Low Stock
                    </span>
                    <span className="font-medium">{data.health.stockLevels.low} items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 flex items-center">
                      <FiAlertTriangle className="w-4 h-4 mr-2" />
                      Critical Stock
                    </span>
                    <span className="font-medium">{data.health.stockLevels.critical} items</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Expiry Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 flex items-center">
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      Fresh Items
                    </span>
                    <span className="font-medium">{data.health.expiry.fresh} items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 flex items-center">
                      <FiClock className="w-4 h-4 mr-2" />
                      Expiring Soon
                    </span>
                    <span className="font-medium">{data.health.expiry.expiringSoon} items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 flex items-center">
                      <FiAlertTriangle className="w-4 h-4 mr-2" />
                      Expired
                    </span>
                    <span className="font-medium">{data.health.expiry.expired} items</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {data.activity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.icon)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(activity.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeView === 'suppliers' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Supplier Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Concentration</h3>
                <div className="text-2xl font-bold text-gray-800">{data.suppliers.metrics.concentration}%</div>
                <p className="text-sm text-gray-600 mt-2">Top supplier share</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Avg Order Value</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(data.suppliers.metrics.averageOrderValue)}</div>
                <p className="text-sm text-gray-600 mt-2">Per order</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Diversity Score</h3>
                <div className="text-2xl font-bold text-gray-800">{data.suppliers.metrics.diversityScore}/100</div>
                <p className="text-sm text-gray-600 mt-2">Supplier diversity</p>
              </div>
            </div>

            {/* Suppliers List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplier Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Supplier</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Spent</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Orders</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Products</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Last Order</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.slice(0, 20).map((supplier, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{supplier.name}</div>
                          <div className="text-xs text-gray-500">{supplier.categoryCount} categories</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(supplier.totalSpent)}
                        </td>
                        <td className="py-3 px-4 text-right">{supplier.invoiceCount}</td>
                        <td className="py-3 px-4 text-right">{supplier.productCount}</td>
                        <td className="py-3 px-4 text-right text-sm">
                          {supplier.daysSinceLastOrder !== null 
                            ? `${supplier.daysSinceLastOrder} days ago`
                            : 'Never'
                          }
                        </td>
                        <td className="py-3 px-4 text-right">{formatCurrency(supplier.averageOrderValue)}</td>
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
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {data.products.byCategory.map((category: any, index) => (
                    <option key={index} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Products</h3>
                <div className="text-2xl font-bold text-gray-800">{data.products.metrics.totalProducts}</div>
                <p className="text-sm text-gray-600 mt-2">{data.products.metrics.activeProducts} recently active</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Average Price</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(data.products.metrics.averagePrice)}</div>
                <p className="text-sm text-gray-600 mt-2">Per unit</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
                <div className="text-2xl font-bold text-gray-800">{data.products.byCategory.length}</div>
                <p className="text-sm text-gray-600 mt-2">Product categories</p>
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
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Orders</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Suppliers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 20).map((product, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-800">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.category}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(product.totalSpent)}
                        </td>
                        <td className="py-3 px-4 text-right">{product.totalQuantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{product.orderCount}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(product.avgPrice)}</td>
                        <td className="py-3 px-4 text-right">{product.supplierCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stock Tab */}
        {activeView === 'stock' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search stock items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="medical">Medical</option>
                  <option value="food">Food</option>
                </select>
              </div>
            </div>

            {/* Stock Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiHeart className="w-8 h-8 text-red-600" />
                  <span className="text-sm font-medium text-gray-500">Medical Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(data.stock.medical.totalValue)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {data.stock.medical.items.length} items
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiActivity className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-gray-500">Food Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(data.stock.food.totalValue)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {data.stock.food.items.length} items
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiAlertTriangle className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-gray-500">Low Stock</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {data.stock.combined.lowStockAlerts}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Items need reorder
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiClock className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Expiring Soon</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.stock.combined.expiryAlerts}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Items expire &lt; 30 days
                </div>
              </div>
            </div>

            {/* Stock Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Value</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.slice(0, 50).map((item, index) => {
                      const itemName = item.productName || item.name || 'Unknown Item';
                      const isLowStock = item.lowStock;
                      const daysUntilExpiry = item.daysUntilExpiry;
                      
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-800">{itemName}</div>
                            <div className="text-xs text-gray-500">{item.category || 'No category'}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.type === 'medical' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{(item.quantity || 0).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice || 0)}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.value || 0)}</td>
                          <td className="py-3 px-4 text-center">
                            {isLowStock ? (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Good
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            {daysUntilExpiry !== null ? (
                              daysUntilExpiry < 0 ? (
                                <span className="text-red-600">Expired</span>
                              ) : daysUntilExpiry <= 30 ? (
                                <span className="text-orange-600">{daysUntilExpiry} days</span>
                              ) : (
                                <span className="text-green-600">{daysUntilExpiry} days</span>
                              )
                            ) : (
                              <span className="text-gray-400">No expiry</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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