const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateIndia = moment(Date.now()).tz("Asia/Kolkata").format().split("+")[0];
const ordersSchema = mongoose.Schema({

  orderDetails: {
    type: Array,
    required: true
  },

  employeeID: {
    type: String,
    required: true
  },
//   _id:{
// type:Number
//   },
totalOrderPoints:{
  type:Number
},
  status:{
    type:String
  },
  // mealType: {
  //   type: String,
  //   required: true
  // },
  date:{
    type:String,
    default:dateIndia
  }
});
module.exports = mongoose.model('ordersSchema', ordersSchema);
