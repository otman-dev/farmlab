"use client";
import React, { useEffect, useState } from 'react';
import SimpleDashboardNavigation from "@/components/dashboard/SimpleDashboardNavigation";
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
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || {});
          // Store user role in localStorage for sidebar
          if (typeof window !== 'undefined' && data.user?.role) {
            localStorage.setItem('user_role', data.user.role);
          }
          // If not admin, redirect to /comingsoon
          if (data.user?.role !== 'admin') {
            router.replace('/comingsoon');
          }
        } else {
          router.replace('/auth/signin');
        }
      } catch {
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
      {/* Sidebar */}
      <SimpleDashboardNavigation mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <SimpleHeader user={user} onOpenSidebar={() => setSidebarOpen(true)} />
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}