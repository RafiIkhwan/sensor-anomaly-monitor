import { NextApiRequest, NextApiResponse } from 'next';
// import { MonitoringService } from '@lib/monitor-service';

let monitoringService: any = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
        // if (!monitoringService) {
        //   monitoringService = new MonitoringService();
        // }
      const devices = monitoringService.getDeviceStates();
      res.status(200).json({ 
        devices,
        isRunning: !!monitoringService,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to get monitoring status:', error);
      res.status(500).json({ error: 'Failed to get monitoring status' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}