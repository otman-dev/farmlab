import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { getCloudConnection } from '@/lib/mongodb-cloud';

// This API route provides a way for the Edge middleware to check a user's role
// without directly connecting to MongoDB (which isn't supported in Edge Runtime)
export async function GET(request: Request) {
  try {
    // Extract the email from the query parameter
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    // Check for internal request headers
    const isInternalRequest = request.headers.get('X-Internal-Request') === 'true';
    const authHeader = request.headers.get('Authorization');
    const secretToken = authHeader?.replace('Bearer ', '');
    
    // Basic security check - only allow internal requests with proper auth
    if (!isInternalRequest || secretToken !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Make sure we have an email to check
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }
    
    // Get current session for comparison
    const session = await getServerSession(authOptions);
    
    // If the user is in the current session and their email matches the requested one
    // we can just return their current role without a database lookup
    if (session?.user?.email?.toLowerCase() === email.toLowerCase() && 'role' in session.user) {
      return NextResponse.json({
        email: email,
        role: session.user.role,
        source: 'session'
      });
    }
    
    // Otherwise, query the database for the user's role
    try {
      const conn = await getCloudConnection();
      const dbUser = await conn.db.collection('users').findOne({ email: email.toLowerCase() });
      
      if (dbUser) {
        return NextResponse.json({
          email: email,
          role: dbUser.role,
          source: 'database'
        });
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } catch (dbError) {
      console.error('Error connecting to database:', dbError);
      return NextResponse.json({ error: 'Database connection error' }, { status: 503 });
    }
    
  } catch (error) {
    console.error('Error in check-role API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}