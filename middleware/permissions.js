const { applyMiddleware } = require("graphql-middleware");
const {
  shield,
  rule,
  and,
  or,
  inputRule,
  deny,
  allow,
} = require("graphql-shield");
const schema = require("../model/graphQL/schema");
const jwt = require("jsonwebtoken");
const reception = require("../model/mongodb/reception");
const designer = require("../model/mongodb/designer");
const workShop = require("../model/mongodb/workShop");
const inventoryClerk = require("../model/mongodb/inventoryClerk");
const manager = require("../model/mongodb/manager");
const cashier = require("../model/mongodb/cashier");
const accountant = require("../model/mongodb/accountant");
require("dotenv").config();

const isAuthenticatedAsReception = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const token = ctx.req.headers.authorization;
    try {
      var verifyToken = jwt.verify(token, process.env.reception_Secret);
      console.log(token);
    } catch (err) {
      return false;
    }
    // console.log(verifyToken)
    ctx.receptionId = verifyToken.id;
    var result = await reception.findOne({ _id: verifyToken.id });
    if (result) {
      if (result._doc.deactivated) return false;
    }
    if (result == null) return false;
    return true;
  }
);
const isAuthenticatedAsCashier = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const token = ctx.req.headers.authorization;
    try {
      var verifyToken = jwt.verify(token, process.env.cashier_Secret);
      console.log(token);
    } catch (err) {
      return false;
    }
    // console.log(verifyToken)
    ctx.cashierId = verifyToken.id;
    var result = await cashier.findOne({ _id: verifyToken.id });
    if (result) {
      if (result._doc.deactivated) return false;
    }
    if (result == null) return false;
    return true;
  }
);
const isAuthenticatedAsAccountant = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const token = ctx.req.headers.authorization;
    try {
      var verifyToken = jwt.verify(token, process.env.accountant_Secret);
      console.log(token);
    } catch (err) {
      return false;
    }
    // console.log(verifyToken)
    ctx.accountantId = verifyToken.id;
    var result = await accountant.findOne({ _id: verifyToken.id });
    if (result) {
      if (result._doc.deactivated) return false;
    }
    if (result == null) return false;
    return true;
  }
);
const isAuthenticatedAsSuperAdmin = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const token = ctx.req.headers.authorization;
    try {
      var verifyToken = jwt.verify(token, process.env.superAdmin_Secret);
    } catch (err) {
      return false;
    }
    ctx.superAdminId = verifyToken.id;
    return true;
  }
);

const isAuthenticatedAsDesigner = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const token = ctx.req.headers.authorization;
    try {
      var verifyToken = jwt.verify(token, process.env.designer_Secret);
    } catch (err) {
      return false;
    }
    ctx.designerId = verifyToken.id;
    var result = await designer.findOne({ _id: verifyToken.id });
    if (result) {
      if (result._doc.deactivated) return false;
    }
    if (result == null) return false;
    return true;
  }
);
const isAuthenticatedAsWorkShop = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const token = ctx.req.headers.authorization;
    try {
      var verifyToken = jwt.verify(token, process.env.workShop_Secret);
    } catch (err) {
      return false;
    }
    console.log(token);
    console.log(verifyToken);
    ctx.workShopId = verifyToken.id;
    var result = await workShop.findOne({ _id: verifyToken.id });
    if (result) {
      if (result._doc.deactivated) return false;
    }
    if (result == null) return false;
    return true;
  }
);
const isAuthenticatedAsManager = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const token = ctx.req.headers.authorization;
    try {
      var verifyToken = jwt.verify(token, process.env.manager_Secret);
    } catch (err) {
      return false;
    }

    ctx.managerId = verifyToken.id;
    var result = await manager.findOne({ _id: verifyToken.id });
    if (result) {
      if (result._doc.deactivated) return false;
    }
    if (result == null) return false;
    return true;
  }
);
const isAuthenticatedAsInventoryClerk = rule({ cache: "contextual" })(
  async (parent, args, ctx, info) => {
    const token = ctx.req.headers.authorization;
    try {
      var verifyToken = jwt.verify(token, process.env.inventoryClerk_Secret);
    } catch (err) {
      return false;
    }
    console.log(token);
    console.log(verifyToken);
    ctx.InventoryClerkId = verifyToken.id;
    var result = await inventoryClerk.findOne({ _id: verifyToken.id });
    if (result) {
      if (result._doc.deactivated) return false;
    }
    if (result == null) return false;
    return true;
  }
);

