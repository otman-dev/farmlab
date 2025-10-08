import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getSupplierModel } from '@/models/Supplier.cloud';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;
    
    if (!user || !['admin', 'sponsor'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);
    const Supplier = getSupplierModel(conn);

    // Get all invoices and suppliers
    const [invoices, suppliers] = await Promise.all([
      Invoice.find().sort({ createdAt: -1 }),
      Supplier.find()
    ]);

    // Calculate comprehensive analytics
    const analytics = calculateInvoiceAnalytics(invoices, suppliers);
    
    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice analytics' }, { status: 500 });
  }
}

function calculateInvoiceAnalytics(invoices: any[], suppliers: any[]) {
  const totalInvoices = invoices.length;
  
  if (totalInvoices === 0) {
    return {
      totalInvoices: 0,
      summary: {},
      spending: {},
      trends: {},
      suppliers: {},
      insights: []
    };
  }

  // Summary metrics
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const averageInvoiceValue = totalAmount / totalInvoices;
  const largestInvoice = Math.max(...invoices.map(inv => inv.grandTotal || 0));
  const smallestInvoice = Math.min(...invoices.map(inv => inv.grandTotal || 0));

  // Time-based analysis
  const timeBasedSpending = calculateTimeBasedSpending(invoices);
  const monthlyTrends = calculateMonthlyTrends(invoices);
  const weeklyTrends = calculateWeeklyTrends(invoices);

  // Supplier analysis
  const supplierAnalysis = calculateSupplierAnalysis(invoices, suppliers);

  // Category analysis
  const categoryAnalysis = calculateCategoryAnalysis(invoices);

  // Product analysis
  const productAnalysis = calculateProductAnalysis(invoices);

  // Spending patterns
  const spendingPatterns = analyzeSpendingPatterns(invoices);

  // Financial insights
  const financialInsights = generateFinancialInsights(invoices);

  // Growth analysis
  const growthAnalysis = calculateGrowthAnalysis(invoices);

  return {
    totalInvoices,
    summary: {
      totalAmount: Math.round(totalAmount),
      averageInvoiceValue: Math.round(averageInvoiceValue),
      largestInvoice: Math.round(largestInvoice),
      smallestInvoice: Math.round(smallestInvoice),
      averageItemsPerInvoice: calculateAverageItemsPerInvoice(invoices),
      totalUniqueProducts: calculateUniqueProducts(invoices),
      activeSuppliers: supplierAnalysis.activeSuppliers.length,
      totalQuantityPurchased: calculateTotalQuantity(invoices)
    },
    spending: {
      timeBasedSpending,
      monthlyTrends,
      weeklyTrends,
      spendingPatterns,
      growthAnalysis
    },
    suppliers: {
      analysis: supplierAnalysis.analysis,
      performance: supplierAnalysis.performance,
      distribution: supplierAnalysis.distribution
    },
    categories: {
      breakdown: categoryAnalysis.breakdown,
      trends: categoryAnalysis.trends
    },
    products: {
      topProducts: productAnalysis.topProducts,
      categoryDistribution: productAnalysis.categoryDistribution,
      priceAnalysis: productAnalysis.priceAnalysis
    },
    insights: financialInsights
  };
}

function calculateTimeBasedSpending(invoices: any[]) {
  const dailySpending: { [key: string]: number } = {};
  const monthlySpending: { [key: string]: number } = {};
  const quarterlySpending: { [key: string]: number } = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.createdAt);
    const dayKey = date.toISOString().split('T')[0];
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const quarterKey = `${date.getFullYear()}-Q${quarter}`;
    
    const amount = invoice.grandTotal || 0;
    
    dailySpending[dayKey] = (dailySpending[dayKey] || 0) + amount;
    monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + amount;
    quarterlySpending[quarterKey] = (quarterlySpending[quarterKey] || 0) + amount;
  });
  
  return {
    daily: Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount: Math.round(amount) }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    monthly: Object.entries(monthlySpending)
      .map(([month, amount]) => ({ period: month, amount: Math.round(amount) }))
      .sort((a, b) => a.period.localeCompare(b.period)),
    quarterly: Object.entries(quarterlySpending)
      .map(([quarter, amount]) => ({ period: quarter, amount: Math.round(amount) }))
      .sort((a, b) => a.period.localeCompare(b.period))
  };
}

function calculateMonthlyTrends(invoices: any[]) {
  const monthlyData: { [key: string]: { amount: number; count: number; items: number } } = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const amount = invoice.grandTotal || 0;
    const itemCount = invoice.products?.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0) || 0;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { amount: 0, count: 0, items: 0 };
    }
    
    monthlyData[monthKey].amount += amount;
    monthlyData[monthKey].count += 1;
    monthlyData[monthKey].items += itemCount;
  });
  
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      period: month,
      amount: Math.round(data.amount),
      invoiceCount: data.count,
      itemCount: data.items,
      averageInvoiceValue: Math.round(data.amount / data.count)
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

