"use client";

import { useEffect, useState } from 'react';
import { FiThermometer, FiCloud, FiMapPin, FiActivity } from 'react-icons/fi';

interface SensorData {
  air_temp_c?: number;
  air_humidity_percent?: number;
  timestamp?: number;
}

interface MapProps {
  latitude: number;
  longitude: number;
  locationName: string;
}

export default function FarmMap({ latitude, longitude, locationName }: MapProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchLatestSensorData() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard/sensorstations');
        const data = await res.json();
        
        if (res.ok && data.sensorStations?.length > 0) {
          // Get the latest sensor data with air temp and humidity
          // Normalize preview schema: server may return { device_id, latest } where latest.payload contains sensors
          type RawStation = any;
          const normalized = (data.sensorStations as RawStation[]).map((s) => {
            const latest = s.latest || s; // support both shapes
            const payload = latest.payload || {};
            return {
              device_id: s.device_id || payload.device_id || s.device_id,
              sensors: payload.sensors || latest.sensors || {},
              timestamp: payload.datetime_unix || (latest.datetime_unix ?? latest.timestamp) || 0,
            };
          });

          const latestStation = normalized
            .filter((station) => station.sensors && (station.sensors.air_temp_c !== undefined || station.sensors.air_humidity_percent !== undefined))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];

          if (latestStation) {
            setSensorData({
              air_temp_c: latestStation.sensors.air_temp_c,
              air_humidity_percent: latestStation.sensors.air_humidity_percent,
              timestamp: latestStation.timestamp,
            });
          }
        } else {
          setError(data.error || 'No sensor data available');
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch sensor data');
      } finally {
        setLoading(false);
      }
    }

    fetchLatestSensorData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchLatestSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <FiMapPin className="text-2xl" />
          <h2 className="text-2xl font-bold">Farm Location & Climate</h2>
        </div>
        <p className="text-green-100 flex items-center gap-2">
          <span>{locationName}</span>
          <span className="text-green-200">•</span>
          <span className="font-mono text-sm">{latitude.toFixed(6)}°N, {Math.abs(longitude).toFixed(6)}°W</span>
        </p>
      </div>

      <div className="p-6">
        {/* Map Container */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-xl overflow-hidden shadow-inner">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDI3JzM0LjgiTiA1wrAzOScwOC42Ilc!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s`}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            ></iframe>
          </div>
        </div>

        {/* Sensor Data */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FiActivity className="text-green-600" />
            Latest Climate Data
          </h3>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading sensor data...</span>
            </div>
          )}

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 flex items-center gap-2">
                <FiActivity className="text-yellow-600" />
                {error}
              </p>
            </div>
          )}

          {!loading && !error && sensorData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature */}
              {sensorData.air_temp_c !== undefined && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <FiThermometer className="text-2xl text-blue-600" />
                    <span className="text-gray-700 font-medium">Air Temperature</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-700">{sensorData.air_temp_c}</span>
                    <span className="text-xl text-blue-600">°C</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {((sensorData.air_temp_c * 9/5) + 32).toFixed(1)}°F
                  </div>
                </div>
              )}

              {/* Humidity */}
              {sensorData.air_humidity_percent !== undefined && (
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-6 border border-cyan-200">
                  <div className="flex items-center gap-3 mb-2">
                    <FiCloud className="text-2xl text-cyan-600" />
                    <span className="text-gray-700 font-medium">Air Humidity</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-cyan-700">{sensorData.air_humidity_percent}</span>
                    <span className="text-xl text-cyan-600">%</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {sensorData.air_humidity_percent < 30 ? 'Low' :
                     sensorData.air_humidity_percent < 60 ? 'Moderate' : 'High'} humidity
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !error && sensorData && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>Last updated: {formatTimestamp(sensorData.timestamp)}</p>
              <p className="text-xs mt-1">Data refreshes automatically every 30 seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}