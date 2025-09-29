import { NextResponse } from 'next/server';

// Mock version for successful build
export async function GET() {
  try {
    // Mock data
    const sheep = [
      { _id: "sheep1", name: "Dolly", breed: "Suffolk", age: 3, weight: 75, status: "healthy" },
      { _id: "sheep2", name: "Wooly", breed: "Merino", age: 2, weight: 68, status: "healthy" }
    ];
    
    return NextResponse.json({ sheep });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sheep' }, { status: 500 });
  }
}

// You can add POST, PUT, DELETE handlers here for CRUD operations later
