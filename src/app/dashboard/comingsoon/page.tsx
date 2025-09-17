"use client";
import { FiClock } from "react-icons/fi";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24">
      <FiClock className="text-6xl text-green-400 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-green-700 mb-2">Coming Soon</h1>
      <p className="text-gray-500 text-lg">This feature is not available for your account yet.<br/>Please check back later or contact your administrator.</p>
    </div>
  );
}
