export interface SensorData {
  ts: number;
  device: {
    uptime: number;
    temp: number;
    hum: number;
    long: number;
    lat: number;
    rssi: number;
    hwVer: string;
    fwVer: string;
    model: string;
    memory: number;
  };
  power: {
    battStat: string[];
    solarStat: string[];
    loadStat: string[];
    battLevel: number;
    battVolt: number;
    eGen: number[];
    eCom: number[];
  };
  level: number;
}

export interface DeviceState {
  deviceId: string;
  lastUptime: number;
  lastLevel: number;
  lastUpdateTime: number;
}

export interface AnomalyEvent {
  id: string;
  deviceId: string;
  type: 'device_restart' | 'level_change';
  message: string;
  timestamp: number;
  previousValue?: number;
  currentValue: number;
  data: SensorData;
}