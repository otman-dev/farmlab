"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiTarget, FiUser, FiCheckCircle, FiArrowRight, FiLogOut } from "react-icons/fi";
import LogoutButton from "@/components/LogoutButton";
import MultiStepRegistration from "@/components/MultiStepRegistration";
import { LanguageProvider, useI18n } from "@/components/LanguageProvider";
import AuthStatusBar from "@/components/AuthStatusBar";

function CompleteProfileContent() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<any>(null);
  const [dbConnectionError, setDbConnectionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [isForced, setIsForced] = useState(false);
  const [redirectSource, setRedirectSource] = useState<string | null>(null);
  const [tokenPresent, setTokenPresent] = useState(false);

  useEffect(() => {
    // This function captures and saves the token data
    const saveToken = () => {
      // Check URL parameters for forced redirect
      const forcedParam = searchParams?.get('forced');
      const fromParam = searchParams?.get('from');
      const tokenParam = searchParams?.get('token');
      
      console.log('CompleteProfilePage: Checking URL parameters', { forcedParam, fromParam, hasToken: !!tokenParam });
      
      // If we have a token parameter, this is a direct redirect from NextAuth
      let isPendingFromToken = false;
      
      // Always check for token in the URL first
      if (tokenParam) {
        try {
          const parsedToken = JSON.parse(decodeURIComponent(tokenParam));
          console.log('CompleteProfilePage: Successfully parsed token', parsedToken);
          
          // Store the token in localStorage to persist it
          localStorage.setItem('pendingUserToken', tokenParam);
          localStorage.setItem('pendingUserCompletion', 'true');
          localStorage.setItem('pendingUserEmail', parsedToken.email || '');
          localStorage.setItem('pendingTimestamp', Date.now().toString());
          
          // Add specific auth data that will help with form submission
          localStorage.setItem('authTokenRaw', JSON.stringify(parsedToken));
          
          // Store the token data for use in the form
          setTokenData(parsedToken);
          setTokenPresent(true);
          
          if (parsedToken.role === 'pending') {
            isPendingFromToken = true;
            console.log('Direct redirect from NextAuth with pending role token');
          }
          
          // Set a cookie as well to help with API authentication
          document.cookie = `auth_token=${encodeURIComponent(JSON.stringify(parsedToken))};path=/;max-age=600`;
        } catch (e) {
          console.error('Failed to parse token param:', e);
        }
      } 
      // If no token in URL, try to get it from localStorage
      else {
        try {
          const storedToken = localStorage.getItem('pendingUserToken');
          const hasPendingFlag = localStorage.getItem('pendingUserCompletion') === 'true';
          const timestamp = parseInt(localStorage.getItem('pendingTimestamp') || '0', 10);
          const tokenAge = Date.now() - timestamp;
          
          // Only use the token if it's less than 10 minutes old
          if (storedToken && hasPendingFlag && tokenAge < 10 * 60 * 1000) {
            try {
              const parsedToken = JSON.parse(decodeURIComponent(storedToken));
              setTokenData(parsedToken);
              setTokenPresent(true);
              isPendingFromToken = true;
              console.log('Using stored token from localStorage', parsedToken);
              
              // Ensure cookie is set for API calls
              document.cookie = `auth_token=${encodeURIComponent(JSON.stringify(parsedToken))};path=/;max-age=600`;
              
              // Make sure the raw token is also stored
              localStorage.setItem('authTokenRaw', JSON.stringify(parsedToken));
            } catch (e) {
              console.error('Failed to parse stored token:', e);
            }
          } else if (hasPendingFlag) {
            isPendingFromToken = true;
            console.log('Found pending user flag in localStorage (no valid token)');
          }
        } catch (e) {
          console.error('Error accessing localStorage:', e);
        }
      }
      
      if (forcedParam === 'true' || isPendingFromToken) {
        console.log(`Profile completion forced from source: ${fromParam || 'localStorage flag' || 'unknown'}`);
        setIsForced(true);
        setRedirectSource(fromParam);
      }
    };
    
    // Call the function to save token data
    saveToken();
    
    // Add event listener for beforeunload to remind user to complete profile
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if profile is still pending and isForced flag is true
      const isProfileCompleted = localStorage.getItem('profileCompleted') === 'true';
      
      // Only show the warning if profile is forced to be completed AND not yet completed
      if (isForced && !isProfileCompleted) {
        e.preventDefault();
        e.returnValue = 'You need to complete your profile before leaving. Are you sure you want to exit?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [searchParams, isForced]);

  useEffect(() => {
    // Check authentication status - but allow pending users from token data
    if (status === "unauthenticated" && !tokenPresent) {
      console.log('User is unauthenticated and no token data present, redirecting to signin');
      router.replace("/auth/signin");
      return;
    }

    if (status === "authenticated" && session) {
      // Check if user profile is complete (this logic would depend on your schema)
      const checkProfileCompletion = async () => {
        try {
          console.log("Checking profile completion status");
          const res = await fetch("/api/auth/check-profile", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          if (res.ok) {
            const data = await res.json();
            
            // Reset any previous connection errors since we got a successful response
            setDbConnectionError(false);
            setErrorDetails(null);
            
            // Check if we have a forceRedirect flag from the API
            if (data.forceRedirect) {
              console.log("API indicated forced redirect to profile completion");
              setProfileComplete(false);
            } else {
              setProfileComplete(data.isComplete);
            }
            
            // Directly check the user role from session if available
            const userRole = (session.user as any)?.role;
            if (userRole === 'pending') {
              console.log("User has pending role, forcing profile completion");
              setProfileComplete(false);
              setIsForced(true);
            }
          } else if (res.status === 503) {
            // Service Unavailable - likely database connection issue
            const data = await res.json();
            console.error("Database connection issue detected:", data);
            setDbConnectionError(true);
            setErrorDetails(data.message || 'Database connection error');
          }
        } catch (error) {
          console.error("Failed to check profile status:", error);
          // Check if this might be a network or database connection issue
          if (error instanceof TypeError && error.message.includes('fetch')) {
            setDbConnectionError(true);
            setErrorDetails('Network connection issue');
          } else if (typeof error === 'object' && error !== null && 'message' in error) {
            const errMsg = (error as Error).message;
            if (errMsg.includes('MongoDB') || errMsg.includes('database')) {
              setDbConnectionError(true);
              setErrorDetails(errMsg);
            }
          }
        } finally {
          setLoading(false);
        }
      };

      checkProfileCompletion();
    } else {
      setLoading(false);
    }
  }, [session, status, router, tokenPresent]);
  
  // Add another useEffect for the forced redirect listener
  useEffect(() => {
    // If this is a forced redirect, add a listener to prevent navigation away
    const forcedParam = searchParams?.get('forced');
    
    // Define the handler function
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if profile is completed
      const isProfileCompleted = localStorage.getItem('profileCompleted') === 'true';
      
      // If profile is completed, don't show warning dialog
      if (isProfileCompleted) {
        return;
      }
      
      // Only prevent navigation if not going to explicit allowed paths
      const navUrl = document?.activeElement?.getAttribute('href');
      if (navUrl && !navUrl.includes('/api/auth/signout')) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    // Only add the event listener if this is a forced redirect
    if (forcedParam === 'true') {
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
    
    // Empty cleanup function if no event listener was added
    return () => {};
  }, [searchParams]);
  
  // Log OAuth data for debugging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("Passing OAuth data to MultiStepRegistration:", {
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        googleAuthenticated: !!session?.user?.image,
        hasToken: !!searchParams?.get('token'),
        tokenSample: searchParams?.get('token') ? searchParams?.get('token')?.substring(0, 20) + '...' : null,
        sessionDetails: {
          status,
          hasImage: !!session?.user?.image,
          email: session?.user?.email,
          role: (session?.user as any)?.role || "unknown"
        }
      });
    }
  }, [session, status, searchParams]);

  // Create an effect to handle profile completion outside of conditional
  useEffect(() => {
    if (profileComplete) {
      // Remove the pending user completion flag to prevent beforeunload warnings
      localStorage.removeItem('pendingUserCompletion');
      
      // Setting a flag to indicate profile is complete
      localStorage.setItem('profileCompleted', 'true');
      
      // Remove all beforeunload event listeners by setting to null
      window.onbeforeunload = null;
    }
    
    // Clean up function
    return () => {
      if (profileComplete) {
        // This is redundant, but ensures we don't have lingering listeners
        window.onbeforeunload = null;
      }
    };
  }, [profileComplete]);
  
  // Show loading state
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }
  
  // If we have a database connection error, show a friendly error message
  if (dbConnectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{t("errors.database.title") || "Database Connection Issue"}</h2>
            <p className="mt-3 text-gray-600">
              {t("errors.database.message") || "We're having trouble connecting to our database."}
            </p>
            {errorDetails && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-md text-sm text-orange-800">
                {errorDetails}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("errors.database.helpText") || "You can try the following:"}
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>{t("errors.database.tip1") || "Check your internet connection"}</li>
              <li>{t("errors.database.tip2") || "Refresh the page"}</li>
              <li>{t("errors.database.tip3") || "Try again in a few minutes"}</li>
            </ul>
            
            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t("errors.database.refreshButton") || "Refresh Page"}
              </button>
              <button
                onClick={() => {
                  // Try to complete profile with offline mode
                  setDbConnectionError(false);
                  setLoading(false);
                }}
                className="w-full px-4 py-2 bg-white border border-orange-300 text-orange-700 hover:bg-orange-50 rounded-md font-medium"
              >
                {t("errors.database.continueButton") || "Try to Continue Anyway"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If profile is already complete, show success and redirect
  if (profileComplete) {
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <FiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("profile.complete.title")}</h1>
          <p className="text-gray-600 mb-6">{t("profile.complete.message")}</p>
          <button 
            onClick={() => {
              // Force reload the page to ensure we get fresh session data after completion
              // Use replace instead of href to ensure we don't add to browser history
              console.log('Redirecting completed profile to comingsoon page with fresh session');
              
              // Remove any possible beforeunload handler one more time
              window.onbeforeunload = null;
              
              // Navigate without warning
              window.location.replace("/comingsoon");
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-full"
          >
            {t("profile.complete.button")} <FiArrowRight />
          </button>
        </div>
      </div>
    );
  }

  // If user is authenticated but profile is incomplete, show the profile completion form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* AuthStatusBar handles language switcher and logout button */}
      <AuthStatusBar />
      {/* MultiStepRegistration component with conditional messaging */}
      <div className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Connection warning banner */}
          {errorDetails && !dbConnectionError && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>{t("warnings.offlineMode.title") || "Database Connection Warning"}</strong>
                    <br />
                    <span className="text-xs">
                      {t("warnings.offlineMode.message") || 
                        "We're experiencing database connection issues. You can continue with the form, but your submission may be delayed until connectivity is restored."}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Debug info */}
          <div className={`text-center mb-8 ${process.env.NODE_ENV !== 'production' ? '' : 'hidden'}`}>
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <FiTarget className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{t("profile.title")}</h1>
            <p className="mt-2 text-lg text-gray-600">
              {t("profile.welcome").replace("{name}", session?.user?.name || "")}
            </p>
            
            {/* Prominent warning for forced/pending users */}
            {isForced && (
              <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-red-800 text-lg">Profile Completion Required</h3>
                    <div className="mt-2 text-red-700">
                      <p>
                        <strong>You must complete this registration form to continue.</strong>
                      </p>
                      <p className="mt-1">
                        Access to all other areas is blocked until your profile is complete.
                      </p>
                      <div className="mt-3 flex justify-between items-center">
                        <p className="text-sm">
                          Your only options are to complete this form or log out.
                        </p>
                        <LogoutButton variant="danger" className="text-sm py-1 px-3" confirmText="Are you sure you want to log out? Your profile will remain incomplete until you sign in again and complete this form." />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Large sticky footer logout button for pending users */}
            {isForced && (
              <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-red-50 to-transparent pb-4 pt-8 px-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="font-bold text-red-800">Need to leave?</h4>
                    <p className="text-sm text-red-700">You can log out now and complete your profile later.</p>
                  </div>
                  <div className="flex-shrink-0">
                    <LogoutButton 
                      variant="danger" 
                      className="px-6 py-2 text-base"
                      confirmText="Are you sure you want to log out? Your profile is incomplete."
                      iconSize={20}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Conditional message based on authentication type */}
            {session?.user?.image ? (
              <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-1">Complete Your Google Sign-in</h3>
                <p className="text-sm text-blue-700">
                  Since you signed in with Google, we already have your name and email.
                  <strong className="block mt-1">Please complete the form to continue.</strong>
                </p>
              </div>
            ) : (
              <div className="mt-2 p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-medium text-green-800 mb-1">Complete Your Registration</h3>
                <p className="text-sm text-green-700">
                  We need some additional information to complete your registration.
                  <strong className="block mt-1">Please fill out the entire form to continue.</strong>
                </p>
              </div>
            )}
          </div>
          
          {/* Multi-step registration form - conditionally pass OAuth data */}
          <MultiStepRegistration 
            googleOAuthData={{
              // User authenticated with OAuth (has profile image)
              // If we have session data, use it; otherwise, fall back to token data
              name: session?.user?.name || tokenData?.name || "",
              email: session?.user?.email || tokenData?.email || "",
              googleAuthenticated: !!session?.user?.image || tokenData?.provider === 'google',
              // Pass token from URL if available
              token: searchParams?.get('token') || undefined
            }}
            searchParams={searchParams}
            forceProfileCompletion={isForced}
          />
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <LanguageProvider>
      <CompleteProfileContent />
    </LanguageProvider>
  );
}