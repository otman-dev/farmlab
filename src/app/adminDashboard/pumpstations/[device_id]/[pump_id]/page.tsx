"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiSave, FiClock, FiRefreshCw } from "react-icons/fi";
import Link from "next/link";

type Pump = {
  pump_id: string;
  pin: number;
  state: boolean;
  on_time_ms: number;
  off_time_ms: number;
};

type PumpStation = {
  _id: string;
  device_id: string;
  name: string;
  pumps: Pump[];
};

export default function PumpConfigPage() {
  const params = useParams();
  const router = useRouter();
  const device_id = params.device_id as string;
  const pump_id = params.pump_id as string;

  const [station, setStation] = useState<PumpStation | null>(null);
  const [pump, setPump] = useState<Pump | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [onTime, setOnTime] = useState(1000);
  const [offTime, setOffTime] = useState(10000);

  useEffect(() => {
    fetchStation();
  }, [device_id, pump_id]);

  async function fetchStation() {
    try {
      setLoading(true);
      const res = await fetch("/api/pumpstations");
      const data = await res.json();
      
      if (res.ok) {
        const foundStation = data.pumpStations.find((s: PumpStation) => s.device_id === device_id);
        if (foundStation) {
          setStation(foundStation);
          const foundPump = foundStation.pumps.find((p: Pump) => p.pump_id === pump_id);
          if (foundPump) {
            setPump(foundPump);
            setOnTime(foundPump.on_time_ms);
            setOffTime(foundPump.off_time_ms);
          } else {
            setError("Pump not found");
          }
        } else {
          setError("Pump station not found");
        }
      } else {
        setError(data.error || "Failed to fetch pump station");
      }
    } catch (err) {
      console.error('Error fetching station:', err);
      setError((err as Error).message || "Failed to fetch pump station");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/pumpstations/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id,
          pump_id,
          on_time_ms: onTime,
          off_time_ms: offTime,
        }),
      });

      if (res.ok) {
        alert("Configuration saved successfully!");
        router.push("/adminDashboard/pumpstations");
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error saving config:', err);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          <div className="font-semibold mb-2">Error:</div>
          <div>{error}</div>
          <div className="mt-4">
            <Link
              href="/adminDashboard/pumpstations"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 inline-block"
            >
              Back to Pump Stations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/adminDashboard/pumpstations"
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 w-fit"
        >
          <FiArrowLeft />
          Back to Pump Stations
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Configure Pump Timing</h1>
        <p className="text-gray-600 mt-1">
          {station?.name} - {pump_id}
        </p>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
        <div className="space-y-6">
          {/* Current Settings Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <FiClock />
              Current Settings
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">ON Time:</span>
                <span className="font-mono font-semibold ml-2">{pump?.on_time_ms}ms</span>
              </div>
              <div>
                <span className="text-blue-700">OFF Time:</span>
                <span className="font-mono font-semibold ml-2">{pump?.off_time_ms}ms</span>
              </div>
            </div>
          </div>

          {/* ON Time Configuration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pump ON Time (milliseconds)
            </label>
            <input
              type="number"
              value={onTime}
              onChange={(e) => setOnTime(Number(e.target.value))}
              min="100"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Duration the pump stays ON (minimum: 100ms)
            </p>
            <div className="mt-2 text-sm text-gray-600">
              = {(onTime / 1000).toFixed(1)} seconds
            </div>
          </div>

          {/* OFF Time Configuration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pump OFF Time (milliseconds)
            </label>
            <input
              type="number"
              value={offTime}
              onChange={(e) => setOffTime(Number(e.target.value))}
              min="100"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Duration the pump stays OFF (minimum: 100ms)
            </p>
            <div className="mt-2 text-sm text-gray-600">
              = {(offTime / 1000).toFixed(1)} seconds
            </div>
          </div>

          {/* Cycle Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">Cycle Information</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Total Cycle Time: <span className="font-mono font-semibold">{((onTime + offTime) / 1000).toFixed(1)}s</span></div>
              <div>Cycles per Minute: <span className="font-mono font-semibold">{(60000 / (onTime + offTime)).toFixed(2)}</span></div>
              <div>ON Duty Cycle: <span className="font-mono font-semibold">{((onTime / (onTime + offTime)) * 100).toFixed(1)}%</span></div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setOnTime(1000);
                  setOffTime(10000);
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
              >
                1s ON / 10s OFF
              </button>
              <button
                onClick={() => {
                  setOnTime(5000);
                  setOffTime(30000);
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
              >
                5s ON / 30s OFF
              </button>
              <button
                onClick={() => {
                  setOnTime(10000);
                  setOffTime(60000);
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
              >
                10s ON / 1m OFF
              </button>
              <button
                onClick={() => {
                  setOnTime(30000);
                  setOffTime(300000);
                }}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
              >
                30s ON / 5m OFF
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  Save Configuration
                </>
              )}
            </button>
            <Link
              href="/adminDashboard/pumpstations"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>

      {/* Warning Note */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Changes will be sent to the pump station via MQTT</li>
          <li>Automation must be enabled for timing cycles to take effect</li>
          <li>Manual pump control overrides automation when automation is disabled</li>
          <li>Very short cycles may cause excessive wear on pump hardware</li>
        </ul>
      </div>
    </div>
  );
}
