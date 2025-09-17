"use client";


"use client";
import { useEffect, useState } from "react";
import { FiLock, FiUnlock, FiAlertTriangle, FiUser, FiKey, FiActivity, FiVideo } from "react-icons/fi";

interface SecurityLog {
  device_id: string;
  event: string;
  source: string;
  bridge: string;
  user_id?: string;
  rfid_uid?: string;
  action: string;
  status: string;
  timestamp: string;
}

const statusColors: Record<string, string> = {
  granted: "text-green-600",
  success: "text-green-600",
  denied: "text-red-600",
  failed: "text-red-600",
  default: "text-gray-600",
};

export default function SecuritySystemPage() {
  const [log, setLog] = useState<SecurityLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLog() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/securitysystem");
        const data = await res.json();
        if (res.ok) {
          setLog(data.log);
        } else {
          setError(data.error || "Failed to fetch security log");
        }
      } catch (err) {
        setError((err as Error).message || "Failed to fetch security log");
      } finally {
        setLoading(false);
      }
    }
    fetchLog();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
        <FiLock className="text-green-500" /> Security System <span className="text-base text-gray-400">(Latest Access)</span>
      </h1>
      {loading && <div className="text-green-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {log && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-lg text-green-700 flex items-center gap-2">
              <FiKey className="text-green-400" />
              {log.device_id}
            </div>
            <span className="text-xs text-gray-400 font-mono">{log.event}</span>
          </div>
          <div className="mb-3 text-xs text-gray-500 flex gap-4">
            <span>Source: <span className="font-semibold text-gray-700">{log.source}</span></span>
            <span>Bridge: <span className="font-semibold text-gray-700">{log.bridge}</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2">
              <FiUser className="text-blue-500" />
              <span className="font-medium text-gray-700">{log.user_id || log.rfid_uid || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              {log.action === "unlock" ? <FiUnlock className="text-green-500" /> : <FiLock className="text-gray-400" />}
              <span className="font-medium text-gray-700">{log.action}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiActivity className="text-gray-500" />
              <span className={`font-medium ${statusColors[log.status] || statusColors.default}`}>{log.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiVideo className="text-gray-400" />
              <span className="font-medium text-gray-700">{log.timestamp}</span>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-400" />
              <span className="font-semibold text-gray-700">Alarm:</span>
              <span className="text-green-600 font-bold">Off</span>
            </div>
            <div className="flex items-center gap-2">
              <FiActivity className="text-gray-400" />
              <span className="font-semibold text-gray-700">Motion Sensor:</span>
              <span className="text-green-600 font-bold">Off</span>
            </div>
            <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow transition">
              <FiUnlock /> Open Lock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
