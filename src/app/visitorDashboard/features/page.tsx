"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiServer, FiTrendingUp, FiUsers, FiBarChart, FiShield, FiSmartphone, FiZap, FiChevronRight, FiPlay } from 'react-icons/fi';

export default function FeaturesPage() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

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
  ];  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 w-8 h-8 border-2 border-green-300 border-t-green-600 rounded-full"
            />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">
              FarmLab Features
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the comprehensive suite of cutting-edge tools designed to revolutionize modern agriculture
          </p>
          
          {/* Stats Bar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-8 mt-8"
          >
            {[
              { label: "Active Farms", value: "150+", icon: "🚜" },
              { label: "IoT Devices", value: "2.5K+", icon: "📡" },
              { label: "Countries", value: "12+", icon: "🌍" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl px-6 py-4 shadow-lg border border-green-100"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-green-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const isActive = activeFeature === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                onHoverStart={() => setActiveFeature(index)}
                onHoverEnd={() => setActiveFeature(null)}
                className="relative overflow-hidden bg-white rounded-2xl p-8 border border-gray-100 shadow-lg hover:shadow-xl cursor-pointer group transition-all duration-300"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <div className="w-full h-full bg-green-500 rounded-full transform rotate-45 scale-150" />
                </div>

                {/* Header */}
                <div className="relative z-10 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      animate={{ rotate: isActive ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg"
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ x: isActive ? 5 : 0 }}
                      className="text-gray-400 group-hover:text-gray-600"
                    >
                      <FiChevronRight className="w-6 h-6" />
                    </motion.div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Features List */}
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                    className="relative z-10 space-y-3"
                  >
                    {feature.details.map((detail, detailIndex) => (
                      <motion.div
                        key={detailIndex}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: (index * 0.1) + (detailIndex * 0.05) }}
                        className="flex items-center text-sm text-gray-700 group-hover:text-gray-800"
                      >
                        <motion.div
                          animate={{ scale: isActive ? 1.2 : 1 }}
                          className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 mr-3 flex-shrink-0"
                        />
                        {detail}
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Hover Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Demo CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-3xl p-12 text-white text-center shadow-2xl"
        >
          {/* Background Animation */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '100%',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🚀
            </motion.div>
            
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-green-100 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
              Experience the future of agriculture with our comprehensive IoT platform. 
              Join thousands of farmers already maximizing their yields with FarmLab.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-white text-green-700 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all shadow-lg"
              >
                <FiPlay className="w-5 h-5 mr-3" />
                Watch Demo
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white hover:text-green-700 transition-all"
              >
                <FiZap className="w-5 h-5 mr-3" />
                Start Free Trial
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}