import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]';

// This endpoint is for debugging purposes only - DO NOT USE IN PRODUCTION
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
      token: token ? {
        name: token.name,
        email: token.email,
        role: token.role,
        // Don't include JWT internal properties for security
      } : null,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      cookies: Object.fromEntries(
        req.cookies.getAll().map(c => [c.name, '[cookie value hidden]'])
      ),
    });
  } catch (error: any) {
    console.error('Auth debug route error:', error);
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}