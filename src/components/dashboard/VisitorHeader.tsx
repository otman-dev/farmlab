"use client";

import { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { signOut } from 'next-auth/react';

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

interface VisitorHeaderProps {
  user?: User;
  onOpenSidebar: () => void;
}

export default function VisitorHeader({ user, onOpenSidebar }: VisitorHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // For visitor, use provided user or default to visitor
  const displayUser = user || { name: 'Visitor', email: null };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden mr-3 p-2 rounded bg-white border border-gray-200 shadow focus:outline-none"
              onClick={onOpenSidebar}
              aria-label="Open sidebar"
            >
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-lg font-medium text-green-600">FarmLab Platform</span>
          </div>
          <div className="flex items-center">
            {/* Profile dropdown */}
            <div className="relative">
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {displayUser.image ? (
                    <img 
                      src={displayUser.image} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                      {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                    {displayUser.name || displayUser.email || 'User'}
                  </span>
                </button>
              </div>
              {isProfileOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    {displayUser.image && (
                      <div className="flex justify-center mb-2">
                        <img 
                          src={displayUser.image} 
                          alt="Profile" 
                          className="h-16 w-16 rounded-full object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    <p className="font-medium">{displayUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{displayUser.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}