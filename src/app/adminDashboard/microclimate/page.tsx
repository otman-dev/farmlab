"use client";
import React, { useState, useEffect } from "react";
import { FiThermometer, FiCloud, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiXCircle, FiRefreshCw } from "react-icons/fi";
import { computeMicroclimateMetrics, MicroclimateMetrics } from "@/lib/microclimateMetrics";

interface SensorStation {
  _id: string;
  device_id: string;
  sensors: {
    air_temp_c?: number;
    air_humidity_percent?: number;
  };
  timestamp: number;
}

export default function MicroclimateMetricsPage() {
  const [sensorStations, setSensorStations] = useState<SensorStation[]>([]);
  const [metrics, setMetrics] = useState<MicroclimateMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/sensorstations");
      const data = await res.json();

      if (res.ok && data.sensorStations && data.sensorStations.length >= 2) {
        // Find inside and outside stations
        const insideStation = data.sensorStations.find((s: any) =>
          s.device_id?.toLowerCase().includes('sensorstation01')
        );
        const outsideStation = data.sensorStations.find((s: any) =>
          s.device_id?.toLowerCase().includes('sensorstation02')
        );

        if (insideStation && outsideStation) {
          const normalizedStations = [insideStation, outsideStation].map((s: any) => ({
            _id: s._id || s.latest?._id,
            device_id: s.device_id || s.latest?.device_id,
            sensors: s.sensors || s.latest?.payload?.sensors || {},
            timestamp: s.timestamp || s.latest?.payload?.datetime_unix || 0
          }));

          setSensorStations(normalizedStations);

          // Compute metrics
          const insideTemp = normalizedStations[0].sensors.air_temp_c;
          const insideHumidity = normalizedStations[0].sensors.air_humidity_percent;
          const outsideTemp = normalizedStations[1].sensors.air_temp_c;
          const outsideHumidity = normalizedStations[1].sensors.air_humidity_percent;

          if (insideTemp !== undefined && insideHumidity !== undefined &&
              outsideTemp !== undefined && outsideHumidity !== undefined) {
            const computedMetrics = computeMicroclimateMetrics({
              Ti: insideTemp,
              Hi: insideHumidity,
              To: outsideTemp,
              Ho: outsideHumidity
            });
            setMetrics(computedMetrics);
          } else {
            setError("Incomplete sensor data - missing temperature or humidity readings");
          }
        } else {
          setError("Could not identify inside (sensorstation01) and outside (sensorstation02) stations");
        }
      } else {
        setError("No sensor stations found or insufficient data");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to fetch sensor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'too low': return 'text-blue-600 bg-blue-100';
      case 'too high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'optimal':
        return <FiCheckCircle className="text-green-600" />;
      case 'moderate':
        return <FiAlertTriangle className="text-yellow-600" />;
      case 'poor':
      case 'too low':
      case 'too high':
        return <FiXCircle className="text-red-600" />;
      default:
        return <FiTrendingUp className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
        <p className="font-semibold">Error loading microclimate data:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FiThermometer className="text-blue-600" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Microclimate Metrics</h1>
            <p className="text-gray-600 mt-1">Advanced agricultural and engineering climate analysis</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FiThermometer className="text-blue-600" size={16} />
            <span className="font-semibold text-blue-800">Microclimate Analysis</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Real-time computation of thermal, hygrometric, and agronomic metrics from inside/outside sensor data.
          </p>
        </div>
      </div>

      {/* Current Sensor Readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {sensorStations.map((station, index) => (
          <div key={station._id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${index === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
                <FiThermometer className={index === 0 ? 'text-green-600' : 'text-blue-600'} size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {index === 0 ? 'Inside Environment' : 'Outside Environment'}
                </h3>
                <p className="text-gray-600 text-sm">{station.device_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {station.sensors.air_temp_c?.toFixed(1) || 'N/A'}°C
                </div>
                <div className="text-gray-600 text-sm">Temperature</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {station.sensors.air_humidity_percent?.toFixed(1) || 'N/A'}%
                </div>
                <div className="text-gray-600 text-sm">Humidity</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-3">
              Last updated: {station.timestamp ? new Date(station.timestamp * 1000).toLocaleString() : 'Unknown'}
            </div>
          </div>
        ))}
      </div>

      {metrics && (
        <>
          {/* Thermal Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiThermometer className="text-red-600" />
              Thermal Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.deltaT}°C</div>
                <div className="text-gray-600 text-sm">Temperature Difference (ΔT)</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.heatingDegreeHours}°C·h</div>
                <div className="text-gray-600 text-sm">Heating Degree Hours</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.coolingDegreeHours}°C·h</div>
                <div className="text-gray-600 text-sm">Cooling Degree Hours</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.insulationPerformance)}`}>
                  {getStatusIcon(metrics.insulationPerformance)}
                  {metrics.insulationPerformance.charAt(0).toUpperCase() + metrics.insulationPerformance.slice(1)}
                </div>
                <div className="text-gray-600 text-sm mt-2">Insulation Performance</div>
              </div>
            </div>
          </div>

          {/* Hygrometric Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCloud className="text-blue-600" />
              Hygrometric Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.dewPointInside}°C</div>
                <div className="text-gray-600 text-sm">Inside Dew Point</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.dewPointOutside}°C</div>
                <div className="text-gray-600 text-sm">Outside Dew Point</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.vaporPressureDeficit} kPa</div>
                <div className="text-gray-600 text-sm">Vapor Pressure Deficit</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.humidityGradient}%</div>
                <div className="text-gray-600 text-sm">Humidity Gradient</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${metrics.condensationRisk ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                  {metrics.condensationRisk ? <FiXCircle /> : <FiCheckCircle />}
                  {metrics.condensationRisk ? 'High Risk' : 'Low Risk'}
                </div>
                <div className="text-gray-600 text-sm mt-2">Condensation Risk</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.ventilationEfficiency)}`}>
                  {getStatusIcon(metrics.ventilationEfficiency)}
                  {metrics.ventilationEfficiency.charAt(0).toUpperCase() + metrics.ventilationEfficiency.slice(1)}
                </div>
                <div className="text-gray-600 text-sm mt-2">Ventilation Efficiency</div>
              </div>
            </div>
          </div>

          {/* Agronomic Indices */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-green-600" />
              Agronomic & Comfort Indices
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.temperatureHumidityIndex}</div>
                <div className="text-gray-600 text-sm">Temperature-Humidity Index (THI)</div>
                <div className="text-xs text-gray-500 mt-1">Livestock comfort indicator</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.cropVPDStatus)}`}>
                  {getStatusIcon(metrics.cropVPDStatus)}
                  {metrics.cropVPDStatus === 'too low' ? 'Too Low' :
                   metrics.cropVPDStatus === 'too high' ? 'Too High' :
                   'Optimal'}
                </div>
                <div className="text-gray-600 text-sm mt-2">Crop VPD Status</div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics.cropVPDStatus === 'too low' ? 'Risk of disease' :
                   metrics.cropVPDStatus === 'too high' ? 'Water stress risk' :
                   'Optimal growing conditions'}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.absoluteHumidityInside} g/m³</div>
                <div className="text-gray-600 text-sm">Inside Absolute Humidity</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{metrics.absoluteHumidityOutside} g/m³</div>
                <div className="text-gray-600 text-sm">Outside Absolute Humidity</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={fetchSensorData}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FiRefreshCw className="animate-spin" />
              Refresh Data
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-6 text-center">
            Last updated: {lastUpdated.toLocaleString()} | Data computed in real-time from sensor readings
          </div>
        </>
      )}
    </div>
  );
}