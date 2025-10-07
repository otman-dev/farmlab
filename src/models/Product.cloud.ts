import { Schema, Document, Connection, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: 'animal_feed' | 'animal_medicine' | 'plant_seeds' | 'plant_seedlings' | 'plant_nutrition' | 'plant_medicine';
  price?: number;
  kilogramQuantity?: number; // animal_feed only - DEPRECATED, use kgPerUnit
  kgPerUnit?: number; // animal_feed only - kilograms per unit/package
  unitPrice?: number; // animal_feed only, auto-calculated
  unitCount?: number; // animal_feed only
  total?: number; // animal_feed only, auto-calculated
  description?: string;
  createdAt: Date;
  usageDescription?: string;
  goodFor?: string[];
  amountPerUnit?: number;
  unit?: string;
  // Plant-specific fields
  seedType?: string; // For seeds - type classification
  plantingInstructions?: string; // For seeds/seedlings
  harvestTime?: string; // Expected harvest time
  growthConditions?: string; // Optimal growing conditions
}

const ProductSchema: Schema = new Schema<IProduct>({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['animal_feed', 'animal_medicine', 'plant_seeds', 'plant_seedlings', 'plant_nutrition', 'plant_medicine'], 
    required: true 
  },
  price: { type: Number },
  kilogramQuantity: { type: Number }, // DEPRECATED - keeping for backward compatibility
  kgPerUnit: { type: Number }, // animal_feed only - kilograms per unit/package
  unitPrice: { type: Number },
  unitCount: { type: Number },
  total: { type: Number },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  usageDescription: { type: String },
  goodFor: [{ type: String }],
  amountPerUnit: { type: Number },
  unit: { type: String },
  // Plant-specific fields
  seedType: { type: String }, // For seeds
  plantingInstructions: { type: String }, // For seeds/seedlings
  harvestTime: { type: String }, // Expected harvest time
  growthConditions: { type: String }, // Optimal growing conditions
});

// Ensure no duplicate products by name+category
ProductSchema.index({ name: 1, category: 1 }, { unique: true });

// Auto-calculate unitPrice and total for animal_feed
ProductSchema.pre('save', function (next) {
  if (this.category === 'animal_feed') {
    const price = Number(this.price);
    // Use kgPerUnit (new) or fall back to kilogramQuantity (old) for backward compatibility
    const kg = Number(this.kgPerUnit || this.kilogramQuantity);
    const unitCount = Number(this.unitCount);
    if (kg && price) {
      this.unitPrice = price / kg;
    }
    if (unitCount && price) {
      this.total = price * unitCount;
    } else if (price) {
      this.total = price;
    }
  }
  next();
});

export function getProductModel(conn: Connection): Model<IProduct> {
  return conn.models.Product || conn.model<IProduct>('Product', ProductSchema);
}