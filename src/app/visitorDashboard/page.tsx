"use client";
import React from "react";
export default function VisitorDashboardPage() {
  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-green-100">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Visitor Dashboard</h1>
      <p className="text-gray-700 text-lg mb-6">Welcome to the visitor dashboard. Explore features and learn more about FarmLab.</p>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>View public farm data</li>
        <li>Contact and about info</li>
        <li>Presentation dashboard</li>
      </ul>
    </div>
  );
}