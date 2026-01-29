const {model, Schema} = require('mongoose')

module.exports = model('Files', new Schema({
    fileName: String,
    extension: String,
    description: String,
    for: {type: String, trim: true, required: true}
}))


