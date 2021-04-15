const mongoose = require('mongoose');
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

  status:{
    type:String
  },
  // mealType: {
  //   type: String,
  //   required: true
  // },
  date:{
    type:String,
    // required:true
  }
});
module.exports = mongoose.model('ordersSchema', ordersSchema);
