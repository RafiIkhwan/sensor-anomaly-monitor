export class AnomalyStorage {
  private static anomalies: any[] = [];
  private static maxSize = 100; // Keep last 100 anomalies

  static addAnomaly(anomaly: any) {
    this.anomalies.unshift(anomaly);
    
    // Keep only the latest anomalies
    if (this.anomalies.length > this.maxSize) {
      this.anomalies = this.anomalies.slice(0, this.maxSize);
    }
  }

  static getAnomalies() {
    return [...this.anomalies];
  }

  static clearAnomalies() {
    this.anomalies = [];
  }

  static getAnomaliesByDevice(deviceId: string) {
    return this.anomalies.filter(anomaly => anomaly.deviceId === deviceId);
  }

  static getAnomaliesByType(type: string) {
    return this.anomalies.filter(anomaly => anomaly.type === type);
  }
}