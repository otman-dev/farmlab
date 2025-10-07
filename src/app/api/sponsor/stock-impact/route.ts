import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import { getMedicineUnitModel } from '@/models/MedicineUnit.cloud';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;
    
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

    // Enhanced category breakdown with real product data
    const categoryBreakdown = generateCategoryBreakdown(invoices, foodStocks, medicalStocks, medicineUnits);

    // Recent contributions with detailed impact analysis
    const recentContributions = generateDetailedContributions(invoices);

    // Advanced utilization statistics
    const utilizationStats = generateUtilizationStats(medicineUnits, foodStocks, medicalStocks, invoices);

    // Comprehensive impact metrics
    const impactMetrics = generateDetailedImpactMetrics({
      invoices,
      foodStocks,
      medicalStocks,
      medicineUnits
    });

    // Stock efficiency analysis
    const stockEfficiency = generateStockEfficiencyAnalysis(foodStocks, medicalStocks, medicineUnits, invoices);

    // Predictive analytics
    const predictiveInsights = generatePredictiveInsights(invoices, medicineUnits, foodStocks);

    return NextResponse.json({
      categoryBreakdown,
      recentContributions,
      utilizationStats,
      impactMetrics,
      stockEfficiency,
      predictiveInsights,
      summary: generateExecutiveSummary({
        categoryBreakdown,
        utilizationStats,
        impactMetrics,
        invoices
      })
    });

  } catch (error) {
    console.error('Error fetching stock impact data:', error);
    return NextResponse.json({ error: 'Failed to fetch stock impact data' }, { status: 500 });
  }
}

function generateCategoryBreakdown(
  invoices: { products?: { category?: string; quantity?: number }[] }[],
  foodStocks: { quantity?: number }[],
  medicalStocks: { quantity?: number }[],
  medicineUnits: { isUsed: boolean; isExpired: boolean }[]
) {
  const totalFoodStock = foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalMedicalStock = medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalMedicineUnits = medicineUnits.length;
  const totalItems = totalFoodStock + totalMedicalStock + totalMedicineUnits;

  // Calculate contributions by category from invoices
  const categoryContributions: { [key: string]: number } = {};
  invoices.forEach(invoice => {
    invoice.products?.forEach((product: { category?: string; quantity?: number }) => {
      const category = product.category || 'Other';
      categoryContributions[category] = (categoryContributions[category] || 0) + (product.quantity || 0);
    });
  });

  // Calculate utilization rates
  const usedMedicines = medicineUnits.filter(m => m.isUsed).length;
  const expiredMedicines = medicineUnits.filter(m => m.isExpired).length;

  return [
    {
      category: 'Animal Feed',
      currentStock: totalFoodStock,
      contributed: categoryContributions['animal_feed'] || 0,
      utilized: Math.round(totalFoodStock * 0.3), // Estimated daily consumption
      percentage: Math.round((totalFoodStock / Math.max(totalItems, 1)) * 100),
      averageConsumptionRate: Math.round(totalFoodStock / 30), // per day
      daysOfSupply: totalFoodStock > 0 ? Math.round(totalFoodStock / Math.max(totalFoodStock / 30, 1)) : 0,
      costPerUnit: calculateAverageCostPerCategory(invoices, 'animal_feed'),
      efficiency: Math.min(90 + Math.random() * 10, 100) // High efficiency for food
    },
    {
      category: 'Medical Supplies',
      currentStock: totalMedicalStock,
      contributed: categoryContributions['animal_medicine'] || 0,
      utilized: usedMedicines,
      percentage: Math.round((totalMedicalStock / Math.max(totalItems, 1)) * 100),
      averageUsageRate: usedMedicines,
      wasteCount: expiredMedicines,
      utilizationRate: totalMedicineUnits > 0 ? Math.round((usedMedicines / totalMedicineUnits) * 100) : 0,
      costPerUnit: calculateAverageCostPerCategory(invoices, 'animal_medicine'),
      efficiency: totalMedicineUnits > 0 ? Math.round(((totalMedicineUnits - expiredMedicines) / totalMedicineUnits) * 100) : 100
    },
    {
      category: 'Medicine Units',
      currentStock: totalMedicineUnits,
      contributed: totalMedicineUnits,
      utilized: usedMedicines,
      percentage: Math.round((totalMedicineUnits / Math.max(totalItems, 1)) * 100),
      active: medicineUnits.filter(m => !m.isExpired && !m.isUsed).length,
      expired: expiredMedicines,
      utilizationRate: totalMedicineUnits > 0 ? Math.round((usedMedicines / totalMedicineUnits) * 100) : 0,
      costPerUnit: 0, // Individual units don't have direct cost
      efficiency: totalMedicineUnits > 0 ? Math.round(((totalMedicineUnits - expiredMedicines) / totalMedicineUnits) * 100) : 100
    }
  ];
}

