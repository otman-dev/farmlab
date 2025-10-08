import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicineUnitModel } from '@/models/MedicineUnit.cloud';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;
    
    if (!user || !['admin', 'sponsor'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await cloudConnPromise;
    const MedicalStock = getMedicalStockModel(conn);
    const FoodStock = getFoodStockModel(conn);
    const MedicineUnit = getMedicineUnitModel(conn);

    // Fetch all stock data
    const [medicalStock, foodStock, medicineUnits] = await Promise.all([
      MedicalStock.find().sort({ productName: 1 }),
      FoodStock.find().sort({ productName: 1 }),
      MedicineUnit.find().sort({ name: 1 })
    ]);

    // Calculate comprehensive stock analytics
    const analytics = calculateStockAnalytics(medicalStock, foodStock, medicineUnits);
    
    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching stock availability:', error);
    return NextResponse.json({ error: 'Failed to fetch stock availability' }, { status: 500 });
  }
}

function calculateStockAnalytics(medicalStock: any[], foodStock: any[], medicineUnits: any[]) {
  const currentDate = new Date();

  // Animal Medicine Analysis
  const medicineAnalysis = analyzeMedicalStock(medicalStock, medicineUnits, currentDate);
  
  // Animal Feed Analysis  
  const feedAnalysis = analyzeFoodStock(foodStock, currentDate);
  
  // Combined insights
  const overallInsights = generateOverallInsights(medicineAnalysis, feedAnalysis);
  
  // Availability status
  const availabilityStatus = calculateAvailabilityStatus(medicineAnalysis, feedAnalysis);

  return {
    medicine: medicineAnalysis,
    feed: feedAnalysis,
    overall: overallInsights,
    availability: availabilityStatus,
    summary: {
      totalMedicineItems: medicalStock.length,
      totalFeedItems: foodStock.length,
      totalMedicineUnits: medicineUnits.length,
      totalMedicineValue: medicineAnalysis.metrics.totalValue,
      totalFeedValue: feedAnalysis.metrics.totalValue,
      combinedValue: medicineAnalysis.metrics.totalValue + feedAnalysis.metrics.totalValue
    },
    lastUpdated: new Date().toISOString()
  };
}

function analyzeMedicalStock(medicalStock: any[], medicineUnits: any[], currentDate: Date) {
  // Group by categories
  const categorizedStock: { [key: string]: any[] } = {};
  const stockByType: { [key: string]: any[] } = {};
  
  medicalStock.forEach(item => {
    const category = item.category || 'Uncategorized';
    const type = item.type || 'General Medicine';
    
    if (!categorizedStock[category]) categorizedStock[category] = [];
    if (!stockByType[type]) stockByType[type] = [];
    
    categorizedStock[category].push(item);
    stockByType[type].push(item);
  });

  // Calculate metrics for each item
  const enrichedItems = medicalStock.map(item => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const reorderLevel = item.reorderLevel || 10;
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
    
    // Calculate days until expiry
    const daysUntilExpiry = expiryDate 
      ? Math.floor((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Determine status
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    const isLowStock = quantity < reorderLevel;
    const isCriticalStock = quantity < (reorderLevel * 0.5);
    
    // Calculate availability score
    let availabilityScore = 100;
    if (isCriticalStock) availabilityScore = 25;
    else if (isLowStock) availabilityScore = 50;
    else if (quantity < (reorderLevel * 1.5)) availabilityScore = 75;
    
    if (isExpired) availabilityScore = Math.min(availabilityScore, 10);
    else if (isExpiringSoon) availabilityScore = Math.min(availabilityScore, 60);

    return {
      ...item.toObject(),
      quantity,
      unitPrice,
      totalValue: quantity * unitPrice,
      reorderLevel,
      daysUntilExpiry,
      isExpired,
      isExpiringSoon,
      isLowStock,
      isCriticalStock,
      availabilityScore,
      status: getStockStatus(quantity, reorderLevel, isExpired, isExpiringSoon)
    };
  });

  // Category analysis
  const categoryAnalysis = Object.entries(categorizedStock).map(([category, items]) => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    const lowStockItems = items.filter(item => (item.quantity || 0) < (item.reorderLevel || 10)).length;
    const expiredItems = items.filter(item => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) < currentDate;
    }).length;
    const expiringSoonItems = items.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = Math.floor((new Date(item.expiryDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    }).length;
    
    // Calculate category health score
    const healthScore = calculateCategoryHealthScore(items, currentDate);

    return {
      name: category,
      totalItems,
      totalQuantity,
      totalValue: Math.round(totalValue),
      lowStockItems,
      expiredItems,
      expiringSoonItems,
      healthScore,
      items: items.map(item => ({
        ...item,
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalValue: (item.quantity || 0) * (item.unitPrice || 0)
      }))
    };
  });

  // Medicine units categorization
  const medicineUnitsByCategory: { [key: string]: any[] } = {};
  medicineUnits.forEach(unit => {
    const category = unit.category || 'General';
    if (!medicineUnitsByCategory[category]) medicineUnitsByCategory[category] = [];
    medicineUnitsByCategory[category].push(unit);
  });

  // Calculate totals
  const totalValue = enrichedItems.reduce((sum, item) => sum + item.totalValue, 0);
  const totalQuantity = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = enrichedItems.filter(item => item.isLowStock).length;
  const criticalStockCount = enrichedItems.filter(item => item.isCriticalStock).length;
  const expiredCount = enrichedItems.filter(item => item.isExpired).length;
  const expiringSoonCount = enrichedItems.filter(item => item.isExpiringSoon).length;

  // Generate alerts
  const alerts = generateMedicineAlerts(enrichedItems);

  return {
    items: enrichedItems,
    categories: categoryAnalysis,
    medicineUnits: {
      byCategory: Object.entries(medicineUnitsByCategory).map(([category, units]) => ({
        name: category,
        count: units.length,
        units
      })),
      total: medicineUnits.length
    },
    metrics: {
      totalItems: medicalStock.length,
      totalValue: Math.round(totalValue),
      totalQuantity,
      lowStockCount,
      criticalStockCount,
      expiredCount,
      expiringSoonCount,
      availableCategories: categoryAnalysis.length,
      averageHealthScore: Math.round(categoryAnalysis.reduce((sum, cat) => sum + cat.healthScore, 0) / Math.max(categoryAnalysis.length, 1))
    },
    alerts
  };
}

