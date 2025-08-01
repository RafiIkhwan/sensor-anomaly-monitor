import { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '@lib/notification-service'; // Adjust the import path as necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const notificationService = new NotificationService();

      const testAnomaly = {
        id: `test_${Date.now()}`,
        deviceId: 'TEST_DEVICE',
        type: 'level_change' as const,
        message: 'This is a test anomaly notification from your monitoring system.',
        timestamp: Date.now(),
        previousValue: 100,
        currentValue: 115,
        data: {
          ts: Math.floor(Date.now() / 1000),
          device: {
            uptime: 3600000,
            temp: 25.5,
            hum: 60.2,
            long: -6.77839994430542,
            lat: 110.55740356445312,
            rssi: 255,
            hwVer: "1.0.0",
            fwVer: "1.0.0",
            model: "GLTM-SWE",
            memory: 34
          },
          power: {
            battStat: ["Normal", "Normal", "Normal", "Normal"],
            solarStat: Array(14).fill("Normal"),
            loadStat: Array(12).fill("Normal"),
            battLevel: 85,
            battVolt: 1320,
            eGen: [0, 1835008, 16252928, 19595264],
            eCom: [327680, 3145728, 11599872, 12845056]
          },
          level: 115
        }
      };

      await notificationService.sendAnomalyNotification(testAnomaly);
      res.status(200).json({ message: 'Test notification sent successfully' });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}