function calculateWeeklyTrends(invoices: any[]) {
  const weeklyData: { [key: string]: { amount: number; count: number } } = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.createdAt);
    const weekKey = getWeekKey(date);
    
    const amount = invoice.grandTotal || 0;
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { amount: 0, count: 0 };
    }
    
    weeklyData[weekKey].amount += amount;
    weeklyData[weekKey].count += 1;
  });
  
  return Object.entries(weeklyData)
    .map(([week, data]) => ({
      period: week,
      amount: Math.round(data.amount),
      invoiceCount: data.count
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-12); // Last 12 weeks
}

function calculateSupplierAnalysis(invoices: any[], suppliers: any[]) {
  const supplierSpending: { [key: string]: { amount: number; count: number; items: number; supplier: any } } = {};
  
  invoices.forEach(invoice => {
    const supplierId = invoice.supplier?._id || invoice.supplier?.id;
    const supplierName = invoice.supplier?.name || 'Unknown Supplier';
    
    const amount = invoice.grandTotal || 0;
    const itemCount = invoice.products?.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0) || 0;
    
    if (!supplierSpending[supplierId]) {
      supplierSpending[supplierId] = { 
        amount: 0, 
        count: 0, 
        items: 0,
        supplier: invoice.supplier || { name: supplierName }
      };
    }
    
    supplierSpending[supplierId].amount += amount;
    supplierSpending[supplierId].count += 1;
    supplierSpending[supplierId].items += itemCount;
  });
  
  const analysis = Object.entries(supplierSpending)
    .map(([id, data]) => ({
      supplierId: id,
      supplierName: data.supplier.name,
      totalSpent: Math.round(data.amount),
      invoiceCount: data.count,
      itemCount: data.items,
      averageInvoiceValue: Math.round(data.amount / data.count),
      percentage: 0 // Will be calculated below
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);
  
  const totalSpent = analysis.reduce((sum, supplier) => sum + supplier.totalSpent, 0);
  analysis.forEach(supplier => {
    supplier.percentage = Math.round((supplier.totalSpent / totalSpent) * 100);
  });
  
  // Supplier performance metrics
  const performance = analysis.map(supplier => ({
    ...supplier,
    efficiency: calculateSupplierEfficiency(supplier),
    reliability: calculateSupplierReliability(invoices, supplier.supplierId)
  }));
  
  return {
    analysis,
    performance,
    activeSuppliers: analysis,
    distribution: analysis.slice(0, 10) // Top 10 suppliers
  };
}

function calculateCategoryAnalysis(invoices: any[]) {
  const categorySpending: { [key: string]: { amount: number; count: number; items: number } } = {};
  const monthlyByCategory: { [key: string]: { [key: string]: number } } = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    invoice.products?.forEach((product: any) => {
      const category = product.category || 'Uncategorized';
      const amount = product.totalPrice || (product.quantity * product.price) || 0;
      const quantity = product.quantity || 0;
      
      // Overall category spending
      if (!categorySpending[category]) {
        categorySpending[category] = { amount: 0, count: 0, items: 0 };
      }
      categorySpending[category].amount += amount;
      categorySpending[category].count += 1;
      categorySpending[category].items += quantity;
      
      // Monthly trends by category
      if (!monthlyByCategory[category]) {
        monthlyByCategory[category] = {};
      }
      monthlyByCategory[category][monthKey] = (monthlyByCategory[category][monthKey] || 0) + amount;
    });
  });
  
  const totalSpent = Object.values(categorySpending).reduce((sum, cat) => sum + cat.amount, 0);
  
  const breakdown = Object.entries(categorySpending)
    .map(([category, data]) => ({
      category,
      totalSpent: Math.round(data.amount),
      itemCount: data.items,
      purchaseCount: data.count,
      percentage: Math.round((data.amount / totalSpent) * 100),
      averageItemValue: data.items > 0 ? Math.round(data.amount / data.items) : 0
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);
  
  const trends = Object.entries(monthlyByCategory)
    .map(([category, monthlyData]) => ({
      category,
      monthlyData: Object.entries(monthlyData)
        .map(([month, amount]) => ({ month, amount: Math.round(amount) }))
        .sort((a, b) => a.month.localeCompare(b.month))
    }));
  
  return { breakdown, trends };
}

function calculateProductAnalysis(invoices: any[]) {
  const productSpending: { [key: string]: { amount: number; quantity: number; count: number; avgPrice: number } } = {};
  const categoryDistribution: { [key: string]: number } = {};
  
  invoices.forEach(invoice => {
    invoice.products?.forEach((product: any) => {
      const productName = product.name;
      const category = product.category || 'Uncategorized';
      const amount = product.totalPrice || (product.quantity * product.price) || 0;
      const quantity = product.quantity || 0;
      const price = product.price || 0;
      
      // Product analysis
      if (!productSpending[productName]) {
        productSpending[productName] = { amount: 0, quantity: 0, count: 0, avgPrice: 0 };
      }
      productSpending[productName].amount += amount;
      productSpending[productName].quantity += quantity;
      productSpending[productName].count += 1;
      
      // Category distribution
      categoryDistribution[category] = (categoryDistribution[category] || 0) + amount;
    });
  });
  
  // Calculate average prices
  Object.values(productSpending).forEach(product => {
    product.avgPrice = product.quantity > 0 ? Math.round(product.amount / product.quantity) : 0;
  });
  
  const topProducts = Object.entries(productSpending)
    .map(([name, data]) => ({
      productName: name,
      totalSpent: Math.round(data.amount),
      totalQuantity: data.quantity,
      purchaseCount: data.count,
      averagePrice: data.avgPrice
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 20);
  
  const categoryDist = Object.entries(categoryDistribution)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      percentage: Math.round((amount / Object.values(categoryDistribution).reduce((a, b) => a + b, 0)) * 100)
    }))
    .sort((a, b) => b.amount - a.amount);
  
  // Price analysis
  const allPrices = Object.values(productSpending).map(p => p.avgPrice).filter(p => p > 0);
  const priceAnalysis = {
    averagePrice: allPrices.length > 0 ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length) : 0,
    medianPrice: allPrices.length > 0 ? Math.round(allPrices.sort((a, b) => a - b)[Math.floor(allPrices.length / 2)]) : 0,
    priceRange: {
      min: allPrices.length > 0 ? Math.min(...allPrices) : 0,
      max: allPrices.length > 0 ? Math.max(...allPrices) : 0
    }
  };
  
  return {
    topProducts,
    categoryDistribution: categoryDist,
    priceAnalysis
  };
}

