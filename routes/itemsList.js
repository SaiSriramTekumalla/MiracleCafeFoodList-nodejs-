const express = require('express');
const router = express.Router();
const itemsSchema = require('../models/itemsSchema');
const userFavourites = require('../models/userFavourites');
const cart = require('../models/card');
const orders = require('../models/ordersSchema')
const db = require('../app')
const upload = require('../middleware/upload');
const imageConvert = require('../middleware/imageconversion')
const counterSchema = require('../models/counterSchema')
// const uploads = require('../uploadsFolder')

let MongoClient = require('mongodb').MongoClient;
// const ordersSchema = require('../models/ordersSchema');


// localhost:8000/itemList/all (get)            [Get all Menu list]

router.post('/allMealTypes', async (req, res) => {
  try {
    console.log("reqafsda",req.body.mealType)
    var getAllItemsList 
    if (req.body.mealType === "") {
      console.log("if")
      getAllItemsList =  await itemsSchema.find().lean();
      console.log('asdfsdaf',getAllItemsList)
      getAllItemsList.forEach( x => {
        // console.log("xzdfafddafa",x.image)
        if(x.image !== null && x.image !== undefined)
        {
          console.log("ifsdfsadf")
          x['image'] = fileToBase64(x['image'])

        }
      })
      res.json(getAllItemsList)
    }
    else {
      getAllItemsList = await itemsSchema.find({ mealType: req.body.mealType })
      getAllItemsList.forEach(x => {
        x['image'] = fileToBase64(x['image'])
      })
      res.json(getAllItemsList)
    }
    // let brk = [], lch = [], snc = [], din = [], dik = [];
    // getAllItemsList.filter(food => {
    // /
    // if (food.mealType === 'Breakfast') {
    //   brk.push(food);
    // }
    // else if (food.mealType === 'Lunch') {
    //   lch.push(food);
    // }
    // else if (food.mealType === 'Dinner') {
    //   din.push(food);
    // }
    // else if (food.mealType === 'Snack') {
    //   snc.push(food);
    // }
    // else {
    //   dik.push(food)
    // }
    // })
    // res.json([brk, lch, din, snc, dik])
  }
  catch (err) {
    res.json([]);
  }
});

router.get('/all', async (req, res) => {
  console.log("all ")
  try {
    const getAllItemsList = await itemsSchema.find();
    getAllItemsList.forEach(x => {
      console.log("x")
      x['image'] = fileToBase64(x['image'])
    })
    res.json(getAllItemsList);
  }
  catch (err) {
    res.json({ message: err });
  }
});


// localhost:8000/itemList/allEmployees
router.get('/allEmployees', async (req, res) => {
  try {
    const Employees = await userFavourites.find({ role: "employee" });
    res.json(Employees);
  }
  catch (err) {
    res.json({ message: err });
  }
});



// localhost:8000/itemList/allFav (get)        [Get menu by favoutite items]

router.get('/allFav', async (req, res) => {
  try {
    const getAllFavrouites = await userFavourites.find();
    res.json(getAllFavrouites);
    // console.log('favrouites table list', getAllFavrouites)
  }
  catch (err) {
    res.json({ message: err });
    // console.log('favrouites table list error', err)
  }
});

//localhost:8000/itemList/getByCredentials     (get)   [Get user credentials]

router.get('/getByCredentials', async (req, res) => {
  try {
    // console.log(req.query);
    const credentials = await userFavourites.find({ username: req.query.username, password: req.query.password });
    res.json({ status: "success", data: credentials });
  }
  catch (err) {
    res.json({ message: err });
  }
});

//localhost:8000/itemList/addMenu  (post)       [Insert menu Items]

