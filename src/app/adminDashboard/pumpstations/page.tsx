"use client";

import { useEffect, useState } from "react";
import { FiPower, FiZap, FiSettings, FiRefreshCw, FiWifi, FiCloud, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
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
  bridge: string;
  fw?: string;
  automation_enabled: boolean;
  pumps: Pump[];
  status: {
    wifi: boolean;
    uptime: number | null;
  };
  mqtt: boolean;
  last_seen?: Date | string;
  last_seen_formatted?: string;
  datetime_unix?: number;
};

export default function PumpStationsPage() {
  const [stations, setStations] = useState<PumpStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
  }, []);

  async function fetchStations() {
    try {
      setLoading(true);
      console.log('Fetching pump stations data...');
      const res = await fetch("/api/pumpstations");
      const data = await res.json();
      console.log('Received data:', data);
      
      if (res.ok) {
        setStations(data.pumpStations || []);
      } else {
        setError(data.error || "Failed to fetch pump stations");
      }
    } catch (err) {
      console.error('Error in fetch operation:', err);
      setError((err as Error).message || "Failed to fetch pump stations");
    } finally {
      setLoading(false);
    }
  }

  async function toggleAutomation(device_id: string, currentState: boolean) {
    try {
      setControlLoading(`automation-${device_id}`);
      const res = await fetch("/api/pumpstations/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          device_id, 
          automation_enabled: !currentState 
        }),
      });

      if (res.ok) {
        await fetchStations(); // Refresh data
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error toggling automation:', err);
      alert('Failed to toggle automation');
    } finally {
      setControlLoading(null);
    }
  }

  async function togglePump(device_id: string, pump_id: string, currentState: boolean) {
    try {
      setControlLoading(`${device_id}-${pump_id}`);
      const res = await fetch("/api/pumpstations/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          device_id, 
          pump_id,
          state: !currentState 
        }),
      });

      if (res.ok) {
        await fetchStations(); // Refresh data
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error toggling pump:', err);
      alert('Failed to toggle pump');
    } finally {
      setControlLoading(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50';
      case 'offline': return 'text-red-600 bg-red-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-700">Pump Stations</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and control pump stations</p>
        </div>
        <button
          onClick={fetchStations}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-6">
          <div className="font-semibold mb-2">Error loading pump stations:</div>
          <div>{error}</div>
          <div className="mt-4">
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" 
              onClick={fetchStations}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && stations.length === 0 && (
        <div className="bg-blue-50 text-blue-700 p-6 rounded-lg border border-blue-200 text-center">
          <p className="font-medium">No pump stations found</p>
          <p className="text-sm mt-2">Pump stations will appear here once they connect and send heartbeat messages.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station: PumpStation) => (
          <div key={station._id} className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FiZap size={24} />
                  <div>
                    <h2 className="font-bold text-lg">{station.name}</h2>
                    <p className="text-sm opacity-90">{station.device_id}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${station.mqtt ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                  {station.mqtt ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Connection Info */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <FiWifi className={station.status?.wifi ? 'text-green-500' : 'text-red-500'} />
                  <span className="text-gray-600">WiFi: {station.status?.wifi ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCloud className={station.mqtt ? 'text-green-500' : 'text-red-500'} />
                  <span className="text-gray-600">MQTT: {station.mqtt ? 'Connected' : 'Disconnected'}</span>
                </div>
                {station.fw && (
                  <div className="col-span-2 text-xs text-gray-500">
                    Firmware: {station.fw}
                  </div>
                )}
                {station.status?.uptime && (
                  <div className="col-span-2 text-xs text-gray-500">
                    Uptime: {Math.floor(station.status.uptime / 60)}m {station.status.uptime % 60}s
                  </div>
                )}
              </div>
            </div>

            {/* Automation Control */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiSettings className="text-blue-500" />
                  <span className="font-semibold text-gray-700">Automation</span>
                </div>
                <button
                  onClick={() => toggleAutomation(station.device_id, station.automation_enabled)}
                  disabled={controlLoading === `automation-${station.device_id}` || !station.mqtt}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    station.automation_enabled
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {controlLoading === `automation-${station.device_id}` ? (
                    <FiRefreshCw className="animate-spin" />
                  ) : station.automation_enabled ? (
                    'Enabled'
                  ) : (
                    'Disabled'
                  )}
                </button>
              </div>
            </div>

            {/* Pumps List */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiPower className="text-purple-500" />
                Pumps ({station.pumps.length})
              </h3>
              {station.pumps.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No pumps configured</p>
              ) : (
                <div className="space-y-3">
                  {station.pumps.map((pump) => (
                    <div key={pump.pump_id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">{pump.pump_id}</span>
                          {pump.state ? (
                            <FiCheckCircle className="text-green-500" size={16} />
                          ) : (
                            <FiXCircle className="text-gray-400" size={16} />
                          )}
                        </div>
                        <button
                          onClick={() => togglePump(station.device_id, pump.pump_id, pump.state)}
                          disabled={
                            controlLoading === `${station.device_id}-${pump.pump_id}` ||
                            !station.mqtt ||
                            station.automation_enabled
                          }
                          className={`px-3 py-1 rounded text-xs font-medium transition ${
                            pump.state
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {controlLoading === `${station.device_id}-${pump.pump_id}` ? (
                            <FiRefreshCw className="animate-spin inline" />
                          ) : pump.state ? (
                            'ON'
                          ) : (
                            'OFF'
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiClock size={12} />
                          <span>ON: {pump.on_time_ms}ms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock size={12} />
                          <span>OFF: {pump.off_time_ms}ms</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Link
                          href={`/adminDashboard/pumpstations/${station.device_id}/${pump.pump_id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <FiSettings size={12} />
                          Configure Timing
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {station.last_seen_formatted && (
              <div className="px-4 pb-4 text-xs text-gray-400 text-right">
                Last seen: {station.last_seen_formatted}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
