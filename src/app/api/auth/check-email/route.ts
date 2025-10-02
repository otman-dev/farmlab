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

    // Get the user model with retry logic
    let UserModel;
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        UserModel = await getCloudUserModel();
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(`Email check MongoDB connection attempt ${retryCount} failed:`, error);
        
        if (retryCount >= maxRetries) {
          console.error('Email check: All MongoDB connection attempts failed.');
          // Return success to avoid blocking registration - let duplicate handling happen at registration
          return NextResponse.json({
            exists: false // Default to false if we can't check
          });
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
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
    // Return false to avoid blocking registration - duplicate handling will happen at registration level
    return NextResponse.json({
      exists: false
    });
  }
}