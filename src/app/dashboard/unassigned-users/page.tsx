"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiMail, FiCalendar, FiUserPlus, FiLoader, FiSearch, FiSettings } from "react-icons/fi";

interface UnassignedUser {
  _id: string;
  email: string;
  fullName?: string;
  registeredAt: string;
  lastLoginAt?: string;
  status: 'active' | 'inactive';
  emailVerified: boolean;
  source: 'manual' | 'waitlist' | 'direct_registration';
}

interface RoleAssignment {
  userId: string;
  newRole: 'manager' | 'sponsor' | 'visitor';
}

export default function UnassignedUsersPage() {
  const [unassignedUsers, setUnassignedUsers] = useState<UnassignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});

  // Mock data for now - replace with actual API call
  const mockUnassignedUsers: UnassignedUser[] = [
    {
      _id: '1',
      email: 'newuser1@example.com',
      fullName: 'Alice Smith',
      registeredAt: '2025-10-06T10:30:00Z',
      lastLoginAt: '2025-10-07T14:15:00Z',
      status: 'active',
      emailVerified: true,
      source: 'waitlist'
    },
    {
      _id: '2',
      email: 'johnrandom@example.com',
      fullName: 'John Random',
      registeredAt: '2025-10-05T09:45:00Z',
      status: 'active',
      emailVerified: true,
      source: 'direct_registration'
    },
    {
      _id: '3',
      email: 'unverified@example.com',
      registeredAt: '2025-10-04T16:20:00Z',
      status: 'inactive',
      emailVerified: false,
      source: 'manual'
    },
    {
      _id: '4',
      email: 'visitor.temp@example.com',
      fullName: 'Temporary Visitor',
      registeredAt: '2025-10-03T12:00:00Z',
      lastLoginAt: '2025-10-03T12:30:00Z',
      status: 'active',
      emailVerified: true,
      source: 'direct_registration'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchUnassignedUsers = async () => {
      try {
        setLoading(true);
        // Replace with actual API call: await fetch('/api/users/unassigned')
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        setUnassignedUsers(mockUnassignedUsers);
        setError(null);
      } catch (err) {
        setError('Failed to fetch unassigned users');
        console.error('Error fetching unassigned users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnassignedUsers();
  }, []);

  const handleAssignRole = async (userId: string, role: string) => {
    if (!role) {
      setError('Please select a role first');
      return;
    }

    setAssigning(prev => ({ ...prev, [userId]: true }));
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove user from unassigned list after successful assignment
      setUnassignedUsers(prev => prev.filter(user => user._id !== userId));
      setSelectedRole(prev => ({ ...prev, [userId]: '' }));
      
      // Show success message or toast
      console.log(`Successfully assigned role ${role} to user ${userId}`);
    } catch (err) {
      setError(`Failed to assign role to user`);
    } finally {
      setAssigning(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleResendVerification = async (userId: string) => {
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Verification email resent to user ${userId}`);
    } catch (err) {
      setError('Failed to resend verification email');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'waitlist': return { color: 'bg-blue-100 text-blue-800', label: 'Waitlist' };
      case 'direct_registration': return { color: 'bg-purple-100 text-purple-800', label: 'Direct' };
      case 'manual': return { color: 'bg-orange-100 text-orange-800', label: 'Manual' };
      default: return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const filteredUsers = unassignedUsers.filter(user => {
    const matchesSearch = (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeCount = unassignedUsers.filter(u => u.status === 'active').length;
  const inactiveCount = unassignedUsers.filter(u => u.status === 'inactive').length;
  const unverifiedCount = unassignedUsers.filter(u => !u.emailVerified).length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FiUsers className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unassigned Users</h1>
            <p className="text-gray-600 text-sm mt-1">Manage users who haven&apos;t been assigned roles yet</p>
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
            <FiUsers className="text-purple-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{unassignedUsers.length}</p>
              <p className="text-gray-600 text-sm">Total Unassigned</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiUserPlus className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-gray-600 text-sm">Active Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiSettings className="text-red-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{inactiveCount}</p>
              <p className="text-gray-600 text-sm">Inactive Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3">
            <FiMail className="text-orange-600" size={24} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{unverifiedCount}</p>
              <p className="text-gray-600 text-sm">Unverified Email</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search by name or email..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <FiLoader className="animate-spin text-purple-600 mr-3" size={24} />
          <span className="text-gray-600">Loading unassigned users...</span>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Unassigned Users ({filteredUsers.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const sourceBadge = getSourceBadge(user.source);
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.fullName || 'Unknown Name'}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FiMail size={14} />
                            <span>{user.email}</span>
                            {!user.emailVerified && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                Unverified
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sourceBadge.color}`}>
                            {sourceBadge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <FiCalendar size={14} />
                          <span>{new Date(user.registeredAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(user.registeredAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.lastLoginAt ? (
                          <div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <FiCalendar size={14} />
                              <span>{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(user.lastLoginAt).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Never logged in</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole[user._id] || ''}
                            onChange={(e) => setSelectedRole(prev => ({ ...prev, [user._id]: e.target.value }))}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={assigning[user._id]}
                          >
                            <option value="">Select Role</option>
                            <option value="manager">Manager</option>
                            <option value="sponsor">Sponsor</option>
                            <option value="visitor">Visitor</option>
                          </select>
                          <button
                            onClick={() => handleAssignRole(user._id, selectedRole[user._id])}
                            disabled={assigning[user._id] || !selectedRole[user._id]}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-1"
                          >
                            {assigning[user._id] ? (
                              <FiLoader className="animate-spin" size={12} />
                            ) : (
                              <FiUserPlus size={12} />
                            )}
                            Assign
                          </button>
                        </div>
                        
                        {!user.emailVerified && (
                          <button
                            onClick={() => handleResendVerification(user._id)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Resend Verification
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900">No unassigned users found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.' 
                    : 'All users have been assigned roles.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}