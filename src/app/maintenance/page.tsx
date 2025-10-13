"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiDatabase, FiRefreshCw, FiHome, FiMail } from "react-icons/fi";

export default function MaintenancePage() {
  const [countdown, setCountdown] = useState(30);
  const [isChecking, setIsChecking] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  
  // Countdown timer for auto-refresh
  useEffect(() => {
    if (countdown > 0 && !isChecking) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isChecking && checkAttempts < 3) {
      // Auto-check database connection when countdown reaches zero
      checkDatabaseConnection();
    }
  }, [countdown, isChecking, checkAttempts]);
  
  // Function to check database connection
  const checkDatabaseConnection = async () => {
    setIsChecking(true);
    
    try {
      // Call a simple API endpoint that tests MongoDB connection
      const response = await fetch("/api/health-check", { 
        method: "GET",
        headers: { "Cache-Control": "no-cache" }
      });
      
      if (response.ok) {
        // If connection is successful, redirect to home page
        window.location.href = "/";
        return;
      }
    } catch (error) {
      console.log("Database still unavailable:", error);
    } finally {
      // Reset countdown and increment attempt counter
      setIsChecking(false);
      setCountdown(30);
      setCheckAttempts(prev => prev + 1);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <FiDatabase className="h-8 w-8 text-orange-600" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Database Connection Issue
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We&apos;re experiencing some technical difficulties with our database connection.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">What&apos;s happening?</h3>
              <p className="mt-1 text-sm text-gray-500">
                Our application is unable to connect to the database. This could be due to:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-500">
                <li>Temporary network connectivity issues</li>
                <li>DNS resolution problems</li>
                <li>Firewall or proxy blocking the connection</li>
                <li>Scheduled database maintenance</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">What can you do?</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-500">
                <li>Check your internet connection</li>
                <li>Try disabling any VPN or proxy you might be using</li>
                <li>Wait a few minutes and try again</li>
                <li>Contact us if the problem persists</li>
              </ul>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    {isChecking ? (
                      "Checking connection..."
                    ) : (
                      `Auto-refreshing in ${countdown} seconds`
                    )}
                  </p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-600 h-1.5 rounded-full transition-all duration-100"
                      style={{ width: `${(countdown / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    onClick={checkDatabaseConnection}
                    disabled={isChecking}
                  >
                    <FiRefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                    {isChecking ? 'Checking...' : 'Check Now'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <FiHome className="h-4 w-4 mr-2" />
                Return to Home Page
              </Link>
              
              <Link
                href="/contact"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <FiMail className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}