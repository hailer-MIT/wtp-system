// Script to check rejected orders status
const mongoose = require('mongoose');
const Order = require('../model/mongodb/order');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

async function checkRejectedOrders() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB\n');

        // Find all orders with assignmentStatus "Rejected"
        const rejectedOrders = await Order.find({
            assignmentStatus: "Rejected"
        }).select('orderNumber customerName assignmentStatus progress rejectionReason rejectedDate');

        console.log(`Found ${rejectedOrders.length} rejected orders:\n`);

        rejectedOrders.forEach((order, index) => {
            console.log(`${index + 1}. Order #${order.orderNumber || order._id}`);
            console.log(`   Customer: ${order.customerName}`);
            console.log(`   Assignment Status: ${order.assignmentStatus}`);
            console.log(`   Progress: ${order.progress}`);
            console.log(`   Rejection Reason: ${order.rejectionReason || 'N/A'}`);
            console.log(`   Rejected Date: ${order.rejectedDate ? new Date(order.rejectedDate).toLocaleString() : 'N/A'}`);
            console.log('');
        });

        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkRejectedOrders();
