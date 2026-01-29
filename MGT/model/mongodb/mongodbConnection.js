const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false)
const mongodbConnection = mongoose.connect(process.env.MONGODB_CONNECTION_URL,{ enableUtf8Validation: true })
    .then(() => console.log('mongodb connected'))
    .catch((err) => console.log(err));



module.exports = mongodbConnection