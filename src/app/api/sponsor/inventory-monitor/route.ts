import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getSupplierModel } from '@/models/Supplier.cloud';
import { getProductModel } from '@/models/Product.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getInvoiceModel } from '@/models/Invoice.cloud';
import { getMedicineUnitModel } from '@/models/MedicineUnit.cloud';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;
    
    if (!user || !['admin', 'sponsor'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await cloudConnPromise;
    const Supplier = getSupplierModel(conn);
    const Product = getProductModel(conn);
    const MedicalStock = getMedicalStockModel(conn);
    const FoodStock = getFoodStockModel(conn);
    const Invoice = getInvoiceModel(conn);
    const MedicineUnit = getMedicineUnitModel(conn);

    // Fetch all data in parallel
    const [
      suppliers,
      products,
      medicalStock,
      foodStock,
      invoices,
      medicineUnits
    ] = await Promise.all([
      Supplier.find().sort({ name: 1 }),
      Product.find().sort({ name: 1 }),
      MedicalStock.find().sort({ createdAt: -1 }),
      FoodStock.find().sort({ createdAt: -1 }),
      Invoice.find().sort({ createdAt: -1 }).limit(100),
      MedicineUnit.find().sort({ createdAt: -1 })
    ]);

    // Calculate comprehensive inventory analytics
    const analytics = calculateInventoryAnalytics({
      suppliers,
      products,
      medicalStock,
      foodStock,
      invoices,
      medicineUnits
    });
    
    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory analytics' }, { status: 500 });
  }
}

function calculateInventoryAnalytics(data: any) {
  const { suppliers, products, medicalStock, foodStock, invoices, medicineUnits } = data;

  // Supplier analytics
  const supplierAnalytics = analyzeSuppliers(suppliers, invoices);
  
  // Product analytics
  const productAnalytics = analyzeProducts(products, invoices);
  
  // Stock analytics
  const stockAnalytics = analyzeStock(medicalStock, foodStock, medicineUnits);
  
  // Inventory health
  const inventoryHealth = calculateInventoryHealth(medicalStock, foodStock);
  
  // Recent activity
  const recentActivity = getRecentActivity(invoices, medicalStock, foodStock);
  
  // Alerts and recommendations
  const alerts = generateAlerts(medicalStock, foodStock, supplierAnalytics);

  return {
    summary: {
      totalSuppliers: suppliers.length,
      activeSuppliers: supplierAnalytics.activeSuppliers.length,
      totalProducts: products.length,
      medicineItems: medicalStock.length,
      foodItems: foodStock.length,
      medicineUnits: medicineUnits.length,
      totalInvoices: invoices.length,
      inventoryValue: stockAnalytics.totalValue
    },
    suppliers: supplierAnalytics,
    products: productAnalytics,
    stock: stockAnalytics,
    health: inventoryHealth,
    activity: recentActivity,
    alerts,
    timestamps: {
      lastUpdated: new Date().toISOString(),
      lastInvoice: invoices[0]?.createdAt || null,
      lastStockUpdate: getLastStockUpdate(medicalStock, foodStock)
    }
  };
}

