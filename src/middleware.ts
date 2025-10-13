

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Helper function to check if the pathname is a public route that should always be accessible
function isPublicRoute(pathname: string): boolean {
  return [
    '/auth/signin',
    '/auth/error',
    '/maintenance',
    '/api/health-check',
    '/api/auth/csrf',
    '/api/auth/providers',
    '/api/auth/session',
  ].includes(pathname) || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') ||
    pathname.startsWith('/images/') ||
    pathname.includes('.svg') ||
    pathname.includes('.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg');
}

// Helper function to refresh a user's role
// Instead of connecting directly to MongoDB, we'll use the API route
async function refreshUserRole(email: string): Promise<string | null> {
  if (!email) return null;
  
  try {
    console.log(`refreshUserRole: Fetching role from API for ${email}`);
    
    // Create a URL for the API endpoint to check the user's role
    const url = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000');
    url.pathname = '/api/auth/check-role';
    
    // Add the email as a query parameter
    url.searchParams.set('email', email);
    
    // Make the fetch request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add an internal API key to validate this is a legitimate internal request
        'X-Internal-Auth': process.env.NEXTAUTH_SECRET || ''
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.role) {
        console.log(`refreshUserRole: Found role via API: ${data.role} for ${email}`);
        return data.role;
      }
    }
    return null;
  } catch (error) {
    console.error(`refreshUserRole: Error fetching role for ${email}:`, error);
    return null;
  }
}