const permissions = shield(
  {
    Query: {
      "*": deny,
      AllOrders: or(
        isAuthenticatedAsReception,
        isAuthenticatedAsSuperAdmin,
        isAuthenticatedAsManager,
        isAuthenticatedAsCashier,
        isAuthenticatedAsAccountant,
      ),
      AllServices: allow, //or(isAuthenticatedAsReception , isAuthenticatedAsSuperAdmin),
      OrdersStats: or(
        isAuthenticatedAsReception,
        isAuthenticatedAsSuperAdmin,
        isAuthenticatedAsManager,
        isAuthenticatedAsCashier
      ),
      GetAllUsers: isAuthenticatedAsSuperAdmin,
      DesignerMyStat: isAuthenticatedAsDesigner,
      DesignersStat: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsManager),
      WorkShopStat: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsManager),
      DesignerMyOrder: isAuthenticatedAsDesigner,
      WorkShopMyStat: isAuthenticatedAsWorkShop,
      WorkShopMyOrder: isAuthenticatedAsWorkShop,
      InventoryGetAssets: or(isAuthenticatedAsAccountant, isAuthenticatedAsDesigner, isAuthenticatedAsInventoryClerk, isAuthenticatedAsReception, isAuthenticatedAsManager, isAuthenticatedAsSuperAdmin),
      InventoryHistory: or(isAuthenticatedAsAccountant, isAuthenticatedAsSuperAdmin, isAuthenticatedAsManager, isAuthenticatedAsInventoryClerk),

      // reception
      GetMeForReception: isAuthenticatedAsReception,
      AllDesigners: or(isAuthenticatedAsReception, isAuthenticatedAsSuperAdmin, isAuthenticatedAsManager),
      AllWorkshops: or(isAuthenticatedAsReception, isAuthenticatedAsSuperAdmin, isAuthenticatedAsManager),


      //SuperAdmin
      GetMeForSuperAdmin: isAuthenticatedAsSuperAdmin,
      GetAllSuperAdmin: isAuthenticatedAsSuperAdmin,

      // "*": allow,
      // users: and(isAuthenticated, isAdmin),
      // me: isAuthenticated,
    },
    Mutation: {
      "*": deny,
      ReceptionLogin: allow,
      SuperAdminLogin: allow,
      CashierLogin: allow,
      AccountantLogin: allow,
      // CreateSuperAdminAccount: allow,
      ReceptionForgotPassword: allow,
      AccountantForgotPassword: allow,
      CashierForgotPassword: allow,
      ReceptionSendOtp: allow,
      CashierSendOtp: allow,
      AccountantSendOtp: allow,
      DesignerLogin: allow,
      DesignerForgotPassword: allow,
      DesignerSendOtp: allow,
      DesignerChangeOrderStatus: isAuthenticatedAsDesigner,
      WorkShopChangeOrderStatus: isAuthenticatedAsWorkShop,
      AcceptOrder: or(isAuthenticatedAsDesigner, isAuthenticatedAsWorkShop),
      RejectOrder: or(isAuthenticatedAsDesigner, isAuthenticatedAsWorkShop),
      WorkShopLogin: allow,
      WorkShopForgotPassword: allow,
      WorkShopSendOtp: allow,
      ManagerForgotPassword: allow,
      ManagerLogin: allow,
      ManagerSendOtp: allow,
      InventoryClerkSendOtp: allow,
      InventoryClerkForgotPassword: allow,
      InventoryClerkLogin: allow,

      // reception
      PlaceOrder: isAuthenticatedAsReception,
      ReceptionDelivereOrder: isAuthenticatedAsReception,

      // inventory
      InventorySubtractQuantity: isAuthenticatedAsInventoryClerk,
      InventoryAddNewItem: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsAccountant),
      InventoryAddQuantity: isAuthenticatedAsInventoryClerk,

      //SuperAdmin
      AddServices: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception),
      DeleteService: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception),
      ChangeGoesToDesigner: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception),
      ChangeGoesToWorkshop: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception),
      OrderRemoveService: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception),
      OrderAddService: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception),
      OrderEditService: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception),
      OrderEdit: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception),
      AddReception: isAuthenticatedAsSuperAdmin,
      ChangePasswordForSuperAdmin: isAuthenticatedAsSuperAdmin,
      AddUser: isAuthenticatedAsSuperAdmin,
      ReassignOrder: or(isAuthenticatedAsSuperAdmin, isAuthenticatedAsReception, isAuthenticatedAsManager),
      ActivateOrDeactivateUser: isAuthenticatedAsSuperAdmin,

    },
  },
  {
    allowExternalErrors: true,
  }
);

module.exports = applyMiddleware(schema, permissions);
