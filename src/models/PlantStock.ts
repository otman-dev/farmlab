import mongoose, { Schema, Document, Model } from "mongoose";

export interface PlantStockUnit {
  plantedAt?: string;
  harvestedAt?: string;
  location?: string; // Where planted (greenhouse, field, etc.)
  status?: 'planted' | 'growing' | 'harvested' | 'failed';
}

export interface PlantStock extends Document {
  productId: string;
  quantity: number;
  units?: PlantStockUnit[];
  createdAt: Date;
}

const PlantStockUnitSchema = new Schema<PlantStockUnit>({
  plantedAt: { type: String },
  harvestedAt: { type: String },
  location: { type: String },
  status: { 
    type: String, 
    enum: ['planted', 'growing', 'harvested', 'failed'],
    default: 'planted'
  }
});

const PlantStockSchema = new Schema<PlantStock>({
  productId: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  units: { type: [PlantStockUnitSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PlantStock || mongoose.model<PlantStock>("PlantStock", PlantStockSchema);