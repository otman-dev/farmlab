

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FiTarget, FiUser, FiLock, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { LanguageProvider, useI18n } from "@/components/LanguageProvider";
import AuthStatusBar from "@/components/AuthStatusBar";

// Internal component with translations
function SignInContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      if (errorParam === "OAuthAccountNotLinked") {
        setError(t("signin.error.oauth"));
      } else if (errorParam === "OAuthSignin") {
        setError("Unable to connect to Google authentication servers. Please try again or check your network connection.");
      } else {
        setError(t("signin.error.generic"));
      }
    }
  }, [searchParams, t]);

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-6 lg:py-8">
      <div className="w-full max-w-md mx-auto">
        {/* FarmLab Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <FiTarget className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="ml-3 text-xl sm:text-2xl font-bold text-gray-900">FarmLab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {t("signin.welcomeBack")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {t("signin.subtitle")}
          </p>
        </div>
        {/* Sign-in card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
          {/* Error display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-5 h-5 text-red-500 mr-3">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}
          {/* Google Sign in button - single instance */}
          <button
            onClick={async () => {
              try {
                setLoading(true);
                setError("");
                // Set a timeout to detect potential network issues
                const timeoutId = setTimeout(() => {
                  setError("Connection to Google servers is taking longer than expected. Please check your network connection.");
                  setLoading(false);
                }, 5000);
                await signIn("google", {
                  callbackUrl: "/",
                  redirect: true
                }).then(() => clearTimeout(timeoutId));
              } catch (error) {
                console.error("Google sign in error:", error);
                setError("Unable to connect to authentication servers. Please try again or check your network connection.");
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl py-4 font-medium hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 mb-5 transform hover:scale-105 text-lg border-2 border-blue-400 shadow-md"
          >
            <FaGoogle className="text-white text-xl" />
            <span className="font-bold">{loading ? t("signin.googleConnecting") : t("signin.googleButton")}</span>
          </button>
          {/* Recommended badge for Google signin */}
          <div className="flex justify-center -mt-3 mb-4">
            <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              Recommended Sign-in Method
            </div>
          </div>
          {/* Register info and Google signup CTA */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{t("signin.noAccount")}</p>
              {/* Info box for registration process */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 text-left">
                <h3 className="font-medium text-blue-800">Registration Process</h3>
                <p className="text-sm text-blue-700 mt-1">
                  All new users must complete our multistep registration process:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-1 text-sm text-blue-700">
                  <li>Sign in with Google</li>
                  <li>Complete the registration form</li>
                  <li>Get added to our waiting list</li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>The fastest way to join is to sign in with Google above.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapping with language provider
export default function SignInPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
        {/* Enhanced background with animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* AuthStatusBar for language switcher and logout */}
        <AuthStatusBar />
        
        {/* Content */}
        <SignInContent />
        
        {/* Animations */}
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
        `}</style>
      </div>
    </LanguageProvider>
  );
}