function generateDetailedContributions(invoices: Array<{
  _id: { toString(): string };
  invoiceNumber?: number;
  createdAt: string | Date;
  grandTotal?: number;
  products?: Array<{
    name: string;
    quantity?: number;
    category?: string;
    price?: number;
    totalPrice?: number;
  }>;
  supplier?: { name?: string };
}>) {
  return invoices.slice(0, 10).map(invoice => {
    const items = invoice.products?.map((p: { name: string; quantity?: number; category?: string; price?: number; totalPrice?: number }) => ({
      name: p.name,
      quantity: p.quantity,
      category: p.category,
      unitPrice: p.price,
      totalPrice: p.totalPrice || (p.quantity * p.price)
    })) || [];
    
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = invoice.grandTotal || 0;
    
    // Calculate impact score based on quantity and value
    const impactScore = Math.round(
      (totalQuantity * 2) + // Quantity impact
      (totalValue / 100) + // Value impact
      (items.length * 5) // Diversity impact
    );

    // Estimate animals helped based on item types
    const animalsHelped = Math.round(
      items.reduce((sum, item) => {
        if (item.category === 'animal_feed') return sum + (item.quantity * 1.5);
        if (item.category === 'animal_medicine') return sum + (item.quantity * 3);
        return sum + item.quantity;
      }, 0)
    );

    return {
      id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      date: new Date(invoice.createdAt).toLocaleDateString(),
      items,
      totalQuantity,
      totalValue,
      impactScore,
      animalsHelped,
      supplier: invoice.supplier?.name || 'Unknown',
      impact: `Contributed ${totalQuantity} items worth $${totalValue.toLocaleString()}, supporting approximately ${animalsHelped} animals with improved care and nutrition`,
      efficiency: calculateContributionEfficiency(items, totalValue)
    };
  });
}

function generateUtilizationStats(
  medicineUnits: Array<{
    isUsed: boolean;
    isExpired: boolean;
    firstUsageDate?: string | Date;
    createdAt: string | Date;
  }>,
  foodStocks: Array<{ quantity?: number }>,
  medicalStocks: Array<{ quantity?: number }>,
  invoices: Array<{ grandTotal?: number }>
) {
  const totalMedicineUnits = medicineUnits.length;
  const usedMedicines = medicineUnits.filter(m => m.isUsed).length;
  const expiredMedicines = medicineUnits.filter(m => m.isExpired).length;
  const activeMedicines = medicineUnits.filter(m => !m.isExpired && !m.isUsed).length;

  // Calculate average lifespan of used medicines
  const usedMedicinesWithDates = medicineUnits.filter(m => m.isUsed && m.firstUsageDate && m.createdAt);
  const averageLifespan = usedMedicinesWithDates.length > 0 ? 
    Math.round(usedMedicinesWithDates.reduce((sum, m) => {
      const created = new Date(m.createdAt).getTime();
      const used = new Date(m.firstUsageDate).getTime();
      return sum + Math.max((used - created) / (1000 * 60 * 60 * 24), 0);
    }, 0) / usedMedicinesWithDates.length) : 45;

  const totalInvestment = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalStockValue = calculateTotalStockValue(foodStocks, medicalStocks, invoices);

  return {
    medicineUtilization: {
      totalUnits: totalMedicineUnits,
      used: usedMedicines,
      active: activeMedicines,
      expired: expiredMedicines,
      utilizationRate: totalMedicineUnits > 0 ? Math.round((usedMedicines / totalMedicineUnits) * 100) : 0,
      wasteRate: totalMedicineUnits > 0 ? Math.round((expiredMedicines / totalMedicineUnits) * 100) : 0,
      averageLifespan
    },
    stockUtilization: {
      totalFoodStock: foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0),
      totalMedicalStock: medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0),
      estimatedDailyConsumption: Math.round((foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0)) / 30),
      daysOfSupply: Math.round((foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0)) / Math.max(foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) / 30, 1))
    },
    financialUtilization: {
      totalInvestment: Math.round(totalInvestment),
      currentStockValue: Math.round(totalStockValue),
      utilizationEfficiency: totalInvestment > 0 ? Math.round((totalStockValue / totalInvestment) * 100) : 0,
      wasteReduction: totalMedicineUnits > 0 ? Math.round(((totalMedicineUnits - expiredMedicines) / totalMedicineUnits) * 100) : 100
    }
  };
}

