const {Schema,model} = require('mongoose')


module.exports = model('counter', new Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
}));

