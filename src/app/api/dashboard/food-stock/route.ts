import { NextRequest, NextResponse } from "next/server";
import { getCloudConnection } from "@/lib/mongodb-cloud";

import FoodStockSchema from '@/models/FoodStock';

export async function GET() {
  const conn = await getCloudConnection();
  const FoodStock = conn.models.FoodStock || conn.model('FoodStock', FoodStockSchema.schema || FoodStockSchema);
  try {
    const stocks = await FoodStock.find({}).populate("product").sort({ createdAt: -1 });
    return NextResponse.json({ stocks });
  } catch {
    return NextResponse.json({ error: "Failed to fetch food stock" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const conn = await getCloudConnection();
  const FoodStock = conn.models.FoodStock || conn.model('FoodStock', FoodStockSchema.schema || FoodStockSchema);
  const { stockId, unitIndex, openedAt } = await req.json();
  try {
    const stock = await FoodStock.findById(stockId);
    if (!stock) return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    if (!stock.units[unitIndex]) return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    stock.units[unitIndex].openedAt = openedAt;
    await stock.save();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const conn = await getCloudConnection();
  const FoodStock = conn.models.FoodStock || conn.model('FoodStock', FoodStockSchema.schema || FoodStockSchema);
  const { product, units } = await req.json();
  try {
    const newStock = await FoodStock.create({ product, units });
    return NextResponse.json({ stock: newStock });
  } catch {
    return NextResponse.json({ error: "Failed to create food stock" }, { status: 500 });
  }
}
