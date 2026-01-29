const {Schema, model} = require('mongoose')

module.exports = model("InventoryFlow",new Schema({
    inventoryProductId: {type: Schema.Types.ObjectId, ref: "Inventorys", required: true},
    operation: {type: String, trim:true, required: true},
    quantity: {type:Number, required:true},
    inventoryClerkId: {type:Schema.Types.ObjectId, ref:"InventoryClerks"},
    cratedAt: {type:Date, default: Date.now()},
}))