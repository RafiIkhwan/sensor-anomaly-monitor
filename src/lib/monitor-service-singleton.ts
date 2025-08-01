import { MQTTClient } from './mqtt-client';
import { AnomalyDetector } from './anomaly-detector';
import { NotificationService } from './notification-service';
import { AnomalyStorage } from './anomaly-storage';

export class MonitoringService {
  private static instance: MonitoringService | null = null;
  private mqttClient: MQTTClient;
  private anomalyDetector: AnomalyDetector;
  private notificationService: NotificationService;
  private isRunning = false;
  private isInitialized = false;

  private constructor() {
    this.mqttClient = new MQTTClient();
    this.anomalyDetector = new AnomalyDetector();
    this.notificationService = new NotificationService();
    this.setupEventHandlers();
    this.isInitialized = true;
  }

  // Singleton getInstance method
  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Method to check if instance exists without creating one
  public static hasInstance(): boolean {
    return MonitoringService.instance !== null;
  }

  // Method to safely destroy instance
  public static destroyInstance(): void {
    if (MonitoringService.instance) {
      MonitoringService.instance.disconnect();
      MonitoringService.instance = null;
    }
  }

  private setupEventHandlers() {
    this.mqttClient.onMessage((topic, data) => {
      if (this.isRunning) {
        this.anomalyDetector.processMessage(topic, data);
      }
    });

    this.anomalyDetector.onAnomaly((anomaly) => {
      // Store anomaly in memory
      AnomalyStorage.addAnomaly(anomaly);
      
      // Send notification
      this.notificationService.sendAnomalyNotification(anomaly)
        .catch(error => {
          console.error('Failed to send notification:', error);
        });
    });
  }

  start() {
    if (!this.isInitialized) {
      console.error('MonitoringService not properly initialized');
      return false;
    }
    
    this.isRunning = true;
    console.log('Monitoring service started');
    return true;
  }

  stop() {
    this.isRunning = false;
    console.log('Monitoring service stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      isInitialized: this.isInitialized,
      deviceCount: this.anomalyDetector.getDeviceStates().length
    };
  }

  getDeviceStates() {
    return this.anomalyDetector.getDeviceStates();
  }

  disconnect() {
    this.stop();
    this.mqttClient.disconnect();
    this.isInitialized = false;
  }

  // Method untuk testing notification tanpa duplicating service
  async testNotification() {
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

    return await this.notificationService.sendAnomalyNotification(testAnomaly);
  }
}