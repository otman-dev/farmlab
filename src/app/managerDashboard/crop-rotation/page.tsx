"use client";

import { useState } from "react";
import { FiRotateCcw, FiMapPin, FiCalendar, FiTrendingUp, FiPlus, FiEdit2, FiEye } from "react-icons/fi";

interface RotationPlan {
  id: string;
  fieldName: string;
  currentCrop: string;
  previousCrop?: string;
  nextPlannedCrop: string;
  rotationCycle: string;
  lastPlanted: string;
  nextPlanting: string;
  soilHealth: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

interface RotationPattern {
  id: string;
  name: string;
  description: string;
  sequence: string[];
  duration: string;
  benefits: string[];
}

export default function CropRotationPage() {
  const [rotationPlans, setRotationPlans] = useState<RotationPlan[]>([
    {
      id: '1',
      fieldName: 'Field A - North Section',
      currentCrop: 'Tomatoes',
      previousCrop: 'Beans (Nitrogen-fixing)',
      nextPlannedCrop: 'Leafy Greens',
      rotationCycle: '4-Year Rotation',
      lastPlanted: '2025-06-15',
      nextPlanting: '2025-11-01',
      soilHealth: 'excellent',
      notes: 'Soil nitrogen levels improved after legume rotation'
    },
    {
      id: '2',
      fieldName: 'Field B - South Section',
      currentCrop: 'Carrots',
      previousCrop: 'Brassicas (Cabbage)',
      nextPlannedCrop: 'Legumes (Peas)',
      rotationCycle: '3-Year Rotation',
      lastPlanted: '2025-08-01',
      nextPlanting: '2026-03-15',
      soilHealth: 'good'
    },
    {
      id: '3',
      fieldName: 'Greenhouse A',
      currentCrop: 'Lettuce',
      previousCrop: 'Peppers',
      nextPlannedCrop: 'Herbs (Basil)',
      rotationCycle: 'Continuous Rotation',
      lastPlanted: '2025-09-01',
      nextPlanting: '2025-10-15',
      soilHealth: 'fair',
      notes: 'Consider soil amendment before next cycle'
    }
  ]);

  const [rotationPatterns] = useState<RotationPattern[]>([
    {
      id: '1',
      name: 'Classic 4-Year Rotation',
      description: 'Traditional rotation for balanced soil health',
      sequence: ['Legumes (Nitrogen-fixing)', 'Brassicas (Heavy feeders)', 'Root vegetables', 'Grains/Cover crops'],
      duration: '4 years',
      benefits: ['Nitrogen fixation', 'Pest control', 'Soil structure improvement', 'Disease prevention']
    },
    {
      id: '2',
      name: 'Intensive 3-Year Rotation',
      description: 'Faster rotation for smaller plots',
      sequence: ['Heavy feeders (Tomatoes, Peppers)', 'Light feeders (Herbs, Lettuce)', 'Soil builders (Legumes)'],
      duration: '3 years',
      benefits: ['Efficient nutrient use', 'Quick soil recovery', 'Higher yield potential']
    },
    {
      id: '3',
      name: 'Companion Planting System',
      description: 'Mixed cropping with beneficial relationships',
      sequence: ['Three Sisters (Corn, Beans, Squash)', 'Herbs with vegetables', 'Cover crops with perennials'],
      duration: '2-3 years',
      benefits: ['Natural pest control', 'Space efficiency', 'Improved pollination', 'Soil protection']
    }
  ]);

  const getSoilHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilNextPlanting = (nextPlanting: string) => {
    const today = new Date();
    const nextDate = new Date(nextPlanting);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FiRotateCcw className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crop Rotation</h1>
            <p className="text-gray-600 text-sm mt-1">Plan and manage crop rotation cycles</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <FiPlus size={16} />
          Add Rotation Plan
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiMapPin className="text-purple-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rotationPlans.length}</p>
              <p className="text-gray-600 text-sm">Active Fields</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rotationPlans.filter(p => p.soilHealth === 'excellent' || p.soilHealth === 'good').length}</p>
              <p className="text-gray-600 text-sm">Healthy Soils</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rotationPlans.filter(p => getDaysUntilNextPlanting(p.nextPlanting) <= 30).length}</p>
              <p className="text-gray-600 text-sm">Due This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiRotateCcw className="text-orange-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rotationPatterns.length}</p>
              <p className="text-gray-600 text-sm">Rotation Patterns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rotation Patterns */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rotation Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rotationPatterns.map((pattern) => (
            <div key={pattern.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{pattern.name}</h4>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{pattern.duration}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Sequence:</p>
                <div className="space-y-1">
                  {pattern.sequence.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{index + 1}</span>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Benefits:</p>
                <div className="flex flex-wrap gap-1">
                  {pattern.benefits.map((benefit, index) => (
                    <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Rotation Plans */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Rotation Plans</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current → Next</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rotation Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Planting</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Health</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rotationPlans.map((plan) => {
                const daysUntilNext = getDaysUntilNextPlanting(plan.nextPlanting);
                const isUpcoming = daysUntilNext <= 30 && daysUntilNext >= 0;
                
                return (
                  <tr key={plan.id} className={`hover:bg-gray-50 ${isUpcoming ? 'bg-blue-25' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-gray-400" size={16} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{plan.fieldName}</p>
                          {plan.previousCrop && (
                            <p className="text-xs text-gray-500">Previous: {plan.previousCrop}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{plan.currentCrop}</span>
                        <FiRotateCcw className="text-gray-400" size={14} />
                        <span className="text-sm font-medium text-gray-900">{plan.nextPlannedCrop}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.rotationCycle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isUpcoming && <FiCalendar className="text-blue-500" size={14} />}
                        <div>
                          <span className="text-sm text-gray-900">{new Date(plan.nextPlanting).toLocaleDateString()}</span>
                          {isUpcoming && (
                            <p className="text-xs text-blue-600">In {daysUntilNext} days</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSoilHealthColor(plan.soilHealth)}`}>
                        {plan.soilHealth.charAt(0).toUpperCase() + plan.soilHealth.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <FiEye size={16} />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FiEdit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}