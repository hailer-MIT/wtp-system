const { login, forgotPassword, sendOtp } = require('../../util/functions');
const workShop = require('../mongodb/workShop')
const Order = require('../mongodb/order')
const inventory = require("../mongodb/Inventory");
const inventoryFlow = require("../mongodb/inventoryFlow");
const pubsub = require("./pubsub");

module.exports.typeDef = `
    type WorkShop {
        id: ID!
        fullName: String!
        phoneNumber: Int!
        password: String
        deactivated: Boolean!
        otpId: ID
        otp: Otp
        addedBy: ID!
        token: String
        photo: String
    }

    extend type Query {
        WorkShopMyStat: Statistics!
        WorkShopStat: [DesignersStatistic]!
        WorkShopMyOrder(options: [progress]!): [Order]!
        AllWorkshops: [user]!
    }

    extend type Mutation {
        WorkShopLogin(phoneNumber: Int!, password: String!): Reception!  
        WorkShopForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): Reception!  
        WorkShopSendOtp(phoneNumber: Int!): Boolean!  
        WorkShopChangeOrderStatus(orderId:ID! progress: progress!): Boolean!  
        UpdateWorkShopProfile(fullName: String, phoneNumber: Int, photo: String): WorkShop!
    }
`

module.exports.resolvers = {
    Query: {
        async WorkShopMyStat(_, args, ctx) {
            const id = ctx.workShopId
            var date = new Date();
            const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
            const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1)
            const lastMonthOrders = await Order.countDocuments({ orderedDate: { $gt: lastMonth, $lt: thisMonth }, workShop: id })
            const thisMonthOrders = await Order.countDocuments({ orderedDate: { $gt: thisMonth }, workShop: id })
            const pendingOrders = await Order.countDocuments({ progress: { $in: ["WaitingForPrint", "Printing"] }, workShop: id })
            const completedOrders = await Order.countDocuments({ orderedDate: { $gt: thisMonth }, progress: { $in: ["Completed", "Delivered"] }, workShop: id })
            const lateOrders = await Order.countDocuments({ progress: { $in: ["WaitingForPrint", "Printing"] }, deliveryDate: { $lt: Date.now() }, workShop: id })
            console.log("workShop stats")
            return {
                lastMonthOrders: lastMonthOrders,
                thisMonthOrders: thisMonthOrders,
                pendingOrders: pendingOrders,
                completedOrders: completedOrders,
                lateOrders: lateOrders
            }
        },

        async WorkShopStat(_, args, ctx) {
            var date = new Date();
            const array = []
            const workShops = await workShop.find()
            for (var w of workShops) {
                console.log(w._id)
                const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
                const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1)
                const lastMonthOrders = await Order.countDocuments({ orderedDate: { $gt: lastMonth, $lt: thisMonth }, workShop: w._id })
                const thisMonthOrders = await Order.countDocuments({ orderedDate: { $gt: thisMonth }, workShop: w._id })
                const pendingOrders = await Order.countDocuments({ progress: { $in: ["WaitingForPrint", "Printing"] }, workShop: w._id })
                const completedOrders = await Order.countDocuments({ orderedDate: { $gt: thisMonth }, progress: { $in: ["Completed", "Delivered"] }, workShop: w._id })
                const lateOrders = await Order.countDocuments({ progress: { $in: ["WaitingForPrint", "Printing"] }, deliveryDate: { $lt: Date.now() }, workShop: w._id })
                console.log("stats")
                array.push({
                    lastMonthOrders: lastMonthOrders,
                    thisMonthOrders: thisMonthOrders,
                    pendingOrders: pendingOrders,
                    completedOrders: completedOrders,
                    lateOrders: lateOrders,
                    name: w.fullName
                })
            }

            return array

        },

        async WorkShopMyOrder(_, args, ctx) {
            const orders = await Order.find({
                workShop: ctx.workShopId,
                $or: [
                    { progress: { $in: args.options } },
                    { progress: null, assignmentStatus: "Pending" }
                ]
            }).sort({ orderedDate: -1 }).
                populate('files').populate({
                    path: 'services',
                    populate: {
                        path: 'completedFilesId',
                        model: 'Files'
                    }
                })
            orders.forEach((o) => {
                o.Files = o.files
                o.files = null
                if (o.services)
                    o.services.forEach((s) => {
                        console.log(s)
                        s.completedFiles = s.completedFilesId
                    })
            });
            return (orders)
        },
        async AllWorkshops(_, args, ctx) {
            var WorkShop = await workShop.find({ deactivated: false })
            return WorkShop
        }
    },

    Mutation: {
        async WorkShopLogin(_, args, ctx) {
            return await login(args, workShop, process.env.workShop_Secret)
        },
        async WorkShopForgotPassword(_, args, ctx) {
            return await forgotPassword(args, workShop, process.env.workShop_Secret)
        },

        async WorkShopSendOtp(_, args, ctx) {
            return await sendOtp(args, workShop)
        },
        async WorkShopChangeOrderStatus(_, args, ctx) {
            if (args.progress == "Completed") {
                await Order.findByIdAndUpdate(args.orderId, { "progress": "Completed", completedDate: Date.now() })
                return true
            }
            if (args.progress == "Printing") {
                const order = await Order.findById(args.orderId).populate({
                    path: 'services.service',
                    model: 'Services',
                    populate: {
                        path: 'inventoryItems.inventoryItem',
                        model: 'Inventorys'
                    }
                });

                if (order && !order.inventoryDeducted) {
                    let deductionHappened = false;
                    for (const serviceObj of order.services) {
                        const serviceDef = serviceObj.service;
                        if (serviceDef && serviceDef.inventoryItems && serviceDef.inventoryItems.length > 0) {
                            for (const mapping of serviceDef.inventoryItems) {
                                const qtyToDeduct = serviceObj.quantity * mapping.quantityPerUnit;
                                const invItem = mapping.inventoryItem;

                                if (invItem) {
                                    // Deduct
                                    const updatedInv = await inventory.findByIdAndUpdate(invItem._id, { $inc: { quantity: -qtyToDeduct } }, { new: true });

                                    // Log Flow
                                    await new inventoryFlow({
                                        inventoryProductId: invItem._id,
                                        operation: "SUBTRACT",
                                        quantity: qtyToDeduct,
                                        inventoryClerkId: ctx.workShopId,
                                        remark: `Auto-deduction for Order #${order.orderNumber}`
                                    }).save();

                                    // Alert
                                    if (updatedInv.quantity <= updatedInv.minQuantity) {
                                        console.log(`LOW STOCK ALERT: Item ${updatedInv.itemName} is low!`);
                                        pubsub.publish("LOW_STOCK", { lowStockAlert: updatedInv });
                                    }
                                    deductionHappened = true;
                                }
                            }
                        }
                    }
                    await Order.findByIdAndUpdate(args.orderId, { "progress": "Printing", inventoryDeducted: true, printingDate: Date.now() });
                } else {
                    await Order.findByIdAndUpdate(args.orderId, { "progress": "Printing", printingDate: Date.now() })
                }
                return true
            }
            return false
        },
        async UpdateWorkShopProfile(_, args, ctx) {
            const updateData = {};
            if (args.fullName) updateData.fullName = args.fullName;
            if (args.phoneNumber) updateData.phoneNumber = args.phoneNumber;
            if (args.photo) updateData.photo = args.photo;

            const updated = await workShop.findByIdAndUpdate(
                ctx.workShopId,
                updateData,
                { new: true }
            );
            return { id: updated.id, ...updated._doc };
        },
    }
}