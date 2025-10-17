// Script to create test devices in the database for development
require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmLab';

// Define the Device schema for Mongoose
const deviceSchema = new mongoose.Schema({
  device_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    // Add maintenance and coming_soon so we can mark devices explicitly
    enum: ['online', 'offline', 'unknown', 'maintenance', 'coming_soon'],
    default: 'unknown'
  },      
  location: { type: String },
  ip_address: { type: String },
  firmware_version: { type: String },
  last_heartbeat: { type: Date }
}, { timestamps: true });

// Helper function to generate random date within the last 24 hours
function getRandomRecentDate() {
  const now = new Date();
  // Random minutes ago (0 to 1440 minutes = 24 hours)
  const minutesAgo = Math.floor(Math.random() * 1440);
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now;
}

// Helper function to get a random status with weighted probability
function getRandomStatus() {
  const rand = Math.random();
  if (rand < 0.7) return 'online'; // 70% chance
  if (rand < 0.9) return 'offline'; // 20% chance
  return 'unknown'; // 10% chance
}

// Helper function to generate random logs
function generateRandomLogs(deviceId, count) {
  const logs = [];
  const levels = ['info', 'warning', 'error', 'debug'];
  const messages = [
    'Heartbeat received',
    'Sensor reading complete',
    'Connection established',
    'Connection lost',
    'Firmware update available',
    'High temperature detected',
    'Battery low',
    'System restart',
    'Memory usage high',
    'Command received'
  ];

  for (let i = 0; i < count; i++) {
    const timestamp = getRandomRecentDate();
    const level = levels[Math.floor(Math.random() * levels.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    logs.push({
      timestamp,
      level,
      message,
      device_id: deviceId,
      details: {
        value: Math.floor(Math.random() * 100)
      }
    });
  }

  // Sort logs by timestamp (newest first)
  logs.sort((a, b) => b.timestamp - a.timestamp);
  return logs;
}

// Sample devices to create
const sampleDevices = [
  {
    device_id: 'securitySystem01',
    name: 'Main Security System',
    type: 'securitySystem',
    status: getRandomStatus(),
    location: 'Farm Entrance',
    ip_address: '192.168.1.101',
    firmware_version: '1.2.5',
    last_heartbeat: getRandomRecentDate()
  },
  {
    device_id: 'sensorstation01',
    name: 'Weather Station',
    type: 'sensorStation',
    status: getRandomStatus(),
    location: 'North Field',
    ip_address: '192.168.1.102',
    firmware_version: '2.0.1',
    last_heartbeat: getRandomRecentDate()
  },
  {
    device_id: 'irrigationcontrol01',
    name: 'Irrigation Controller',
    type: 'irrigationSystem',
    status: getRandomStatus(),
    location: 'Central Pump House',
    ip_address: '192.168.1.103',
    firmware_version: '1.1.0',
    last_heartbeat: getRandomRecentDate()
  },
  {
    device_id: 'cameraunit01',
    name: 'Surveillance Camera 1',
    type: 'camera',
    status: getRandomStatus(),
    location: 'Barn Area',
    ip_address: '192.168.1.104',
    firmware_version: '3.2.1',
    last_heartbeat: getRandomRecentDate()
  },
  {
    device_id: 'greenhouse01',
    // Explicitly mark this device as coming soon — it isn't deployed yet
    name: 'Greenhouse Controller (Coming Soon)',
    type: 'climateControl',
    status: 'coming_soon',
    location: 'Main Greenhouse',
    // No live network or firmware for a coming-soon device
    ip_address: null,
    firmware_version: null,
    last_heartbeat: null
  }
];

async function setupTestData() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect using Mongoose
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB using Mongoose');
    
    // Connect using MongoDB driver for collections that don't have models
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB using MongoDB driver');
    
    const db = client.db();
    
    // Define the Device model
    const Device = mongoose.model('Device', deviceSchema);
    
    // Clear existing devices
    console.log('Clearing existing devices...');
    await Device.deleteMany({});
    console.log('Existing devices cleared');
    
    // Create new devices
    console.log('Creating sample devices...');
    
    for (const deviceData of sampleDevices) {
      const device = new Device(deviceData);
      await device.save();
      console.log(`Created device: ${device.name} (${device.device_id})`);
      
      // Create a logs collection for this device
      const logCollectionName = `${device.device_id}_logs`;
      
      // Drop the collection if it exists
      try {
        await db.collection(logCollectionName).drop();
        console.log(`Dropped existing logs collection: ${logCollectionName}`);
      } catch (error) {
        // Collection might not exist, which is fine
        console.log(`No existing logs collection to drop for: ${logCollectionName}`);
      }
      
      // Generate and insert random logs — skip logs for devices that are coming soon
      const logs = device.status === 'coming_soon' ? [] : generateRandomLogs(device.device_id, 20);
      if (logs.length > 0) {
        await db.collection(logCollectionName).insertMany(logs);
        console.log(`Created ${logs.length} logs for ${device.device_id}`);
      } else if (device.status === 'coming_soon') {
        console.log(`Skipping log generation for coming-soon device: ${device.device_id}`);
      }
    }
    
    console.log('Sample data setup complete!');
    
    // Close connections
    await mongoose.disconnect();
    await client.close();
    console.log('MongoDB connections closed');
    
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
}

// Run the setup
setupTestData();