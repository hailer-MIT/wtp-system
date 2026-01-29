const Services = require('../mongodb/services')
const Inventory = require('../mongodb/Inventory')

module.exports.typeDef = `
    type ServiceInventory {
        inventoryItem: Inventory
        quantityPerUnit: Float
    }

    type Services {
        id: ID!
        name: String!
        descriptionGuideLine: String
        goseToDesigner: Boolean!
        GoseToWorkshop: Boolean!
        inventoryItems: [ServiceInventory]
    }

    input ServiceInventoryInput {
        inventoryItem: ID!
        quantityPerUnit: Float!
    }

    extend type Query {
        AllServices: [Services]
    }

    extend type Mutation {
        AddServices(
            name: String!
            descriptionGuideLine: String
            goseToDesigner: Boolean!
            GoseToWorkshop: Boolean!
            inventoryItems: [ServiceInventoryInput]
        ): Services!
        ChangeGoesToDesigner(serviceId: ID! value: Boolean!): Boolean!
        ChangeGoesToWorkshop(serviceId: ID! value: Boolean!): Boolean!
        DeleteService(serviceId: ID!): Boolean!
        AddInventoryToService(serviceId: ID! inventoryItem: ID! quantityPerUnit: Float!): Services!
    }
`

module.exports.resolvers = {
    Query: {
        async AllServices(_, args, ctx) {
            const services = await Services.find().sort([["_id", -1]]).populate("inventoryItems.inventoryItem")
            return services
        }
    },

    Mutation: {
        async AddServices(_, args, ctx) {
            console.log(args)
            const services = new Services(args)
            var response = await services.save()
            // Populate not needed on save usually, but for consistency if return assumes population
            return { id: response.id, ...response._doc }
        },
        async ChangeGoesToDesigner(_, args, ctx) {
            console.log(args)
            const services = await Services.findByIdAndUpdate(args.serviceId, { goseToDesigner: args.value })
            console.log(services)
            return true
        },
        async ChangeGoesToWorkshop(_, args, ctx) {
            console.log(args)
            const services = await Services.findByIdAndUpdate(args.serviceId, { GoseToWorkshop: args.value })
            return true
        },
        async DeleteService(_, args, ctx) {
            console.log(args)
            const services = await Services.findByIdAndDelete(args.serviceId)
            return true
        },
        async AddInventoryToService(_, args, ctx) {
            const service = await Services.findByIdAndUpdate(
                args.serviceId,
                {
                    $push: {
                        inventoryItems: {
                            inventoryItem: args.inventoryItem,
                            quantityPerUnit: args.quantityPerUnit
                        }
                    }
                },
                { new: true }
            ).populate("inventoryItems.inventoryItem");
            return service;
        }
    }
}