"use client";
import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";

export default function ComingSoonPage() {
  const [seconds, setSeconds] = useState(60 * 60 * 24); // 24h countdown

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-50 to-green-100">
      <FiClock className="text-7xl text-green-400 mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold text-green-700 mb-2">Coming Soon</h1>
      <p className="text-gray-600 text-lg mb-6">Welcome to the waiting list!<br/>You will get access when the service is live.</p>
      <div className="flex items-center gap-2 text-2xl font-mono text-green-700 bg-white rounded-lg px-6 py-2 shadow">
        {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
