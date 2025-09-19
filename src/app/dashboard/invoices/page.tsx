"use client";

import React from "react";

export default function InvoicesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Invoices & Receipts</h1>
      <p className="text-gray-600 mb-8">Manage and review all invoices and receipts for farm expenses here.</p>
      {/* TODO: Add invoices and receipts management UI here */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-400">No invoices or receipts yet. Add your first record!</p>
      </div>
    </div>
  );
}
