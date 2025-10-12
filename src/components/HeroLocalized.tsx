"use client";

import React from "react";
import Link from "next/link";
import { FiUsers } from "react-icons/fi";
import LaunchCountdown from "@/components/LaunchCountdown";
import { useI18n } from "./LanguageProvider";

export default function HeroLocalized() {
  const { t } = useI18n();

  return (
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
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 border-2 bg-green-600 border-green-600 text-white font-semibold rounded-xl hover:bg-green-700 hover:border-green-700 transition-all duration-200 shadow-lg text-center"
              aria-label={t("hero.join")}
            >
              <FiUsers className="w-5 h-5 mr-2" />
              {t("hero.join")}
            </Link>
            <Link
              href="/auth/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-green-500 hover:text-green-600 transition-all duration-200 text-center"
              aria-label={t("hero.signin")}
            >
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
              <LaunchCountdown
                targetDate="2025-10-28T12:00:00"
                title="Launching Soon"
                className="mb-0"
              />
            </div>

            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-green-50 to-emerald-50 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-green-700">
                <div className="p-4 text-center">
                  <svg className="w-12 h-12 mx-auto text-green-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                  </svg>
                  <p className="text-sm font-medium">Farm management dashboard preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
