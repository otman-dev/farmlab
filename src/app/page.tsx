"use client";

import { LanguageProvider } from "@/components/LanguageProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import RootContent from "@/components/RootContent";

export default function Home() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Fixed language switcher in the top corner */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        
        {/* Content fully managed by RootContent component */}
        <RootContent />
      </div>
    </LanguageProvider>
  );
}
