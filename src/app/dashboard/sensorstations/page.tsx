"use client";

import { useEffect, useState } from "react";
import { FiThermometer, FiDroplet, FiCloud, FiCpu, FiWind, FiZap } from "react-icons/fi";

type SensorStation = {
  _id: string;
  device_id: string;
  collection: string;
  source: string;
  bridge: string;
  timestamp: number;
  sensors: Record<string, number>;
};

const sensorIcons: Record<string, React.ReactNode> = {
  air_temp_c: <FiThermometer className="text-blue-500" />,
  air_humidity_percent: <FiCloud className="text-cyan-500" />,
  water_temp_c: <FiDroplet className="text-blue-400" />,
  water_tds_ppm: <FiCpu className="text-purple-500" />,
  gas_ppm: <FiWind className="text-green-500" />,
};

const sensorLabels: Record<string, string> = {
  air_temp_c: "Air Temp (°C)",
  air_humidity_percent: "Air Humidity (%)",
  water_temp_c: "Water Temp (°C)",
  water_tds_ppm: "Water TDS (ppm)",
  gas_ppm: "Gas (ppm)",
};

export default function SensorStationsPage() {
  const [stations, setStations] = useState<SensorStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStations() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard/sensorstations");
        const data = await res.json();
        if (res.ok) {
          setStations(data.sensorStations || []);
        } else {
          setError(data.error || "Failed to fetch sensor stations");
        }
      } catch (err) {
        setError((err as Error).message || "Failed to fetch sensor stations");
      } finally {
        setLoading(false);
      }
    }
    fetchStations();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Sensor Stations <span className="text-base text-gray-400">(Live Data)</span></h1>
      {loading && <div className="text-green-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stations.map((station: SensorStation) => (
          <div key={station._id} className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-lg text-green-700 flex items-center gap-2">
                <FiZap className="text-green-400" />
                {station.device_id}
              </div>
              <span className="text-xs text-gray-400 font-mono">{station.collection}</span>
            </div>
            <div className="mb-3 text-xs text-gray-500 flex gap-4">
              <span>Source: <span className="font-semibold text-gray-700">{station.source}</span></span>
              <span>Bridge: <span className="font-semibold text-gray-700">{station.bridge}</span></span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {station.sensors && Object.entries(station.sensors).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-green-50 rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    {sensorIcons[key] || <FiCpu className="text-gray-400" />}
                    <span className="font-medium text-gray-700">{sensorLabels[key] || key.replace(/_/g, ' ')}:</span>
                  </div>
                  <span className="font-mono text-green-700 text-base">{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-400 text-right">Timestamp: <span className="font-mono">{station.timestamp}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
