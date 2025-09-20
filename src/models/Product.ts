import mongoose, { Schema, Document, Model } from 'mongoose';


export interface Product extends Document {
  name: string;
  category: 'animal_feed' | 'animal_medicine';
  price: number;
  kilogramQuantity?: number; // animal_feed only
  unitPrice?: number; // animal_feed only, auto-calculated
  unitCount?: number; // animal_feed only
  total?: number; // animal_feed only, auto-calculated
  description?: string;
  createdAt: Date;
  usageDescription?: string; // New field
  goodFor?: string[]; // Now array of strings
  amountPerUnit?: number; // New field
  unit?: string; // New field
}

const ProductSchema: Schema = new Schema<Product>({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['animal_feed', 'animal_medicine'], required: true },
  price: { type: Number },
  kilogramQuantity: { type: Number },
  unitPrice: { type: Number },
  unitCount: { type: Number },
  total: { type: Number },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  usageDescription: { type: String }, // New field
  goodFor: [{ type: String }], // Now array of strings
  amountPerUnit: { type: Number }, // New field
  unit: { type: String }, // New field
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
