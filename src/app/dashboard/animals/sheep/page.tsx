"use client";
import { useEffect, useState } from "react";

interface Sheep {
  _id: string;
  name: string;
  tag: string;
  age: number;
  health: string;
  notes?: string;
  createdAt: string;
}

export default function SheepManagementPage() {
  const [sheep, setSheep] = useState<Sheep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSheep = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/animals/sheep");
        const data = await res.json();
        if (res.ok) setSheep(data.sheep);
        else setError(data.error || "Failed to fetch sheep");
      } catch (err) {
        setError((err as Error).message || "Failed to fetch sheep");
      } finally {
        setLoading(false);
      }
    };
    fetchSheep();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Sheep Management</h1>
      {loading && <div className="text-green-600">Loading sheep...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sheep.map((s) => (
          <div key={s._id} className="bg-white rounded-xl shadow p-4 border border-green-100 flex flex-col gap-2">
            <div className="font-bold text-green-700">{s.name} <span className="text-xs text-gray-400">({s.tag})</span></div>
            <div className="text-xs text-gray-500">Age: {s.age}</div>
            <div className="text-xs text-gray-500">Health: {s.health}</div>
            {s.notes && <div className="text-xs text-gray-400">Notes: {s.notes}</div>}
            <div className="text-xs text-gray-400">Added: {new Date(s.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
