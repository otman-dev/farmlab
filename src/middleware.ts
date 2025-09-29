

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a protected route
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/managerDashboard') ||
    pathname.startsWith('/adminDashboard') ||
    pathname.startsWith('/sponsorDashboard') ||
    pathname.startsWith('/visitorDashboard') ||
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/managerDashboard');

  // Skip middleware for non-protected routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Use NextAuth JWT for authentication
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Allow access for valid roles
  const role = String(token.role);
  
  // Role-based access control for specific dashboard types
  if (pathname.startsWith('/managerDashboard') || pathname.startsWith('/api/managerDashboard')) {
    // Manager dashboard: accessible to admin and manager roles
    if (!["admin", "manager"].includes(role)) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  } else if (pathname.startsWith('/adminDashboard')) {
    // Admin dashboard: accessible to admin role only
    if (role !== "admin") {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  } else if (pathname.startsWith('/sponsorDashboard')) {
    // Sponsor dashboard: accessible to admin and sponsor roles
    if (!["admin", "sponsor"].includes(role)) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  } else if (pathname.startsWith('/visitorDashboard')) {
    // Visitor dashboard: accessible to all authenticated users
    if (!["admin", "manager", "sponsor", "visitor"].includes(role)) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  } else if (["admin", "manager", "sponsor", "visitor"].includes(role)) {
    // General dashboard access for valid roles
    return NextResponse.next();
  }
  
  if (role === "waiting_list") {
    // Redirect waiting list users to coming soon page
    const url = new URL('/comingsoon', request.url);
    return NextResponse.redirect(url);
  } else if (!["admin", "manager", "sponsor", "visitor"].includes(role)) {
    // Unknown role, redirect to sign-in
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/managerDashboard/:path*', 
    '/adminDashboard/:path*',
    '/sponsorDashboard/:path*',
    '/visitorDashboard/:path*',
    '/api/dashboard/:path*',
    '/api/managerDashboard/:path*',
  ],
};