router.post('/addMenu', upload.single('image'), async (req, res) => {
  console.log(req.body);
  try {
    const postAllItemList = new itemsSchema({
      itemId: await getSequenceNextValue("itemId2"),
      title: req.body.title,
      points: req.body.points,
      // itemValue:req.body.itemValue,
      // itemId: req.body.itemId,
      dietType: req.body.dietType,
      mealType: req.body.mealType,
      // likes: req.body.likes,
      availability: req.body.availability,
      description: req.body.description,
      content: req.body.content,
      availableTime: req.body.availableTime,
      productionTime: req.body.productionTime,
      isLiked: 0
    })
    console.log("post all items", postAllItemList)
    if (req.file) {
      postAllItemList.image = req.file.path
    }

    const savedList = await postAllItemList.save();
    res.json(savedList);
  }
  catch (err) {
    res.json({ message: err.message });
  }
});




//   localhost:8000/itemList/updateLikes
router.put('/updateLikes', (req, res) => {
  // console.log('req.body', req.body);
  itemsSchema.findOneAndUpdate({
    'itemId': req.body.itemId
  },
    { $set: { 'likes': req.body.likes } }, { new: true }, (err, doc) => {
      if (!err) {
        res.send(doc)
        // console.log('res',doc);
      }
      else {
        console.log('Not updated' + JSON.stringify(err, undefined, 2));                                   //Display error if not updated
      }
    });
});





//localhost:8000/itemList/getByitemName?itemName=lable   (get)          [Get theMenu itemlist by title]

router.get('/getByitemName', async (req, res) => {
  var t = req.query.t;
  try {
    const itemTitle = await itemsSchema.find({ title: req.query.itemName });
    res.json(itemTitle);
  }
  catch (err) {
    res.json({ message: err });
  }


});

//localhost:8000/itemList/searchByItem  (get)

router.get('/searchByItem', async (req, res) => {
  try {
    console.log("req", req.query.title)
    if (req.query.title === "" || req.query.title === null) {
      console.log("empty search")
      itemsSchema.find(function (err, docs) {
        res.json(docs)
      })

    }
    var item = '/' + req.query.title + '/i'
    //console.log(item)
    // {$or : [{title :  fname}, { mealtype: fname },{foodtype : fname} ]}
    itemsSchema.find({ $or: [{ title: new RegExp(req.query.title, 'i') }, { content: new RegExp(req.query.title, 'i') }] }, null, function (err, docs) {

      docs.forEach(x => {
        x['image'] = fileToBase64(x['image'])
      })
      // console.log(docs)
      res.json(docs)
    })

  }
  catch (err) {
    //   console.log("error", err);
    res.json({ message: err });
  }
});


router.get('/getByItemTitle', async (req, res) => {
  try {
    var exists = await userFavourites.find({ username: req.query.username }, { bookmarks: 1 })
    var cartItem = await cart.find({ employeeID: req.query.employeeID })
    console.log("cart------------>", cartItem)
    console.log(req.query.title, req.query.username, exists)
    var item = '/' + req.query.title + '/i'
    //console.log(item)
    // {$or : [{title :  fname}, { mealtype: fname },{foodtype : fname} ]}
    var mealTypeItem = await itemsSchema.find({ title: req.query.title }).lean()
    //  console.log(mealTypeItem)
    mealTypeItem.forEach(x => {
      if (exists[0].bookmarks.includes(x._id)) {
        x['isLiked'] = 1
      }
      else {
        x['isLiked'] = 0
      }

      if (cartItem.includes(x._id)) {
        x['cartAvailability'] = true
      }

      else {
        x['cartAvailability'] = false
      }


      x['image'] = fileToBase64(x['image'])
    })
    // docs['image'] = fileToBase64(docs['image'])
    // console.log(docs)
    res.json(mealTypeItem)

  }
  catch (err) {
    //   console.log("error", err);
    res.json({ message: err });
  }
});

