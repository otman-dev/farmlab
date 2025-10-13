

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LanguageProvider } from "@/components/LanguageProvider";
import AuthStatusBar from "@/components/AuthStatusBar";

export default function RegisterPage() {
  const router = useRouter();
  
  // Automatically redirect to Google OAuth flow
  useEffect(() => {
    // Begin Google OAuth flow immediately
    const startOAuth = async () => {
      try {
        console.log('Register Page: Redirecting to Google OAuth flow');
        // Use oauth-redirect as callback to ensure proper role-based routing
        await signIn('google', { callbackUrl: "/auth/oauth-redirect" });
      } catch (error) {
        console.error('Failed to start Google OAuth flow:', error);
        // Fall back to signin page if OAuth redirect fails
        router.replace('/auth/signin');
      }
    };
    
    startOAuth();
  }, [router]);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* AuthStatusBar for language switcher and logout */}
        <AuthStatusBar />
        
        {/* Loading state before redirect */}
        <div className="relative flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Starting Registration</h2>
            <p className="text-gray-600 text-lg mb-4">Redirecting to Google Sign-In...</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
              <p className="text-sm text-blue-800">
                <strong>Quick & Easy:</strong> Sign in with your Google account - no need to create a password!
              </p>
            </div>
          </div>
        </div>
        
        {/* Add custom animations */}
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