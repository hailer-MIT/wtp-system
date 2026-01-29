const Services = require('../mongodb/services')

module.exports.typeDef = `
    type Services {
        id: ID!
        name: String!
        descriptionGuideLine: String
        goseToDesigner: Boolean!
        GoseToWorkshop: Boolean!
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
        ): Services!
        ChangeGoesToDesigner(serviceId: ID! value: Boolean!): Boolean!
        ChangeGoesToWorkshop(serviceId: ID! value: Boolean!): Boolean!
        DeleteService(serviceId: ID!): Boolean!
    }
`

module.exports.resolvers = {
    Query: {
        async AllServices(_, args, ctx){
            const services = await Services.find().sort([["_id",-1]])
            return services
        }
    },

    Mutation: {
        async AddServices(_,args,ctx){
            console.log(args)
            const services = new Services(args)
            var response = await services.save()
            return { id: response.id, ...response._doc }
        },
        async ChangeGoesToDesigner(_,args,ctx){
            console.log(args)
            const services = await Services.findByIdAndUpdate(args.serviceId,{goseToDesigner: args.value})
            console.log(services)
            return true
        },
        async ChangeGoesToWorkshop(_,args,ctx){
            console.log(args)
            const services = await Services.findByIdAndUpdate(args.serviceId,{GoseToWorkshop: args.value})
            return true
        },
        async DeleteService(_,args,ctx){
            console.log(args)
            const services = await Services.findByIdAndDelete(args.serviceId)
            return true
        }
    }
}