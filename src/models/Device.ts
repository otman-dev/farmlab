/* eslint-disable @typescript-eslint/no-explicit-any */
// Temporarily disable the rule for this file to allow the build to proceed.

import mongoose, { Model } from 'mongoose';

// Define Device schema based on the actual data structure in the database
const DeviceSchema = new mongoose.Schema({
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
  },
  device_type: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: false,
  },
  fw_version: {
    type: String,
    required: false,
  },
  ip: {
    type: String,
    required: false,
  },
  last_seen: {
    type: Date,
    default: Date.now,
  },
  // Alias used by some scripts and APIs — keep it optional
  last_heartbeat: {
    type: Date,
    required: false,
  },
  mac: {
    type: String,
    required: false,
  },
  mqtt: {
    type: Boolean,
    default: false,
  },
  next_reboot_min: {
    type: Number,
    required: false,
  },
  ota: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Number,
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
  status: {
    type: String,
    // Allow a couple of additional helper states used in the UI/scripts
    enum: ['online', 'offline', 'unknown', 'maintenance', 'coming_soon'],
    default: 'unknown',
  },
}, {
  timestamps: true,
  collection: 'devices'
});

// Calculate if device is online based on last_seen timestamp
// A device is considered online if the last heartbeat was within the last 5 minutes
DeviceSchema.virtual('isOnline').get(function() {
  if (!this.last_seen) return false;
  
  const lastSeen = new Date(this.last_seen);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
  
  return diffMinutes < 5; // Online if seen in the last 5 minutes
});

// Virtual to return formatted uptime in hours, minutes
DeviceSchema.virtual('uptimeFormatted').get(function() {
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

// Set JSON transformation to include virtual fields and handle property name variations
DeviceSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret: any) {
    // Ensure standardized field names are available
    if (!ret.name) {
      ret.name = ret.device_id ? 
        ret.device_type ? 
          `${ret.device_type.charAt(0).toUpperCase() + ret.device_type.slice(1)} (${ret.device_id})` : 
          `Device ${ret.device_id}` : 
        'Unknown Device';
    }
    
    if (!ret.type && ret.device_type) {
      ret.type = ret.device_type;
    }
    
    // Preserve explicit special statuses (e.g. maintenance, coming_soon) when present.
    // Otherwise compute status from recent heartbeat / last_seen.
    if (ret.status === 'maintenance' || ret.status === 'coming_soon') {
      // keep the explicitly provided status as-is
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
    
    // Standardize firmware version field
    ret.firmware_version = ret.fw_version || 'Unknown';
    
    // Standardize IP address field
    ret.ip_address = ret.ip || 'Unknown';
    
  // Standardize last heartbeat field (support documents that use either field)
  ret.last_heartbeat = ret.last_heartbeat || ret.last_seen || null;
    
    // Add formatted timestamps
    if (ret.last_seen) {
      const lastSeen = new Date(ret.last_seen);
      // Format: "Sep 16, 2025, 3:45 PM"
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
    
    // Add next reboot info if available
    if (ret.next_reboot_min !== undefined && ret.next_reboot_min !== null) {
      const hours = Math.floor(ret.next_reboot_min / 60);
      const minutes = ret.next_reboot_min % 60;
      ret.next_reboot_formatted = hours > 0 ? 
        `${hours}h ${minutes}m` : 
        `${minutes}m`;
    }
    
    return ret;
  }
});

// Check if the model already exists to avoid model compilation errors
let DeviceModel: Model<any>;

if (mongoose.models.Device) {
  DeviceModel = mongoose.models.Device;
} else {
  DeviceModel = mongoose.model('Device', DeviceSchema);
}

export default DeviceModel;