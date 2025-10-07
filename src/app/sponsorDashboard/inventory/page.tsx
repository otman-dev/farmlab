'use client';

import { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiHeart,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiShield,
  FiZap,
  FiInfo,
  FiTarget
} from 'react-icons/fi';

interface InventoryData {
  stockAvailability: any;
  inventoryMonitor: any;
}

export default function InventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'medicine' | 'feed' | 'suppliers'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [stockRes, inventoryRes] = await Promise.all([
        fetch('/api/sponsor/stock-availability'),
        fetch('/api/sponsor/inventory-monitor')
      ]);

      if (!stockRes.ok || !inventoryRes.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const [stockAvailability, inventoryMonitor] = await Promise.all([
        stockRes.json(),
        inventoryRes.json()
      ]);

      setData({ stockAvailability, inventoryMonitor });
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Inventory</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load inventory data'}</p>
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

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <FiCheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <FiShield className="w-5 h-5 text-blue-600" />;
    if (score >= 40) return <FiClock className="w-5 h-5 text-yellow-600" />;
    return <FiAlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const stockData = data.stockAvailability;
  const inventoryData = data.inventoryMonitor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory & Stock Management</h1>
            <p className="text-gray-600">Monitor medicine, feed, suppliers, and stock levels in real-time</p>
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
              { key: 'overview', label: 'Overview', icon: FiTarget },
              { key: 'medicine', label: 'Medicine Stock', icon: FiHeart },
              { key: 'feed', label: 'Feed Stock', icon: FiActivity },
              { key: 'suppliers', label: 'Suppliers', icon: FiUsers }
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
                  <FiPackage className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-medium text-gray-500">Total Inventory Value</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(inventoryData?.summary?.inventoryValue || 0)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {inventoryData?.summary?.totalMedicineItems + inventoryData?.summary?.totalFeedItems || 0} total items
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiHeart className="w-8 h-8 text-red-600" />
                  <span className="text-sm font-medium text-gray-500">Medicine Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stockData?.summary?.totalMedicineValue || 0)}
                </div>
                <div className="flex items-center mt-2">
                  {getHealthIcon(stockData?.availability?.medicine?.score || 0)}
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(stockData?.availability?.medicine?.status || 'unknown')}`}>
                    {stockData?.availability?.medicine?.status || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiActivity className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-gray-500">Feed Stock</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stockData?.summary?.totalFeedValue || 0)}
                </div>
                <div className="flex items-center mt-2">
                  {getHealthIcon(stockData?.availability?.feed?.score || 0)}
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(stockData?.availability?.feed?.status || 'unknown')}`}>
                    {stockData?.availability?.feed?.status || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Active Suppliers</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {inventoryData?.summary?.activeSuppliers || 0}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {inventoryData?.summary?.totalSuppliers || 0} total suppliers
                </div>
              </div>
            </div>

            {/* Health Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiHeart className="w-5 h-5 mr-2 text-red-600" />
                  Medicine Categories Health
                </h3>
                <div className="space-y-3">
                  {stockData?.availability?.medicine?.categories?.map((category: any, index: number) => (
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
                  )) || (
                    <p className="text-gray-500">No medicine categories available</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiActivity className="w-5 h-5 mr-2 text-orange-600" />
                  Feed Categories Health
                </h3>
                <div className="space-y-3">
                  {stockData?.availability?.feed?.categories?.map((category: any, index: number) => (
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
                  )) || (
                    <p className="text-gray-500">No feed categories available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            {(stockData?.medicine?.alerts?.length > 0 || stockData?.feed?.alerts?.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiAlertTriangle className="w-5 h-5 mr-2" />
                  Active Alerts
                </h3>
                <div className="space-y-3">
                  {[...(stockData?.medicine?.alerts || []), ...(stockData?.feed?.alerts || [])].map((alert: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <FiZap className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{alert.title}</h4>
                        <p className="text-gray-600 text-sm">{alert.message}</p>
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

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">
                    {(stockData?.medicine?.metrics?.lowStockCount || 0) + (stockData?.feed?.metrics?.lowStockCount || 0)}
                  </div>
                  <p className="text-gray-600 text-sm">Low Stock Items</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {(stockData?.medicine?.metrics?.expiringSoonCount || 0) + (stockData?.feed?.metrics?.expiringSoonCount || 0)}
                  </div>
                  <p className="text-gray-600 text-sm">Expiring Soon</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {stockData?.availability?.overall?.score || 0}/100
                  </div>
                  <p className="text-gray-600 text-sm">Overall Health</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {inventoryData?.suppliers?.analysis?.length || 0}
                  </div>
                  <p className="text-gray-600 text-sm">Suppliers Used</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Tab */}
        {activeView === 'medicine' && (
          <div className="space-y-6">
            {/* Medicine Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(stockData?.medicine?.metrics?.totalValue || 0)}</div>
                <div className="text-sm text-gray-600 mt-1">{stockData?.medicine?.metrics?.totalItems || 0} items</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Health Score</h3>
                <div className="text-2xl font-bold text-gray-800">{stockData?.medicine?.metrics?.averageHealthScore || 0}/100</div>
                <div className="text-sm text-gray-600 mt-1">Average category health</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Low Stock</h3>
                <div className="text-2xl font-bold text-orange-600">{stockData?.medicine?.metrics?.lowStockCount || 0}</div>
                <div className="text-sm text-gray-600 mt-1">{stockData?.medicine?.metrics?.criticalStockCount || 0} critical</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Expiry Issues</h3>
                <div className="text-2xl font-bold text-red-600">{(stockData?.medicine?.metrics?.expiredCount || 0) + (stockData?.medicine?.metrics?.expiringSoonCount || 0)}</div>
                <div className="text-sm text-gray-600 mt-1">{stockData?.medicine?.metrics?.expiredCount || 0} expired</div>
              </div>
            </div>

            {/* Medicine Categories */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medicine Categories</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {stockData?.medicine?.categories?.map((category: any, index: number) => (
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
                )) || (
                  <p className="text-gray-500 col-span-2">No medicine categories available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feed Tab */}
        {activeView === 'feed' && (
          <div className="space-y-6">
            {/* Feed Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Value</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(stockData?.feed?.metrics?.totalValue || 0)}</div>
                <div className="text-sm text-gray-600 mt-1">{stockData?.feed?.metrics?.totalItems || 0} items</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Health Score</h3>
                <div className="text-2xl font-bold text-gray-800">{stockData?.feed?.metrics?.averageHealthScore || 0}/100</div>
                <div className="text-sm text-gray-600 mt-1">Average category health</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Low Stock</h3>
                <div className="text-2xl font-bold text-orange-600">{stockData?.feed?.metrics?.lowStockCount || 0}</div>
                <div className="text-sm text-gray-600 mt-1">{stockData?.feed?.metrics?.criticalStockCount || 0} critical</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Expiry Issues</h3>
                <div className="text-2xl font-bold text-red-600">{(stockData?.feed?.metrics?.expiredCount || 0) + (stockData?.feed?.metrics?.expiringSoonCount || 0)}</div>
                <div className="text-sm text-gray-600 mt-1">{stockData?.feed?.metrics?.expiredCount || 0} expired</div>
              </div>
            </div>

            {/* Feed Types */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Feed Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stockData?.feed?.feedTypes?.map((feedType: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">{feedType.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Items:</span>
                        <span className="font-medium">{feedType.totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity:</span>
                        <span className="font-medium">{feedType.totalQuantity?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Value:</span>
                        <span className="font-medium">{formatCurrency(feedType.totalValue)}</span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 col-span-3">No feed types available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeView === 'suppliers' && (
          <div className="space-y-6">
            {/* Supplier Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Concentration</h3>
                <div className="text-2xl font-bold text-gray-800">{inventoryData?.suppliers?.metrics?.concentration || 0}%</div>
                <p className="text-sm text-gray-600 mt-2">Top supplier share</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Avg Order Value</h3>
                <div className="text-2xl font-bold text-gray-800">{formatCurrency(inventoryData?.suppliers?.metrics?.averageOrderValue || 0)}</div>
                <p className="text-sm text-gray-600 mt-2">Per order</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Diversity Score</h3>
                <div className="text-2xl font-bold text-gray-800">{inventoryData?.suppliers?.metrics?.diversityScore || 0}/100</div>
                <p className="text-sm text-gray-600 mt-2">Supplier diversity</p>
              </div>
            </div>

            {/* Top Suppliers */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Suppliers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Supplier</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Total Spent</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Orders</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Value</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData?.suppliers?.analysis?.slice(0, 10).map((supplier: any, index: number) => (
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
          </div>
        )}
      </div>
    </div>
  );
}