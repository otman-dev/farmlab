"use client";

import React from "react";
import Link from "next/link";
import { FiUsers, FiTrendingUp, FiTarget, FiHeart, FiBookOpen, FiCode, FiSearch, FiMonitor, FiMapPin, FiMail, FiBarChart2 } from "react-icons/fi";
import LaunchCountdown from "@/components/LaunchCountdown";
import Footer from "@/components/Footer";
import { useI18n } from "./LanguageProvider";

export default function RootContent() {
  const { t } = useI18n();

  return (
    <>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-16 lg:py-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 text-center lg:text-left mb-10 lg:mb-0">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">FarmLab</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              {t("hero.title.line1")}
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 animate-gradient-x">
                {t("hero.title.line2")}
              </span>
            </h1>

            <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link href="/auth/register" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 border-2 bg-green-600 border-green-600 text-white font-semibold rounded-xl hover:bg-green-700 hover:border-green-700 transition-all duration-200 shadow-lg text-center" aria-label={t("hero.join")}>
                <FiUsers className="w-5 h-5 mr-2" />
                {t("hero.join")}
              </Link>
              <Link href="/auth/signin" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-green-500 hover:text-green-600 transition-all duration-200 text-center" aria-label={t("hero.signin")}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m13-8v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6"></path>
                </svg>
                {t("hero.signin")}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 border border-gray-100">
              <div className="px-4 py-6">
                <LaunchCountdown targetDate="2025-10-28T12:00:00" title={t("countdown.title")} className="mb-0" />
              </div>

              <div className="relative h-48 sm:h-64 bg-gradient-to-r from-green-50 to-emerald-50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-green-700">
                  <div className="p-4 text-center">
                    <svg className="w-12 h-12 mx-auto text-green-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                    </svg>
                    <p className="text-sm font-medium">{t("preview.card")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="bg-white py-10 sm:py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-2 sm:mb-3">
              {t("approach.badge")}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">{t("approach.heading")}</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">{t("approach.sub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl text-blue-600 mr-4">
                    <FiTarget className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t("card1.title")}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">{t("card1.body")}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
              <div className="p-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl text-green-600 mr-4">
                    <FiTrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t("card2.title")}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">{t("card2.body")}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 md:col-span-2 lg:col-span-1">
              <div className="p-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl text-purple-600 mr-4">
                    <FiUsers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{t("card3.title")}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">{t("card3.body")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full mb-2">{t("testimonials.badge")}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t("testimonials.heading")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("testimonials.subheading")}
            </p>
          </div>

          {/* Mobile-optimized scrollable testimonials */}
          <div className="relative">
            <div className="-mx-4 sm:mx-0 pb-4 sm:pb-6 overflow-x-auto sm:overflow-visible scrollbar-hide snap-x snap-mandatory">
              <div className="inline-flex sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-6 gap-4 px-4 sm:px-0">
                
                {/* Testimonial 1 - Atlantic Dunes CEO */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-80 sm:w-auto flex-shrink-0 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md">
                      AD
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{t("testimonial1.role")}</h4>
                      <p className="text-green-600 text-sm font-medium">{t("testimonial1.company")}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4 relative">
                    <svg className="absolute -top-2 left-4 text-blue-50 w-4 h-4" width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
                      <path d="M0 8 L8 0 L16 8 Z"></path>
                    </svg>
                    <p className="text-gray-700 italic">
                      {t("testimonial1.quote")}
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
                    <span className="text-sm text-gray-500">{t("testimonial1.relation")}</span>
                  </div>
                </div>

                {/* Testimonial 2 - Origon Bio */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 w-72 sm:w-auto flex-shrink-0 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md">
                      OB
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{t("testimonial2.role")}</h4>
                      <p className="text-green-600 text-sm font-medium">{t("testimonial2.company")}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 mb-4 relative">
                    <svg className="absolute -top-2 left-4 text-green-50 w-4 h-4" width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
                      <path d="M0 8 L8 0 L16 8 Z"></path>
                    </svg>
                    <p className="text-gray-700 italic">
                      {t("testimonial2.quote")}
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
                    <span className="text-sm text-gray-500">{t("testimonial2.relation")}</span>
                  </div>
                </div>

                {/* Testimonial 3 - Domaine Moutaouafiq */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 w-72 sm:w-auto flex-shrink-0 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 shadow-md">
                      DM
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{t("testimonial3.role")}</h4>
                      <p className="text-green-600 text-sm font-medium">{t("testimonial3.company")}</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 mb-4 relative">
                    <svg className="absolute -top-2 left-4 text-purple-50 w-4 h-4" width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
                      <path d="M0 8 L8 0 L16 8 Z"></path>
                    </svg>
                    <p className="text-gray-700 italic">
                      {t("testimonial3.quote")}
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
                    <span className="text-sm text-gray-500">{t("testimonial3.relation")}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Partners and logos section - social proof */}
            <div className="mt-16">
              <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
                {t("partners.title")}
              </p>
              <div className="grid grid-cols-3 gap-4 md:grid-cols-3 max-w-2xl mx-auto">
                {/* These would be actual partner logos */}
                {[t("partners.partner1"), t("partners.partner2"), t("partners.partner3")].map((partner, idx) => (
                  <div key={idx} className="flex justify-center items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="h-6 flex items-center justify-center text-gray-600 font-semibold text-sm">
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
              {t("join.badge")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4">{t("join.heading")}</h2>
            <p className="text-base sm:text-lg text-gray-600 mx-auto max-w-3xl">{t("join.subheading")}</p>
          </div>
          {/* Mobile-optimized scrollable cards on small screens, grid on larger screens */}
          <div className="relative">
            {/* Scrollable container on mobile */}
            <div className="pb-6 -mx-4 sm:mx-0 overflow-x-auto sm:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
              <div className="inline-flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 px-4 sm:px-0 min-w-full sm:min-w-0 mx-auto max-w-5xl">
                {/* Card 1 - Farmers */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiTarget className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t("joinCard1.title")}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {t("joinCard1.body")}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mt-auto">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard1.feature1")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard1.feature2")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard1.feature3")}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 2 - Technologists */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiCode className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t("joinCard2.title")}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {t("joinCard2.body")}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mt-auto">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard2.feature1")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard2.feature2")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard2.feature3")}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 3 - Researchers */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiSearch className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t("joinCard3.title")}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {t("joinCard3.body")}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mt-auto">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard3.feature1")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard3.feature2")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard3.feature3")}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 4 - Educators & Students */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiBookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t("joinCard4.title")}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {t("joinCard4.body")}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mt-auto">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard4.feature1")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard4.feature2")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard4.feature3")}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 5 - Policy Makers */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiTarget className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t("joinCard5.title")}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {t("joinCard5.body")}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mt-auto">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard5.feature1")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard5.feature2")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard5.feature3")}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Card 6 - Industry */}
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-5 border border-gray-100 w-72 sm:w-auto flex-shrink-0 flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-md mb-0 mr-4">
                      <FiBarChart2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{t("joinCard6.title")}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {t("joinCard6.body")}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 mt-auto">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard6.feature1")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard6.feature2")}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {t("joinCard6.feature3")}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Journey - Enhanced Mobile Experience */}
      <div className="bg-gradient-to-b from-white to-gray-50 py-10 sm:py-12 md:py-16 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full mb-2">{t("journey.badge")}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{t("journey.heading")}</h2>
            <p className="text-base sm:text-lg text-gray-600">{t("journey.subheading")}</p>
          </div>
          
          {/* Mobile-optimized timeline cards */}
          <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-3 md:gap-6 lg:gap-8">
            {/* 2023 - Founded */}
            <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
              
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-3">{t("milestone1.year")}</div>
                <div className="text-xl font-bold text-gray-900 mb-3">{t("milestone1.title")}</div>
                <div className="text-gray-600 leading-relaxed">{t("milestone1.description")}</div>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
            </div>
            
            {/* 2024 - First Deployment */}
            <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
              
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-3">{t("milestone2.year")}</div>
                <div className="text-xl font-bold text-gray-900 mb-3">{t("milestone2.title")}</div>
                <div className="text-gray-600 leading-relaxed">{t("milestone2.description")}</div>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-full"></div>
              </div>
            </div>
            
            {/* 2025 - Platform Launch */}
            <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-3">{t("milestone3.year")}</div>
                <div className="text-xl font-bold text-gray-900 mb-3">{t("milestone3.title")}</div>
                <div className="text-gray-600 leading-relaxed">{t("milestone3.description")}</div>
              </div>
              
              {/* Progress indicator - animated for current year */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
              
              {/* "Live" badge */}
              <div className="absolute -top-2 -right-2">
                <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                  {t("milestone3.badge")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full mb-2">{t("faq.badge")}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {t("faq.heading")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("faq.subheading")}
            </p>
          </div>
          
          {/* FAQ Accordion */}
          <div className="space-y-3 mt-8">
            {/* FAQ Item 1 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <details className="group">
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer focus:outline-none">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">{t("faq1.question")}</h3>
                  <span className="ml-6 flex-shrink-0 bg-green-100 rounded-full p-1.5 text-green-600 group-open:rotate-180 transition-transform duration-300">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-600 bg-gray-50 border-t border-gray-100">
                  <p className="leading-relaxed">{t("faq1.answer")}</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <details className="group">
                <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                  <h3 className="text-lg font-medium text-gray-900">{t("faq2.question")}</h3>
                  <span className="ml-6 flex-shrink-0 bg-green-100 rounded-full p-1.5 text-green-600 group-open:rotate-180 transition-transform duration-300">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-600 bg-gray-50 border-t border-gray-100">
                  <p className="leading-relaxed">{t("faq2.answer")}</p>
                </div>
              </details>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <details className="group">
                <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none">
                  <h3 className="text-lg font-medium text-gray-900">{t("faq3.question")}</h3>
                  <span className="ml-6 flex-shrink-0 bg-green-100 rounded-full p-1.5 text-green-600 group-open:rotate-180 transition-transform duration-300">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-600 bg-gray-50 border-t border-gray-100">
                  <p className="leading-relaxed">{t("faq3.answer")}</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
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
                {t("cta.badge")}
              </span>
            </div>
            
            {/* Main heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
              {t("cta.heading")}
            </h2>
            
            {/* Countdown integration */}
            <div className="mb-6 sm:mb-8">
              <LaunchCountdown 
                targetDate="2025-10-28T12:00:00" 
                title={t("cta.countdown")} 
                subtitle=""
                className="bg-transparent" 
              />
            </div>
            
            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-white text-opacity-90 mb-6 sm:mb-10 max-w-2xl mx-auto">
              {t("cta.description")}
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/auth/register"
                className="group w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse hover:animate-none"
              >
                <FiUsers className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                <span>{t("cta.primary")}</span>
              </Link>
              
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                aria-label={t("cta.secondary")}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m13-8v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6"></path>
                </svg>
                <span>{t("cta.secondary")}</span>
              </Link>
            </div>
            
            {/* Stats section */}
            <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 xl:gap-6 max-w-5xl mx-auto px-2 sm:px-0">
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-5 flex flex-col items-center justify-center shadow-lg border border-green-700">
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-green-200 mb-1">{t("stats.stat1.value")}</div>
                <div className="text-xs uppercase tracking-wide text-green-100 font-semibold leading-tight">{t("stats.stat1.label")}</div>
              </div>
              
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center shadow-lg border border-green-700">
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-green-200 mb-1">{t("stats.stat2.value")}</div>
                <div className="text-xs uppercase tracking-wide text-green-100 font-semibold">{t("stats.stat2.label")}</div>
              </div>
              
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center shadow-lg border border-green-700">
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-green-200 mb-1">{t("stats.stat3.value")}</div>
                <div className="text-xs uppercase tracking-wide text-green-100 font-semibold">{t("stats.stat3.label")}</div>
              </div>
              
              <div className="bg-green-900 bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl p-4 flex flex-col items-center justify-center shadow-lg border border-green-700">
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-green-200 mb-1">{t("stats.stat4.value")}</div>
                <div className="text-xs uppercase tracking-wide text-green-100 font-semibold">{t("stats.stat4.label")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
