import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]";
// request param removed as it's unused
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session.user });
}