function analyzeFoodStock(foodStock: any[], currentDate: Date) {
  // Group by categories and feed types
  const categorizedStock: { [key: string]: any[] } = {};
  const feedTypes: { [key: string]: any[] } = {};
  
  foodStock.forEach(item => {
    const category = item.category || 'General Feed';
    const feedType = item.feedType || item.type || 'Mixed Feed';
    
    if (!categorizedStock[category]) categorizedStock[category] = [];
    if (!feedTypes[feedType]) feedTypes[feedType] = [];
    
    categorizedStock[category].push(item);
    feedTypes[feedType].push(item);
  });

  // Calculate metrics for each item
  const enrichedItems = foodStock.map(item => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const reorderLevel = item.reorderLevel || 50; // Higher threshold for feed
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
    
    // Calculate days until expiry
    const daysUntilExpiry = expiryDate 
      ? Math.floor((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    // Determine status
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;
    const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 60; // Longer window for feed
    const isLowStock = quantity < reorderLevel;
    const isCriticalStock = quantity < (reorderLevel * 0.3); // Lower critical threshold for feed
    
    // Calculate availability score
    let availabilityScore = 100;
    if (isCriticalStock) availabilityScore = 20;
    else if (isLowStock) availabilityScore = 45;
    else if (quantity < (reorderLevel * 1.5)) availabilityScore = 70;
    
    if (isExpired) availabilityScore = Math.min(availabilityScore, 5);
    else if (isExpiringSoon) availabilityScore = Math.min(availabilityScore, 50);

    return {
      ...item.toObject(),
      quantity,
      unitPrice,
      totalValue: quantity * unitPrice,
      reorderLevel,
      daysUntilExpiry,
      isExpired,
      isExpiringSoon,
      isLowStock,
      isCriticalStock,
      availabilityScore,
      status: getStockStatus(quantity, reorderLevel, isExpired, isExpiringSoon)
    };
  });

  // Category analysis
  const categoryAnalysis = Object.entries(categorizedStock).map(([category, items]) => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    const lowStockItems = items.filter(item => (item.quantity || 0) < (item.reorderLevel || 50)).length;
    const expiredItems = items.filter(item => {
      if (!item.expiryDate) return false;
      return new Date(item.expiryDate) < currentDate;
    }).length;
    const expiringSoonItems = items.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = Math.floor((new Date(item.expiryDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 60;
    }).length;
    
    // Calculate category health score
    const healthScore = calculateCategoryHealthScore(items, currentDate);

    return {
      name: category,
      totalItems,
      totalQuantity,
      totalValue: Math.round(totalValue),
      lowStockItems,
      expiredItems,
      expiringSoonItems,
      healthScore,
      items: items.map(item => ({
        ...item,
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalValue: (item.quantity || 0) * (item.unitPrice || 0)
      }))
    };
  });

  // Feed type analysis
  const feedTypeAnalysis = Object.entries(feedTypes).map(([type, items]) => ({
    name: type,
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    totalValue: Math.round(items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0))
  }));

  // Calculate totals
  const totalValue = enrichedItems.reduce((sum, item) => sum + item.totalValue, 0);
  const totalQuantity = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = enrichedItems.filter(item => item.isLowStock).length;
  const criticalStockCount = enrichedItems.filter(item => item.isCriticalStock).length;
  const expiredCount = enrichedItems.filter(item => item.isExpired).length;
  const expiringSoonCount = enrichedItems.filter(item => item.isExpiringSoon).length;

  // Generate alerts
  const alerts = generateFeedAlerts(enrichedItems);

  return {
    items: enrichedItems,
    categories: categoryAnalysis,
    feedTypes: feedTypeAnalysis,
    metrics: {
      totalItems: foodStock.length,
      totalValue: Math.round(totalValue),
      totalQuantity,
      lowStockCount,
      criticalStockCount,
      expiredCount,
      expiringSoonCount,
      availableCategories: categoryAnalysis.length,
      averageHealthScore: Math.round(categoryAnalysis.reduce((sum, cat) => sum + cat.healthScore, 0) / Math.max(categoryAnalysis.length, 1))
    },
    alerts
  };
}

