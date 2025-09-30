"use client";
import React from "react";
import FarmDashboard from "@/components/FarmDashboard";

export default function VisitorDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Light branded theme container */}
      <div className="max-w-7xl mx-auto p-6">
        <FarmDashboard />
      </div>
    </div>
  );
}