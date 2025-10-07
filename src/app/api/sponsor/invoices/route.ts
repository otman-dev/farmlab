import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getInvoiceModel } from '@/models/Invoice.cloud';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const user = session?.user as any;
    
    if (!user || !['admin', 'sponsor'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await cloudConnPromise;
    const Invoice = getInvoiceModel(conn);

    // Fetch all invoices (sponsors can see all farm-related invoices they're supporting)
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .lean();

    // Calculate summary statistics
    const totalInvoices = invoices.length;
    const totalValue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const averageValue = totalInvoices > 0 ? totalValue / totalInvoices : 0;

    // Calculate monthly trend (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentInvoices = invoices.filter(inv => 
      new Date(inv.createdAt) >= last30Days
    );
    const previousInvoices = invoices.filter(inv => {
      const date = new Date(inv.createdAt);
      return date >= previous30Days && date < last30Days;
    });

    const recentValue = recentInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const previousValue = previousInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    
    const monthlyTrend = previousValue > 0 ? 
      Math.round(((recentValue - previousValue) / previousValue) * 100) : 
      100;

    const summary = {
      totalInvoices,
      totalValue: Math.round(totalValue),
      averageValue,
      monthlyTrend: Math.max(monthlyTrend, 0) // Ensure positive for display
    };

    // Transform invoices for frontend
    const transformedInvoices = invoices.map(invoice => ({
      _id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      supplier: {
        name: invoice.supplier?.name || 'Unknown Supplier',
        entrepriseName: invoice.supplier?.entrepriseName
      },
      products: invoice.products || [],
      grandTotal: invoice.grandTotal || 0,
      invoiceDate: invoice.invoiceDate || invoice.createdAt,
      createdAt: invoice.createdAt
    }));

    return NextResponse.json({
      invoices: transformedInvoices,
      summary
    });

  } catch (error) {
    console.error('Error fetching sponsor invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}