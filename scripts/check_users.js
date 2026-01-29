/*
Usage: node scripts/check_users.js

This script checks if the specified users exist in the database by phone number.
*/

require('dotenv').config();
const mongoose = require('mongoose');

// User data to check
const usersToCheck = [
  { role: "SuperAdmin", identifier: "Abera Dechasa", phoneNumber: 912223278, password: "superadmin" },
  { role: "Reception", identifier: "Birhan Dawit", phoneNumber: 996965252, password: "reception" },
  { role: "Manager", identifier: "Arega Abate", phoneNumber: 911960517, password: "manager" },
  { role: "Designer", identifier: "Robel Fulas", phoneNumber: 920088859, password: "designer" },
  { role: "WorkShop", identifier: "Natineal Fekadu", phoneNumber: 968111137, password: "workshop" },
  { role: "WorkShope", identifier: "Kelbesa Decesa", phoneNumber: 962073747, password: "workshope" },
  { role: "Cashier", identifier: "Seblewengel", phoneNumber: 913455099, password: "cashier" },
  { role: "Casher", identifier: "Seblewengel", phoneNumber: 913455099, password: "casher" },
  { role: "Accountant", identifier: "Wubayehu Zewdu", phoneNumber: 911923902, password: "accountant" },
  { role: "InventoryClerk", identifier: "Gebayo Meskele", phoneNumber: 920401876, password: "inventoryclerk" }
];

// Map roles to collection names
const roleToCollection = {
  "SuperAdmin": "superadmins",
  "Reception": "receptions",
  "Manager": "managers",
  "Designer": "designers",
  "WorkShop": "workshops",
  "WorkShope": "workshopes",
  "Cashier": "cashiers",
  "Casher": "cashers",
  "Accountant": "accountants",
  "InventoryClerk": "inventoryclerks"
};

async function main() {
  const mongoUrl = process.env.MONGODB_CONNECTION_URL || 'mongodb://localhost:27017/mgt';
  await mongoose.connect(mongoUrl, { enableUtf8Validation: true });
  const db = mongoose.connection.db;

  console.log('Checking users in database...\n');
  console.log('='.repeat(80));

  let foundCount = 0;
  let notFoundCount = 0;

  for (const user of usersToCheck) {
    const collectionName = roleToCollection[user.role];
    if (!collectionName) {
      console.log(`\n❌ UNKNOWN ROLE: ${user.role} - No collection mapping found`);
      notFoundCount++;
      continue;
    }

    try {
      const exists = await db.listCollections({ name: collectionName }).hasNext();
      if (!exists) {
        console.log(`\n⚠️  COLLECTION MISSING: ${user.role} (${collectionName})`);
        console.log(`   User: ${user.identifier} (Phone: ${user.phoneNumber})`);
        notFoundCount++;
        continue;
      }

      const found = await db.collection(collectionName).findOne({ 
        phoneNumber: user.phoneNumber 
      });

      if (found) {
        console.log(`\n✅ FOUND: ${user.role}`);
        console.log(`   Name: ${found.fullName || found.name || 'N/A'}`);
        console.log(`   Phone: ${found.phoneNumber}`);
        console.log(`   Expected: ${user.identifier} (${user.phoneNumber})`);
        if (found.fullName && found.fullName !== user.identifier) {
          console.log(`   ⚠️  Name mismatch: DB has "${found.fullName}" but expected "${user.identifier}"`);
        }
        foundCount++;
      } else {
        console.log(`\n❌ NOT FOUND: ${user.role}`);
        console.log(`   Expected: ${user.identifier} (Phone: ${user.phoneNumber})`);
        notFoundCount++;
      }
    } catch (err) {
      console.log(`\n❌ ERROR checking ${user.role}: ${err.message}`);
      notFoundCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nSUMMARY:`);
  console.log(`   Found: ${foundCount}/${usersToCheck.length}`);
  console.log(`   Not Found: ${notFoundCount}/${usersToCheck.length}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

