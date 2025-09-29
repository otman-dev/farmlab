import { Schema, Document, Connection, Model } from 'mongoose';

export interface IFoodStockUnit {
  openedAt?: string;
}

export interface IFoodStock extends Document {
  productId: string;
  quantity: number;
  createdAt: Date;
}

const FoodStockSchema: Schema = new Schema<IFoodStock>({
  productId: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export function getFoodStockModel(conn: Connection): Model<IFoodStock> {
  return conn.models.FoodStock || conn.model<IFoodStock>('FoodStock', FoodStockSchema);
}