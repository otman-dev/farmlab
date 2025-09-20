import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder for animals root API, can be expanded for summary or listing all animal types
  return NextResponse.json({ message: 'Animal management API root. Use /sheep for sheep data.' });
}
