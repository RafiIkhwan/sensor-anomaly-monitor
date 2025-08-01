import { NextApiRequest, NextApiResponse } from 'next';
import { MonitoringService } from '@lib/monitor-service-singleton';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      if (!MonitoringService.hasInstance()) {
        return res.status(400).json({ 
          error: 'Monitoring service not initialized. Please start monitoring first.' 
        });
      }

      const monitoringService = MonitoringService.getInstance();
      await monitoringService.testNotification();
      
      res.status(200).json({ 
        message: 'Test notification sent successfully',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      res.status(500).json({ 
        error: 'Failed to send test notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}