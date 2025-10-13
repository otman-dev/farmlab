"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiServer, FiActivity, FiAlertCircle, FiCheck, FiTrendingUp, FiUsers, FiBarChart, FiShield, FiZap, FiTarget, FiSmartphone } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface User {
  role?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user) {
      setUser(session.user as User);
    }
    setLoading(false);
  }, [session, status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  console.log('Dashboard page: User has role:', user.role);
  
  // Redirect waiting_list users
  if (user.role === 'waiting_list') {
    // We should handle this in middleware, but as a backup:
    typeof window !== 'undefined' && window.location.replace('/comingsoon');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p>Redirecting to waiting list page...</p>
        </div>
      </div>
    );
  }
  
  // Show visitor presentation dashboard
  if (user.role === 'visitor') {
    return <VisitorPresentation />;
  }

  // Show admin dashboard
  return <AdminDashboard />;
}

function VisitorPresentation() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-8">
              <FiTarget className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Farming
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Reimagined
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your agricultural operations with cutting-edge IoT technology.
              Monitor, analyze, and optimize your farm&apos;s performance in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <FiZap className="w-5 h-5 mr-2" />
                Start Your Journey
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-green-500 hover:text-green-600 transition-all duration-200">
                <FiBarChart className="w-5 h-5 mr-2" />
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Proven Results</h2>
            <p className="text-lg text-gray-600">Real impact from real farms using FarmLab</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                <FiServer className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">IoT Devices</div>
              <div className="text-xs text-gray-500 mt-1">Supported worldwide</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25%</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Yield Increase</div>
              <div className="text-xs text-gray-500 mt-1">Average improvement</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                <FiActivity className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Uptime</div>
              <div className="text-xs text-gray-500 mt-1">System reliability</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg mb-4">
                <FiCheck className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">40%</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Water Savings</div>
              <div className="text-xs text-gray-500 mt-1">Resource efficiency</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Farm Management</h2>
            <p className="text-lg text-gray-600">Everything you need to run a modern, efficient farm</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg mb-6">
                <FiServer className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">IoT Device Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Seamlessly connect and manage hundreds of IoT sensors across your farm with real-time monitoring and automated alerts.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg mb-6">
                <FiTrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Transform raw data into actionable insights with AI-powered analytics that optimize crop yields and resource usage.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg mb-6">
                <FiUsers className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Coordinate seamlessly with your farm team through integrated task management and real-time communication tools.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg mb-6">
                <FiBarChart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Reporting</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate comprehensive reports and dashboards that provide deep insights into your farm&apos;s performance and productivity.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg mb-6">
                <FiShield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Rest easy with enterprise-grade security, encrypted data transmission, and secure authentication protecting your farm data.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg mb-6">
                <FiSmartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mobile Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor and control your farm operations from anywhere using our intuitive mobile applications and responsive web interface.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose FarmLab?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Proven Technology</h3>
                    <p className="text-gray-600">Backed by years of research and real-world testing on operational farms.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Farmer-First Design</h3>
                    <p className="text-gray-600">Built by farmers, for farmers. Every feature is designed with practicality in mind.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Scalable Solutions</h3>
                    <p className="text-gray-600">From small family farms to large agricultural operations, FarmLab scales with your needs.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 shadow-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-md mb-6">
                    <FiTarget className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                  <p className="text-gray-600 mb-6">
                    Join hundreds of farmers who have transformed their operations with FarmLab.
                  </p>
                  <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg">
                    <FiZap className="w-5 h-5 mr-2" />
                    Request Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Transform Your Farm Today
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Don&apos;t let outdated farming methods hold you back. Embrace the future of agriculture with FarmLab&apos;s intelligent IoT solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg">
              <FiZap className="w-5 h-5 mr-2" />
              Get Started Now
            </button>
            <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-green-600 transition-all duration-200">
              <FiBarChart className="w-5 h-5 mr-2" />
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Device {
  _id: string;
  name: string;
  device_id: string;
  type: string;
  status: string;
}

function AdminDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevices() {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/devices');

        if (!response.ok) {
          throw new Error(`Failed to fetch devices: ${response.statusText}`);
        }

        const data = await response.json();
        setDevices(data.devices || []);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError((err as Error).message || 'Failed to load devices');
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
  }, []);

  // Calculate device statistics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const maintenanceDevices = devices.filter(d => d.status === 'maintenance').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to your FarmLab Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
              <FiServer className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Total Devices</h3>
              <div className="mt-1 text-3xl font-semibold text-gray-800">
                {loading ? '...' : totalDevices}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
              <FiCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Online</h3>
              <div className="mt-1 text-3xl font-semibold text-gray-800">
                {loading ? '...' : onlineDevices}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-red-100 p-3">
              <FiAlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Offline</h3>
              <div className="mt-1 text-3xl font-semibold text-gray-800">
                {loading ? '...' : offlineDevices}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
              <FiShield className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">Maintenance</h3>
              <div className="mt-1 text-3xl font-semibold text-gray-800">
                {loading ? '...' : maintenanceDevices}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Devices Overview */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Devices Overview</h2>
            <Link
              href="/dashboard/devices"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all devices
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading devices...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : devices.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No devices found in your system.</p>
            <p className="mt-2 text-sm text-gray-400">
              Devices will appear here once they connect to your system.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.slice(0, 5).map((device, idx) => (
                  <tr key={device._id ?? device.device_id ?? `device-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{device.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{device.device_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{device.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          device.status === 'online'
                            ? 'bg-green-100 text-green-800'
                            : device.status === 'offline'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1.5 ${
                            device.status === 'online'
                              ? 'bg-green-400'
                              : device.status === 'offline'
                              ? 'bg-red-400'
                              : 'bg-gray-400'
                          }`}></div>
                          {device.status || 'unknown'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/devices/${device.device_id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {devices.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-right">
                <Link
                  href="/dashboard/devices"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all {devices.length} devices
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}