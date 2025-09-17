"use client";

import { FiDatabase, FiCloud, FiServer, FiLink, FiWifi, FiAlertCircle, FiCheckCircle, FiClock } from "react-icons/fi";

const services = [
  {
    name: "MQTT to MongoDB",
    type: "Bridge Service",
    icon: <FiLink className="text-blue-500" />,
    status: "Online",
    lastChecked: "Just now",
  },
  {
    name: "MQTT Remote",
    type: "Remote Service",
    icon: <FiWifi className="text-green-500" />,
    status: "Online",
    lastChecked: "Just now",
  },
  {
    name: "MQTT Bridge",
    type: "Bridge Service",
    icon: <FiCloud className="text-cyan-500" />,
    status: "Offline",
    lastChecked: "2 min ago",
  },
  {
    name: "Database",
    type: "MongoDB",
    icon: <FiDatabase className="text-purple-500" />,
    status: "Online",
    lastChecked: "Just now",
  },
];

const statusColors: Record<string, string> = {
  Online: "text-green-600",
  Offline: "text-red-600",
  Unknown: "text-gray-400",
};

export default function ServicesStatusPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
        <FiServer className="text-green-500" /> Services Status
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-green-100 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              {service.icon}
              <span className="font-bold text-lg text-green-700">{service.name}</span>
            </div>
            <div className="text-xs text-gray-500 mb-2">{service.type}</div>
            <div className="flex items-center gap-2 mb-2">
              {service.status === "Online" ? (
                <FiCheckCircle className="text-green-500" />
              ) : service.status === "Offline" ? (
                <FiAlertCircle className="text-red-500" />
              ) : (
                <FiClock className="text-gray-400" />
              )}
              <span className={`font-semibold ${statusColors[service.status]}`}>{service.status}</span>
            </div>
            <div className="text-xs text-gray-400">Last checked: {service.lastChecked}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