function analyzeSpendingPatterns(invoices: any[]) {
  // Day of week analysis
  const dayOfWeekSpending: { [key: string]: number } = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Size distribution
  const sizeRanges = [
    { label: 'Small (< $100)', min: 0, max: 100, count: 0, amount: 0 },
    { label: 'Medium ($100 - $500)', min: 100, max: 500, count: 0, amount: 0 },
    { label: 'Large ($500 - $1000)', min: 500, max: 1000, count: 0, amount: 0 },
    { label: 'Extra Large ($1000+)', min: 1000, max: Infinity, count: 0, amount: 0 }
  ];
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.createdAt);
    const dayName = dayNames[date.getDay()];
    const amount = invoice.grandTotal || 0;
    
    dayOfWeekSpending[dayName] = (dayOfWeekSpending[dayName] || 0) + amount;
    
    // Size analysis
    const range = sizeRanges.find(r => amount >= r.min && amount < r.max);
    if (range) {
      range.count += 1;
      range.amount += amount;
    }
  });
  
  return {
    dayOfWeek: Object.entries(dayOfWeekSpending)
      .map(([day, amount]) => ({ day, amount: Math.round(amount) })),
    sizeDistribution: sizeRanges.map(range => ({
      ...range,
      amount: Math.round(range.amount),
      averageValue: range.count > 0 ? Math.round(range.amount / range.count) : 0
    }))
  };
}

function calculateGrowthAnalysis(invoices: any[]) {
  const monthlyTotals = calculateMonthlyTrends(invoices);
  
  if (monthlyTotals.length < 2) {
    return { monthOverMonth: 0, quarterOverQuarter: 0, yearOverYear: 0 };
  }
  
  // Month over month growth
  const lastMonth = monthlyTotals[monthlyTotals.length - 1];
  const previousMonth = monthlyTotals[monthlyTotals.length - 2];
  const monthOverMonth = previousMonth.amount > 0 
    ? Math.round(((lastMonth.amount - previousMonth.amount) / previousMonth.amount) * 100) 
    : 0;
  
  // Quarter over quarter (if we have enough data)
  const quarterOverQuarter = monthlyTotals.length >= 6 
    ? calculateQuarterGrowth(monthlyTotals) 
    : 0;
  
  // Year over year (if we have enough data)
  const yearOverYear = monthlyTotals.length >= 12 
    ? calculateYearGrowth(monthlyTotals) 
    : 0;
  
  return {
    monthOverMonth,
    quarterOverQuarter,
    yearOverYear,
    trend: monthOverMonth > 0 ? 'increasing' : monthOverMonth < 0 ? 'decreasing' : 'stable'
  };
}

