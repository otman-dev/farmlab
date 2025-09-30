"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiTarget, FiUsers, FiTrendingUp, FiAward, FiMapPin, FiMail, FiEye } from "react-icons/fi";

export default function VisitorAboutPage() {
  const milestones = [
    { year: "2023", title: "Company Founded", description: "FarmLab was established with a vision to revolutionize agriculture through technology" },
    { year: "2024", title: "First Pilot Deployment", description: "Successfully deployed our IoT system on pilot farms with real-time monitoring capabilities" },
    { year: "2025", title: "Platform Launch", description: "Full platform release with comprehensive farm management features and community access" }
  ];

  const team = [
    { name: "Engineering Team", role: "Technology & Development", description: "Building cutting-edge IoT and AI solutions" },
    { name: "Agricultural Experts", role: "Domain Knowledge", description: "Ensuring practical, real-world farming applications" },
    { name: "Research Partners", role: "Innovation", description: "Collaborating on advanced agricultural research" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-white rounded-3xl shadow-xl p-12 border border-green-100 relative overflow-hidden"
        >
          {/* Background Animation */}
          <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
            <div className="w-full h-full bg-green-500 rounded-full transform rotate-45 scale-150" />
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex items-center justify-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-3xl shadow-xl">
              <FiTarget className="w-10 h-10 text-white" />
            </div>
            <span className="ml-4 text-3xl font-bold text-gray-900">FarmLab</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6"
          >
            About
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-700 to-green-800 mt-2">
              FarmLab
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
          >
            We&apos;re transforming traditional farming into smart, data-driven agriculture through innovative IoT technology,
            AI-powered analytics, and sustainable practices that benefit farmers, consumers, and the environment.
          </motion.p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-green-100 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
              <div className="w-full h-full bg-green-500 rounded-full transform rotate-45 scale-150" />
            </div>
            
            <div className="flex items-center mb-6 relative z-10">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl shadow-lg"
              >
                <FiTarget className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 ml-4 group-hover:text-green-600 transition-colors">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg relative z-10">
              To democratize smart farming technology and make precision agriculture accessible to farms of all sizes, 
              helping farmers increase yields, reduce costs, and build more sustainable operations through data-driven insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white rounded-3xl shadow-xl p-8 border border-green-100 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
              <div className="w-full h-full bg-green-500 rounded-full transform rotate-45 scale-150" />
            </div>
            
            <div className="flex items-center mb-6 relative z-10">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl shadow-lg"
              >
                <FiEye className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 ml-4 group-hover:text-green-600 transition-colors">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg relative z-10">
              To create a future where every farm is connected, intelligent, and sustainable. We envision a world where 
              technology empowers farmers to feed the growing global population while preserving our planet&apos;s resources.
            </p>
          </motion.div>
        </div>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-12 border border-green-100 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 opacity-30" />
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 text-center mb-10 relative z-10"
          >
            FarmLab by Numbers
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {[
              { number: "2000+", label: "Moroccan Farmers Interested", icon: FiUsers },
              { number: "100%", label: "Moroccan Innovation", icon: FiAward },
              { number: "24/7", label: "Farm Monitoring", icon: FiTarget },
              { number: "10+", label: "AI-Powered Solutions", icon: FiTrendingUp }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 bg-white rounded-2xl shadow-lg border border-green-100 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-10 h-10 text-green-500 mx-auto mb-4 group-hover:text-green-600 transition-colors" />
                </motion.div>
                <div className="text-3xl font-bold text-green-600 mb-2 group-hover:text-green-700 transition-colors">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 font-medium group-hover:text-gray-700 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Journey */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-12 border border-green-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-green-600" />
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 text-center mb-12"
          >
            Our Journey
          </motion.h2>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-6 p-6 rounded-2xl hover:bg-green-50 transition-all duration-300 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex-shrink-0 w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow"
                >
                  <span className="text-white font-bold text-xl">{milestone.year}</span>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-xl p-12 border border-green-100"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 mb-6"
            >
              Our Team
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              FarmLab brings together experts from agriculture, technology, and research to create solutions that really work.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="text-center p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full shadow-lg mb-6 group-hover:shadow-xl"
                >
                  <FiUsers className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-green-600 font-bold mb-4 text-lg group-hover:text-green-700 transition-colors">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-3xl shadow-2xl p-12 text-white text-center"
        >
          {/* Background Animation */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
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

          <div className="relative z-10">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-6"
            >
              🤝
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-6"
            >
              Get in Touch
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-green-100 mb-8 text-xl leading-relaxed max-w-3xl mx-auto"
            >
              Have questions about FarmLab? We&apos;d love to hear from you and discuss how we can help transform your farming operations.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
            >
              <div className="flex items-center gap-3 text-lg">
                <FiMail className="w-6 h-6" />
                <span>hello@farmlab.com</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <FiMapPin className="w-6 h-6" />
                <span>Morocco</span>
              </div>
            </motion.div>
            
            <motion.a
              href="/visitorDashboard/contact"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all duration-200 shadow-2xl hover:shadow-3xl"
            >
              <FiMail className="w-6 h-6 mr-3" />
              Contact Us
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}