"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiWifi, FiEye, FiTrendingUp, FiUsers } from "react-icons/fi";

type SessionUserWithRole = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export default function ComingSoonClient() {
  const { data: session } = useSession();
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
    <div
      className="min-h-screen w-full flex items-center justify-center overflow-hidden relative"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #e6f9f0 0%, #d0f0e0 40%, #eaf7e0 100%)',
      }}
    >
      {/* Animated grid/circuit overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(80,200,120,0.06) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, rgba(80,200,120,0.06) 0 1px, transparent 1px 40px)',
          animation: 'bg-move 20s linear infinite',
        }}
      />
      <div
        className="flex flex-col lg:flex-row items-center justify-center flex-1 max-w-6xl w-full px-2 sm:px-6 md:px-10 py-4 md:py-2 lg:py-0 gap-8 md:gap-10 lg:gap-16 relative z-10"
        style={{
          minHeight: '92vh',
          maxHeight: 'none',
          height: 'auto',
        }}
      >
        {/* Left: Branding, Countdown, and user message (polished) */}
        <div className="flex flex-col items-center w-full max-w-md mb-4 lg:mb-0 lg:items-start">
          {/* Branding/logo */}
          <div className="flex flex-col items-center w-full mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-lime-300 flex items-center justify-center shadow-xl border-4 border-white mb-2">
              <FiUsers size={40} className="text-white drop-shadow-lg" />
            </div>
            <span className="text-3xl font-extrabold text-green-700 tracking-tight font-mono drop-shadow-lg mb-1">FarmLab</span>
            <span className="text-green-400 font-semibold text-xs tracking-widest uppercase">Early Access</span>
          </div>
          <div className="w-full bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-green-200 px-6 sm:px-10 py-8 flex flex-col items-center lg:items-start gap-8 animate-fade-in">
            {/* Countdown and message grouped visually */}
            <div className="flex flex-col items-center w-full gap-4">
              <span className="uppercase text-xs tracking-widest text-green-500 animate-fade-in">Launching In</span>
              <div className="flex items-center gap-3 text-3xl sm:text-4xl font-mono text-green-900 bg-white/70 backdrop-blur-lg rounded-3xl px-8 sm:px-12 py-5 sm:py-7 shadow-2xl border border-green-300 animate-timer-pop ring-2 ring-green-300/40 ring-inset"
                style={{ boxShadow: '0 0 32px 4px #a3e63555, 0 2px 24px 0 #0001' }}>
                <span className="w-12 sm:w-14 text-center">{days.toString().padStart(2, '0')}</span>
                <span className="text-green-400 font-bold">d</span>
                <span className="w-12 sm:w-14 text-center">{hours.toString().padStart(2, '0')}</span>
                <span className="text-green-400 font-bold">h</span>
                <span className="w-12 sm:w-14 text-center">{minutes.toString().padStart(2, '0')}</span>
                <span className="text-green-400 font-bold">m</span>
                <span className="w-12 sm:w-14 text-center">{secs.toString().padStart(2, '0')}</span>
                <span className="text-green-400 font-bold">s</span>
              </div>
            </div>
            {/* User message or CTA, with accent for visitor */}
            {((session?.user as SessionUserWithRole)?.role === "visitor") ? (
              <div className="flex flex-col items-center justify-center w-full animate-fade-in mt-2 lg:items-start bg-gradient-to-br from-green-100/80 to-lime-100/60 rounded-2xl p-6 border border-green-200 shadow-lg ring-2 ring-green-200/30">
                <span className="block text-green-800 font-extrabold text-xl mb-1">Welcome, {(session?.user as SessionUserWithRole)?.name || 'Friend'}!</span>
                <span className="block text-green-700 text-lg font-medium mb-1">You&#39;re already on the waitlist! 🎉</span>
                <span className="text-green-600 text-base font-normal text-center lg:text-left">Thank you for joining FarmLab&#39;s early access. We&#39;ll keep you updated as we launch new features.</span>
              </div>
            ) : (
              <a
                href="/auth/register"
                className="inline-block px-8 py-3 bg-gradient-to-r from-green-400 via-green-600 to-lime-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-green-500 hover:to-lime-500 transition-all duration-200 animate-fade-in mt-2 ring-2 ring-green-300/40 ring-inset"
                style={{ boxShadow: '0 0 16px 2px #a3e63555, 0 2px 8px 0 #0001' }}
              >
                Join the Waitlist
              </a>
            )}
          </div>
        </div>
        {/* Right: FarmLab info and features */}
        <div className="flex flex-col w-full max-w-xl gap-6">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl px-4 sm:px-8 py-4 sm:py-6 w-full border-2 border-green-200 transition-shadow">
            <h2 className="text-3xl font-extrabold text-green-700 mb-6 text-center tracking-tight">What is FarmLab?</h2>
            <p className="text-gray-700 text-lg mb-8 text-center max-w-2xl mx-auto">
              <span className="font-semibold">FarmLab</span> is a real-world smart agriculture platform, developed and tested on our own working farm.
            </p>
            <p className="text-gray-500 text-base text-center italic">Join us on this journey to the future of agriculture!</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
            <div className="flex flex-col items-center bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-green-200 transition-transform hover:scale-105 hover:shadow-lg">
              <FiWifi size={32} className="text-green-500 mb-2" />
              <h3 className="font-semibold text-green-700 text-lg mb-1">Remote Control</h3>
              <p className="text-gray-600 text-sm text-center">Admins monitor, automate, and control their farm from anywhere, in real time.</p>
            </div>
            <div className="flex flex-col items-center bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-green-200 transition-transform hover:scale-105 hover:shadow-lg">
              <FiTrendingUp size={32} className="text-green-500 mb-2" />
              <h3 className="font-semibold text-green-700 text-lg mb-1">Smart & Sustainable</h3>
              <p className="text-gray-600 text-sm text-center">FarmLab optimizes operations, improves yields, and brings modern tech to agriculture.</p>
            </div>
            <div className="flex flex-col items-center bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-green-200 transition-transform hover:scale-105 hover:shadow-lg">
              <FiEye size={32} className="text-green-500 mb-2" />
              <h3 className="font-semibold text-green-700 text-lg mb-1">Live Insights</h3>
              <p className="text-gray-600 text-sm text-center">Visitors will soon view selected farm intelligence and live data shared by farmers.</p>
            </div>
            <div className="flex flex-col items-center bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-green-200 transition-transform hover:scale-105 hover:shadow-lg">
                {/* Animated grid/circuit overlay keyframes */}
                <style>{`
                  @keyframes bg-move {
                    0% { background-position: 0 0, 0 0; }
                    100% { background-position: 80px 40px, 40px 80px; }
                  }
                `}</style>
              <FiUsers size={32} className="text-green-500 mb-2" />
              <h3 className="font-semibold text-green-700 text-lg mb-1">Future Vision</h3>
              <p className="text-gray-600 text-sm text-center">Today one farm&mdash;tomorrow, FarmLab could manage many greenhouses and sites.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
