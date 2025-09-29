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
  <div className="p-6 max-w-lg mx-auto text-black">
  <h1 className="text-2xl font-bold mb-4 text-black">Add Staff Member</h1>
  <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 flex flex-col gap-4 text-black">
        <label className="flex flex-col">
          <span className="mb-1 font-medium text-black">Name</span>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="border rounded px-3 py-2 text-black" />
        </label>
        <label className="flex flex-col">
          <span className="mb-1 font-medium text-black">Role</span>
          <select value={role} onChange={e => setRole(e.target.value)} className="border rounded px-3 py-2 text-black">
            <option value="helping_hand">Helping Hand</option>
            <option value="cleaner">Cleaner</option>
          </select>
        </label>
        <label className="flex flex-col">
          <span className="mb-1 font-medium text-black">Contact (optional)</span>
          <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="border rounded px-3 py-2 text-black" />
        </label>
        {error && <div className="text-red-600 font-medium">{error}</div>}
        <button type="submit" className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700" disabled={loading}>
          {loading ? 'Adding...' : 'Add Staff'}
        </button>
      </form>
    </div>
  );
}
