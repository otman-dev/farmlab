import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const uri = process.env.MONGODB_CLOUD_CLUSTER_URI;
  if (!uri) throw new Error('Please add your MONGODB_CLOUD_CLUSTER_URI to .env.local');
  
  await mongoose.connect(uri);
};

// GET - Fetch all hydroponic barley plates
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const farmId = searchParams.get('farmId') || 'default-farm';
    
    // Build query
    const query: any = { farmId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Use direct collection access to avoid mongoose type issues
    const collection = mongoose.connection.collection('hydroponic-barley');
    const plates = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      data: plates,
      count: plates.length
    });
    
  } catch (error) {
    console.error('Error fetching hydroponic barley plates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch hydroponic barley plates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new hydroponic barley plate
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { plateNumber, startDate, expectedHarvestDate, seedWeight, notes, farmId, plateUnits } = body;
    
    // Debug log to see what we received
    console.log('Received plate data:', body);
    console.log('Extracted plateUnits:', plateUnits, typeof plateUnits);
    
    // Validation
    if (!plateNumber || !startDate || !expectedHarvestDate || !seedWeight) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (seedWeight <= 0) {
      return NextResponse.json(
        { success: false, error: 'Seed weight must be greater than 0' },
        { status: 400 }
      );
    }
    
    if (plateUnits && plateUnits <= 0) {
      return NextResponse.json(
        { success: false, error: 'Plate units must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Use direct collection access
    const collection = mongoose.connection.collection('hydroponic-barley');
    
    // Check if plate number already exists
    const existingPlate = await collection.findOne({ 
      plateNumber, 
      farmId: farmId || 'default-farm' 
    });
    
    if (existingPlate) {
      return NextResponse.json(
        { success: false, error: 'Plate number already exists' },
        { status: 409 }
      );
    }
    
    // Create new plate document
    const newPlate = {
      plateNumber,
      startDate: new Date(startDate),
      expectedHarvestDate: new Date(expectedHarvestDate),
      seedWeight: parseFloat(seedWeight),
      plateUnits: plateUnits ? parseInt(plateUnits) : 1,
      notes: notes || '',
      createdBy: session.user.email,
      farmId: farmId || 'default-farm',
      status: 'growing',
      actualHarvestDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating plate with plateUnits:', plateUnits ? parseInt(plateUnits) : 1);
    
    const result = await collection.insertOne(newPlate);
    const savedPlate = { ...newPlate, _id: result.insertedId };
    
    console.log('Saved plate to database:', savedPlate);
    
    return NextResponse.json({
      success: true,
      data: savedPlate,
      message: 'Hydroponic barley plate created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating hydroponic barley plate:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create hydroponic barley plate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}