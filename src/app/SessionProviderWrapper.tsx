"use client";
import { SessionProvider } from "next-auth/react";
import ProfileRecovery from "@/components/ProfileRecovery";
import { useState, useEffect } from "react";

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  // State to track if browser has localStorage access (for profile recovery)
  const [hasLocalStorage, setHasLocalStorage] = useState(false);
  
  // Check if localStorage is available after component mounts
  useEffect(() => {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      setHasLocalStorage(true);
    } catch (e) {
      console.warn("localStorage is not available, profile recovery disabled");
      setHasLocalStorage(false);
    }
  }, []);
  
  return (
    <SessionProvider>
      {children}
      {/* Only render ProfileRecovery if localStorage is available */}
      {hasLocalStorage && <ProfileRecovery />}
    </SessionProvider>
  );
}
