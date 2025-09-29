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
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <FiClock className="text-green-600 w-5 h-5" />
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      
      <p className="text-gray-600 mb-6 text-center">{subtitle}</p>
      
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-xl p-3 text-center">
          <div className="text-3xl md:text-4xl font-bold text-green-800">{formatNumber(timeLeft.days)}</div>
          <div className="text-xs md:text-sm text-green-700">Days</div>
        </div>
        <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-xl p-3 text-center">
          <div className="text-3xl md:text-4xl font-bold text-green-800">{formatNumber(timeLeft.hours)}</div>
          <div className="text-xs md:text-sm text-green-700">Hours</div>
        </div>
        <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-xl p-3 text-center">
          <div className="text-3xl md:text-4xl font-bold text-green-800">{formatNumber(timeLeft.minutes)}</div>
          <div className="text-xs md:text-sm text-green-700">Mins</div>
        </div>
        <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-xl p-3 text-center">
          <div className="text-3xl md:text-4xl font-bold text-green-800 countdown-seconds">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-xs md:text-sm text-green-700">Secs</div>
        </div>
      </div>
      
      {/* Add subtle animation to seconds counter */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .countdown-seconds {
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
}