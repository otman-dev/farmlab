"use client";

import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FiThermometer, FiCloud, FiRefreshCw, FiDownload, FiClock, FiCalendar } from "react-icons/fi";

type SensorStation = {
  _id: string;
  device_id: string;
  collection: string;
  timestamp: number;
  sensors: Record<string, number>;
};

type StationHistoricalData = {
  stationId: string;
  hourlyData: {
    timestamp: number;
    datetime: string;
    hour: number;
    air_temp_c?: number;
    air_humidity_percent?: number;
    [key: string]: any;
  }[];
};

type ChartData = {
  time: string;
  hour?: number;
  [key: string]: string | number | undefined;
};

const sensorColors = [
  "#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#64748b"
];

export default function SensorStationsComparisonChart() {
  const [stations, setStations] = useState<SensorStation[]>([]);
  const [historicalData, setHistoricalData] = useState<StationHistoricalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(0); // 0 means no auto-refresh
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [chartMode, setChartMode] = useState<'temperature' | 'humidity'>('temperature');
  const [timeView, setTimeView] = useState<'current' | 'history'>('current');
  
  // Function to fetch current data
  const fetchCurrentData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/sensorstations");
      const data = await res.json();
      
      if (res.ok && data.sensorStations && data.sensorStations.length > 0) {
        // Normalize data
        const normalized = data.sensorStations.map((s: any) => {
          const latest = s.latest || s;
          const payload = latest.payload || {};
          
          return {
            _id: latest._id || s._id || `${payload.device_id}-${payload.datetime_unix}`,
            device_id: s.device_id || payload.device_id || latest.device_id,
            collection: s.collection || 'history',
            timestamp: payload.datetime_unix || 0,
            sensors: payload.sensors || latest.sensors || {},
          } as SensorStation;
        });
        
        setStations(normalized);
        setLastRefreshed(new Date());
      } else {
        setError("No sensor stations found");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to fetch sensor stations");
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch historical data
  const fetchHistoricalData = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch("/api/dashboard/sensorstations/comparison");
      const data = await res.json();
      
      if (res.ok && data.stationData) {
        setHistoricalData(data.stationData);
      } else {
        console.error("Failed to fetch historical data:", data.error);
      }
    } catch (err) {
      console.error("Error fetching historical data:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCurrentData();
    fetchHistoricalData();
  }, []);
  
  // Setup refresh interval if enabled
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchCurrentData();
        if (timeView === 'history') {
          fetchHistoricalData();
        }
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, timeView]);
  
  // Process data for chart
  const chartData = useMemo(() => {
    // If in history view, process historical data
    if (timeView === 'history') {
      if (historicalData.length === 0) return [];
      
      // Convert historical data into chart format
      // Each data point represents an hour, with values from each station
      const combinedData: ChartData[] = [];
      
      // Find the maximum number of hourly data points across all stations
      const maxDataPoints = Math.max(...historicalData.map(station => station.hourlyData.length));
      
      // Prepare hour slots
      for (let i = 0; i < maxDataPoints; i++) {
        // Use the datetime from the first station that has data for this hour
        let hourTime = '';
        let hourTimestamp = 0;
        let hourIndex = 0;
        
        for (const station of historicalData) {
          if (station.hourlyData[i]) {
            hourTime = new Date(station.hourlyData[i].timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            hourTimestamp = station.hourlyData[i].timestamp;
            hourIndex = station.hourlyData[i].hour;
            break;
          }
        }
        
        if (!hourTime) continue;
        
        const dataPoint: ChartData = {
          time: hourTime,
          hour: hourIndex,
        };
        
        // Add data from each station
        for (const station of historicalData) {
          const hourData = station.hourlyData[i];
          if (hourData) {
            const sensorKey = chartMode === 'temperature' ? 'air_temp_c' : 'air_humidity_percent';
            if (hourData[sensorKey] !== undefined) {
              dataPoint[station.stationId] = hourData[sensorKey];
            }
          }
        }
        
        combinedData.push(dataPoint);
      }
      
      return combinedData;
    }
    
    // Otherwise, show current data
    if (stations.length === 0) return [];
    
    // Create chart data point for current readings
    const currentData: ChartData = {
      time: 'Current',
    };
    
    // Add each station's data to the current data point
    stations.forEach((station) => {
      const { device_id, sensors } = station;
      
      // Skip if no sensors data
      if (!sensors) return;
      
      const sensorKey = chartMode === 'temperature' ? 'air_temp_c' : 'air_humidity_percent';
      if (sensors[sensorKey] !== undefined) {
        currentData[device_id] = sensors[sensorKey];
      }
    });
    
    return [currentData];
  }, [stations, historicalData, chartMode, timeView]);

  // Generate lines for chart
  const renderLines = useMemo(() => {
    const stationIds = timeView === 'history'
      ? historicalData.map(s => s.stationId)
      : stations.map(s => s.device_id);
    
    return stationIds.map((stationId, index) => {
      const color = sensorColors[index % sensorColors.length];
      return (
        <Line
          key={stationId}
          type="monotone"
          dataKey={stationId}
          name={`${stationId} (${chartMode === 'temperature' ? '°C' : '%'})`}
          stroke={color}
          strokeWidth={2}
          dot={timeView === 'current' ? { r: 6, fill: color } : { r: 3, fill: color }}
          activeDot={{ r: 8 }}
          connectNulls={true}
        />
      );
    });
  }, [stations, historicalData, chartMode, timeView]);
  
  // Format for Y-axis label based on mode
  const yAxisLabel = chartMode === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)';
  
  // Export data function
  const exportData = () => {
    if (timeView === 'current' && stations.length === 0) return;
    if (timeView === 'history' && historicalData.length === 0) return;
    
    let csvContent = '';
    
    if (timeView === 'current') {
      // Export current data
      const csvHeader = ['Location', chartMode === 'temperature' ? 'Air Temperature (°C)' : 'Air Humidity (%)', 'Timestamp'];
      const csvRows = stations.map(station => {
        const sensorKey = chartMode === 'temperature' ? 'air_temp_c' : 'air_humidity_percent';
        const value = station.sensors?.[sensorKey] !== undefined ? station.sensors[sensorKey] : 'N/A';
        const timestamp = station.timestamp ? new Date(station.timestamp * 1000).toLocaleString() : 'N/A';
        return [station.device_id, value, timestamp].join(',');
      });
      
      csvContent = [csvHeader.join(','), ...csvRows].join('\n');
    } else {
      // Export historical data
      // Create header with all station IDs
      const stationIds = historicalData.map(s => s.stationId);
      const csvHeader = ['Time', 'Hour', ...stationIds];
      
      // Process chart data for CSV
      const csvRows = chartData.map(data => {
        const row = [
          data.time,
          data.hour,
          ...stationIds.map(id => data[id] !== undefined ? data[id] : '')
        ];
        return row.join(',');
      });
      
      csvContent = [csvHeader.join(','), ...csvRows].join('\n');
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-stations-${chartMode}-${timeView}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Sensor Stations Comparison
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Compare {chartMode === 'temperature' ? 'air temperature' : 'humidity levels'} across all sensor stations
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
          {/* Time View Selection */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setTimeView('current')}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                timeView === 'current' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiClock className="text-red-600" /> Current
            </button>
            <button
              onClick={() => setTimeView('history')}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                timeView === 'history' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiCalendar className="text-red-600" /> 24h Trend
            </button>
          </div>

          {/* Sensor Type Selection */}
          <button
            onClick={() => setChartMode('temperature')}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartMode === 'temperature' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiThermometer /> Temperature
          </button>
          <button
            onClick={() => setChartMode('humidity')}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              chartMode === 'humidity' 
                ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiCloud /> Humidity
          </button>

          {/* Action Buttons */}
          <button
            onClick={() => {
              if (timeView === 'current') {
                fetchCurrentData();
              } else {
                fetchHistoricalData();
              }
            }}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            disabled={loading || historyLoading}
          >
            <FiRefreshCw className={(loading || historyLoading) ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            <FiDownload /> Export
          </button>
        </div>
      </div>
      
      {/* Loading States */}
      {((timeView === 'current' && loading && stations.length === 0) || 
        (timeView === 'history' && historyLoading && historicalData.length === 0)) && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && timeView === 'current' && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <p className="font-semibold">Error loading sensor data:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* No Data State */}
      {!loading && stations.length === 0 && !error && timeView === 'current' && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200">
          <p className="font-semibold">No sensor stations found</p>
          <p>No data is available for comparison at this time.</p>
        </div>
      )}
      
      {!historyLoading && historicalData.length === 0 && !error && timeView === 'history' && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200">
          <p className="font-semibold">No historical data available</p>
          <p>No trend data is available for comparison at this time.</p>
        </div>
      )}
      
      {/* Chart for Current View */}
      {timeView === 'current' && stations.length > 0 && (
        <>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis 
                  label={{ 
                    value: yAxisLabel, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)} ${chartMode === 'temperature' ? '°C' : '%'}`, '']}
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Legend verticalAlign="bottom" />
                {renderLines}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stations.map((station, index) => {
              const sensorKey = chartMode === 'temperature' ? 'air_temp_c' : 'air_humidity_percent';
              const value = station.sensors?.[sensorKey];
              const color = sensorColors[index % sensorColors.length];
              
              return (
                <div key={station.device_id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="font-medium flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                      {station.device_id}
                    </div>
                    <div className="text-lg font-semibold" style={{ color }}>
                      {value !== undefined ? `${value.toFixed(1)} ${chartMode === 'temperature' ? '°C' : '%'}` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last updated: {station.timestamp ? new Date(station.timestamp * 1000).toLocaleString() : 'Unknown'}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* Chart for Historical View */}
      {timeView === 'history' && historicalData.length > 0 && (
        <>
          <div className="mt-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: "Time (24-hour period)", 
                    position: 'insideBottom',
                    offset: -10
                  }}
                />
                <YAxis 
                  label={{ 
                    value: yAxisLabel, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(2)} ${chartMode === 'temperature' ? '°C' : '%'}`, 
                    name
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Legend verticalAlign="bottom" />
                {chartMode === 'temperature' && (
                  <ReferenceLine y={20} stroke="#777" strokeDasharray="3 3" label={{ value: '20°C', position: 'right' }} />
                )}
                {chartMode === 'humidity' && (
                  <ReferenceLine y={60} stroke="#777" strokeDasharray="3 3" label={{ value: '60%', position: 'right' }} />
                )}
                {renderLines}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Station {chartMode === 'temperature' ? 'Temperature' : 'Humidity'} Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2">Station</th>
                    <th className="text-right py-2 px-2">Min</th>
                    <th className="text-right py-2 px-2">Max</th>
                    <th className="text-right py-2 px-2">Average</th>
                    <th className="text-right py-2 px-2">Current</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalData.map((station, index) => {
                    const sensorKey = chartMode === 'temperature' ? 'air_temp_c' : 'air_humidity_percent';
                    const values = station.hourlyData
                      .map(d => d[sensorKey])
                      .filter((v): v is number => v !== undefined);
                    
                    const min = values.length ? Math.min(...values) : null;
                    const max = values.length ? Math.max(...values) : null;
                    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
                    const current = values.length ? values[values.length - 1] : null;
                    const color = sensorColors[index % sensorColors.length];
                    
                    return (
                      <tr key={station.stationId} className="border-b border-gray-100">
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                            {station.stationId}
                          </div>
                        </td>
                        <td className="text-right py-2 px-2 font-mono">
                          {min !== null ? min.toFixed(1) : 'N/A'}
                        </td>
                        <td className="text-right py-2 px-2 font-mono">
                          {max !== null ? max.toFixed(1) : 'N/A'}
                        </td>
                        <td className="text-right py-2 px-2 font-mono">
                          {avg !== null ? avg.toFixed(1) : 'N/A'}
                        </td>
                        <td className="text-right py-2 px-2 font-mono font-semibold" style={{ color }}>
                          {current !== null ? current.toFixed(1) : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      <div className="text-xs text-gray-500 mt-6 text-right">
        Last refreshed: {lastRefreshed.toLocaleString()}
      </div>
    </div>
  );
}