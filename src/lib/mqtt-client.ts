import mqtt from 'mqtt';
import { SensorData } from '../types/sensor';

export class MQTTClient {
  private client: mqtt.MqttClient | null = null;
  private messageHandlers: ((topic: string, data: SensorData) => void)[] = [];
  private clientId: string;

  constructor() {
    this.clientId = `sensor-monitor-${Math.random().toString(16).slice(2)}`;
    this.connect();
  }

  private connect() {
    const options: mqtt.IClientOptions = {
      host: process.env.MQTT_BROKER_URL?.replace('mqtt://', ''),
      port: process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT) : 1883,
      clientId: this.clientId,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      clean: true,
    };

    this.client = mqtt.connect(process.env.MQTT_BROKER_URL!, options);

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client?.subscribe('JI/v2/+/level', (err) => {
        if (err) {
          console.error('Failed to subscribe to topic:', err);
        } else {
          console.log('Subscribed to JI/v2/+/level');
        }
      });
    });

    this.client.on('message', (topic, message) => {
      try {
        const data: SensorData = JSON.parse(message.toString());
        this.messageHandlers.forEach(handler => handler(topic, data));
      } catch (error) {
        console.error('Failed to parse MQTT message:', error);
      }
    });

    this.client.on('error', (error) => {
      console.error('MQTT connection error:', error);
    });

    this.client.on('disconnect', () => {
      console.log('Disconnected from MQTT broker');
    });
  }

  onMessage(handler: (topic: string, data: SensorData) => void) {
    this.messageHandlers.push(handler);
  }

  disconnect() {
    if (this.client) {
      console.log(`Disconnecting MQTT client: ${this.clientId}`);
      this.client.end(true);
      this.client = null;
    }
  }
  
  getClientId() {
    return this.clientId;
  }
}