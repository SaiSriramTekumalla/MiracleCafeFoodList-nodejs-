const mongoose = require('mongoose');
const ItemsSchema = mongoose.Schema({
              // _id:{
              //        type:Number
              // },
image:{
       type:String,
       // required: true
},
title: {
       type: String,
       //required: true
      },
points: {
       type: Number,
       //required: true,
      },
itemId: {
       type: Number,
       //required: true,

      },
dietType: {
       type: String,
       //required: true
      },
mealType: {
        type: Array,
        //required: true
       },
likes: {
       type: Number,
       //required: true,
      },
availability: {
        type: Boolean,
        //required: true
       },
description: {
        type: String,
        //required: true
       },
content: {
        type: Array,
        //required: true
    },
availableTime: {
        type: String,
        //required: true
       },
productionTime: {
        type: String,     // "time":"2019-06-12T13:34:00.000" in postman
        //required: true
       }

});

  module.exports = mongoose.model('ItemsSchema', ItemsSchema);



  //localhost:8001/employees/getByEmpName?empName=sita&empId=5003 (get)


//   (post)localhost:8000/itemList/addMenu

//   {"title":"rictty",
//    "points":"22",
//    "itemId":"111",
//    "dietType":"veg",
//    "mealType":"lunch",
//    "likes":"4",
//    "availability":"afternoon",
//    "description":"good to taste",
//    "content": ["rice","water"],
//    "availableTime":"2019-06-12T13:34:00.000",
//    "productionTime":"2019-06-12T13:34:00.000"}