router.get('/getByItemContent', async (req, res) => {
  try {
    var exists = await userFavourites.find({ username: req.query.username }, { bookmarks: 1 })
    // console.log(req.query.title)
    var item = '/' + req.query.title + '/i'
    //console.log(item)
    console.log(req.query.title)

    var result = await itemsSchema.find({ content: new RegExp(req.query.title, 'i') }).lean()
    // console.log(docs)
    result.forEach(x => {
      if (exists[0].bookmarks.includes(x._id)) {
        x['isLiked'] = 1
      }
      else {
        x['isLiked'] = 0
      }
      x['image'] = fileToBase64(x['image'])
    })
    res.json({ result })


  }
  catch (err) {
    console.log("error", err);
    res.json({ message: err });
  }
});




//localhost:8000/itemList/getByDietType?dietTyp=lable   (get)

router.get('/getByDietType', async (req, res) => {
  try {
    var exists = await userFavourites.find({ username: req.query.username }, { bookmarks: 1 })
    const dietTypeItem = await itemsSchema.find({ dietType: req.query.dietType }).lean();
    dietTypeItem.forEach(x => {
      if (exists[0].bookmarks.includes(x._id)) {
        x['isLiked'] = 1
      }
      else {
        x['isLiked'] = 0
      }
      x['image'] = fileToBase64(x['image'])
    })
    res.json(dietTypeItem);
  }
  catch (err) {
    res.json({ message: err });
  }
});

  //localhost:8000/itemList/getByMealType?mealType=Lunch&&username=ssetty (get)

router.get('/getByMealType', async (req, res) => {
  console.log("reached")
  try {
    var exists = await userFavourites.find({ username: req.query.username }, { bookmarks: 1 })
    console.log("exists", exists)
    if (req.query.title === "") {
      let mealTypeItem = []
      mealTypeItem = await itemsSchema.find().lean()
      mealTypeItem.forEach(x => {
        console.log("meal type for loop")
        if (exists[0].bookmarks.includes(x._id)) {
          x['isLiked'] = 1
        }
        else {
          x['isLiked'] = 0
        }

        x['image'] = fileToBase64(x['image'])
      })
      res.json(mealTypeItem)
    }
    else if (req.query.title !== "") {
      let mealTypeItem = []
      console.log("meal", req.query.mealType)
      mealTypeItem = await itemsSchema.find({ mealType: new RegExp(req.query.mealType, 'i') }).lean();
      // console.log("meal result", mealTypeItem)

      // mealTypeItem = await itemsSchema.find().lean()
      mealTypeItem.forEach(x => {
        console.log("meal type for loop")
        if (exists[0].bookmarks.includes(x._id)) {
          x['isLiked'] = 1
        }
        else {
          x['isLiked'] = 0
        }

        x['image'] = fileToBase64(x['image'])
      })

      res.json(mealTypeItem);
    }

  }
  catch (err) {
    res.json({ message: err });
  }
});


//localhost:8000/itemList/getByFilterData  (post)

var fs = require('fs');
const { constants } = require('buffer');
const { array } = require('../middleware/upload');
const { isArray } = require('util');
const { get } = require('mongoose');
const { Z_ASCII } = require('zlib');

function fileToBase64(filename) {
  if (filename !== undefined && filename !== null)  {
    // var filename = filename;
    // console.log(filename)
    var binaryData = fs.readFileSync(filename)
    var base64String = new Buffer.from(binaryData).toString("base64")
    // console.log(base64String)  


    // base64_s.push(base64String)
    // console.log(base64String)
    return base64String
  }


}



