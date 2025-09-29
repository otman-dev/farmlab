"use client";

import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaBoxOpen, FaSpinner, FaSearch, FaPills } from "react-icons/fa";

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

export default function MedicalStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [medicalStocks, setMedicalStocks] = useState<MedicalStock[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch products and stocks
      const [productsRes, stocksRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/medical-stock")
      ]);
      const productsData = await productsRes.json();
      const stocksData = await stocksRes.json();
      if (productsRes.ok && stocksRes.ok) {
        const medProducts = productsData.products.filter((p: Product) => p.category === "animal_medicine");
        setProducts(medProducts);
        setMedicalStocks(stocksData.stocks || []);
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
        setError(productsData.error || stocksData.error || "Failed to fetch data");
      }
    } catch {
      setError("Failed to fetch data");
    }
    setLoading(false);
  };

  const getQuantity = (productId: string) => {
    const stock = medicalStocks.find(s => s.productId === productId);
    return stock ? stock.quantity : 0;
  };

  const getLastUpdated = (productId: string) => {
    const stock = medicalStocks.find(s => s.productId === productId);
    return stock ? stock.createdAt : undefined;
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

  const totalProducts = products.length;
  const totalUnits = medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);

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

  return (
    <div className="p-2 sm:p-6 min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-green-800 flex items-center gap-2">
          <FaBoxOpen className="inline-block text-green-500" /> Animal Medical Stock Management
        </h1>
        <p className="text-gray-600 mb-6">Visually manage and track all animal medicine products and their stock levels.</p>

        {/* Summary */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="bg-white rounded-lg shadow px-6 py-3 flex flex-col items-center border border-green-100 min-w-[120px]">
            <span className="text-2xl font-bold text-green-700">{totalProducts}</span>
            <span className="text-xs text-gray-500">Products</span>
          </div>
          <div className="bg-white rounded-lg shadow px-6 py-3 flex flex-col items-center border border-green-100 min-w-[120px]">
            <span className="text-2xl font-bold text-green-700">{totalUnits}</span>
            <span className="text-xs text-gray-500">Total Units in Stock</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-6 max-w-md mx-auto bg-white rounded-full shadow px-4 py-2 border border-green-100">
          <FaSearch className="text-green-400" />
          <input
            type="text"
            className="flex-1 outline-none bg-transparent text-green-900 placeholder:text-gray-400 text-base"
            placeholder="Search medicines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
        {success && <div className="text-green-600 font-semibold mb-4">{success}</div>}

        {loading ? (
          <div className="text-green-600 font-semibold">Loading medical stock...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-400">No animal medicine products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const quantity = getQuantity(product._id);
              const isIncPending = pending[product._id + "increment"];
              const isDecPending = pending[product._id + "decrement"];
              const lastUpdated = getLastUpdated(product._id);
              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-green-100 hover:shadow-xl transition-all relative"
                >
                  {/* Product Icon */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-100 rounded-full p-3 text-green-600 text-2xl shadow-sm">
                      <FaPills />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-green-900 text-lg truncate">{product.name}</div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`${getProgressBar(quantity)} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(quantity, 30) / 30 * 100}%` }}
                    />
                  </div>
                  {/* Stock and Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full border text-sm font-bold ${getStockBadge(quantity)} transition-all duration-200`} aria-label={`Stock: ${quantity}`}>{quantity} units</span>
                    <div className="flex gap-2">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 text-base shadow disabled:opacity-50 disabled:cursor-not-allowed relative"
                        disabled={isIncPending}
                        onClick={() => updateUnits(product._id, "increment")}
                        title="Add unit"
                        aria-label="Add unit"
                      >
                        {isIncPending ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaPlus />
                        )}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 text-base shadow disabled:opacity-50 disabled:cursor-not-allowed relative"
                        disabled={isDecPending || quantity === 0}
                        onClick={() => updateUnits(product._id, "decrement")}
                        title="Remove unit"
                        aria-label="Remove unit"
                      >
                        {isDecPending ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaMinus />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Last Updated */}
                  <div className="text-xs text-gray-400 mt-2">Last updated: {lastUpdated ? formatDate(lastUpdated, true) : "-"}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}