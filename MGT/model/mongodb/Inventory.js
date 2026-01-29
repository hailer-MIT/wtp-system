const {Schema, model} = require('mongoose')

module.exports = model("Inventorys", new Schema({
    itemCode: {type: String, trim: true, required: true},
    itemName: {type: String, trim: true, required: true},
    unit: {type: String, trim: true, required: true},
    size: {type: String, trim: true},
    thickness: {type: String, trim: true},
    serialNumber: {type: String, trim: true},
    type: {type: String, trim: true},
    color: {type: String, trim: true,},
    quantity: {type: Number, required: true},
    remark: {type: String, trim: true},
    assetType: {type: String, trim: true, required: true},
    cratedAt: {type:Date, default: Date.now()},
}))

// .index({ itemName: 1, color: 1}, { unique: true })