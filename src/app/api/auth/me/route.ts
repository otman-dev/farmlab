import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session.user });
}
