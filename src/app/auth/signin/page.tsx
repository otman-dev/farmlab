

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      if (errorParam === "OAuthAccountNotLinked") {
        setError(t("signin.error.oauth"));
      } else if (errorParam === "OAuthSignin") {
        setError("Unable to connect to Google authentication servers. Please try email login or check your network connection.");
      } else {
        setError(t("signin.error.generic"));
      }
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    try {
      const result = await signIn("credentials", {
        redirect: false,
        callbackUrl: "",
        email,
        password,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? t("signin.error.credentials") : result.error);
        setLoading(false);
        return;
      }

      if (result?.url) {
        console.log("Signin successful, redirecting to:", result.url);
        router.push(result.url);
      } else {
        console.log("No redirect URL provided, falling back to root");
        router.push("/");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setError(t("signin.error.unexpected"));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      setError("Unable to connect to authentication servers. Please try using email login instead or check your network connection.");
      setLoading(false);
    }
  };

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
          
          {/* Google Sign in button - more prominent */}
          <button
            onClick={handleGoogleSignIn}
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
          
          {/* Connectivity warning if error param is OAuthSignin */}
          {searchParams?.get("error") === "OAuthSignin" && (
            <div className="mb-6 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <div className="flex">
                <svg className="h-4 w-4 text-amber-600 mt-0.5 mr-1.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Network connectivity issue detected. Please try email login below instead.</span>
              </div>
            </div>
          )}
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t("signin.emailOption")}</span>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block font-semibold mb-2 text-gray-800">
                {t("signin.emailLabel")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                  placeholder={t("signin.emailPlaceholder")}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block font-semibold mb-2 text-gray-800">
                {t("signin.passwordLabel")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-12 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                  placeholder={t("signin.passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? t("form.password.hide") : t("form.password.show")}
                  title={showPassword ? t("form.password.hide") : t("form.password.show")}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg text-base sm:text-lg ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t("signin.signingIn")}
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                  {t("signin.signInButton")}
                </>
              )}
            </button>
          </form>
          
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
              
              <button
                onClick={handleGoogleSignIn}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaGoogle className="w-4 h-4 mr-2" />
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
        
        {/* Back to home link */}
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