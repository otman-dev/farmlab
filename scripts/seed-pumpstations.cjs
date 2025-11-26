// Script to seed initial pump station data into MongoDB
// Run with: node scripts/seed-pumpstations.cjs

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://rasmus:wordpiss@adro.ddns.net:27017/farmLab?authSource=admin';

async function seedPumpStations() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('pumpstations');
    
    // Sample pump station data
    const pumpStations = [
      {
        device_id: 'pumpstation01',
        name: 'Main Irrigation Pump Station',
        bridge: 'rasp_01',
        firmware_version: '1.0.7',
        automation_enabled: false,
        pumps: [
          {
            pump_id: 'pump1',
            pin: 26,
            state: false,
            on_time_ms: 1000,
            off_time_ms: 10000
          }
        ],
        last_seen: new Date(),
        uptime_s: 0,
        wifi: false,
        mqtt: false,
        status: 'unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        device_id: 'pumpstation02',
        name: 'Secondary Pump Station',
        bridge: 'rasp_01',
        firmware_version: '1.0.0',
        automation_enabled: false,
        pumps: [
          {
            pump_id: 'pump1',
            pin: 26,
            state: false,
            on_time_ms: 5000,
            off_time_ms: 30000
          }
        ],
        last_seen: new Date(),
        uptime_s: 0,
        wifi: false,
        mqtt: false,
        status: 'unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Clear existing data (optional)
    console.log('Clearing existing pump stations...');
    await collection.deleteMany({});
    
    // Insert pump stations
    console.log('Inserting pump stations...');
    const result = await collection.insertMany(pumpStations);
    console.log(`✅ Successfully inserted ${result.insertedCount} pump stations`);
    
    // Display inserted data
    const inserted = await collection.find({}).toArray();
    console.log('\nInserted Pump Stations:');
    inserted.forEach(station => {
      console.log(`  - ${station.device_id}: ${station.name}`);
      console.log(`    Pumps: ${station.pumps.length}`);
      station.pumps.forEach(pump => {
        console.log(`      * ${pump.pump_id}: ON=${pump.on_time_ms}ms, OFF=${pump.off_time_ms}ms`);
      });
    });
    
  } catch (error) {
    console.error('Error seeding pump stations:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seed function
seedPumpStations();