function generateFinancialInsights(invoices: any[]) {
  const insights = [];
  
  // Spending concentration analysis
  const supplierAnalysis = calculateSupplierAnalysis(invoices, []);
  const topSupplierPercentage = supplierAnalysis.analysis[0]?.percentage || 0;
  
  if (topSupplierPercentage > 50) {
    insights.push({
      type: 'risk',
      title: 'High Supplier Concentration',
      description: `${topSupplierPercentage}% of spending is with one supplier. Consider diversifying to reduce risk.`,
      impact: 'medium',
      recommendation: 'Diversify supplier base to reduce dependency risk'
    });
  }
  
  // Spending growth analysis
  const growth = calculateGrowthAnalysis(invoices);
  if (growth.monthOverMonth > 20) {
    insights.push({
      type: 'growth',
      title: 'Rapid Spending Increase',
      description: `Spending increased by ${growth.monthOverMonth}% this month. Monitor for budget alignment.`,
      impact: 'high',
      recommendation: 'Review budget allocation and spending controls'
    });
  }
  
  // Category concentration
  const categoryAnalysis = calculateCategoryAnalysis(invoices);
  const topCategoryPercentage = categoryAnalysis.breakdown[0]?.percentage || 0;
  
  if (topCategoryPercentage > 70) {
    insights.push({
      type: 'opportunity',
      title: 'Category Concentration',
      description: `${topCategoryPercentage}% of spending is in ${categoryAnalysis.breakdown[0]?.category}. Optimize this category for maximum impact.`,
      impact: 'medium',
      recommendation: 'Focus optimization efforts on dominant spending category'
    });
  }
  
  // Average invoice value trends
  const monthlyTrends = calculateMonthlyTrends(invoices);
  if (monthlyTrends.length >= 2) {
    const avgValueTrend = monthlyTrends[monthlyTrends.length - 1].averageInvoiceValue - 
                         monthlyTrends[monthlyTrends.length - 2].averageInvoiceValue;
    
    if (avgValueTrend > 0) {
      insights.push({
        type: 'trend',
        title: 'Increasing Invoice Values',
        description: `Average invoice value is trending upward. This may indicate bulk purchasing or price increases.`,
        impact: 'low',
        recommendation: 'Analyze if this represents better bulk pricing or cost inflation'
      });
    }
  }
  
  return insights;
}

// Helper functions
function calculateAverageItemsPerInvoice(invoices: any[]) {
  const totalItems = invoices.reduce((sum, inv) => {
    return sum + (inv.products?.reduce((pSum: number, p: any) => pSum + (p.quantity || 0), 0) || 0);
  }, 0);
  return invoices.length > 0 ? Math.round(totalItems / invoices.length) : 0;
}

function calculateUniqueProducts(invoices: any[]) {
  const uniqueProducts = new Set();
  invoices.forEach(inv => {
    inv.products?.forEach((p: any) => uniqueProducts.add(p.name));
  });
  return uniqueProducts.size;
}

function calculateTotalQuantity(invoices: any[]) {
  return invoices.reduce((sum, inv) => {
    return sum + (inv.products?.reduce((pSum: number, p: any) => pSum + (p.quantity || 0), 0) || 0);
  }, 0);
}

function calculateSupplierEfficiency(supplier: any) {
  // Simple efficiency based on average invoice value
  if (supplier.averageInvoiceValue > 1000) return 'High';
  if (supplier.averageInvoiceValue > 500) return 'Medium';
  return 'Low';
}

function calculateSupplierReliability(invoices: any[], supplierId: string) {
  const supplierInvoices = invoices.filter(inv => 
    (inv.supplier?._id || inv.supplier?.id) === supplierId
  );
  
  // Simple reliability based on consistency of orders
  if (supplierInvoices.length > 10) return 'High';
  if (supplierInvoices.length > 5) return 'Medium';
  return 'Low';
}

function calculateQuarterGrowth(monthlyTotals: any[]) {
  // Simplified quarter calculation
  const currentQuarter = monthlyTotals.slice(-3).reduce((sum, month) => sum + month.amount, 0);
  const previousQuarter = monthlyTotals.slice(-6, -3).reduce((sum, month) => sum + month.amount, 0);
  
  return previousQuarter > 0 
    ? Math.round(((currentQuarter - previousQuarter) / previousQuarter) * 100) 
    : 0;
}

function calculateYearGrowth(monthlyTotals: any[]) {
  const currentYear = monthlyTotals.slice(-12).reduce((sum, month) => sum + month.amount, 0);
  const previousYear = monthlyTotals.slice(-24, -12).reduce((sum, month) => sum + month.amount, 0);
  
  return previousYear > 0 
    ? Math.round(((currentYear - previousYear) / previousYear) * 100) 
    : 0;
}

function getWeekKey(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}