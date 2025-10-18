"use client";
import React from "react";
import { useI18n } from "../../components/LanguageProvider";
import SensorStationsComparisonChart from "@/components/dashboard/SensorStationsComparisonChart";
import { FiThermometer } from "react-icons/fi";

export default function ManagerDashboardPage() {
  const { t } = useI18n();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <FiThermometer className="text-green-600" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('manager.dashboard.title')}</h1>
            <p className="text-gray-600 mt-1">{t('manager.dashboard.welcome')}</p>
          </div>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiThermometer className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">Monitor</p>
              <p className="text-gray-600 text-sm">Environmental Conditions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiThermometer className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">Track</p>
              <p className="text-gray-600 text-sm">24h Trends</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiThermometer className="text-purple-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">Compare</p>
              <p className="text-gray-600 text-sm">All Stations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Stations Comparison Chart */}
      <div className="mb-8">
        <SensorStationsComparisonChart />
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Management Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">{t('manager.dashboard.feature1')}</h4>
            <p className="text-green-700 text-sm">Manage medical supplies and track inventory levels across all facilities.</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">{t('manager.dashboard.feature2')}</h4>
            <p className="text-blue-700 text-sm">Handle invoices, track payments, and manage supplier relationships.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">{t('manager.dashboard.feature3')}</h4>
            <p className="text-purple-700 text-sm">Oversee staff operations and manage personnel across all departments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}