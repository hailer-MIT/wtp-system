const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const superAdmin = require("../mongodb/superadmin.js");
const reception = require("../mongodb/reception.js");
const designer = require("../mongodb/designer.js");
const inventoryClerk = require("../mongodb/inventoryClerk.js");
const manager = require("../mongodb/manager.js");
const cashier = require("../mongodb/cashier.js");
const accountant = require("../mongodb/accountant.js");
const workShop = require("../mongodb/workShop.js");
const { sendSMS } = require("../../util/functions.js");

module.exports.typeDef = `
    type SuperAdmin {
        id: ID!
        fullName: String!
        phoneNumber: Int!
        password: String
        token: String
    }
    type user {
        id: ID!
        fullName: String!
        phoneNumber: Int!
        password: String
        deactivated: Boolean!
        otpId: ID
        otp: Otp
        addedBy: ID!
        role: String
    }

    enum roles {
        Reception
        Designer
        Manager
        WorkShop
        InventoryClerk
        Cashier
        Accountant
    }

    extend type Query {
        GetMeForSuperAdmin: SuperAdmin!
        GetAllSuperAdmin: [SuperAdmin]!
        GetAllUsers: [user]!
    }

    extend type Mutation {
        SuperAdminLogin(phoneNumber: Int!, password: String!): SuperAdmin!
        CreateSuperAdminAccount(fullName: String!, phoneNumber: Int!,password: String!): SuperAdmin!
        ChangePasswordForSuperAdmin(oldPassword: String!, newPassword: String!, confirmPassword: String!): Boolean!
        AddUser(fullName: String!, phoneNumber: Int!, role: roles!): user!
        ActivateOrDeactivateUser(userId: ID!, role: roles!): Boolean!
    }
`;

