import { Schema, Document, Connection, Model } from 'mongoose';

export interface IPlantStockUnit {
  plantedAt?: string;
  harvestedAt?: string;
  location?: string; // Where planted (greenhouse, field, etc.)
  status?: 'planted' | 'growing' | 'harvested' | 'failed';
}

export interface IPlantStock extends Document {
  productId: string;
  quantity: number;
  units?: IPlantStockUnit[];
  createdAt: Date;
}

const PlantStockUnitSchema = new Schema<IPlantStockUnit>({
  plantedAt: { type: String },
  harvestedAt: { type: String },
  location: { type: String },
  status: { 
    type: String, 
    enum: ['planted', 'growing', 'harvested', 'failed'],
    default: 'planted'
  }
});

const PlantStockSchema: Schema = new Schema<IPlantStock>({
  productId: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  units: { type: [PlantStockUnitSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export function getPlantStockModel(conn: Connection): Model<IPlantStock> {
  return conn.models.PlantStock || conn.model<IPlantStock>('PlantStock', PlantStockSchema);
}