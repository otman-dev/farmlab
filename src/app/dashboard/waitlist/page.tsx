"use client";

import { useState, useEffect } from "react";
import { FiUserCheck, FiMail, FiCalendar, FiCheck, FiX, FiLoader, FiSearch } from "react-icons/fi";

interface WaitlistEntry {
  _id: string;
  email: string;
  fullName: string;
  message?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  processedAt?: string;
  processedBy?: string;
}

export default function WaitlistPage() {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  // Mock data for now - replace with actual API call
  const mockWaitlistData: WaitlistEntry[] = [
    {
      _id: '1',
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      message: 'Interested in becoming a sponsor for the farm',
      submittedAt: '2025-10-05T10:30:00Z',
      status: 'pending'
    },
    {
      _id: '2',
      email: 'sarah.wilson@example.com',
      fullName: 'Sarah Wilson',
      message: 'Would like to volunteer and help with animal care',
      submittedAt: '2025-10-04T14:15:00Z',
      status: 'pending'
    },
    {
      _id: '3',
      email: 'mike.johnson@example.com',
      fullName: 'Mike Johnson',
      message: 'Interested in learning about hydroponic farming',
      submittedAt: '2025-10-03T09:45:00Z',
      status: 'approved',
      processedAt: '2025-10-04T16:20:00Z',
      processedBy: 'admin@farmlab.com'
    },
    {
      _id: '4',
      email: 'spam.user@fake.com',
      fullName: 'Spam User',
      message: 'This looks like spam content...',
      submittedAt: '2025-10-02T12:00:00Z',
      status: 'rejected',
      processedAt: '2025-10-03T10:30:00Z',
      processedBy: 'admin@farmlab.com'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchWaitlist = async () => {
      try {
        setLoading(true);
        // Replace with actual API call: await fetch('/api/waitlist')
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        setWaitlistEntries(mockWaitlistData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch waitlist entries');
        console.error('Error fetching waitlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitlist();
  }, []);

  const handleApprove = async (entryId: string) => {
    setProcessing(prev => ({ ...prev, [entryId]: true }));
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWaitlistEntries(prev => prev.map(entry => 
        entry._id === entryId 
          ? { 
              ...entry, 
              status: 'approved' as const, 
              processedAt: new Date().toISOString(),
              processedBy: 'current-admin@farmlab.com'
            }
          : entry
      ));
    } catch (err) {
      setError('Failed to approve entry');
    } finally {
      setProcessing(prev => ({ ...prev, [entryId]: false }));
    }
  };

  const handleReject = async (entryId: string) => {
    setProcessing(prev => ({ ...prev, [entryId]: true }));
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWaitlistEntries(prev => prev.map(entry => 
        entry._id === entryId 
          ? { 
              ...entry, 
              status: 'rejected' as const, 
              processedAt: new Date().toISOString(),
              processedBy: 'current-admin@farmlab.com'
            }
          : entry
      ));
    } catch (err) {
      setError('Failed to reject entry');
    } finally {
      setProcessing(prev => ({ ...prev, [entryId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesFilter = filter === 'all' || entry.status === filter;
    const matchesSearch = entry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = waitlistEntries.filter(e => e.status === 'pending').length;
  const approvedCount = waitlistEntries.filter(e => e.status === 'approved').length;
  const rejectedCount = waitlistEntries.filter(e => e.status === 'rejected').length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FiUserCheck className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waiting List Management</h1>
            <p className="text-gray-600 text-sm mt-1">Review and manage pending registration requests</p>
          </div>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiUserCheck className="text-yellow-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-gray-600 text-sm">Pending Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiCheck className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              <p className="text-gray-600 text-sm">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiX className="text-red-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              <p className="text-gray-600 text-sm">Rejected</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiUserCheck className="text-blue-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{waitlistEntries.length}</p>
              <p className="text-gray-600 text-sm">Total Entries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name or email..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="animate-spin text-blue-600 mr-3" size={24} />
          <span className="text-gray-600">Loading waitlist entries...</span>
        </div>
      )}

      {/* Waitlist Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Waitlist Entries ({filteredEntries.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{entry.fullName}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <FiMail size={14} />
                          <span>{entry.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">
                        {entry.message || 'No message provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                      {entry.processedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          by {entry.processedBy}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FiCalendar size={14} />
                        <span>{new Date(entry.submittedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.submittedAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {entry.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(entry._id)}
                            disabled={processing[entry._id]}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-1"
                          >
                            {processing[entry._id] ? (
                              <FiLoader className="animate-spin" size={12} />
                            ) : (
                              <FiCheck size={12} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(entry._id)}
                            disabled={processing[entry._id]}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-1"
                          >
                            {processing[entry._id] ? (
                              <FiLoader className="animate-spin" size={12} />
                            ) : (
                              <FiX size={12} />
                            )}
                            Reject
                          </button>
                        </div>
                      )}
                      {entry.status !== 'pending' && (
                        <span className="text-gray-500 text-xs">
                          {entry.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                          {entry.processedAt && new Date(entry.processedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <FiUserCheck className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900">No entries found</h3>
                <p className="text-gray-500">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No waitlist entries yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}