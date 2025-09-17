"use client";
import { useEffect, useState } from "react";
import { FiUsers, FiShield } from "react-icons/fi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/users");
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
        } else {
          setError(data.error || "Failed to fetch users");
        }
      } catch (err) {
        setError((err as Error).message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
        <FiUsers className="text-green-500" /> User Management
      </h1>
      {loading && <div className="text-green-600">Loading users...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded-xl shadow p-4 border border-green-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <FiShield className={user.role === 'admin' ? 'text-green-500' : 'text-gray-400'} />
              <span className="font-bold text-green-700">{user.name}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">{user.email}</div>
            <div className="text-xs font-semibold capitalize text-gray-600">Role: {user.role}</div>
            <div className="text-xs text-gray-400">Created: {new Date(user.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
