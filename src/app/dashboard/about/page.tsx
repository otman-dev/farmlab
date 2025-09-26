"use client";

import { FiHeart, FiTarget, FiUsers, FiAward, FiTrendingUp } from 'react-icons/fi';

export default function AboutPage() {
  const values = [
    {
      icon: FiHeart,
      title: "Sustainable Agriculture",
      description: "We&apos;re committed to promoting sustainable farming practices that protect our environment while ensuring food security for future generations."
    },
    {
      icon: FiTarget,
      title: "Innovation First",
      description: "We continuously push the boundaries of agricultural technology, bringing cutting-edge IoT solutions to traditional farming operations."
    },
    {
      icon: FiUsers,
      title: "Farmer-Centric",
      description: "Every feature we build is designed with farmers in mind, ensuring our solutions are practical, reliable, and easy to use."
    }
  ];

  const milestones = [
    { year: "2023", title: "Founded", description: "FarmLab was established with a vision to revolutionize agriculture" },
    { year: "2024", title: "First Deployment", description: "Successfully deployed our IoT system on our pilot farm" },
    { year: "2025", title: "Platform Launch", description: "Full platform release with comprehensive farm management features" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">About FarmLab</h1>
            <p className="text-gray-600 mt-1">Our mission and journey in revolutionizing agriculture</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <FiTarget className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          To empower farmers worldwide with intelligent, sustainable farming solutions that maximize productivity,
          minimize environmental impact, and ensure food security for generations to come.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 mb-4 mx-auto">
                <Icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{value.description}</p>
            </div>
          );
        })}
      </div>

      {/* Story Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              FarmLab was born out of frustration with traditional farming methods that were inefficient,
              environmentally harmful, and disconnected from modern technology. Our founders, experienced farmers themselves,
              saw the potential of IoT technology to transform agriculture.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Starting with our own farm as a testing ground, we developed and refined our IoT platform,
              learning firsthand what works and what doesn&apos;t in real agricultural environments.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">500+</div>
                <div className="text-xs text-gray-600">IoT Sensors Tested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">2</div>
                <div className="text-xs text-gray-600">Years R&D</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">10+</div>
                <div className="text-xs text-gray-600">Farm Partners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                <div className="text-xs text-gray-600">Farmer-Led</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Our Journey</h2>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                {milestone.year}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                <p className="text-gray-600 text-sm">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow p-6 text-white text-center">
        <h2 className="text-lg font-bold mb-3">Join Our Mission</h2>
        <p className="text-green-100 mb-4 text-sm">
          Be part of the agricultural revolution. Whether you&apos;re a farmer looking to modernize or a partner interested in our technology, we&apos;d love to hear from you.
        </p>
        <button className="inline-flex items-center px-6 py-2 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
          <FiAward className="w-4 h-4 mr-2" />
          Get in Touch
        </button>
      </div>
    </div>
  );
}