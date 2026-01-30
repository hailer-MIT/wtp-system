const Order = require("../mongodb/order");
const Designer = require("../mongodb/designer");
const WorkShop = require("../mongodb/workShop");
const { withFilter } = require("graphql-subscriptions");
const pubsub = require("./pubsub");

const { GraphQLError } = require("graphql");
module.exports.typeDef = `
    type Order {
        id: ID!
        orderNumber: Int
        customerName: String
        contactPerson: String!
        phoneNumber: Int!
        tinNumber: String
        email: String
        fullPayment: Int!
        advancePayment: Int!
        remainingPayment: Int!
        services: [service]
        receivedBy: ID!
        ReceivedBy: user
        files: [ID]
        Files: [files]
        designedBy: ID
        DesignedBy: user
        workShop: ID
        WorkShop: user
        orderedDate: Date!
        deliveryDate: Date!
        progress: String
        satisfactionRate: Int
        feedback: [String]
        otherFeedback: String
        edited: Boolean
        editedFile: [editOrder]
        assignmentStatus: assignmentStatus
        rejectionReason: String
        rejectedDate: String
        reassignedDate: String
        pendingDate: String
        designingStartDate: String
        designerCompletedDate: String
        waitingForPrintDate: String
        printingDate: String
        completedDate: String
        deliveredDate: String
    }
    type files {
        id:ID!
        fileName: String
        extension: String
        description: String
        for: String!
    }
    type editOrder {
      customerName: String
      contactPerson: String
      phoneNumber: Int
      tinNumber: String
      email: String
      fullPayment: Int
      advancePayment: Int
      remainingPayment: Int
      designedBy: ID
      workShop: ID
    }

    type PaginatedOrder {
        total: Int!
        data: [Order]!
    }
    enum progress {
        Pending
        Designing
        WaitingForPrint
        Printing
        Completed
        Delivered
    }
    enum assignmentStatus {
        Pending
        Accepted
        Rejected
    }


    type service{
        service: ID!
        jobDescription: String!
        material: String
        size: String
        progress: progress
        quantity: Int!
        unitPrice: Int
        totalPrice: Int
        completedFilesId: [ID]
        completedFiles: [files]
    }
    input serviceInput{
        service: ID!
        jobDescription: String
        material: String
        size: String
        progress: progress
        quantity: Int!
        unitPrice: Int
        totalPrice: Int
        completedFilesId: [ID]
    }
    input orderInput{
        customerName: String
        contactPerson: String!
        phoneNumber: Int!
        tinNumber: String
        email: String
        fullPayment: Int!
        advancePayment: Int!
        remainingPayment: Int!
        designedBy: ID
        workShop: ID
        deliveryDate: Date!
    }
    type Statistics{
        lastMonthOrders: Int!
        thisMonthOrders: Int!
        pendingOrders: Int
        completedOrders: Int
        lateOrders: Int!
        rejectedOrders: Int
    }

        extend type Query {
            AllOrders(page: Int! limit: Int! field: String value: String, options: [String]): PaginatedOrder!
            OrdersStats: Statistics!
        }
    
        extend type Mutation {
            PlaceOrder(
            customerName: String,
            contactPerson: String!,
            phoneNumber: Int!,
            tinNumber: String,
            email: String,
            fullPayment: Int!,
            advancePayment: Int!,
            remainingPayment: Int!,
            services: [serviceInput!],
            files: [ID],
            deliveryDate: Date!,
            workShop: ID,
            designedBy: ID,
            ): Order!
            OrderRemoveService(orderId: ID!,service: serviceInput!): Boolean!
            OrderAddService(orderId: ID!,service: serviceInput!): Boolean!
            OrderEditService(orderId: ID!,oldService: serviceInput!, editedService: serviceInput!): Boolean!
            OrderEdit(orderId: ID!,orderInput: orderInput!): Boolean!
            AcceptOrder(orderId: ID!): Boolean!
            RejectOrder(orderId: ID!, reason: String!): Boolean!
            ReassignOrder(orderId: ID!, designedBy: ID, workShop: ID): Order!
        }
        extend type Subscription {
            newOrder: Order!
        }
    
`;

