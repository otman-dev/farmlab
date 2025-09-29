"use client";

import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

interface CountdownProps {
  targetDate: string | Date; // Can be a string like "2025-12-31" or a Date object
  title?: string;
  subtitle?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function LaunchCountdown({ targetDate, title = "Launching Soon", subtitle = "Get ready for the launch of our platform!", className = "" }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    
    const calculateTimeLeft = () => {
      const difference = +target - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // If we've reached the target date
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft(); // Initial calculation
    
    // Set up interval for countdown
    const timer = setInterval(calculateTimeLeft, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [targetDate]);
  
  // Don't render during SSR to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  const formatNumber = (num: number): string => num.toString().padStart(2, '0');

  return (
    <div className={`bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
          <FiClock className="text-white w-5 h-5" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      
      <p className="text-gray-600 mb-8 text-center text-base sm:text-lg leading-relaxed">{subtitle}</p>
      
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 rounded-2xl p-4 text-center border border-green-200 shadow-sm">
          <div className="text-2xl md:text-3xl font-bold text-green-800 mb-1">{formatNumber(timeLeft.days)}</div>
          <div className="text-xs md:text-sm text-green-700 font-medium">Days</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 rounded-2xl p-4 text-center border border-emerald-200 shadow-sm">
          <div className="text-2xl md:text-3xl font-bold text-emerald-800 mb-1">{formatNumber(timeLeft.hours)}</div>
          <div className="text-xs md:text-sm text-emerald-700 font-medium">Hours</div>
        </div>
        <div className="bg-gradient-to-br from-teal-50 via-teal-100 to-emerald-100 rounded-2xl p-4 text-center border border-teal-200 shadow-sm">
          <div className="text-2xl md:text-3xl font-bold text-teal-800 mb-1">{formatNumber(timeLeft.minutes)}</div>
          <div className="text-xs md:text-sm text-teal-700 font-medium">Mins</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 via-emerald-100 to-teal-100 rounded-2xl p-4 text-center border border-green-200 shadow-sm">
          <div className="text-2xl md:text-3xl font-bold text-green-800 countdown-seconds mb-1">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-xs md:text-sm text-green-700 font-medium">Secs</div>
        </div>
      </div>
      
      {/* Add subtle animation to seconds counter */}
      <style jsx>{`
        @keyframes pulse-gentle {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .countdown-seconds {
          animation: pulse-gentle 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}