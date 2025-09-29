"use client";

import Link from "next/link";
import React from "react";
import { FiTarget, FiActivity, FiTrendingUp, FiCheckCircle } from "react-icons/fi";
import LaunchCountdown from "@/components/LaunchCountdown";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
      {/* Enhanced background with pattern and animation - matching registration page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-6 lg:py-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* FarmLab Header - matching registration page branding */}
          <div className="mb-8 sm:mb-12 text-center">
            {/* Logo and brand identity */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mr-4">
                <FiTarget className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">FarmLab</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Something Amazing is
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 animate-gradient-x">
                Coming Soon
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              We&apos;re building the future of smart agriculture. Get ready to revolutionize your farming experience with cutting-edge IoT technology.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 text-green-700 bg-white bg-opacity-80 rounded-xl p-3 shadow-sm">
                <FiActivity className="w-5 h-5" />
                <span className="font-medium">Smart Farming</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-emerald-700 bg-white bg-opacity-80 rounded-xl p-3 shadow-sm">
                <FiTrendingUp className="w-5 h-5" />
                <span className="font-medium">Real-time Analytics</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-teal-700 bg-white bg-opacity-80 rounded-xl p-3 shadow-sm">
                <FiCheckCircle className="w-5 h-5" />
                <span className="font-medium">Automated Control</span>
              </div>
            </div>
          </div>
          
          {/* Launch Countdown - Enhanced container */}
          <div className="mb-8 sm:mb-12">
            <LaunchCountdown 
              targetDate="2025-10-28T12:00:00" 
              title="Platform Launch" 
              subtitle="Join thousands of farmers already on our waitlist. Be the first to experience the future of agriculture."
              className="transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-gray-100"
            />
          </div>
          
          {/* Call to action section */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md mb-4">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              You&apos;re on the Waitlist!
            </h2>
            <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
              Thank you for your patience as we put the finishing touches on our revolutionary platform. 
              We&apos;ll notify you the moment we&apos;re ready to transform your farming operations.
            </p>
            
            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-medium text-sm">Waitlist Status: Confirmed</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FiTarget className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
          
          {/* Additional info footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 px-4">
              Questions? Reach out to our team at{" "}
              <span className="text-green-600 font-medium">hello@farmlab.com</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
