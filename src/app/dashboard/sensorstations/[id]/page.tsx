"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine } from "recharts";
import { FiThermometer, FiDroplet, FiCloud, FiCpu, FiWind, FiCalendar, FiDownload, FiFilter, FiEye, FiEyeOff, FiZoomIn, FiZoomOut, FiRefreshCw, FiBarChart } from "react-icons/fi";

type Reading = {
  _id: string;
  device_id: string;
  sensors: Record<string, number>;
  datetime_unix: number;
};

type DataRange = {
  from: string | null;
  to: string | null;
  count: number;
};

type TimeRange = {
  label: string;
  hours: number;
};

type SensorConfig = {
  visible: boolean;
  color: string;
  min?: number;
  max?: number;
};

const timeRanges: TimeRange[] = [
  { label: "Last 6 Hours", hours: 6 },
  { label: "Last 12 Hours", hours: 12 },
  { label: "Last 24 Hours", hours: 24 },
  { label: "Last 3 Days", hours: 72 },
  { label: "Last Week", hours: 168 },
  { label: "All Data", hours: -1 }
];

const sensorColors = [
  "#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#64748b"
];

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

export default function SensorStationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [readings, setReadings] = useState<Reading[]>([]);
  const [dataRange, setDataRange] = useState<DataRange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Control states
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRanges[3]); // Default to 3 days
  const [sensorConfigs, setSensorConfigs] = useState<Record<string, SensorConfig>>({});
  const [showGrid, setShowGrid] = useState(true);
  const [showBrush, setShowBrush] = useState(true);
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [chartHeight, setChartHeight] = useState(350);
  const [showStats, setShowStats] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    async function fetchReadings() {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard/sensorstations/${id}`);
        const data = await res.json();
        if (res.ok) {
          setReadings(data.readings || []);
          setDataRange(data.dataRange || null);
          
          // Initialize sensor configs
          if (data.readings && data.readings.length > 0) {
            const sensors = Object.keys(data.readings[0].sensors);
            const configs: Record<string, SensorConfig> = {};
            sensors.forEach((sensor, index) => {
              configs[sensor] = {
                visible: true,
                color: sensorColors[index % sensorColors.length]
              };
            });
            setSensorConfigs(configs);
          }
        } else {
          setError(data.error || "Failed to fetch readings");
        }
      } catch (err) {
        setError((err as Error).message || "Failed to fetch readings");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchReadings();
  }, [id]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/dashboard/sensorstations/${id}`);
        const data = await res.json();
        if (res.ok) {
          setReadings(data.readings || []);
          setDataRange(data.dataRange || null);
        }
      } catch (err) {
        console.error("Auto-refresh failed:", err);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, id]);

  // Filtered data based on time range and custom filters
  const filteredChartData = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    
    let filtered = [...readings]; // Create a copy to avoid mutations
    
    // Apply custom date range first if set (it takes priority)
    if (customDateRange.start && customDateRange.end) {
      const startTime = new Date(customDateRange.start).getTime() / 1000;
      const endTime = new Date(customDateRange.end).getTime() / 1000;
      
      console.log('Custom range filter:', {
        start: customDateRange.start,
        end: customDateRange.end,
        startTime,
        endTime,
        dataRange: {
          earliest: filtered.length > 0 ? new Date(filtered[0].datetime_unix * 1000).toISOString() : 'N/A',
          latest: filtered.length > 0 ? new Date(filtered[filtered.length - 1].datetime_unix * 1000).toISOString() : 'N/A'
        }
      });
      
      filtered = filtered.filter(reading => 
        reading.datetime_unix >= startTime && reading.datetime_unix <= endTime
      );
      
      console.log('Filtered results:', filtered.length, 'points');
    } 
    // Apply predefined time range filter only if custom range is not set
    else if (selectedTimeRange.hours > 0) {
      const cutoffTime = Date.now() / 1000 - (selectedTimeRange.hours * 60 * 60);
      filtered = filtered.filter(reading => reading.datetime_unix >= cutoffTime);
    }
    
    return filtered.map((reading, index) => {
      const date = new Date(reading.datetime_unix * 1000);
      return {
        id: `${reading.datetime_unix}-${index}`, // Add unique ID to prevent React key issues
        datetime_unix: reading.datetime_unix,
        time: date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        fullTime: date.toLocaleString(),
        ...reading.sensors,
      };
    });
  }, [readings, selectedTimeRange.hours, selectedTimeRange.label, customDateRange.start, customDateRange.end]);

  const sensorKeys = useMemo(() => {
    return readings.length > 0 ? Object.keys(readings[0].sensors) : [];
  }, [readings]);
  
  const visibleSensors = useMemo(() => {
    return sensorKeys.filter(key => sensorConfigs[key]?.visible);
  }, [sensorKeys, sensorConfigs]);

  // Calculate statistics for visible sensors
  const sensorStats = useMemo(() => {
    const stats: Record<string, { min: number; max: number; avg: number; current: number }> = {};
    
    visibleSensors.forEach(sensor => {
      const values = filteredChartData.map(d => d[sensor] as number).filter(v => typeof v === 'number');
      if (values.length > 0) {
        stats[sensor] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          current: values[values.length - 1] || 0
        };
      }
    });
    
    return stats;
  }, [filteredChartData, visibleSensors]);

  // Export data function
  const exportData = () => {
    const csvContent = [
      ['Timestamp', 'Date', ...visibleSensors].join(','),
      ...filteredChartData.map(row => [
        row.datetime_unix,
        row.fullTime,
        ...visibleSensors.map(sensor => row[sensor])
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-data-${id}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Toggle sensor visibility
  const toggleSensor = (sensor: string) => {
    setSensorConfigs(prev => {
      const newConfigs = {
        ...prev,
        [sensor]: {
          ...prev[sensor],
          visible: !prev[sensor]?.visible
        }
      };
      return newConfigs;
    });
  };

  // Get chart height based on number of visible sensors
  const adaptiveHeight = useMemo(() => {
    if (visibleSensors.length <= 2) return chartHeight;
    if (visibleSensors.length <= 4) return chartHeight + 50;
    return chartHeight + 100;
  }, [visibleSensors.length, chartHeight]);

  // Get available data range for UI feedback
  const availableDataRange = useMemo(() => {
    if (!readings || readings.length === 0) return null;
    
    const sorted = [...readings].sort((a, b) => a.datetime_unix - b.datetime_unix);
    const earliest = new Date(sorted[0].datetime_unix * 1000);
    const latest = new Date(sorted[sorted.length - 1].datetime_unix * 1000);
    
    return {
      earliest: earliest.toISOString().slice(0, 16), // Format for datetime-local
      latest: latest.toISOString().slice(0, 16),
      earliestFormatted: earliest.toLocaleString(),
      latestFormatted: latest.toLocaleString()
    };
  }, [readings]);

  // Clear custom date range
  const clearCustomRange = () => {
    setCustomDateRange({ start: "", end: "" });
  };

  // Set custom range to last 24 hours as example
  const setLast24Hours = () => {
    if (!availableDataRange) return;
    
    const end = new Date(availableDataRange.latest + ':00'); // Add seconds
    const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
    
    setCustomDateRange({
      start: start.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16)
    });
  };

  // Determine X-axis tick interval based on data length and screen size
  const tickInterval = useMemo(() => {
    const dataLength = filteredChartData.length;
    if (dataLength <= 24) return 0; // Show all ticks for small datasets
    if (dataLength <= 72) return Math.floor(dataLength / 12); // ~12 ticks for 3 days hourly
    return Math.floor(dataLength / 8); // ~8 ticks for larger datasets
  }, [filteredChartData.length]);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-700">Sensor Station: {id}</h1>
            {dataRange && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">{filteredChartData.length}</span> data points
                {customDateRange.start && customDateRange.end ? (
                  <span className="text-green-600 font-medium"> • Custom range: {new Date(customDateRange.start).toLocaleDateString()} - {new Date(customDateRange.end).toLocaleDateString()}</span>
                ) : (
                  <>
                    {availableDataRange && ` • Available: ${Math.ceil((new Date(availableDataRange.latest + ':00').getTime() - new Date(availableDataRange.earliest + ':00').getTime()) / (1000 * 60 * 60 * 24))} day(s)`}
                    {dataRange.to && ` • Latest: ${new Date(dataRange.to).toLocaleString()}`}
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Quick Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                autoRefresh 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiRefreshCw className={autoRefresh ? 'animate-spin' : ''} />
              Auto Refresh
            </button>
            
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showStats 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiBarChart />
              Statistics
            </button>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all"
            >
              <FiDownload />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Time Range Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FiCalendar className="inline mr-1" />
              Time Range
            </label>
            <select
              value={timeRanges.findIndex(r => r.label === selectedTimeRange.label)}
              onChange={(e) => {
                setSelectedTimeRange(timeRanges[parseInt(e.target.value)]);
                setCustomDateRange({ start: "", end: "" }); // Clear custom range
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {timeRanges.map((range, index) => (
                <option key={index} value={index}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom Range
              {availableDataRange && (
                <span className="text-xs font-normal text-gray-500 block">
                  Available: {availableDataRange.earliestFormatted} → {availableDataRange.latestFormatted}
                </span>
              )}
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  min={availableDataRange?.earliest}
                  max={availableDataRange?.latest}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Start time"
                />
                <input
                  type="datetime-local"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  min={availableDataRange?.earliest}
                  max={availableDataRange?.latest}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="End time"
                />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={setLast24Hours}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  Last 24h
                </button>
                <button
                  onClick={clearCustomRange}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
              {customDateRange.start && customDateRange.end && (
                <div className="text-xs text-green-600 font-medium">
                  Custom range active • {filteredChartData.length} data points
                </div>
              )}
            </div>
          </div>

          {/* Chart Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chart Options</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                Show Grid
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showBrush}
                  onChange={(e) => setShowBrush(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                Zoom Control
              </label>
            </div>
          </div>

          {/* Chart Height */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FiZoomIn className="inline mr-1" />
              Height: {chartHeight}px
            </label>
            <input
              type="range"
              min="250"
              max="600"
              step="50"
              value={chartHeight}
              onChange={(e) => setChartHeight(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* Sensor Controls */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <FiFilter className="inline mr-1" />
            Sensor Visibility
          </label>
          <div className="flex flex-wrap gap-2">
            {sensorKeys.map((sensor) => (
              <button
                key={sensor}
                onClick={() => toggleSensor(sensor)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                  sensorConfigs[sensor]?.visible
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: sensorConfigs[sensor]?.visible 
                    ? sensorConfigs[sensor]?.color 
                    : undefined
                }}
              >
                {sensorConfigs[sensor]?.visible ? <FiEye /> : <FiEyeOff />}
                {sensorIcons[sensor]}
                {sensorLabels[sensor] || sensor.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="text-green-600 text-center py-8">Loading sensor data...</div>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Panel */}
      {showStats && !loading && !error && Object.keys(sensorStats).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistics Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(sensorStats).map(([sensor, stats]) => (
              <div key={sensor} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {sensorIcons[sensor]}
                  <h4 className="font-medium text-gray-700">
                    {sensorLabels[sensor] || sensor.replace(/_/g, ' ')}
                  </h4>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-mono font-semibold">{stats.current.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-mono">{stats.avg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">Min:</span>
                    <span className="font-mono">{stats.min.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Max:</span>
                    <span className="font-mono">{stats.max.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {!loading && !error && (
        <div className="space-y-6">
          {filteredChartData.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-8 rounded-lg text-center">
              <h3 className="font-semibold mb-2">No Data Available</h3>
              {customDateRange.start && customDateRange.end ? (
                <div className="space-y-2">
                  <p>No sensor data found for the selected custom time range:</p>
                  <p className="font-mono text-sm bg-yellow-100 px-3 py-1 rounded">
                    {new Date(customDateRange.start).toLocaleString()} → {new Date(customDateRange.end).toLocaleString()}
                  </p>
                  {availableDataRange && (
                    <div className="mt-4 text-sm">
                      <p className="font-medium">Available data range:</p>
                      <p className="font-mono bg-green-100 px-3 py-1 rounded mt-1">
                        {availableDataRange.earliestFormatted} → {availableDataRange.latestFormatted}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={clearCustomRange}
                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Clear Custom Range
                  </button>
                </div>
              ) : (
                <p>No sensor data available for the selected time range ({selectedTimeRange.label}).</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Combined Sensor Data ({filteredChartData.length} points)
                </h2>
                <div className="text-sm text-gray-500">
                  {filteredChartData.length > 0 && (
                    <>
                      {filteredChartData[0].fullTime} → {filteredChartData[filteredChartData.length - 1].fullTime}
                    </>
                  )}
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={adaptiveHeight}>
                <LineChart 
                  data={filteredChartData} 
                  margin={{ top: 5, right: 30, left: 20, bottom: showBrush ? 80 : 60 }}
                  key={`chart-${filteredChartData.length}-${visibleSensors.join('-')}`}
                >
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
                  
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={tickInterval}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'Sensor Values', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  
                  <Tooltip
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value: number, name: string) => [
                      typeof value === 'number' ? value.toFixed(2) : value, 
                      sensorLabels[name] || name
                    ]}
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  
                  {visibleSensors.map((sensor) => (
                    <Line
                      key={`line-${sensor}`}
                      type="monotone"
                      dataKey={sensor}
                      stroke={sensorConfigs[sensor]?.color || "#16a34a"}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: sensorConfigs[sensor]?.color || "#16a34a" }}
                      connectNulls={false}
                    />
                  ))}
                  
                  {showBrush && filteredChartData.length > 20 && (
                    <Brush
                      key={`brush-${filteredChartData.length}`}
                      dataKey="time"
                      height={30}
                      stroke="#16a34a"
                      fill="#f0fdf4"
                      startIndex={0}
                      endIndex={Math.max(0, filteredChartData.length - 1)}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}