module.exports.resolvers = {
  // .limit(perPage)
  // .skip(perPage * page)

  Query: {
    async AllOrders(_, args, ctx) {
      const object = {};
      if (args.options && args.options.includes("Rejected")) {
        object.assignmentStatus = "Rejected";
      } else if (args.options[0] != "All") {
        object.progress = { $in: args.options };
      }
      if (args.field && args.value) {
        object[args.field] = { $regex: ".*" + args.value + ".*" };
        var order;
        try {
          order = await Order.find(object)
            .limit(args.limit)
            .skip(args.limit * args.page)
            .populate("files")
            .populate("receivedBy")
            .populate("designedBy")
            .populate("workShop")
            .sort({ orderedDate: -1 });
        } catch (err) {
          object[args.field] = { $eq: Number(args.value) };
          console.log("filter", object);
          order = await Order.find(object)
            .limit(args.limit)
            .skip(args.limit * args.page)
            .populate("files")
            .populate("receivedBy")
            .populate("designedBy")
            .populate("workShop")
            .sort({ orderedDate: -1 });
          console.log("order", order);
        }

        order.forEach((o) => {
          o.Files = o.files;
          o.files = null;
          o.ReceivedBy = o.receivedBy;
          o.receivedBy = o.ReceivedBy?._id;
          if (o.designedBy) {
            o.DesignedBy = o.designedBy;
            o.designedBy = o.DesignedBy?._id;
          }
          if (o.workShop) {
            o.WorkShop = o.workShop;
            o.workShop = o.WorkShop?._id;
          }
        });
        const total = await Order.countDocuments(object);
        // console.log(order, total)
        return {
          total: total,
          data: order != null ? order : [],
        };
      }
      order = await Order.find(object)
        .limit(args.limit)
        .skip(args.limit * args.page)
        .populate("files")
        .populate("receivedBy")
        .populate("designedBy")
        .populate("workShop")
        .sort({ orderedDate: -1 });
      order.forEach((o) => {
        o.Files = o.files;
        o.files = null;
        o.ReceivedBy = o.receivedBy;
        o.receivedBy = o.ReceivedBy?._id;
        if (o.designedBy) {
          o.DesignedBy = o.designedBy;
          o.designedBy = o.DesignedBy?._id;
        }
        if (o.workShop) {
          o.WorkShop = o.workShop;
          o.workShop = o.WorkShop?._id;
        }
      });
      // console.log(order)
      const total = await Order.countDocuments(object);
      // console.log(order, total)
      console.log(order[0]);
      return {
        total: total,
        data: order,
      };
    },
    async OrdersStats(_, args, ctx) {
      var date = new Date();
      const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const thisMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastMonthOrders = await Order.countDocuments({
        orderedDate: { $gt: lastMonth, $lt: thisMonth },
      });
      const thisMonthOrders = await Order.countDocuments({
        orderedDate: { $gt: thisMonth },
      });
      const pendingOrders = await Order.countDocuments({
        progress: { $nin: ["Completed", "Delivered"] },
      });
      const completedOrders = await Order.countDocuments({
        progress: { $in: ["Completed", "Delivered"] },
      });
      const lateOrders = await Order.countDocuments({
        progress: { $nin: ["Completed", "Delivered"] },
        deliveryDate: { $lt: Date.now() },
      });
      console.log("stats");
      return {
        lastMonthOrders: lastMonthOrders,
        thisMonthOrders: thisMonthOrders,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
        lateOrders: lateOrders,
        rejectedOrders: await Order.countDocuments({ assignmentStatus: "Rejected" }),
      };
    },
  },
  Mutation: {
    async PlaceOrder(_, args, ctx) {
      console.log(args);
      args.orderedDate = Date.now();
      // var goesToDesigner = false
      // var goesToWorkShop = false
      if (args.designedBy != null || args.workShop != null) {
        args.remainingPayment = args.fullPayment - args.advancePayment;
        args.receivedBy = ctx.receptionId;
        args.assignmentStatus = "Pending"; // Set assignment status to Pending for new orders

        // Calculate totalPrice for each service if unitPrice is provided
        if (args.services && args.services.length > 0) {
          args.services = args.services.map(service => {
            if (service.unitPrice && service.quantity) {
              service.totalPrice = service.unitPrice * service.quantity;
            }
            return service;
          });
        }
        // Extra safeguard
        if (args.services) {
          args.services = args.services.map(service => {
            if (!service.unitPrice && service.totalPrice && service.quantity) {
              service.unitPrice = service.totalPrice / service.quantity;
            }
            return service;
          });
        }

        // Set progress to null initially (will be set after accept/reject)
        args.progress = null;
        args.pendingDate = Date.now();
        const order = new Order(args);
        var response = await order.save();
        const newOrder = await Order.findOne({ _id: response.id }).populate({
          path: "services",
          populate: {
            path: "service",
            model: "Services",
          },
        });
        pubsub.publish("NEW_ORDER", { newOrder: newOrder });
        return { id: newOrder.id, ...newOrder._doc };
      }
      throw new GraphQLError(`Select either Designer or Workshop`, {
        extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
      });
      // console.log(newOrder)
      // console.log(newOrder.services)
      // newOrder.services.map((s) => {
      //     if (s.service.goseToDesigner && goesToDesigner == false) goesToDesigner = true
      //     if (s.service.GoseToWorkshop && goesToWorkShop == false) goesToWorkShop = true
      // })
      // var update
      // if (goesToDesigner) update = await selectDesigner(response)
      // if (goesToWorkShop) update = await selectWorkShop(response)
      // console.log('update', update)
      // return { id: update.id, ...update._doc }
    },

    async OrderRemoveService(_, args, ctx) {
      console.log(args.orderId, args.service);
      const order = await Order.updateOne(
        { _id: args.orderId },
        {
          $pull: {
            services: { ...args.service },
          },
        }
      );
      console.log(order);
      return true;
    },
    async OrderAddService(_, args, ctx) {
      console.log(args.orderId, args.service);
      const order = await Order.findByIdAndUpdate(args.orderId, {
        $push: {
          services: args.service,
        },
      });
      console.log(order);
      return true;
    },
    async OrderEditService(_, args, ctx) {
      console.log(args.orderId, args.oldService, args.editedService);
      const order = await Order.updateOne(
        {
          _id: args.orderId,
          "services.service": args.oldService.service,
          "services.jobDescription": args.oldService.jobDescription,
          "services.material": args.oldService.material,
          "services.size": args.oldService.size,
          "services.quantity": args.oldService.quantity,
          "services.totalPrice": args.oldService.totalPrice,
        },
        {
          $set: {
            "services.$.service": args.editedService.service,
            "services.$.jobDescription": args.editedService.jobDescription,
            "services.$.material": args.editedService.material,
            "services.$.size": args.editedService.size,
            "services.$.progress": args.editedService.progress,
            "services.$.quantity": args.editedService.quantity,
            "services.$.totalPrice": args.editedService.totalPrice,
          },
        }
      );
      console.log(order);
      return true;
    },
    async OrderEdit(_, args, ctx) {
      args.orderInput.edited = true
      const order = await Order.findByIdAndUpdate(
        args.orderId,
        args.orderInput
      );
      const order2 = await Order.findByIdAndUpdate(
        args.orderId,
        {
          $push: {
            editedFile: {
              customerName: order.customerName,
              contactPerson: order.contactPerson,
              phoneNumber: order.phoneNumber,
              tinNumber: order.tinNumber,
              email: order.email,
              fullPayment: order.fullPayment,
              advancePayment: order.advancePayment,
              remainingPayment: order.remainingPayment,
              designedBy: order.designedBy,
              workShop: order.workShop,
            }
          },
        }
      );
      console.log(order)
      return true;
    },
    async AcceptOrder(_, args, ctx) {
      const order = await Order.findById(args.orderId);
      if (!order) {
        throw new GraphQLError(`Order not found`, {
          extensions: { code: "NOT_FOUND", http: { status: 404 } },
        });
      }

      // Verify the order is assigned to the current user
      const userId = ctx.designerId || ctx.workShopId;
      const userRole = ctx.designerId ? "Designer" : "WorkShop";

      if (userRole === "Designer" && order.designedBy?.toString() !== userId?.toString()) {
        throw new GraphQLError(`Order is not assigned to you`, {
          extensions: { code: "UNAUTHORIZED", http: { status: 403 } },
        });
      }
      if (userRole === "WorkShop" && order.workShop?.toString() !== userId?.toString()) {
        throw new GraphQLError(`Order is not assigned to you`, {
          extensions: { code: "UNAUTHORIZED", http: { status: 403 } },
        });
      }

      // Update assignment status to Accepted AND set progress
      const updateData = {
        assignmentStatus: "Accepted",
      };

      // Set progress based on role
      if (userRole === "Designer") {
        updateData.progress = "Pending";
      } else if (userRole === "WorkShop") {
        updateData.progress = "WaitingForPrint";
      }

      await Order.findByIdAndUpdate(args.orderId, updateData);

      return true;
    },
    async RejectOrder(_, args, ctx) {
      const updatedOrder = await Order.findByIdAndUpdate(args.orderId, {
        assignmentStatus: "Rejected",
        progress: "Rejected",
        rejectionReason: args.reason,
        rejectedDate: Date.now(),
      }, { new: true }).populate({
        path: "services",
        populate: {
          path: "service",
          model: "Services",
        },
      });
      pubsub.publish("NEW_ORDER", { newOrder: updatedOrder });
      return true;
    },
    async ReassignOrder(_, args, ctx) {
      console.log("Reassigning order", args);
      const updateData = {
        assignmentStatus: "Pending", // Reset to Pending so they get notified
        rejectionReason: null, // Clear rejection reason
        reassignedDate: Date.now(), // Track when order was reassigned
        progress: "Pending", // Reset progress? Or keep as is? User said "status of the order remains rejected" until fixed.
        // But for the NEW assignee, it should look like a new assignment.
        // If I keep it as "Pending", it will show up in their "Pending" list.
        // Designer's query uses "Pending". Workshop uses "WaitingForPrint" (conditionally).
        // If I reassign to Designer, progress should be "Pending" or "Designing"? 
        // A new assignment starts at "Pending".
        // If I reassign to Workshop, it probably means it's ready for print?
      };

      if (args.designedBy !== undefined) updateData.designedBy = args.designedBy;
      if (args.workShop !== undefined) updateData.workShop = args.workShop;

      // Logic: If designedBy is set, we probably want to start from Designer (Progress: Pending).
      // If ONLY workShop is set (and designedBy is null/old), maybe we jump to Handover? 
      // But reassigning usually implies mistake effectively starting over or passing to someone else.
      // Safest is to set progress based on who is assigned.

      // If designer is assigned, set progress to Pending (Designer needs to do work).
      if (args.designedBy) {
        updateData.progress = "Pending";
      } else if (args.workShop && !args.designedBy) {
        // If only workshop assigned (no designer), presumably "WaitingForPrint" or "Pending" if it's direct to Workshop?
        // PlaceOrder logic sets "Pending". Workshop sees "Pending" assignment.
        // Let's stick to "Pending" progress.
        updateData.progress = "Pending";
      }

      const order = await Order.findByIdAndUpdate(args.orderId, updateData, { new: true })
        .populate("files")
        .populate("receivedBy")
        .populate("designedBy")
        .populate("workShop")
        .populate({
          path: "services",
          populate: {
            path: "service",
            model: "Services",
          },
        });

      // Notify
      pubsub.publish("NEW_ORDER", { newOrder: order });
      return order;
    },
  },
  Subscription: {
    newOrder: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["NEW_ORDER"]),
        (payload, variables, context, info) => {
          switch (context?.role) {
            case "SuperAdmin":
            case "Manager":
            case "Accountant":
            case "Cashier":
              return true;
            case "Reception":
              if (context.role == "Reception" && payload.newOrder.receivedBy?.toString() == context.id) return false;
              return true;
            case "Designer":
              if (payload.newOrder.designedBy?.toString() == context.id) return true;
              return false;
            case "WorkShop":
              // If assigned to this workshop
              if (payload.newOrder.workShop?.toString() == context.id) {
                // If also assigned to a designer, only notify if ready for print "WaitingForPrint"
                // If designedBy is present AND progress is NOT "WaitingForPrint", suppress notification
                if (payload.newOrder.designedBy && payload.newOrder.progress !== "WaitingForPrint") {
                  return false;
                }
                return true;
              }
              return false;
          }
          // Only push an update if the comment is on
          // the correct repository for this operation
          return false;
        }
      ),
    },
  },
};

