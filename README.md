# Sensor Anomaly Monitor

Aplikasi Next.js untuk memantau anomali pada data sensor MQTT dengan notifikasi real-time melalui Telegram dan WhatsApp.

## 🚀 Fitur

### Deteksi Anomali
- **Device Restart Detection**: Mendeteksi ketika device restart berdasarkan perubahan uptime
- **Level Change Detection**: Mendeteksi perubahan level sensor yang mendadak (≥10% secara default)

### Notifikasi Multi-Channel
- **Telegram Bot**: Kirim notifikasi ke chat/group Telegram
- **WhatsApp (Twilio)**: Kirim notifikasi ke WhatsApp melalui Twilio API
- **Toggle-able**: Bisa mengaktifkan/menonaktifkan masing-masing channel via environment variables

### Dashboard Web
- Real-time monitoring status
- Device status overview
- Anomaly history
- Statistics dan metrics
- Quick actions (test notifications, clear history)

## 📦 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd sensor-anomaly-monitor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Buat file `.env.local` dengan konfigurasi berikut:

```env
# MQTT Broker Configuration
MQTT_BROKER_URL=mqtt://your-mqtt-broker:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
ENABLE_TELEGRAM=true

# WhatsApp (Twilio) Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
WHATSAPP_TO=whatsapp:+628123456789
ENABLE_WHATSAPP=true

# Anomaly Detection Settings
LEVEL_THRESHOLD_PERCENT=10
UPTIME_RESET_THRESHOLD=300000
```

## 🔧 Setup Services

### Telegram Bot Setup
1. Chat dengan [@BotFather](https://t.me/botfather) di Telegram
2. Gunakan command `/newbot` untuk membuat bot baru
3. Ikuti instruksi dan dapatkan **Bot Token**
4. Untuk mendapatkan **Chat ID**:
   - Kirim pesan ke bot Anda
   - Akses: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Ambil `chat.id` dari response JSON

### Twilio WhatsApp Setup
1. Daftar di [Twilio Console](https://console.twilio.com/)
2. Navigasi ke WhatsApp Sandbox
3. Follow setup instructions untuk WhatsApp Sandbox
4. Dapatkan **Account SID** dan **Auth Token** dari dashboard
5. Setup phone number untuk testing

### MQTT Broker
Pastikan MQTT broker Anda dapat diakses dan topic `JI/v2/+/level` tersedia.

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📱 Usage

### 1. Start Monitoring
- Buka aplikasi di browser
- Klik "Start Monitoring" untuk mulai memantau sensor
- Dashboard akan menampilkan device yang terdeteksi

### 2. View Dashboard
- Akses `/dashboard` untuk tampilan lengkap
- Lihat status device, anomaly history, dan statistics
- Gunakan quick actions untuk test notifikasi

### 3. Monitor Anomalies
Sistem akan secara otomatis:
- Mendeteksi device restart ketika uptime menurun
- Mendeteksi perubahan level ≥ threshold yang dikonfigurasi
- Mengirim notifikasi ke channel yang diaktifkan

## 🔍 API Endpoints

### Monitoring Control
- `POST /api/monitoring/start` - Mulai monitoring
- `POST /api/monitoring/stop` - Hentikan monitoring
- `GET /api/monitoring/status` - Status dan device data

### Anomaly Management
- `GET /api/monitoring/anomalies` - Daftar anomaly
  - Query params: `device`, `type`, `limit`
- `DELETE /api/monitoring/anomalies` - Clear anomaly history

### Testing
- `POST /api/monitoring/test` - Kirim test notification

## 📊 Data Structure

### MQTT Payload
```json
{
  "ts": 1754014675,
  "device": {
    "uptime": 1438409,
    "temp": 39.37,
    "hum": 33.17,
    "long": -6.778,
    "lat": 110.557,
    "rssi": 255,
    "hwVer": "1.0.0",
    "fwVer": "1.0.0",
    "model": "GLTM-SWE",
    "memory": 34
  },
  "power": {
    "battStat": ["Normal", "Normal", "Normal", "Normal"],
    "solarStat": [...],
    "loadStat": [...],
    "battLevel": 77,
    "battVolt": 1305,
    "eGen": [0, 1835008, 16252928, 19595264],
    "eCom": [327680, 3145728, 11599872, 12845056]
  },
  "level": 152.83
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LEVEL_THRESHOLD_PERCENT` | Threshold persentase untuk deteksi perubahan level | 10 |
| `UPTIME_RESET_THRESHOLD` | Threshold waktu untuk deteksi restart (ms) | 300000 |
| `ENABLE_TELEGRAM` | Aktifkan notifikasi Telegram | false |
| `ENABLE_WHATSAPP` | Aktifkan notifikasi WhatsApp | false |

### Anomaly Detection Logic

**Device Restart Detection:**
- Membandingkan uptime saat ini dengan data sebelumnya
- Jika uptime menurun atau tidak bertambah sesuai waktu yang berlalu → restart detected

**Level Change Detection:**
- Menghitung persentase perubahan: `|current - previous| / previous * 100`
- Jika persentase ≥ threshold → anomaly detected

## 🚨 Notification Format

```
🚨 ANOMALI SENSOR TERDETEKSI

📱 Device: JI001
📊 Model: GLTM-SWE
🕒 Waktu: 01/08/2025 14:30:15
📍 Lokasi: -6.778, 110.557

⚠️ Detail Anomali:
Level sensor JI001 berubah drastis turun sebesar 15.5%. 
Level sebelumnya: 152.83, level sekarang: 129.12

📋 Status Device:
• Temperature: 39.37°C
• Humidity: 33.17%
• Battery Level: 77%
• RSSI: 255

#AnomalySensor #Monitoring
```

## 🛠️ Troubleshooting

### Common Issues

**MQTT Connection Failed:**
- Pastikan MQTT broker dapat diakses
- Periksa credentials dan network connectivity
- Verifikasi topic pattern `JI/v2/+/level`

**Telegram Notifications Not Working:**
- Verifikasi Bot Token valid
- Pastikan Chat ID benar
- Check bot permissions

**WhatsApp Notifications Not Working:**
- Verifikasi Twilio credentials
- Pastikan WhatsApp Sandbox disetup dengan benar
- Check phone number format

**No Devices Detected:**
- Pastikan MQTT publisher mengirim data ke topic yang benar
- Check payload format sesuai dengan expected structure
- Verify monitoring service is running

## 📈 Performance & Scaling

- **Memory Storage**: Anomaly history disimpan di memory (max 100 records)
- **Real-time Updates**: WebSocket atau polling interval 5 detik
- **Rate Limiting**: Notification service tidak memiliki rate limiting built-in
- **Scalability**: Untuk production scale, pertimbangkan database storage dan message queue

## 🔒 Security Considerations

- Environment variables berisi sensitive data (tokens, credentials)
- Tidak ada authentication untuk web interface
- MQTT credentials dalam plain text
- Untuk production: implement proper authentication, encryption, dan secret management

## 📝 Development

### Project Structure
```
├── components/          # React components
├── lib/                # Core business logic
├── pages/              # Next.js pages
│   ├── api/           # API routes
│   └── dashboard.tsx  # Dashboard page
├── types/              # TypeScript definitions
└── public/             # Static assets
```

### Key Components
- **MQTTClient**: Handle MQTT connection dan message processing
- **AnomalyDetector**: Core anomaly detection logic
- **NotificationService**: Multi-channel notification sender
- **MonitoringService**: Orchestration layer
- **AnomalyStorage**: In-memory storage untuk anomaly history

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail lengkap.