function calculateCategoryHealthScore(items: any[], currentDate: Date) {
  if (items.length === 0) return 100;
  
  let totalScore = 0;
  items.forEach(item => {
    const quantity = item.quantity || 0;
    const reorderLevel = item.reorderLevel || 10;
    const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
    
    let itemScore = 100;
    
    // Stock level scoring
    if (quantity === 0) itemScore = 0;
    else if (quantity < reorderLevel * 0.5) itemScore = 30;
    else if (quantity < reorderLevel) itemScore = 60;
    else if (quantity < reorderLevel * 1.5) itemScore = 80;
    
    // Expiry scoring
    if (expiryDate) {
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) itemScore = Math.min(itemScore, 10);
      else if (daysUntilExpiry <= 7) itemScore = Math.min(itemScore, 40);
      else if (daysUntilExpiry <= 30) itemScore = Math.min(itemScore, 70);
    }
    
    totalScore += itemScore;
  });
  
  return Math.round(totalScore / items.length);
}

function getStockStatus(quantity: number, reorderLevel: number, isExpired: boolean, isExpiringSoon: boolean) {
  if (isExpired) return 'expired';
  if (quantity === 0) return 'out-of-stock';
  if (quantity < reorderLevel * 0.5) return 'critical';
  if (quantity < reorderLevel) return 'low';
  if (isExpiringSoon) return 'expiring-soon';
  return 'good';
}

function generateMedicineAlerts(items: any[]) {
  const alerts = [];
  
  const criticalItems = items.filter(item => item.isCriticalStock);
  const expiredItems = items.filter(item => item.isExpired);
  const expiringSoonItems = items.filter(item => item.isExpiringSoon);
  
  if (criticalItems.length > 0) {
    alerts.push({
      type: 'critical',
      title: 'Critical Medicine Stock',
      message: `${criticalItems.length} medicine items critically low`,
      items: criticalItems.map(item => item.productName || item.name),
      priority: 'high'
    });
  }
  
  if (expiredItems.length > 0) {
    alerts.push({
      type: 'danger',
      title: 'Expired Medicines',
      message: `${expiredItems.length} medicine items have expired`,
      items: expiredItems.map(item => item.productName || item.name),
      priority: 'high'
    });
  }
  
  if (expiringSoonItems.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Medicines Expiring Soon',
      message: `${expiringSoonItems.length} medicine items expire within 30 days`,
      items: expiringSoonItems.slice(0, 5).map(item => item.productName || item.name),
      priority: 'medium'
    });
  }
  
  return alerts;
}

