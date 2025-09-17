"use client";
import React, { useEffect, useState } from 'react';
import SimpleDashboardNavigation from "@/components/dashboard/SimpleDashboardNavigation";
import { FiMenu, FiX } from "react-icons/fi";
import SimpleHeader from "@/components/dashboard/SimpleHeader";

import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ name?: string | null; email?: string | null; role?: string | null }>({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        console.log('DashboardLayout: /api/auth/me response', res);
        if (res.ok) {
          const data = await res.json();
          console.log('DashboardLayout: user data', data);
          setUser(data.user || {});
          // Store user role in localStorage for sidebar
          if (typeof window !== 'undefined' && data.user?.role) {
            localStorage.setItem('user_role', data.user.role);
          }
          // If not admin, redirect to coming soon
          if (data.user?.role !== 'admin') {
            console.log('DashboardLayout: user is not admin, redirecting to /comingsoon');
            router.replace('/comingsoon');
          }
        } else {
          console.log('DashboardLayout: /api/auth/me not ok, redirecting to /auth/signin');
          router.replace('/auth/signin');
        }
      } catch (err) {
        console.log('DashboardLayout: error fetching user', err);
        router.replace('/auth/signin');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-green-600 text-xl">Loading...</div>;
  }

  // If user is not admin, the redirect will already have happened
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <SimpleDashboardNavigation />
      </div>

      {/* Sidebar drawer for mobile - only render when open */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden transition-all duration-300" aria-modal="true" role="dialog">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          ></div>
          {/* Sidebar drawer */}
          <div
            className="absolute left-0 top-0 h-full w-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col translate-x-0"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-green-700">FarmLab Dashboard</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-green-600 focus:outline-none"
                aria-label="Close sidebar"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SimpleDashboardNavigation onNavigate={() => setSidebarOpen(false)} mobile />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header with menu button */}
        <div className="md:hidden flex items-center px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-green-600 focus:outline-none mr-2"
            aria-label="Open sidebar"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <span className="text-lg font-semibold text-green-700">FarmLab Dashboard</span>
        </div>
        <SimpleHeader user={user} />
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}