// scripts/migrate-attendance-dates.js
// Run: node scripts/migrate-attendance-dates.js
// This script converts all attendance.date fields from Date to string (YYYY-MM-DD)

const mongoose = require('mongoose');

const uri = process.env.MONGODB_CLOUD_CLUSTER_URI;
if (!uri) throw new Error('Please set MONGODB_CLOUD_CLUSTER_URI in your environment');

const attendanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: {}, // allow any type
  state: { type: String, enum: ['present', 'absent'], required: true },
});

const Attendance = mongoose.model('Attendance', attendanceSchema, 'attendances');

(async () => {
  await mongoose.connect(uri);
  const records = await Attendance.find({ date: { $type: 'date' } });
  console.log(`Found ${records.length} records with Date-type date field.`);
  for (const rec of records) {
    const d = rec.date;
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    rec.date = dateStr;
    await rec.save();
    console.log(`Updated record ${rec._id}: date -> ${dateStr}`);
  }
  await mongoose.disconnect();
  console.log('Migration complete.');
})();
