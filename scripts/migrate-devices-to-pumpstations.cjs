#!/usr/bin/env node
/*
  Migration script: migrate pumpstation-like docs from `devices` collection
  into a `pumpstations` collection.

  Usage examples (PowerShell):
    $env:MONGODB_URI = 'mongodb+srv://...'; node .\scripts\migrate-devices-to-pumpstations.cjs
    # or provide DB name as first arg: node .\scripts\migrate-devices-to-pumpstations.cjs mydb

  The script will look for documents in `devices` where `device_id` starts with "pump"/"pumpstation".
*/

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || process.env.MONGODB_CLOUD_URI;
const dbArg = process.argv[2];
const dbName = process.env.MONGODB_DB || dbArg || 'adro';

if (!uri) {
  console.error('Missing MongoDB URI. Set MONGODB_URI env var or provide it in your environment.');
  process.exit(1);
}

function normalizeBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') {
    return ['true', '1', 'yes', 'on'].includes(v.toLowerCase());
  }
  if (typeof v === 'number') return v !== 0;
  return false;
}

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const devices = db.collection('devices');
    const pumpstations = db.collection('pumpstations');

    const cursor = devices.find({ device_id: { $regex: /^pump/i } });
    let count = 0;
    while (await cursor.hasNext()) {
      const d = await cursor.next();

      const pump1State = normalizeBool(d.pump1_state ?? d.pump1state ?? d.pump1);
      const pump2State = normalizeBool(d.pump2_state ?? d.pump2state ?? d.pump2);

      const pump1On = d.pump1On ?? d.pump1_on ?? d.pump1on ?? null;
      const pump1Off = d.pump1Off ?? d.pump1_off ?? d.pump1off ?? null;
      const pump2On = d.pump2On ?? d.pump2_on ?? d.pump2on ?? null;
      const pump2Off = d.pump2Off ?? d.pump2_off ?? d.pump2off ?? null;

      const mapped = {
        device_id: d.device_id,
        bridge: d.bridge ?? null,
        fw: d.fw ?? null,
        last_seen: d.last_seen ? new Date(d.last_seen) : (d.lastSeen ? new Date(d.lastSeen) : null),
        mqtt: d.mqtt === undefined ? true : normalizeBool(d.mqtt),
        automation_enabled: normalizeBool(d.automation ?? d.automation_enabled),
        status: {
          wifi: normalizeBool(d.wifi),
          uptime: d.uptime ?? d.uptime_seconds ?? null,
        },
        datetime_unix: d.datetime_unix ?? null,
        pumps: [
          {
            pump_id: 'pump1',
            pin: d.pump1_pin ?? d.pin1 ?? null,
            state: pump1State,
            on_time_ms: Number(pump1On) || 0,
            off_time_ms: Number(pump1Off) || 0,
          },
          {
            pump_id: 'pump2',
            pin: d.pump2_pin ?? d.pin2 ?? null,
            state: pump2State,
            on_time_ms: Number(pump2On) || 0,
            off_time_ms: Number(pump2Off) || 0,
          }
        ],
      };

      if (mapped.last_seen === null) delete mapped.last_seen;
      if (mapped.datetime_unix === null) delete mapped.datetime_unix;

      await pumpstations.updateOne(
        { device_id: mapped.device_id },
        { $set: mapped },
        { upsert: true }
      );
      count += 1;
      console.log('Upserted pumpstation:', mapped.device_id);
    }
    console.log(`Migration complete. Processed ${count} device(s).`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.close();
  }
}

run();
