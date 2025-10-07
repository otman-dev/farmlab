import { Schema, Document, Connection, Model } from 'mongoose';

export interface IInvoiceProduct {
  name: string;
  quantity: number;
  price: number;
  description?: string;
  category?: string;
  unit?: string;
  kgPerUnit?: number;
  pricePerKilogram?: number;
  totalPrice?: number;
}

export interface IInvoice extends Document {
  invoiceNumber: number; // Auto-increment internal number
  supplier: {
    _id: string;
    name: string;
    entrepriseName: string;
  };
  products: IInvoiceProduct[];
  grandTotal: number;
  invoiceDate: Date;
  createdAt: Date;
}

const InvoiceProductSchema = new Schema<IInvoiceProduct>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  unit: { type: String },
  kgPerUnit: { type: Number },
  pricePerKilogram: { type: Number },
  totalPrice: { type: Number },
});

const InvoiceSchema: Schema = new Schema<IInvoice>({
  invoiceNumber: { type: Number, unique: true }, // Will be auto-generated
  supplier: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    entrepriseName: { type: String, required: true },
  },
  products: [InvoiceProductSchema],
  grandTotal: { type: Number, required: true },
  invoiceDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate invoice number before saving
InvoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    try {
      // Find the highest invoice number and increment
      const lastInvoice = await (this.constructor as any).findOne({}, {}, { sort: { invoiceNumber: -1 } });
      this.invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1001; // Start from 1001
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export function getInvoiceModel(conn: Connection): Model<IInvoice> {
  return conn.models.Invoice || conn.model<IInvoice>('Invoice', InvoiceSchema);
}