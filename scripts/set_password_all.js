/*
Usage: node scripts/set_password_all.js --yes

This script sets each user collection's `password` field to a bcrypt hash
of the collection's role name (e.g. superadmins -> "superadmin"). It will
only perform updates if you pass the `--yes` flag. Without `--yes` it prints
what it would change.

Run from project root:
  node scripts/set_password_all.js --yes
*/
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mapping = {
  superadmins: 'superadmin',
  receptions: 'reception',
  managers: 'manager',
  designers: 'designer',
  workshops: 'workshop',
  workshopes: 'workshop',
  cashiers: 'cashier',
  cashers: 'cashier',
  accountants: 'accountant',
  inventoryclerks: 'inventoryclerk',
};

async function main() {
  const confirm = process.argv.includes('--yes') || process.argv.includes('-y');
  const mongoUrl = process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017/mgt';
  await mongoose.connect(mongoUrl, { enableUtf8Validation: true });
  const db = mongoose.connection.db;

  for (const [coll, pwd] of Object.entries(mapping)) {
    const exists = await db.listCollections({ name: coll }).hasNext();
    if (!exists) {
      console.log(`collection '${coll}' does not exist — skipping`);
      continue;
    }
    const count = await db.collection(coll).countDocuments();
    if (count === 0) {
      console.log(`collection '${coll}' has 0 documents — skipping`);
      continue;
    }
    console.log(`collection '${coll}': ${count} documents -> set password='${pwd}'`);
    if (confirm) {
      const hash = await bcrypt.hash(pwd, 10);
      const res = await db.collection(coll).updateMany({}, { $set: { password: hash } });
      console.log(`  updated ${res.modifiedCount} documents`);
    }
  }

  await mongoose.disconnect();
  if (!confirm) {
    console.log('\nNo changes made. Rerun with --yes to apply the updates.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
