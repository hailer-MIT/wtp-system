/*
Usage: node scripts/check_users_from_backup.js

This script reads the backup BSON files to check if users exist.
Requires: npm install bson (if not already installed)
*/

const fs = require('fs');
const path = require('path');
const { BSON } = require('bson');

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

// Map roles to collection names and backup file paths
const roleToCollection = {
  "SuperAdmin": { collection: "superadmins", file: "BACKUP/dump/test/superadmins.bson" },
  "Reception": { collection: "receptions", file: "BACKUP/dump/test/receptions.bson" },
  "Manager": { collection: "managers", file: "BACKUP/dump/test/managers.bson" },
  "Designer": { collection: "designers", file: "BACKUP/dump/test/designers.bson" },
  "WorkShop": { collection: "workshops", file: "BACKUP/dump/test/workshops.bson" },
  "WorkShope": { collection: "workshopes", file: "BACKUP/dump/test/workshopes.bson" },
  "Cashier": { collection: "cashiers", file: "BACKUP/dump/test/cashiers.bson" },
  "Casher": { collection: "cashers", file: "BACKUP/dump/test/cashers.bson" },
  "Accountant": { collection: "accountants", file: "BACKUP/dump/test/accountants.bson" },
  "InventoryClerk": { collection: "inventoryclerks", file: "BACKUP/dump/test/inventoryclerks.bson" }
};

function readBSONFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath);
    const documents = [];
    let offset = 0;
    
    while (offset < data.length) {
      // BSON documents are prefixed with their length (4 bytes)
      if (offset + 4 > data.length) break;
      const docLength = data.readInt32LE(offset);
      if (docLength < 5 || offset + docLength > data.length) break;
      
      const docData = data.slice(offset, offset + docLength);
      try {
        const doc = BSON.deserialize(docData);
        documents.push(doc);
      } catch (e) {
        // Skip invalid documents
        break;
      }
      offset += docLength;
    }
    return documents;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('Checking users in backup files...\n');
  console.log('='.repeat(80));

  let foundCount = 0;
  let notFoundCount = 0;
  let fileNotFoundCount = 0;

  for (const user of usersToCheck) {
    const collectionInfo = roleToCollection[user.role];
    if (!collectionInfo) {
      console.log(`\n❌ UNKNOWN ROLE: ${user.role} - No collection mapping found`);
      notFoundCount++;
      continue;
    }

    const filePath = path.join(__dirname, '..', collectionInfo.file);
    console.log(`\nChecking ${user.role} (${collectionInfo.collection})...`);
    console.log(`   File: ${collectionInfo.file}`);

    const documents = readBSONFile(filePath);
    
    if (documents === null) {
      console.log(`   ⚠️  Backup file not found or cannot be read`);
      fileNotFoundCount++;
      notFoundCount++;
      continue;
    }

    if (documents.length === 0) {
      console.log(`   ⚠️  Backup file is empty`);
      notFoundCount++;
      continue;
    }

    console.log(`   Found ${documents.length} document(s) in backup`);

    // Search for user by phone number
    const found = documents.find(doc => 
      doc.phoneNumber === user.phoneNumber || 
      doc.phoneNumber === Number(user.phoneNumber)
    );

    if (found) {
      console.log(`   ✅ FOUND: ${user.role}`);
      console.log(`      Name: ${found.fullName || found.name || 'N/A'}`);
      console.log(`      Phone: ${found.phoneNumber}`);
      console.log(`      Expected: ${user.identifier} (${user.phoneNumber})`);
      if (found.fullName && found.fullName !== user.identifier) {
        console.log(`      ⚠️  Name mismatch: Backup has "${found.fullName}" but expected "${user.identifier}"`);
      }
      foundCount++;
    } else {
      console.log(`   ❌ NOT FOUND: ${user.role}`);
      console.log(`      Expected: ${user.identifier} (Phone: ${user.phoneNumber})`);
      console.log(`      Available phone numbers in backup: ${documents.map(d => d.phoneNumber).join(', ')}`);
      notFoundCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\nSUMMARY:`);
  console.log(`   Found: ${foundCount}/${usersToCheck.length}`);
  console.log(`   Not Found: ${notFoundCount}/${usersToCheck.length}`);
  if (fileNotFoundCount > 0) {
    console.log(`   Files Not Found: ${fileNotFoundCount}`);
  }
  console.log(`\nNote: This checks backup files, not the live database.`);
  console.log(`      To check the live database, ensure MongoDB is running and use: node scripts/check_users.js`);
}

main().catch(err => {
  console.error('Error:', err);
  if (err.message.includes('bson')) {
    console.error('\nPlease install bson package: npm install bson');
  }
  process.exit(1);
});

