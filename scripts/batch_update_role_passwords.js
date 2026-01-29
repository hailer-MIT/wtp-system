require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

(async () => {
  const mongo = process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017/mgt';
  await mongoose.connect(mongo, { enableUtf8Validation: true });

  const roles = [
    { role: 'SuperAdmin', coll: 'superadmins', password: 'superadmin' },
    { role: 'Reception', coll: 'receptions', password: 'reception' },
    { role: 'Manager', coll: 'managers', password: 'manager' },
    { role: 'Designer', coll: 'designers', password: 'designer' },
    { role: 'WorkShop', coll: 'workshops', password: 'workshop' },
    { role: 'WorkShope', coll: 'workshopes', password: 'workshope' },
    { role: 'Cashier', coll: 'cashiers', password: 'cashier' },
    { role: 'Casher', coll: 'cashiers', password: 'casher' },
    { role: 'Accountant', coll: 'accountants', password: 'accountant' },
    { role: 'InventoryClerk', coll: 'inventoryclerks', password: 'inventoryclerk' }
  ];

  const results = [];

  for (const r of roles) {
    try {
      const coll = mongoose.connection.collection(r.coll);
      const doc = await coll.findOne({});
      if (!doc) {
        console.log(`No document found in collection '${r.coll}'`);
        continue;
      }
      const plain = r.password;
      const hash = await bcrypt.hash(plain, 10);
      await coll.updateOne({ _id: doc._id }, { $set: { password: hash } });

      const identifier = doc.userName || doc.username || doc.name || doc.fullName || doc.phoneNumber || doc.email || doc._id;
      results.push({ role: r.role, identifier: String(identifier), phoneNumber: doc.phoneNumber || null, password: plain });
      console.log(`Updated ${r.coll}: ${String(identifier)} (password set to '${plain}')`);
    } catch (e) {
      console.error(`Error processing ${r.coll}:`, e.message || e);
    }
  }

  console.log('\nSummary (JSON):');
  console.log(JSON.stringify(results, null, 2));

  await mongoose.disconnect();
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
