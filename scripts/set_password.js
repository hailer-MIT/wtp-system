/*
Usage: node scripts/set_password.js <Role> <phoneNumber> <newPassword>
Example: node scripts/set_password.js SuperAdmin 911223344 myNewPass123

Role options (case-insensitive): SuperAdmin, Reception, Manager, Designer,
WorkShop, WorkShope, Cashier, Casher, Accountant, InventoryClerk

This script reads MONGODB_CONNECTION_URL from .env, connects with mongoose,
hashes the password with bcrypt and updates the matching document by phoneNumber.
*/
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const roleMap = {
  superadmin: 'superadmins',
  superAdmin: 'superadmins',
  reception: 'receptions',
  manager: 'managers',
  designer: 'designers',
  workshop: 'workshops',
  workshope: 'workshopes',
  cashier: 'cashiers',
  casher: 'cashers',
  accountant: 'accountants',
  inventoryclerk: 'inventoryclerks',
};

async function main() {
  const [,, roleArg, phoneArg, newPassword] = process.argv;
  if (!roleArg || !phoneArg || !newPassword) {
    console.error('Usage: node scripts/set_password.js <Role> <phoneNumber> <newPassword>');
    process.exit(1);
  }

  const roleKey = roleArg.toLowerCase();
  const coll = roleMap[roleKey];
  if (!coll) {
    console.error('Unknown role. Supported:', Object.keys(roleMap).join(', '));
    process.exit(1);
  }

  const mongoUrl = process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017/mgt';
  await mongoose.connect(mongoUrl, { enableUtf8Validation: true });
  console.log('Connected to MongoDB');

  const phoneNumber = Number(phoneArg);
  const hash = await bcrypt.hash(newPassword, 10);

  const res = await mongoose.connection.collection(coll).updateOne(
    { phoneNumber },
    { $set: { password: hash } }
  );

  if (res.matchedCount === 0) {
    console.log(`No document found in collection '${coll}' with phoneNumber=${phoneNumber}`);
  } else {
    console.log(`Password updated for ${phoneNumber} in collection '${coll}'`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
