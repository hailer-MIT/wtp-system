const { login, forgotPassword, sendOtp } = require("../../util/functions");
const designer = require("../mongodb/designer");
const Order = require("../mongodb/order");
const pubsub = require("./pubsub");

module.exports.typeDef = `
    type Designer {
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
    type DesignersStatistic {
        name: String!
        lastMonthOrders: Int!
        thisMonthOrders: Int!
        pendingOrders: Int
        completedOrders: Int
        lateOrders: Int!
    }
    extend type Query {
        DesignerMyStat: Statistics!
        DesignersStat: [DesignersStatistic]!
        DesignerMyOrder(options: [progress]!): [Order]!
        AllDesigners: [user]!
    }
    extend type Mutation {
        DesignerLogin(phoneNumber: Int!, password: String!): Reception!  
        DesignerForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): Reception!  
        DesignerSendOtp(phoneNumber: Int!): Boolean!  
        DesignerChangeOrderStatus(orderId:ID! progress: progress!): Boolean!  
        UpdateDesignerProfile(fullName: String, phoneNumber: Int, photo: String): Designer!
    }
`;

module.exports.resolvers = {
  Query: {
    async DesignerMyStat(_, args, ctx) {
      const id = ctx.designerId;
      var date = new Date();
      const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastMonthOrders = await Order.countDocuments({
        orderedDate: { $gt: lastMonth, $lt: thisMonth },
        designedBy: id,
      });
      const thisMonthOrders = await Order.countDocuments({
        orderedDate: { $gt: thisMonth },
        designedBy: id,
      });
      const pendingOrders = await Order.countDocuments({
        progress: { $in: ["Pending", "Designing"] },
        designedBy: id,
      });
      const completedOrders = await Order.countDocuments({
        orderedDate: { $gt: thisMonth },
        progress: { $nin: ["Pending", "Designing"] },
        designedBy: id,
      });
      const lateOrders = await Order.countDocuments({
        progress: { $in: ["Pending", "Designing"] },
        deliveryDate: { $lt: Date.now() },
        designedBy: id,
      });
      console.log("stats");
      return {
        lastMonthOrders: lastMonthOrders,
        thisMonthOrders: thisMonthOrders,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        lateOrders: lateOrders,
      };
    },

    async DesignersStat(_, args, ctx) {
      var date = new Date();
      const array = [];
      const designers = await designer.find({ deactivated: false });
      for (var d of designers) {
        console.log(d._id);
        const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastMonthOrders = await Order.countDocuments({
          orderedDate: { $gt: lastMonth, $lt: thisMonth },
          designedBy: d._id,
        });
        const thisMonthOrders = await Order.countDocuments({
          orderedDate: { $gt: thisMonth },
          designedBy: d._id,
        });
        const pendingOrders = await Order.countDocuments({
          progress: { $in: ["Pending", "Designing"] },
          designedBy: d._id,
        });
        const completedOrders = await Order.countDocuments({
          orderedDate: { $gt: thisMonth },
          progress: { $nin: ["Pending", "Designing"] },
          designedBy: d._id,
        });
        const lateOrders = await Order.countDocuments({
          progress: { $in: ["Pending", "Designing"] },
          deliveryDate: { $lt: Date.now() },
          designedBy: d._id,
        });
        console.log("stats");
        array.push({
          lastMonthOrders: lastMonthOrders,
          thisMonthOrders: thisMonthOrders,
          pendingOrders: pendingOrders,
          completedOrders: completedOrders,
          lateOrders: lateOrders,
          name: d.fullName,
        });
      }

      return array;
    },

    async DesignerMyOrder(_, args, ctx) {
      const orders = await Order.find({
        designedBy: ctx.designerId,
        $or: [
          { progress: { $in: args.options } },
          { progress: null, assignmentStatus: "Pending" }
        ],
      })
        .sort({ orderedDate: -1 })
        .populate("files")
        .populate({
          path: "services",
          populate: {
            path: "completedFilesId",
            model: "Files",
          },
        });
      orders.forEach((o) => {
        o.Files = o.files;
        o.files = null;
        if (o.services)
          o.services.forEach((s) => {
            console.log(s);
            s.completedFiles = s.completedFilesId;
          });
      });
      return orders;
    },
    async AllDesigners(_, args, ctx) {
      var Designer = await designer.find({ deactivated: false });
      return Designer;
    },
  },

  Mutation: {
    async DesignerLogin(_, args, ctx) {
      return await login(args, designer, process.env.designer_Secret);
    },
    async DesignerForgotPassword(_, args, ctx) {
      return await forgotPassword(args, designer, process.env.designer_Secret);
    },

    async DesignerSendOtp(_, args, ctx) {
      return await sendOtp(args, designer);
    },

    async DesignerChangeOrderStatus(_, args, ctx) {
      if (args.progress == "Completed") {
        const thisOrder = await Order.findOne({ _id: args.orderId });
        if (thisOrder.workShop) {
          // Order moves to Workshop
          const updatedOrder = await Order.findByIdAndUpdate(
            args.orderId,
            {
              progress: "WaitingForPrint",
              waitingForPrintDate: Date.now(),
              designerCompletedDate: Date.now(), // Designer completed their part
              assignmentStatus: "Pending", // Reset to Pending for Workshop
            },
            { new: true }
          ).populate({
            path: "services",
            populate: {
              path: "service",
              model: "Services",
            },
          });
          // Publish notification with updated order so Workshop gets notified
          pubsub.publish("NEW_ORDER", { newOrder: updatedOrder });
        } else {
          await Order.findByIdAndUpdate(args.orderId, {
            progress: "Completed",
            designerCompletedDate: Date.now(),
            completedDate: Date.now() // Also mark complete if no workshop involved
          });
        }
        return true;
      }
      if (args.progress == "Designing") {
        await Order.findByIdAndUpdate(args.orderId, {
          progress: args.progress,
          designingStartDate: Date.now()
        });
        return true;
      }
      const order = await Order.findByIdAndUpdate(args.orderId, {
        progress: args.progress,
      });
      console.log(order, args);
      if (order.id) return true;
      return false;
    },
    async UpdateDesignerProfile(_, args, ctx) {
      const updateData = {};
      if (args.fullName) updateData.fullName = args.fullName;
      if (args.phoneNumber) updateData.phoneNumber = args.phoneNumber;
      if (args.photo) updateData.photo = args.photo;

      const updated = await designer.findByIdAndUpdate(
        ctx.designerId,
        updateData,
        { new: true }
      );
      return { id: updated.id, ...updated._doc };
    },
  },
};
