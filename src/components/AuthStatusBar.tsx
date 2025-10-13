"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AuthStatusBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated";
  const userRole = (session?.user as any)?.role || "";
  
  // Determine if we're on the complete-profile page
  const isCompletingProfile = pathname?.includes('/auth/complete-profile');
  
  // Always show logout for pending users who are completing their profile
  // Since this is one of their only available actions
  const shouldShowLogout = isAuthenticated;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-3">
      <LanguageSwitcher />
      {shouldShowLogout && <LogoutButton variant="secondary" />}
    </div>
  );
}