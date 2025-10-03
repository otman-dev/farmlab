"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddStaffPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('helping_hand');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, contact }),
      });
      if (!res.ok) throw new Error('Failed to add staff');
      router.push('/managerDashboard/staff');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-green-800 tracking-tight">Add Staff Member</h1>
            <p className="text-green-700 mt-1">Add a new team member to your farm</p>
          </div>
        </div>
        
        {/* Back Link */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Staff List
        </button>
      </div>

      {/* Form */}
      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg border border-green-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-bold text-green-800 mb-2">
              Full Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-green-200 focus:ring-4 outline-none transition-all duration-200 text-gray-900 bg-white"
              placeholder="Enter staff member's full name"
            />
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-bold text-green-800 mb-2">
              Role
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-green-200 focus:ring-4 outline-none transition-all duration-200 text-gray-900 bg-white"
            >
              <option value="helping_hand">Helping Hand</option>
              <option value="cleaner">Cleaner</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">Select the primary role for this staff member</p>
          </div>

          {/* Contact Field */}
          <div>
            <label className="block text-sm font-bold text-green-800 mb-2">
              Contact Information
              <span className="text-gray-500 ml-1 font-normal">(Optional)</span>
            </label>
            <input 
              type="text" 
              value={contact} 
              onChange={e => setContact(e.target.value)} 
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-green-200 focus:ring-4 outline-none transition-all duration-200 text-gray-900 bg-white"
              placeholder="Phone number, email, or other contact info"
            />
            <p className="text-sm text-gray-600 mt-1">Add phone number, email, or any other contact information</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-red-800 font-semibold">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding Staff Member...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Staff Member
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white border-2 border-green-500 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
