const mongoose = require('mongoose');
const counterSchema = mongoose.Schema({
    _id:{
        type:String
    },
    sequenceValue: {
        type:Number
    }
})

module.exports = mongoose.model('counterSchema', counterSchema);