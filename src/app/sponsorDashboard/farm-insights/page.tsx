"use client";

import React, { useEffect, useState } from "react";
import { FiActivity, FiWifi, FiThermometer, FiDroplet, FiSun, FiAlertTriangle, FiTrendingUp, FiUsers } from "react-icons/fi";

interface FarmInsights {
  deviceMetrics: DeviceMetrics;
  environmentalData: EnvironmentalData;
  animalWelfare: AnimalWelfare;
  operationalEfficiency: OperationalEfficiency;
  alerts: Alert[];
}

interface DeviceMetrics {
  totalDevices: number;
  onlineDevices: number;
  uptimePercentage: number;
  dataCollectionRate: number;
}

interface EnvironmentalData {
  averageTemperature: number;
  humidity: number;
  lightLevels: number;
  airQuality: number;
  trends: {
    temperature: number;
    humidity: number;
  };
}

interface AnimalWelfare {
  totalAnimals: number;
  healthScore: number;
  feedingEfficiency: number;
  activityLevels: number;
}

interface OperationalEfficiency {
  resourceUtilization: number;
  costPerAnimal: number;
  productivityIndex: number;
  automationLevel: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function FarmInsightsPage() {
  const [insights, setInsights] = useState<FarmInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'environment' | 'animals' | 'operations'>('overview');

  useEffect(() => {
    fetchFarmInsights();
  }, []);

  const fetchFarmInsights = async () => {
    try {
      const response = await fetch('/api/sponsor/farm-insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Error fetching farm insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farm insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiActivity className="text-green-600" />
            Farm Insights
          </h1>
          <p className="text-gray-600 mt-1">Real-time data and analytics from farm sensors and operations</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex space-x-1">
          {[
            { key: 'overview', label: 'Overview', icon: FiActivity },
            { key: 'environment', label: 'Environment', icon: FiThermometer },
            { key: 'animals', label: 'Animal Welfare', icon: FiUsers },
            { key: 'operations', label: 'Operations', icon: FiTrendingUp },
          ].map((tab) => (
            <button
              key={tab.key}
                            onClick={() => setSelectedTab(tab.key as 'overview' | 'environment' | 'animals' | 'operations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <FiWifi className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Devices Online</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {insights?.deviceMetrics.onlineDevices || 0}/{insights?.deviceMetrics.totalDevices || 0}
                </p>
                <p className="text-sm text-gray-500">{insights?.deviceMetrics.uptimePercentage || 0}% uptime</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <FiUsers className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Animals Monitored</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{insights?.animalWelfare.totalAnimals || 0}</p>
                <p className="text-sm text-gray-500">Health: {insights?.animalWelfare.healthScore || 0}%</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                  <FiThermometer className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Temperature</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{insights?.environmentalData.averageTemperature || 0}°C</p>
                <p className="text-sm text-gray-500">
                  {insights?.environmentalData.trends.temperature > 0 ? '+' : ''}{insights?.environmentalData.trends.temperature || 0}°C
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  <FiTrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Efficiency</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{insights?.operationalEfficiency.productivityIndex || 0}%</p>
                <p className="text-sm text-gray-500">${insights?.operationalEfficiency.costPerAnimal || 0}/animal</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiAlertTriangle className="text-yellow-600" />
                Recent Alerts
              </h2>
              <div className="space-y-3">
                {insights?.alerts?.slice(0, 5).map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                      </div>
                      {alert.resolved && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <FiAlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No recent alerts</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiThermometer className="text-green-600" />
                Environmental Status
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FiThermometer className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700">Temperature</span>
                  </div>
                  <span className="font-semibold text-gray-900">{insights?.environmentalData.averageTemperature || 0}°C</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FiDroplet className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">Humidity</span>
                  </div>
                  <span className="font-semibold text-gray-900">{insights?.environmentalData.humidity || 0}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FiSun className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700">Light Levels</span>
                  </div>
                  <span className="font-semibold text-gray-900">{insights?.environmentalData.lightLevels || 0}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FiActivity className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">Air Quality</span>
                  </div>
                  <span className="font-semibold text-gray-900">{insights?.environmentalData.airQuality || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'environment' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Environmental Monitoring</h2>
          <div className="text-center py-12">
            <FiThermometer className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Environmental Data</h3>
            <p className="text-gray-600">
              Real-time environmental monitoring charts and historical data will be displayed here.
            </p>
          </div>
        </div>
      )}

      {selectedTab === 'animals' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Animal Welfare Monitoring</h2>
          <div className="text-center py-12">
            <FiUsers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Animal Health & Welfare</h3>
            <p className="text-gray-600">
              Individual animal tracking, health metrics, and welfare indicators will be shown here.
            </p>
          </div>
        </div>
      )}

      {selectedTab === 'operations' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Operational Efficiency</h2>
          <div className="text-center py-12">
            <FiTrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Operations Analytics</h3>
            <p className="text-gray-600">
              Operational efficiency metrics, cost analysis, and productivity insights will be available here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}