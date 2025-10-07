"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  FiTrendingUp, 
  FiBox, 
  FiActivity, 
  FiUsers, 
  FiTarget, 
  FiDollarSign, 
  FiBarChart,
  FiHeart,
  FiShield,
  FiCheckCircle
} from "react-icons/fi";

interface SponsorMetrics {
  totalContribution: number;
  itemsSponsored: number;
  farmImpact: number;
  communityReach: number;
  recentActivities: Activity[];
  goalProgress: GoalProgress[];
  totalStaffSupported: number;
  averageMonthlySpending: number;
  medicineUtilizationRate: number;
  sustainabilityScore: number;
  communityFeedbackCount: number;
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

interface StockImpactData {
  categoryBreakdown: CategoryBreakdown[];
  recentContributions: RecentContribution[];
  utilizationStats: UtilizationStats;
  impactMetrics: ImpactMetrics;
  summary: ExecutiveSummary;
}

interface CategoryBreakdown {
  category: string;
  currentStock: number;
  contributed: number;
  utilized: number;
  percentage: number;
  efficiency: number;
}

interface RecentContribution {
  id: string;
  invoiceNumber: string;
  date: string;
  totalQuantity: number;
  totalValue: number;
  animalsHelped: number;
  impactScore: number;
}

interface UtilizationStats {
  medicineUtilization: {
    totalUnits: number;
    used: number;
    utilizationRate: number;
    wasteRate: number;
  };
  financialUtilization: {
    totalInvestment: number;
    wasteReduction: number;
  };
}

interface ImpactMetrics {
  animalSupport: {
    totalAnimalsSupported: number;
    costPerAnimalSupported: number;
  };
  operationalImpact: {
    sustainabilityScore: number;
    resourceEfficiency: number;
  };
  financialImpact: {
    totalInvestment: number;
    estimatedSavings: number;
    roi: number;
  };
}

interface ExecutiveSummary {
  totalInvestment: number;
  animalsSupported: number;
  efficiencyScore: number;
  sustainabilityRating: number;
  keyAchievements: string[];
}

export default function SponsorDashboardPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<SponsorMetrics | null>(null);
  const [stockImpact, setStockImpact] = useState<StockImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'impact' | 'analytics'>('overview');

  useEffect(() => {
    fetchSponsorData();
  }, []);

