import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to connect to MongoDB
    const { getCloudConnection } = await import("@/lib/mongodb-cloud");
    const conn = await getCloudConnection();
    
    // Test connection by running a simple command
    const dbStatus = await conn.db.admin().ping();
    
    if (dbStatus?.ok === 1) {
      return NextResponse.json({ 
        status: 'ok', 
        message: 'Database connection is healthy' 
      });
    } else {
      // Connection exists but health check failed
      throw new Error('Database ping failed');
    }
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message
    }, { status: 503 }); // Service Unavailable
  }
}