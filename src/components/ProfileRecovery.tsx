"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// This component silently attempts to submit any pending profile data
// that might have been saved during a database connection outage
export default function ProfileRecovery() {
  const { data: session, status } = useSession();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  useEffect(() => {
    // Only run recovery once per session when the user is authenticated
    if (status === "authenticated" && session && !recoveryAttempted) {
      checkAndSubmitPendingData();
    }
  }, [session, status, recoveryAttempted]);

  async function checkAndSubmitPendingData() {
    try {
      // Check if there's pending profile data stored from a previous database outage
      const pendingData = localStorage.getItem('pendingProfileData');
      const timestamp = parseInt(localStorage.getItem('pendingProfileTimestamp') || '0', 10);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      // Only process if we have data and it's less than 24 hours old
      if (pendingData && (Date.now() - timestamp) < maxAge) {
        console.log('Found pending profile data from previous submission during DB outage');
        
        // First, check if database is now available
        const healthCheck = await fetch('/api/auth/connection-status');
        const healthStatus = await healthCheck.json();
        
        if (healthCheck.ok && healthStatus.status === 'ok') {
          console.log('Database connection is now available, attempting to submit pending data');
          
          setIsRecovering(true);
          
          const formData = JSON.parse(pendingData);
          const endpoint = formData.googleAuthenticated 
            ? '/api/auth/complete-profile'
            : '/api/auth/register';
          
          // Attempt to submit the stored data
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-OAuth-Authentication': formData.googleAuthenticated ? 'true' : 'false',
              'X-Recovery-Submission': 'true'
            },
            body: pendingData,
          });
          
          if (res.ok) {
            console.log('Successfully recovered and submitted profile data');
            // Clear the stored data
            localStorage.removeItem('pendingProfileData');
            localStorage.removeItem('pendingProfileTimestamp');
          } else {
            console.error('Failed to submit recovered profile data', await res.json());
          }
        } else {
          console.log('Database still unavailable, will try again later');
        }
      }
    } catch (error) {
      console.error('Error during profile data recovery:', error);
    } finally {
      setIsRecovering(false);
      setRecoveryAttempted(true);
    }
  }

  // This component doesn't render anything visible
  return null;
}