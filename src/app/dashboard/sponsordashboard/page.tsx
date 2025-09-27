"use client";

import React from "react";

export default function SponsorDashboardPage() {
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-green-100">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Sponsor Dashboard</h1>
      <p className="text-gray-700 text-lg mb-6">
        Welcome to your dedicated sponsor dashboard! Here you can view and manage your sponsored food stock, invoices, products, and suppliers.
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Track food stock contributions and usage</li>
        <li>View and download invoices & receipts</li>
        <li>Browse and manage sponsored products</li>
        <li>Connect with suppliers</li>
      </ul>
      <div className="mt-8 text-sm text-gray-400">More sponsor-specific features coming soon!</div>
    </div>
  );
}
