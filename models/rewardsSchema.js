const mongoose = require('mongoose');
const rewardsSchema = mongoose.Schema({
category:
{
  type: String,
  required: true
},
points:
{
  type: Number,
  required: true
},

});

  module.exports = mongoose.model('rewardsSchema', rewardsSchema);
