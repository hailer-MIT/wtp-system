const { makeExecutableSchema } = require("@graphql-tools/schema")
const { merge } = require('lodash')
const { typeDef: reception, resolvers: receptionResolver } = require('./reception.js')
const { typeDef: designer, resolvers: designerResolver } = require('./designer.js')
const { typeDef: superAdmin, resolvers: superAdminResolver } = require('./superAdmin.js')
const { typeDef: order, resolvers: orderResolver } = require('./order')
const { typeDef: services, resolvers: servicesResolver } = require('./services.js')
const { typeDef: workShop, resolvers: workShopResolver } = require('./workShop')
const { typeDef: manager, resolvers: managerResolver } = require('./manager')
const { typeDef: inventoryClerk, resolvers: inventoryClerkResolver } = require('./inventoryClerk')
const { typeDef: inventory, resolvers: inventoryResolver } = require('./inventory')
const { typeDef: inventoryFlow, resolvers: inventoryFlowResolver } = require('./inventoryFlow')
const { typeDef: cashier, resolvers: cashierResolver } = require('./cashier')
const { typeDef: accountant, resolvers: accountantResolver } = require('./accountant')


const Query = `
  type Query {
    _empty: String
  }
`;
const Mutation = `
  type Mutation {
    _empty: String
  }
`;
const Subscription = `
  type Subscription {
    _empty: String
  }
`;

const resolvers = {};


module.exports = makeExecutableSchema({
  typeDefs: [Query, Mutation, Subscription,reception, superAdmin,order,services,designer,workShop,manager,inventoryClerk,inventory,inventoryFlow,cashier,accountant],
  resolvers: merge(resolvers,receptionResolver, superAdminResolver,orderResolver,servicesResolver,designerResolver,workShopResolver,managerResolver,inventoryClerkResolver,inventoryResolver,inventoryFlowResolver,cashierResolver,accountantResolver)
});