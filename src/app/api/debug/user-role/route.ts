import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Session } from "next-auth";

// Extended types to match our custom session with role
interface ExtendedUser {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

interface ExtendedSession extends Session {
  user?: ExtendedUser;
}

/**
 * Debug endpoint to help diagnose and fix OAuth user role issues
 * This endpoint checks the user's role in:
 * 1. Session
 * 2. JWT token
 * 3. Database
 * 
 * And provides options to fix inconsistencies
 */
export async function GET(req: NextRequest) {
  try {
    // Get session and token
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Check database for current role
    let dbRole = null;
    let dbUser = null;
    
    if (session?.user?.email) {
      const { getCloudConnection } = await import("@/lib/mongodb-cloud");
      const conn = await getCloudConnection();
      
      dbUser = await conn.db.collection('users').findOne({ 
        email: session.user.email.toLowerCase() 
      });
      
      if (dbUser) {
        dbRole = dbUser.role;
      }
    }

    // Create response with debug information
    return NextResponse.json({
      session: {
        exists: !!session,
        email: session?.user?.email || null,
        name: session?.user?.name || null,
        role: session?.user?.role || null,
        image: session?.user?.image ? '[image exists]' : null
      },
      token: {
        exists: !!token,
        email: token?.email || null,
        name: token?.name || null,
        role: token?.role || null,
        sub: token?.sub || null
      },
      database: {
        userFound: !!dbUser,
        role: dbRole,
        email: dbUser?.email || null,
        googleAuthenticated: dbUser?.googleAuthenticated || false,
        registrationCompleted: dbUser?.registrationCompleted || false
      },
      consistency: {
        sessionMatchesToken: session?.user?.role === token?.role,
        sessionMatchesDb: session?.user?.role === dbRole,
        tokenMatchesDb: token?.role === dbRole,
        allMatch: session?.user?.role === token?.role && token?.role === dbRole && session?.user?.role === dbRole,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Fix inconsistencies between session, token, and database roles
 */
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    
    // Security check - only allow admin users to fix roles
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getCloudConnection } = await import("@/lib/mongodb-cloud");
    const conn = await getCloudConnection();
    
    // Find the current user to check their role
    const currentUser = await conn.db.collection('users').findOne({ 
      email: session.user.email.toLowerCase() 
    });
    
    // Only allow admins to use this endpoint
    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    // Perform the requested action
    switch (action) {
      case 'sync_role_from_db': {
        // Create a cookie to bypass role check for this user temporarily
        const response = NextResponse.json({ 
          message: 'Added temporary bypass cookie',
          action: 'sync_role_from_db',
          success: true 
        }, { status: 200 });
        
        // Set cookie to bypass role check in middleware
        response.cookies.set('bypassRoleCheck', 'true', { 
          maxAge: 60 * 5, // 5 minutes
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        return response;
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in debug POST endpoint:', error);
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error.message
    }, { status: 500 });
  }
}