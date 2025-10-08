"use client";

import { useState } from "react";
import { FiPackage, FiTrendingUp, FiCalendar, FiBox, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

interface HarvestRecord {
  id: string;
  plantName: string;
  variety: string;
  harvestDate: string;
  quantity: number;
  unit: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  notes?: string;
  marketValue?: number;
}

export default function HarvestTrackerPage() {
  const [harvests, setHarvests] = useState<HarvestRecord[]>([
    {
      id: '1',
      plantName: 'Tomato',
      variety: 'Cherry Roma',
      harvestDate: '2025-10-05',
      quantity: 25,
      unit: 'kg',
      quality: 'excellent',
      location: 'Greenhouse A, Row 3',
      marketValue: 150,
      notes: 'Perfect ripeness, great color'
    },
    {
      id: '2',
      plantName: 'Lettuce',
      variety: 'Butterhead',
      harvestDate: '2025-10-03',
      quantity: 15,
      unit: 'heads',
      quality: 'good',
      location: 'Field 1, Section B',
      marketValue: 45
    },
    {
      id: '3',
      plantName: 'Carrots',
      variety: 'Nantes',
      harvestDate: '2025-10-01',
      quantity: 18,
      unit: 'kg',
      quality: 'excellent',
      location: 'Field 2, Row 1-5',
      marketValue: 90,
      notes: 'Uniform size, minimal damage'
    },
    {
      id: '4',
      plantName: 'Spinach',
      variety: 'Baby Leaf',
      harvestDate: '2025-09-28',
      quantity: 8,
      unit: 'kg',
      quality: 'fair',
      location: 'Greenhouse A, Hydroponic',
      marketValue: 32,
      notes: 'Some yellowing, harvested early'
    }
  ]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalValue = () => {
    return harvests.reduce((sum, harvest) => sum + (harvest.marketValue || 0), 0);
  };

  const getTotalQuantity = () => {
    return harvests.reduce((sum, harvest) => {
      // Convert to common unit (assuming kg for now)
      if (harvest.unit === 'kg') return sum + harvest.quantity;
      if (harvest.unit === 'heads') return sum + (harvest.quantity * 0.3); // Assume 300g per head
      return sum + harvest.quantity;
    }, 0);
  };

  const getThisWeekHarvests = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return harvests.filter(h => new Date(h.harvestDate) >= oneWeekAgo).length;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <FiPackage className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Harvest Tracker</h1>
            <p className="text-gray-600 text-sm mt-1">Record and monitor harvest yields</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
          <FiPlus size={16} />
          Record Harvest
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiPackage className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{harvests.length}</p>
              <p className="text-gray-600 text-sm">Total Harvests</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiBox className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{getTotalQuantity().toFixed(1)} kg</p>
              <p className="text-gray-600 text-sm">Total Yield</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="text-purple-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">${getTotalValue()}</p>
              <p className="text-gray-600 text-sm">Market Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-orange-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{getThisWeekHarvests()}</p>
              <p className="text-gray-600 text-sm">This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Distribution */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['excellent', 'good', 'fair', 'poor'].map(quality => {
            const count = harvests.filter(h => h.quality === quality).length;
            const percentage = harvests.length > 0 ? (count / harvests.length * 100).toFixed(1) : '0';
            return (
              <div key={quality} className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(quality)}`}>
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                <p className="text-sm text-gray-600">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Harvest Records Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Harvest Records</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {harvests.map((harvest) => (
                <tr key={harvest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{harvest.plantName}</p>
                      <p className="text-sm text-gray-500">{harvest.variety}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(harvest.harvestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <FiBox className="text-gray-400" size={14} />
                      {harvest.quantity} {harvest.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityColor(harvest.quality)}`}>
                      {harvest.quality.charAt(0).toUpperCase() + harvest.quality.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {harvest.marketValue ? `$${harvest.marketValue}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {harvest.location}
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