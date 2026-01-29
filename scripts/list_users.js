/*
Usage: node scripts/list_users.js

This script reads `MONGODB_CONNECTION_URL` from .env and prints up to 20
documents from each user collection (phoneNumber, email, name when available)
so you can choose a phoneNumber to set a password for with `set_password.js`.
*/
require('dotenv').config();
const mongoose = require('mongoose');

const collections = [
  'superadmins',
  'receptions',
  'managers',
  'designers',
  'workshops',
  'workshopes',
  'cashiers',
  'cashers',
  'accountants',
  'inventoryclerks',
];

async function main() {
  const mongoUrl = process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017/mgt';
  await mongoose.connect(mongoUrl, { enableUtf8Validation: true });
  const db = mongoose.connection.db;
  for (const coll of collections) {
    try {
      const exists = await db.listCollections({ name: coll }).hasNext();
      if (!exists) continue;
      const docs = await db.collection(coll).find({}, { projection: { phoneNumber: 1, email: 1, name: 1 } }).limit(20).toArray();
      console.log(`\n=== ${coll} (showing up to 20) ===`);
      if (!docs.length) {
        console.log('(no documents)');
        continue;
      }
      docs.forEach(d => {
        const parts = [];
        if (d._id) parts.push(`_id:${d._id}`);
        if (d.phoneNumber) parts.push(`phone:${d.phoneNumber}`);
        if (d.email) parts.push(`email:${d.email}`);
        if (d.name) parts.push(`name:${d.name}`);
        console.log(parts.join(' | '));
      });
    } catch (err) {
      console.error(`Error reading ${coll}:`, err.message);
    }
  }
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
