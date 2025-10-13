import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({
      error: 'Not authenticated'
    }, { status: 401 });
  }
  
  // Return the user object including any image data
  return NextResponse.json({
    user: {
      name: session.user?.name,
      email: session.user?.email,
      image: session.user?.image,
    },
    authenticated: true
  });
}