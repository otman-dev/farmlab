"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FiThermometer, FiDroplet, FiCloud, FiCpu, FiWind } from "react-icons/fi";

type Reading = {
  _id: string;
  device_id: string;
  sensors: Record<string, number>;
  datetime_unix: number;
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

export default function SensorStationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReadings() {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard/sensorstations/${id}`);
        const data = await res.json();
        if (res.ok) {
          setReadings(data.readings || []);
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

  // Prepare data for charts: group by sensor
  const chartData = readings.map(reading => ({
    datetime_unix: reading.datetime_unix,
    time: new Date(reading.datetime_unix * 1000).toLocaleString(),
    ...reading.sensors,
  }));

  const sensorKeys = readings.length > 0 ? Object.keys(readings[0].sensors) : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700">Sensor Station: {id}</h1>
      {loading && <div className="text-green-600">Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="space-y-8">
          {sensorKeys.map(sensorKey => (
            <div key={sensorKey} className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center gap-2 mb-4">
                {sensorIcons[sensorKey] || <FiCpu className="text-gray-400" />}
                <h2 className="text-lg font-semibold text-gray-700">{sensorLabels[sensorKey] || sensorKey.replace(/_/g, ' ')}</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(value: number) => [value, sensorLabels[sensorKey] || sensorKey]}
                  />
                  <Line
                    type="monotone"
                    dataKey={sensorKey}
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}