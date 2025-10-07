"use client";

import React, { useEffect, useState } from "react";
import { FiFileText, FiDownload, FiCalendar, FiDollarSign, FiPackage, FiTrendingUp } from "react-icons/fi";

interface SponsorInvoice {
  _id: string;
  invoiceNumber: string;
  supplier: {
    name: string;
    entrepriseName?: string;
  };
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    category: string;
  }>;
  grandTotal: number;
  invoiceDate: string;
  createdAt: string;
}

interface InvoiceSummary {
  totalInvoices: number;
  totalValue: number;
  averageValue: number;
  monthlyTrend: number;
}

export default function SponsorInvoicesPage() {
  const [invoices, setInvoices] = useState<SponsorInvoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'food' | 'medical'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'supplier'>('date');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/sponsor/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setSummary(data.summary || null);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    
    const hasCategory = invoice.products?.some(product => {
      if (filter === 'food') return product.category === 'animal_feed';
      if (filter === 'medical') return product.category === 'animal_medicine';
      return false;
    });
    
    return hasCategory;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'value':
        return (b.grandTotal || 0) - (a.grandTotal || 0);
      case 'supplier':
        return (a.supplier?.name || '').localeCompare(b.supplier?.name || '');
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sponsored invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiFileText className="text-green-600" />
            Sponsored Invoices
          </h1>
          <p className="text-gray-600 mt-1">Track and manage all invoices funded through your sponsorship</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard 
            title="Total Invoices" 
            value={summary.totalInvoices.toString()}
            icon={FiFileText}
            color="blue"
          />
          <SummaryCard 
            title="Total Value" 
            value={`$${summary.totalValue.toLocaleString()}`}
            icon={FiDollarSign}
            color="green"
          />
          <SummaryCard 
            title="Average Value" 
            value={`$${Math.round(summary.averageValue).toLocaleString()}`}
            icon={FiTrendingUp}
            color="purple"
          />
          <SummaryCard 
            title="Monthly Trend" 
            value={`+${summary.monthlyTrend}%`}
            icon={FiCalendar}
            color="emerald"
          />
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Filter by Category:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as 'all' | 'food' | 'medical')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              >
                <option value="all">All Categories</option>
                <option value="food">Animal Feed</option>
                <option value="medical">Medical Supplies</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'date' | 'value' | 'supplier')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              >
                <option value="date">Date</option>
                <option value="value">Value</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {sortedInvoices.length} of {invoices.length} invoices
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Invoice History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedInvoices.map((invoice) => (
            <InvoiceRow key={invoice._id} invoice={invoice} />
          ))}
          {sortedInvoices.length === 0 && (
            <div className="text-center py-12">
              <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600">No invoices match your current filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'emerald';
}

function SummaryCard({ title, value, icon: Icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

interface InvoiceRowProps {
  invoice: SponsorInvoice;
}

function InvoiceRow({ invoice }: InvoiceRowProps) {
  const totalItems = invoice.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
  const categories = Array.from(new Set(invoice.products?.map(p => p.category) || []));
  
  return (
    <div className="px-6 py-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-semibold text-gray-900">#{invoice.invoiceNumber}</span>
            <span className="text-sm text-gray-500">
              {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}
            </span>
            {categories.map((category, index) => (
              <span 
                key={index}
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  category === 'animal_feed' ? 'bg-blue-100 text-blue-800' :
                  category === 'animal_medicine' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {category === 'animal_feed' ? 'Feed' : 
                 category === 'animal_medicine' ? 'Medical' : 
                 category}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <FiPackage className="h-4 w-4 mr-1" />
              {totalItems} items
            </span>
            <span>{invoice.supplier?.name || 'Unknown Supplier'}</span>
            {invoice.supplier?.entrepriseName && (
              <span className="text-gray-500">({invoice.supplier.entrepriseName})</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="font-bold text-gray-900">${(invoice.grandTotal || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">
              ${Math.round((invoice.grandTotal || 0) / Math.max(totalItems, 1))} per item
            </div>
          </div>
          <button 
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Download Invoice"
          >
            <FiDownload className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}