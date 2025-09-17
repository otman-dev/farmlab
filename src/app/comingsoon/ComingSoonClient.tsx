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
      className="min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e6f9f0 0%, #f7fff9 100%)',
      }}
    >
  <div className="flex flex-col items-center flex-1 max-w-5xl w-full px-2 sm:px-6 md:px-10 py-4 md:py-2 lg:py-0 gap-4 md:gap-2 justify-center" style={{minHeight: '92vh', maxHeight: '92vh'}}>
        {/* Timer and CTA/message at the top */}
  <div className="flex flex-col items-center gap-4 w-full mb-4">
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
          {((session?.user as SessionUserWithRole)?.role === "visitor") ? (
            <div className="mt-2 flex flex-col items-center justify-center w-full animate-fade-in">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 mb-3 shadow">
                <FiUsers size={36} className="text-green-600" />
              </div>
              <span className="block text-green-800 font-extrabold text-xl mb-1">Welcome, {(session?.user as SessionUserWithRole)?.name || 'Friend'}!</span>
              <span className="block text-green-700 text-base font-medium mb-1">You&#39;re already on the waitlist! 🎉</span>
              <span className="text-green-600 text-sm font-normal">Thank you for joining FarmLab&#39;s early access. We&#39;ll keep you updated as we launch new features.</span>
            </div>
          ) : (
            <a
              href="/auth/register"
              className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-200 animate-fade-in mt-2"
            >
              Join the Waitlist
            </a>
          )}
        </div>
        {/* What is FarmLab section below */}
  <div className="bg-white/90 rounded-3xl shadow-2xl px-4 sm:px-8 py-4 sm:py-6 w-full border-2 border-green-200 transition-shadow mb-4">
          <h2 className="text-3xl font-extrabold text-green-700 mb-6 text-center tracking-tight">What is FarmLab?</h2>
          <p className="text-gray-700 text-lg mb-8 text-center max-w-2xl mx-auto">
            <span className="font-semibold">FarmLab</span> is a real-world smart agriculture platform, developed and tested on our own working farm.
          </p>
          <p className="text-gray-500 text-base text-center italic">Join us on this journey to the future of agriculture!</p>
        </div>
        {/* Features grid at the bottom */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
          <div className="flex flex-col items-center bg-white/90 rounded-2xl p-6 shadow-md border border-green-100 transition-transform hover:scale-105 hover:shadow-lg">
            <FiWifi size={32} className="text-green-500 mb-2" />
            <h3 className="font-semibold text-green-700 text-lg mb-1">Remote Control</h3>
            <p className="text-gray-600 text-sm text-center">Admins monitor, automate, and control their farm from anywhere, in real time.</p>
          </div>
          <div className="flex flex-col items-center bg-white/90 rounded-2xl p-6 shadow-md border border-green-100 transition-transform hover:scale-105 hover:shadow-lg">
            <FiTrendingUp size={32} className="text-green-500 mb-2" />
            <h3 className="font-semibold text-green-700 text-lg mb-1">Smart & Sustainable</h3>
            <p className="text-gray-600 text-sm text-center">FarmLab optimizes operations, improves yields, and brings modern tech to agriculture.</p>
          </div>
          <div className="flex flex-col items-center bg-white/90 rounded-2xl p-6 shadow-md border border-green-100 transition-transform hover:scale-105 hover:shadow-lg">
            <FiEye size={32} className="text-green-500 mb-2" />
            <h3 className="font-semibold text-green-700 text-lg mb-1">Live Insights</h3>
            <p className="text-gray-600 text-sm text-center">Visitors will soon view selected farm intelligence and live data shared by farmers.</p>
          </div>
          <div className="flex flex-col items-center bg-white/90 rounded-2xl p-6 shadow-md border border-green-100 transition-transform hover:scale-105 hover:shadow-lg">
            <FiUsers size={32} className="text-green-500 mb-2" />
            <h3 className="font-semibold text-green-700 text-lg mb-1">Future Vision</h3>
            <p className="text-gray-600 text-sm text-center">Today one farm&mdash;tomorrow, FarmLab could manage many greenhouses and sites.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
