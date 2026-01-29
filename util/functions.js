require('dotenv').config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const otp = require('../model/mongodb/otp');
const otpGenerator = require('otp-generator')
const { GraphQLError } = require('graphql');



sendSMS = (phoneNumber, message) => {
    let apiKey = process.env.sms_Tocken;
    fetch('https://api.httpsms.com/v1/messages/send', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "content": message,
            "from": process.env.send_SMS_From,
            "to": phoneNumber
        })
    })
        .then(res => res.json()).then((data) => console.log(data));
    return true
}

module.exports.login = async (args, Model,Secret) => {
    // check if account exists
    const result = await Model.findOne({ phoneNumber: args.phoneNumber })
    console.log(result)
    if (!result) {
        throw new GraphQLError(`Incorrect phone number or password`, {
            extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
        });
    }
    
    // verify activation
    if(result._doc.deactivated)throw new GraphQLError(`Account Deactivated`, {
        extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
    });
    // verify password
    if(!result._doc.password)throw new GraphQLError(`Incorrect phone number or password`, {
        extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
    });
    

    
    const passwordIsValid = await bcrypt.compare(args.password, result._doc.password);
    if (!passwordIsValid) throw new GraphQLError(`Incorrect phone number or password`, {
        extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
    });
    result._doc.password = ""
    const token = jwt.sign({ id: result.id, ...result._doc }, Secret);
    result._doc.token = token
    return { id: result.id, ...result._doc }
}

module.exports.forgotPassword = async (args, Model,Secret) => {
    const result = await Model.findOne({ phoneNumber: args.phoneNumber})
    if (result) {
        // verify activation
        if(result._doc.deactivated)throw new GraphQLError(`Account Deactivated`, {
            extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
        });
        if (args.password == args.confirmPassword) {
            const Otp = await otp.findOne({ _id: result.otpId })

            if (Otp && Otp.code === args.otp) {
                const hashPassword = await bcrypt.hash(args.password, 10);
                args.password = hashPassword
                // update password
                const updatedReception = await Model.findOneAndUpdate({ _id: result.id }, { password: args.password, })

                // jwt sign
                const token = jwt.sign({ id: updatedReception.id, ...updatedReception._doc }, Secret);
                updatedReception._doc.token = token
                return updatedReception
            }
            throw new GraphQLError(`Wrong OTP Code`, {
                extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
            });
        }
        throw new GraphQLError(`Password not matched`, {
            extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
        });
    }

    throw new GraphQLError(`Error ocurred Contact the admin`, {
        extensions: { code: 'BAD_USER_INPUT', http: { status: 404 } },
    });
}

module.exports.sendOtp = async (args, Model) => {
    var result = await Model.findOne({ phoneNumber: args.phoneNumber })
    if (result) {
        // verify activation
        if(result._doc.deactivated)throw new GraphQLError(`Account Deactivated`, {
            extensions: { code: 'BAD_USER_INPUT', http: { status: 400 } },
        });
        const otpCode = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const newOtp = new otp({ code: otpCode })
        var response = await newOtp.save()
        result = await Model.findByIdAndUpdate(result.id, { otpId: response.id })
        sendSMS(`+251${args.phoneNumber}`, `Your WTP Code is ${otpCode}`)
        return true
    }
    throw new GraphQLError(`Error ocured Contact the admin`, {
        extensions: { code: 'BAD_USER_INPUT', http: { status: 404 } },
    });
}
module.exports.subscriptionAuth = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.designer_Secret);
    return { ...decoded, role: "Designer" };
  } catch (err) {
    try {
      const decoded = jwt.verify(token, process.env.workShop_Secret);
      return { ...decoded, role: "WorkShop" };
    } catch (err) {
      try {
        const decoded = jwt.verify(token, process.env.cashier_Secret);
        return { ...decoded, role: "Cashier" };
      } catch (err) {
        try {
          const decoded = jwt.verify(token, process.env.reception_Secret);
          return { ...decoded, role: "Reception" };
        } catch (err) {
          try {
            const decoded = jwt.verify(token, process.env.manager_Secret);
            return { ...decoded, role: "Manager" };
          } catch (err) {
            try {
              const decoded = jwt.verify(token, process.env.superAdmin_Secret);
              return { ...decoded, role: "SuperAdmin" };
            } catch (err) {
              try {
                const decoded = jwt.verify(token, process.env.accountant_Secret);
                return { ...decoded, role: "Accountant" };
              } catch (err) {
                try {
                  const decoded = jwt.verify(
                    token,
                    process.env.inventoryClerk_Secret
                  );
                  return { ...decoded, role: "InventoryClerk" };
                } catch (err) {
                  return null;
                }
              }
            }
          }
        }
      }
    }
  }
};