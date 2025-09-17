
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

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

  // Custom authentication logic
  const token = request.cookies.get('auth_token');

  // If there's no token, redirect to the sign-in page
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Check user role from JWT
  try {
    const secret = process.env.JWT_SECRET || 'vercel_secret';
    const payload = jwt.verify(token.value, secret) as { role?: string };
    if (payload.role !== 'admin') {
      // Not admin: redirect to /comingsoon (outside dashboard)
      const url = new URL('/comingsoon', request.url);
      return NextResponse.redirect(url);
    }
  } catch {
    // Invalid token, redirect to sign-in
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If all checks pass, proceed to the protected route
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
  ],
};