import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RFIDCardModel from '@/models/RFIDCard';

// Get all RFID cards
export async function GET() {
  try {
    await dbConnect();
    const cards = await RFIDCardModel.find({}).populate('user').sort({ detectedAt: -1 }).lean();
    return NextResponse.json({ cards });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RFID cards' }, { status: 500 });
  }
}

// Add a new RFID card
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { cardId, status, user, notes } = body;
    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
    }
    const card = await RFIDCardModel.create({ cardId, status, user, notes });
    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add RFID card' }, { status: 500 });
  }
}

// You can add PUT/DELETE for update/delete later
