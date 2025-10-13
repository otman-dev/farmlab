"use client";

import Link from "next/link";
import React from "react";
import { FiTarget, FiActivity, FiTrendingUp, FiCheckCircle, FiUsers, FiGlobe, FiStar, FiArrowRight, FiMail } from "react-icons/fi";
import LaunchCountdown from "@/components/LaunchCountdown";
import Footer from "@/components/Footer";
import AuthStatusBar from "@/components/AuthStatusBar";

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
      {/* Auth status bar in top right corner */}
      <AuthStatusBar />
      
      {/* Enhanced background with pattern and animation - matching home page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            {/* Logo and brand identity */}
            <div className="flex items-center justify-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-xl">
                <FiTarget className="w-10 h-10 text-white" />
              </div>
              <span className="ml-4 text-3xl font-bold text-gray-900">FarmLab</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
              The Future of
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 animate-gradient-x">
                Smart Farming
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-2">
                is Almost Here
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              Join thousands of forward-thinking farmers already on our waitlist. Be among the first to experience 
              the revolutionary platform that will transform agriculture forever.
            </p>
            
            {/* Feature highlights with enhanced styling */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <FiActivity className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Real-Time Monitoring</h3>
                <p className="text-gray-600 text-sm">24/7 IoT sensors tracking every aspect of your farm</p>
              </div>
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <FiTrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">AI-Powered Analytics</h3>
                <p className="text-gray-600 text-sm">Intelligent insights to optimize your operations</p>
              </div>
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <FiCheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Automated Control</h3>
                <p className="text-gray-600 text-sm">Smart automation that works while you sleep</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Launch Countdown Section */}
      <div className="relative py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full mb-4">LAUNCHING SOON</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Platform Launch Countdown</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The wait is almost over. Our revolutionary smart farming platform launches soon.
            </p>
          </div>
          
          <LaunchCountdown 
            targetDate="2025-10-28T12:00:00" 
            title="Official Launch" 
            subtitle="Be ready to transform your farming operations"
            className="transform hover:scale-105 transition-all duration-300"
          />
        </div>
      </div>
      
      {/* What's Coming Section */}
      <div className="relative py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full mb-4">WHAT&apos;S COMING</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Revolutionary Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience the future of agriculture with cutting-edge technology designed for modern farmers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 border border-gray-100 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiGlobe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Farm Network</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with farmers worldwide, share insights, and learn from the global agricultural community.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 border border-gray-100 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiStar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI-driven insights that predict optimal planting times, irrigation schedules, and harvest windows.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 border border-gray-100 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Support</h3>
              <p className="text-gray-600 leading-relaxed">
                24/7 access to agricultural experts, technical support, and a thriving community of innovators.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Waitlist Status Section */}
      <div className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg mb-6 animate-pulse">
              <FiCheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              🎉 You&apos;re on the Waitlist!
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Congratulations! You&apos;re now part of an exclusive group of forward-thinking farmers who will be 
              the first to experience the future of agriculture. We&apos;ll notify you the moment we launch.
            </p>
            
            {/* Status indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-800">Waitlist Confirmed</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiMail className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-blue-800">Updates Enabled</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FiStar className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-purple-800">Early Access Ready</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiTarget className="w-5 h-5 mr-2" />
                Back to Home
                <FiArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FiMail className="w-5 h-5 mr-2" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Community Stats */}
      <div className="relative py-16 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Join the Growing Community</h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Thousands of farmers worldwide are already preparing for the agricultural revolution.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">2000+</div>
              <div className="text-green-100 font-medium">Farmers on Waitlist</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">10+</div>
              <div className="text-green-100 font-medium">AI-Powered Solutions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-green-100 font-medium">Platform Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">100%</div>
              <div className="text-green-100 font-medium">Moroccan Innovation</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Add custom animations matching home page */}
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