function analyzeSuppliers(suppliers: any[], invoices: any[]) {
  // Calculate supplier metrics from invoices
  const supplierMetrics: { [key: string]: any } = {};
  
  invoices.forEach(invoice => {
    const supplierId = invoice.supplier?._id?.toString() || invoice.supplier?.id?.toString();
    const supplierName = invoice.supplier?.name || 'Unknown Supplier';
    
    if (!supplierMetrics[supplierId]) {
      supplierMetrics[supplierId] = {
        id: supplierId,
        name: supplierName,
        totalSpent: 0,
        invoiceCount: 0,
        lastOrder: null,
        products: new Set(),
        categories: new Set()
      };
    }
    
    const metrics = supplierMetrics[supplierId];
    metrics.totalSpent += invoice.grandTotal || 0;
    metrics.invoiceCount += 1;
    
    const invoiceDate = new Date(invoice.createdAt);
    if (!metrics.lastOrder || invoiceDate > new Date(metrics.lastOrder)) {
      metrics.lastOrder = invoice.createdAt;
    }
    
    // Track products and categories
    invoice.products?.forEach((product: any) => {
      metrics.products.add(product.name);
      if (product.category) {
        metrics.categories.add(product.category);
      }
    });
  });

  // Convert sets to arrays and add additional metrics
  const supplierList = Object.values(supplierMetrics).map((supplier: any) => ({
    ...supplier,
    products: Array.from(supplier.products),
    categories: Array.from(supplier.categories),
    productCount: supplier.products.size,
    categoryCount: supplier.categories.size,
    averageOrderValue: supplier.invoiceCount > 0 ? Math.round(supplier.totalSpent / supplier.invoiceCount) : 0,
    daysSinceLastOrder: supplier.lastOrder ? Math.floor((Date.now() - new Date(supplier.lastOrder).getTime()) / (1000 * 60 * 60 * 24)) : null
  }));

  // Identify active suppliers (ordered in last 90 days)
  const activeSuppliers = supplierList.filter(s => s.daysSinceLastOrder !== null && s.daysSinceLastOrder <= 90);
  
  // Performance tiers
  const topSuppliers = supplierList
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // Supplier diversity metrics
  const totalSpent = supplierList.reduce((sum, s) => sum + s.totalSpent, 0);
  const supplierConcentration = topSuppliers.length > 0 ? (topSuppliers[0].totalSpent / totalSpent) * 100 : 0;

  return {
    all: supplierList,
    active: activeSuppliers,
    top: topSuppliers,
    activeSuppliers,
    metrics: {
      concentration: Math.round(supplierConcentration),
      averageOrderValue: Math.round(totalSpent / Math.max(supplierList.reduce((sum, s) => sum + s.invoiceCount, 0), 1)),
      diversityScore: calculateDiversityScore(supplierList)
    }
  };
}

function analyzeProducts(products: any[], invoices: any[]) {
  // Product usage analytics from invoices
  const productUsage: { [key: string]: any } = {};
  
  invoices.forEach(invoice => {
    invoice.products?.forEach((product: any) => {
      const productName = product.name;
      
      if (!productUsage[productName]) {
        productUsage[productName] = {
          name: productName,
          category: product.category || 'Uncategorized',
          totalQuantity: 0,
          totalSpent: 0,
          orderCount: 0,
          suppliers: new Set(),
          lastPurchase: null,
          avgPrice: 0
        };
      }
      
      const usage = productUsage[productName];
      usage.totalQuantity += product.quantity || 0;
      usage.totalSpent += product.totalPrice || (product.quantity * product.price) || 0;
      usage.orderCount += 1;
      
      if (invoice.supplier?.name) {
        usage.suppliers.add(invoice.supplier.name);
      }
      
      const invoiceDate = new Date(invoice.createdAt);
      if (!usage.lastPurchase || invoiceDate > new Date(usage.lastPurchase)) {
        usage.lastPurchase = invoice.createdAt;
      }
    });
  });

  // Calculate average prices and add metrics
  const productList = Object.values(productUsage).map((product: any) => ({
    ...product,
    suppliers: Array.from(product.suppliers),
    supplierCount: product.suppliers.size,
    avgPrice: product.totalQuantity > 0 ? Math.round(product.totalSpent / product.totalQuantity) : 0,
    daysSinceLastPurchase: product.lastPurchase ? Math.floor((Date.now() - new Date(product.lastPurchase).getTime()) / (1000 * 60 * 60 * 24)) : null
  }));

  // Category analysis
  const categories = groupByCategory(productList);
  
  // Top products by various metrics
  const topBySpending = productList.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 15);
  const topByQuantity = productList.sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 15);
  const mostFrequent = productList.sort((a, b) => b.orderCount - a.orderCount).slice(0, 15);

  return {
    all: productList,
    byCategory: categories,
    top: {
      bySpending: topBySpending,
      byQuantity: topByQuantity,
      byFrequency: mostFrequent
    },
    metrics: {
      totalProducts: productList.length,
      activeProducts: productList.filter(p => p.daysSinceLastPurchase !== null && p.daysSinceLastPurchase <= 30).length,
      averagePrice: Math.round(productList.reduce((sum, p) => sum + p.avgPrice, 0) / Math.max(productList.length, 1))
    }
  };
}

