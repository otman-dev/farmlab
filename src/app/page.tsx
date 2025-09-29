"use client";

import Link from "next/link";
import { FiUsers, FiTrendingUp, FiTarget, FiHeart, FiBookOpen, FiCode, FiSearch } from "react-icons/fi";
import LaunchCountdown from "@/components/LaunchCountdown";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section - Mobile First Redesign */}
      <div className="relative overflow-hidden">
        {/* Enhanced background with subtle pattern and animation */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-16 lg:py-24">
          {/* Two column layout on larger screens */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Left column text content */}
            <div className="lg:col-span-7 text-center lg:text-left mb-10 lg:mb-0">
              {/* Logo and brand identity */}
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <FiTarget className="w-8 h-8 text-white" />
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">FarmLab</span>
              </div>
              
              {/* Main heading with animated gradient text */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                Smart Farming,
                <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 animate-gradient-x">
                  Real Results
                </span>
              </h1>
              
              {/* Subheading with mobile-optimized length */}
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                Join our transparent journey as we digitalize agriculture from the ground up. Experience how smart tech transforms sustainable farming.
              </p>
              
              {/* Mobile-optimized CTA buttons with improved accessibility */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 border-2 bg-green-600 border-green-600 text-white font-semibold rounded-xl hover:bg-green-700 hover:border-green-700 transition-all duration-200 shadow-lg text-center animate-pulse hover:animate-none"
                  aria-label="Join the FarmLab Community"
                >
                  <FiUsers className="w-5 h-5 mr-2" />
                  Join the Waitlist
                </Link>
                <Link
                  href="/auth/signin"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-green-500 hover:text-green-600 transition-all duration-200 text-center"
                  aria-label="Sign in to your account"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m13-8v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6"></path>
                  </svg>
                  Sign In
                </Link>

              </div>
            </div>
            
            {/* Right column with countdown and illustration */}
            <div className="lg:col-span-5">
              {/* Card with enhanced visual appeal */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 border border-gray-100">
                {/* Countdown with improved mobile sizing */}
                <div className="px-4 py-6">
                  <LaunchCountdown 
                    targetDate="2025-10-28T12:00:00" 
                    title="Launching Soon" 
                    subtitle="Our platform arrives in just 30 days!"
                    className="mb-0"
                  />
                </div>
                
                {/* Illustration or image placeholder */}
                <div className="relative h-48 sm:h-64 bg-gradient-to-r from-green-50 to-emerald-50 overflow-hidden">
                  {/* This would be an actual image in production */}
                  <div className="absolute inset-0 flex items-center justify-center text-green-700">
                    <div className="p-4 text-center">
                      <FiTarget className="w-12 h-12 mx-auto text-green-500 mb-2" />
                      <p className="text-sm font-medium">Farm management dashboard preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative curved shape divider for visual interest */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,0L60,5.3C120,11,240,21,360,26.7C480,32,600,32,720,26.7C840,21,960,11,1080,10.7C1200,11,1320,21,1380,26.7L1440,32L1440,60L1380,60C1320,60,1200,60,1080,60C960,60,840,60,720,60C600,60,480,60,360,60C240,60,120,60,60,60L0,60Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Animation styles moved to globals.css */}

      {/* Value Proposition Section - Mobile Optimized */}
      <div className="bg-white py-10 sm:py-12 md:py-16 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header with improved visual hierarchy */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-2 sm:mb-3">
              OUR APPROACH
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">
              Transforming Agriculture with IoT & AI
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              FarmLab connects traditional farming expertise with cutting-edge IoT devices and AI-powered solutions to create 
              sustainable, efficient, and data-driven agricultural operations.
            </p>
          </div>
          
          {/* Mobile-first card layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
            {/* Card 1 - Real-World Testing */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl text-blue-600 mr-4">
                    <FiTarget className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Real-World Testing</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We develop and test every feature on our working farm, ensuring solutions that deliver 
                  practical value in real agricultural settings.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Tested with actual crops and livestock
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Solutions proven in varying conditions
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Iterative improvements based on real results
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Card 2 - Data-Driven Insights */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
              <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl text-green-600 mr-4">
                    <FiTrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Data-Driven Insights</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Transform your farm with actionable insights from our integrated sensors, AI analysis, 
                  and comprehensive monitoring systems.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Real-time monitoring and alerts
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Predictive analytics for crop management
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Benchmarking against industry standards
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Card 3 - Community Platform */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 md:col-span-2 lg:col-span-1">
              <div className="p-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl text-purple-600 mr-4">
                    <FiUsers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Community Platform</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Connect with forward-thinking farmers, agricultural technologists, and researchers 
                  to share knowledge and best practices.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Access to expert knowledge network
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Collaboration opportunities with innovators
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Early access to new features and tools
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Mobile-friendly CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/comingsoon"
              className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 bg-white font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors duration-200"
            >
              Learn How It Works
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full mb-2">TESTIMONIALS</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">What Our Partners Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from our supporters and collaborators about their experience with FarmLab technology.
            </p>
          </div>

          {/* Mobile-optimized scrollable testimonials */}
          <div className="relative">
            <div className="-mx-4 sm:mx-0 pb-4 sm:pb-6 overflow-x-auto sm:overflow-visible scrollbar-hide snap-x snap-mandatory">
              <div className="inline-flex sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6 gap-4 px-4 sm:px-0">
                
                {/* Testimonial 1 - Atlantic Dunes CEO */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-80 sm:w-auto flex-shrink-0 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md">
                      AD
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">CEO</h4>
                      <p className="text-green-600 text-sm font-medium">Atlantic Dunes</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4 relative">
                    <svg className="absolute -top-2 left-4 text-blue-50 w-4 h-4" width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
                      <path d="M0 8 L8 0 L16 8 Z"></path>
                    </svg>
                    <p className="text-gray-700 italic">
                      &ldquo;We&apos;ve been supporting FarmLab with technical expertise since day one. I&apos;m truly impressed with the research and advancements they&apos;ve achieved in such a short time. Their innovative approach to agricultural technology is groundbreaking.&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">Technical Partner</span>
                  </div>
                </div>

                {/* Testimonial 2 - Origon Bio */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 w-72 sm:w-auto flex-shrink-0 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md">
                      OB
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">Origon Bio</h4>
                      <p className="text-green-600 text-sm font-medium">Agricultural Cooperation</p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 mb-4 relative">
                    <svg className="absolute -top-2 left-4 text-green-50 w-4 h-4" width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
                      <path d="M0 8 L8 0 L16 8 Z"></path>
                    </svg>
                    <p className="text-gray-700 italic">
                      &ldquo;As FarmLab&apos;s first collaborator and client, we&apos;ve been impressed by the positive changes their solutions have brought to our operations. The results are remarkable, and we&apos;re excited about the future potential of this technology.&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">First Client</span>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Scroll indicators for mobile */}
            <div className="flex justify-center mt-4 sm:hidden">
              <div className="flex space-x-1">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                ))}
              </div>
            </div>
            
            {/* Partners and logos section - social proof */}
            <div className="mt-16">
              <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
                Our Key Collaborators
              </p>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-2 max-w-md mx-auto">
                {/* These would be actual partner logos */}
                {['Atlantic Dunes', 'Origon Bio'].map((partner, idx) => (
                  <div key={idx} className="flex justify-center items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="h-8 flex items-center justify-center text-gray-600 font-semibold">
                      {partner}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Who Should Join */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-2 sm:mb-3">
              JOIN OUR COMMUNITY
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4">Who Should Join FarmLab?</h2>
            <p className="text-base sm:text-lg text-gray-600">FarmLab welcomes everyone interested in the future of agriculture</p>
          </div>
          {/* Mobile-optimized scrollable cards on small screens, grid on larger screens */}
          <div className="relative">
            {/* Scrollable container on mobile */}
            <div className="pb-6 -mx-4 sm:mx-0 overflow-x-auto sm:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
              <div className="inline-flex sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 gap-3 px-4 sm:px-0 min-w-full sm:min-w-0">
                {/* Card 1 - Farmers */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiTarget className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Farmers & Growers</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Modernize operations with IoT sensors and data-driven insights to increase yields and reduce costs.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Real-time monitoring
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Automated irrigation
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Yield optimization
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 2 - Technologists */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiCode className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Technologists</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Work with cutting-edge IoT, AI, and automation in real agricultural applications.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        IoT integration
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        API development
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Data analytics
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 3 - Researchers */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiSearch className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Researchers</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Access real agricultural data for research initiatives advancing sustainable farming.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Research partnerships
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Data access
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Field studies
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 4 - Students */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiBookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Students</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Learn about modern agriculture through hands-on examples and educational resources.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Educational content
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Case studies
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Learning resources
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 5 - Enthusiasts */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiHeart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Enthusiasts</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Follow our journey of transforming agriculture with modern technology and sustainability.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Behind-the-scenes access
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Educational insights
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Community discussions
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 6 - Industry */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiUsers className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Industry</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Collaborate on agricultural technologies integration and business opportunities.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Partnership opportunities
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Integration support
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Business development
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scroll indicators for mobile */}
            <div className="flex justify-center mt-4 sm:hidden">
              <div className="flex space-x-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Journey */}
      <div className="bg-white py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Our Journey So Far</h2>
            <p className="text-base sm:text-lg text-gray-600">From concept to real-world implementation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2023</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Founded</div>
              <div className="text-gray-600">FarmLab was established with a vision to revolutionize agriculture through technology.</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2024</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">First Deployment</div>
              <div className="text-gray-600">Successfully deployed our IoT system on our pilot farm with real-time monitoring.</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2025</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Platform Launch</div>
              <div className="text-gray-600">Full platform release with comprehensive farm management features and community access.</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Mobile Optimized with Interactive Tabs */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced section header with improved visual hierarchy */}
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full mb-2">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our platform and how we&apos;re transforming agriculture
            </p>
          </div>
          
          {/* Mobile-optimized accordion style FAQs with improved interactions */}
          <div className="space-y-3 mt-8">
            {/* FAQ Item 1 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <details className="group">
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer focus:outline-none">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">What technology do I need to use FarmLab?</h3>
                  <span className="ml-6 flex-shrink-0 bg-green-100 rounded-full p-1.5 text-green-600 group-open:rotate-180 transition-transform duration-300">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-600 bg-gray-50 border-t border-gray-100">
                  <p className="leading-relaxed">
                    FarmLab works with any modern smartphone, tablet or computer with internet access. Our advanced IoT sensors 
                    and AI-powered monitoring systems can be installed on your farm with minimal technical knowledge. We provide 
                    complete setup assistance and ongoing support to ensure you benefit from our intelligent farming solutions.
                  </p>
                  <div className="mt-3 flex items-center text-sm text-green-600">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    We offer full installation services for larger operations
                  </div>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <details className="group">
                <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                  <h3 className="text-lg font-medium text-gray-900">How long does it take to set up?</h3>
                  <span className="ml-6 flex-shrink-0 bg-green-100 rounded-full p-1.5 text-green-600 group-open:rotate-180 transition-transform duration-300">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-600 bg-gray-50 border-t border-gray-100">
                  <p className="leading-relaxed">
                    Initial setup can be completed in as little as 2-3 hours for basic monitoring. More comprehensive 
                    systems may take 1-2 days to install. Our team can provide remote or on-site assistance depending 
                    on your needs and location.
                  </p>
                  <div className="mt-3 flex items-center text-sm text-green-600">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Most customers are up and running within a day
                  </div>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <details className="group">
                <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                  <h3 className="text-lg font-medium text-gray-900">What size farms can benefit from FarmLab?</h3>
                  <span className="ml-6 flex-shrink-0 bg-green-100 rounded-full p-1.5 text-green-600 group-open:rotate-180 transition-transform duration-300">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-600 bg-gray-50 border-t border-gray-100">
                  <p className="leading-relaxed">
                    FarmLab is designed to scale from small urban farms to large commercial operations. We offer 
                    flexible packages tailored to your farm size, production type, and specific needs.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <div className="font-bold text-gray-900">Small Farms</div>
                      <p className="text-gray-600">As small as 0.1 hectares</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <div className="font-bold text-gray-900">Large Operations</div>
                      <p className="text-gray-600">Up to 2,000+ hectares</p>
                    </div>
                  </div>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 4 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <details className="group">
                <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                  <h3 className="text-lg font-medium text-gray-900">How much can I expect to save with FarmLab?</h3>
                  <span className="ml-6 flex-shrink-0 bg-green-100 rounded-full p-1.5 text-green-600 group-open:rotate-180 transition-transform duration-300">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-600 bg-gray-50 border-t border-gray-100">
                  <p className="leading-relaxed mb-3">
                    Our customers report significant improvements across multiple metrics:
                  </p>
                  <div className="flex flex-wrap -mx-2">
                    <div className="w-1/2 px-2 mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">15-30%</div>
                          <div className="text-xs text-gray-500">Water savings</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-1/2 px-2 mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">20-25%</div>
                          <div className="text-xs text-gray-500">Fertilizer reduction</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-1/2 px-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">8-12%</div>
                          <div className="text-xs text-gray-500">Yield increase</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-1/2 px-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">15-40%</div>
                          <div className="text-xs text-gray-500">Labor time saved</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
          
          {/* Enhanced CTA for more FAQs */}
          <div className="text-center mt-8">
            <Link href="/comingsoon" className="inline-flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200">
              View all FAQs
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA with Mobile Optimization */}
      <section className="relative overflow-hidden">
        {/* Background gradient with animated pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600">
          {/* Animated pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          
          {/* Moving shapes */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        </div>
        
        {/* Light edges */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
        
        <div className="relative py-16 sm:py-24">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            {/* Attention-grabbing badge */}
            <div className="inline-block mb-4 sm:mb-6 px-3 sm:px-4 py-1 bg-red-600 bg-opacity-90 backdrop-filter backdrop-blur-sm rounded-full shadow-lg animate-pulse">
              <span className="text-white text-sm font-semibold flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Limited Spots Available
              </span>
            </div>
            
            {/* Main heading with enhanced typography */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              Ready to Transform Your Farm?
            </h2>
            
            {/* Countdown integration */}
            <div className="mb-6 sm:mb-8">
              <LaunchCountdown 
                targetDate="2025-10-28T12:00:00" 
                title="Launch Day Countdown" 
                subtitle=""
                className="bg-transparent" 
              />
            </div>
            
            {/* Description with improved readability */}
            <p className="text-base sm:text-lg md:text-xl text-white text-opacity-90 mb-6 sm:mb-10 max-w-2xl mx-auto">
              Join the waitlist today and be among the first to experience the future of agriculture.
              Get early access to our beta platform.
            </p>
            
            {/* Mobile-optimized CTA button stack with enhanced styling */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {/* Primary CTA - Register with improved visual weight */}
              <Link
                href="/auth/register"
                className="group w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse hover:animate-none"
              >
                <FiUsers className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                <span>Join the Waitlist</span>
              </Link>
              

              
              {/* Sign In CTA with improved styling */}
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                aria-label="Sign in to your account"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m13-8v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6"></path>
                </svg>
                <span>Sign In</span>
              </Link>
            </div>
            
            {/* Enhanced social proof section with icons and improved mobile layout */}
            <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 xl:gap-6 max-w-5xl mx-auto px-2 sm:px-0">
              {/* Metric 1 - Users */}
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-5 flex flex-col items-center justify-center shadow-lg border border-green-700">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-800 bg-opacity-70 flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-green-200 mb-1">2000+</div>
                <div className="text-xs uppercase tracking-wide text-green-100 font-semibold leading-tight">Moroccan Farmers Interested</div>
              </div>
              
              {/* Metric 2 - Countries */}
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center shadow-lg border border-green-700">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-800 bg-opacity-70 flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path>
                  </svg>
                </div>
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-green-200 mb-1">100%</div>
                <div className="text-xs uppercase tracking-wide text-green-100 font-semibold">Moroccan Innovation</div>
              </div>
              
              {/* Metric 3 - Satisfaction */}
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center shadow-lg border border-green-700">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-800 bg-opacity-70 flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-green-200 mb-1">24/7</div>
                <div className="text-xs uppercase tracking-wide text-green-100 font-semibold">Farm Monitoring</div>
              </div>
              
              {/* Metric 4 - AI-IoT Solutions */}
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center shadow-lg border border-green-700">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-800 bg-opacity-70 flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-green-200 mb-1">10+</div>
                <div className="text-xs uppercase tracking-wide text-green-100 font-semibold">AI-Powered Solutions</div>
              </div>
            </div>
            
            {/* Waitlist CTA for interested users */}
            <div className="mt-12 max-w-sm sm:max-w-md mx-auto">
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-4 sm:p-6 text-green-100 shadow-lg border border-green-700">
                <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-3 sm:mb-4 shadow-lg animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-center mb-2">Get Early Access to FarmLab</h3>
                <p className="text-sm text-green-100 text-center mb-4">Join our comprehensive waitlist to receive exclusive updates, early access, and launch notifications.</p>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-opacity-90 transition-colors duration-200 w-full animate-pulse hover:animate-none"
                >
                  <FiUsers className="w-5 h-5 mr-2" />
                  Join the Waitlist Now
                </Link>
                <p className="text-xs mt-3 text-center text-green-100 font-medium">Complete profile helps us tailor FarmLab to your needs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
