import { useState, useEffect } from 'react';

interface AnomalyEvent {
  id: string;
  deviceId: string;
  type: 'device_restart' | 'level_change';
  message: string;
  timestamp: number;
  previousValue?: number;
  currentValue: number;
}

export default function AnomalyHistory() {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAnomalies = async () => {
    try {
      const response = await fetch('/api/monitoring/anomalies');
      if (response.ok) {
        const data = await response.json();
        setAnomalies(data.anomalies || []);
      }
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnomalyIcon = (type: string) => {
    return type === 'device_restart' ? '🔄' : '📊';
  };

  const getAnomalyColor = (type: string) => {
    return type === 'device_restart' ? 'text-orange-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Anomaly History</h2>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Anomaly History</h2>
      
      {anomalies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No anomalies detected yet.
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getAnomalyIcon(anomaly.type)}</span>
                  <div>
                    <h3 className={`font-medium ${getAnomalyColor(anomaly.type)}`}>
                      {anomaly.type === 'device_restart' ? 'Device Restart' : 'Level Change'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{anomaly.message}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>Device: {anomaly.deviceId}</span>
                      <span className="ml-4">
                        {new Date(anomaly.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}