function analyzeStock(medicalStock: any[], foodStock: any[], medicineUnits: any[]) {
  // Medical stock analysis
  const medicalAnalysis = {
    items: medicalStock.map(item => ({
      ...item.toObject(),
      type: 'medical',
      value: (item.quantity || 0) * (item.unitPrice || 0),
      lowStock: (item.quantity || 0) < (item.reorderLevel || 10),
      daysUntilExpiry: item.expiryDate ? Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
    })),
    totalValue: medicalStock.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0),
    totalQuantity: medicalStock.reduce((sum, item) => sum + (item.quantity || 0), 0),
    lowStockItems: medicalStock.filter(item => (item.quantity || 0) < (item.reorderLevel || 10)).length,
    expiringItems: medicalStock.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length
  };

  // Food stock analysis
  const foodAnalysis = {
    items: foodStock.map(item => ({
      ...item.toObject(),
      type: 'food',
      value: (item.quantity || 0) * (item.unitPrice || 0),
      lowStock: (item.quantity || 0) < (item.reorderLevel || 50),
      daysUntilExpiry: item.expiryDate ? Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
    })),
    totalValue: foodStock.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0),
    totalQuantity: foodStock.reduce((sum, item) => sum + (item.quantity || 0), 0),
    lowStockItems: foodStock.filter(item => (item.quantity || 0) < (item.reorderLevel || 50)).length,
    expiringItems: foodStock.filter(item => {
      if (!item.expiryDate) return false;
      const daysUntilExpiry = Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length
  };

  // Medicine units analysis
  const medicineUnitsAnalysis = {
    items: medicineUnits.map(unit => ({
      ...unit.toObject(),
      type: 'medicine-unit'
    })),
    totalUnits: medicineUnits.length,
    categories: Array.from(new Set(medicineUnits.map(unit => unit.category).filter(Boolean)))
  };

  return {
    medical: medicalAnalysis,
    food: foodAnalysis,
    medicineUnits: medicineUnitsAnalysis,
    combined: {
      totalValue: medicalAnalysis.totalValue + foodAnalysis.totalValue,
      totalItems: medicalStock.length + foodStock.length,
      lowStockAlerts: medicalAnalysis.lowStockItems + foodAnalysis.lowStockItems,
      expiryAlerts: medicalAnalysis.expiringItems + foodAnalysis.expiringItems
    },
    totalValue: medicalAnalysis.totalValue + foodAnalysis.totalValue
  };
}

function calculateInventoryHealth(medicalStock: any[], foodStock: any[]) {
  const allItems = [...medicalStock, ...foodStock];
  const totalItems = allItems.length;
  
  if (totalItems === 0) {
    return {
      overallScore: 100,
      stockLevels: { good: 0, low: 0, critical: 0 },
      expiry: { fresh: 0, expiringSoon: 0, expired: 0 },
      recommendations: []
    };
  }

  // Stock level analysis
  let goodStock = 0, lowStock = 0, criticalStock = 0;
  let fresh = 0, expiringSoon = 0, expired = 0;

  allItems.forEach(item => {
    const quantity = item.quantity || 0;
    const reorderLevel = item.reorderLevel || (item.category === 'medical' ? 10 : 50);
    
    // Stock levels
    if (quantity >= reorderLevel * 1.5) {
      goodStock++;
    } else if (quantity >= reorderLevel) {
      lowStock++;
    } else {
      criticalStock++;
    }
    
    // Expiry analysis
    if (item.expiryDate) {
      const daysUntilExpiry = Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) {
        expired++;
      } else if (daysUntilExpiry <= 30) {
        expiringSoon++;
      } else {
        fresh++;
      }
    } else {
      fresh++; // Assume fresh if no expiry date
    }
  });

  // Calculate overall health score
  const stockScore = (goodStock * 100 + lowStock * 70 + criticalStock * 30) / totalItems;
  const expiryScore = (fresh * 100 + expiringSoon * 60 + expired * 0) / totalItems;
  const overallScore = Math.round((stockScore + expiryScore) / 2);

  // Generate recommendations
  const recommendations = [];
  if (criticalStock > totalItems * 0.1) {
    recommendations.push('Critical: Multiple items below reorder level - immediate restocking required');
  }
  if (expiringSoon > 0) {
    recommendations.push(`${expiringSoon} items expiring within 30 days - prioritize usage`);
  }
  if (expired > 0) {
    recommendations.push(`${expired} expired items - remove from inventory immediately`);
  }

  return {
    overallScore,
    stockLevels: {
      good: goodStock,
      low: lowStock,
      critical: criticalStock
    },
    expiry: {
      fresh,
      expiringSoon,
      expired
    },
    recommendations
  };
}

