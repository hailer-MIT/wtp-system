const {Schema,model} = require('mongoose')
module.exports = model('WorkShopes', new Schema({
    fullName: { type: String, trim: true, required: true },
    phoneNumber: { type: Number, required: true, unique: true},
    password: {type: String, default: "$2b$10$PZ.0dhQ/pHUXQigROicNPeihUFjSGaSagWZhwloXpu8APZYyXrko6"},
    deactivated: { type: Boolean, default: false },
    otpId: { type: Schema.Types.ObjectId, ref: 'Otp'},
    addedBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmins', required: true},
}))