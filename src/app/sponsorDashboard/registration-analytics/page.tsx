"use client";

import React, { useEffect, useState } from "react";
import { 
  FiUsers, 
  FiGlobe, 
  FiTrendingUp, 
  FiTarget, 
  FiPieChart,
  FiBarChart,
  FiActivity,
  FiDollarSign,
  FiEye,
  FiHeart,
  FiMapPin,
  FiTool
} from "react-icons/fi";

interface RegistrationAnalytics {
  totalResponses: number;
  summary: {
    primaryRoles: CategoryData[];
    topCountries: CategoryData[];
    avgTechExperience: number;
    mostCommonFarmSize: string;
  };
  demographics: {
    roles: CategoryData[];
    geography: CategoryData[];
    farmSizes: CategoryData[];
    techExperience: CategoryData[];
  };
  interests: {
    categories: CategoryData[];
    challenges: CategoryData[];
    priorities: CategoryData[];
    investmentFocus: CategoryData[];
  };
  preferences: {
    participationMode: CategoryData[];
    pricingModel: CategoryData[];
  };
  trends: {
    monthly: TrendData[];
    weekly: TrendData[];
  };
  insights: MarketInsight[];
}

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

interface TrendData {
  period: string;
  count: number;
}

interface MarketInsight {
  type: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export default function RegistrationAnalyticsPage() {
  const [analytics, setAnalytics] = useState<RegistrationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'demographics' | 'interests' | 'trends'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/sponsor/registration-analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching registration analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FiUsers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Registration analytics will appear here once data is collected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Registration Analytics</h1>
            <p className="text-purple-100 text-lg mb-4">
              Market intelligence and user insights from registration data
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FiUsers className="text-blue-300" />
                <span className="text-sm">{analytics.totalResponses} total registrations</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiGlobe className="text-green-300" />
                <span className="text-sm">{analytics.summary.topCountries.length} countries</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiTool className="text-yellow-300" />
                <span className="text-sm">Tech Level: {analytics.summary.avgTechExperience}/4</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {analytics.summary.primaryRoles[0]?.percentage || 0}%
            </div>
            <div className="text-purple-200 text-sm">Primary User Type</div>
            <div className="text-lg">
              {analytics.summary.primaryRoles[0]?.category || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg">
        {[
          { key: 'overview', label: 'Overview', icon: FiActivity },
          { key: 'demographics', label: 'Demographics', icon: FiUsers },
          { key: 'interests', label: 'Interests & Goals', icon: FiHeart },
          { key: 'trends', label: 'Trends', icon: FiTrendingUp }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key as typeof activeView)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg transition-all ${
              activeView === key
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active view */}
      {activeView === 'overview' && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              icon={FiUsers}
              title="Total Registrations"
              value={analytics.totalResponses.toString()}
              subtitle="Active prospects"
              color="blue"
            />
            <SummaryCard
              icon={FiGlobe}
              title="Top Country"
              value={analytics.summary.topCountries[0]?.category || 'N/A'}
              subtitle={`${analytics.summary.topCountries[0]?.percentage || 0}% of users`}
              color="green"
            />
            <SummaryCard
              icon={FiTarget}
              title="Primary Role"
              value={analytics.summary.primaryRoles[0]?.category.split(' ')[0] || 'N/A'}
              subtitle={`${analytics.summary.primaryRoles[0]?.percentage || 0}% of users`}
              color="purple"
            />
            <SummaryCard
              icon={FiTool}
              title="Tech Experience"
              value={`${Math.round(analytics.summary.avgTechExperience * 100)}%`}
              subtitle="Average skill level"
              color="orange"
            />
          </div>

          {/* Market Insights */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiEye className="text-yellow-600 w-5 h-5" />
              </div>
              Market Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analytics.insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>

          {/* Quick Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard
              title="User Roles Distribution"
              data={analytics.demographics.roles.slice(0, 5)}
              type="pie"
              color="blue"
            />
            <ChartCard
              title="Geographic Distribution"
              data={analytics.summary.topCountries}
              type="bar"
              color="green"
            />
          </div>
        </div>
      )}

      {activeView === 'demographics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard
              title="User Roles"
              data={analytics.demographics.roles}
              type="pie"
              color="blue"
            />
            <ChartCard
              title="Geographic Distribution"
              data={analytics.demographics.geography.slice(0, 10)}
              type="bar"
              color="green"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard
              title="Farm Sizes"
              data={analytics.demographics.farmSizes}
              type="pie"
              color="purple"
            />
            <ChartCard
              title="Technology Experience"
              data={analytics.demographics.techExperience}
              type="bar"
              color="orange"
            />
          </div>
        </div>
      )}

      {activeView === 'interests' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard
              title="Top Interests"
              data={analytics.interests.categories}
              type="bar"
              color="purple"
            />
            <ChartCard
              title="Main Challenges"
              data={analytics.interests.challenges}
              type="bar"
              color="red"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard
              title="Priorities"
              data={analytics.interests.priorities}
              type="pie"
              color="blue"
            />
            <ChartCard
              title="Investment Focus"
              data={analytics.interests.investmentFocus}
              type="pie"
              color="green"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard
              title="Participation Preferences"
              data={analytics.preferences.participationMode}
              type="bar"
              color="indigo"
            />
            <ChartCard
              title="Pricing Model Preferences"
              data={analytics.preferences.pricingModel}
              type="pie"
              color="yellow"
            />
          </div>
        </div>
      )}

      {activeView === 'trends' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TrendChart
              title="Monthly Registrations"
              data={analytics.trends.monthly}
              color="blue"
            />
            <TrendChart
              title="Weekly Registrations (Last 12 weeks)"
              data={analytics.trends.weekly}
              color="green"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function SummaryCard({ icon: Icon, title, value, subtitle, color }: SummaryCardProps) {
  let colorClass: string;

  switch (color) {
    case 'blue':
      colorClass = 'bg-blue-100 text-blue-600';
      break;
    case 'green':
      colorClass = 'bg-green-100 text-green-600';
      break;
    case 'purple':
      colorClass = 'bg-purple-100 text-purple-600';
      break;
    case 'orange':
      colorClass = 'bg-orange-100 text-orange-600';
      break;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

interface InsightCardProps {
  insight: MarketInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  let impactColor: string;
  
  switch (insight.impact) {
    case 'high':
      impactColor = 'bg-red-100 text-red-800';
      break;
    case 'medium':
      impactColor = 'bg-yellow-100 text-yellow-800';
      break;
    case 'low':
      impactColor = 'bg-green-100 text-green-800';
      break;
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${impactColor}`}>
          {insight.impact}
        </span>
      </div>
      <p className="text-sm text-gray-600">{insight.description}</p>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  data: CategoryData[];
  type: 'pie' | 'bar';
  color: string;
}

function ChartCard({ title, data, type, color }: ChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center py-8">
          <FiPieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {type === 'pie' ? (
        <PieChart data={data} color={color} />
      ) : (
        <BarChart data={data} color={color} />
      )}
    </div>
  );
}

interface PieChartProps {
  data: CategoryData[];
  color: string;
}

function PieChart({ data }: PieChartProps) {
  const maxItems = 6;
  const displayData = data.slice(0, maxItems);
  const others = data.slice(maxItems);
  const othersSum = others.reduce((sum, item) => sum + item.percentage, 0);
  
  if (othersSum > 0) {
    displayData.push({
      category: 'Others',
      count: others.reduce((sum, item) => sum + item.count, 0),
      percentage: othersSum
    });
  }

  return (
    <div className="space-y-4">
      {displayData.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ 
                backgroundColor: `hsl(${(index * 360) / displayData.length}, 70%, 60%)` 
              }}
            />
            <span className="text-sm text-gray-700 truncate max-w-48">{item.category}</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">{item.percentage}%</div>
            <div className="text-xs text-gray-500">({item.count})</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface BarChartProps {
  data: CategoryData[];
  color: string;
}

function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.percentage));
  const displayData = data.slice(0, 8); // Limit to top 8 items

  return (
    <div className="space-y-3">
      {displayData.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 truncate max-w-48">{item.category}</span>
            <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(item.percentage / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface TrendChartProps {
  title: string;
  data: TrendData[];
  color: string;
}

function TrendChart({ title, data }: TrendChartProps) {
  const maxValue = Math.max(...data.map(item => item.count));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{item.period}</span>
              <span className="text-sm font-semibold text-gray-900">{item.count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: maxValue > 0 ? `${(item.count / maxValue) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}