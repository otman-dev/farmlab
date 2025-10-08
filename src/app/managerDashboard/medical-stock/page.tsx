"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaBoxOpen, FaSpinner, FaSearch, FaPills, FaCalendar, FaExclamationTriangle, FaCheck, FaTimes, FaEye } from "react-icons/fa";

interface Product {
  _id: string;
  name: string;
  description?: string;
  unit?: string;
  amountPerUnit?: number;
  category: string;
}

interface MedicalStock {
  _id: string;
  productId: string;
  productName: string;
  quantity: number;
  createdAt: string;
}

interface MedicineUnitDetailed {
  _id: string;
  productId: string;
  productName: string;
  customId: string;
  expirationDate: string;
  firstUsageDate?: string;
  usageDescription?: string;
  goodFor?: string[];
  isUsed: boolean;
  isExpired: boolean;
  invoiceId?: string;
  createdAt: string;
  
  updatedAt: string;
}

interface UnitsSummary {
  total: number;
  available: number;
  used: number;
  expired: number;
  expiringSoon: number;
}

export default function MedicalStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [medicalStocks, setMedicalStocks] = useState<MedicalStock[]>([]);
  const [medicineUnits, setMedicineUnits] = useState<MedicineUnitDetailed[]>([]);
  const [unitsSummary, setUnitsSummary] = useState<UnitsSummary | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'units'>('summary');
  const [unitFilter, setUnitFilter] = useState<'all' | 'available' | 'used' | 'expired' | 'expiring'>('all');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch products, stocks, and medicine units
      const [productsRes, stocksRes, unitsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/medical-stock"),
        fetch("/api/medicine-units")
      ]);
      
      const productsData = await productsRes.json();
      const stocksData = await stocksRes.json();
      const unitsData = await unitsRes.json();
      
      if (productsRes.ok && stocksRes.ok && unitsRes.ok) {
        const medProducts = productsData.products.filter((p: Product) => p.category === "animal_medicine");
        setProducts(medProducts);
        setMedicalStocks(stocksData.stocks || []);
        setMedicineUnits(unitsData.units || []);
        setUnitsSummary(unitsData.summary || null);
        
        // Ensure every product has a MedicalStock entry
        const missing = medProducts.filter(
          (p: Product) => !(stocksData.stocks || []).some((s: MedicalStock) => s.productId === p._id)
        );
        if (missing.length > 0) {
          await Promise.all(missing.map((product: Product) =>
            fetch("/api/medical-stock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: product._id, quantity: 0 })
            })
          ));
          // Re-fetch stocks after creating missing entries
          const stocksRes2 = await fetch("/api/medical-stock");
          const stocksData2 = await stocksRes2.json();
          setMedicalStocks(stocksData2.stocks || []);
        }
      } else {
        setError(productsData.error || stocksData.error || unitsData.error || "Failed to fetch data");
      }
    } catch {
      setError("Failed to fetch data");
    }
    setLoading(false);
  };

  const getQuantity = (productId: string) => {
    // Prefer counting individual medicine units (unused and not expired) when available
    const unitsForProduct = medicineUnits.filter(u => u.productId === productId);
    if (unitsForProduct.length > 0) {
      const availableCount = unitsForProduct.filter(u => !u.isUsed && !u.isExpired).length;
      // If unit-level tracking exists but availableCount is 0 while the
      // MedicalStock record still has quantity > 0, fall back to that quantity.
      // This handles situations where unit flags may be inconsistent (e.g. timezone
      // issues marking units expired) but the overall stock quantity is positive.
      if (availableCount === 0) {
        const stock = medicalStocks.find(s => s.productId === productId);
        if (stock && stock.quantity > 0) {
          console.warn(`Available units computed as 0 for product ${productId} from unit flags; falling back to MedicalStock.quantity=${stock.quantity}`);
          return stock.quantity;
        }
      }
      return availableCount;
    }

    // Fallback to MedicalStock.quantity when no unit-level tracking exists
    const stock = medicalStocks.find(s => s.productId === productId);
    return stock ? stock.quantity : 0;
  };

  const getLastUpdated = (productId: string) => {
    const stock = medicalStocks.find(s => s.productId === productId);
    return stock ? stock.createdAt : undefined;
  };

  const getProductUnits = (productId: string) => {
    return medicineUnits.filter(unit => unit.productId === productId);
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) return "bg-red-100 text-red-700 border-red-300";
    if (quantity < 10) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-green-100 text-green-800 border-green-300";
  };

  const getProgressBar = (quantity: number) => {
    if (quantity === 0) return "bg-red-400";
    if (quantity < 10) return "bg-yellow-400";
    return "bg-green-500";
  };

  const formatDate = (dateStr?: string, withTime = false) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    if (withTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString(undefined, options);
  };

  const isExpiringSoon = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return expDate <= thirtyDaysFromNow && expDate >= now;
  };

  const getExpirationStatus = (unit: MedicineUnitDetailed) => {
    if (unit.isExpired) return { label: 'Expired', color: 'bg-red-100 text-red-800 border-red-200' };
    if (isExpiringSoon(unit.expirationDate)) return { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Good', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const updateUnitStatus = async (unitId: string, isUsed: boolean) => {
    setPending(p => ({ ...p, [unitId]: true }));
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch("/api/medicine-units", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          unitId, 
          updates: { 
            isUsed,
            firstUsageDate: isUsed ? new Date().toISOString() : undefined
          }
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Unit ${isUsed ? 'marked as used' : 'marked as unused'} successfully`);
        // Refresh data to show updated counts
        await fetchData();
      } else {
        setError(data.error || "Failed to update unit status");
      }
    } catch {
      setError("Failed to update unit status");
    }
    
    setPending(p => ({ ...p, [unitId]: false }));
  };

  const deleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this medicine unit? This action cannot be undone.')) {
      return;
    }
    
    setPending(p => ({ ...p, [unitId + '_delete']: true }));
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch(`/api/medicine-units?unitId=${unitId}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess('Unit deleted successfully');
        await fetchData();
      } else {
        setError(data.error || "Failed to delete unit");
      }
    } catch {
      setError("Failed to delete unit");
    }
    
    setPending(p => ({ ...p, [unitId + '_delete']: false }));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateUnits = async (productId: string, action: "increment" | "decrement") => {
    setPending(p => ({ ...p, [productId + action]: true }));
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/medical-stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(action === "increment" ? "Unit added." : "Unit removed.");
        fetchData();
      } else {
        setError(data.error || "Failed to update stock");
      }
    } catch {
      setError("Failed to update stock");
    }
    setPending(p => ({ ...p, [productId + action]: false }));
  };

  // Enhanced filtering logic
  const filteredUnits = medicineUnits.filter(unit => {
    // Text search
    const matchesSearch = unit.productName.toLowerCase().includes(search.toLowerCase()) ||
                         unit.customId.toLowerCase().includes(search.toLowerCase());
    
    // Product filter
    const matchesProduct = !selectedProduct || unit.productId === selectedProduct;
    
    // Status filter
    let matchesFilter = true;
    switch (unitFilter) {
      case 'available':
        matchesFilter = !unit.isUsed && !unit.isExpired;
        break;
      case 'used':
        matchesFilter = unit.isUsed;
        break;
      case 'expired':
        matchesFilter = unit.isExpired;
        break;
      case 'expiring':
        matchesFilter = !unit.isUsed && !unit.isExpired && isExpiringSoon(unit.expirationDate);
        break;
    }
    
    return matchesSearch && matchesProduct && matchesFilter;
  });

  const totalProducts = products.length;

  return (
    <div className="p-2 sm:p-6 min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-green-800 flex items-center gap-2">
          <FaBoxOpen className="inline-block text-green-500" /> Medical Stock Management
        </h1>
        <p className="text-gray-600 mb-6">Track individual medicine units with expiration dates and usage monitoring.</p>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow px-4 py-3 border border-green-100">
            <div className="text-2xl font-bold text-green-700">{totalProducts}</div>
            <div className="text-xs text-gray-500">Products</div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 border border-green-100">
            <div className="text-2xl font-bold text-blue-700">{unitsSummary?.total || 0}</div>
            <div className="text-xs text-gray-500">Total Units</div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 border border-emerald-100">
            <div className="text-2xl font-bold text-emerald-700">{unitsSummary?.available || 0}</div>
            <div className="text-xs text-gray-500">Available</div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 border border-gray-100">
            <div className="text-2xl font-bold text-gray-700">{unitsSummary?.used || 0}</div>
            <div className="text-xs text-gray-500">Used</div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 border border-red-100">
            <div className="text-2xl font-bold text-red-700">{unitsSummary?.expired || 0}</div>
            <div className="text-xs text-gray-500">Expired</div>
          </div>
          <div className="bg-white rounded-lg shadow px-4 py-3 border border-yellow-100">
            <div className="text-2xl font-bold text-yellow-700">{unitsSummary?.expiringSoon || 0}</div>
            <div className="text-xs text-gray-500">Expiring Soon</div>
          </div>
        </div>

        {/* View Toggle and Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 border border-green-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'summary' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaBoxOpen className="inline mr-2" />
                Products Overview
              </button>
              <button
                onClick={() => setViewMode('units')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'units' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaPills className="inline mr-2" />
                Individual Units
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-green-100 min-w-[300px]">
              <FaSearch className="text-green-400" />
              <input
                type="text"
                className="flex-1 outline-none bg-transparent text-green-900 placeholder:text-gray-400 text-sm"
                placeholder={viewMode === 'summary' ? "Search medicines..." : "Search units or custom IDs..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Unit View Filters */}
          {viewMode === 'units' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-600 mr-2">Filter by:</span>
                <select
                  value={selectedProduct || ''}
                  onChange={e => setSelectedProduct(e.target.value || null)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={unitFilter}
                  onChange={e => setUnitFilter(e.target.value as 'all' | 'available' | 'used' | 'expired')}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="all">All Units</option>
                  <option value="available">Available</option>
                  <option value="used">Used</option>
                  <option value="expired">Expired</option>
                  <option value="expiring">Expiring Soon</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {error && <div className="text-red-600 font-semibold mb-4 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
        {success && <div className="text-green-600 font-semibold mb-4 bg-green-50 border border-green-200 rounded-lg p-3">{success}</div>}

        {loading ? (
          <div className="text-green-600 font-semibold">Loading medical stock...</div>
        ) : (
          <>
            {/* Products Summary View */}
            {viewMode === 'summary' && (
              <>
                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-400">No animal medicine products found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => {
                      const availableCount = getQuantity(product._id);
                      const isIncPending = pending[product._id + "increment"];
                      const isDecPending = pending[product._id + "decrement"];
                      const lastUpdated = getLastUpdated(product._id);
                      const productUnits = getProductUnits(product._id);
                      const totalUnits = productUnits.length > 0 ? productUnits.length : getQuantity(product._id);
                      const expiredCount = productUnits.filter(u => u.isExpired).length;
                      const expiringSoonCount = productUnits.filter(u => !u.isExpired && !u.isUsed && isExpiringSoon(u.expirationDate)).length;
                      
                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-green-100 hover:shadow-xl transition-all relative"
                        >
                          {/* Product Header */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-green-100 rounded-full p-3 text-green-600 text-2xl shadow-sm">
                              <FaPills />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-green-900 text-lg truncate">{product.name}</div>
                              <div className="text-xs text-gray-500">
                                {totalUnits} total units • Last updated: {formatDate(lastUpdated)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                            <div
                              className={`${getProgressBar(availableCount)} h-3 rounded-full transition-all duration-300`}
                              style={{ width: `${Math.min(availableCount, 30) / 30 * 100}%` }}
                            />
                          </div>
                          
                          {/* Stock Status and Actions */}
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span className={`inline-block px-3 py-1 rounded-full border text-sm font-bold ${getStockBadge(availableCount)} transition-all duration-200`}>
                              {availableCount} available
                            </span>
                            <div className="flex gap-2">
                              <button
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 text-base shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isIncPending}
                                onClick={() => updateUnits(product._id, "increment")}
                                title="Add unit"
                              >
                                {isIncPending ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 text-base shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isDecPending || availableCount === 0}
                                onClick={() => updateUnits(product._id, "decrement")}
                                title="Remove unit"
                              >
                                {isDecPending ? <FaSpinner className="animate-spin" /> : <FaMinus />}
                              </button>
                              <button
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 text-base shadow"
                                onClick={() => {
                                  setSelectedProduct(product._id);
                                  setViewMode('units');
                                }}
                                title="View individual units"
                              >
                                <FaEye />
                              </button>
                            </div>
                          </div>

                          {/* Expiration Alerts */}
                          {(expiredCount > 0 || expiringSoonCount > 0) && (
                            <div className="space-y-2">
                              {expiredCount > 0 && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-2">
                                  <FaExclamationTriangle className="text-sm" />
                                  <span className="text-xs font-medium">{expiredCount} expired unit{expiredCount > 1 ? 's' : ''}</span>
                                </div>
                              )}
                              {expiringSoonCount > 0 && (
                                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 rounded-lg p-2">
                                  <FaCalendar className="text-sm" />
                                  <span className="text-xs font-medium">{expiringSoonCount} expiring soon</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Individual Units View */}
            {viewMode === 'units' && (
              <>
                {filteredUnits.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <FaPills className="text-gray-300 text-4xl mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No medicine units found.</p>
                    <p className="text-gray-400 text-sm">Units will appear here when you create medicine invoices with individual unit tracking.</p>
                    {selectedProduct && (
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        Show All Products
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Units matching invoice form structure */}
                    {filteredUnits.map(unit => {
                      const expirationStatus = getExpirationStatus(unit);
                      const isUnitPending = pending[unit._id];
                      const isDeletePending = pending[unit._id + '_delete'];
                      
                      return (
                        <div
                          key={unit._id}
                          className={`bg-white rounded-xl shadow-lg border-2 p-4 md:p-6 transition-all hover:shadow-xl ${
                            unit.isExpired ? 'border-red-200 bg-red-50' :
                            isExpiringSoon(unit.expirationDate) ? 'border-yellow-200 bg-yellow-50' :
                            'border-green-200'
                          }`}
                        >
                          {/* Unit layout matching invoice form structure */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Box ID and Product Name - like invoice form */}
                            <div className="flex flex-col">
                              <label className="text-xs font-semibold text-green-700 mb-1">Box ID</label>
                              <div className="border-2 border-green-200 rounded px-2 py-1 text-xs text-gray-900 bg-gray-50 font-mono">
                                {unit.customId}
                              </div>
                              <span className="text-xs text-green-600 mt-1">{unit.productName}</span>
                            </div>
                            
                            {/* Expiration Date - like invoice form */}
                            <div className="flex flex-col">
                              <label className="text-xs font-semibold text-green-700 mb-1">Expiration Date</label>
                              <div className="border-2 border-green-200 rounded px-2 py-1 text-xs text-gray-900 bg-gray-50">
                                {formatDate(unit.expirationDate)}
                              </div>
                              <span className={`text-xs mt-1 px-2 py-1 rounded-full ${expirationStatus.color}`}>
                                {expirationStatus.label}
                              </span>
                            </div>
                            
                            {/* First Usage Date - like invoice form */}
                            <div className="flex flex-col">
                              <label className="text-xs font-semibold text-green-700 mb-1">First Usage Date</label>
                              <div className="border-2 border-green-200 rounded px-2 py-1 text-xs text-gray-900 bg-gray-50">
                                {unit.firstUsageDate ? formatDate(unit.firstUsageDate) : '-'}
                              </div>
                              <span className="text-xs text-green-600 mt-1">
                                {unit.firstUsageDate ? 'Used' : 'Not used yet'}
                              </span>
                            </div>
                            
                            {/* Status and Actions - like invoice form style */}
                            <div className="flex flex-col items-center justify-center">
                              <div className={`bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-300 mb-2 ${
                                unit.isUsed ? 'bg-gray-100 text-gray-800 border-gray-300' : ''
                              }`}>
                                {unit.isUsed ? 'Used' : 'Available'}
                              </div>
                              
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateUnitStatus(unit._id, !unit.isUsed)}
                                  disabled={isUnitPending || unit.isExpired}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-all disabled:opacity-50 ${
                                    unit.isUsed 
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  {isUnitPending ? (
                                    <FaSpinner className="animate-spin" />
                                  ) : (
                                    <>
                                      {unit.isUsed ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                                    </>
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => deleteUnit(unit._id)}
                                  disabled={isDeletePending}
                                  className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs transition-all disabled:opacity-50"
                                  title="Delete unit"
                                >
                                  {isDeletePending ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          {(unit.usageDescription || (unit.goodFor && unit.goodFor.length > 0)) && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                              {unit.goodFor && unit.goodFor.length > 0 && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">Good for animals:</label>
                                  <div className="flex gap-1 mt-1">
                                    {unit.goodFor.map(animal => (
                                      <span key={animal} className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                                        {animal === 'sheep' ? '🐑' : animal === 'chicken' ? '🐔' : '🐦'} {animal}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {unit.usageDescription && (
                                <div>
                                  <label className="text-xs font-semibold text-gray-600">Usage instructions:</label>
                                  <p className="text-xs text-gray-700 mt-1">{unit.usageDescription}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}