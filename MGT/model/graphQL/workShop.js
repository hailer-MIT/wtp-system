const { login, forgotPassword, sendOtp } = require('../../util/functions');
const workShop = require('../mongodb/workShop')
const Order = require('../mongodb/order')



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

        async WorkShopStat(_,args,ctx){
            var date=new Date();
            const array = []
            const workShops = await workShop.find()
            for(var w of workShops){
                console.log(w._id)
                const lastMonth = new Date(date.getFullYear(), date.getMonth() -1, 1)
            const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1)
            const lastMonthOrders = await Order.countDocuments({orderedDate:{$gt: lastMonth, $lt: thisMonth}, workShop: w._id}) 
            const thisMonthOrders = await Order.countDocuments({orderedDate:{$gt: thisMonth},workShop: w._id}) 
            const pendingOrders = await Order.countDocuments({progress:{$in: ["WaitingForPrint", "Printing"]},workShop: w._id}) 
            const completedOrders = await Order.countDocuments({orderedDate: { $gt: thisMonth }, progress:{$in: ["Completed", "Delivered"]},workShop: w._id}) 
            const lateOrders = await Order.countDocuments({progress:{$in: ["WaitingForPrint", "Printing"]},deliveryDate:{$lt: Date.now()},workShop: w._id})
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
            const orders = await Order.find({ workShop: ctx.workShopId, progress: { $in: args.options } }).sort({ deliveryDate: -1 }).
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
            if(o.services)
            o.services.forEach((s)=>{
                console.log(s)
                s.completedFiles = s.completedFilesId
            })
        });
            return (orders)
        },
        async AllWorkshops(_,args,ctx) {
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
        async WorkShopChangeOrderStatus(_,args,ctx){
            if(args.progress == "Completed"){
                await Order.findByIdAndUpdate(args.orderId,{"progress": "Completed"})
                return true
            }
            if(args.progress == "Printing"){
                await Order.findByIdAndUpdate(args.orderId,{"progress": "Printing"})
                return true
            }
            return false
        },
    }
}