router.post('/getByFilterData', async (req, res) => {
  try {

    var exists = await userFavourites.find({ username: req.body.userName }, { bookmarks: 1 })
    // console.log("req",req.body,"exists",exists)
    // console.log("query")
    var mealQuery = [];
    var query = {};
    if (req.body.mealType.length) {
      req.body.mealType.forEach(element => {
        mealQuery.push({ mealType: element })
      });
      query = { $or: mealQuery }
    }
    if (req.body.dietType != '') {
      query.dietType = req.body.dietType;
    }
    // console.log("query1")
    let mealTypeItem = []
    mealTypeItem = await itemsSchema.find(query).lean();
    if (req.body.isFav == "true") {
      const favResult = await userFavourites.find({ username: req.body.userName })
      console.log('favResult', favResult[0].favourites);
      var favItems = favResult[0].favourites;
      var itemslist = mealTypeItem;
      var allFilters = [];
      itemslist.forEach(element => {
        if (favItems.includes(element.title)) {
          allFilters.push(element);
        }
      });
      // console.log("allFilters", allFilters.length);
      res.json(allFilters);
    }
    else {
      // console.log('else response')
      // var mealItems = Object.assign({},mealTypeItem)

      // mealItems[0].test = 'sampletext'
      // console.log("meal items ---->",mealItems);
      mealTypeItem.forEach(x => {
        if (exists[0].bookmarks.includes(x._id)) {
          x['isLiked'] = 1
        }
        else {
          x['isLiked'] = 0
        }

        x['image'] = fileToBase64(x.image)
        // console.log("new ssssssssssssssssssssx",x)
      })

      // console.log("resutl%%%%%%%%%%%%%%%%55",mealTypeItem)

      res.json(mealTypeItem);
    }
  }
  catch (err) {
    console.log(err)
  }
});

//localhost:8000/itemList/addcartItems   (post)  (Post cart Items)

router.post('/addCartItems', async (req, res) => {
  console.log("cartItems reqbody", req.body);

  try {
    let query
    let cartItems
    const getAllCartList = await cart.findOne({
      employeeID: req.body.employeeID
    })

    console.log("cartLsit", getAllCartList)
    if (getAllCartList && getAllCartList.cartArray) {
      console.log("if", getAllCartList)
      query = [...getAllCartList.cartArray, { quantity: req.body.quantity, itemId: req.body.itemId }]
      console.log(query)
      cartItems = await cart.findOneAndUpdate({ employeeID: req.body.employeeID }, { cartArray: query })
      console.log("cart itemsssssssssss1", cartItems);
    }
    else {
      query = [{ cartArray: { quantity: req.body.quantity, itemId: req.body.itemId }, employeeID: req.body.employeeID }]

      cartItems = await new cart(...query).save();
      console.log("cart itemsssssssssss2", cartItems);
    }

    // console.log("query",query)
    // console.log("new user",cartItems)

    // const savedCartList = await postCartItems.save();
    res.json({ success: "Added To Cart Successfully", cartItems });
  }

  // if (err) {
  //   res.json({ message: err });
  // }
  // }
  catch (err) {
    res.json({ message: err.message });
  }

});

//localhost:8000/itemList/updateCart/

router.put('/updateCart',async (req, res) => {

  console.log('req.body', req.body);
  // userFavourites.updateOne({ "username": name }, { $set: { "favourites": favourites, "allergies": allergies, "days": days, "diet": diet, "points": points } },
  var userCart = await cart.find({employeeID:req.body.employeeID})
    userCart[0].cartArray.filter(x => {
      // console.log("ssfsdfwerwerwer",x.itemId,req.body.itemI)
      if(x.itemId == req.body.itemId)
      {
        x.quantity = req.body.quantity
        console.log("sfasdf",x)
      }
      return x;
    })
    // console.log("iserr",userCart)
    // await cart.findOneAndUpdate({employeeID:req.body.employeeID},{cartArray:userCart[0].cartArray})
    console.log("userCart",userCart)
    res.json({success:"Cart Updated Successfully", data : userCart })
});


router.put('/', (req, res) => {
  //console.log(req);
  cart.findOneAndDelete({ 'cartArray.title': req.body.title }, (err, doc) => {
    if (!err) {
      res.send(doc)
    }
    else {
      console.log('Not deleted' + JSON.stringify(err, undefined, 2));
    }
  })
})

