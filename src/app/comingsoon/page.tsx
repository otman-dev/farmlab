"use client";
import { useEffect, useState } from "react";
import { FiClock, FiWifi, FiEye, FiTrendingUp, FiUsers } from "react-icons/fi";


export default function ComingSoonPage() {
  // Countdown to October 17, 2025
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const target = new Date(2025, 9, 17, 0, 0, 0); // October is month 9 (0-indexed)
    const updateCountdown = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSecs(0);
        return;
      }
      setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((diff / (1000 * 60 * 60)) % 24));
      setMinutes(Math.floor((diff / (1000 * 60)) % 60));
      setSecs(Math.floor((diff / 1000) % 60));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-50 to-green-300 px-2 py-8 flex flex-col justify-center">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-7xl mx-auto">
        {/* Left: Illustration and intro */}
        <div className="flex flex-col items-center lg:items-start flex-1 max-w-lg w-full">
          <div className="mb-8 w-full flex justify-center lg:justify-start">
            <div className="relative w-64 h-40 animate-fade-in-up">
              <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <ellipse cx="160" cy="180" rx="140" ry="20" fill="#A7F3D0" />
                <rect x="60" y="120" width="60" height="40" rx="8" fill="#FDE68A" stroke="#F59E42" strokeWidth="3" />
                <rect x="120" y="100" width="80" height="60" rx="10" fill="#F3F4F6" stroke="#6EE7B7" strokeWidth="4" />
                <rect x="200" y="130" width="40" height="30" rx="6" fill="#FDE68A" stroke="#F59E42" strokeWidth="3" />
                <rect x="140" y="120" width="20" height="40" rx="4" fill="#A7F3D0" stroke="#34D399" strokeWidth="2" />
                <circle cx="180" cy="120" r="10" fill="#F59E42" />
                <rect x="90" y="160" width="140" height="10" rx="5" fill="#6EE7B7" />
                <rect x="110" y="170" width="100" height="6" rx="3" fill="#34D399" />
                <ellipse cx="80" cy="180" rx="18" ry="6" fill="#6EE7B7" />
                <ellipse cx="240" cy="180" rx="18" ry="6" fill="#6EE7B7" />
                <rect x="150" y="80" width="20" height="30" rx="6" fill="#F59E42" />
                <rect x="155" y="70" width="10" height="20" rx="4" fill="#FDE68A" />
              </svg>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                <FiClock className="text-5xl text-green-400 animate-pulse opacity-80" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-green-700 mb-4 text-left drop-shadow-lg animate-fade-in">We&#39;re Launching Soon!</h1>
          <p className="text-gray-700 text-lg mb-4 text-left max-w-xl">
            Thank you for your interest in <span className="font-semibold text-green-600">FarmLab</span>.<br />
            Our service is almost ready. Stay tuned for updates and exclusive early access!
          </p>
        </div>
        {/* Right: Features, timer, button */}
        <div className="flex flex-col items-center flex-1 max-w-xl w-full">
          <div className="bg-white/80 rounded-2xl shadow-lg px-4 sm:px-8 py-8 mb-8 w-full border border-green-100">
            <h2 className="text-3xl font-extrabold text-green-700 mb-6 text-center tracking-tight">What is FarmLab?</h2>
            <p className="text-gray-700 text-lg mb-8 text-center max-w-2xl mx-auto">
              <span className="font-semibold">FarmLab</span> is a real-world smart agriculture platform, developed and tested on our own working farm.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col items-center bg-white/90 rounded-xl p-6 shadow-sm border border-green-50">
                <FiWifi size={32} className="text-green-500 mb-2" />
                <h3 className="font-semibold text-green-700 text-lg mb-1">Remote Control</h3>
                <p className="text-gray-600 text-sm text-center">Admins monitor, automate, and control their farm from anywhere, in real time.</p>
              </div>
              <div className="flex flex-col items-center bg-white/90 rounded-xl p-6 shadow-sm border border-green-50">
                <FiEye size={32} className="text-green-500 mb-2" />
                <h3 className="font-semibold text-green-700 text-lg mb-1">Live Insights</h3>
                <p className="text-gray-600 text-sm text-center">Visitors will soon view selected farm intelligence and live data shared by farmers.</p>
              </div>
              <div className="flex flex-col items-center bg-white/90 rounded-xl p-6 shadow-sm border border-green-50">
                <FiTrendingUp size={32} className="text-green-500 mb-2" />
                <h3 className="font-semibold text-green-700 text-lg mb-1">Smart & Sustainable</h3>
                <p className="text-gray-600 text-sm text-center">FarmLab optimizes operations, improves yields, and brings modern tech to agriculture.</p>
              </div>
              <div className="flex flex-col items-center bg-white/90 rounded-xl p-6 shadow-sm border border-green-50">
                <FiUsers size={32} className="text-green-500 mb-2" />
                <h3 className="font-semibold text-green-700 text-lg mb-1">Future Vision</h3>
                <p className="text-gray-600 text-sm text-center">Today one farm&mdash;tomorrow, FarmLab could manage many greenhouses and sites.</p>
              </div>
            </div>
            <p className="text-gray-500 text-base text-center italic">Join us on this journey to the future of agriculture!</p>
          </div>
          {/* Countdown and Waitlist Button Section */}
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-col items-center w-full">
              <span className="uppercase text-xs tracking-widest text-green-500 mb-2 animate-fade-in">Launching In</span>
              <div className="flex items-center gap-3 text-2xl sm:text-3xl font-mono text-green-800 bg-white/70 backdrop-blur-md rounded-3xl px-6 sm:px-10 py-4 sm:py-5 shadow-2xl border border-green-200 animate-timer-pop">
                <span className="w-10 sm:w-12 text-center">{days.toString().padStart(2, '0')}</span>
                <span className="text-green-400 font-bold">d</span>
                <span className="w-10 sm:w-12 text-center">{hours.toString().padStart(2, '0')}</span>
                <span className="text-green-400 font-bold">h</span>
                <span className="w-10 sm:w-12 text-center">{minutes.toString().padStart(2, '0')}</span>
                <span className="text-green-400 font-bold">m</span>
                <span className="w-10 sm:w-12 text-center">{secs.toString().padStart(2, '0')}</span>
                <span className="text-green-400 font-bold">s</span>
              </div>
            </div>
            <a
              href="/auth/register"
              className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-200 animate-fade-in mt-2"
            >
              Join the Waitlist
            </a>
          </div>
        </div>
      </div>
      {/* Animations */}
      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes timer-pop {
          0% { transform: scale(0.9); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-timer-pop {
          animation: timer-pop 1.2s cubic-bezier(0.4,0,0.2,1) 0.5s both;
        }
      `}</style>
    </div>
  );
}
