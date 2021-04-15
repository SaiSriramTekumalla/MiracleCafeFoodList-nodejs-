const mongoose = require('mongoose');
const FavSchema = mongoose.Schema({
username: {
       type: String,
       required: true
      },
password: {
       type: String,
       required: true,
      },
favourites: {
  type: Array,
  required: true
},
employeeID:{
  type:Number,
  required:true
},
dob:{
type:Date,
// required:true,
},
department:{
  type:String,
  required:true
},
anniversary:{
  type:Date,
  // required:true
},
diet:
{
  type:String,
  // required:true
},
days:
{
  type: Array,
  required: true
},
allergies:
{
  type: Array,
  required: true
},
userImage:
{
  type: String,
  required: true
},
cart:{
  type:Array,
  required:true
},
role:
{
  type: String,
  required: true
},

points:{
  type:Number,
  required:true
},
bookmarks:{
  type:Array,
}

});

  module.exports = mongoose.model('FavSchema', FavSchema);
