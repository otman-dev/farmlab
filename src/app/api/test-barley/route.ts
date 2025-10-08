import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  const uri = process.env.MONGODB_CLOUD_CLUSTER_URI;
  if (!uri) throw new Error('Please add your MONGODB_CLOUD_CLUSTER_URI to .env.local');
  
  await mongoose.connect(uri);
};

// Schema definition
const HydroponicBarleySchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  expectedHarvestDate: {
    type: Date,
    required: true
  },
  actualHarvestDate: {
    type: Date,
    default: null
  },
  seedWeight: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['growing', 'ready', 'harvested'],
    default: 'growing'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  farmId: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'hydroponic-barley'
});

// GET - Fetch all hydroponic barley plates (no auth for testing)
export async function GET() {
  try {
    await connectDB();
    
    // Fetch plates with sorting (newest first) - using Collection.find directly
    const collection = mongoose.connection.collection('hydroponic-barley');
    const plates = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      data: plates,
      count: plates.length,
      message: 'Fetched from collection directly'
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

// POST - Create new hydroponic barley plate (no auth for testing)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { plateNumber, startDate, expectedHarvestDate, seedWeight, notes, farmId } = body;
    
    // Validation
    if (!plateNumber || !startDate || !expectedHarvestDate || !seedWeight) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create document directly in collection
    const collection = mongoose.connection.collection('hydroponic-barley');
    
    const newPlate = {
      plateNumber,
      startDate: new Date(startDate),
      expectedHarvestDate: new Date(expectedHarvestDate),
      seedWeight: parseFloat(seedWeight),
      notes: notes || '',
      createdBy: 'test-user',
      farmId: farmId || 'default-farm',
      status: 'growing',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(newPlate);
    
    console.log('Saved plate to database:', result);
    
    return NextResponse.json({
      success: true,
      data: { ...newPlate, _id: result.insertedId },
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