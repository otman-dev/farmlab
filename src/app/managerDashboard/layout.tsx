"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ManagerNavigation from "@/components/dashboard/ManagerNavigation";
import SimpleHeader from "@/components/dashboard/SimpleHeader";

type UserRole = "admin" | "manager" | "sponsor" | "visitor" | "waiting_list";
interface SessionUser {
  name?: string;
  email?: string;
  image?: string;
  role?: UserRole;
}

export default function ManagerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    const user = session?.user as SessionUser | undefined;
    if (!user || !["admin", "manager"].includes(user.role || "")) {
      router.replace("/auth/signin");
    }
  }, [session, status, router]);
  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen text-green-600 text-xl">Loading...</div>;
  }
  return (
    <div className="flex h-screen bg-gray-50">
      <ManagerNavigation mobileOpen={false} setMobileOpen={() => {}} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <SimpleHeader user={session?.user ?? { name: '', email: '', image: '' }} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
