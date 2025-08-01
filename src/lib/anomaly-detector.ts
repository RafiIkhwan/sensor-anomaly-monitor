import { SensorData, DeviceState, AnomalyEvent } from '../types/sensor';

export class AnomalyDetector {
  private deviceStates = new Map<string, DeviceState>();
  private anomalyHandlers: ((anomaly: AnomalyEvent) => void)[] = [];
  
  private levelThresholdPercent = Number(process.env.LEVEL_THRESHOLD_PERCENT) || 10;
  private uptimeResetThreshold = Number(process.env.UPTIME_RESET_THRESHOLD) || 300000; // 5 minutes

  processMessage(topic: string, data: SensorData) {
    const deviceId = this.extractDeviceId(topic);
    const currentState = this.deviceStates.get(deviceId);
    
    if (!currentState) {
      // First time seeing this device
      this.deviceStates.set(deviceId, {
        deviceId,
        lastUptime: data.device.uptime,
        lastLevel: data.level,
        lastUpdateTime: Date.now()
      });
      return;
    }

    // Check for device restart anomaly
    this.checkDeviceRestart(deviceId, currentState, data);
    
    // Check for level change anomaly
    this.checkLevelChange(deviceId, currentState, data);

    // Update device state
    this.deviceStates.set(deviceId, {
      deviceId,
      lastUptime: data.device.uptime,
      lastLevel: data.level,
      lastUpdateTime: Date.now()
    });
  }

  private checkDeviceRestart(deviceId: string, currentState: DeviceState, data: SensorData) {
    const uptimeDiff = data.device.uptime - currentState.lastUptime;
    const timeDiff = Date.now() - currentState.lastUpdateTime;
    
    // If uptime decreased or reset (considering it should only increase)
    if (data.device.uptime < currentState.lastUptime || 
        (uptimeDiff < timeDiff - this.uptimeResetThreshold)) {
      
      const anomaly: AnomalyEvent = {
        id: `${deviceId}_restart_${Date.now()}`,
        deviceId,
        type: 'device_restart',
        message: `Device ${deviceId} telah restart. Uptime sebelumnya: ${Math.floor(currentState.lastUptime/1000)}s, uptime sekarang: ${Math.floor(data.device.uptime/1000)}s`,
        timestamp: Date.now(),
        previousValue: currentState.lastUptime,
        currentValue: data.device.uptime,
        data
      };

      this.triggerAnomaly(anomaly);
    }
  }

  private checkLevelChange(deviceId: string, currentState: DeviceState, data: SensorData) {
    const levelDiff = Math.abs(data.level - currentState.lastLevel);
    const percentChange = (levelDiff / currentState.lastLevel) * 100;

    if (percentChange >= this.levelThresholdPercent) {
      const direction = data.level > currentState.lastLevel ? 'naik' : 'turun';
      
      const anomaly: AnomalyEvent = {
        id: `${deviceId}_level_${Date.now()}`,
        deviceId,
        type: 'level_change',
        message: `Level sensor ${deviceId} berubah drastis ${direction} sebesar ${percentChange.toFixed(2)}%. Level sebelumnya: ${currentState.lastLevel.toFixed(2)}, level sekarang: ${data.level.toFixed(2)}`,
        timestamp: Date.now(),
        previousValue: currentState.lastLevel,
        currentValue: data.level,
        data
      };

      this.triggerAnomaly(anomaly);
    }
  }

  private extractDeviceId(topic: string): string {
    // Extract device ID from topic JI/v2/+/level
    const parts = topic.split('/');
    return parts[2] || 'unknown';
  }

  private triggerAnomaly(anomaly: AnomalyEvent) {
    console.log('Anomaly detected:', anomaly);
    this.anomalyHandlers.forEach(handler => handler(anomaly));
  }

  onAnomaly(handler: (anomaly: AnomalyEvent) => void) {
    this.anomalyHandlers.push(handler);
  }

  getDeviceStates() {
    return Array.from(this.deviceStates.values());
  }
}