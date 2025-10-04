import { Schema, Document, Connection, Model } from 'mongoose';

export interface IMedicineUnit extends Document {
  productId: string;
  productName: string;
  customId: string; // User-defined ID for the medicine box/unit
  expirationDate: Date;
  firstUsageDate?: Date;
  usageDescription?: string;
  goodFor?: string[]; // Animals this medicine is suitable for
  isUsed: boolean;
  isExpired: boolean;
  invoiceId?: string; // Link to the invoice where this unit was added
  createdAt: Date;
  updatedAt: Date;
}

const MedicineUnitSchema: Schema = new Schema<IMedicineUnit>({
  productId: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  customId: { type: String, required: true, unique: true },
  expirationDate: { type: Date, required: true },
  firstUsageDate: { type: Date },
  usageDescription: { type: String },
  goodFor: [{ type: String }],
  isUsed: { type: Boolean, default: false },
  isExpired: { type: Boolean, default: false },
  invoiceId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
MedicineUnitSchema.index({ productId: 1, isUsed: 1 });
MedicineUnitSchema.index({ expirationDate: 1 });
// Note: customId index is already created by unique: true in schema definition

// Middleware to update the updatedAt field and check expiration
MedicineUnitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Check if expired
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Compare only dates
  const expDate = new Date(this.expirationDate as Date);
  expDate.setHours(0, 0, 0, 0);
  
  this.isExpired = expDate < now;
  
  next();
});

export function getMedicineUnitModel(conn: Connection): Model<IMedicineUnit> {
  return conn.models.MedicineUnit || conn.model<IMedicineUnit>('MedicineUnit', MedicineUnitSchema);
}