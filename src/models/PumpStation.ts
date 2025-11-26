import mongoose, { Model, Schema } from 'mongoose';

// Define Pump schema for individual pumps
const PumpSchema = new Schema({
  pump_id: {
    type: String,
    required: true,
  },
  pin: {
    type: Number,
    required: true,
  },
  state: {
    type: Boolean,
    default: false,
  },
  on_time_ms: {
    type: Number,
    default: 1000,
  },
  off_time_ms: {
    type: Number,
    default: 10000,
  },
}, { _id: false });

// Define PumpStation schema based on the Arduino code structure
const PumpStationSchema = new Schema({
  device_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  bridge: {
    type: String,
    required: false,
    default: 'rasp_01',
  },
  firmware_version: {
    type: String,
    required: false,
  },
  automation_enabled: {
    type: Boolean,
    default: false,
  },
  pumps: {
    type: [PumpSchema],
    default: [],
  },
  last_seen: {
    type: Date,
    default: Date.now,
  },
  last_heartbeat: {
    type: Date,
    required: false,
  },
  uptime_s: {
    type: Number,
    required: false,
  },
  wifi: {
    type: Boolean,
    default: false,
  },
  mqtt: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'unknown', 'maintenance'],
    default: 'unknown',
  },
}, {
  timestamps: true,
  collection: 'pumpstations'
});

// Virtual to check if pump station is online
PumpStationSchema.virtual('isOnline').get(function() {
  if (!this.last_seen) return false;
  
  const lastSeen = new Date(this.last_seen);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
  
  return diffMinutes < 5; // Online if seen in the last 5 minutes
});

// Virtual to return formatted uptime
PumpStationSchema.virtual('uptimeFormatted').get(function() {
  if (!this.uptime_s) return 'Unknown';
  
  const seconds = this.uptime_s;
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
});

// Set JSON transformation
PumpStationSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret: any) {
    // Set default name if not provided
    if (!ret.name) {
      ret.name = `Pump Station (${ret.device_id})`;
    }
    
    // Compute status from recent heartbeat / last_seen
    if (ret.status === 'maintenance') {
      // keep explicitly set maintenance status
    } else {
      const lastSeenForStatus = ret.last_seen || ret.last_heartbeat;
      if (lastSeenForStatus) {
        const lastSeen = new Date(lastSeenForStatus);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
        ret.status = diffMinutes < 5 ? 'online' : 'offline';
      } else {
        ret.status = 'unknown';
      }
    }
    
    // Add formatted timestamps
    if (ret.last_seen) {
      const lastSeen = new Date(ret.last_seen);
      ret.last_seen_formatted = lastSeen.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    }
    
    // Add connection details
    ret.connection = {
      wifi: ret.wifi ? 'Connected' : 'Disconnected',
      mqtt: ret.mqtt ? 'Connected' : 'Disconnected',
      bridge: ret.bridge || 'None'
    };
    
    return ret;
  }
});

// Check if the model already exists to avoid model compilation errors
let PumpStationModel: Model<any>;

if (mongoose.models.PumpStation) {
  PumpStationModel = mongoose.models.PumpStation;
} else {
  PumpStationModel = mongoose.model('PumpStation', PumpStationSchema);
}

export default PumpStationModel;