function getRecentActivity(invoices: any[], medicalStock: any[], foodStock: any[]) {
  const activities = [];

  // Recent invoices
  invoices.slice(0, 10).forEach(invoice => {
    activities.push({
      type: 'invoice',
      title: `Invoice from ${invoice.supplier?.name || 'Unknown Supplier'}`,
      description: `${invoice.products?.length || 0} items - $${invoice.grandTotal || 0}`,
      date: invoice.createdAt,
      icon: 'invoice'
    });
  });

  // Recent stock additions
  [...medicalStock, ...foodStock]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .forEach(item => {
      activities.push({
        type: 'stock',
        title: `Stock added: ${item.productName || item.name}`,
        description: `Quantity: ${item.quantity || 0} units`,
        date: item.createdAt,
        icon: item.category === 'medical' ? 'medical' : 'food'
      });
    });

  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);
}

function generateAlerts(medicalStock: any[], foodStock: any[], supplierAnalytics: any) {
  const alerts = [];

  // Stock alerts
  const lowMedicalStock = medicalStock.filter(item => (item.quantity || 0) < (item.reorderLevel || 10));
  const lowFoodStock = foodStock.filter(item => (item.quantity || 0) < (item.reorderLevel || 50));

  if (lowMedicalStock.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Low Medical Stock',
      message: `${lowMedicalStock.length} medical items below reorder level`,
      priority: 'high',
      action: 'Review and reorder medical supplies'
    });
  }

  if (lowFoodStock.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Low Food Stock',
      message: `${lowFoodStock.length} food items below reorder level`,
      priority: 'medium',
      action: 'Review and reorder animal feed'
    });
  }

  // Expiry alerts
  const expiringMedical = medicalStock.filter(item => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  });

  if (expiringMedical.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Items Expiring Soon',
      message: `${expiringMedical.length} items expire within 30 days`,
      priority: 'medium',
      action: 'Prioritize usage of expiring items'
    });
  }

  // Supplier alerts
  const inactiveSuppliers = supplierAnalytics.all.filter(s => s.daysSinceLastOrder > 180);
  if (inactiveSuppliers.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Inactive Suppliers',
      message: `${inactiveSuppliers.length} suppliers haven't been used in 6+ months`,
      priority: 'low',
      action: 'Review supplier relationships'
    });
  }

  return alerts;
}

// Helper functions
function calculateDiversityScore(suppliers: any[]) {
  if (suppliers.length === 0) return 0;
  
  const totalSpent = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);
  const shares = suppliers.map(s => s.totalSpent / totalSpent);
  
  // Calculate Herfindahl-Hirschman Index (lower = more diverse)
  const hhi = shares.reduce((sum, share) => sum + share * share, 0);
  
  // Convert to diversity score (higher = more diverse)
  return Math.round((1 - hhi) * 100);
}

function groupByCategory(products: any[]) {
  const categories: { [key: string]: any } = {};
  
  products.forEach(product => {
    const category = product.category || 'Uncategorized';
    
    if (!categories[category]) {
      categories[category] = {
        name: category,
        products: [],
        totalSpent: 0,
        totalQuantity: 0,
        count: 0
      };
    }
    
    categories[category].products.push(product);
    categories[category].totalSpent += product.totalSpent;
    categories[category].totalQuantity += product.totalQuantity;
    categories[category].count++;
  });
  
  return Object.values(categories);
}

function getLastStockUpdate(medicalStock: any[], foodStock: any[]) {
  const allStock = [...medicalStock, ...foodStock];
  if (allStock.length === 0) return null;
  
  return allStock
    .map(item => item.createdAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
}