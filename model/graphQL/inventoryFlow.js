const inventoryFlow = require('../mongodb/inventoryFlow')

module.exports.typeDef = `
    type InventoryFlow {
        id: ID!
        inventoryProductId: ID!
        operation: OperationType!
        quantity: Int
        inventoryClerkId: ID!
        cratedAt: Date
    }

    enum OperationType {
        ADD
        SUBTRACT
    }
    extend type Query {
        InventoryHistory(itemId: ID!): [InventoryFlow]!
    }
`

module.exports.resolvers = {
    Query: {
        async InventoryHistory(_, args, ctx){
            const response = await inventoryFlow.find({inventoryProductId: args.itemId}).sort({cratedAt: -1})
            console.log("response",response)
            return response
        }
    },
}