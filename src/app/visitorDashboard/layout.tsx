"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VisitorNavigation from "@/components/dashboard/VisitorNavigation";
import AdminNavigation from "@/components/dashboard/AdminNavigation";
import VisitorHeader from "@/components/dashboard/VisitorHeader";
import SimpleHeader from "@/components/dashboard/SimpleHeader";

type UserRole = "admin" | "manager" | "sponsor" | "visitor" | "waiting_list";
interface SessionUser {
  name?: string;
  email?: string;
  image?: string;
  role?: UserRole;
}

export default function VisitorDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  useEffect(() => {
    if (status === "loading") return;
    const user = session?.user as SessionUser | undefined;
    if (!user || (user.role !== "visitor" && user.role !== "admin")) {
      router.replace("/auth/signin");
    }
  }, [session, status, router]);
  
  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen text-green-600 text-xl">Loading...</div>;
  }
  
  const user = session?.user as SessionUser | undefined;
  const isAdmin = user?.role === "admin";
  
  return (
    <div className="flex h-screen bg-gray-50">
      {isAdmin ? (
        <AdminNavigation mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      ) : (
        <VisitorNavigation mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      )}
      <div className="flex flex-col flex-1 overflow-hidden">
        {isAdmin ? (
          <SimpleHeader user={session?.user ?? { name: '', email: '', image: '' }} onOpenSidebar={() => setMobileOpen(true)} />
        ) : (
          <VisitorHeader user={session?.user ?? { name: '', email: '', image: '' }} onOpenSidebar={() => setMobileOpen(true)} />
        )}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
