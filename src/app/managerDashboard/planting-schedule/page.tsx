"use client";

import { useState } from "react";
import { FiCalendar, FiClock, FiMapPin, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

interface PlantingEvent {
  id: string;
  plantName: string;
  variety: string;
  plannedDate: string;
  location: string;
  quantity: number;
  unit: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  notes?: string;
}

export default function PlantingSchedulePage() {
  const [events, setEvents] = useState<PlantingEvent[]>([
    {
      id: '1',
      plantName: 'Tomato',
      variety: 'Beefsteak',
      plannedDate: '2025-10-15',
      location: 'Greenhouse B, Section 1',
      quantity: 50,
      unit: 'seedlings',
      status: 'planned',
      notes: 'Prepare soil with compost 1 week before'
    },
    {
      id: '2',
      plantName: 'Lettuce',
      variety: 'Iceberg',
      plannedDate: '2025-10-10',
      location: 'Field 3, Rows 1-3',
      quantity: 200,
      unit: 'seeds',
      status: 'in-progress'
    },
    {
      id: '3',
      plantName: 'Carrots',
      variety: 'Purple Haze',
      plannedDate: '2025-10-08',
      location: 'Field 1, Section C',
      quantity: 500,
      unit: 'seeds',
      status: 'completed'
    },
    {
      id: '4',
      plantName: 'Spinach',
      variety: 'Baby Leaf',
      plannedDate: '2025-10-05',
      location: 'Greenhouse A, Hydroponic',
      quantity: 100,
      unit: 'plants',
      status: 'delayed',
      notes: 'Waiting for equipment repair'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planned': return <FiCalendar className="h-4 w-4" />;
      case 'in-progress': return <FiClock className="h-4 w-4" />;
      case 'completed': return <FiCalendar className="h-4 w-4" />;
      case 'delayed': return <FiClock className="h-4 w-4" />;
      default: return <FiCalendar className="h-4 w-4" />;
    }
  };

  const isUpcoming = (date: string) => {
    const today = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FiCalendar className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Planting Schedule</h1>
            <p className="text-gray-600 text-sm mt-1">Plan and track planting activities</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
          <FiPlus size={16} />
          Schedule Planting
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'planned').length}</p>
              <p className="text-gray-600 text-sm">Planned</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiClock className="text-yellow-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'in-progress').length}</p>
              <p className="text-gray-600 text-sm">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'completed').length}</p>
              <p className="text-gray-600 text-sm">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiClock className="text-orange-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{events.filter(e => isUpcoming(e.plannedDate)).length}</p>
              <p className="text-gray-600 text-sm">This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Alert */}
      {events.filter(e => isUpcoming(e.plannedDate)).length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <FiClock className="text-orange-600" size={16} />
            <span className="font-semibold text-orange-800">Upcoming Plantings This Week</span>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            You have {events.filter(e => isUpcoming(e.plannedDate)).length} planting event(s) scheduled for this week.
          </p>
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Planting Events</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className={`hover:bg-gray-50 ${isUpcoming(event.plannedDate) ? 'bg-orange-25' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.plantName}</p>
                      <p className="text-sm text-gray-500">{event.variety}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {isUpcoming(event.plannedDate) && <FiClock className="text-orange-500" size={14} />}
                      {new Date(event.plannedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-gray-400" size={14} />
                      <span className="text-sm text-gray-900">{event.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.quantity} {event.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      <span className="ml-1 capitalize">{event.status.replace('-', ' ')}</span>
                    </span>
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