// Track database connection issues
let dbConnectionIssueDetected = false;
let lastDbErrorTime = 0;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Bypass middleware for essential public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Skip middleware for maintenance page to avoid redirect loops
  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  // Check if the path is a protected route (root path is now public)
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/managerDashboard') ||
    pathname.startsWith('/adminDashboard') ||
    pathname.startsWith('/sponsorDashboard') ||
    pathname.startsWith('/visitorDashboard') ||
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/adminDashboard') ||
    pathname.startsWith('/api/sponsorDashboard') ||
    pathname.startsWith('/api/visitorDashboard') ||
    pathname.startsWith('/auth/complete-profile') ||
    pathname.startsWith('/api/managerDashboard');
    
  // Special case for OAuth redirect page - it handles its own auth flow
  if (pathname === '/auth/oauth-redirect') {
    console.log('Middleware: Allowing access to OAuth redirect page');
    return NextResponse.next();
  }

  // Special handling for comingsoon page - it's only for waiting_list users
  const isComingSoonPage = pathname === '/comingsoon';

  // Allow access to register page to start Google OAuth flow
  if (pathname === '/auth/register') {
    console.log('Middleware: Allowing access to register page for Google OAuth flow');
    return NextResponse.next();
  }

  // Skip middleware for non-protected routes and non-comingsoon routes
    if (!isProtectedRoute && !isComingSoonPage) {
      return NextResponse.next();
    }  // Use NextAuth JWT for authentication - ensure secure usage with proper NEXTAUTH_SECRET
  let token;
  
  // Check for a special cookie that indicates a recent role update or OAuth login
  const bypassRoleCheck = request.cookies.get('bypassRoleCheck')?.value === 'true';
  const isOAuthFlow = request.headers.get('referer')?.includes('/api/auth/callback/google') || 
                      request.nextUrl.searchParams.get('from') === 'oauth';
  
  if (bypassRoleCheck || isOAuthFlow) {
    console.log(`Middleware: Detected special case - ${bypassRoleCheck ? 'bypassRoleCheck cookie present' : 'OAuth flow detected'}`);
  }
  
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    console.log(`Middleware token:`, token ? {
      name: token.name,
      email: token.email,
      role: token.role,
      path: pathname,
      bypassRoleCheck,
      isOAuthFlow
    } : 'No token');
    
    // Reset DB error flag if we successfully get a token
    // This helps automatically recover when the database comes back online
    if (token && dbConnectionIssueDetected) {
      console.log('Successfully retrieved token after previous DB connection issues - resetting error flag');
      dbConnectionIssueDetected = false;
    }
  } catch (error) {
    console.error('Error getting token in middleware:', error);
    
    // Check if this is a database connection error
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND' || 
        error.code === 'ESERVFAIL' ||
        (error.message && error.message.includes('querySrv'))) {
      
      // Mark that we've detected a database connection issue
      dbConnectionIssueDetected = true;
      lastDbErrorTime = Date.now();
      
      console.error('Database connection issue detected in middleware - redirecting to maintenance page');
      
      // For API routes, return a 503 Service Unavailable
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ 
          error: 'Database connection error', 
          message: 'The application is currently experiencing database connectivity issues' 
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For regular routes, redirect to maintenance page
      // Skip this for maintenance page itself to avoid loops
      if (!pathname.startsWith('/maintenance')) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }
    
    // Continue with null token for other errors - will redirect to signin
    token = null;
  }
  
  // Check if we've recently encountered a database issue (within the last 30 seconds)
  // This helps prevent constant redirects if the issue is intermittent
  if (dbConnectionIssueDetected && (Date.now() - lastDbErrorTime < 30000)) {
    console.log('Recent database connection issue detected - routing to maintenance page');
    
    // For API routes, return a 503 Service Unavailable
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ 
        error: 'Database connection error', 
        message: 'The application is currently experiencing database connectivity issues' 
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For regular routes, redirect to maintenance page
    // Skip this for maintenance page itself to avoid loops
    if (!pathname.startsWith('/maintenance')) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  // Special case for complete-profile page
  if (pathname.startsWith('/auth/complete-profile')) {
    console.log('Middleware: Processing /auth/complete-profile access request');
    
    // Check for OAuth callback in the referrer - if coming from OAuth flow, allow access
    const referrer = request.headers.get('referer') || '';
    const isFromOAuth = referrer.includes('/api/auth/callback/google') || 
                        referrer.includes('error=OAuthCallback') ||
                        referrer.includes('/auth/signin');
    
    // Check for OAuth token parameter - a direct sign from NextAuth.js redirect
    const searchParams = request.nextUrl.searchParams;
    const tokenParam = searchParams.get('token');
    const fromParam = searchParams.get('from');
    const forcedParam = searchParams.get('forced');
    const isTokenRedirect = false;
    let isOAuthFlow = false;
    
    // Check if this is coming from OAuth flow
    if (fromParam === 'oauth' || fromParam === 'oauth_signup') {
      console.log('Middleware: Request coming from OAuth flow:', fromParam);
      isOAuthFlow = true;
    }
    
    // Check if this is a forced redirect (highest priority)
    if (forcedParam === 'true') {
      console.log('Middleware: This is a forced redirect to complete-profile - allowing without further checks');
      // For forced redirects, we'll prioritize access without any other checks
      return NextResponse.next();
    }
    
    // Check if we have a token parameter (second highest priority)
    if (tokenParam) {
      try {
        const tokenData = JSON.parse(decodeURIComponent(tokenParam));
        if (tokenData.role === 'pending') {
          console.log('Middleware: Direct redirect from NextAuth with pending role token - allowing access');
          // Create a cookie to maintain persistent access to this page even after refresh
          const response = NextResponse.next();
          response.cookies.set('pendingUserToken', 'true', { 
            maxAge: 60 * 60, // 1 hour
            path: '/auth/complete-profile'
          });
          return response;
        }
      } catch (e) {
        console.error('Middleware: Failed to parse token param:', e);
      }
    }
    
    // If user has a cookie indicating they're a pending user in the profile completion flow
    const pendingUserCookie = request.cookies.get('pendingUserToken')?.value;
    if (pendingUserCookie === 'true') {
      console.log('Middleware: Pending user detected via cookie - allowing access to complete-profile');
      return NextResponse.next();
    }
    
    // If user is authenticated, check their role
    if (token) {
      const role = String(token.role);
      
      // If user has pending role, always allow access to complete-profile
      if (role === 'pending') {
        console.log('Middleware: Allowing pending user to access complete-profile');
        return NextResponse.next();
      }
    }
    
    // Allow access if coming from OAuth callback or is part of OAuth flow
    if (isFromOAuth || isOAuthFlow) {
      console.log('Middleware: Allowing OAuth flow/callback to access complete-profile');
      return NextResponse.next();
    }
    
    // If we get here, the user is not authorized through any means
    // If not authenticated and not from OAuth flow, redirect to signin page
    console.log('Middleware: Unauthenticated user accessing complete-profile, redirecting to signin');
    const url = new URL('/auth/signin', request.url);
    return NextResponse.redirect(url);
  }

  // For other protected routes and comingsoon page, redirect to signin if not authenticated
  if (!token) {
    console.log(`Middleware: No token found, redirecting to signin`);
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Log the token role to help debug authentication issues
  console.log(`Middleware: Token found with role '${token.role}' for path ${pathname}`);
  
  // Special handling for comingsoon page - only accessible to waiting_list users
  if (isComingSoonPage) {
    const role = String(token.role);
    // If not a waiting_list user, redirect them to their appropriate dashboard
    if (role !== 'waiting_list') {
      console.log('Middleware: Non-waiting_list user trying to access comingsoon, redirecting');
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/adminDashboard', request.url));
      } else if (role === 'manager') {
        return NextResponse.redirect(new URL('/managerDashboard', request.url));
      } else if (role === 'sponsor') {
        return NextResponse.redirect(new URL('/sponsorDashboard', request.url));
      } else if (role === 'visitor') {
        return NextResponse.redirect(new URL('/visitorDashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    // If they are a waiting_list user, allow access to comingsoon
    return NextResponse.next();
  }

  // Allow access for valid roles
  let role = token.role ? String(token.role) : 'unknown';
  console.log(`Middleware: Role extracted from token: '${role}', token:`, JSON.stringify({email: token.email, name: token.name, role: token.role}));
  
  // For OAuth users, add an extra check to refresh their role from the database
  // This helps address any inconsistencies with token data
  if (token.email) {
    // Check if this might be an OAuth user having issues
    if (role === 'unknown' || role === 'waiting_list') {
      const refreshedRole = await refreshUserRole(token.email);
      if (refreshedRole) {
        console.log(`Middleware: Refreshed role from database: ${refreshedRole} (was ${role})`);
        role = refreshedRole;
      }
    }
  }
  
  console.log(`Middleware: User accessing ${pathname} with role '${role}'`);
  
  // Handle waiting_list users - they can access comingsoon and root page
  // This allows them to use the "Back to Home" button that redirects to root
  if (role === "waiting_list") {
    // Allow waiting_list users to access the root page and comingsoon
    if (pathname === '/' || pathname === '/comingsoon') {
      console.log(`Middleware: Allowing waiting_list user access to ${pathname}`);
      return NextResponse.next();
    }
    
    // Restrict access to dashboard routes and other protected paths
    if (pathname !== '/' && pathname !== '/comingsoon') {
      console.log(`Middleware: Redirecting waiting_list user from ${pathname} to comingsoon page`);
      
      // For API routes with waiting_list users, return 403 Forbidden instead of redirecting
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Access denied: waiting_list users cannot access this resource' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For non-API routes, redirect to comingsoon
      const url = new URL('/comingsoon', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Role-based access control for specific dashboard types
  if (pathname.startsWith('/managerDashboard') || pathname.startsWith('/api/managerDashboard')) {
    // Manager dashboard: accessible to admin and manager roles
    console.log(`Middleware: Manager dashboard access check. User role: '${role}', exact token role: '${token?.role}'`);
    
    if (!["admin", "manager"].includes(role)) {
      console.log(`Middleware: User with role '${role}' attempting to access managerDashboard`);
      
      // Attempt to verify role via API instead of direct database access
      if (token && token.email) {
        try {
          console.log(`Middleware: Double-checking role via API for ${token.email}`);
          
          // Use our refreshUserRole helper which now uses the API
          const refreshedRole = await refreshUserRole(token.email);
          
          // If user has admin or manager role, allow access despite token mismatch
          if (refreshedRole === 'admin' || refreshedRole === 'manager') {
            console.log(`Middleware: API check confirmed user ${token.email} has ${refreshedRole} role despite token mismatch. Allowing access.`);
            return NextResponse.next();
          } else {
            console.log(`Middleware: API role check result: ${refreshedRole || 'no role found'}`);
          }
        } catch (error) {
          console.error('Error verifying user role via API:', error);
        }
      }
      
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ 
          error: 'Access denied: manager or admin role required',
          roleRequired: ['admin', 'manager'],
          currentRole: role
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Special handling for pending role - consistent with complete-profile flow
      if (role === 'pending') {
        console.log('Middleware: Pending user trying to access manager dashboard, redirecting to complete profile');
        return NextResponse.redirect(new URL('/auth/complete-profile?forced=true&from=dashboard', request.url));
      }
      
      // For regular routes, redirect to their appropriate dashboard based on role
      switch(role) {
        case "sponsor":
          return NextResponse.redirect(new URL('/sponsorDashboard', request.url));
        case "visitor":
          return NextResponse.redirect(new URL('/visitorDashboard', request.url));
        case "waiting_list":
          return NextResponse.redirect(new URL('/comingsoon', request.url));
        default:
          // If unknown role, redirect to signin with error
          const url = new URL('/auth/signin', request.url);
          url.searchParams.set('error', 'access_denied');
          return NextResponse.redirect(url);
      }
    }
  } else if (pathname.startsWith('/adminDashboard') || pathname.startsWith('/api/adminDashboard')) {
    // Admin dashboard: accessible to admin role only
    console.log(`Middleware: Admin dashboard access check. User role: '${role}', exact token role: '${token?.role}', isAdmin: ${role === "admin"}`);
    
    // Enhanced check for OAuth users
    if (role !== "admin") {
      console.log(`Middleware: Non-admin user with role '${role}' attempting to access adminDashboard`);
      
      // Attempt to verify role via API instead of direct database access
      if (token && token.email) {
        try {
          console.log(`Middleware: Double-checking role via API for ${token.email}`);
          
          // Use our refreshUserRole helper which now uses the API
          const refreshedRole = await refreshUserRole(token.email);
          
          // If user has admin role, allow access despite token mismatch
          if (refreshedRole === 'admin') {
            console.log(`Middleware: API check confirmed user ${token.email} has admin role despite token mismatch. Allowing access.`);
            return NextResponse.next();
          } else {
            console.log(`Middleware: API role check result: ${refreshedRole || 'no role found'}`);
          }
        } catch (error) {
          console.error('Error verifying user role via API:', error);
        }
      }
      
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ 
          error: 'Access denied: admin role required',
          roleRequired: ['admin'],
          currentRole: role 
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For regular routes, redirect to their appropriate dashboard based on role
      switch(role) {
        case "manager":
          return NextResponse.redirect(new URL('/managerDashboard', request.url));
        case "sponsor":
          return NextResponse.redirect(new URL('/sponsorDashboard', request.url));
        case "visitor":
          return NextResponse.redirect(new URL('/visitorDashboard', request.url));
        case "waiting_list":
          return NextResponse.redirect(new URL('/comingsoon', request.url));
        case "pending":
          return NextResponse.redirect(new URL('/auth/complete-profile?forced=true&from=dashboard', request.url));
        default:
          // If unknown role, redirect to signin with error
          const url = new URL('/auth/signin', request.url);
          url.searchParams.set('error', 'access_denied');
          return NextResponse.redirect(url);
      }
    }
  } else if (pathname.startsWith('/sponsorDashboard') || pathname.startsWith('/api/sponsorDashboard')) {
    // Sponsor dashboard: accessible to admin and sponsor roles
    console.log(`Middleware: Sponsor dashboard access check. User role: '${role}', exact token role: '${token?.role}'`);
    
    if (!["admin", "sponsor"].includes(role)) {
      console.log(`Middleware: User with role '${role}' attempting to access sponsorDashboard`);
      
      // Attempt to verify role via API instead of direct database access
      if (token && token.email) {
        try {
          console.log(`Middleware: Double-checking role via API for ${token.email}`);
          
          // Use our refreshUserRole helper which now uses the API
          const refreshedRole = await refreshUserRole(token.email);
          
          // If user has admin or sponsor role, allow access despite token mismatch
          if (refreshedRole === 'admin' || refreshedRole === 'sponsor') {
            console.log(`Middleware: API check confirmed user ${token.email} has ${refreshedRole} role despite token mismatch. Allowing access.`);
            return NextResponse.next();
          } else {
            console.log(`Middleware: API role check result: ${refreshedRole || 'no role found'}`);
          }
        } catch (error) {
          console.error('Error verifying user role via API:', error);
        }
      }
      
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ 
          error: 'Access denied: sponsor or admin role required',
          roleRequired: ['admin', 'sponsor'],
          currentRole: role
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Special handling for pending role - consistent with complete-profile flow
      if (role === 'pending') {
        console.log('Middleware: Pending user trying to access sponsor dashboard, redirecting to complete profile');
        return NextResponse.redirect(new URL('/auth/complete-profile?forced=true&from=dashboard', request.url));
      }
      
      // For regular routes, redirect to their appropriate dashboard based on role
      switch(role) {
        case "manager":
          return NextResponse.redirect(new URL('/managerDashboard', request.url));
        case "visitor":
          return NextResponse.redirect(new URL('/visitorDashboard', request.url));
        case "waiting_list":
          return NextResponse.redirect(new URL('/comingsoon', request.url));
        default:
          // If unknown role, redirect to signin with error
          const url = new URL('/auth/signin', request.url);
          url.searchParams.set('error', 'access_denied');
          return NextResponse.redirect(url);
      }
    }
  } else if (pathname.startsWith('/visitorDashboard') || pathname.startsWith('/api/visitorDashboard')) {
    // Visitor dashboard: accessible to all authenticated users with valid roles
    console.log(`Middleware: Visitor dashboard access check. User role: '${role}', exact token role: '${token?.role}'`);
    
    if (!["admin", "manager", "sponsor", "visitor"].includes(role)) {
      console.log(`Middleware: User with role '${role}' attempting to access visitorDashboard`);
      
      // Attempt to verify role via API instead of direct database access
      if (token && token.email) {
        try {
          console.log(`Middleware: Double-checking role via API for ${token.email}`);
          
          // Use our refreshUserRole helper which now uses the API
          const refreshedRole = await refreshUserRole(token.email);
          
          // If user has any valid role, allow access despite token mismatch
          if (refreshedRole && ["admin", "manager", "sponsor", "visitor"].includes(refreshedRole)) {
            console.log(`Middleware: API check confirmed user ${token.email} has ${refreshedRole} role despite token mismatch. Allowing access.`);
            return NextResponse.next();
          } else {
            console.log(`Middleware: API role check result: ${refreshedRole || 'no role found'}`);
          }
        } catch (error) {
          console.error('Error verifying user role via API:', error);
        }
      }
      
      // For API routes, return a 403 Forbidden response
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ 
          error: 'Access denied: valid role required',
          roleRequired: ['admin', 'manager', 'sponsor', 'visitor'],
          currentRole: role
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Special handling for pending role - consistent with complete-profile flow
      if (role === 'pending') {
        console.log('Middleware: Pending user trying to access visitor dashboard, redirecting to complete profile');
        return NextResponse.redirect(new URL('/auth/complete-profile?forced=true&from=dashboard', request.url));
      }
      
      // For waiting_list users, redirect to coming soon
      if (role === 'waiting_list') {
        return NextResponse.redirect(new URL('/comingsoon', request.url));
      }
      
      // For any other role, redirect to signin with error
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(url);
    }
  } else if (pathname === '/' || pathname === '/dashboard') {
    // For root path or generic dashboard path, redirect users to their role-specific dashboard
    // Special case: waiting_list users can access the root path directly
    if (role === 'waiting_list' && pathname === '/') {
      console.log(`Middleware: Allowing waiting_list user access to root path`);
      return NextResponse.next();
    }
    
    console.log(`Middleware: Redirecting ${pathname} access to role-specific dashboard for ${role}`);
    
    // Improved role detection - check database if role seems incorrect
    if (role === 'unknown' && token?.email) {
      try {
        const refreshedRole = await refreshUserRole(token.email);
        if (refreshedRole && refreshedRole !== role) {
          console.log(`Middleware: Updated role from database: ${refreshedRole} (was ${role})`);
          role = refreshedRole;
        }
      } catch (error) {
        console.error('Error refreshing user role:', error);
      }
    }
    
    // Comprehensive role-based dashboard routing
    switch (role) {
      case "admin":
        return NextResponse.redirect(new URL('/adminDashboard', request.url));
      case "manager":
        return NextResponse.redirect(new URL('/managerDashboard', request.url));
      case "sponsor":
        return NextResponse.redirect(new URL('/sponsorDashboard', request.url));
      case "visitor":
        return NextResponse.redirect(new URL('/visitorDashboard', request.url));
      case "waiting_list":
        // Only redirect to comingsoon for dashboard, not root path
        if (pathname === '/dashboard') {
          return NextResponse.redirect(new URL('/comingsoon', request.url));
        }
        return NextResponse.next();
      case "pending":
        // Pending users need to complete their profile
        console.log('Middleware: User with pending role accessing root or dashboard, redirecting to complete profile');
        return NextResponse.redirect(new URL('/auth/complete-profile', request.url));
      default:
        // Unknown role, fall through to next checks
        break;
    }
  } else if (["admin", "manager", "sponsor", "visitor"].includes(role)) {
    // General dashboard access for valid roles
    console.log(`Middleware: Allowing access to ${pathname} for role ${role}`);
    return NextResponse.next();
  }
  
  // Special handling for pending role - they MUST complete registration
  // This takes absolute priority over all other routing decisions
  if (role === 'pending') {
    console.log('Middleware: Pending user detected, STRICT profile completion flow enforcement');
    
    // Only allow these very specific paths - nothing else
    const allowedPaths = [
      '/auth/complete-profile',
      '/api/auth/complete-profile',
      '/api/auth/check-profile'
    ];
    
    // If trying to access exactly one of the allowed paths, permit it
    if (allowedPaths.includes(pathname) || 
        pathname.startsWith('/api/auth/complete-profile/') ||
        pathname.startsWith('/auth/complete-profile')) {
      console.log('Middleware: Allowing pending user to access profile completion resource');
      return NextResponse.next();
    }
    
    // Even allow logout/signout access
    if (pathname.includes('/api/auth/signout') || pathname.includes('/api/auth/logout')) {
      console.log('Middleware: Allowing pending user to sign out');
      return NextResponse.next();
    }
    
    // Check if trying to access the oauth-redirect page (common after signin)
    if (pathname === '/auth/oauth-redirect') {
      console.log('Middleware: Pending user at oauth-redirect, immediately forwarding to complete-profile');
      return NextResponse.redirect(new URL('/auth/complete-profile', request.url));
    }
    
    // For API routes with pending role, return 403 Forbidden
    if (pathname.startsWith('/api/')) {
      console.log(`Middleware: Blocking pending user API access to ${pathname}`);
      return new NextResponse(JSON.stringify({ 
        error: 'Access denied: You must complete your profile first',
        redirectTo: '/auth/complete-profile?forced=true'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Even if trying to access auth pages like signin/register, still redirect to complete-profile
    if (pathname.startsWith('/auth/')) {
      console.log(`Middleware: Redirecting pending user from ${pathname} to complete-profile page`);
      return NextResponse.redirect(new URL('/auth/complete-profile?forced=true', request.url));
    }
    
    // Special case for root page to be extra clear about required profile completion
    if (pathname === '/') {
      console.log(`Middleware: Pending user attempting to access root, forcing complete-profile`);
      return NextResponse.redirect(new URL('/auth/complete-profile?forced=true&from=root', request.url));
    }
    
    // Redirect to complete-profile for ALL other routes
    console.log(`Middleware: FORCING pending user redirection from ${pathname} to complete-profile`);
    return NextResponse.redirect(new URL('/auth/complete-profile?forced=true', request.url));
  }
  
  // For unknown roles, log and redirect to sign-in
  if (!["admin", "manager", "sponsor", "visitor", "waiting_list", "pending"].includes(role)) {
    console.log(`Middleware: Unknown role "${role}", redirecting to signin`);
    
    // For API routes with unknown roles, return 403 Forbidden instead of redirecting
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'Access denied: unknown role' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For non-API routes, redirect to signin
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('error', 'unknown_role');
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // If we've reached here, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Include all auth-related routes to ensure we can intercept signin/register attempts for pending users
    '/auth/:path*',
    '/api/auth/:path*',
    
    // Regular protected routes
    '/dashboard/:path*',
    '/managerDashboard/:path*', 
    '/adminDashboard/:path*',
    '/sponsorDashboard/:path*',
    '/visitorDashboard/:path*',
    
    // API routes for dashboards
    '/api/dashboard/:path*',
    '/api/managerDashboard/:path*',
    '/api/adminDashboard/:path*',
    '/api/sponsorDashboard/:path*',
    '/api/visitorDashboard/:path*',
    
    // Special routes that need protection
    '/comingsoon',
    
    // Maintenance page access should be recorded but still allowed
    '/maintenance',
    
    // Health check endpoint for monitoring database connection
    '/api/health-check',
    
    // For users with pending role, we need to catch attempts to access the root page too
    '/',
  ],
  
  // Important: run this middleware in Node.js runtime instead of Edge Runtime
  // This avoids issues with dynamic code evaluation from mongoose
  runtime: 'nodejs'
};