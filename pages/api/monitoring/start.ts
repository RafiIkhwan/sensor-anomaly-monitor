import { NextApiRequest, NextApiResponse } from "next";
import { MonitoringService } from "@lib/monitor-service";

let monitoringService: any = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      if (!monitoringService) {
        monitoringService = new MonitoringService();
      }

      monitoringService.start();
      res
        .status(200)
        .json({
          message: "Monitoring started successfully",
          status: "running",
        });
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      res.status(500).json({ error: "Failed to start monitoring service" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
