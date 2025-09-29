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
  invoiceNumber: string;
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
  invoiceNumber: { type: String, required: true, unique: true },
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

export function getInvoiceModel(conn: Connection): Model<IInvoice> {
  return conn.models.Invoice || conn.model<IInvoice>('Invoice', InvoiceSchema);
}