async function getSequenceNextValue(seqName) {
  console.log({ _id: seqName }, { $inc: { sequenceValue: 1 } })
  var seqDoc = await counterSchema.findOneAndUpdate({ _id: seqName }, { $inc: { sequenceValue: 1 } });
  console.log("seq", seqDoc)
  return seqDoc.sequenceValue
}
router.post('/deleteCartArray', (req, res) => {
  console.log("req", req.body.cartDetails);
  // let ressss = getNextSequenceValue("orderId")
  cart.deleteOne({ 'employeeID': req.body.employeeID }, async (err, doc) => {
    if (!err) {
      const orderDetails = await orders.find({ 'employeeID': req.body.employeeID });
      // console.log("orderDetails", orderDetails);
      // let newItemId = 
      // console.log(newItemId)
      const myOrders = new orders({
        // _id: await getSequenceNextValue("itemId"),
        orderDetails: req.body.cartDetails,
        employeeID: req.body.employeeID,
        status: "In progress",
        // mealType:req.body.cartDetails.mealType,
        date: req.body.date
      })
      // console.log("my orders", myOrders, "ressss", ressss)
      const result = await myOrders.save();
      res.json({ message: result });

    }
    else {
      console.log('Error in Deleting', JSON.stringify(err, undefined, 2));
    }
  });
});

router.get('/getOrders', async (req, res) => {
  // console.log("requ query", req.query)
  // const allOrders = await orders.find({ 'employeeID': req.query.employeeID });
  orders.find({ 'employeeID': req.query.employeeID }, function (err, docs) {
    console.log("order docs-------------------------------------->", docs)

    // for(let i = 0;i<=docs.length;)
    if (!err) {
      docs.forEach(x => {
        // console.log("x--------->",x)
        x.orderDetails.forEach(async y => {
          // y['image'] = fileToBase64(y['image'])
          var itemMealType = await itemsSchema.findOne({ title: y.title }, { mealType: 1 })
          y.mealType = itemMealType.mealType
          // console.log("ysssssssssss",y,itemMealType);
        })
      })
      res.json(docs)
      // console.log("orders list ---->", docs)
    }

    else {
      res.send("No Items", err.message)
    }


  })
})

router.post('/deleteCartItem', (req, res) => {
  // console.log({employeeID : req.query.employeeID},{$pull:{"cartArray" : {"itemId":req.query.itemId}}})
  // cart.findOneAndDelete({$and : [{'employeeID': req.body.emitemListployeeID},{ "title" : req.body.title }]},(err,doc)=>{
  cart.updateOne({ employeeID: req.body.employeeID }, { $pull: { "cartArray": { "itemId": req.body.itemId } } }, (err, doc) => {
    if (!err) { res.send(doc); }
    else {
      console.log('Not deleted' + JSON.stringify(err, undefined, 2));
    }
  })
}
);

//  localhost:8000/itemList/getAllCart   (get)

router.get('/getAllCart', async (req, res) => {
  // console.log("cart response", req.query);
  try {
    var allItems = []
    const getAllCartList = await cart.find({
      employeeID: req.query.empId
    })
 
    let cartArray =  getAllCartList[0].cartArray;
    for (let index = 0; index < cartArray.length; index++) {
       let itemData = await itemsSchema.findOne({ _id: cartArray[index].itemId });
      allItems.push({
        itemId: itemData._id,
        points: itemData.points,
        // image: fileToBase64(itemData.image),
        title: itemData.title,
        ratings: itemData.likes,
        quantity: cartArray[index].quantity,
        totalPoints: itemData.points * cartArray[index].quantity
      })
    }
     
    res.json({ allItems, message: "Success" });
  }



  catch (err) {
  console.log(err.message)
    res.json([]);
  }
});

// localhost:8000/itemList/addFavrouties  (post)            [Post the favoutite items]

