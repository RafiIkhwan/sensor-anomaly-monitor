import { NextApiRequest, NextApiResponse } from 'next';
import { AnomalyStorage } from '@lib/anomaly-storage';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { device, type, limit } = req.query;
      let anomalies = AnomalyStorage.getAnomalies();

      if (device && typeof device === 'string') {
        anomalies = AnomalyStorage.getAnomaliesByDevice(device);
      }

      if (type && typeof type === 'string') {
        anomalies = AnomalyStorage.getAnomaliesByType(type);
      }

      if (limit && typeof limit === 'string') {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum)) {
          anomalies = anomalies.slice(0, limitNum);
        }
      }

      res.status(200).json({ 
        anomalies,
        total: anomalies.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to get anomalies:', error);
      res.status(500).json({ error: 'Failed to retrieve anomalies' });
    }
  } else if (req.method === 'DELETE') {
    try {
      AnomalyStorage.clearAnomalies();
      res.status(200).json({ message: 'Anomalies cleared successfully' });
    } catch (error) {
      console.error('Failed to clear anomalies:', error);
      res.status(500).json({ error: 'Failed to clear anomalies' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}