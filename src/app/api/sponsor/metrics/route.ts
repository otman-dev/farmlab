import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import { getMedicineUnitModel } from '@/models/MedicineUnit.cloud';
import { getStaffModel } from '@/models/Staff.cloud';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string; name?: string; interests?: string[]; expectations?: string[] } | undefined;
    
    if (!user || !['admin', 'sponsor'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const FoodStock = getFoodStockModel(conn);
    const MedicalStock = getMedicalStockModel(conn);
    const MedicineUnit = getMedicineUnitModel(conn);
    const Staff = getStaffModel(conn);

    // Get data from the last 6 months for trend analysis
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Fetch all relevant data
    const [invoices, foodStocks, medicalStocks, medicineUnits, staff] = await Promise.all([
      Invoice.find().sort({ createdAt: -1 }),
      FoodStock.find(),
      MedicalStock.find(),
      MedicineUnit.find(),
      Staff.find()
    ]);

    // 1. Enhanced Total Contribution (actual money spent on farm supplies)
    const totalContribution = invoices.reduce((sum, invoice) => sum + (invoice.grandTotal || 0), 0);
    
    // 2. Items Sponsored with better tracking
    const itemsSponsored = calculateItemsSponsored(invoices);

    // 3. Enhanced Farm Impact Score (comprehensive calculation)
    const farmImpact = calculateFarmImpactScore({
      foodStocks,
      medicalStocks,
      medicineUnits,
      staff,
      invoices
    });

    // 4. Community Reach (more accurate calculation)
    const communityReach = calculateCommunityReach({
      foodStocks,
      medicineUnits,
      invoices
    });

    // 5. Recent Activities with real data
    const recentActivities = await generateRecentActivities(invoices, foodStocks, medicalStocks, medicineUnits);

    // 6. Enhanced Goal Progress
    const goalProgress = await generateGoalProgress(user, {
      totalContribution,
      itemsSponsored,
      farmImpact,
      communityReach,
      invoices,
      medicineUnits
    });

    // Additional metrics for sponsor insights
    const additionalMetrics = {
      totalStaffSupported: staff.length,
      averageMonthlySpending: totalContribution / Math.max(invoices.length, 1),
      medicineUtilizationRate: medicineUnits.length > 0 ? 
        Math.round((medicineUnits.filter(m => m.isUsed).length / medicineUnits.length) * 100) : 0,
      sustainabilityScore: calculateSustainabilityScore(invoices, medicineUnits, foodStocks),
      communityFeedbackCount: 0 // Will be updated when contacts are available
    };

    return NextResponse.json({
      totalContribution: Math.round(totalContribution),
      itemsSponsored,
      farmImpact,
      communityReach,
      recentActivities,
      goalProgress,
      ...additionalMetrics
    });

  } catch (error) {
    console.error('Error fetching sponsor metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

function calculateItemsSponsored(invoices: unknown[]) {
  const sponsoredProductIds = new Set();
  invoices.forEach((invoice: unknown) => {
    const inv = invoice as { products?: { name: string }[] };
    inv.products?.forEach((product) => {
      sponsoredProductIds.add(product.name);
    });
  });
  return sponsoredProductIds.size;
}

function calculateFarmImpactScore(data: {
  foodStocks: { quantity?: number }[];
  medicalStocks: { quantity?: number }[];
  medicineUnits: { isUsed: boolean }[];
  staff: unknown[];
  invoices: { createdAt: string | Date }[];
}) {
  const { foodStocks, medicalStocks, medicineUnits, staff, invoices } = data;
  
  // Calculate stock adequacy (40% of score)
  const totalFoodStock = foodStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
  const totalMedicalStock = medicalStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
  const stockScore = Math.min((totalFoodStock + totalMedicalStock) / 100, 40);
  
  // Calculate medicine utilization efficiency (30% of score)
  const utilizationRate = medicineUnits.length > 0 ? 
    medicineUnits.filter(m => m.isUsed).length / medicineUnits.length : 0;
  const utilizationScore = utilizationRate * 30;
  
  // Calculate investment consistency (20% of score)
  const monthsWithInvoices = getUniqueMonthsFromInvoices(invoices);
  const consistencyScore = Math.min(monthsWithInvoices * 3.33, 20);
  
  // Calculate staff support impact (10% of score)
  const staffScore = Math.min(staff.length * 2, 10);
  
  return Math.round(stockScore + utilizationScore + consistencyScore + staffScore);
}

function calculateCommunityReach(data: {
  foodStocks: { quantity?: number }[];
  medicineUnits: { isExpired: boolean; isUsed: boolean }[];
  invoices: { createdAt: string | Date }[];
}) {
  const { foodStocks, medicineUnits, invoices } = data;
  
  // Estimate animals that can be fed based on food stock
  const totalFoodStock = foodStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
  const animalsFromFood = Math.round(totalFoodStock * 1.5); // Assume 1.5 animals per food unit
  
  // Estimate animals that can be treated based on medicine units
  const usableMedicines = medicineUnits.filter(m => !m.isExpired && !m.isUsed).length;
  const animalsFromMedicine = usableMedicines * 3; // Assume 3 animals per medicine unit
  
  // Add bonus for investment consistency
  const consistencyBonus = Math.min(invoices.length * 5, 50);
  
  return animalsFromFood + animalsFromMedicine + consistencyBonus;
}

function calculateSustainabilityScore(invoices: { createdAt: string | Date }[], medicineUnits: { isExpired: boolean }[], foodStocks: unknown[]) {
  // Base score of 50
  let score = 50;
  
  // Add points for regular investment
  const monthsWithInvestment = getUniqueMonthsFromInvoices(invoices);
  score += Math.min(monthsWithInvestment * 5, 25);
  
  // Add points for medicine efficiency (not letting medicines expire)
  const expiredMedicines = medicineUnits.filter(m => m.isExpired).length;
  const wasteReduction = medicineUnits.length > 0 ? 
    ((medicineUnits.length - expiredMedicines) / medicineUnits.length) * 15 : 10;
  score += wasteReduction;
  
  // Add points for stock management
  const stockManagement = foodStocks.length > 0 ? 10 : 0;
  score += stockManagement;
  
  return Math.min(Math.round(score), 100);
}

function getUniqueMonthsFromInvoices(invoices: { createdAt: string | Date }[]) {
  const months = new Set();
  invoices.forEach(invoice => {
    const date = new Date(invoice.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    months.add(monthKey);
  });
  return months.size;
}

async function generateRecentActivities(
  invoices: { _id: { toString(): string }; invoiceNumber?: number; products?: { quantity?: number }[]; createdAt: string | Date; grandTotal?: number }[],
  foodStocks: { _id: { toString(): string }; quantity?: number; createdAt: string | Date; updatedAt?: string | Date }[],
  medicalStocks: { _id: { toString(): string }; quantity?: number; createdAt: string | Date; updatedAt?: string | Date }[],
  medicineUnits: { _id: { toString(): string }; productName: string; isUsed: boolean; firstUsageDate?: string | Date }[]
) {
  const activities = [];

  // Recent invoices (investment activities)
  const recentInvoices = invoices.slice(0, 3);
  recentInvoices.forEach(invoice => {
    const totalItems = invoice.products?.reduce((sum: number, p: { quantity?: number }) => sum + (p.quantity || 0), 0) || 0;
    activities.push({
      id: invoice._id.toString(),
      type: 'invoice',
      description: `Investment: ${invoice.invoiceNumber || 'INV-' + invoice._id.toString().slice(-6)} - ${totalItems} items purchased`,
      date: new Date(invoice.createdAt).toLocaleDateString(),
      value: invoice.grandTotal
    });
  });

  // Recent medicine usage
  const recentMedicineUsage = medicineUnits
    .filter(m => m.isUsed && m.firstUsageDate)
    .sort((a, b) => new Date(b.firstUsageDate!).getTime() - new Date(a.firstUsageDate!).getTime())
    .slice(0, 2);
    
  recentMedicineUsage.forEach(medicine => {
    activities.push({
      id: medicine._id.toString(),
      type: 'impact',
      description: `Medicine used: ${medicine.productName} - helping farm animals`,
      date: new Date(medicine.firstUsageDate!).toLocaleDateString()
    });
  });

  // Stock level updates (simulated recent activity)
  const allStocks = [...foodStocks, ...medicalStocks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 1);

  allStocks.forEach(stock => {
    activities.push({
      id: stock._id.toString(),
      type: 'stock',
      description: `Stock update: ${stock.quantity} units available for farm operations`,
      date: new Date(stock.createdAt).toLocaleDateString()
    });
  });

  return activities.slice(0, 5);
}

async function generateGoalProgress(
  user: { interests?: string[]; expectations?: string[] },
  metrics: {
    totalContribution: number;
    itemsSponsored: number;
    farmImpact: number;
    communityReach: number;
    invoices: unknown[];
    medicineUnits: { isUsed: boolean }[];
  }
) {
  const goals = [];

  // Based on user interests, create relevant goals
  const interests = user.interests || [];
  const expectations = user.expectations || [];

  if (interests.includes('sustainability') || expectations.includes('reduce_costs')) {
    goals.push({
      category: 'Cost Efficiency',
      current: metrics.totalContribution,
      target: Math.max(10000, metrics.totalContribution * 1.5),
      description: 'Optimize farm operational costs through strategic sponsorship'
    });
  }

  if (interests.includes('monitoring') || expectations.includes('improve_quality')) {
    goals.push({
      category: 'Farm Impact',
      current: metrics.farmImpact,
      target: 100,
      description: 'Maximize positive impact on farm operations and animal welfare'
    });
  }

  if (expectations.includes('scale_operations') || interests.includes('collaboration')) {
    goals.push({
      category: 'Community Reach',
      current: metrics.communityReach,
      target: Math.max(1000, metrics.communityReach * 1.3),
      description: 'Expand positive impact to benefit more animals and operations'
    });
  }

  // Medicine efficiency goal
  if (metrics.medicineUnits && metrics.medicineUnits.length > 0) {
    const utilizationRate = metrics.medicineUnits.filter((m: { isUsed: boolean }) => m.isUsed).length / metrics.medicineUnits.length * 100;
    goals.push({
      category: 'Medicine Efficiency',
      current: Math.round(utilizationRate),
      target: 85,
      description: 'Ensure efficient use of sponsored medical supplies'
    });
  }

  // Default goals if no specific interests
  if (goals.length === 0) {
    goals.push(
      {
        category: 'Investment Value',
        current: metrics.totalContribution,
        target: 5000,
        description: 'Total value of farm improvement investments'
      },
      {
        category: 'Sustainability Score',
        current: 75, // Default sustainability score
        target: 90,
        description: 'Overall sustainability and efficiency rating'
      }
    );
  }

  return goals;
}

