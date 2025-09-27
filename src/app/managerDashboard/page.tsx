"use client";
import React from "react";
export default function ManagerDashboardPage() {
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-green-100">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Manager Dashboard</h1>
      <p className="text-gray-700 text-lg mb-6">Welcome to the manager dashboard. Manage stock, staff, and farm operations here.</p>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Medical and food stock management</li>
        <li>Invoices and products</li>
        <li>Staff and suppliers</li>
      </ul>
    </div>
  );
}