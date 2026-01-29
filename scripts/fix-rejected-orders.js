// One-time script to fix existing rejected orders
// This updates all orders with assignmentStatus="Rejected" to also have progress="Rejected"

const mongoose = require('mongoose');
const Order = require('../model/mongodb/order');

// MongoDB connection string - update this to match your configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

async function fixRejectedOrders() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Find all orders where assignmentStatus is "Rejected" but progress is not "Rejected"
        const result = await Order.updateMany(
            {
                assignmentStatus: "Rejected",
                progress: { $ne: "Rejected" }
            },
            {
                $set: { progress: "Rejected" }
            }
        );

        console.log(`✅ Fixed ${result.modifiedCount} rejected orders`);
        console.log(`Total rejected orders found: ${result.matchedCount}`);

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('❌ Error fixing rejected orders:', error);
        process.exit(1);
    }
}

// Run the script
fixRejectedOrders();
