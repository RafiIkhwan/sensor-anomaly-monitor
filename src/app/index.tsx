'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface DeviceState {
  deviceId: string;
  lastUptime: number;
  lastLevel: number;
  lastUpdateTime: number;
}

export default function Home() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [devices, setDevices] = useState<DeviceState[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/monitoring/status');
      const data = await response.json();
      setDevices(data.devices || []);
      setIsMonitoring(data.isRunning);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const startMonitoring = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/monitoring/start', { method: 'POST' });
      if (response.ok) {
        setIsMonitoring(true);
        await fetchStatus();
      }
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/monitoring/stop', { method: 'POST' });
      if (response.ok) {
        setIsMonitoring(false);
        await fetchStatus();
        console.log('Monitoring stopped successfully');
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sensor Anomaly Monitor</title>
        <meta name="description" content="MQTT Sensor Anomaly Detection System" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sensor Anomaly Monitor
            </h1>
            <p className="text-gray-600">
              Monitoring MQTT sensors for device restarts and level changes
            </p>
            <div className="mt-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Dashboard →
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-lg font-medium">
                  Status: {isMonitoring ? 'Running' : 'Stopped'}
                </span>
              </div>
              
              <div className="space-x-2">
                {!isMonitoring ? (
                  <button
                    onClick={startMonitoring}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {loading ? 'Starting...' : 'Start Monitoring'}
                  </button>
                ) : (
                  <button
                    onClick={stopMonitoring}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {loading ? 'Stopping...' : 'Stop Monitoring'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Active Devices</h3>
                <p className="text-2xl font-bold text-blue-600">{devices.length}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Level Threshold</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {process.env.NEXT_PUBLIC_LEVEL_THRESHOLD || '10'}%
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Notifications</h3>
                <p className="text-sm text-green-600">
                  Telegram: {process.env.NEXT_PUBLIC_ENABLE_TELEGRAM === 'true' ? '✓' : '✗'}
                </p>
                <p className="text-sm text-green-600">
                  WhatsApp: {process.env.NEXT_PUBLIC_ENABLE_WHATSAPP === 'true' ? '✓' : '✗'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Device Status</h2>
            
            {devices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No devices detected yet. Start monitoring to see device data.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Uptime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Update
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {devices.map((device) => (
                      <tr key={device.deviceId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {device.deviceId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.floor(device.lastUptime / 1000)}s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {device.lastLevel.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(device.lastUpdateTime).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Device Restart Detection</h3>
              <p className="text-gray-600">
                Automatically detects when devices restart by monitoring uptime changes and sends immediate notifications.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Level Change Monitoring</h3>
              <p className="text-gray-600">
                Monitors sensor level changes and alerts when sudden variations exceed the configured threshold percentage.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Channel Notifications</h3>
              <p className="text-gray-600">
                Send alerts via Telegram Bot and WhatsApp using Twilio. Configure which channels to use through environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}