function generateFeedAlerts(items: any[]) {
  const alerts = [];
  
  const criticalItems = items.filter(item => item.isCriticalStock);
  const expiredItems = items.filter(item => item.isExpired);
  const expiringSoonItems = items.filter(item => item.isExpiringSoon);
  
  if (criticalItems.length > 0) {
    alerts.push({
      type: 'critical',
      title: 'Critical Feed Stock',
      message: `${criticalItems.length} feed items critically low`,
      items: criticalItems.map(item => item.productName || item.name),
      priority: 'high'
    });
  }
  
  if (expiredItems.length > 0) {
    alerts.push({
      type: 'danger',
      title: 'Expired Feed',
      message: `${expiredItems.length} feed items have expired`,
      items: expiredItems.map(item => item.productName || item.name),
      priority: 'medium'
    });
  }
  
  if (expiringSoonItems.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Feed Expiring Soon',
      message: `${expiringSoonItems.length} feed items expire within 60 days`,
      items: expiringSoonItems.slice(0, 5).map(item => item.productName || item.name),
      priority: 'low'
    });
  }
  
  return alerts;
}

function generateOverallInsights(medicineAnalysis: any, feedAnalysis: any) {
  const insights = [];
  
  // Stock level insights
  const totalCritical = medicineAnalysis.metrics.criticalStockCount + feedAnalysis.metrics.criticalStockCount;
  const totalLow = medicineAnalysis.metrics.lowStockCount + feedAnalysis.metrics.lowStockCount;
  
  if (totalCritical > 0) {
    insights.push({
      type: 'critical',
      title: 'Critical Stock Levels',
      description: `${totalCritical} items are critically low and need immediate attention`,
      recommendation: 'Place emergency orders for critical items'
    });
  }
  
  if (totalLow > 5) {
    insights.push({
      type: 'warning',
      title: 'Multiple Low Stock Items',
      description: `${totalLow} items are below reorder levels`,
      recommendation: 'Review and place bulk orders to optimize shipping costs'
    });
  }
  
  // Value distribution insight
  const medicineValue = medicineAnalysis.metrics.totalValue;
  const feedValue = feedAnalysis.metrics.totalValue;
  const totalValue = medicineValue + feedValue;
  
  if (totalValue > 0) {
    const medicinePercentage = Math.round((medicineValue / totalValue) * 100);
    insights.push({
      type: 'info',
      title: 'Inventory Value Distribution',
      description: `${medicinePercentage}% medicine, ${100 - medicinePercentage}% feed`,
      recommendation: 'Monitor value distribution for budget planning'
    });
  }
  
  // Health score insight
  const avgMedicineHealth = medicineAnalysis.metrics.averageHealthScore;
  const avgFeedHealth = feedAnalysis.metrics.averageHealthScore;
  
  if (avgMedicineHealth < 70) {
    insights.push({
      type: 'warning',
      title: 'Medicine Inventory Health',
      description: `Medicine inventory health score is ${avgMedicineHealth}/100`,
      recommendation: 'Focus on restocking medicine categories'
    });
  }
  
  if (avgFeedHealth < 70) {
    insights.push({
      type: 'warning',
      title: 'Feed Inventory Health',
      description: `Feed inventory health score is ${avgFeedHealth}/100`,
      recommendation: 'Focus on restocking feed categories'
    });
  }
  
  return insights;
}

function calculateAvailabilityStatus(medicineAnalysis: any, feedAnalysis: any) {
  // Calculate overall availability scores
  const medicineAvailability = medicineAnalysis.items.length > 0 
    ? Math.round(medicineAnalysis.items.reduce((sum: number, item: any) => sum + item.availabilityScore, 0) / medicineAnalysis.items.length)
    : 100;
    
  const feedAvailability = feedAnalysis.items.length > 0
    ? Math.round(feedAnalysis.items.reduce((sum: number, item: any) => sum + item.availabilityScore, 0) / feedAnalysis.items.length)
    : 100;
  
  const overallAvailability = Math.round((medicineAvailability + feedAvailability) / 2);
  
  return {
    medicine: {
      score: medicineAvailability,
      status: getAvailabilityStatus(medicineAvailability),
      categories: medicineAnalysis.categories.map((cat: any) => ({
        name: cat.name,
        score: cat.healthScore,
        status: getAvailabilityStatus(cat.healthScore)
      }))
    },
    feed: {
      score: feedAvailability,
      status: getAvailabilityStatus(feedAvailability),
      categories: feedAnalysis.categories.map((cat: any) => ({
        name: cat.name,
        score: cat.healthScore,
        status: getAvailabilityStatus(cat.healthScore)
      }))
    },
    overall: {
      score: overallAvailability,
      status: getAvailabilityStatus(overallAvailability)
    }
  };
}

function getAvailabilityStatus(score: number) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 20) return 'poor';
  return 'critical';
}