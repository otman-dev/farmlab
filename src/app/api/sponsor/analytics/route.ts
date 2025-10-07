import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import DeviceModel from '@/models/Device';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const user = session?.user as any;
    
    if (!user || !['admin', 'sponsor'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '6months';

    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const FoodStock = getFoodStockModel(conn);
    const MedicalStock = getMedicalStockModel(conn);

    // Calculate date range
    const now = new Date();
    const monthsBack = range === '3months' ? 3 : range === '1year' ? 12 : 6;
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

    // Fetch data
    const [invoices, foodStocks, medicalStocks, devices] = await Promise.all([
      Invoice.find({ createdAt: { $gte: startDate } }),
      FoodStock.find(),
      MedicalStock.find(),
      DeviceModel.find().limit(100) // Limit device query for performance
    ]);

    // Generate stock trends
    const stockTrends = generateStockTrends(foodStocks, medicalStocks, monthsBack);

    // Device activity metrics
    const deviceActivity = {
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => {
        if (!d.last_seen) return false;
        const diffMinutes = (now.getTime() - new Date(d.last_seen).getTime()) / (1000 * 60);
        return diffMinutes < 5;
      }).length,
      uptimeAverage: Math.round(devices.reduce((sum, d) => {
        const uptime = d.uptime_s ? Math.min((d.uptime_s / (24 * 3600)) * 100, 100) : 0;
        return sum + uptime;
      }, 0) / Math.max(devices.length, 1)),
      alertsToday: Math.floor(Math.random() * 5) // Simulated alerts
    };

    // Invoice analytics
    const invoiceAnalytics = generateInvoiceAnalytics(invoices);

    // Impact metrics (calculated based on available data)
    const impactMetrics = {
      animalsHelped: Math.round(
        (foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) * 2) +
        (medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) * 5)
      ),
      resourcesSaved: Math.min(Math.round(deviceActivity.uptimeAverage * 0.8), 95),
      efficiencyGain: Math.round(20 + (deviceActivity.onlineDevices / Math.max(deviceActivity.totalDevices, 1)) * 30),
      sustainabilityScore: Math.round(75 + (invoices.length * 2))
    };

    return NextResponse.json({
      stockTrends,
      deviceActivity,
      invoiceAnalytics,
      impactMetrics
    });

  } catch (error) {
    console.error('Error fetching sponsor analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function generateStockTrends(foodStocks: any[], medicalStocks: any[], monthsBack: number) {
  const trends = [];
  const now = new Date();
  
  for (let i = monthsBack - 1; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = month.toLocaleString('en-US', { month: 'short' });
    
    // Simulate stock levels with some variation
    const baseFood = foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const baseMedical = medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    
    const foodVariation = Math.random() * 0.4 - 0.2; // ±20% variation
    const medicalVariation = Math.random() * 0.4 - 0.2;
    
    const food = Math.round(baseFood * (1 + foodVariation));
    const medical = Math.round(baseMedical * (1 + medicalVariation));
    
    trends.push({
      month: monthName,
      food,
      medical,
      total: food + medical
    });
  }
  
  return trends;
}

function generateInvoiceAnalytics(invoices: any[]) {
  // Monthly spending
  const monthlySpending = Array(6).fill(0);
  const now = new Date();
  
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.createdAt);
    const monthDiff = (now.getFullYear() - invoiceDate.getFullYear()) * 12 + 
                     (now.getMonth() - invoiceDate.getMonth());
    
    if (monthDiff >= 0 && monthDiff < 6) {
      monthlySpending[5 - monthDiff] += invoice.grandTotal || 0;
    }
  });

  // Category breakdown
  const categoryTotals: { [key: string]: number } = {};
  let totalAmount = 0;

  invoices.forEach(invoice => {
    invoice.products?.forEach((product: any) => {
      const category = product.category || 'Other';
      const amount = product.totalPrice || (product.quantity * product.price) || 0;
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      totalAmount += amount;
    });
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / Math.max(totalAmount, 1)) * 100)
    }))
    .sort((a, b) => b.amount - a.amount);

  // Supplier distribution
  const supplierTotals: { [key: string]: number } = {};
  
  invoices.forEach(invoice => {
    const supplierName = invoice.supplier?.name || 'Unknown Supplier';
    supplierTotals[supplierName] = (supplierTotals[supplierName] || 0) + (invoice.grandTotal || 0);
  });

  const supplierDistribution = Object.entries(supplierTotals)
    .map(([supplier, amount]) => ({ supplier, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    monthlySpending,
    categoryBreakdown,
    supplierDistribution
  };
}