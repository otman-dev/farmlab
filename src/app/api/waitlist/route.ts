import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

interface WaitlistData {
  userType: string;
  farmSize?: string;
  techExperience: string;
  interests: string[];
  expectations: string[];
  name: string;
  email: string;
  location: string;
  organization?: string;
  role?: string;
  experience?: string;
  challenges?: string;
  goals?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: WaitlistData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.location || !data.userType || !data.techExperience) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get the database
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if email already exists
    const existingUser = await db.collection('waitlist').findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Add timestamp and IP for analytics
    const waitlistEntry = {
      ...data,
      createdAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      source: 'immersive_waitlist'
    };

    // Insert into waitlist collection
    const result = await db.collection('waitlist').insertOne(waitlistEntry);

    if (result.acknowledged) {
      // You could add email notification here
      console.log(`New waitlist signup: ${data.email} (${data.userType})`);

      return NextResponse.json(
        {
          success: true,
          message: 'Successfully joined the waitlist!',
          id: result.insertedId
        },
        { status: 201 }
      );
    } else {
      throw new Error('Failed to insert waitlist entry');
    }

  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve waitlist stats (for admin use)
export async function GET() {
  try {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get basic stats
    const totalSignups = await db.collection('waitlist').countDocuments();
    const userTypeStats = await db.collection('waitlist').aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const techExperienceStats = await db.collection('waitlist').aggregate([
      { $group: { _id: '$techExperience', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    return NextResponse.json({
      totalSignups,
      userTypeBreakdown: userTypeStats,
      techExperienceBreakdown: techExperienceStats
    });

  } catch (error) {
    console.error('Waitlist stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}