async function selectWorkShop(response) {
  var workShop = await WorkShop.find({ deactivated: false });
  var workShopList = [];
  console.log("workShop", workShop);
  if (workShop.length > 1) {
    for (let w of workShop) {
      const pendingOrdersCount = await Order.countDocuments({
        workShop: w._id,
        progress: { $in: ["Printing", "Pending"] },
      });
      w.pendingOrdersCount = pendingOrdersCount;
      workShopList.push(w);
      console.log("count", w.pendingOrdersCount);
    }
    workShopList.sort((a, b) => {
      // console.log("a",a)
      return a.pendingOrdersCount - b.pendingOrdersCount;
    });
    const update = await Order.findOneAndUpdate(
      { _id: response.id },
      { workShop: workShopList[0]._id }
    );
    return update;
  }
  console.log("workShop", workShopList);
  const update = await Order.findOneAndUpdate(
    { _id: response.id },
    { workShop: workShop[0]._id }
  );
  return update;
}

async function selectDesigner(response) {
  var designer = await Designer.find({ deactivated: false });
  var designerList = [];
  if (designer.length > 1) {
    for (let d of designer) {
      const pendingOrdersCount = await Order.countDocuments({
        designedBy: d._id,
        progress: { $in: ["Designing", "Pending"] },
      });
      d.pendingOrdersCount = pendingOrdersCount;
      designerList.push(d);
      console.log("count", d.pendingOrdersCount);
    }
    designerList.sort((a, b) => {
      // console.log("a",a)
      return a.pendingOrdersCount - b.pendingOrdersCount;
    });
    const update = await Order.findOneAndUpdate(
      { _id: response.id },
      { progress: "Pending", designedBy: designerList[0]._id }
    );
    return update;
  }
  console.log("designers", designerList);
  const update = await Order.findOneAndUpdate(
    { _id: response.id },
    { progress: "Pending", designedBy: designer[0]._id }
  );
  return update;
}
