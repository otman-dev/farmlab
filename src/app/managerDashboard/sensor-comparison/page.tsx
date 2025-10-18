"use client";

import { useEffect, useState } from "react";
import { FiThermometer, FiDroplet, FiTrendingUp, FiActivity } from "react-icons/fi";
import { useI18n } from "../../../components/LanguageProvider";

type SensorStation = {
  _id: string;
  device_id: string;
  collection: string;
  source: string;
  bridge: string;
  timestamp: number;
  sensors: Record<string, number>;
};

export default function SensorComparisonPage() {
  const { t } = useI18n();
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
          if (data.sensorStations && data.sensorStations.length > 0) {
            const normalized = (data.sensorStations || []).map((s: any) => {
              const latest = s.latest || s;
              const payload = latest.payload || {};

              return {
                _id: latest._id || s._id || `${payload.device_id}-${payload.datetime_unix}`,
                device_id: s.device_id || payload.device_id || latest.device_id,
                collection: s.collection || 'history',
                source: payload.source || latest.source || '',
                bridge: payload.bridge || latest.bridge || '',
                timestamp: payload.datetime_unix || 0,
                sensors: payload.sensors || latest.sensors || {},
              } as SensorStation;
            });

            setStations(normalized);
          } else {
            setStations([]);
            setError("No sensor stations found");
          }
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

  // Calculate min/max values for temperature and humidity
  const tempData = stations.filter(s => s.sensors.air_temp_c !== undefined);
  const humidityData = stations.filter(s => s.sensors.air_humidity_percent !== undefined);

  const tempStats = tempData.length > 0 ? {
    min: Math.min(...tempData.map(s => s.sensors.air_temp_c)),
    max: Math.max(...tempData.map(s => s.sensors.air_temp_c)),
    avg: tempData.reduce((sum, s) => sum + s.sensors.air_temp_c, 0) / tempData.length
  } : null;

  const humidityStats = humidityData.length > 0 ? {
    min: Math.min(...humidityData.map(s => s.sensors.air_humidity_percent)),
    max: Math.max(...humidityData.map(s => s.sensors.air_humidity_percent)),
    avg: humidityData.reduce((sum, s) => sum + s.sensors.air_humidity_percent, 0) / humidityData.length
  } : null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-700 mb-2">{t('manager.sensor.title')}</h1>
        <p className="text-gray-600">{t('manager.sensor.subtitle')}</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mb-6">
          <div className="font-semibold mb-2">Error loading sensor data:</div>
          <div>{error}</div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <FiActivity className="text-green-500 text-xl" />
                <h3 className="font-semibold text-gray-700">{t('manager.sensor.activeStations')}</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">{stations.length}</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <FiThermometer className="text-blue-500 text-xl" />
                <h3 className="font-semibold text-gray-700">{t('manager.sensor.avgTemperature')}</h3>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {tempStats ? `${tempStats.avg.toFixed(1)}°C` : 'N/A'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-cyan-100">
              <div className="flex items-center gap-3 mb-2">
                <FiDroplet className="text-cyan-500 text-xl" />
                <h3 className="font-semibold text-gray-700">{t('manager.sensor.avgHumidity')}</h3>
              </div>
              <div className="text-2xl font-bold text-cyan-600">
                {humidityStats ? `${humidityStats.avg.toFixed(1)}%` : 'N/A'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <FiTrendingUp className="text-purple-500 text-xl" />
                <h3 className="font-semibold text-gray-700">{t('manager.sensor.tempRange')}</h3>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {tempStats ? `${tempStats.min.toFixed(1)} - ${tempStats.max.toFixed(1)}°C` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Temperature Comparison Chart */}
          {tempData.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiThermometer className="text-blue-500" />
                {t('manager.sensor.temperatureComparison')}
              </h2>
              <div className="space-y-4">
                {tempData.map((station) => (
                  <div key={station.device_id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">{station.device_id}</span>
                      <span className="text-xs text-gray-500">
                        {station.timestamp ? new Date(station.timestamp * 1000).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{station.sensors.air_temp_c.toFixed(1)}°C</div>
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full"
                          style={{
                            width: tempStats ? `${((station.sensors.air_temp_c - tempStats.min) / (tempStats.max - tempStats.min)) * 100}%` : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Humidity Comparison Chart */}
          {humidityData.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiDroplet className="text-cyan-500" />
                {t('manager.sensor.humidityComparison')}
              </h2>
              <div className="space-y-4">
                {humidityData.map((station) => (
                  <div key={station.device_id} className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="font-medium text-gray-700">{station.device_id}</span>
                      <span className="text-xs text-gray-500">
                        {station.timestamp ? new Date(station.timestamp * 1000).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-600">{station.sensors.air_humidity_percent.toFixed(1)}%</div>
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-cyan-500 h-3 rounded-full"
                          style={{
                            width: humidityStats ? `${((station.sensors.air_humidity_percent - humidityStats.min) / (humidityStats.max - humidityStats.min)) * 100}%` : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Table */}
          {stations.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('manager.sensor.detailedReadings')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('manager.sensor.stationId')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('manager.sensor.airTemp')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('manager.sensor.humidity')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('manager.sensor.waterTemp')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('manager.sensor.tds')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('manager.sensor.lastUpdate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stations.map((station) => (
                      <tr key={station.device_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{station.device_id}</td>
                        <td className="py-3 px-4 text-center">
                          {station.sensors.air_temp_c !== undefined ? (
                            <span className="font-mono text-blue-600">{station.sensors.air_temp_c.toFixed(1)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {station.sensors.air_humidity_percent !== undefined ? (
                            <span className="font-mono text-cyan-600">{station.sensors.air_humidity_percent.toFixed(1)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {station.sensors.water_temp_c !== undefined ? (
                            <span className="font-mono text-blue-400">{station.sensors.water_temp_c.toFixed(1)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {station.sensors.water_tds_ppm !== undefined ? (
                            <span className="font-mono text-purple-600">{station.sensors.water_tds_ppm}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-gray-500">
                          {station.timestamp ? new Date(station.timestamp * 1000).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}