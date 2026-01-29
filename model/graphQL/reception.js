const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const reception = require("../mongodb/reception");
const order = require("../mongodb/order");
const otp = require('../mongodb/otp');
const { login, forgotPassword, sendOtp } = require('../../util/functions');


module.exports.typeDef = `
    type Reception {
        id: ID!
        fullName: String!
        phoneNumber: Int!
        password: String
        deactivated: Boolean!
        otpId: ID
        otp: Otp
        addedBy: ID!
        token: String
        photo: String
    }
    scalar Date
    type Otp {
        id: ID!
        code: Int!
        expireAt: Date!
    }
        extend type Query {
            GetMeForReception: Reception!
        }
    
        extend type Mutation {
            ReceptionLogin(phoneNumber: Int!, password: String!): Reception!  
            AddReception(fullName: String! phoneNumber: Int!): Reception!  
            ReceptionForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): Reception!  
            ReceptionSendOtp(phoneNumber: Int!): Boolean!  
            ReceptionDelivereOrder(orderId: ID! progress: String!): Boolean!  
            UpdateReceptionProfile(fullName: String, phoneNumber: Int, photo: String): Reception!
        }
    
`

module.exports.resolvers = {

    Query: {
        GetMeForReception: async (_, __, ctx) => {
            // console.log(ctx)
            const result = await reception.findOne({ id: ctx.receptionId })
            return result
        },
    },

    Reception: {
        async otp(parent) {
            if (parent.otpId) {
                const Otp = await otp.findOne({ _id: parent.otpId })
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
        async ReceptionLogin(_, args, ctx) {
            return await login(args, reception, process.env.reception_Secret)
        },

        async AddReception(_, args, ctx) {
            args.addedBy = ctx.superAdminId
            const newReception = new reception(args)
            var response = await newReception.save()
            return { id: response.id, ...response._doc }
        },
        async ReceptionForgotPassword(_, args, ctx) {
            return await forgotPassword(args, reception, process.env.reception_Secret)
        },

        async ReceptionSendOtp(_, args, ctx) {
            return await sendOtp(args, reception)
        },
        async ReceptionDelivereOrder(_, args, ctx) {
            if (args.progress == "Delivered") {
                const Order = await order.findByIdAndUpdate(args.orderId, { "progress": "Delivered", deliveredDate: Date.now() })
                return true
            }
            return false
        },
        async UpdateReceptionProfile(_, args, ctx) {
            const updateData = {};
            if (args.fullName) updateData.fullName = args.fullName;
            if (args.phoneNumber) updateData.phoneNumber = args.phoneNumber;
            if (args.photo) updateData.photo = args.photo;

            const updated = await reception.findByIdAndUpdate(
                ctx.receptionId,
                updateData,
                { new: true }
            );
            return { id: updated.id, ...updated._doc };
        },
    }
}