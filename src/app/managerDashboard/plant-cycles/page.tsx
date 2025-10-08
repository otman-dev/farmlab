"use client";

import { useState } from "react";
import { FiSun, FiDroplet, FiCalendar, FiTrendingUp, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

interface PlantCycle {
  id: string;
  plantName: string;
  variety: string;
  stage: 'seed' | 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  plantedDate: string;
  expectedHarvest: string;
  location: string;
  notes?: string;
}

export default function PlantCyclesPage() {
  const [cycles, setCycles] = useState<PlantCycle[]>([
    {
      id: '1',
      plantName: 'Tomato',
      variety: 'Cherry Roma',
      stage: 'flowering',
      plantedDate: '2025-08-15',
      expectedHarvest: '2025-11-15',
      location: 'Greenhouse A, Row 3',
      notes: 'Growing well, regular watering needed'
    },
    {
      id: '2',
      plantName: 'Lettuce',
      variety: 'Butterhead',
      stage: 'vegetative',
      plantedDate: '2025-09-01',
      expectedHarvest: '2025-10-15',
      location: 'Field 1, Section B',
      notes: 'Ready for first harvest soon'
    },
    {
      id: '3',
      plantName: 'Carrots',
      variety: 'Nantes',
      stage: 'seedling',
      plantedDate: '2025-09-20',
      expectedHarvest: '2025-12-20',
      location: 'Field 2, Row 1-5'
    }
  ]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'seed': return 'bg-gray-100 text-gray-800';
      case 'germination': return 'bg-yellow-100 text-yellow-800';
      case 'seedling': return 'bg-green-100 text-green-800';
      case 'vegetative': return 'bg-blue-100 text-blue-800';
      case 'flowering': return 'bg-purple-100 text-purple-800';
      case 'fruiting': return 'bg-orange-100 text-orange-800';
      case 'harvest': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'seed': case 'germination': return <FiSun className="h-4 w-4" />;
      case 'seedling': case 'vegetative': return <FiTrendingUp className="h-4 w-4" />;
      case 'flowering': case 'fruiting': return <FiDroplet className="h-4 w-4" />;
      case 'harvest': return <FiCalendar className="h-4 w-4" />;
      default: return <FiSun className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <FiSun className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plant Growth Cycles</h1>
            <p className="text-gray-600 text-sm mt-1">Monitor and manage plant growth stages</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
          <FiPlus size={16} />
          Add New Cycle
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiSun className="text-yellow-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{cycles.filter(c => ['seed', 'germination'].includes(c.stage)).length}</p>
              <p className="text-gray-600 text-sm">Early Stage</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{cycles.filter(c => ['seedling', 'vegetative'].includes(c.stage)).length}</p>
              <p className="text-gray-600 text-sm">Growing</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiDroplet className="text-purple-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{cycles.filter(c => ['flowering', 'fruiting'].includes(c.stage)).length}</p>
              <p className="text-gray-600 text-sm">Maturing</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-red-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{cycles.filter(c => c.stage === 'harvest').length}</p>
              <p className="text-gray-600 text-sm">Ready to Harvest</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plant Cycles Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Plant Cycles</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planted Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Harvest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cycles.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cycle.plantName}</p>
                      <p className="text-sm text-gray-500">{cycle.variety}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(cycle.stage)}`}>
                      {getStageIcon(cycle.stage)}
                      <span className="ml-1 capitalize">{cycle.stage}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(cycle.plantedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(cycle.expectedHarvest).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cycle.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <FiEdit2 size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}