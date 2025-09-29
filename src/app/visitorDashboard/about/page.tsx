"use client";

import React from "react";
import { FiTarget, FiUsers, FiTrendingUp, FiAward, FiMapPin, FiMail } from "react-icons/fi";

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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <FiTarget className="w-8 h-8 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold text-gray-900">FarmLab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          About
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
            FarmLab
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We&apos;re transforming traditional farming into smart, data-driven agriculture through innovative IoT technology,
          AI-powered analytics, and sustainable practices that benefit farmers, consumers, and the environment.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
          <div className="flex items-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
              <FiTarget className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 ml-3">Our Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To democratize smart farming technology and make precision agriculture accessible to farms of all sizes, 
            helping farmers increase yields, reduce costs, and build more sustainable operations through data-driven insights.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
          <div className="flex items-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 ml-3">Our Vision</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To create a future where every farm is connected, intelligent, and sustainable. We envision a world where 
            technology empowers farmers to feed the growing global population while preserving our planet&apos;s resources.
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">FarmLab by Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "2000+", label: "Moroccan Farmers Interested", icon: FiUsers },
            { number: "100%", label: "Moroccan Innovation", icon: FiAward },
            { number: "24/7", label: "Farm Monitoring", icon: FiTarget },
            { number: "10+", label: "AI-Powered Solutions", icon: FiTrendingUp }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white rounded-xl shadow-sm border border-green-100">
              <stat.icon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600 mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Journey */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Journey</h2>
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">{milestone.year}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            FarmLab brings together experts from agriculture, technology, and research to create solutions that really work.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-md mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-green-600 font-medium mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Have questions about FarmLab? We&apos;d love to hear from you and discuss how we can help transform your farming operations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <div className="flex items-center gap-2">
            <FiMail className="w-5 h-5" />
            <span>hello@farmlab.com</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className="w-5 h-5" />
            <span>Morocco</span>
          </div>
        </div>
        
        <a
          href="/visitorDashboard/contact"
          className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
        >
          <FiMail className="w-5 h-5 mr-2" />
          Contact Us
        </a>
      </div>
    </div>
  );
}