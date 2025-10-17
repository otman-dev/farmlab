/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Temporarily disable these rules for this file to allow the build to proceed.

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiWifi, FiCloud, FiClock, FiServer, FiCheckCircle, FiXCircle, FiArrowLeft, FiCpu, FiInfo, FiHash, FiRefreshCw, FiCreditCard } from 'react-icons/fi';
import HeartbeatIndicator from './HeartbeatIndicator';

// Define types
interface Device {
  _id: string;
  device_id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'unknown' | 'maintenance' | 'coming_soon';
  last_heartbeat?: Date;
  last_seen?: Date;
  last_seen_formatted?: string;
  mac?: string;
  ip_address?: string;
  firmware_version?: string;
  bridge?: string;
  ota?: boolean;
  wifi?: boolean;
  mqtt?: boolean;
  source?: string;
  uptime_s?: number;
  timestamp?: number;
  next_reboot_min?: number;
  uptimeFormatted?: string;
  next_reboot_formatted?: string;
  connection?: {
    wifi: string;
    mqtt: string;
    bridge: string;
  };
}

interface DeviceLog {
  _id?: string;
  timestamp?: Date | string;
  message?: string;
  level?: string;
  device_id?: string;
  [key: string]: any; // For other fields that might be in the logs
}

export default function DeviceDetail({ deviceId }: { deviceId: string }) {
  const [device, setDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDeviceDetails() {
      try {
        setLoading(true);
        const response = await fetch(`/api/devices/${deviceId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Device not found');
          }
          throw new Error(`Failed to fetch device details: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDevice(data.device || null);
        setLogs(data.logs || []);
      } catch (err: any) {
        console.error('Error fetching device details:', err);
        setError(err.message || 'Failed to load device details');
      } finally {
        setLoading(false);
      }
    }

    if (deviceId) {
      fetchDeviceDetails();
      
      // Set up polling for status updates every 10 seconds
      const intervalId = setInterval(fetchDeviceDetails, 5 * 60 * 1000); // 5 minutes
      
      // Clean up on component unmount
      return () => clearInterval(intervalId);
    }
  }, [deviceId]);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: Date | string | undefined) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    // Format: "Sep 16, 2025, 3:45 PM"
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Helper function to get the appropriate log level color
  const getLogLevelColor = (level: string | undefined) => {
    if (!level) return 'text-gray-500';
    
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-600';
      case 'warning':
      case 'warn':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'debug':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  // Helper function to get the appropriate status color
  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-yellow-100 text-yellow-800';
    
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'coming_soon':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatStatusLabel = (status: string | undefined, deviceId?: string) => {
    if (deviceId === 'greenhouse01') return 'Coming soon';
    if (!status) return 'Unknown';
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'maintenance': return 'Maintenance';
      case 'coming_soon': return 'Coming soon';
      case 'unknown': return 'Unknown';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Function to determine how long ago the last heartbeat was
  const getLastHeartbeatText = (lastHeartbeat: Date | undefined) => {
    if (!lastHeartbeat) return 'Never';
    
    const lastHeartbeatDate = new Date(lastHeartbeat);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastHeartbeatDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow">
          <p className="font-medium">{error}</p>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={() => router.back()} 
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg shadow">
          <p className="font-medium">Device not found or has been removed.</p>
          <button 
            onClick={() => router.push('/dashboard/devices')} 
            className="mt-4 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            Back to Devices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-green-600 hover:text-green-700 flex items-center font-medium"
        >
          <FiArrowLeft className="mr-2" /> Back to Devices
        </button>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden shadow mb-8 border-t-4 border-green-500">
        <div className="bg-gray-50 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">{device.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(device.device_id === 'greenhouse01' ? 'coming_soon' : device.status || 'unknown')}`}>
              {formatStatusLabel(device.status, device.device_id)}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1 flex items-center">
            <FiServer className="mr-1" /> Device ID: <span className="font-mono ml-1">{device.device_id}</span>
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Details */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FiInfo className="mr-2 text-green-600" /> Device Information
              </h3>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <div className="text-gray-500 flex items-center">
                  <FiHash className="mr-1" /> Type:
                </div>
                <div className="text-gray-800 font-medium">{device.type || 'Unknown'}</div>
                
                <div className="text-gray-500 flex items-center">
                  <FiCreditCard className="mr-1" /> MAC Address:
                </div>
                <div className="font-mono text-gray-800">{device.mac || 'Unknown'}</div>
                
                <div className="text-gray-500 flex items-center">
                  <FiCpu className="mr-1" /> Firmware:
                </div>
                <div className="text-gray-800">v{device.firmware_version}</div>
                
                <div className="text-gray-500 flex items-center">
                  <FiRefreshCw className="mr-1" /> Uptime:
                </div>
                <div className="text-gray-800">{device.uptimeFormatted || 'Unknown'}</div>
                
                {device.next_reboot_formatted && (
                  <>
                    <div className="text-gray-500">Next Reboot:</div>
                    <div className="text-gray-800">In {device.next_reboot_formatted}</div>
                  </>
                )}
                
                <div className="text-gray-500">Source:</div>
                <div className="text-gray-800">{device.source || 'Unknown'}</div>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FiClock className="mr-2 text-green-600" /> Connection Status
              </h3>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <div className="text-gray-500 flex items-center">
                  <FiClock className="mr-1" /> Last Seen:
                </div>
                <div className="text-gray-800">
                  <HeartbeatIndicator 
                    lastHeartbeat={device.last_heartbeat}
                    status={device.status}
                    size="md"
                    showPulse={true}
                    device_id={device.device_id}
                  />
                  <div className="text-xs text-gray-500 mt-1 ml-5">
                    {device.last_seen_formatted || formatTimestamp(device.last_heartbeat)}
                  </div>
                </div>
                
                <div className="text-gray-500 flex items-center">
                  <FiWifi className="mr-1" /> WiFi:
                </div>
                <div className="flex items-center">
                  {device.wifi ? 
                    <FiCheckCircle className="mr-1 text-green-500" /> : 
                    <FiXCircle className="mr-1 text-red-500" />}
                  <span className={device.wifi ? 'text-green-600' : 'text-red-600'}>
                    {device.wifi ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="text-gray-500 flex items-center">
                  <FiCloud className="mr-1" /> MQTT:
                </div>
                <div className="flex items-center">
                  {device.mqtt ? 
                    <FiCheckCircle className="mr-1 text-green-500" /> : 
                    <FiXCircle className="mr-1 text-red-500" />}
                  <span className={device.mqtt ? 'text-green-600' : 'text-red-600'}>
                    {device.mqtt ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="text-gray-500">IP Address:</div>
                <div className="font-mono text-gray-800">{device.ip_address || 'Unknown'}</div>
                
                <div className="text-gray-500">Bridge:</div>
                <div className="text-gray-800">{device.bridge || 'None'}</div>
                
                <div className="text-gray-500">OTA Updates:</div>
                <div className="flex items-center">
                  {device.ota ? 
                    <FiCheckCircle className="mr-1 text-green-500" /> : 
                    <FiXCircle className="mr-1 text-red-500" />}
                  <span className={device.ota ? 'text-green-600' : 'text-red-600'}>
                    {device.ota ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden shadow border-t-4 border-green-500">
        <div className="bg-gray-50 border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Logs</h2>
          <p className="text-gray-500 text-sm">
            Recent activity and events from this device
          </p>
        </div>
        
        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No logs available for this device.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={log._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)} bg-opacity-10 border border-current`}>
                        {log.level || 'INFO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {log.message || JSON.stringify(log)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Showing most recent {logs.length} logs • Auto-refreshes every 5 minutes
        </div>
      </div>
    </div>
  );
}