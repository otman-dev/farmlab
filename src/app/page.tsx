"use client";

import { LanguageProvider } from "@/components/LanguageProvider";
import AuthStatusBar from "@/components/AuthStatusBar";
import RootContent from "@/components/RootContent";

export default function Home() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* AuthStatusBar handles language switcher and logout button */}
        <AuthStatusBar />
        
        {/* Content fully managed by RootContent component */}
        <RootContent />
      </div>
    </LanguageProvider>
  );
}
