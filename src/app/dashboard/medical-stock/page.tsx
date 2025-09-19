"use client";

import React from "react";

export default function MedicalStockPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Animal Medical Stock</h1>
      <p className="text-gray-600 mb-8">Track and manage all medical supplies for farm animals here.</p>
      {/* TODO: Add medical stock management UI here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-400">No medical stock data yet. Add your first item!</p>
      </div>
    </div>
  );
}
