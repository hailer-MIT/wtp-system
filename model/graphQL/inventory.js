const inventory = require("../mongodb/Inventory");
const inventoryFlow = require("../mongodb/inventoryFlow");

module.exports.typeDef = `
    type Inventory {
        id: ID!
        itemCode: String!
        itemName: String!
        unit: String
        size: String
        thickness: String
        serialNumber: String
        type: String
        assetType: assetType!
        color: String
        quantity: Float!
        remark: String
        cratedAt: Date
        minQuantity: Int
    }

    enum assetType {
      fixed
      current
      accessory
    }

    extend type Query {
      InventoryGetAssets(assetType: assetType!): [Inventory]!
    }
    extend type Mutation {
        InventoryAddNewItem(
          itemCode: String!
          itemName: String!
          unit: String
          size: String
          thickness: String
          serialNumber: String
          type: String
          color: String!
          assetType: assetType!
          quantity: Int!
          minQuantity: Int): Inventory!
        InventoryAddQuantity(itemId: ID! quantity: Int!): Inventory!
        InventorySubtractQuantity(itemId: ID! quantity: Int!): Inventory!
    }
    extend type Subscription {
        lowStockAlert: Inventory!
    }
`;

const pubsub = require("./pubsub");
const { withFilter } = require("graphql-subscriptions");

module.exports.resolvers = {
  Query: {
    InventoryGetAssets: async (__, args, ctx) => {
      console.log("args", args)
      const result = await inventory.find({ assetType: args.assetType });
      return result;
    },
  },

  Mutation: {
    async InventoryAddNewItem(_, args, ctx) {
      if (!args.minQuantity) args.minQuantity = 10;
      const create = new inventory(args);
      const response = await create.save();
      // const record = new inventoryFlow({
      //   inventoryProduct
      // });
      // const inventoryFlowResponse = await record.save();
      return response;
    },
    async InventoryAddQuantity(_, args, ctx) {
      const response = await inventory.findByIdAndUpdate(args.itemId, { $inc: { quantity: Math.abs(args.quantity) } })
      const record = new inventoryFlow({
        inventoryProductId: response.id,
        operation: "ADD",
        quantity: Math.abs(args.quantity),
        inventoryClerkId: ctx.InventoryClerkId,
      });
      const inventoryFlowResponse = await record.save();
      console.log("response", inventoryFlowResponse)
      return response
    },
    async InventorySubtractQuantity(_, args, ctx) {
      // First decrement
      const response = await inventory.findByIdAndUpdate(args.itemId, { $inc: { quantity: Math.abs(args.quantity) * -1 } }, { new: true })

      const record = new inventoryFlow({
        inventoryProductId: response.id,
        operation: "SUBTRACT",
        quantity: Math.abs(args.quantity),
        inventoryClerkId: ctx.InventoryClerkId,
      });
      const inventoryFlowResponse = await record.save();
      console.log("response", inventoryFlowResponse)

      // Alert Logic
      if (response.quantity <= response.minQuantity) {
        console.log(`LOW STOCK ALERT: Item ${response.itemName} (ID: ${response.id}) is low on stock! Current: ${response.quantity}, Min: ${response.minQuantity}`);
        pubsub.publish("LOW_STOCK", { lowStockAlert: response });
      }

      return response
    },
  },
  Subscription: {
    lowStockAlert: {
      subscribe: () => pubsub.asyncIterator(["LOW_STOCK"]),
    }
  }
};
