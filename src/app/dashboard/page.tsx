"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import DeviceCard from '@components/DeviceCard';
import AnomalyHistory from '@components/AnomalyHistory';

interface DeviceState {
  deviceId: string;
  lastUptime: number;
  lastLevel: number;
  lastUpdateTime: number;
}

export default function Dashboard() {
  const [devices, setDevices] = useState<DeviceState[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalAnomalies: 0
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch monitoring status
      const statusResponse = await fetch('/api/monitoring/status');
      const statusData = await statusResponse.json();
      setDevices(statusData.devices || []);
      setIsMonitoring(statusData.isRunning);

      // Fetch anomaly count
      const anomalyResponse = await fetch('/api/monitoring/anomalies');
      const anomalyData = await anomalyResponse.json();

      // Calculate stats
      const now = Date.now();
      const activeDevices = statusData.devices.filter((device: DeviceState) => 
        now - device.lastUpdateTime < 60000
      ).length;

      setStats({
        totalDevices: statusData.devices.length,
        activeDevices,
        totalAnomalies: anomalyData.total || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/monitoring/test', { method: 'POST' });
      if (response.ok) {
        alert('Test notification sent successfully!');
      } else {
        alert('Failed to send test notification');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      alert('Failed to send test notification');
    }
  };

  const clearAnomalies = async () => {
    if (confirm('Are you sure you want to clear all anomaly history?')) {
      try {
        const response = await fetch('/api/monitoring/anomalies', { method: 'DELETE' });
        if (response.ok) {
          await fetchData();
          alert('Anomaly history cleared successfully!');
        } else {
          alert('Failed to clear anomaly history');
        }
      } catch (error) {
        console.error('Failed to clear anomalies:', error);
        alert('Failed to clear anomaly history');
      }
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Sensor Anomaly Monitor</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Comprehensive view of your sensor monitoring system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDevices}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Devices</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeDevices}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">⚠</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAnomalies}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className={`w-8 h-8 ${isMonitoring ? 'bg-green-500' : 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold">{isMonitoring ? '▶' : '⏸'}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isMonitoring ? 'Running' : 'Stopped'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={sendTestNotification}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Send Test Notification
              </button>
              <button
                onClick={clearAnomalies}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Clear Anomaly History
              </button>
            </div>
          </div>

          {/* Device Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Device Status</h2>
            {devices.length === 0 ? (
              <div className="bg-white shadow-lg rounded-lg p-8 text-center text-gray-500">
                No devices detected yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                  <DeviceCard key={device.deviceId} device={device} />
                ))}
              </div>
            )}
          </div>

          {/* Anomaly History */}
          <AnomalyHistory />
        </div>
      </div>
    </>
  );
}