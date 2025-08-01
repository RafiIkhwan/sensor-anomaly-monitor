import { useState } from 'react';

interface DeviceState {
  deviceId: string;
  lastUptime: number;
  lastLevel: number;
  lastUpdateTime: number;
}

interface DeviceCardProps {
  device: DeviceState;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const timeSinceUpdate = Date.now() - device.lastUpdateTime;
  const isStale = timeSinceUpdate > 60000; // 1 minute

  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${isStale ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isStale ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <h3 className="font-semibold text-gray-900">{device.deviceId}</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>
      
      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Level:</span>
          <span className="ml-2 font-medium">{device.lastLevel.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-500">Uptime:</span>
          <span className="ml-2 font-medium">{Math.floor(device.lastUptime / 1000)}s</span>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p><strong>Last Update:</strong> {new Date(device.lastUpdateTime).toLocaleString('id-ID')}</p>
            <p><strong>Time Since Update:</strong> {Math.floor(timeSinceUpdate / 1000)}s ago</p>
            {isStale && (
              <p className="text-red-600 font-medium mt-2">⚠️ Device appears offline</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}