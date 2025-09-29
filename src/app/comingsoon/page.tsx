"use client";

import Link from "next/link";
import React from "react";
import LaunchCountdown from "@/components/LaunchCountdown";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-10 border border-green-100 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-4">Coming Soon!</h1>
        <p className="text-gray-700 text-lg mb-6">
          You are currently on the waiting list. This feature or area will be available soon. Please check back later or contact support for more information.
        </p>
        
        {/* Launch Countdown */}
        <div className="my-10">
          <LaunchCountdown 
            targetDate="2025-10-28T12:00:00" 
            title="Platform Launch" 
            subtitle="Only 30 days until our official launch! Be the first to experience our platform."
            className="transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          />
        </div>
        
        <div className="mt-8 text-sm text-gray-400">Thank you for your patience!</div>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors duration-150"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
