import { NextApiRequest, NextApiResponse } from 'next';
import { MonitoringService } from '@lib/monitor-service-singleton';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      if (MonitoringService.hasInstance()) {
        const monitoringService = MonitoringService.getInstance();
        const devices = monitoringService.getDeviceStates();
        const status = monitoringService.getStatus();
        
        res.status(200).json({ 
          devices,
          isRunning: status.isRunning,
          isInitialized: status.isInitialized,
          deviceCount: status.deviceCount,
          timestamp: Date.now()
        });
      } else {
        res.status(200).json({ 
          devices: [],
          isRunning: false,
          isInitialized: false,
          deviceCount: 0,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to get monitoring status:', error);
      res.status(500).json({ error: 'Failed to get monitoring status' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}