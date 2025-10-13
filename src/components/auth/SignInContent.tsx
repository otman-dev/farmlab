"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FiTarget, FiUser, FiLock, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useI18n } from "@/components/LanguageProvider";

export default function SignInContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      if (errorParam === "OAuthAccountNotLinked") {
        setError(t("signin.error.oauth"));
      } else {
        setError(t("signin.error.generic"));
      }
    }
  }, [searchParams, t]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };
        
  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-6 lg:py-8">
      <div className="w-full max-w-md mx-auto">
        {/* FarmLab Header - matching other pages branding */}
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

        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
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

          {/* Info banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 text-blue-500 mr-3 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">
                  Sign in with Google to access your account instantly - no email or password needed!
                </p>
              </div>
            </div>
          </div>

          {/* Google Sign in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-800 rounded-xl py-3 sm:py-4 font-medium hover:shadow-md transition-all duration-200 mb-6"
          >
            <FaGoogle className="text-red-500" />
            {loading ? t("signin.googleConnecting") : t("signin.googleButton")}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-gray-600 mb-2">{t("signin.noAccount")}</p>
              <p className="text-sm text-gray-500 mb-4">Google authentication works for both sign in and registration!</p>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FiTarget className="w-5 h-5 mr-2" />
                {t("signin.joinButton")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            {t("signin.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Animated background styles
const styles = {
  animationKeyframes: `
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
  `,
  animationClass: `
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
  `
};