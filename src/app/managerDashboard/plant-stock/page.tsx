"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiSun, FiDroplet, FiCalendar } from "react-icons/fi";

interface Product {
  _id: string;
  name: string;
  description?: string;
  unit?: string;
  amountPerUnit?: number;
  category: string;
  seedType?: string;
  plantingInstructions?: string;
  harvestTime?: string;
  growthConditions?: string;
}

interface PlantStock {
  _id: string;
  productId: string;
  productName: string;
  quantity: number;
  units?: PlantStockUnit[];
  createdAt: string;
}

interface PlantStockUnit {
  plantedAt?: string;
  harvestedAt?: string;
  location?: string;
  status?: 'planted' | 'growing' | 'harvested' | 'failed';
}

export default function PlantStockPage() {
  const [plantStocks, setPlantStocks] = useState<PlantStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch plant stock data
      const stockResponse = await fetch("/api/plant-stock");
      if (!stockResponse.ok) throw new Error("Failed to fetch plant stock");
      const stockData = await stockResponse.json();
      setPlantStocks(stockData || []);

      // Fetch plant products
      const productsResponse = await fetch("/api/products?category=plant_seeds,plant_seedlings,plant_nutrition,plant_medicine");
      if (!productsResponse.ok) throw new Error("Failed to fetch products");
      const productsData = await productsResponse.json();
      setProducts(productsData || []);

    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!selectedProduct || quantityToAdd <= 0) {
      setError("Please select a product and enter a valid quantity");
      return;
    }

    try {
      const response = await fetch("/api/plant-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: quantityToAdd,
          location: location.trim() || undefined
        }),
      });

      if (!response.ok) throw new Error("Failed to add plant stock");
      
      await fetchData();
      setShowAddModal(false);
      setSelectedProduct("");
      setQuantityToAdd(1);
      setLocation("");
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to add plant stock");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return 'bg-blue-100 text-blue-800';
      case 'growing': return 'bg-green-100 text-green-800';
      case 'harvested': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plant_seeds': return <FiGrid className="text-brown-600" />;
      case 'plant_seedlings': return <FiSun className="text-green-600" />;
      case 'plant_nutrition': return <FiDroplet className="text-blue-600" />;
      case 'plant_medicine': return <FiCalendar className="text-purple-600" />;
      default: return <FiGrid className="text-gray-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'plant_seeds': return 'Seeds';
      case 'plant_seedlings': return 'Seedlings';
      case 'plant_nutrition': return 'Plant Nutrition';
      case 'plant_medicine': return 'Plant Medicine';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <FiGrid className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plant Stock Management</h1>
            <p className="text-gray-600 text-sm mt-1">Manage seeds, seedlings, nutrition, and plant medicine</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <FiPlus size={16} />
          Add Plant Stock
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {['plant_seeds', 'plant_seedlings', 'plant_nutrition', 'plant_medicine'].map((category) => {
          const categoryStocks = plantStocks.filter(stock => {
            const product = products.find(p => p._id === stock.productId);
            return product?.category === category;
          });
          const totalQuantity = categoryStocks.reduce((sum, stock) => sum + stock.quantity, 0);
          
          return (
            <div key={category} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3">
                {getCategoryIcon(category)}
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
                  <p className="text-gray-600 text-sm">{getCategoryLabel(category)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plant Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Plant Stock</h2>
        </div>
        
        {plantStocks.length === 0 ? (
          <div className="p-8 text-center">
            <FiGrid className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No plant stock available</p>
            <p className="text-gray-400 text-sm mt-1">Add some plant products to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plantStocks.map((stock) => {
                  const product = products.find(p => p._id === stock.productId);
                  const statusCounts = stock.units?.reduce((acc, unit) => {
                    acc[unit.status || 'planted'] = (acc[unit.status || 'planted'] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>) || {};

                  return (
                    <tr key={stock._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product && getCategoryIcon(product.category)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{stock.productName}</p>
                            {product?.description && (
                              <p className="text-sm text-gray-500">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {product ? getCategoryLabel(product.category) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{stock.quantity}</p>
                        {product?.unit && (
                          <p className="text-sm text-gray-500">{product.unit}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(statusCounts).map(([status, count]) => (
                            <span key={status} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {count} {status}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <FiEdit2 size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiGrid className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Plant Stock</h2>
                <p className="text-gray-600 text-sm mt-1">Add new plant products to inventory</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plant Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a plant product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} ({getCategoryLabel(product.category)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Greenhouse A, Field 1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStock}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}