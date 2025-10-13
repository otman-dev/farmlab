import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]';

// This endpoint is for debugging purposes only - remove before production
export async function GET(req: NextRequest) {
  try {
    // Get the JWT token from the request
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Get the session from the server
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      session: {
        user: session?.user || null,
        expires: session?.expires || null,
      },
      token: token ? {
        name: token.name,
        email: token.email,
        role: token.role,
        // Exclude other JWT properties for security
      } : null,
      cookies: {
        names: req.cookies.getAll().map(c => c.name)
      },
      headers: {
        referer: req.headers.get('referer'),
        userAgent: req.headers.get('user-agent'),
      }
    });
  } catch (error: any) {
    console.error('Auth debug session route error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}