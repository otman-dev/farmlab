

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FiTarget, FiUser, FiLock, FiCheckCircle } from "react-icons/fi";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
      setLoading(false);
      return;
    }

    // Redirect to dashboard - middleware will handle role-based routing
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
      {/* Enhanced background with pattern and animation - matching other pages */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative flex items-center justify-center min-h-screen px-4 py-6 lg:py-8">
        <div className="w-full max-w-md mx-auto">
          {/* FarmLab Header - matching other pages branding */}
          <div className="mb-6 sm:mb-8 text-center">
            {/* Logo and brand identity */}
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <FiTarget className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <span className="ml-3 text-xl sm:text-2xl font-bold text-gray-900">FarmLab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Sign in to your smart farming dashboard
            </p>
          </div>
          
          {/* Sign-in card with enhanced styling */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
            {/* Error display with improved styling */}
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
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email field with enhanced styling */}
              <div>
                <label htmlFor="email" className="block font-semibold mb-2 text-gray-800">
                  Email Address
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password field with enhanced styling */}
              <div>
                <label htmlFor="password" className="block font-semibold mb-2 text-gray-800">
                  Password
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Sign in button with enhanced styling */}
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
                    Signing in...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>
            
            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Don&apos;t have an account yet?</p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <FiTarget className="w-5 h-5 mr-2" />
                  Join FarmLab
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
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      
      {/* Add custom animations matching other pages */}
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
  );
}