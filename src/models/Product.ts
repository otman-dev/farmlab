import mongoose, { Schema, Document, Model } from 'mongoose';


export interface Product extends Document {
  name: string;
  category: 'animal_feed' | 'animal_medicine' | 'plant_seeds' | 'plant_seedlings' | 'plant_nutrition' | 'plant_medicine';
  price: number;
  kilogramQuantity?: number; // animal_feed only
  unitPrice?: number; // animal_feed only, auto-calculated
  unitCount?: number; // animal_feed only
  total?: number; // animal_feed only, auto-calculated
  description?: string;
  createdAt: Date;
  usageDescription?: string; // For medicine/treatment products
  goodFor?: string[]; // For medicine - what animals/plants this is good for
  amountPerUnit?: number; // Amount per unit (e.g., grams per packet)
  unit?: string; // Unit type (e.g., packet, bag, bottle)
  // Plant-specific fields
  seedType?: string; // For seeds - type classification
  plantingInstructions?: string; // For seeds/seedlings
  harvestTime?: string; // Expected harvest time
  growthConditions?: string; // Optimal growing conditions
}

const ProductSchema: Schema = new Schema<Product>({
  name: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ['animal_feed', 'animal_medicine', 'plant_seeds', 'plant_seedlings', 'plant_nutrition', 'plant_medicine'], 
    required: true 
  },
  price: { type: Number },
  kilogramQuantity: { type: Number },
  unitPrice: { type: Number },
  unitCount: { type: Number },
  total: { type: Number },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  usageDescription: { type: String }, // For medicine/treatment products
  goodFor: [{ type: String }], // For medicine - what animals/plants this is good for
  amountPerUnit: { type: Number }, // Amount per unit
  unit: { type: String }, // Unit type
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
    const kg = Number(this.kilogramQuantity);
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

const ProductModel: Model<Product> =
  mongoose.models.Product || mongoose.model<Product>('Product', ProductSchema);

export default ProductModel;