  const fetchSponsorData = async () => {
    try {
      const [metricsResponse, stockResponse] = await Promise.all([
        fetch('/api/sponsor/metrics'),
        fetch('/api/sponsor/stock-impact')
      ]);
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }
      
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();
        setStockImpact(stockData);
      }
    } catch (error) {
      console.error('Error fetching sponsor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Your Impact Dashboard</h2>
          <p className="text-gray-500">Analyzing your contribution data...</p>
        </div>
      </div>
    );
  }

  const user = session?.user as { name?: string; email?: string } | undefined;
  const welcomeName = user?.name || 'Sponsor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Welcome Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3">Welcome back, {welcomeName}!</h1>
              <p className="text-green-100 text-lg mb-4">
                Your strategic sponsorship is transforming farm operations and animal welfare
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <FiHeart className="text-red-300" />
                  <span className="text-sm">
                    {stockImpact?.summary?.animalsSupported || 0} animals supported
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiShield className="text-blue-300" />
                  <span className="text-sm">
                    {metrics?.sustainabilityScore || 0}% sustainability score
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiDollarSign className="text-yellow-300" />
                  <span className="text-sm">
                    ${(stockImpact?.impactMetrics?.financialImpact?.estimatedSavings || 0).toLocaleString()} saved
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                ${(metrics?.totalContribution || 0).toLocaleString()}
              </div>
              <div className="text-green-200 text-sm">Total Investment</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg">
          {[
            { key: 'overview', label: 'Overview', icon: FiActivity },
            { key: 'impact', label: 'Stock Impact', icon: FiBox },
            { key: 'analytics', label: 'Analytics', icon: FiBarChart }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'overview' | 'impact' | 'analytics')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg transition-all ${
                activeTab === key
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Enhanced Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <EnhancedMetricCard
                icon={FiDollarSign}
                title="Total Investment"
                value={`$${(metrics?.totalContribution || 0).toLocaleString()}`}
                subtitle={`$${Math.round(metrics?.averageMonthlySpending || 0).toLocaleString()}/month avg`}
                trend="+12%"
                trendPositive={true}
                color="green"
              />
              <EnhancedMetricCard
                icon={FiBox}
                title="Items Sponsored"
                value={(metrics?.itemsSponsored || 0).toString()}
                subtitle={`${metrics?.totalStaffSupported || 0} staff supported`}
                trend="+8 this month"
                trendPositive={true}
                color="blue"
              />
              <EnhancedMetricCard
                icon={FiActivity}
                title="Farm Impact Score"
                value={(metrics?.farmImpact || 0).toString()}
                subtitle={`${metrics?.sustainabilityScore || 0}% sustainability`}
                trend="+15%"
                trendPositive={true}
                color="purple"
              />
              <EnhancedMetricCard
                icon={FiUsers}
                title="Community Reach"
                value={(metrics?.communityReach || 0).toString()}
                subtitle="animals supported"
                trend={`${metrics?.medicineUtilizationRate || 0}% efficiency`}
                trendPositive={true}
                color="orange"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activities with Enhanced Design */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiActivity className="text-green-600 w-5 h-5" />
                    </div>
                    Recent Impact Activities
                  </h2>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium bg-green-50 px-3 py-1 rounded-lg">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {(metrics?.recentActivities || []).slice(0, 5).map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        activity.type === 'stock' ? 'bg-blue-500' :
                        activity.type === 'invoice' ? 'bg-green-500' : 'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 mb-1">{activity.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{activity.date}</p>
                          {activity.value && (
                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                              ${activity.value.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Goal Progress */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiTarget className="text-blue-600 w-5 h-5" />
                    </div>
                    Sponsorship Goals
                  </h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 px-3 py-1 rounded-lg">
                    Update Goals
                  </button>
                </div>
                <div className="space-y-6">
                  {(metrics?.goalProgress || []).map((goal, index) => {
                    const progress = Math.min((goal.current / goal.target) * 100, 100);
                    return (
                      <div key={index} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">{goal.category}</span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {goal.current.toLocaleString()}/{goal.target.toLocaleString()}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                progress >= 90 ? 'bg-green-500' :
                                progress >= 70 ? 'bg-blue-500' :
                                progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <span className="absolute right-0 top-4 text-xs text-gray-600">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{goal.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions with Enhanced Design */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiBarChart className="text-purple-600 w-5 h-5" />
                </div>
                Quick Actions & Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard
                  title="Stock Impact Analysis"
                  description="Deep dive into your inventory contributions"
                  href="/sponsorDashboard/stock-impact"
                  icon={FiBox}
                  color="blue"
                  metric={`${stockImpact?.summary?.efficiencyScore || 0}% efficiency`}
                />
                <QuickActionCard
                  title="Farm Analytics"
                  description="Comprehensive performance insights"
                  href="/sponsorDashboard/analytics"
                  icon={FiTrendingUp}
                  color="green"
                  metric={`${metrics?.farmImpact || 0} impact score`}
                />
                <QuickActionCard
                  title="Community Impact"
                  description="See your broader influence"
                  href="/sponsorDashboard/community"
                  icon={FiUsers}
                  color="purple"
                  metric={`${metrics?.communityReach || 0} animals`}
                />
                <QuickActionCard
                  title="Financial ROI"
                  description="Investment returns and savings"
                  href="/sponsorDashboard/financials"
                  icon={FiDollarSign}
                  color="orange"
                  metric={`${stockImpact?.impactMetrics?.financialImpact?.roi || 0}% ROI`}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && stockImpact && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Stock Impact Executive Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">${stockImpact.summary.totalInvestment.toLocaleString()}</div>
                  <div className="text-blue-200">Total Investment</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stockImpact.summary.animalsSupported}</div>
                  <div className="text-blue-200">Animals Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stockImpact.summary.efficiencyScore}%</div>
                  <div className="text-blue-200">Efficiency Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stockImpact.summary.sustainabilityRating}%</div>
                  <div className="text-blue-200">Sustainability</div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6">Inventory Category Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stockImpact.categoryBreakdown.map((category, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-lg mb-4">{category.category}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="font-semibold">{category.currentStock}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contributed:</span>
                        <span className="font-semibold">{category.contributed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilized:</span>
                        <span className="font-semibold">{category.utilized}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency:</span>
                        <span className={`font-semibold ${category.efficiency >= 85 ? 'text-green-600' : category.efficiency >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {category.efficiency}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">{category.percentage}% of total inventory</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Achievements */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6">Key Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stockImpact.summary.keyAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <FiCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4">Advanced Analytics</h3>
              <p className="text-gray-600">Detailed analytics dashboard coming soon...</p>
              <div className="mt-6 flex space-x-4">
                <button 
                  onClick={() => window.open('/sponsorDashboard/analytics', '_blank')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Full Analytics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface EnhancedMetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendPositive: boolean;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

function EnhancedMetricCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  trendPositive,
  color 
}: EnhancedMetricCardProps) {
  let bgColor: string;
  let iconColor: string;
  let trendColor: string;

  switch (color) {
    case 'green':
      bgColor = 'bg-green-100';
      iconColor = 'text-green-600';
      trendColor = trendPositive ? 'text-green-600' : 'text-red-600';
      break;
    case 'blue':
      bgColor = 'bg-blue-100';
      iconColor = 'text-blue-600';
      trendColor = trendPositive ? 'text-blue-600' : 'text-red-600';
      break;
    case 'purple':
      bgColor = 'bg-purple-100';
      iconColor = 'text-purple-600';
      trendColor = trendPositive ? 'text-purple-600' : 'text-red-600';
      break;
    case 'orange':
      bgColor = 'bg-orange-100';
      iconColor = 'text-orange-600';
      trendColor = trendPositive ? 'text-orange-600' : 'text-red-600';
      break;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${trendColor} bg-opacity-10`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'green' | 'blue' | 'purple' | 'orange';
  metric: string;
}

function QuickActionCard({ title, description, href, icon: Icon, color, metric }: QuickActionCardProps) {
  let borderColor: string;
  let iconColor: string;

  switch (color) {
    case 'green':
      borderColor = 'border-green-200 hover:border-green-300 hover:bg-green-50';
      iconColor = 'text-green-600';
      break;
    case 'blue':
      borderColor = 'border-blue-200 hover:border-blue-300 hover:bg-blue-50';
      iconColor = 'text-blue-600';
      break;
    case 'purple':
      borderColor = 'border-purple-200 hover:border-purple-300 hover:bg-purple-50';
      iconColor = 'text-purple-600';
      break;
    case 'orange':
      borderColor = 'border-orange-200 hover:border-orange-300 hover:bg-orange-50';
      iconColor = 'text-orange-600';
      break;
  }

  return (
    <a 
      href={href}
      className={`block p-6 border-2 rounded-xl transition-all group ${borderColor}`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <Icon className={`h-6 w-6 ${iconColor} group-hover:scale-110 transition-transform`} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${iconColor}`}>{metric}</span>
        <FiTrendingUp className={`w-4 h-4 ${iconColor} opacity-60`} />
      </div>
    </a>
  );
}