module.exports.resolvers = {
  Query: {
    GetMeForSuperAdmin: async (_, __, ctx) => {
      // console.log(ctx)
      const result = await superAdmin.findOne({ id: ctx.superAdminId });
      return result;
    },
    GetAllUsers: async (_, __, ctx) => {
      const Reception = await reception.find();
      const InventoryClerk = await inventoryClerk.find();
      const WorkShop = await workShop.find();
      const Manager = await manager.find();
      const Designer = await designer.find();
      const Cashier = await cashier.find();
      const Accountant = await accountant.find();
      Reception.forEach((v) => {
        v.role = "Reception";
      });
      InventoryClerk.forEach((v) => {
        v.role = "InventoryClerk";
      });
      Manager.forEach((v) => {
        v.role = "Manager";
      });
      Designer.forEach((v) => {
        v.role = "Designer";
      });
      WorkShop.forEach((v) => {
        v.role = "WorkShop";
      });
      Accountant.forEach((v) => {
        v.role = "Accountant";
      });
      Cashier.forEach((v) => {
        v.role = "Cashier";
      });
      const users = [
        ...Reception,
        ...InventoryClerk,
        ...Manager,
        ...WorkShop,
        ...Designer,
        ...Accountant,
        ...Cashier,
      ];
      return users;
    },
  },

  Mutation: {
    async SuperAdminLogin(_, args, ctx) {
      // check if account exists
      const result = await superAdmin.findOne({
        phoneNumber: args.phoneNumber,
      });
      console.log(result);
      if (!result) {
        throw new GraphQLError(`Incorrect phone number or password`, {
          extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
        });
      }

      // verify password
      const passwordIsValid = await bcrypt.compare(
        args.password,
        result._doc.password
      );
      if (!passwordIsValid)
        throw new GraphQLError(`Incorrect phone number or password`, {
          extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
        });
      // sendSMS("+251933753605","login to super admin account")

      const token = jwt.sign(
        { id: result.id, ...result._doc },
        process.env.superAdmin_Secret
      );
      result._doc.token = token;
      return { id: result.id, ...result._doc };
    },

    async CreateSuperAdminAccount(_, args, ctx) {
      //hash password
      const hashPassword = await bcrypt.hash(args.password, 10);
      args.password = hashPassword;
      // create account
      const newSuperAdmin = new superAdmin(args);
      var response = await newSuperAdmin.save();

      // jwt sign
      const token = jwt.sign(
        { id: response.id, ...response._doc },
        process.env.superAdmin_Secret
      );
      response._doc.token = token;
      return { id: response.id, ...response._doc };
    },
    async AddUser(_, args, ctx) {
      switch (args.role) {
        case "Reception":
          delete args.role;
          args.addedBy = ctx.superAdminId;
          const Reception = new reception(args);
          try {
            const r = await Reception.save();
            return r;
          } catch (err) {
            if (err.code === 11000) {
              throw new GraphQLError(`Phone number already exist`, {
                extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
              });
            } else {
              throw err;
            }
          }
        case "Designer":
          delete args.role;
          args.addedBy = ctx.superAdminId;
          const Designer = new designer(args);
          try {
            const d = await Designer.save();
            return d;
          } catch (err) {
            if (err.code === 11000) {
              throw new GraphQLError(`Phone number already exist`, {
                extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
              });
            } else {
              throw err;
            }
          }
        case "Manager":
          delete args.role;
          args.addedBy = ctx.superAdminId;
          const Manager = new manager(args);
          try {
            const m = await Manager.save();
            return m;
          } catch (err) {
            if (err.code === 11000) {
              throw new GraphQLError(`Phone number already exist`, {
                extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
              });
            } else {
              throw err;
            }
          }
        case "WorkShop":
          delete args.role;
          args.addedBy = ctx.superAdminId;
          const WorkShop = new workShop(args);
          try {
            const w = await WorkShop.save();
            return w;
          } catch (err) {
            if (err.code === 11000) {
              throw new GraphQLError(`Phone number already exist`, {
                extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
              });
            } else {
              throw err;
            }
          }
        case "InventoryClerk":
          delete args.role;
          args.addedBy = ctx.superAdminId;
          const InventoryClerk = new inventoryClerk(args);
          try {
            const i = await InventoryClerk.save();
            return i;
          } catch (err) {
            if (err.code === 11000) {
              throw new GraphQLError(`Phone number already exist`, {
                extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
              });
            } else {
              throw err;
            }
          }
        case "Accountant":
          delete args.role;
          args.addedBy = ctx.superAdminId;
          const Accountant = new accountant(args);
          try {
            const a = await Accountant.save();
            return a;
          } catch (err) {
            if (err.code === 11000) {
              throw new GraphQLError(`Phone number already exist`, {
                extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
              });
            } else {
              throw err;
            }
          }
        case "Cashier":
          delete args.role;
          args.addedBy = ctx.superAdminId;
          const Cashier = new cashier(args);
          try {
            const c = await Cashier.save();
            return c;
          } catch (err) {
            if (err.code === 11000) {
              throw new GraphQLError(`Phone number already exist`, {
                extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
              });
            } else {
              throw err;
            }
          }
      }
    },
    async ActivateOrDeactivateUser(_, args, ctx) {
      switch (args.role) {
        case "Reception":
          const valueR = await reception.updateOne({ _id: args.userId }, [
            { $set: { deactivated: { $eq: [false, "$deactivated"] } } },
          ]);
          return valueR.acknowledged;
        case "Designer":
          const valueD = await designer.updateOne({ _id: args.userId }, [
            { $set: { deactivated: { $eq: [false, "$deactivated"] } } },
          ]);
          return valueD.acknowledged;
        case "Manager":
          const valueM = await manager.updateOne({ _id: args.userId }, [
            { $set: { deactivated: { $eq: [false, "$deactivated"] } } },
          ]);
          return valueM.acknowledged;
        case "WorkShop":
          const valueW = await workShop.updateOne({ _id: args.userId }, [
            { $set: { deactivated: { $eq: [false, "$deactivated"] } } },
          ]);
          return valueW.acknowledged;
        case "InventoryClerk":
          const valueI = await inventoryClerk.updateOne({ _id: args.userId }, [
            { $set: { deactivated: { $eq: [false, "$deactivated"] } } },
          ]);
          return valueI.acknowledged;
        case "Accountant":
          const valueA = await accountant.updateOne({ _id: args.userId }, [
            { $set: { deactivated: { $eq: [false, "$deactivated"] } } },
          ]);
          return valueA.acknowledged;
        case "Cashier":
          const valueC = await cashier.updateOne({ _id: args.userId }, [
            { $set: { deactivated: { $eq: [false, "$deactivated"] } } },
          ]);
          return valueC.acknowledged;
      }
    },
  },
};
