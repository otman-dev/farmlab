"use client";

import AuthStatusBar from "@/components/AuthStatusBar";
import RootContent from "@/components/RootContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* AuthStatusBar handles language switcher and logout button */}
      <AuthStatusBar />
      
      {/* Content fully managed by RootContent component */}
      <RootContent />
    </div>
  );
}
