/**
 * Create all initial users for production deployment
 * Run with: node scripts/create-initial-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import models
const SuperAdmin = require('../model/mongodb/superAdmin');
const Reception = require('../model/mongodb/reception');
const Manager = require('../model/mongodb/manager');
const Designer = require('../model/mongodb/designer');
const WorkShop = require('../model/mongodb/workShop');
const Cashier = require('../model/mongodb/cashier');
const Accountant = require('../model/mongodb/accountant');
const InventoryClerk = require('../model/mongodb/inventoryClerk');

const users = [
    {
        role: "SuperAdmin",
        model: SuperAdmin,
        fullName: "Abera Dechasa",
        phoneNumber: 912223278,
        password: "superadmin"
    },
    {
        role: "Reception",
        model: Reception,
        fullName: "Birhan Dawit",
        phoneNumber: 996965252,
        password: "reception"
    },
    {
        role: "Manager",
        model: Manager,
        fullName: "Arega Abate",
        phoneNumber: 911960517,
        password: "manager"
    },
    {
        role: "Designer",
        model: Designer,
        fullName: "Robel Fulas",
        phoneNumber: 920088859,
        password: "designer"
    },
    {
        role: "WorkShop",
        model: WorkShop,
        fullName: "Natineal Fekadu",
        phoneNumber: 968111137,
        password: "workshop"
    },
    {
        role: "WorkShop",
        model: WorkShop,
        fullName: "Kelbesa Decesa",
        phoneNumber: 962073747,
        password: "workshope"
    },
    {
        role: "Cashier",
        model: Cashier,
        fullName: "Seblewengel",
        phoneNumber: 913455099,
        password: "cashier"
    },
    {
        role: "Accountant",
        model: Accountant,
        fullName: "Wubayehu Zewdu",
        phoneNumber: 911923902,
        password: "accountant"
    },
    {
        role: "InventoryClerk",
        model: InventoryClerk,
        fullName: "Gebayo Meskele",
        phoneNumber: 920401876,
        password: "inventoryclerk"
    }
];

async function createUsers() {
    try {
        // Connect to MongoDB
        const mongoUrl = process.env.MONGODB_CONNECTION_URL;
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUrl);
        console.log('✅ Connected to MongoDB\n');

        let superAdminId = null;

        for (const user of users) {
            try {
                // Check if user already exists
                const existing = await user.model.findOne({ phoneNumber: user.phoneNumber });

                if (existing) {
                    console.log(`⚠️  ${user.role} ${user.fullName} (${user.phoneNumber}) already exists - skipping`);
                    if (user.role === 'SuperAdmin' && !superAdminId) {
                        superAdminId = existing._id;
                    }
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(user.password, 10);

                // Create user document
                const userData = {
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    password: hashedPassword,
                    deactivated: false
                };

                // Add addedBy for non-SuperAdmin roles
                if (user.role !== 'SuperAdmin' && superAdminId) {
                    userData.addedBy = superAdminId;
                }

                // Create user
                const newUser = new user.model(userData);
                const saved = await newUser.save();

                // Save SuperAdmin ID for other users
                if (user.role === 'SuperAdmin' && !superAdminId) {
                    superAdminId = saved._id;
                }

                console.log(`✅ Created ${user.role}: ${user.fullName} (${user.phoneNumber})`);
            } catch (error) {
                console.error(`❌ Error creating ${user.role} ${user.fullName}:`, error.message);
            }
        }

        console.log('\n✅ All users created successfully!');
        console.log('\nYou can now login with:');
        console.log('- Phone: 912223278, Password: superadmin (SuperAdmin)');
        console.log('- Phone: 996965252, Password: reception (Reception)');
        console.log('- Phone: 911960517, Password: manager (Manager)');
        console.log('- And others...\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

createUsers();
