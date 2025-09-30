"use client";

import { FiTarget } from "react-icons/fi";

// Beautiful loading component that matches the website's design theme
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements matching the main site */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      {/* Loading content */}
      <div className="relative text-center">
        {/* Logo with pulsing animation */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg animate-pulse">
            <FiTarget className="w-10 h-10 text-white" />
          </div>
          <span className="ml-4 text-3xl font-bold text-gray-900">FarmLab</span>
        </div>
        
        {/* Loading text with gradient animation */}
        <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 animate-gradient-x mb-6">
          Loading your dashboard...
        </h2>
        
        {/* Animated loading bar */}
        <div className="w-64 h-2 bg-green-100 rounded-full overflow-hidden shadow-inner mx-auto mb-4">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-loading-bar shadow-sm"></div>
        </div>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce animation-delay-400"></div>
        </div>
        
        {/* Optional loading message */}
        <p className="mt-6 text-gray-600 text-sm font-medium">
          Preparing your smart farming experience
        </p>
      </div>
    </div>
  );
}
