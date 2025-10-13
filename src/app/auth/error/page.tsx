
"use client";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import Link from "next/link";


import { Suspense } from "react";

function AuthErrorContent() {
  // router removed (was unused)
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An error occurred during authentication";
  let errorDescription = "";
  let showTryAgainButton = true;
  let isCritical = false;

  // Define more user-friendly error messages
  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password";
    errorDescription = "Please check your credentials and try again.";
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to access this resource";
    errorDescription = "Please contact an administrator if you believe this is incorrect.";
  } else if (error === "OAuthSignin" || error === "OAuthCallback" || error === "OAuthCreateAccount") {
    errorMessage = "Error occurred with the authentication provider";
    errorDescription = "There was a problem connecting to the authentication service. This could be temporary.";
  } else if (error === "EmailCreateAccount") {
    errorMessage = "Error creating an account with this email";
    errorDescription = "This email may already be in use or there was a problem with our registration system.";
  } else if (error === "Callback") {
    errorMessage = "Error during callback processing";
    errorDescription = "There was a problem during the sign-in process. Please try again.";
  } else if (error === "OAuthAccountNotLinked") {
    errorMessage = "This email is already associated with another account";
    errorDescription = "Please sign in using the method you used previously to create this account.";
  } else if (error === "DatabaseError") {
    errorMessage = "Database connection error";
    errorDescription = "We're having trouble connecting to our database. This could be due to temporary network issues. Please try again in a few minutes.";
    isCritical = true;
    showTryAgainButton = true;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className={`mt-4 ${isCritical ? 'bg-orange-100 border-orange-400 text-orange-700' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded-lg border relative`} role="alert">
            <strong className="font-bold block mb-1">{errorMessage}</strong>
            {errorDescription && (
              <span className="block sm:inline text-sm mb-2">{errorDescription}</span>
            )}
            
            {error === "DatabaseError" && (
              <div className="mt-3 text-xs text-orange-800">
                <p className="font-semibold">Troubleshooting steps:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Make sure you&apos;re not using a VPN or proxy that might block MongoDB</li>
                  <li>Try refreshing the page</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
              </div>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {showTryAgainButton && (
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Try Again
              </Link>
            )}
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}