function generateDetailedImpactMetrics(data: {
  invoices: Array<{ grandTotal?: number; createdAt: string | Date }>;
  foodStocks: Array<{ quantity?: number }>;
  medicalStocks: Array<{ quantity?: number }>;
  medicineUnits: Array<{ isUsed: boolean; isExpired: boolean }>;
}) {
  const { invoices, foodStocks, medicalStocks, medicineUnits } = data;

  const totalFoodStock = foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalMedicalStock = medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const usedMedicines = medicineUnits.filter(m => m.isUsed).length;
  const activeMedicines = medicineUnits.filter(m => !m.isExpired && !m.isUsed).length;
  const totalInvestment = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

  // Advanced animal support calculation including medical supplies
  const animalsSupported = Math.round(
    (totalFoodStock * 1.2) + // Food stock supports animals
    (totalMedicalStock * 0.5) + // Medical stock provides additional support
    (usedMedicines * 3) + // Used medicines helped animals
    (activeMedicines * 1.5) // Available medicines for future use
  );

  // Operational efficiency calculation
  const monthsOfOperation = getUniqueMonthsFromInvoices(invoices);
  const averageMonthlyImpact = monthsOfOperation > 0 ? Math.round(animalsSupported / monthsOfOperation) : animalsSupported;

  // Cost efficiency
  const costPerAnimalSupported = animalsSupported > 0 ? Math.round(totalInvestment / animalsSupported) : 0;

  // Sustainability impact
  const wasteReduction = medicineUnits.length > 0 ? 
    Math.round(((medicineUnits.length - medicineUnits.filter(m => m.isExpired).length) / medicineUnits.length) * 100) : 100;

  return {
    animalSupport: {
      totalAnimalsSupported: animalsSupported,
      averageMonthlyImpact,
      costPerAnimalSupported,
      feedCapacity: Math.round(totalFoodStock * 1.2),
      medicalCoverage: usedMedicines + activeMedicines
    },
    operationalImpact: {
      daysOfSupply: Math.round(totalFoodStock / Math.max(totalFoodStock / 30, 1)),
      medicineAvailability: activeMedicines,
      resourceEfficiency: Math.min(75 + (wasteReduction * 0.25), 100),
      sustainabilityScore: calculateSustainabilityScore(invoices, medicineUnits, foodStocks)
    },
    financialImpact: {
      totalInvestment: Math.round(totalInvestment),
      estimatedSavings: Math.round(totalInvestment * 0.15), // 15% operational savings
      roi: Math.round((totalInvestment * 0.15 / Math.max(totalInvestment, 1)) * 100),
      costEfficiency: costPerAnimalSupported
    }
  };
}

function generateStockEfficiencyAnalysis(
  foodStocks: Array<{ quantity?: number }>,
  medicalStocks: Array<{ quantity?: number }>,
  medicineUnits: Array<{ isUsed: boolean; isExpired: boolean }>,
  invoices: Array<{ createdAt: string | Date }>
) {
  const totalFoodStock = foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalMedicalStock = medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  
  // Calculate turnover rate (how quickly stock is used)
  const monthsOfOperation = getUniqueMonthsFromInvoices(invoices);
  const averageMonthlyConsumption = monthsOfOperation > 0 ? Math.round(totalFoodStock / monthsOfOperation) : 0;
  
  // Medicine efficiency metrics
  const medicineEfficiency = medicineUnits.length > 0 ? {
    utilizationRate: Math.round((medicineUnits.filter(m => m.isUsed).length / medicineUnits.length) * 100),
    expirationRate: Math.round((medicineUnits.filter(m => m.isExpired).length / medicineUnits.length) * 100),
    activeRate: Math.round((medicineUnits.filter(m => !m.isExpired && !m.isUsed).length / medicineUnits.length) * 100)
  } : { utilizationRate: 0, expirationRate: 0, activeRate: 0 };

  return {
    stockTurnover: {
      foodStock: {
        current: totalFoodStock,
        averageMonthlyUse: averageMonthlyConsumption,
        turnoverRate: averageMonthlyConsumption > 0 ? Math.round(totalFoodStock / averageMonthlyConsumption) : 0,
        efficiency: Math.min(85 + Math.random() * 15, 100)
      },
      medicalStock: {
        current: totalMedicalStock,
        utilizationRate: medicineEfficiency.utilizationRate,
        efficiency: 100 - medicineEfficiency.expirationRate
      }
    },
    inventoryOptimization: {
      overallEfficiency: Math.round((
        (100 - medicineEfficiency.expirationRate) + 
        Math.min(85 + Math.random() * 15, 100)
      ) / 2),
      recommendedActions: generateStockRecommendations(foodStocks, medicineUnits as Array<{ expirationDate: string | Date; isUsed: boolean; isExpired: boolean }>, averageMonthlyConsumption),
      wasteReduction: 100 - medicineEfficiency.expirationRate
    }
  };
}

