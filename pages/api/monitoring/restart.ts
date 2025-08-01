import { NextApiRequest, NextApiResponse } from 'next';
import { MonitoringService } from '@lib/monitor-service-singleton';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      MonitoringService.destroyInstance();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const monitoringService = MonitoringService.getInstance();
      const success = monitoringService.start();
      
      if (success) {
        res.status(200).json({ 
          message: 'Monitoring service restarted successfully', 
          status: 'running',
          serviceStatus: monitoringService.getStatus()
        });
      } else {
        res.status(500).json({ error: 'Failed to restart monitoring service' });
      }
    } catch (error) {
      console.error('Failed to restart monitoring:', error);
      res.status(500).json({ error: 'Failed to restart monitoring service' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}