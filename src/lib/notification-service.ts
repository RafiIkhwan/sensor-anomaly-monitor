import TelegramBot from 'node-telegram-bot-api';
import { Twilio } from 'twilio';
import { AnomalyEvent } from '../types/sensor';

export class NotificationService {
  private telegramBot: TelegramBot | null = null;
  private twilioClient: Twilio | null = null;
  
  private enableTelegram = process.env.ENABLE_TELEGRAM === 'true';
  private enableWhatsApp = process.env.ENABLE_WHATSAPP === 'true';

  constructor() {
    this.initializeTelegram();
    this.initializeTwilio();
  }

  private initializeTelegram() {
    if (this.enableTelegram && process.env.TELEGRAM_BOT_TOKEN) {
      this.telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
    }
  }

  private initializeTwilio() {
    if (this.enableWhatsApp && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      );
    }
  }

  async sendAnomalyNotification(anomaly: AnomalyEvent) {
    const message = this.formatAnomalyMessage(anomaly);

    const promises: Promise<void>[] = [];

    if (this.enableTelegram && this.telegramBot) {
      promises.push(this.sendTelegramMessage(message));
    }

    if (this.enableWhatsApp && this.twilioClient) {
      promises.push(this.sendWhatsAppMessage(message));
    }

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  private formatAnomalyMessage(anomaly: AnomalyEvent): string {
    const timestamp = new Date(anomaly.timestamp).toLocaleString('id-ID');
    const location = `${anomaly.data.device.lat}, ${anomaly.data.device.long}`;
    
    return `🚨 *ANOMALI SENSOR TERDETEKSI*

📱 Device: ${anomaly.deviceId}
📊 Model: ${anomaly.data.device.model}
🕒 Waktu: ${timestamp}
📍 Lokasi: ${location}

⚠️ *Detail Anomali:*
${anomaly.message}

📋 *Status Device:*
• Temperature: ${anomaly.data.device.temp.toFixed(2)}°C
• Humidity: ${anomaly.data.device.hum.toFixed(2)}%
• Battery Level: ${anomaly.data.power.battLevel}%
• RSSI: ${anomaly.data.device.rssi}

#AnomalySensor #Monitoring`;
  }

  private async sendTelegramMessage(message: string): Promise<void> {
    if (!this.telegramBot || !process.env.TELEGRAM_CHAT_ID) {
      throw new Error('Telegram not configured');
    }
    
    try {
      await this.telegramBot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
        parse_mode: 'Markdown'
      });
      console.log('Telegram notification sent successfully');
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  private async sendWhatsAppMessage(message: string) {
    if (!this.twilioClient || !process.env.WHATSAPP_TO || !process.env.TWILIO_WHATSAPP_FROM) {
      throw new Error('WhatsApp not configured');
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: process.env.WHATSAPP_TO
      });
      console.log('WhatsApp notification sent successfully');
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }
}