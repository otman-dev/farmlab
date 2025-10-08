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

// PUT - Update hydroponic barley plate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const body = await request.json();
    const { plateNumber, startDate, expectedHarvestDate, seedWeight, notes, status, actualHarvestDate, plateUnits } = body;
    
    // Use direct collection access
    const collection = mongoose.connection.collection('hydroponic-barley');
    
    // Find the plate
    const plate = await collection.findOne({ _id: new mongoose.Types.ObjectId(resolvedParams.id) });
    if (!plate) {
      return NextResponse.json(
        { success: false, error: 'Hydroponic barley plate not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    const updateData: any = {
      updatedAt: new Date()
    };
    if (plateNumber) updateData.plateNumber = plateNumber;
    if (startDate) updateData.startDate = new Date(startDate);
    if (expectedHarvestDate) updateData.expectedHarvestDate = new Date(expectedHarvestDate);
    if (seedWeight !== undefined) updateData.seedWeight = parseFloat(seedWeight);
    if (plateUnits !== undefined) updateData.plateUnits = parseInt(plateUnits);
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    if (actualHarvestDate) updateData.actualHarvestDate = new Date(actualHarvestDate);
    
    // If marking as harvested, set harvest date
    if (status === 'harvested' && !actualHarvestDate) {
      updateData.actualHarvestDate = new Date();
    }
    
    // If unmarking as harvested, remove harvest date
    if (status !== 'harvested' && plate.status === 'harvested') {
      updateData.actualHarvestDate = null;
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(resolvedParams.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    console.log('Updated plate in database:', result);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Hydroponic barley plate updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating hydroponic barley plate:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update hydroponic barley plate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete hydroponic barley plate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const collection = mongoose.connection.collection('hydroponic-barley');
    
    const deletedPlate = await collection.findOneAndDelete({ 
      _id: new mongoose.Types.ObjectId(resolvedParams.id) 
    });
    
    if (!deletedPlate) {
      return NextResponse.json(
        { success: false, error: 'Hydroponic barley plate not found' },
        { status: 404 }
      );
    }
    
    console.log('Deleted plate from database:', deletedPlate);
    
    return NextResponse.json({
      success: true,
      message: 'Hydroponic barley plate deleted successfully',
      data: deletedPlate
    });
    
  } catch (error) {
    console.error('Error deleting hydroponic barley plate:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete hydroponic barley plate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Get single hydroponic barley plate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const resolvedParams = await params;
    const collection = mongoose.connection.collection('hydroponic-barley');
    
    const plate = await collection.findOne({ _id: new mongoose.Types.ObjectId(resolvedParams.id) });
    
    if (!plate) {
      return NextResponse.json(
        { success: false, error: 'Hydroponic barley plate not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: plate
    });
    
  } catch (error) {
    console.error('Error fetching hydroponic barley plate:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch hydroponic barley plate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}