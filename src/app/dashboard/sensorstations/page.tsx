"use client";

import { useEffect, useState } from "react";
import { FiThermometer, FiDroplet, FiCloud, FiCpu, FiWind, FiZap } from "react-icons/fi";
import Link from "next/link";

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
        console.log('Fetching sensor stations data...');
        const res = await fetch("/api/dashboard/sensorstations");
        const data = await res.json();
        console.log('Received data:', data);
        
        if (res.ok) {
          if (data.sensorStations && data.sensorStations.length > 0) {
            // Normalize data from history database: server returns [{ device_id, latest }]
            const normalized = (data.sensorStations || []).map((s: any) => {
              const latest = s.latest || s;
              const payload = latest.payload || {};
              
              // Debug log
              console.log('Processing station:', {
                deviceId: s.device_id || payload.device_id || latest.device_id,
                hasPayload: !!payload,
                hasPayloadSensors: !!(payload && payload.sensors),
                sensorCount: payload?.sensors ? Object.keys(payload.sensors).length : 0
              });
              
              // Make sure we prioritize datetime_unix in the payload for timestamps
              return {
                _id: latest._id || s._id || `${payload.device_id}-${payload.datetime_unix}`,
                device_id: s.device_id || payload.device_id || latest.device_id,
                collection: s.collection || 'history',
                source: payload.source || latest.source || '',
                bridge: payload.bridge || latest.bridge || '',
                // Explicitly prioritize datetime_unix in the payload
                timestamp: payload.datetime_unix || 0,
                sensors: payload.sensors || latest.sensors || {},
              } as SensorStation;
            });
            
            console.log(`Processed ${normalized.length} sensor stations`);
            setStations(normalized);
          } else {
            console.log('No sensor stations found or empty array returned');
            setStations([]);
            setError("No sensor stations found");
          }
        } else {
          console.error('API error:', data.error);
          setError(data.error || "Failed to fetch sensor stations");
        }
      } catch (err) {
        console.error('Error in fetch operation:', err);
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
      {loading && (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-6">
          <div className="font-semibold mb-2">Error loading sensor stations:</div>
          <div>{error}</div>
          <div className="mt-4">
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stations.map((station: SensorStation) => (
          <Link key={station._id} href={`/dashboard/sensorstations/${station.device_id}`} className="bg-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition cursor-pointer">
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
            <div className="mt-4 text-xs text-gray-400 text-right">Timestamp: <span className="font-mono">{station.timestamp ? new Date(station.timestamp * 1000).toLocaleString() : 'N/A'}</span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
