import { NextRequest, NextResponse } from 'next/server';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getMedicineUnitModel } from '@/models/MedicineUnit.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';

// GET: List all medicine units with filtering options
export async function GET(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const MedicineUnit = getMedicineUnitModel(conn);
    const { searchParams } = new URL(request.url);
    
    const productId = searchParams.get('productId');
    const isUsed = searchParams.get('isUsed');
    const isExpired = searchParams.get('isExpired');
    const showExpiringSoon = searchParams.get('expiringSoon');
    
    // Build query
    const query: {
      productId?: string;
      isUsed?: boolean;
      isExpired?: boolean;
      productName?: { $regex: string; $options: string };
      expirationDate?: { $gte: Date; $lte: Date };
    } = {};
    if (productId) query.productId = productId;
    if (isUsed !== null) query.isUsed = isUsed === 'true';
    if (isExpired !== null) query.isExpired = isExpired === 'true';
    
    // If showing expiring soon, add date range
    if (showExpiringSoon === 'true') {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      
      query.expirationDate = {
        $gte: now,
        $lte: thirtyDaysFromNow
      };
      query.isUsed = false; // Only show unused units
    }
    
    const units = await MedicineUnit.find(query)
      .sort({ expirationDate: 1, createdAt: 1 });
    
    // Get summary statistics
    const totalUnits = await MedicineUnit.countDocuments();
    const usedUnits = await MedicineUnit.countDocuments({ isUsed: true });
    const expiredUnits = await MedicineUnit.countDocuments({ isExpired: true });
    const availableUnits = await MedicineUnit.countDocuments({ isUsed: false, isExpired: false });
    
    // Get expiring soon count (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const expiringSoonUnits = await MedicineUnit.countDocuments({
      isUsed: false,
      isExpired: false,
      expirationDate: { $gte: now, $lte: thirtyDaysFromNow }
    });
    
    return NextResponse.json({
      units,
      summary: {
        total: totalUnits,
        available: availableUnits,
        used: usedUnits,
        expired: expiredUnits,
        expiringSoon: expiringSoonUnits
      }
    });
    
  } catch (err) {
    console.error('Error fetching medicine units:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: Create new medicine units (typically from invoice creation)
export async function POST(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const MedicineUnit = getMedicineUnitModel(conn);
    const MedicalStock = getMedicalStockModel(conn);
    
    const { units } = await request.json();
    
    if (!Array.isArray(units) || units.length === 0) {
      return NextResponse.json({ error: 'Units array is required' }, { status: 400 });
    }
    
    // Validate required fields
    for (const unit of units) {
      if (!unit.productId || !unit.productName || !unit.customId || !unit.expirationDate) {
        return NextResponse.json({ 
          error: 'Missing required fields: productId, productName, customId, expirationDate' 
        }, { status: 400 });
      }
    }
    
    // Check for duplicate customIds
    const customIds = units.map(u => u.customId);
    const duplicates = customIds.filter((id, index) => customIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      return NextResponse.json({ 
        error: `Duplicate custom IDs found: ${duplicates.join(', ')}` 
      }, { status: 400 });
    }
    
    // Check if any customId already exists in database
    const existingUnits = await MedicineUnit.find({ 
      customId: { $in: customIds } 
    });
    
    if (existingUnits.length > 0) {
      const existingIds = existingUnits.map(u => u.customId);
      return NextResponse.json({ 
        error: `Custom IDs already exist: ${existingIds.join(', ')}` 
      }, { status: 400 });
    }
    
    // Create the units
    const createdUnits = await MedicineUnit.insertMany(units);
    
    // Update the overall medical stock quantities
    const productUpdates = new Map<string, number>();
    
    for (const unit of units) {
      const current = productUpdates.get(unit.productId) || 0;
      productUpdates.set(unit.productId, current + 1);
    }
    
    // Update MedicalStock for each affected product
    const productUpdateEntries = Array.from(productUpdates.entries());
    for (const [productId, quantity] of productUpdateEntries) {
      const medicalStock = await MedicalStock.findOne({ productId });
      
      if (medicalStock) {
        medicalStock.quantity += quantity;
        await medicalStock.save();
      } else {
        await MedicalStock.create({ productId, quantity });
      }
    }
    
    return NextResponse.json({ 
      units: createdUnits,
      message: `Successfully created ${createdUnits.length} medicine units`
    });
    
  } catch (err) {
    console.error('Error creating medicine units:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PATCH: Update a medicine unit (mark as used, update usage date, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const MedicineUnit = getMedicineUnitModel(conn);
    const MedicalStock = getMedicalStockModel(conn);
    
    const { unitId, updates } = await request.json();
    
    if (!unitId) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 });
    }
    
    const unit = await MedicineUnit.findById(unitId);
    if (!unit) {
      return NextResponse.json({ error: 'Medicine unit not found' }, { status: 404 });
    }
    
    // Track if unit is being marked as used/unused to update stock
    const wasUsed = unit.isUsed;
    const willBeUsed = updates.isUsed !== undefined ? updates.isUsed : wasUsed;
    
    // Update the unit
    Object.assign(unit, updates);
    
    // If marking as used for the first time, set firstUsageDate
    if (!wasUsed && willBeUsed && !unit.firstUsageDate) {
      unit.firstUsageDate = new Date();
    }
    
    await unit.save();
    
    // Update medical stock if usage status changed
    if (wasUsed !== willBeUsed) {
      const medicalStock = await MedicalStock.findOne({ productId: unit.productId });
      if (medicalStock) {
        if (willBeUsed && !wasUsed) {
          // Unit was marked as used - decrease available stock
          medicalStock.quantity = Math.max(0, medicalStock.quantity - 1);
        } else if (!willBeUsed && wasUsed) {
          // Unit was marked as unused - increase available stock
          medicalStock.quantity += 1;
        }
        await medicalStock.save();
      }
    }
    
    return NextResponse.json({ 
      unit,
      message: 'Medicine unit updated successfully'
    });
    
  } catch (err) {
    console.error('Error updating medicine unit:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: Remove a medicine unit
export async function DELETE(request: NextRequest) {
  try {
    const conn = await cloudConnPromise;
    const MedicineUnit = getMedicineUnitModel(conn);
    const MedicalStock = getMedicalStockModel(conn);
    
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');
    
    if (!unitId) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 });
    }
    
    const unit = await MedicineUnit.findById(unitId);
    if (!unit) {
      return NextResponse.json({ error: 'Medicine unit not found' }, { status: 404 });
    }
    
    const productId = unit.productId;
    const wasUsed = unit.isUsed;
    
    // Delete the unit
    await MedicineUnit.findByIdAndDelete(unitId);
    
    // Update medical stock - decrease total count if unit wasn't used
    if (!wasUsed) {
      const medicalStock = await MedicalStock.findOne({ productId });
      if (medicalStock) {
        medicalStock.quantity = Math.max(0, medicalStock.quantity - 1);
        await medicalStock.save();
      }
    }
    
    return NextResponse.json({ 
      message: 'Medicine unit deleted successfully'
    });
    
  } catch (err) {
    console.error('Error deleting medicine unit:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}