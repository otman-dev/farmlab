# Pump Stations Management System

Complete pump station monitoring and control system for FarmLab, similar to the sensor stations interface.

## Features

### 1. **Real-time Pump Station Monitoring**
- View all connected pump stations
- Monitor connection status (WiFi, MQTT)
- Track firmware versions and uptime
- See last seen timestamps

### 2. **Pump Control**
- **Manual Control**: Turn individual pumps ON/OFF
- **Automation Mode**: Enable/disable automatic cycling
- **Timing Configuration**: Adjust ON/OFF cycle times in milliseconds

### 3. **Multi-Pump Support**
- Each pump station can have multiple pumps
- Individual control for each pump
- Independent timing configuration per pump

## Pages Structure

```
/adminDashboard/pumpstations/
├── page.tsx                                    # Main pump stations list
└── [device_id]/
    └── [pump_id]/
        └── page.tsx                            # Pump timing configuration
```

## API Endpoints

### Base Endpoints
- `GET /api/pumpstations` - List all pump stations
- `POST /api/pumpstations` - Create new pump station
- `PUT /api/pumpstations` - Update pump station
- `DELETE /api/pumpstations?device_id={id}` - Delete pump station

### Control Endpoints
- `POST /api/pumpstations/control` - Turn pump ON/OFF
  ```json
  {
    "device_id": "pumpstation01",
    "pump_id": "pump1",
    "state": true
  }
  ```

- `POST /api/pumpstations/automation` - Toggle automation
  ```json
  {
    "device_id": "pumpstation01",
    "automation_enabled": true
  }
  ```

- `POST /api/pumpstations/config` - Update pump timing
  ```json
  {
    "device_id": "pumpstation01",
    "pump_id": "pump1",
    "on_time_ms": 5000,
    "off_time_ms": 30000
  }
  ```

## Database Model

### PumpStation Schema
```typescript
{
  device_id: string;           // Unique identifier (e.g., "pumpstation01")
  name: string;                // Display name
  bridge: string;              // MQTT bridge (e.g., "rasp_01")
  firmware_version: string;    // Firmware version
  automation_enabled: boolean; // Automation state
  pumps: Pump[];              // Array of pumps
  status: 'online' | 'offline' | 'unknown' | 'maintenance';
  last_seen: Date;
  uptime_s: number;
  wifi: boolean;
  mqtt: boolean;
}
```

### Pump Schema
```typescript
{
  pump_id: string;    // Unique identifier (e.g., "pump1")
  pin: number;        // GPIO pin number
  state: boolean;     // Current state (ON/OFF)
  on_time_ms: number; // ON duration in milliseconds
  off_time_ms: number;// OFF duration in milliseconds
}
```

## Arduino/ESP32 Integration

The system is designed to work with Arduino/ESP32 devices using MQTT communication.

### MQTT Topics

**Heartbeat** (Device → Server):
```
farmLab/pumpStations/{device_id}/heartbeat
```
Payload:
```json
{
  "device_id": "pumpstation01",
  "fw": "1.0.7",
  "wifi": true,
  "mqtt": true,
  "uptime": 3600,
  "pump1_state": false,
  "automation": false,
  "pump1On": 1000,
  "pump1Off": 10000,
  "datetime_unix": 1732464000,
  "bridge": "rasp_01"
}
```

**Control** (Server → Device):
```
farmLab/pumpStations/{device_id}/control
```
Payloads:
```json
// Toggle automation
{ "automation": true }

// Manual pump control
{ "pump": true }  // or false
```

**Configuration** (Server → Device):
```
farmLab/pumpStations/{device_id}/config
```
Payload:
```json
{
  "pump1On": 5000,
  "pump1Off": 30000
}
```

## Setup Instructions

### 1. Seed Initial Data

Run the seed script to create sample pump stations:

```bash
node scripts/seed-pumpstations.cjs
```

This creates two sample pump stations:
- `pumpstation01` - Main Irrigation Pump Station
- `pumpstation02` - Secondary Pump Station

### 2. Access the Interface

Navigate to:
```
http://localhost:3000/adminDashboard/pumpstations
```

Or use the navigation:
- Sidebar: "Pump Stations"
- Admin Dashboard: "Quick Admin Actions" → "Pump Stations"

### 3. Configure Your Arduino Device

Upload the provided Arduino code to your ESP32 with these configurations:
- WiFi credentials
- MQTT broker address
- Device ID (must match database)
- Pump pins

## Usage Guide

### Viewing Pump Stations

The main page shows all pump stations with:
- Connection status indicators
- Current automation state
- List of pumps with their states
- ON/OFF cycle timings

### Manual Pump Control

1. Ensure automation is **disabled**
2. Click the ON/OFF button next to the pump
3. Pump state changes immediately
4. MQTT command sent to device

### Enabling Automation

1. Click "Enable" on the Automation toggle
2. Pumps will cycle automatically based on configured timings
3. Manual control is disabled during automation
4. Click "Disable" to stop automation

### Configuring Pump Timing

1. Click "Configure Timing" link under a pump
2. Adjust ON time (milliseconds)
3. Adjust OFF time (milliseconds)
4. Use quick presets or enter custom values
5. View cycle information (total time, duty cycle)
6. Click "Save Configuration"
7. New timing sent to device via MQTT

## Timing Presets

| Preset | ON Time | OFF Time | Duty Cycle | Use Case |
|--------|---------|----------|------------|----------|
| 1s / 10s | 1000ms | 10000ms | 9.1% | Testing |
| 5s / 30s | 5000ms | 30000ms | 14.3% | Light watering |
| 10s / 1m | 10000ms | 60000ms | 14.3% | Regular irrigation |
| 30s / 5m | 30000ms | 300000ms | 9.1% | Deep watering |

## Security

- All endpoints require authentication
- Admin role required for:
  - Creating pump stations
  - Deleting pump stations
  - Modifying pump stations
- Authenticated users can:
  - View pump stations
  - Control pumps
  - Configure timings

## Troubleshooting

### Pump station not appearing
- Check if device is sending heartbeat messages
- Verify MQTT broker connection
- Check device_id matches database entry

### Cannot control pump
- Verify device status is "online"
- Check MQTT connection status
- Ensure pump station is not in maintenance mode

### Timing changes not applied
- Confirm MQTT connection is active
- Check device logs for config reception
- Verify automation is enabled for automatic cycling

## Future Enhancements

- [ ] Historical pump activity logs
- [ ] Schedule-based automation
- [ ] Water flow sensors integration
- [ ] Pressure monitoring
- [ ] Multiple pump coordination
- [ ] Mobile app notifications
- [ ] Energy consumption tracking
- [ ] Maintenance reminders

## Files Created

```
src/
├── models/
│   └── PumpStation.ts
├── app/
│   ├── api/
│   │   └── pumpstations/
│   │       ├── route.ts
│   │       ├── control/
│   │       │   └── route.ts
│   │       ├── automation/
│   │       │   └── route.ts
│   │       └── config/
│   │           └── route.ts
│   └── adminDashboard/
│       └── pumpstations/
│           ├── page.tsx
│           └── [device_id]/
│               └── [pump_id]/
│                   └── page.tsx
└── components/
    └── dashboard/
        └── SimpleDashboardNavigation.tsx (updated)

scripts/
└── seed-pumpstations.cjs
```

## Support

For issues or questions, check:
1. Browser console for errors
2. Server logs for API issues
3. MQTT broker logs for communication problems
4. Device serial output for Arduino issues
