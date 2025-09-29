"use client";

import { FiServer, FiTrendingUp, FiUsers, FiBarChart, FiShield, FiSmartphone, FiZap, FiTarget } from 'react-icons/fi';

export default function FeaturesPage() {
  const features = [
    {
      icon: FiServer,
      title: "IoT Device Management",
      description: "Seamlessly connect and manage hundreds of IoT sensors and devices across your farm. Real-time monitoring of soil moisture, temperature, humidity, and more.",
      details: ["Automated device discovery", "Real-time data streaming", "Device health monitoring", "Remote configuration"]
    },
    {
      icon: FiTrendingUp,
      title: "Data Analytics & Insights",
      description: "Advanced analytics provide actionable insights to optimize crop yields, reduce water usage, and improve overall farm productivity.",
      details: ["Predictive analytics", "Yield optimization", "Resource usage tracking", "Performance dashboards"]
    },
    {
      icon: FiUsers,
      title: "Team Collaboration",
      description: "Coordinate with your farm team through integrated task management, role-based access control, and real-time communication tools.",
      details: ["Task assignment", "Role-based permissions", "Real-time notifications", "Team communication"]
    },
    {
      icon: FiBarChart,
      title: "Comprehensive Reporting",
      description: "Generate detailed reports on farm performance, resource usage, and productivity metrics to make informed business decisions.",
      details: ["Automated reports", "Custom dashboards", "Historical data analysis", "Export capabilities"]
    },
    {
      icon: FiShield,
      title: "Security & Reliability",
      description: "Enterprise-grade security with encrypted data transmission, secure authentication, and reliable cloud infrastructure.",
      details: ["End-to-end encryption", "Multi-factor authentication", "Data backup", "99.9% uptime SLA"]
    },
    {
      icon: FiSmartphone,
      title: "Mobile Access",
      description: "Monitor and control your farm operations from anywhere using our responsive mobile interface and dedicated mobile applications.",
      details: ["iOS & Android apps", "Offline capabilities", "Push notifications", "Voice commands"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FarmLab Features</h1>
            <p className="text-gray-600 mt-1">Comprehensive suite of tools for modern agriculture</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <FiZap className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
              <div className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="flex items-center text-sm text-gray-600">
                    <FiTarget className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-3">Ready to Experience These Features?</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto text-sm">
          Join FarmLab today and transform your farming operations with cutting-edge IoT technology.
        </p>
        <button className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
          <FiZap className="w-4 h-4 mr-2" />
          Request Demo
        </button>
      </div>
    </div>
  );
}