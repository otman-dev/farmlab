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
    name?: string; // Make optional to match Supplier model
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
  invoiceNumber: { type: Number, unique: true, sparse: true }, // sparse allows multiple null values
  supplier: {
    _id: { type: String, required: true },
    name: { type: String, required: false }, // Make optional
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
      // Find the latest invoice and increment by 1
      const latestInvoice = await (this.constructor as any)
        .findOne({})
        .sort({ invoiceNumber: -1 })
        .select('invoiceNumber');
      
      // Start from 1 if no invoices exist, otherwise increment by 1
      this.invoiceNumber = latestInvoice && latestInvoice.invoiceNumber 
        ? latestInvoice.invoiceNumber + 1 
        : 1;
      
      console.log('Generated invoice number:', this.invoiceNumber);
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return next(error);
    }
  }
  next();
});

export function getInvoiceModel(conn: Connection): Model<IInvoice> {
  // Check if model already exists, if so return it, otherwise create new one
  return conn.models.Invoice as Model<IInvoice> || conn.model<IInvoice>('Invoice', InvoiceSchema);
}