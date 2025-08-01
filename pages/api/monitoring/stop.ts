import { NextApiRequest, NextApiResponse } from "next";
// import { MonitoringService } from "@lib/monitor-service";

let monitoringService: any = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // monitoringService = monitoringService || new MonitoringService();
      monitoringService.stop();
      res
        .status(200)
        .json({
          message: "Monitoring stopped successfully",
          status: "stopped",
        });
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
      res.status(500).json({ error: "Failed to stop monitoring service" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
