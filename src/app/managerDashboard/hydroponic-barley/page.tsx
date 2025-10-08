"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiCalendar, FiCheck, FiLoader } from "react-icons/fi";

interface BarleyPlate {
  _id: string;
  plateNumber: string;
  plateUnits: number;
  startDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  seedWeight: number; // kg of seeds
  status: 'growing' | 'ready' | 'harvested';
  notes?: string;
  createdBy: string;
  farmId: string;
  createdAt: string;
  updatedAt: string;
}

export default function HydroponicBarleyPage() {
  const [barleyPlates, setBarleyPlates] = useState<BarleyPlate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPlate, setNewPlate] = useState({
    plateNumber: '',
    startDate: '',
    expectedHarvestDate: '',
    seedWeight: 0,
    plateUnits: 1,
    notes: ''
  });

  // Fetch plates from API
  const fetchPlates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hydroponic-barley?farmId=default-farm');
      const data = await response.json();
      
      if (data.success) {
        setBarleyPlates(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch plates');
      }
    } catch (err) {
      setError('Network error while fetching plates');
      console.error('Error fetching plates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load plates on component mount
  useEffect(() => {
    fetchPlates();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'growing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'harvested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysFromStart = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilHarvest = (expectedDate: string) => {
    const expected = new Date(expectedDate);
    const today = new Date();
    const diffTime = expected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const toggleHarvest = async (plateId: string) => {
    try {
      const plate = barleyPlates.find(p => p._id === plateId);
      if (!plate) return;

      const newStatus = plate.status === 'harvested' ? 
        (getDaysUntilHarvest(plate.expectedHarvestDate) <= 2 ? 'ready' : 'growing') : 
        'harvested';

      const response = await fetch(`/api/hydroponic-barley/${plateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          actualHarvestDate: newStatus === 'harvested' ? new Date().toISOString() : null
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setBarleyPlates(plates => 
          plates.map(p => 
            p._id === plateId 
              ? { ...p, status: newStatus, actualHarvestDate: data.data.actualHarvestDate }
              : p
          )
        );
      } else {
        setError(data.error || 'Failed to update harvest status');
      }
    } catch (err) {
      setError('Network error while updating harvest status');
      console.error('Error toggling harvest:', err);
    }
  };

  const handleAddPlate = async () => {
    if (!newPlate.plateNumber || !newPlate.startDate || !newPlate.expectedHarvestDate || newPlate.seedWeight <= 0 || newPlate.plateUnits <= 0) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Debug log to check what we're sending
      console.log('Sending plate data:', {
        ...newPlate,
        farmId: 'default-farm'
      });

      const response = await fetch('/api/hydroponic-barley', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPlate,
          farmId: 'default-farm'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add new plate to local state
        setBarleyPlates(prev => [data.data, ...prev]);
        
        // Reset form
        setNewPlate({
          plateNumber: '',
          startDate: '',
          expectedHarvestDate: '',
          seedWeight: 0,
          plateUnits: 1,
          notes: ''
        });
        setShowAddForm(false);
      } else {
        setError(data.error || 'Failed to create plate');
      }
    } catch (err) {
      setError('Network error while creating plate');
      console.error('Error creating plate:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlate = async (plateId: string) => {
    if (!confirm('Are you sure you want to delete this plate?')) return;

    try {
      const response = await fetch(`/api/hydroponic-barley/${plateId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setBarleyPlates(plates => plates.filter(p => p._id !== plateId));
      } else {
        setError(data.error || 'Failed to delete plate');
      }
    } catch (err) {
      setError('Network error while deleting plate');
      console.error('Error deleting plate:', err);
    }
  };

  const activePlates = barleyPlates.filter(p => p.status !== 'harvested');
  const readyPlates = barleyPlates.filter(p => p.status === 'ready');
  const totalSeedWeight = activePlates.reduce((sum, plate) => sum + plate.seedWeight, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <FiPackage className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hydroponic Barley System</h1>
            <p className="text-gray-600 text-sm mt-1">Manual plate-based barley cultivation</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
        >
          <FiPlus size={16} />
          Start New Plate
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="text-red-600 hover:text-red-800 text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="animate-spin text-green-600 mr-3" size={24} />
          <span className="text-gray-600">Loading hydroponic barley plates...</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiPackage className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{activePlates.length}</p>
              <p className="text-gray-600 text-sm">Active Plates</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiCheck className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{readyPlates.length}</p>
              <p className="text-gray-600 text-sm">Ready to Harvest</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiPackage className="text-orange-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSeedWeight.toFixed(1)}</p>
              <p className="text-gray-600 text-sm">Total Seeds (kg)</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-purple-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{barleyPlates.filter(p => p.status === 'harvested').length}</p>
              <p className="text-gray-600 text-sm">Completed Cycles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Plate Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Barley Plate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
              <input
                type="text"
                value={newPlate.plateNumber}
                onChange={(e) => setNewPlate({...newPlate, plateNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="BP-004"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Units</label>
              <input
                type="number"
                min="1"
                value={newPlate.plateUnits || ''}
                onChange={(e) => setNewPlate({...newPlate, plateUnits: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={newPlate.startDate}
                onChange={(e) => setNewPlate({...newPlate, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest</label>
              <input
                type="date"
                value={newPlate.expectedHarvestDate}
                onChange={(e) => setNewPlate({...newPlate, expectedHarvestDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seed Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newPlate.seedWeight || ''}
                onChange={(e) => setNewPlate({...newPlate, seedWeight: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={newPlate.notes}
                onChange={(e) => setNewPlate({...newPlate, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddPlate}
              disabled={submitting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <FiLoader className="animate-spin" size={14} />}
              {submitting ? 'Creating...' : 'Start Plate'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              disabled={submitting}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Barley Plates Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Barley Plates</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seeds (kg)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {barleyPlates.map((plate) => {
                const daysFromStart = getDaysFromStart(plate.startDate);
                const daysUntilHarvest = getDaysUntilHarvest(plate.expectedHarvestDate);
                
                return (
                  <tr key={plate._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{plate.plateNumber}</p>
                        <p className="text-xs text-gray-500">{plate.plateUnits || 1} plate{(plate.plateUnits || 1) > 1 ? 's' : ''}</p>
                        {plate.notes && <p className="text-xs text-gray-500 mt-1">{plate.notes}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plate.status)}`}>
                        {plate.status.charAt(0).toUpperCase() + plate.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiPackage className="text-green-500" size={14} />
                        <span className="text-sm text-gray-900">{plate.seedWeight} kg</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="text-gray-900">Started: {new Date(plate.startDate).toLocaleDateString()}</p>
                        <p className="text-gray-600">
                          Expected: {new Date(plate.expectedHarvestDate).toLocaleDateString()}
                        </p>
                        {plate.actualHarvestDate && (
                          <p className="text-green-600">
                            Harvested: {new Date(plate.actualHarvestDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="text-gray-900">{daysFromStart} days growing</p>
                        {plate.status !== 'harvested' && (
                          <p className={`${daysUntilHarvest <= 0 ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                            {daysUntilHarvest <= 0 ? 'Ready to harvest!' : `${daysUntilHarvest} days to harvest`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        {/* Harvest Checkbox */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleHarvest(plate._id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              plate.status === 'harvested'
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                            }`}
                          >
                            {plate.status === 'harvested' && (
                              <FiCheck size={12} className="text-white" />
                            )}
                          </button>
                          <span className={`text-xs ${
                            plate.status === 'harvested' 
                              ? 'text-green-600 font-medium' 
                              : 'text-gray-500'
                          }`}>
                            {plate.status === 'harvested' ? 'Harvested' : 'Mark Harvested'}
                          </span>
                        </div>
                        
                        {/* Edit/Delete Actions */}
                        <div className="flex items-center gap-1 ml-2">
                          <button className="text-indigo-600 hover:text-indigo-900 p-1">
                            <FiEdit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeletePlate(plate._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
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