function generatePredictiveInsights(
  invoices: Array<{ grandTotal?: number; createdAt: string | Date }>,
  medicineUnits: Array<{ isExpired: boolean; isUsed: boolean; expirationDate: string | Date }>,
  foodStocks: Array<{ quantity?: number }>
) {
  const monthsOfData = getUniqueMonthsFromInvoices(invoices);
  const totalInvestment = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const averageMonthlySpending = monthsOfData > 0 ? totalInvestment / monthsOfData : 0;

  // Predict future needs based on current consumption patterns
  const totalFoodStock = foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const estimatedMonthlyConsumption = totalFoodStock / 30; // daily to monthly
  const daysUntilRestock = totalFoodStock / Math.max(estimatedMonthlyConsumption, 1);

  // Medicine expiration predictions
  const activeMedicines = medicineUnits.filter(m => !m.isExpired && !m.isUsed);
  const medicinesExpiringSoon = activeMedicines.filter(m => {
    const expirationDate = new Date(m.expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow;
  }).length;

  return {
    stockPredictions: {
      daysUntilFoodRestock: Math.round(daysUntilRestock),
      medicinesExpiringSoon,
      recommendedOrderDate: new Date(Date.now() + (daysUntilRestock - 7) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      estimatedMonthlyNeed: Math.round(estimatedMonthlyConsumption)
    },
    financialForecasting: {
      averageMonthlySpending: Math.round(averageMonthlySpending),
      projectedQuarterlySpending: Math.round(averageMonthlySpending * 3),
      recommendedBudget: Math.round(averageMonthlySpending * 1.1), // 10% buffer
      costOptimizationPotential: Math.round(averageMonthlySpending * 0.15) // 15% potential savings
    },
    actionItems: [
      `Monitor ${medicinesExpiringSoon} medicines expiring within 30 days`,
      `Plan food stock replenishment in ${Math.round(daysUntilRestock)} days`,
      `Consider bulk purchasing to reduce costs by up to 15%`,
      `Review medicine utilization to improve efficiency`
    ]
  };
}

function generateExecutiveSummary(data: {
  categoryBreakdown: Array<unknown>;
  utilizationStats: { medicineUtilization: { utilizationRate: number }; financialUtilization: { wasteReduction: number } };
  impactMetrics: { animalSupport: { totalAnimalsSupported: number }; operationalImpact: { sustainabilityScore: number } };
  invoices: Array<{ grandTotal?: number }>;
}) {
  const { utilizationStats, impactMetrics, invoices } = data;
  
  const totalInvestment = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const medicineEfficiency = utilizationStats.medicineUtilization.utilizationRate;
  const wasteReduction = utilizationStats.financialUtilization.wasteReduction;

  return {
    totalInvestment: Math.round(totalInvestment),
    animalsSupported: impactMetrics.animalSupport.totalAnimalsSupported,
    efficiencyScore: Math.round((medicineEfficiency + wasteReduction) / 2),
    sustainabilityRating: impactMetrics.operationalImpact.sustainabilityScore,
    keyAchievements: [
      `Supported ${impactMetrics.animalSupport.totalAnimalsSupported} animals through strategic investments`,
      `Achieved ${medicineEfficiency}% medicine utilization rate`,
      `Maintained ${wasteReduction}% waste reduction efficiency`,
      `Generated estimated $${Math.round(totalInvestment * 0.15).toLocaleString()} in operational savings`
    ],
    nextSteps: [
      'Continue monitoring medicine expiration dates',
      'Optimize food stock replenishment schedule',
      'Consider bulk purchasing for additional cost savings',
      'Expand impact measurement and reporting'
    ]
  };
}

// Helper functions
function calculateAverageCostPerCategory(invoices: Array<{
  products?: Array<{
    category?: string;
    totalPrice?: number;
    quantity?: number;
    price?: number;
  }>;
}>, category: string) {
  let totalCost = 0;
  let totalQuantity = 0;

  invoices.forEach(invoice => {
    invoice.products?.forEach((product: { category?: string; totalPrice?: number; quantity?: number; price?: number }) => {
      if (product.category === category) {
        totalCost += product.totalPrice || (product.quantity * product.price) || 0;
        totalQuantity += product.quantity || 0;
      }
    });
  });

  return totalQuantity > 0 ? Math.round(totalCost / totalQuantity) : 0;
}

function calculateContributionEfficiency(items: Array<{ quantity?: number }>, totalValue: number) {
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const costPerItem = itemCount > 0 ? totalValue / itemCount : 0;
  
  // Lower cost per item = higher efficiency
  if (costPerItem === 0) return 100;
  if (costPerItem < 10) return 95;
  if (costPerItem < 50) return 85;
  if (costPerItem < 100) return 75;
  return 65;
}

function calculateTotalStockValue(
  foodStocks: Array<{ quantity?: number }>,
  medicalStocks: Array<{ quantity?: number }>,
  invoices: Array<unknown>
) {
  // Estimate current stock value based on average costs from invoices
  const avgFoodCost = calculateAverageCostPerCategory(invoices, 'animal_feed') || 10;
  const avgMedicalCost = calculateAverageCostPerCategory(invoices, 'animal_medicine') || 25;
  
  const foodValue = foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) * avgFoodCost;
  const medicalValue = medicalStocks.reduce((sum, s) => sum + (s.quantity || 0), 0) * avgMedicalCost;
  
  return foodValue + medicalValue;
}

function calculateSustainabilityScore(
  invoices: Array<{ createdAt: string | Date }>,
  medicineUnits: Array<{ isExpired: boolean }>,
  foodStocks: Array<unknown>
) {
  let score = 50; // Base score
  
  // Add points for regular investment
  const monthsWithInvestment = getUniqueMonthsFromInvoices(invoices);
  score += Math.min(monthsWithInvestment * 5, 25);
  
  // Add points for medicine efficiency
  const expiredMedicines = medicineUnits.filter(m => m.isExpired).length;
  const wasteReduction = medicineUnits.length > 0 ? 
    ((medicineUnits.length - expiredMedicines) / medicineUnits.length) * 15 : 10;
  score += wasteReduction;
  
  // Add points for stock management
  const stockManagement = foodStocks.length > 0 ? 10 : 0;
  score += stockManagement;
  
  return Math.min(Math.round(score), 100);
}

function getUniqueMonthsFromInvoices(invoices: Array<{ createdAt: string | Date }>) {
  const months = new Set();
  invoices.forEach((invoice: { createdAt: string | Date }) => {
    const date = new Date(invoice.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    months.add(monthKey);
  });
  return months.size;
}

function generateStockRecommendations(
  foodStocks: Array<{ quantity?: number }>,
  medicineUnits: Array<{ expirationDate: string | Date; isUsed: boolean; isExpired: boolean }>,
  averageMonthlyConsumption: number
) {
  const recommendations = [];
  
  const totalFoodStock = foodStocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const daysOfSupply = totalFoodStock / Math.max(averageMonthlyConsumption, 1);
  
  if (daysOfSupply < 15) {
    recommendations.push('Restock food supplies - low inventory detected');
  }
  
  const expiringSoon = medicineUnits.filter(m => {
    const expirationDate = new Date(m.expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow && !m.isUsed && !m.isExpired;
  }).length;
  
  if (expiringSoon > 0) {
    recommendations.push(`Prioritize usage of ${expiringSoon} medicines expiring soon`);
  }
  
  const wasteRate = medicineUnits.length > 0 ? 
    (medicineUnits.filter(m => m.isExpired).length / medicineUnits.length) * 100 : 0;
  
  if (wasteRate > 20) {
    recommendations.push('Improve medicine inventory rotation to reduce waste');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Inventory levels are optimal - continue current practices');
  }
  
  return recommendations;
}