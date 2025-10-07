'use client';

import { useState, useEffect } from 'react';
import { 
  FiBarChart, 
  FiUsers, 
  FiTrendingUp,
  FiTarget,
  FiHeart,
  FiActivity,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiDollarSign,
  FiCalendar,
  FiMapPin,
  FiBook,
  FiAward,
  FiMail,
  FiPhone,
  FiGlobe
} from 'react-icons/fi';

interface AnalyticsData {
  registration: Record<string, unknown>;
  metrics: Record<string, unknown>;
  stockImpact: Record<string, unknown>;
}

interface MetricsData {
  totalInvestment?: number;
  investmentGrowth?: number;
  impactScore?: number;
  recentActivities?: Array<{ description: string; date: string }>;
  goalProgress?: Array<{ title: string; progress: number }>;
}

interface RegistrationData {
  summary?: { totalRegistrations?: number };
  growth?: { monthlyGrowthRate?: number };
  trends?: { thisMonth?: number; thisWeek?: number };
  engagement?: { averageEngagement?: number; monthlyTrends?: Array<{ month: string; registrations: number; engagement: number }> };
  demographics?: { 
    roleDistribution?: Array<{ role: string; count: number; percentage: number }>;
    geographicData?: Array<{ location: string; count: number; percentage: number }>;
  };
  interests?: { categories?: Array<{ category: string; count: number; percentage: number }> };
  preferences?: { emailUpdates?: number; smsNotifications?: number; newsletter?: number };
  formAnalytics?: { completionRate?: number; averageTime?: number; dropoffRate?: number; returnUsers?: number };
}

interface StockImpactData {
  utilizationRate?: number;
  animalsHelped?: number;
  medicineValue?: number;
  feedValue?: number;
  animalsTreated?: number;
  medicineUtilization?: number;
  feedEfficiency?: number;
  costPerAnimal?: number;
  categoryBreakdown?: Array<{ name: string; value: number; percentage: number }>;
  monthlyTrends?: Array<{ month: string; impact: number; animals: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'registration' | 'impact'>('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [registrationRes, metricsRes, stockImpactRes] = await Promise.all([
        fetch('/api/sponsor/registration-analytics'),
        fetch('/api/sponsor/metrics'),
        fetch('/api/sponsor/stock-impact')
      ]);

