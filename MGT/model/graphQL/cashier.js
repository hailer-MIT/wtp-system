const { login, forgotPassword, sendOtp } = require('../../util/functions');
const cashier = require('../mongodb/cashier')

module.exports.typeDef = `
    type Cashier {
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
        CashierLogin(phoneNumber: Int!, password: String!): Reception!  
        CashierForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): Reception!  
        CashierSendOtp(phoneNumber: Int!): Boolean!  
    }
`

module.exports.resolvers = {
    
        
    Mutation: {
        async CashierLogin(_,args,ctx){
            return await login(args,cashier,process.env.cashier_Secret)
        },
        async CashierForgotPassword(_, args, ctx){
            return await forgotPassword(args,cashier,process.env.cashier_Secret) 
        },

        async CashierSendOtp(_,args,ctx){
            return await sendOtp(args, cashier)
        },
        
    }
}