const { login, forgotPassword, sendOtp } = require("../../util/functions");
const inventoryClerk = require("../mongodb/inventoryClerk");

module.exports.typeDef = `
    type InventoryClerk {
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

    extend type Mutation {
        InventoryClerkLogin(phoneNumber: Int!, password: String!): InventoryClerk!  
        InventoryClerkForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): InventoryClerk!  
        InventoryClerkSendOtp(phoneNumber: Int!): Boolean!  
    }
`;

module.exports.resolvers = {
  Mutation: {
    async InventoryClerkLogin(_, args, ctx) {
      return await login(
        args,
        inventoryClerk,
        process.env.inventoryClerk_Secret
      );
    },
    async InventoryClerkForgotPassword(_, args, ctx) {
      return await forgotPassword(
        args,
        inventoryClerk,
        process.env.inventoryClerk_Secret
      );
    },

    async InventoryClerkSendOtp(_, args, ctx) {
      return await sendOtp(args, inventoryClerk);
    },
  },
};
