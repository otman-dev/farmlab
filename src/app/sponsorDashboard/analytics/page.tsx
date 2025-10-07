"use client";

import React, { useEffect, useState } from "react";
import { FiTrendingUp, FiBarChart, FiPieChart, FiActivity, FiCalendar } from "react-icons/fi";

interface AnalyticsData {
  stockTrends: StockTrend[];
  deviceActivity: DeviceMetrics;
  invoiceAnalytics: InvoiceAnalytics;
  impactMetrics: ImpactMetrics;
}

interface StockTrend {
  month: string;
  food: number;
  medical: number;
  total: number;
}

interface DeviceMetrics {
  totalDevices: number;
  onlineDevices: number;
  uptimeAverage: number;
  alertsToday: number;
}

interface InvoiceAnalytics {
  monthlySpending: number[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  supplierDistribution: { supplier: string; amount: number }[];
}

interface ImpactMetrics {
  animalsHelped: number;
  resourcesSaved: number;
  efficiencyGain: number;
  sustainabilityScore: number;
}

export default function SponsorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/sponsor/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiBarChart className="text-green-600" />
            Farm Analytics
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into farm performance and sponsorship impact</p>
        </div>
        <div className="flex items-center space-x-2">
          <FiCalendar className="text-gray-500" />
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Animals Helped</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.impactMetrics.animalsHelped || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FiActivity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-green-600">+12%</span>
            <span className="text-sm text-gray-500 ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resources Saved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.impactMetrics.resourcesSaved || 0}%</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <FiTrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-green-600">+8%</span>
            <span className="text-sm text-gray-500 ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Efficiency Gain</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.impactMetrics.efficiencyGain || 0}%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <FiPieChart className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-green-600">+15%</span>
            <span className="text-sm text-gray-500 ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sustainability Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.impactMetrics.sustainabilityScore || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
              <FiBarChart className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-green-600">+20%</span>
            <span className="text-sm text-gray-500 ml-1">from last period</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Sponsorship Impact Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics?.impactMetrics.animalsHelped || 0}</div>
            <div className="text-sm text-gray-600">Animals Benefited</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics?.impactMetrics.resourcesSaved || 0}%</div>
            <div className="text-sm text-gray-600">Resource Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics?.impactMetrics.efficiencyGain || 0}%</div>
            <div className="text-sm text-gray-600">Operational Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{analytics?.impactMetrics.sustainabilityScore || 0}</div>
            <div className="text-sm text-gray-600">Sustainability Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}