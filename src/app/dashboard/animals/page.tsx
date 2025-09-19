"use client";
import Link from "next/link";

export default function AnimalsDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Animal Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/animals/sheep">
          <div className="bg-white rounded-xl shadow p-6 border border-green-100 hover:bg-green-50 cursor-pointer transition">
            <h2 className="text-xl font-semibold text-green-700 mb-2">Sheep</h2>
            <p className="text-gray-600">Manage your sheep records, add, edit, or remove sheep from your farm database.</p>
          </div>
        </Link>
        {/* Add more animal types here as subpages in the future */}
      </div>
    </div>
  );
}
