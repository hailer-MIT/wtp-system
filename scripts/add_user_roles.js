/*
Usage: node scripts/add_user_roles.js <phoneNumber> [--yes]

This script will ensure a user with the given phoneNumber exists in each
role collection. If the user already exists in a collection, its password
will be updated to the role name. If it does not exist, a minimal document
will be inserted. The actual DB changes are applied only if you pass
the `--yes` flag; otherwise the script prints the planned operations.

Example:
  node scripts/add_user_roles.js 912223278 --yes

Security note: passwords are set to the role name (e.g. 'superadmin'). Use
only for local development.
*/
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

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
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/add_user_roles.js <phoneNumber> [--yes]');
    process.exit(1);
  }
  const phone = Number(args[0]);
  if (!phone) {
    console.error('Invalid phone number:', args[0]);
    process.exit(1);
  }
  const doApply = args.includes('--yes') || args.includes('-y');

  const mongoUrl = process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017/mgt';
  await mongoose.connect(mongoUrl, { enableUtf8Validation: true });
  const db = mongoose.connection.db;

  // find any superadmin to use as addedBy when required
  const superAdminDoc = await db.collection('superadmins').findOne({ phoneNumber: phone })
    || await db.collection('superadmins').findOne({});
  if (!superAdminDoc) {
    console.error('No superadmin found — please create a superadmin first.');
    await mongoose.disconnect();
    process.exit(1);
  }
  const superAdminId = superAdminDoc._id;

  for (const [coll, rolePwd] of Object.entries(mapping)) {
    const exists = await db.listCollections({ name: coll }).hasNext();
    if (!exists) {
      console.log(`collection '${coll}' does not exist — skipping`);
      continue;
    }

    const found = await db.collection(coll).findOne({ phoneNumber: phone });
    if (found) {
      console.log(`Will update password for phone ${phone} in '${coll}' to '${rolePwd}'`);
      if (doApply) {
        const hash = await bcrypt.hash(rolePwd, 10);
        const r = await db.collection(coll).updateOne({ _id: found._id }, { $set: { password: hash } });
        console.log(`  updated ${r.modifiedCount} document(s)`);
      }
    } else {
      console.log(`Will insert phone ${phone} into '${coll}' with password='${rolePwd}'`);
      if (doApply) {
        const hash = await bcrypt.hash(rolePwd, 10);
        const doc = { phoneNumber: phone, password: hash };
        // common fields some models expect
        doc.deactivated = false;
        // set addedBy if collection likely requires it
        if (['workshops','workshopes','designers','receptions','managers','inventoryclerks','cashiers','cashers','accountants'].includes(coll)) {
          doc.addedBy = ObjectId(superAdminId);
        }
        try {
          const r = await db.collection(coll).insertOne(doc);
          console.log(`  inserted _id=${r.insertedId}`);
        } catch (err) {
          console.error(`  failed to insert into ${coll}:`, err.message);
        }
      }
    }
  }

  await mongoose.disconnect();
  if (!doApply) console.log('\nNo changes applied. Rerun with --yes to apply.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
