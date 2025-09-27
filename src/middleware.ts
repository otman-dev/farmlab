

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a protected route
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/dashboard');

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
  if (["admin", "manager", "sponsor", "visitor"].includes(role)) {
    return NextResponse.next();
  } else if (role === "waiting_list") {
    // Redirect waiting list users to coming soon page
    const url = new URL('/comingsoon', request.url);
    return NextResponse.redirect(url);
  } else {
    // Unknown role, redirect to sign-in
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
  ],
};