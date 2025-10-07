"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiTrendingUp, FiBox, FiActivity, FiUsers, FiTarget, FiDollarSign, FiBarChart } from "react-icons/fi";

interface SponsorMetrics {
  totalContribution: number;
  itemsSponsored: number;
  farmImpact: number;
  communityReach: number;
  recentActivities: Activity[];
  goalProgress: GoalProgress[];
}

interface Activity {
  id: string;
  type: 'stock' | 'invoice' | 'impact';
  description: string;
  date: string;
  value?: number;
}

interface GoalProgress {
  category: string;
  current: number;
  target: number;
  description: string;
}

export default function SponsorDashboardPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<SponsorMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsorMetrics();
  }, []);

  const fetchSponsorMetrics = async () => {
    try {
      const response = await fetch('/api/sponsor/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching sponsor metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your sponsor insights...</p>
        </div>
      </div>
    );
  }

  const user = session?.user as { name?: string; email?: string } | undefined;
  const welcomeName = user?.name || 'Sponsor';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {welcomeName}!</h1>
        <p className="text-green-100 text-lg">
          Your sponsorship is making a real difference in sustainable farming. Here&apos;s your impact overview.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={FiDollarSign}
          title="Total Contribution"
          value={`$${metrics?.totalContribution?.toLocaleString() || '0'}`}
          trend="+12%"
          trendPositive={true}
        />
        <MetricCard
          icon={FiBox}
          title="Items Sponsored"
          value={metrics?.itemsSponsored?.toString() || '0'}
          trend="+8 this month"
          trendPositive={true}
        />
        <MetricCard
          icon={FiActivity}
          title="Farm Impact Score"
          value={metrics?.farmImpact?.toString() || '0'}
          trend="+15%"
          trendPositive={true}
        />
        <MetricCard
          icon={FiUsers}
          title="Community Reach"
          value={metrics?.communityReach?.toString() || '0'}
          trend="animals"
          trendPositive={true}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiActivity className="text-green-600" />
              Recent Activities
            </h2>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {(metrics?.recentActivities || []).slice(0, 5).map((activity, index) => (
              <div key={activity.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'stock' ? 'bg-blue-500' :
                    activity.type === 'invoice' ? 'bg-green-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                {activity.value && (
                  <span className="text-sm font-semibold text-green-600">
                    ${activity.value.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Goal Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiTarget className="text-green-600" />
              Sponsorship Goals
            </h2>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              Update Goals
            </button>
          </div>
          <div className="space-y-4">
            {(metrics?.goalProgress || []).map((goal, index) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100);
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{goal.category}</span>
                    <span className="text-sm text-gray-500">{goal.current}/{goal.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{goal.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiBarChart3 className="text-green-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="View Stock Impact"
            description="See how your contributions affect farm inventory"
            href="/sponsorDashboard/stock-impact"
            icon={FiBox}
          />
          <QuickActionCard
            title="Farm Analytics"
            description="Detailed insights on farm performance"
            href="/sponsorDashboard/analytics"
            icon={FiTrendingUp}
          />
          <QuickActionCard
            title="Community Impact"
            description="Understand your broader influence"
            href="/sponsorDashboard/community"
            icon={FiUsers}
          />
          <QuickActionCard
            title="Set New Goals"
            description="Update your sponsorship objectives"
            href="/sponsorDashboard/goals"
            icon={FiTarget}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
}

function MetricCard({ icon: Icon, title, value, trend, trendPositive }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${
          trendPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

function QuickActionCard({ title, description, href, icon: Icon }: QuickActionCardProps) {
  return (
    <a 
      href={href}
      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <div className="flex items-center space-x-3 mb-2">
        <Icon className="h-5 w-5 text-green-600 group-hover:text-green-700" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}
