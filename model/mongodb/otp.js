const { Schema, model } = require('mongoose')

module.exports = model('Otp', new Schema({
    code: { type: Number, required: true },
    expireAt: { type: Date, expires: '120s', default: Date.now },
}))