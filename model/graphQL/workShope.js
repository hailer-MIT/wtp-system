const { login, forgotPassword, sendOtp } = require('../../util/functions');
const workShope = require('../mongodb/workShope')
const Order = require('../mongodb/order')



module.exports.typeDef = `
    type WorkShope {
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
        WorkShopeMyStat: Statistics!
        WorkShopeStat: [DesignersStatistic]!
        WorkShopeMyOrder(options: [progress]!): [Order]!
    }

    extend type Mutation {
        WorkShopeLogin(phoneNumber: Int!, password: String!): Casher!  
        WorkShopeForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): Casher!  
        WorkShopeSendOtp(phoneNumber: Int!): Boolean!  
        WorkShopeChangeOrderStatus(orderId:ID! progress: progress!): Boolean!  
    }
`

module.exports.resolvers = {
    Query: {
        async WorkShopeMyStat(_, args, ctx) {
            const id = ctx.workShopeId
            var date = new Date();
            const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
            const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1)
            const lastMonthOrders = await Order.countDocuments({ orderedDate: { $gt: lastMonth, $lt: thisMonth }, workShope: id })
            const thisMonthOrders = await Order.countDocuments({ orderedDate: { $gt: thisMonth }, workShope: id })
            const pendingOrders = await Order.countDocuments({ progress: { $in: ["WaitingForPrint", "Printing"] }, workShope: id })
            const completedOrders = await Order.countDocuments({ orderedDate: { $gt: thisMonth }, progress: { $in: ["Completed", "Delivered"] }, workShope: id })
            const lateOrders = await Order.countDocuments({ progress: { $in: ["WaitingForPrint", "Printing"] }, deliveryDate: { $lt: Date.now() }, workShope: id })
            console.log("workShope stats")
            return {
                lastMonthOrders: lastMonthOrders,
                thisMonthOrders: thisMonthOrders,
                pendingOrders: pendingOrders,
                completedOrders: completedOrders,
                lateOrders: lateOrders
            }
        },

        async WorkShopeStat(_,args,ctx){
            var date=new Date();
            const array = []
            const workShops = await workShope.find()
            for(var w of workShops){
                console.log(w._id)
                const lastMonth = new Date(date.getFullYear(), date.getMonth() -1, 1)
            const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1)
            const lastMonthOrders = await Order.countDocuments({orderedDate:{$gt: lastMonth, $lt: thisMonth}, workShope: w._id}) 
            const thisMonthOrders = await Order.countDocuments({orderedDate:{$gt: thisMonth},workShope: w._id}) 
            const pendingOrders = await Order.countDocuments({progress:{$in: ["WaitingForPrint", "Printing"]},workShope: w._id}) 
            const completedOrders = await Order.countDocuments({orderedDate: { $gt: thisMonth }, progress:{$in: ["Completed", "Delivered"]},workShope: w._id}) 
            const lateOrders = await Order.countDocuments({progress:{$in: ["WaitingForPrint", "Printing"]},deliveryDate:{$lt: Date.now()},workShope: w._id})
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

        async WorkShopeMyOrder(_, args, ctx) {
            const orders = await Order.find({ workShope: ctx.workShopeId, progress: { $in: args.options } }).sort({ deliveryDate: -1 }).
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
        }
    },

    Mutation: {
        async WorkShopeLogin(_, args, ctx) {
            return await login(args, workShope, process.env.workShope_Secret)
        },
        async WorkShopeForgotPassword(_, args, ctx) {
            return await forgotPassword(args, workShope, process.env.workShope_Secret)
        },

        async WorkShopeSendOtp(_, args, ctx) {
            return await sendOtp(args, workShope)
        },
        async WorkShopeChangeOrderStatus(_,args,ctx){
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