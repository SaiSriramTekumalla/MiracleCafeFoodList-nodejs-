const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateIndia =  moment(Date.now()).tz("Asia/Kolkata").format().split("+")[0];
const passBookSchema = mongoose.Schema({
    updatedTime:{
        type:String,
        default:dateIndia
    },
   pointsAvailable:{
       type:Number
   },
   transactionDetails:{
    type:Array
   },
//    pointsSpent:{
//     type:Number
//    },
   employeeID:{
       type:Number
   },
//    transactionReason:{
//        type:String
//    },
//    transactionType:{
//        type:String
//    }

})
// passBookSchema.set('timestamps', true);
module.exports = mongoose.model('passBookSchema', passBookSchema);