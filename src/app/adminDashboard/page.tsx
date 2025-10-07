"use client";
import React from "react";
import Link from "next/link";
import { 
  FiShield, 
  FiTrendingUp, 
  FiHome, 
  FiEye, 
  FiUsers, 
  FiServer,
  FiActivity,
  FiBarChart,
  FiPackage,
  FiShoppingCart,
  FiStar
} from "react-icons/fi";

export default function AdminDashboardPage() {
  const roleCards = [
    {
      title: "Admin Console",
      description: "Full system administration and user management",
      icon: FiShield,
      color: "red",
      link: "/dashboard/users",
      features: ["User Management", "System Settings", "Security System", "Device Management"]
    },
    {
      title: "Manager Dashboard",
      description: "Farm operations and inventory management",
      icon: FiTrendingUp,
      color: "blue",
      link: "/managerDashboard",
      features: ["Medical Stock", "Food Stock", "Staff Management", "Suppliers"]
    },
    {
      title: "Sponsor Dashboard",
      description: "Financial tracking and analytics",
      icon: FiHome,
      color: "purple",
      link: "/sponsorDashboard",
      features: ["Analytics & Insights", "Financial Tracking", "Inventory Overview", "Performance Metrics"]
    },
    {
      title: "Visitor Dashboard",
      description: "Public-facing information and features",
      icon: FiEye,
      color: "green",
      link: "/visitorDashboard",
      features: ["Farm Features", "About Information", "Contact System", "Public Access"]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      red: "bg-red-50 border-red-200 text-red-700",
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      green: "bg-green-50 border-green-200 text-green-700"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.red;
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      red: "text-red-600",
      blue: "text-blue-600", 
      purple: "text-purple-600",
      green: "text-green-600"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.red;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <FiShield className="text-red-600" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
            <p className="text-gray-600 mt-1">Complete access to all role dashboards and system management</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FiShield className="text-red-600" size={16} />
            <span className="font-semibold text-red-800">Administrator Privileges</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            You have full access to all role-specific dashboards. Use the sidebar navigation to switch between different role views for development and testing.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiUsers className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-gray-600 text-sm">User Roles</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiServer className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">Active</p>
              <p className="text-gray-600 text-sm">System Status</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiActivity className="text-purple-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">Online</p>
              <p className="text-gray-600 text-sm">Services</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiBarChart className="text-orange-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">Full</p>
              <p className="text-gray-600 text-sm">Access Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roleCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${getColorClasses(card.color)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon className={`${getIconColor(card.color)}`} size={28} />
                  <div>
                    <h3 className="text-xl font-bold">{card.title}</h3>
                    <p className="text-sm opacity-80 mt-1">{card.description}</p>
                  </div>
                </div>
                <Link 
                  href={card.link}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-gray-700 font-medium text-sm"
                >
                  Access →
                </Link>
              </div>
              
              <div className="space-y-2">
                <p className="font-semibold text-sm opacity-90">Key Features:</p>
                <div className="grid grid-cols-2 gap-2">
                  {card.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                      <span className="text-sm opacity-80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Admin Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/users"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <FiUsers className="text-blue-600" size={20} />
            <span className="font-medium text-gray-900">Manage Users</span>
          </Link>
          <Link 
            href="/dashboard/settings"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <FiServer className="text-green-600" size={20} />
            <span className="font-medium text-gray-900">System Settings</span>
          </Link>
          <Link 
            href="/dashboard/devices"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <FiActivity className="text-purple-600" size={20} />
            <span className="font-medium text-gray-900">Device Management</span>
          </Link>
        </div>
      </div>
    </div>
  );
}