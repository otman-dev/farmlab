import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import { getMedicineUnitModel } from '@/models/MedicineUnit.cloud';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const user = session?.user as any;
    
    if (!user || !['admin', 'sponsor'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const FoodStock = getFoodStockModel(conn);
    const MedicalStock = getMedicalStockModel(conn);
    const MedicineUnit = getMedicineUnitModel(conn);

    // Fetch all relevant data
    const [invoices, foodStocks, medicalStocks, medicineUnits] = await Promise.all([
      Invoice.find().sort({ createdAt: -1 }),
      FoodStock.find(),
      MedicalStock.find(),
      MedicineUnit.find().sort({ createdAt: -1 })
    ]);

    // Calculate total items across all categories
    const totalItems = foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) +
                      medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);

    // Category breakdown
    const categoryBreakdown = [
      {
        category: 'Animal Feed',
        current: foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0),
        contributed: foodStocks.length * 50, // Estimated
        utilized: Math.round(foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) * 0.3),
        percentage: Math.round((foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) / Math.max(totalItems, 1)) * 100)
      },
      {
        category: 'Medical Supplies',
        current: medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0),
        contributed: medicineUnits.length,
        utilized: medicineUnits.filter(unit => unit.isUsed).length,
        percentage: Math.round((medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) / Math.max(totalItems, 1)) * 100)
      }
    ];

    // Recent contributions (from invoices)
    const recentContributions = invoices.slice(0, 5).map(invoice => {
      const items = invoice.products?.map((p: any) => p.name) || [];
      const quantity = invoice.products?.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0) || 0;
      
      return {
        id: invoice._id.toString(),
        date: new Date(invoice.createdAt).toLocaleDateString(),
        items: items.slice(0, 3), // Show first 3 items
        quantity,
        value: invoice.grandTotal || 0,
        impact: `Supported farm operations with ${quantity} items, benefiting approximately ${Math.round(quantity * 2)} animals`
      };
    });

    // Utilization statistics
    const totalUtilized = medicineUnits.filter(unit => unit.isUsed).length +
                         Math.round(foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) * 0.3);
    const totalContributed = medicineUnits.length + foodStocks.length * 50;
    
    const utilizationStats = {
      totalUtilized,
      utilizationRate: Math.round((totalUtilized / Math.max(totalContributed, 1)) * 100),
      averageLifespan: 45, // Estimated average days
      wasteReduction: 78 // Estimated percentage
    };

    // Impact metrics
    const impactMetrics = {
      animalsSupported: Math.round(totalItems * 1.5),
      daysOfSupply: Math.round(totalItems / 20), // Estimated
      costSavings: Math.round(invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0) * 0.15),
      sustainability: Math.min(85 + Math.round(totalUtilized / 10), 100)
    };

    return NextResponse.json({
      totalItems,
      categoryBreakdown,
      recentContributions,
      utilizationStats,
      impactMetrics
    });

  } catch (error) {
    console.error('Error fetching stock impact data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock impact data' }, { status: 500 });
  }
}