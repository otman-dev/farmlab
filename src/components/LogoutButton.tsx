"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { FiLogOut, FiX } from "react-icons/fi";

interface LogoutButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "text" | "icon";
  confirmText?: string;
  iconSize?: number;
}

export default function LogoutButton({ 
  className = "", 
  variant = "primary",
  confirmText,
  iconSize = 16
}: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "unknown";
  
  const handleSignOut = () => {
    setShowConfirm(true);
  };

  const confirmSignOut = () => {
    // Always redirect to home page after logout
    signOut({ callbackUrl: "/" });
  };

  const cancelSignOut = () => {
    setShowConfirm(false);
  };

  // Base styles for different variants
  const styles = {
    primary: "inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm",
    danger: "inline-flex items-center px-4 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200 shadow-lg font-bold",
    secondary: "inline-flex items-center px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-red-500 hover:text-red-600 transition-all duration-200",
    text: "inline-flex items-center text-gray-600 hover:text-red-600 font-medium transition-colors duration-200",
    icon: "inline-flex items-center justify-center p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
  };

  return (
    <>
      <button 
        onClick={handleSignOut} 
        className={`${styles[variant]} ${className}`}
      >
        <FiLogOut className={`${variant !== "icon" ? "mr-2" : ""}`} style={{ width: iconSize || 16, height: iconSize || 16 }} />
        {variant !== "icon" && "Sign out"}
      </button>
      
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl relative">
            <button 
              onClick={cancelSignOut}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={20} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sign out</h3>
            <p className="text-gray-600 mb-6">
              {confirmText ? confirmText : 
                userRole === "pending" 
                  ? "Are you sure you want to sign out? You'll need to continue setting up your profile later when you sign back in."
                  : userRole === "waiting_list"
                  ? "Are you sure you want to sign out? You can sign back in anytime to check your waitlist status."
                  : "Are you sure you want to sign out?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelSignOut}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}