router.post('/addFavrouties', async (req, res) => {
  // console.log(req.body);
  const postAllFavrouites = new userFavourites({
    username: req.body.username,
    password: req.body.password,
    favourites: req.body.favourites,
    employeeID: req.body.employeeID
  })
  try {
    const savedFavList = await postAllFavrouites.save();
    res.json(savedFavList);
  }
  catch (err) {
    res.json({ message: err });
  }
});


router.get('/:username/:password', (req, res) => {
  var name = req.params.username;
  var password = req.params.password;
  userFavourites.find({ $and: [{ username: name }, { password: password }] }, (err, doc) => {
    if (!err) {
      res.send(doc);
    }
    else if (!err) {
      return res.status(400).send(`No records found with id: ${req.params.username}`);
    }
  });
});



router.get('/:username', (req, res) => {
  var name = req.params.username;
  userFavourites.find({ username: name }, (err, doc) => {
    if (!err) {
      res.send(doc);
    }
    else if (!err) {
      return res.status(400).send(`No records found with id: ${req.params.username}`);
    }
  });
});





router.put('/:username', (req, res) => {
  var name = req.params.username;
  diet = req.body.diet,
    days = req.body.days,
    favourites = req.body.favourites,
    allergies = req.body.allergies,
    points = req.body.points
  userFavourites.updateOne({ "username": name }, { $set: { "favourites": favourites, "allergies": allergies, "days": days, "diet": diet, "points": points } },
    { new: true }, (err, doc) => {
      if (!err) {
        res.send(doc);
      }
    })
});



router.put('/cart/:username', (req, res) => {

  var name = req.params.username;

  cart = req.body.cart;


  userFavourites.updateOne({ "username": name }, { $set: { "cart": cart } },

    { new: true }, (err, doc) => {
      if (!err) {
        res.send(doc);
      }
      else {

      }

    })
});

router.post('/', upload.single('userImage'), (req, res) => {
  // console.log(req);
  var user = new userFavourites({
    username: req.body.username,
    password: req.body.password,
    dob: req.body.dob,
    employeeID: req.body.employeeID,
    department: req.body.department,
    anniversary: req.body.anniversary,
    diet: req.body.diet,
    days: req.body.days,
    favourites: req.body.favourites,
    allergies: req.body.allergies,
    userImage: req.file.path,
    role: req.body.role
  });
  user.save((err, doc) => {
    if (!err) {
      res.send(doc);
    }
    else { console.log('Error while inserting: ' + JSON.stringify(err, undefined, 2)); }
  })
});




//localhost:8000/itemList/deleteMenu/31
// router.delete('/deleteMenu/:itemId', (req, res) => {
//   itemsSchema.deleteOne({ itemId: req.params.itemId },
//     { new: false }, (err, doc) => {
//       if (!err) {
//         res.json({success:"Deleted Succesfully"});
//       }
//       else {
//         console.log('Not deleted' + JSON.stringify(err, undefined, 2));
//       }
//     });
// });


//  localhost:8000/itemList/updateFoodItem

router.post('/updateFoodItem', (req, res) => {
  // console.log("req body", req.body)
  var modelObject = {
    itemId: req.body.itemId,
    title: req.body.title,
    mealType: req.body.mealType,
    points: req.body.points,
    dietType: req.body.dietType,
    availability: req.body.availability
  };
  itemsSchema.findOneAndUpdate({ "itemId": req.body.itemId }, { $set: modelObject }, { new: true }, (err, doc) => {
    if (!err) {
      // console.log(doc)
      res.send(doc)
    }
    else {
      console.log('Not updated' + JSON.stringify(err, undefined, 2));
    }
  });
});


router.delete('/deleteMenu/:itemId',async (req,res) => {
  try{
    var deleteResult = await itemsSchema.deleteOne({itemId:req.params.itemId})
    res.json({success:"Deleted Successfully"})
  }
  catch (err) {
    res.json({ message: err.message })
  }

});
 
