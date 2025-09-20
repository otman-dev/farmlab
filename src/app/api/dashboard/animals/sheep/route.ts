import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SheepModel from '@/models/Sheep';

export async function GET() {
  try {
    await dbConnect();
    const sheep = await SheepModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ sheep });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sheep' }, { status: 500 });
  }
}

// You can add POST, PUT, DELETE handlers here for CRUD operations later
