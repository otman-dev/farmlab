"use client";

import React, { useEffect, useState } from "react";

interface Product {
  _id: string;
  name: string;
  description?: string;
  unit?: string;
  unitAmount?: number;
}

interface FoodStockUnit {
  openedAt?: string;
}

interface FoodStock {
  _id: string;
  product: Product;
  units: FoodStockUnit[];
  createdAt: string;
}

export default function FoodStockPage() {
  const [stocks, setStocks] = useState<FoodStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [consuming, setConsuming] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/food-stock");
      const data = await res.json();
      if (res.ok) {
        setStocks(data.stocks || []);
      } else {
        setError(data.error || "Failed to fetch food stock");
      }
    } catch {
      setError("Failed to fetch food stock");
    }
    setLoading(false);
  };

  const markConsumed = async (stockId: string, unitIndex: number) => {
    setConsuming(c => ({ ...c, [stockId + unitIndex]: true }));
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/dashboard/food-stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockId, unitIndex, openedAt: new Date().toISOString() })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Unit marked as consumed.");
        fetchStocks();
      } else {
        setError(data.error || "Failed to mark as consumed");
      }
    } catch {
      setError("Failed to mark as consumed");
    }
    setConsuming(c => ({ ...c, [stockId + unitIndex]: false }));
  };

  // Format date as 'Sep 20, 2025' and optionally time
  const formatDate = (dateStr?: string, withTime = false) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 text-black">Animal Food Stock</h1>
      <p className="text-gray-600 mb-8">Track and manage all food supplies for farm animals here.</p>
      {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
      {success && <div className="text-green-600 font-semibold mb-4">{success}</div>}
      {loading ? (
        <div className="text-green-600 font-semibold">Loading food stock...</div>
      ) : stocks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-400">No food stock data yet. Add your first item!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-green-50">
                <th className="px-4 py-2 border-b text-left text-black">Product</th>
                <th className="px-4 py-2 border-b text-left text-black">Description</th>
                <th className="px-4 py-2 border-b text-left text-black">Unit</th>
                <th className="px-4 py-2 border-b text-left text-black">Amount</th>
                <th className="px-4 py-2 border-b text-left text-black">Units in Stock</th>
                <th className="px-4 py-2 border-b text-left text-black">Units (Details)</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(stock => (
                <tr key={stock._id} className="border-b">
                  <td className="px-4 py-2 font-bold text-black">{stock.product?.name}</td>
                  <td className="px-4 py-2 text-black">{stock.product?.description || "-"}</td>
                  <td className="px-4 py-2 text-black">{stock.product?.unit || "-"}</td>
                  <td className="px-4 py-2 text-black">{stock.product?.unitAmount || "-"}</td>
                  <td className="px-4 py-2 font-semibold text-black">{stock.units.length}</td>
                  <td className="px-4 py-2 text-black">
                    <ul className="space-y-1">
                      {stock.units.map((unit, idx) => (
                        <li key={idx} className="flex items-center gap-2 rounded px-2 py-1">
                          {unit.openedAt ? (
                            <span
                              className="inline-block bg-gray-200 text-black rounded px-2 py-0.5 text-xs"
                              title={unit.openedAt ? new Date(unit.openedAt).toLocaleString() : undefined}
                            >
                              Consumed: {formatDate(unit.openedAt)}
                            </span>
                          ) : (
                            <button
                              className="bg-green-500 hover:bg-green-700 text-white rounded px-2 py-0.5 text-xs font-bold disabled:opacity-50"
                              disabled={consuming[stock._id + idx]}
                              onClick={() => markConsumed(stock._id, idx)}
                            >
                              Mark as Consumed
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
