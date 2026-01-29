const { login, forgotPassword, sendOtp } = require('../../util/functions');
const accountant = require('../mongodb/accountant')

module.exports.typeDef = `
    type Accountant {
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
        AccountantLogin(phoneNumber: Int!, password: String!): Reception!  
        AccountantForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): Reception!  
        AccountantSendOtp(phoneNumber: Int!): Boolean!  
    }
`

module.exports.resolvers = {
    
        
    Mutation: {
        async AccountantLogin(_,args,ctx){
            return await login(args,accountant,process.env.accountant_Secret)
        },
        async AccountantForgotPassword(_, args, ctx){
            return await forgotPassword(args,accountant,process.env.accountant_Secret) 
        },

        async AccountantSendOtp(_,args,ctx){
            return await sendOtp(args, accountant)
        },
        
    }
}