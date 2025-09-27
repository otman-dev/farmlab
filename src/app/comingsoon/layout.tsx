"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "manager" | "sponsor" | "visitor" | "waiting_list";
interface SessionUser {
  name?: string;
  email?: string;
  image?: string;
  role?: UserRole;
}

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    const user = session?.user as SessionUser | undefined;
    if (!user) {
      router.replace("/auth/signin");
      return;
    }
    if (user.role !== "waiting_list") {
      // Only waiting_list can access
      router.replace("/" + user.role + "Dashboard");
    }
  }, [session, status, router]);
  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen text-green-600 text-xl">Loading...</div>;
  }
  return <>{children}</>;
}
