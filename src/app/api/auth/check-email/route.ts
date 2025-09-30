import { NextRequest, NextResponse } from 'next/server';
import { getCloudUserModel } from '@/lib/mongodb-cloud';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the user model
    const UserModel = await getCloudUserModel();
    
    // Check if user exists with this email
    const existingUser = await UserModel.findOne(
      { email: email.toLowerCase() },
      { _id: 1 } // Only return _id for efficiency
    );

    return NextResponse.json({
      exists: !!existingUser
    });

  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    );
  }
}