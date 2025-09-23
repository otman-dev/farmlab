"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Staff {
  _id: string;
  name: string;
  role: string;
  contact?: string;
}

const roleLabels: Record<string, string> = {
  helping_hand: 'Helping Hand',
  cleaner: 'Cleaner',
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard/staff')
      .then(res => res.json())
      .then(data => setStaff(data))
      .catch(() => setError('Failed to load staff'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Staff Management & Attendance</h1>
      <div className="mb-6">
        <p className="mb-2">Add, view, and manage staff. Track attendance visually on a calendar.</p>
        <div className="flex gap-4 mb-4">
          <Link href="/dashboard/staff/add" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Staff</Link>
          <Link href="/dashboard/staff/calendar" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">View Attendance Calendar</Link>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Staff List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : staff.length === 0 ? (
          <p>No staff found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Contact</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s._id} className="border-t">
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{roleLabels[s.role] || s.role}</td>
                    <td className="px-4 py-2">{s.contact || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
