"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FiTarget, FiMail, FiArrowRight, FiCheck } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { LanguageProvider, useI18n } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Internal component with translations
function RegisterContent() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthError, setOauthError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  useEffect(() => {
    if (error) {
      // Parse and display appropriate error messages
      if (error === "OAuthAccountNotLinked") {
        setOauthError(t("register.error.oauth"));
      } else {
        setOauthError(t("register.error.generic"));
      }
    }
  }, [error, t]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Set a custom callbackUrl to the profile completion page
      await signIn("google", { 
        callbackUrl: "/auth/complete-profile",
        redirect: true
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      setOauthError(t("register.error.google"));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Enhanced background with pattern and animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen px-4 py-6 lg:py-8">
        <div className="max-w-md w-full mx-auto">
          {/* FarmLab Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <FiTarget className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="ml-3 text-xl sm:text-2xl font-bold text-gray-900">FarmLab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3 tracking-tight">
              {t("register.heading")}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 animate-gradient-x">
                {t("register.headingHighlight")}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
              {t("register.subtitle")}
            </p>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Benefits Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">{t("register.benefitsTitle")}</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-green-500 mt-1">
                    <FiCheck />
                  </div>
                  <p className="ml-2 text-gray-600">{t("register.benefit1")}</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-green-500 mt-1">
                    <FiCheck />
                  </div>
                  <p className="ml-2 text-gray-600">{t("register.benefit2")}</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-green-500 mt-1">
                    <FiCheck />
                  </div>
                  <p className="ml-2 text-gray-600">{t("register.benefit3")}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {oauthError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
                {oauthError}
              </div>
            )}

            {/* OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-800 rounded-xl py-3 font-medium hover:shadow-md transition-all duration-200 mb-4"
            >
              <FaGoogle className="text-red-500" />
              {isLoading ? t("register.googleConnecting") : t("register.googleButton")}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("register.orDivider")}</span>
              </div>
            </div>

            {/* Email Button - Link to traditional registration */}
            <button
              onClick={() => router.push('/auth/register')}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FiMail />
              {t("register.emailButton")}
            </button>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("register.haveAccount")}{" "}
                <button 
                  onClick={() => router.push('/auth/signin')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {t("register.signInLink")} <FiArrowRight className="inline" size={14} />
                </button>
              </p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {t("register.termsNotice")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap the component with the LanguageProvider
export default function OAuthRegistration() {
  return (
    <LanguageProvider>
      <RegisterContent />
    </LanguageProvider>
  );
}