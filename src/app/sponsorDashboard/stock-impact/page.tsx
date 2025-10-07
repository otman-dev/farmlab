"use client";

import React, { useEffect, useState } from "react";
import { FiBox, FiTrendingUp, FiCalendar, FiActivity, FiBarChart, FiArrowUp } from "react-icons/fi";

interface StockImpactData {
  totalItems: number;
  categoryBreakdown: CategoryStock[];
  recentContributions: Contribution[];
  utilizationStats: UtilizationStats;
  impactMetrics: ImpactMetrics;
}

interface CategoryStock {
  category: string;
  current: number;
  contributed: number;
  utilized: number;
  percentage: number;
}

interface Contribution {
  id: string;
  date: string;
  items: string[];
  quantity: number;
  value: number;
  impact: string;
}

interface UtilizationStats {
  totalUtilized: number;
  utilizationRate: number;
  averageLifespan: number;
  wasteReduction: number;
}

interface ImpactMetrics {
  animalsSupported: number;
  daysOfSupply: number;
  costSavings: number;
  sustainability: number;
}

export default function StockImpactPage() {
  const [impactData, setImpactData] = useState<StockImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    fetchStockImpact();
  }, []);

  const fetchStockImpact = async () => {
    try {
      const response = await fetch('/api/sponsor/stock-impact');
      if (response.ok) {
        const data = await response.json();
        setImpactData(data);
      }
    } catch (error) {
      console.error('Error fetching stock impact:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stock impact data...</p>
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
            <FiBox className="text-green-600" />
            Stock Impact Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track how your sponsorship contributions affect farm inventory and operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'overview' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('detailed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'detailed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Key Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ImpactMetricCard 
          title="Animals Supported" 
          value={impactData?.impactMetrics.animalsSupported?.toString() || '0'}
          icon={FiActivity}
          trend="+12%"
          color="green"
        />
        <ImpactMetricCard 
          title="Days of Supply" 
          value={impactData?.impactMetrics.daysOfSupply?.toString() || '0'}
          icon={FiCalendar}
          trend="+8%"
          color="blue"
        />
        <ImpactMetricCard 
          title="Cost Savings" 
          value={`$${impactData?.impactMetrics.costSavings?.toLocaleString() || '0'}`}
          icon={FiTrendingUp}
          trend="+15%"
          color="purple"
        />
        <ImpactMetricCard 
          title="Sustainability Score" 
          value={`${impactData?.impactMetrics.sustainability || 0}%`}
          icon={FiBarChart}
          trend="+5%"
          color="emerald"
        />
      </div>

      {view === 'overview' ? (
        <>
          {/* Stock Categories Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiBox className="text-green-600" />
                Stock by Category
              </h2>
              <div className="space-y-4">
                {impactData?.categoryBreakdown?.map((category, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{category.category}</span>
                      <span className="text-sm text-gray-500">{category.percentage}% of total</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <div className="font-semibold text-gray-900">{category.current}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Contributed:</span>
                        <div className="font-semibold text-green-600">{category.contributed}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Utilized:</span>
                        <div className="font-semibold text-blue-600">{category.utilized}</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.min(category.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Utilization Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiActivity className="text-green-600" />
                Utilization Statistics
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Items Utilized</span>
                    <span className="text-2xl font-bold text-gray-900">{impactData?.utilizationStats.totalUtilized || 0}</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Utilization Rate</span>
                    <span className="text-2xl font-bold text-green-600">{impactData?.utilizationStats.utilizationRate || 0}%</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Average Lifespan</span>
                    <span className="text-2xl font-bold text-blue-600">{impactData?.utilizationStats.averageLifespan || 0} days</span>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Waste Reduction</span>
                    <span className="text-2xl font-bold text-purple-600">{impactData?.utilizationStats.wasteReduction || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Contributions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-green-600" />
              Recent Contributions & Impact
            </h2>
            <div className="space-y-3">
              {impactData?.recentContributions?.map((contribution) => (
                <div key={contribution.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {contribution.items.join(', ')}
                        </span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {contribution.quantity} items
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{contribution.impact}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${contribution.value.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{contribution.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Detailed View */
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Stock Analysis</h2>
          <div className="text-center py-12">
            <FiBarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics Coming Soon</h3>
            <p className="text-gray-600">
              Advanced stock analysis, predictive modeling, and detailed impact tracking will be available here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ImpactMetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  color: 'green' | 'blue' | 'purple' | 'emerald';
}

function ImpactMetricCard({ title, value, icon: Icon, trend, color }: ImpactMetricCardProps) {
  let colorClass: string;

  switch (color) {
    case 'green':
      colorClass = 'bg-green-100 text-green-600';
      break;
    case 'blue':
      colorClass = 'bg-blue-100 text-blue-600';
      break;
    case 'purple':
      colorClass = 'bg-purple-100 text-purple-600';
      break;
    case 'emerald':
      colorClass = 'bg-emerald-100 text-emerald-600';
      break;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex items-center text-green-600">
          <FiArrowUp className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}