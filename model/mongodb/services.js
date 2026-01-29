const { Schema, model } = require('mongoose')
module.exports = model('Services', new Schema({
    name: { type: String, trim: true, required: true },
    descriptionGuideLine: { type: String, trim: true },
    goseToDesigner: { type: Boolean, required: true },
    GoseToWorkshop: { type: Boolean, required: true },
    inventoryItems: [{
        inventoryItem: { type: Schema.Types.ObjectId, ref: 'Inventorys' },
        quantityPerUnit: Number
    }]
}))