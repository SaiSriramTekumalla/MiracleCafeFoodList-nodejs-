const mongoose = require('mongoose');

const passBookSchema = mongoose.Schema({ 
   pointsAvailable:{
       type:Number
   },
   transactionDetails:{
    type:Array
   },
   employeeID:{
       type:Number
   },
   pointsAssigned:{
    type:Number
  },
  pointsAssignedTo:{
      type:String
  }
})
// passBookSchema.set('timestamps', true);
module.exports = mongoose.model('passBookSchema', passBookSchema);