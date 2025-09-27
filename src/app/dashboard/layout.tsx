"use client";
import React, { useEffect, useState } from 'react';
import SimpleDashboardNavigation from "@/components/dashboard/SimpleDashboardNavigation";
import ManagerNavigation from "@/components/dashboard/ManagerNavigation";
import SponsorNavigation from "@/components/dashboard/SponsorNavigation";
import SimpleHeader from "@/components/dashboard/SimpleHeader";
import VisitorNavigation from "../../components/dashboard/VisitorNavigation";
import VisitorHeader from "../../components/dashboard/VisitorHeader";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type SessionUserWithRole = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  if (typeof window !== 'undefined') {
    // Debug: print session and status to browser console
    console.log('SESSION DEBUG:', session, status);
  }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      router.replace('/auth/signin');
      return;
    }
    const userRole = (session.user as SessionUserWithRole)?.role;
    if (userRole === 'waiting_list') {
      router.replace('/comingsoon');
      return;
    }
    if (userRole === 'admin') {
      // Allow access
      return;
    }
    // Redirect all other roles to their own dashboards
    if (userRole === 'manager') {
      router.replace('/managerDashboard');
      return;
    }
    if (userRole === 'sponsor') {
      router.replace('/sponsorDashboard');
      return;
    }
    if (userRole === 'visitor') {
      router.replace('/visitorDashboard');
      return;
    }
    // Unknown or unauthorized role
    router.replace('/auth/signin');
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen text-green-600 text-xl">Loading...</div>;
  }

  const userRole = (session?.user as SessionUserWithRole)?.role;


  // Sponsor layout
  if (userRole === 'sponsor') {
    return (
      <div className="flex h-screen bg-gray-50">
        <SponsorNavigation mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <SimpleHeader user={session?.user ?? { name: '', email: '', image: '' }} onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Visitor layout
  if (userRole === 'visitor') {
    return (
      <div className="flex h-screen bg-gray-50">
        <VisitorNavigation mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <VisitorHeader user={session?.user} onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Manager layout
  if (userRole === 'manager') {
    return (
      <div className="flex h-screen bg-gray-50">
        <ManagerNavigation mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <SimpleHeader user={session?.user ?? { name: '', email: '', image: '' }} onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Admin layout - full dashboard with sidebar
  // Always pass a valid User object to SimpleHeader
  const headerUser = session?.user ?? { name: '', email: '', image: '' };
  return (
    <div className="flex h-screen bg-gray-50">
      <SimpleDashboardNavigation mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <SimpleHeader user={headerUser} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}