import mongoose, { Schema, models } from "mongoose";

export interface FoodStockUnit {
  openedAt?: string;
}

export interface FoodStock {
  _id?: string;
  productId: string;
  productName: string;
  quantity: number;
  createdAt?: string;
}

const FoodStockUnitSchema = new Schema<FoodStockUnit>({
  openedAt: { type: String },
});


const FoodStockSchema = new Schema<FoodStock>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default models.FoodStock || mongoose.model("FoodStock", FoodStockSchema);
