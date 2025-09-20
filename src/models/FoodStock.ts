import mongoose, { Schema, models } from "mongoose";

export interface FoodStockUnit {
  openedAt?: string;
}

export interface FoodStock {
  _id?: string;
  product: mongoose.Types.ObjectId;
  units: FoodStockUnit[];
  createdAt?: string;
}

const FoodStockUnitSchema = new Schema<FoodStockUnit>({
  openedAt: { type: String },
});

const FoodStockSchema = new Schema<FoodStock>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  units: { type: [FoodStockUnitSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default models.FoodStock || mongoose.model("FoodStock", FoodStockSchema);
