"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiTarget, FiUser, FiLock, FiMail, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { useI18n } from "@/components/LanguageProvider";

export default function RegisterContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      setError(t("register.error.generic"));
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const name = nameRef.current?.value || "";

    if (password.length < 6) {
      setError(t("register.error.passwordShort"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("register.error.generic"));
        setLoading(false);
        return;
      }

      // Success - redirect to complete profile page to collect more information
      router.push("/auth/complete-profile");
      
    } catch (error) {
      console.error("Registration error:", error);
      setError(t("register.error.unexpected"));
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-6 lg:py-8">
      <div className="w-full max-w-md mx-auto">
        {/* FarmLab Header */}
        <div className="mb-6 sm:mb-8 text-center">
          {/* Logo and brand identity */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <FiTarget className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <span className="ml-3 text-xl sm:text-2xl font-bold text-gray-900">FarmLab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            {t("register.title")}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            {t("register.subtitle")}
          </p>
        </div>
        
        {/* Registration card */}
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
          
          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block font-semibold mb-2 text-gray-800">
                {t("register.form.name")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                  placeholder={t("register.form.namePlaceholder")}
                />
              </div>
            </div>
            
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block font-semibold mb-2 text-gray-800">
                {t("register.form.email")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                  placeholder={t("register.form.emailPlaceholder")}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block font-semibold mb-2 text-gray-800">
                {t("register.form.password")}
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
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-12 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                  placeholder={t("register.form.passwordPlaceholder")}
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

            {/* Register button */}
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
                  {t("register.form.submitting")}
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                  {t("register.form.submit")}
                </>
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{t("register.alreadyHaveAccount")}</p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m13-8v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6"></path>
                </svg>
                {t("register.signIn")}
              </Link>
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
            {t("register.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}