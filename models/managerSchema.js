const mongoose = require('mongoose');
const managerSchema = mongoose.Schema({
    employeeDetails:{
        type:Array
    },
    totalPoints: {
        type:Number,
        default :0
    }
})

module.exports = mongoose.model('managerSchema', managerSchema);