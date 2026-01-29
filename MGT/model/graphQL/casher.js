const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const casher = require("../mongodb/casher");
const order = require("../mongodb/order");
const otp = require('../mongodb/otp');
const { login, forgotPassword, sendOtp } = require('../../util/functions');


module.exports.typeDef = `
    type Casher {
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
    scalar Date
    type Otp {
        id: ID!
        code: Int!
        expireAt: Date!
    }
        extend type Query {
            GetMeForCasher: Casher!
        }
    
        extend type Mutation {
            CasherLogin(phoneNumber: Int!, password: String!): Casher!  
            AddCasher(fullName: String! phoneNumber: Int!): Casher!  
            CasherForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): Casher!  
            CasherSendOtp(phoneNumber: Int!): Boolean!  
            CasherDelivereOrder(orderId: ID! progress: String!): Boolean!  
        }
    
`

module.exports.resolvers = {

    Query: {
        GetMeForCasher: async (_, __, ctx) => {
            // console.log(ctx)
            const result = await casher.findOne({ id: ctx.casherId })
            return result
        },
    },

    Casher: {
        async otp(parent){
            if(parent.otpId) {
                const Otp = await otp.findOne({_id: parent.otpId})
                return Otp
            }
            return
        }
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
            return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        },
    }),

    Mutation: {
        async CasherLogin(_, args, ctx) {
            return await login(args,casher,process.env.casher_Secret)
        },

        async AddCasher(_, args, ctx) {
            args.addedBy = ctx.superAdminId
            const newCasher = new casher(args)
            var response = await newCasher.save()
            return { id: response.id, ...response._doc }
        },
        async CasherForgotPassword(_, args, ctx){
            return await forgotPassword(args,casher,process.env.casher_Secret) 
        },

        async CasherSendOtp(_,args,ctx){
            return await sendOtp(args, casher)
        },
        async CasherDelivereOrder(_,args,ctx){
            if(args.progress == "Delivered"){
                const Order = await order.findByIdAndUpdate(args.orderId,{"progress": "Delivered"})
            return true
        }
        return false
        },
    }
}