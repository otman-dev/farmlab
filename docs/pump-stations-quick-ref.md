# Pump Stations - Quick Reference

## 🚀 Access
- **URL**: `/adminDashboard/pumpstations`
- **Navigation**: Admin Dashboard → Pump Stations (sidebar)

## 📋 Features

### Main Page
✅ View all pump stations  
✅ Real-time connection status (WiFi, MQTT)  
✅ Enable/disable automation per station  
✅ Manual pump ON/OFF control  
✅ Quick access to timing configuration  

### Configuration Page
✅ Adjust pump ON time (milliseconds)  
✅ Adjust pump OFF time (milliseconds)  
✅ View cycle statistics  
✅ Quick timing presets  

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/pumpstations` | List all stations |
| POST | `/api/pumpstations` | Create station |
| PUT | `/api/pumpstations` | Update station |
| DELETE | `/api/pumpstations?device_id={id}` | Delete station |
| POST | `/api/pumpstations/control` | Pump ON/OFF |
| POST | `/api/pumpstations/automation` | Toggle automation |
| POST | `/api/pumpstations/config` | Update timing |

## 🎯 MQTT Topics

```
farmLab/pumpStations/{device_id}/heartbeat  → Device sends status
farmLab/pumpStations/{device_id}/control    → Server sends commands
farmLab/pumpStations/{device_id}/config     → Server sends timing
```

## 🔧 Setup Steps

1. **Seed Database**:
   ```bash
   node scripts/seed-pumpstations.cjs
   ```

2. **Flash Arduino**: Upload your pump station code

3. **Access Interface**: Navigate to `/adminDashboard/pumpstations`

4. **Configure**: Click "Configure Timing" on any pump

## 💡 How It Works

### Manual Mode (Automation OFF)
1. Click pump ON/OFF button
2. Immediate control via MQTT
3. Pump stays in set state

### Automation Mode (Automation ON)
1. Enable automation toggle
2. Pumps cycle automatically
3. Uses configured ON/OFF times
4. Manual control disabled

## 📊 Timing Examples

| Scenario | ON Time | OFF Time | Result |
|----------|---------|----------|--------|
| Quick Test | 1000ms | 10000ms | 1s on, 10s off |
| Light Water | 5000ms | 30000ms | 5s on, 30s off |
| Normal Water | 10000ms | 60000ms | 10s on, 1m off |
| Deep Water | 30000ms | 300000ms | 30s on, 5m off |

## ⚠️ Important Notes

- Automation must be **enabled** for automatic cycling
- Manual control only works when automation is **disabled**
- Device must be **online** for controls to work
- Changes sent immediately via MQTT
- Very short cycles may damage pumps

## 🐛 Common Issues

**Pump not responding?**
- Check device status is "online"
- Verify MQTT connection
- Check WiFi connection

**Can't control pump?**
- Disable automation first (for manual control)
- Ensure device is online
- Check user permissions

**Timing not updating?**
- Verify automation is enabled
- Check MQTT broker connection
- Review device logs

## 📱 User Interface

### Status Colors
- 🟢 **Green**: Online
- 🔴 **Red**: Offline
- 🟡 **Yellow**: Maintenance
- ⚪ **Gray**: Unknown

### Button States
- **Enabled** (Green): Feature is active
- **Disabled** (Gray): Feature is inactive
- **Loading**: Spinning icon during action

## 🔐 Security

- **View**: All authenticated users
- **Control**: All authenticated users
- **Create/Delete**: Admin only
- **Configure**: All authenticated users

---

**Created**: November 24, 2025  
**Compatible with**: Arduino/ESP32 Pump Station v1.0.7+
