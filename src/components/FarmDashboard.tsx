"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SensorData {
  air_temp_c?: number;
  air_humidity_percent?: number;
  timestamp?: number;
  device_id?: string;
}

export default function FarmDashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    async function fetchLatestSensorData() {
      try {
        setLoading(true);
        setConnectionStatus('connecting');
        
        const res = await fetch('/api/dashboard/sensorstations');
        const data = await res.json();
        
        if (res.ok && data.sensorStations?.length > 0) {
          // Normalize preview schema
          const normalized = (data.sensorStations as any[]).map((s) => {
            const latest = s.latest || s;
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
              device_id: latestStation.device_id,
            });
            setConnectionStatus('connected');
          }
        } else {
          setError(data.error || 'No sensor data available');
          setConnectionStatus('error');
        }
      } catch (err) {
        setError((err as Error).message || 'Failed to fetch sensor data');
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    }

    fetchLatestSensorData();
    
    // Refresh data every 10 seconds for real-time feel
    const interval = setInterval(fetchLatestSensorData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 border border-green-200 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-green-700">
              FarmLab Morocco
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Advanced IoT Agricultural Monitoring System
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Connection Status</div>
              <div className="flex items-center gap-2 mt-1">
                <motion.div 
                  className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-600' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  animate={{ 
                    scale: connectionStatus === 'connecting' ? [1, 1.2, 1] : 1,
                    opacity: connectionStatus === 'connecting' ? [1, 0.5, 1] : 1
                  }}
                  transition={{ duration: 1, repeat: connectionStatus === 'connecting' ? Infinity : 0 }}
                />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {connectionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Farm Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl border border-green-200 overflow-hidden shadow-xl"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 p-8 text-white">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚜</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Hssakra Smart Farm</h2>
                <p className="text-green-100 mt-1">Real-time Agricultural Intelligence</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
            />
          </motion.div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Map Section - Takes 2 columns */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="xl:col-span-2 space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">📍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Farm Location</h3>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-white rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1600000!2d-5.6523763!3d35.459668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b75547f1d2ce9:0xb0ac5f0998be43bd!2sHssakra!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full transition-all duration-300 hover:scale-105"
                  ></iframe>
                </div>
              </div>

              {/* Location Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇲🇦</span>
                    <div>
                      <p className="text-sm text-gray-600">Country</p>
                      <p className="font-semibold text-green-700">Morocco</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🗺️</span>
                    <div>
                      <p className="text-sm text-gray-600">Coordinates</p>
                      <p className="font-mono text-sm font-semibold text-blue-700">35.46°N, 5.65°W</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏔️</span>
                    <div>
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="font-semibold text-purple-700">Tangier-Tetouan</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Sensor Data Sidebar */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Live Data</h3>
              </div>

              {sensorData?.air_temp_c !== undefined ? (
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-2xl p-6 border border-orange-200 shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🌡️</span>
                      <h4 className="font-semibold text-gray-700">Temperature</h4>
                    </div>
                    <p className="text-4xl font-bold text-orange-600 mb-2">{sensorData.air_temp_c}°</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{((sensorData.air_temp_c * 9/5) + 32).toFixed(1)}°F</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sensorData.air_temp_c < 15 ? 'bg-blue-100 text-blue-700' :
                        sensorData.air_temp_c < 25 ? 'bg-green-100 text-green-700' :
                        sensorData.air_temp_c < 35 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {sensorData.air_temp_c < 15 ? 'Cold' :
                         sensorData.air_temp_c < 25 ? 'Optimal' :
                         sensorData.air_temp_c < 35 ? 'Warm' : 'Hot'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {sensorData?.air_humidity_percent !== undefined ? (
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-6 border border-blue-200 shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">💧</span>
                      <h4 className="font-semibold text-gray-700">Humidity</h4>
                    </div>
                    <p className="text-4xl font-bold text-blue-600 mb-2">{sensorData.air_humidity_percent}%</p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Moisture Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sensorData.air_humidity_percent < 30 ? 'bg-red-100 text-red-700' :
                        sensorData.air_humidity_percent < 70 ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {sensorData.air_humidity_percent < 30 ? 'Low' :
                         sensorData.air_humidity_percent < 70 ? 'Optimal' : 'High'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {(!sensorData?.air_temp_c && !sensorData?.air_humidity_percent) && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200"
                >
                  <div className="text-center">
                    <span className="text-4xl mb-3 block">🔍</span>
                    <h4 className="font-semibold text-gray-700 mb-2">Searching for Data</h4>
                    <p className="text-sm text-gray-600">Connecting to sensors...</p>
                  </div>
                </motion.div>
              )}

              {/* Status Card */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200"
              >
                <div className="flex items-center gap-2 text-sm">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-green-500 rounded-full"
                  />
                  <span className="text-gray-700 font-medium">Live Updates Every 10s</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Farm Statistics */}
        <div className="bg-white rounded-xl p-6 border border-green-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Farm Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Sensors</span>
              <span className="text-green-700 font-semibold">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Farm Area</span>
              <span className="text-green-700 font-semibold">5.2 Ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Crop Zones</span>
              <span className="text-green-700 font-semibold">8</span>
            </div>
          </div>
        </div>

        {/* Weather Status */}
        <div className="bg-white rounded-xl p-6 border border-green-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Conditions</h3>
          {sensorData && (
            <div className="space-y-3">
              {sensorData.air_temp_c !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temperature</span>
                  <div className="text-right">
                    <div className="text-green-700 font-semibold text-lg">{sensorData.air_temp_c}°C</div>
                    <div className="text-xs text-gray-500">
                      {sensorData.air_temp_c < 20 ? 'Cool' : 
                       sensorData.air_temp_c < 30 ? 'Optimal' : 'Warm'}
                    </div>
                  </div>
                </div>
              )}
              {sensorData.air_humidity_percent !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Humidity</span>
                  <div className="text-right">
                    <div className="text-green-700 font-semibold text-lg">{sensorData.air_humidity_percent}%</div>
                    <div className="text-xs text-gray-500">
                      {sensorData.air_humidity_percent < 40 ? 'Low' : 
                       sensorData.air_humidity_percent < 70 ? 'Good' : 'High'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 border border-green-200 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Data Collection</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">Active</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Remote Control</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">Active</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">AI Assisted</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-500 text-sm">Inactive</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading/Error States */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50"
          >
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-white">Connecting to farm sensors...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}