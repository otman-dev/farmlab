import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import { getMedicineUnitModel } from '@/models/MedicineUnit.cloud';
import DeviceModel from '@/models/Device';

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

    // Calculate sponsor metrics based on available data
    
    // 1. Total Contribution (from invoices)
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    const totalContribution = invoices.reduce((sum, invoice) => sum + (invoice.grandTotal || 0), 0);
    
    // 2. Items Sponsored (total unique products across all invoices)
    const uniqueProducts = new Set();
    invoices.forEach(invoice => {
      invoice.products?.forEach((product: any) => {
        uniqueProducts.add(product.name);
      });
    });
    const itemsSponsored = uniqueProducts.size;

    // 3. Farm Impact Score (based on stock levels and device activity)
    const foodStocks = await FoodStock.find();
    const medicalStocks = await MedicalStock.find();
    const totalFoodItems = foodStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
    const totalMedicalItems = medicalStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
    const farmImpact = Math.round((totalFoodItems + totalMedicalItems) / 10); // Simplified impact score

    // 4. Community Reach (estimated based on stock capacity)
    const communityReach = Math.round((totalFoodItems * 2 + totalMedicalItems * 5)); // Estimate animals helped

    // 5. Recent Activities
    const recentActivities = await generateRecentActivities(invoices, foodStocks, medicalStocks);

    // 6. Goal Progress (based on user interests and expectations)
    const goalProgress = await generateGoalProgress(user, {
      totalContribution,
      itemsSponsored,
      farmImpact,
      communityReach
    });

    return NextResponse.json({
      totalContribution: Math.round(totalContribution),
      itemsSponsored,
      farmImpact,
      communityReach,
      recentActivities,
      goalProgress
    });

  } catch (error) {
    console.error('Error fetching sponsor metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

async function generateRecentActivities(invoices: any[], foodStocks: any[], medicalStocks: any[]) {
  const activities = [];

  // Recent invoices
  const recentInvoices = invoices.slice(0, 3);
  recentInvoices.forEach(invoice => {
    activities.push({
      id: invoice._id.toString(),
      type: 'invoice',
      description: `New invoice: ${invoice.invoiceNumber} (${invoice.products?.length || 0} items)`,
      date: new Date(invoice.createdAt).toLocaleDateString(),
      value: invoice.grandTotal
    });
  });

  // Stock updates (simulated recent activity)
  const recentStocks = [...foodStocks, ...medicalStocks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 2);

  recentStocks.forEach(stock => {
    activities.push({
      id: stock._id.toString(),
      type: 'stock',
      description: `Stock updated: ${stock.quantity} units available`,
      date: new Date(stock.updatedAt || stock.createdAt).toLocaleDateString()
    });
  });

  return activities.slice(0, 5);
}

async function generateGoalProgress(user: any, metrics: any) {
  const goals = [];

  // Based on user interests, create relevant goals
  const interests = user.interests || [];
  const expectations = user.expectations || [];

  if (interests.includes('sustainability') || expectations.includes('reduce_costs')) {
    goals.push({
      category: 'Cost Efficiency',
      current: metrics.totalContribution,
      target: 10000,
      description: 'Reduce farm operational costs through strategic sponsorship'
    });
  }

  if (interests.includes('monitoring') || expectations.includes('improve_quality')) {
    goals.push({
      category: 'Quality Impact',
      current: metrics.farmImpact,
      target: 100,
      description: 'Improve farm quality metrics through technology and supplies'
    });
  }

  if (expectations.includes('scale_operations') || interests.includes('collaboration')) {
    goals.push({
      category: 'Community Reach',
      current: metrics.communityReach,
      target: 1000,
      description: 'Expand impact to benefit more animals and farming operations'
    });
  }

  // Default goals if no specific interests
  if (goals.length === 0) {
    goals.push(
      {
        category: 'Sponsorship Value',
        current: metrics.totalContribution,
        target: 5000,
        description: 'Total value of farm sponsorship contributions'
      },
      {
        category: 'Items Sponsored',
        current: metrics.itemsSponsored,
        target: 50,
        description: 'Different types of farm supplies and equipment sponsored'
      }
    );
  }

  return goals;
}