      if (!registrationRes.ok || !metricsRes.ok || !stockImpactRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [registration, metrics, stockImpact] = await Promise.all([
        registrationRes.json(),
        metricsRes.json(),
        stockImpactRes.json()
      ]);

      setData({ registration, metrics, stockImpact });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load analytics data'}</p>
          <button
            onClick={fetchAllData}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0';
    }
    return `$${amount.toLocaleString()}`;
  };

  // Type-safe data accessors
  const metrics = data?.metrics as MetricsData;
  const registration = data?.registration as RegistrationData;
  const stockImpact = data?.stockImpact as StockImpactData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics & Insights</h1>
            <p className="text-gray-600">Comprehensive analytics for farm impact and community growth</p>
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'overview', label: 'Overview', icon: FiBarChart },
              { key: 'registration', label: 'User Engagement', icon: FiUsers },
              { key: 'impact', label: 'Farm Impact', icon: FiHeart }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiDollarSign className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-medium text-gray-500">Total Investment</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(metrics?.totalInvestment || 0)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {(metrics?.investmentGrowth || 0) >= 0 ? '+' : ''}{metrics?.investmentGrowth || 0}% this month
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiUsers className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-500">Community Members</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {registration?.summary?.totalRegistrations || 0}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {registration?.growth?.monthlyGrowthRate || 0}% growth rate
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiTarget className="w-8 h-8 text-purple-600" />
                  <span className="text-sm font-medium text-gray-500">Farm Impact Score</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {metrics?.impactScore || 0}/100
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Excellent performance
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <FiActivity className="w-8 h-8 text-orange-600" />
                  <span className="text-sm font-medium text-gray-500">Stock Utilization</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {stockImpact?.utilizationRate || 0}%
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Efficiency rating
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiCalendar className="w-5 h-5 mr-2" />
                  Recent Activities
                </h3>
                <div className="space-y-3">
                  {(metrics?.recentActivities || []).slice(0, 5).map((activity, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{(activity as any)?.description || 'No description'}</p>
                        <p className="text-xs text-gray-500">{(activity as any)?.date || 'No date'}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No recent activities</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiTarget className="w-5 h-5 mr-2" />
                  Goal Progress
                </h3>
                <div className="space-y-4">
                  {(metrics?.goalProgress || []).slice(0, 3).map((goal, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{(goal as any)?.title || 'No title'}</span>
                        <span className="text-gray-500">{(goal as any)?.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(goal as any)?.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No active goals</p>
                  )}
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Impact Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stockImpact?.animalsHelped || 0}
                  </div>
                  <p className="text-gray-600">Animals Helped</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatCurrency(stockImpact?.medicineValue || 0)}
                  </div>
                  <p className="text-gray-600">Medicine Provided</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatCurrency(stockImpact?.feedValue || 0)}
                  </div>
                  <p className="text-gray-600">Feed Supplied</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration/User Engagement Tab */}
        {activeView === 'registration' && (
          <div className="space-y-6">
            {/* Registration Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Registrations</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {registration?.summary?.totalRegistrations || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">All time</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {registration?.trends?.thisMonth || 0}
                </div>
                <div className="flex items-center mt-1">
                  <FiTrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">{registration?.growth?.monthlyGrowthRate || 0}%</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">This Week</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {registration?.trends?.thisWeek || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">New users</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Engagement Rate</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {registration?.engagement?.averageEngagement || 0}%
                </div>
                <div className="text-sm text-gray-600 mt-1">User activity</div>
              </div>
            </div>

            {/* User Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Role Distribution</h3>
                <div className="space-y-3">
                  {(registration?.demographics?.roleDistribution || []).map((role, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          (role as any)?.role === 'visitor' ? 'bg-blue-500' :
                          (role as any)?.role === 'manager' ? 'bg-green-500' :
                          (role as any)?.role === 'staff' ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-gray-700 capitalize">{(role as any)?.role || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{(role as any)?.count || 0}</span>
                        <span className="text-sm text-gray-500">({(role as any)?.percentage || 0}%)</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">No role data available</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Geographic Distribution</h3>
                <div className="space-y-3">
                  {(registration?.demographics?.geographicData || []).slice(0, 5).map((location, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{(location as any)?.location || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{(location as any)?.count || 0}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(location as any)?.percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">No location data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Interests and Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Interests & Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(registration?.interests?.categories || []).map((interest, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiBook className="w-4 h-4 text-blue-500" />
                      <h4 className="font-medium text-gray-800">{(interest as any)?.category || 'Unknown'}</h4>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">{(interest as any)?.count || 0}</div>
                    <div className="text-sm text-gray-600">{(interest as any)?.percentage || 0}% of users</div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(interest as any)?.percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 col-span-3">No interest data available</p>
                )}
              </div>
            </div>

            {/* User Feedback and Engagement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiMail className="w-5 h-5 text-blue-500" />
                      <span className="text-gray-700">Email Updates</span>
                    </div>
                    <span className="font-medium">{registration?.preferences?.emailUpdates || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiPhone className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">SMS Notifications</span>
                    </div>
                    <span className="font-medium">{registration?.preferences?.smsNotifications || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FiGlobe className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-700">Newsletter</span>
                    </div>
                    <span className="font-medium">{registration?.preferences?.newsletter || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Engagement Trends</h3>
                <div className="space-y-3">
                  {(registration?.engagement?.monthlyTrends || []).slice(-6).map((month, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{(month as any)?.month || 'Unknown'}</span>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{(month as any)?.registrations || 0}</div>
                        <div className="text-xs text-gray-500">{(month as any)?.engagement || 0}% active</div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">No trend data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Form Analytics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Form Completion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {registration?.formAnalytics?.completionRate || 0}%
                  </div>
                  <p className="text-gray-600">Completion Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {registration?.formAnalytics?.averageTime || 0}s
                  </div>
                  <p className="text-gray-600">Avg Completion Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {registration?.formAnalytics?.dropoffRate || 0}%
                  </div>
                  <p className="text-gray-600">Drop-off Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {registration?.formAnalytics?.returnUsers || 0}%
                  </div>
                  <p className="text-gray-600">Return Users</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Impact Tab */}
        {activeView === 'impact' && (
          <div className="space-y-6">
            {/* Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Animals Treated</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {stockImpact?.animalsTreated || 0}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Medicine Utilized</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {stockImpact?.medicineUtilization || 0}%
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Feed Efficiency</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {stockImpact?.feedEfficiency || 0}%
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Cost per Animal</h3>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stockImpact?.costPerAnimal || 0)}
                </div>
              </div>
            </div>

            {/* Impact Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Impact</h3>
                <div className="space-y-4">
                  {(stockImpact?.categoryBreakdown || []).map((category, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{(category as any)?.name || 'Unknown'}</span>
                        <span className="text-gray-500">{formatCurrency((category as any)?.value)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(category as any)?.percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">No category data available</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h3>
                <div className="space-y-3">
                  {(stockImpact?.monthlyTrends || []).slice(0, 6).map((month, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">{(month as any)?.month || 'Unknown'}</span>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{formatCurrency((month as any)?.impact)}</div>
                        <div className="text-xs text-gray-500">{(month as any)?.animals || 0} animals</div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">No trend data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiAward className="w-5 h-5 mr-2 text-yellow-500" />
                Impact Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <FiCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-800">Health Milestone</h4>
                  <p className="text-sm text-gray-600">100+ animals treated</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <FiCheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-800">Efficiency Leader</h4>
                  <p className="text-sm text-gray-600">90%+ utilization rate</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <FiCheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-800">Community Builder</h4>
                  <p className="text-sm text-gray-600">Growing community impact</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}