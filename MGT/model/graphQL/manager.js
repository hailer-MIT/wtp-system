const { login, forgotPassword, sendOtp } = require('../../util/functions');
const manager = require('../mongodb/manager')

module.exports.typeDef = `
    type Manager {
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
        ManagerLogin(phoneNumber: Int!, password: String!): Reception!  
        ManagerForgotPassword(phoneNumber: Int! otp: Int! password: String! confirmPassword: String! ): Reception!  
        ManagerSendOtp(phoneNumber: Int!): Boolean!  
    }
`

module.exports.resolvers = {
    
        
    Mutation: {
        async ManagerLogin(_,args,ctx){
            return await login(args,manager,process.env.manager_Secret)
        },
        async ManagerForgotPassword(_, args, ctx){
            return await forgotPassword(args,manager,process.env.manager_Secret) 
        },

        async ManagerSendOtp(_,args,ctx){
            return await sendOtp(args, manager)
        },
        
    }
}