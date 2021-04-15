const mongoose = require('mongoose');
const CardSchema = mongoose.Schema({

  cartArray : { type: Array,
  required:true },
// image: {
//        type: String,
//       //  required: true
//       },
// title: {
//        type: String,
//       //  required: true,
//       },
// quantity: {
//   type: String,
//   // required: true
//      },
// points: {
//   type: Number,
//   // required: true
// },
// itemId:{
//   type: Number,
//   // required: true
// }
itemId:{
type:String
},
quantity:{
type:Number,
},

employeeID:{
  type: String,
 required: true
},


});
  module.exports = mongoose.model('CardSchema', CardSchema);
