import mongoose, { Schema, models } from "mongoose";

export interface FoodStockUnit {
  openedAt?: string;
}

export interface FoodStock {
  _id?: string;
  productId: string;
  // productName removed; use productId reference only
  quantity: number;
  createdAt?: Date;
}

const FoodStockSchema = new Schema<FoodStock>({
  productId: { type: String, required: true },
  // productName removed from schema
  quantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default models.FoodStock || mongoose.model("FoodStock", FoodStockSchema);
