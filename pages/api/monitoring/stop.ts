import { NextApiRequest, NextApiResponse } from 'next';
import { MonitoringService } from '@lib/monitor-service-singleton';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      if (MonitoringService.hasInstance()) {
        const monitoringService = MonitoringService.getInstance();
        monitoringService.stop();
        res.status(200).json({ 
          message: 'Monitoring stopped successfully', 
          status: 'stopped',
          serviceStatus: monitoringService.getStatus()
        });
      } else {
        res.status(200).json({ 
          message: 'Monitoring was not running', 
          status: 'stopped' 
        });
      }
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
      res.status(500).json({ error: 'Failed to stop monitoring service' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}