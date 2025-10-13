'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiTarget } from "react-icons/fi";
import { LanguageProvider } from "@/components/LanguageProvider";

export default function OAuthRedirect() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [message, setMessage] = useState('Processing your authentication...');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const [retryCount, setRetryCount] = useState(0);
  
  // Log session and status on initial render
  useEffect(() => {
    console.log('OAuth Redirect Initial Render:', {
      status,
      sessionExists: !!session,
      from,
      searchParams: searchParams ? Object.fromEntries(searchParams.entries()) : {},
      sessionDetails: session ? {
        name: session.user?.name,
        email: session.user?.email,
        role: (session.user as any)?.role || 'undefined',
        hasImage: !!session.user?.image
      } : 'No session'
    });
    
    // Force session refresh on initial render
    const refreshSession = async () => {
      try {
        console.log('Forcing session refresh on OAuth redirect page load');
        await update();
        console.log('Session refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh session:', error);
      }
    };
    
    refreshSession();
  }, []);

  useEffect(() => {
    // Log status changes
    console.log('OAuth Redirect Status Change:', {
      newStatus: status,
      previousMessage: message,
      sessionExists: !!session,
      retryCount,
      sessionDetails: session ? {
        name: session.user?.name,
        email: session.user?.email,
        role: (session.user as any)?.role || 'undefined',
        hasImage: !!session.user?.image
      } : 'No session'
    });
    
    // Check if the user is authenticated and has a role
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any)?.role;
      setIsRedirecting(true);
      
      console.log('OAuth Redirect: User authenticated with role', role, {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ? 'exists' : 'none'
      });
      
      // Create token with user and role info for better context passing
      const tokenData = {
        email: session.user.email,
        name: session.user.name,
        role: role || 'pending',
        provider: 'google',
        hasImage: !!session.user.image,
        timestamp: Date.now()
      };
      
      // Always direct users with pending role to the multistep registration form
      if (role === 'pending') {
        setMessage('Preparing your registration form...');
        // Immediately redirect to profile completion page with more debugging info
        console.log('OAuth Redirect: Redirecting pending user to complete profile page');
        const redirectUrl = `/auth/complete-profile?forced=true&from=oauth_redirect&debug=${Date.now()}&token=${encodeURIComponent(JSON.stringify(tokenData))}`;
        console.log('OAuth Redirect: Redirect URL =', redirectUrl);
        
        // Add a small delay for better UX
        setTimeout(() => {
          router.replace(redirectUrl);
        }, 1000);
      } else if (role === 'waiting_list') {
        setMessage('Welcome back! Redirecting to waiting list area...');
        console.log('OAuth Redirect: Redirecting waiting_list user to comingsoon');
        // Redirect to the coming soon page with a small delay
        setTimeout(() => {
          router.push('/comingsoon');
        }, 1000);
      } else if (['admin', 'manager', 'sponsor', 'visitor'].includes(role)) {
        // Redirect based on role
        setMessage(`Welcome ${session.user?.name}! Preparing your dashboard...`);
        console.log(`OAuth Redirect: Redirecting ${role} user to dashboard`);
        
        // Add a small delay for better UX
        setTimeout(() => {
          switch (role) {
            case 'admin':
              router.push('/adminDashboard');
              break;
            case 'manager':
              router.push('/managerDashboard');
              break;
            case 'sponsor':
              router.push('/sponsorDashboard');
              break;
            case 'visitor':
              router.push('/visitorDashboard');
              break;
          }
        }, 1000);
      } else {
        // If no valid role is found, force them to complete profile
        setMessage('Preparing your profile setup...');
        console.log('OAuth Redirect: User has invalid or missing role, redirecting to complete profile');
        const redirectUrl = `/auth/complete-profile?forced=true&from=oauth_redirect_norole&debug=${Date.now()}&token=${encodeURIComponent(JSON.stringify({...tokenData, role: 'pending'}))}`;
        
        // Add a small delay for better UX
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      }
    } else if (status === 'unauthenticated') {
      setMessage('Authentication failed. Redirecting to sign in...');
      console.log('OAuth Redirect: User is unauthenticated, redirecting to sign in');
      // Redirect to sign in with a small delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 1500);
    } else if (status === 'loading') {
      console.log('OAuth Redirect: Session still loading...');
      
      // If loading takes too long, we'll try to force refresh the session
      if (retryCount < 3) {
        const timer = setTimeout(() => {
          console.log(`OAuth Redirect: Session still loading after ${(retryCount + 1) * 2} seconds, forcing refresh`);
          update();
          setRetryCount(prev => prev + 1);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [status, session, router, message, retryCount, update]);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <FiTarget className="w-8 h-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">FarmLab</span>
          </div>
          
          <div className="animate-spin mx-auto mb-6 w-12 h-12 border-4 border-t-green-500 border-green-200 rounded-full"></div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isRedirecting ? "Redirecting..." : "Authentication Success"}
          </h2>
          
          <p className="text-gray-600 text-lg mb-4">
            {message}
          </p>
          
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-6">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 animate-progress-bar"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-bar {
          animation: progress-bar 2s ease-in-out forwards;
        }
      `}</style>
    </LanguageProvider>
  );
}