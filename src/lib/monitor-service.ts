import { MQTTClient } from './mqtt-client';
import { AnomalyDetector } from './anomaly-detector';
import { NotificationService } from './notification-service';

export class MonitoringService {
  private mqttClient: MQTTClient;
  private anomalyDetector: AnomalyDetector;
  private notificationService: NotificationService;
  private isRunning = false;

  constructor() {
    this.mqttClient = new MQTTClient();
    this.anomalyDetector = new AnomalyDetector();
    this.notificationService = new NotificationService();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.mqttClient.onMessage((topic, data) => {
      if (this.isRunning) {
        this.anomalyDetector.processMessage(topic, data);
      }
    });

    this.anomalyDetector.onAnomaly((anomaly) => {
      this.notificationService.sendAnomalyNotification(anomaly);
    });
  }

  start() {
    this.isRunning = true;
    console.log('Monitoring service started');
  }

  stop() {
    this.isRunning = false;
    console.log('Monitoring service stopped');
  }

  getDeviceStates() {
    return this.anomalyDetector.getDeviceStates();
  }

  disconnect() {
    this.stop();
    this.mqttClient.disconnect();
  }
}