import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to connect to MongoDB
    const { getCloudConnection } = await import("@/lib/mongodb-cloud");
    
    try {
      const conn = await getCloudConnection();
      
      // If connection is successful, return 200
      return NextResponse.json({ 
        status: 'ok', 
        message: 'Database connection is healthy',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Database connection error:', error);
      
      // Return connection error details
      return NextResponse.json({ 
        status: 'error', 
        message: 'Database connection failed',
        error: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN',
        timestamp: new Date().toISOString()
      }, { status: 503 }); // Service Unavailable
    }
  } catch (error: any) {
    console.error('Server error checking database connection:', error);
    
    // Return server error
    return NextResponse.json({ 
      status: 'error', 
      message: 'Server error checking database connection',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 }); // Internal Server Error
  }
}