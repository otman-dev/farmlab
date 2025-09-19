"use client";

import React from "react";

export default function FoodStockPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Animal Food Stock</h1>
      <p className="text-gray-600 mb-8">Track and manage all food inventory for farm animals here.</p>
      {/* TODO: Add food stock management UI here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-400">No food stock data yet. Add your first item!</p>
      </div>
    </div>
  );
}
