"use client";

import { useEffect, useState } from "react";
import { FiUser, FiMail, FiSettings, FiShield } from "react-icons/fi";

export default function SettingsPage() {
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          setError(data.error || "Failed to fetch user info");
        }
      } catch (err) {
        setError((err as Error).message || "Failed to fetch user info");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
        <FiSettings className="text-green-500" /> Settings
      </h1>
      {loading && <div className="text-green-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {user && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
            <FiUser className="text-green-400" /> User Info
          </h2>
          <div className="flex flex-col gap-2 text-gray-700">
            <div className="flex items-center gap-2">
              <FiUser className="text-gray-400" />
              <span className="font-medium">Name:</span>
              <span className="font-mono">{user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMail className="text-gray-400" />
              <span className="font-medium">Email:</span>
              <span className="font-mono">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiShield className="text-gray-400" />
              <span className="font-medium">Role:</span>
              <span className="font-mono capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
          <FiSettings className="text-green-400" /> App Settings
        </h2>
        <div className="text-gray-500 text-sm">More settings coming soon...</div>
      </div>
    </div>
  );
}
