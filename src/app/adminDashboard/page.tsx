"use client";
import React from "react";
export default function AdminDashboardPage() {
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-green-100">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Admin Dashboard</h1>
      <p className="text-gray-700 text-lg mb-6">Welcome to the admin dashboard. Manage users, settings, and all system data here.</p>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Full access to all modules</li>
        <li>User management</li>
        <li>System settings</li>
        <li>Audit logs</li>
      </ul>
    </div>
  );
}