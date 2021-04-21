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
const passBookSchema = require('../models/passbookSchema')
// const uploads = require('../uploadsFolder')
const moment = require('moment-timezone');

let MongoClient = require('mongodb').MongoClient;
// let imagePath = "./conv-images";
// const fileToBase64 = require('../middleware/imageconversion');
// const ordersSchema = require('../models/ordersSchema');


// localhost:8000/itemList/all (get)            [Get all Menu list]
var mealTypeTimes = {
  "Breakfast": "8:00 am to 10:00 am",
  "Lunch": "1:00 pm to 3:00 pm",
  "Snack": "5:00 pm to 7:00 pm",
  "Drink": "5:00 pm to 7:00 pm",
  "Dinner": "8:00 pm to 10:00 pm"
}
router.post('/allMealTypes', async (req, res) => {
  try {
    console.log("reqafsda", req.body.mealType)
    var getAllItemsList
    if (req.body.mealType === "") {
      // console.log("if")
      getAllItemsList = await itemsSchema.find({},{image:0}).lean();
      // console.log('asdfsdaf',getAllItemsList)
      getAllItemsList.map(data => {
      data["image"] = fileToBase64(data['image'])
      })

    }
    else {
      getAllItemsList = await itemsSchema.find({ mealType: req.body.mealType })

    }
    res.send(getAllItemsList)

  }
  catch (err) {
    res.json({ getAllItemsList: [] });
  }
});

router.get('/getPassBook/:empId', async (req, res) => {

  try {
    console.log("pass book", req.params.empId)
    var userPassBook = await passBookSchema.find({ employeeID: req.params.empId })
    res.json({ userPassBook })
  }
  catch (err) {
    console.log(err.message)
    res.json([])
  }
});

// router.get('/getOrderDetails/:orderId', async (req, res) => {

//   try {
//     console.log("Order Id", req.params.orderId)
//     var userPassBook = await ordersSchema.findOne({ employeeID: req.params.orderId })
//     res.json({ userPassBook })
//   }
//   catch (err) {
//     console.log(err.message)
//     res.json([])
//   }
// });

// localhost:8000/itemList/allEmployees
router.get('/allEmployees', async (req, res) => {
  try {
    const Employees = await userFavourites.find({ role: "employee" });
    res.json(Employees);
  }
  catch (err) {
    res.json({ Employees: [] });
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
    res.json({ getAllFavrouites: [] });
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
    res.json({ credentials: [] });
  }
});

//localhost:8000/itemList/addMenu  (post)       [Insert menu Items]

router.post('/addMenu', async (req, res) => {

  // console.log(req.body);
  try {
    const postAllItemList = new itemsSchema({
      itemId: await getSequenceNextValue("itemId2"),
      title: req.body.title,
      points: req.body.points,
      // itemValue:req.body.itemValue,
      // itemId: req.body.itemId,
      image: req.body.image,
      dietType: req.body.dietType,
      mealType: req.body.mealType,
      // likes: req.body.likes,
      availability: req.body.availability,
      description: req.body.description,
      content: req.body.content,
      availableTime: req.body.availableTime,
      productionTime: mealTypeTimes[req.body.mealType],
      isLiked: 0
    })
    // console.log("post all items", postAllItemList)
    // if (req.file) {
    //   postAllItemList.image = req.file.path
    // }

    const savedList = await postAllItemList.save();
    res.json(savedList);
  }
  catch (err) {
    res.json({ savedList: [] });
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
        res.send({ doc: [] })
        // console.log('Not updated' + JSON.stringify(err, undefined, 2));                                   //Display error if not updated
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
    res.json({ itemTitle: [] });
  }


});

//localhost:8000/itemList/searchByItem  (get)

router.get('/searchByItem', async (req, res) => {
  try {
    // console.log("req", req.query.title)
    if (req.query.title === "" || req.query.title === null) {
      // console.log("empty search")
      itemsSchema.find(function (err, docs) {
        res.json(docs)
      })

    }
    var item = '/' + req.query.title + '/i'
    //console.log(item)
    // {$or : [{title :  fname}, { mealtype: fname },{foodtype : fname} ]}
    itemsSchema.find({ $or: [{ title: new RegExp(req.query.title, 'i') }, { content: new RegExp(req.query.title, 'i') }] }, null, function (err, docs) {


      // console.log(docs)
      res.json(docs)
    })

  }
  catch (err) {
    //   console.log("error", err);
    res.json({ docs: [] });
  }
});


router.get('/getByItemTitle', async (req, res) => {
  try {
    var exists = await userFavourites.findOne({ username: req.query.username }, { bookmarks: 1 })
    var cartItem = await cart.findOne({ employeeID: req.query.employeeID }).lean()
    // console.log("cart------------>", cartItem)
    // console.log("usrrrrrrrrrrr",req.query.title, req.query.username, exists)
    var item = '/' + req.query.title + '/i'
    //console.log(item)
    // {$or : [{title :  fname}, { mealtype: fname },{foodtype : fname} ]}
    var mealTypeItem = await itemsSchema.findOne({ title: req.query.title }).lean()
    //  console.log(mealTypeItem)
    // data["image"] =
     
    mealTypeItem.image =  fileToBase64(mealTypeItem['image'])
    if (exists.bookmarks.includes(mealTypeItem._id)) {
      mealTypeItem['isLiked'] = 1
    }
    else {
      mealTypeItem['isLiked'] = 0
    }
    mealTypeItem['cartAvailability'] = false
    mealTypeItem['cartAvailability'] = false;
    if (cartItem !== null) {
      cartItem.cartArray.map((cart) => {
        console.log("cart map", cart.itemId, mealTypeItem._id)
        if (cart.itemId == mealTypeItem._id) {
          console.log("if cart array")
          return mealTypeItem['cartAvailability'] = true;

        }
      })
    }

    console.log("meal item", mealTypeItem.cartAvailability)
    res.json(mealTypeItem)

  }
  catch (err) {
    //   console.log("error", err);
    res.json({ mealTypeItem: [] });
  }
});

router.get('/getByItemContent', async (req, res) => {
  try {
    var exists = await userFavourites.find({ username: req.query.username }, { bookmarks: 1 })
    // console.log(req.query.title)
    var item = '/' + req.query.title + '/i'
    //console.log(item)
    // console.log(req.query.title)

    var result = await itemsSchema.find({ content: new RegExp(req.query.title, 'i') }).lean()
    // console.log(docs)
    result.forEach(x => {
      if (exists[0].bookmarks.includes(x._id)) {
        x['isLiked'] = 1
      }
      else {
        x['isLiked'] = 0
      }

    })
    res.json({ result })


  }
  catch (err) {
    // console.log("error", err);
    res.json({ result: [] });
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

    })
    res.json(dietTypeItem);
  }
  catch (err) {
    res.json({ dietTypeItem: [] });
  }
});

//localhost:8000/itemList/getByMealType?mealType=Lunch&&username=ssetty (get)

router.get('/getByMealType', async (req, res) => {
  console.log("reached")
  try {
    var exists = await userFavourites.find({ username: req.query.username }, { bookmarks: 1 })
    // console.log("exists", exists)
    if (req.query.title === "") {
      let mealTypeItem = []
      mealTypeItem = await itemsSchema.find().lean()
      mealTypeItem.forEach(x => {
        // console.log("meal type for loop")
        x['image'] =  fileToBase64(x['image']) 
        if (exists[0].bookmarks.includes(x._id)) {
          x['isLiked'] = 1
        }
        else {
          x['isLiked'] = 0
        }


      })
      res.json(mealTypeItem)
    }
    else if (req.query.title !== "") {
      let mealTypeItem = []
      // console.log("meal", req.query.mealType)
      mealTypeItem = await itemsSchema.find({ mealType: new RegExp(req.query.mealType, 'i') }).lean();
      // console.log("meal result", mealTypeItem)

      // mealTypeItem = await itemsSchema.find().lean()
      mealTypeItem.forEach(x => {
        // console.log("meal type for loop")
        x['image'] =  fileToBase64(x['image']) 
        if (exists[0].bookmarks.includes(x._id)) {
          x['isLiked'] = 1
        }
        else {
          x['isLiked'] = 0
        }


      })

      res.json(mealTypeItem);
    }

  }
  catch (err) {
    res.json({ mealTypeItem: [] });
  }
});


//localhost:8000/itemList/getByFilterData  (post)

var fs = require('fs');
const { constants } = require('buffer');
const { array } = require('../middleware/upload');
const { isArray } = require('util');
const { get } = require('mongoose');
const { Z_ASCII } = require('zlib');
const { RSA_NO_PADDING } = require('constants');
const ordersSchema = require('../models/ordersSchema');

function fileToBase64(filename) {
  if (filename !== undefined && filename !== null) {
    // var filename = filename;
    // console.log(filename,__dirname)
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
    console.log("get by filter data")
    var exists = await userFavourites.find({ username: req.body.userName }, { bookmarks: 1 })
    // console.log("req",req.body,"exists",exists)
    console.log("query")
    // var mealQuery = [];
    var query = {};
    // if (req.body.mealType.length) {
    //   req.body.mealType.forEach(element => {
    //     mealQuery.push({ mealType: element })
    //   });
    //   query = { $or: mealQuery }
    // }
    // if (req.body.dietType != '') {
    //   query.dietType = req.body.dietType;
    // }
    console.log("query1")
    let mealTypeItem = []
    mealTypeItem = await itemsSchema.find(query).lean();
    
    // if (req.body.isFav == "true") {
    //   const favResult = await userFavourites.find({ username: req.body.userName })
    //   // console.log('favResult', favResult[0].favourites);
    //   var favItems = favResult[0].favourites;
    //   var itemslist = mealTypeItem;
    //   var allFilters = [];
    //   itemslist.forEach(element => {
    //     if (favItems.includes(element.title)) {
    //       allFilters.push(element);
    //     }
    //   });
    // console.log("allFilters", allFilters.length);
    //   res.json(allFilters);
    // }
    // else {
    console.log('else response')
    // var mealItems = Object.assign({},mealTypeItem)

    // mealItems[0].test = 'sampletext'
    // console.log("meal items ---->",mealItems);
    // getAllItemsList.map(data => {
    //   data["image"] = fileToBase64(`${imagePath}/${data.title}+.jpg`)
    //   })

    mealTypeItem.forEach(async x => {
      // let newImage = `uploadsFolder/${x.title}.jpg`
      // x['isLiked'] = 0
      x["image"] = fileToBase64(x['image'])
      if (exists[0].bookmarks.includes(x._id)) {
        x['isLiked'] = 1
      }
      else {
        x['isLiked'] = 0
      }

      // await itemsSchema.update({_id:x._id},{image:newImage})
      // console.log("new ssssssssssssssssssssx",newImage)
    })
    
    console.log("before response")

    res.json(mealTypeItem);
  }
  // }
  catch (err) {
    console.log("base 64",err.message)
    res.json({ allFilters: [] })
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
      // console.log("if", getAllCartList)
      query = [...getAllCartList.cartArray, { quantity: req.body.quantity, itemId: req.body.itemId }]
      // console.log(query)
      cartItems = await cart.findOneAndUpdate({ employeeID: req.body.employeeID }, { cartArray: query })
      // console.log("cart itemsssssssssss1", cartItems);
    }
    else {
      query = [{ cartArray: { quantity: req.body.quantity, itemId: req.body.itemId }, employeeID: req.body.employeeID }]

      cartItems = await new cart(...query).save();
      // console.log("cart itemsssssssssss2", cartItems);
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
    res.json({ cartItems: [] });
  }

});

//localhost:8000/itemList/updateCart/

router.put('/updateCart', async (req, res) => {

  // console.log('req.body cart', req.body);
  // userFavourites.updateOne({ "username": name }, { $set: { "favourites": favourites, "allergies": allergies, "days": days, "diet": diet, "points": points } },
  var userCart = await cart.findOne({ employeeID: req.body.employeeID })
  if(userCart && userCart.cartArray)
  {
    userCart.cartArray.filter(x => {
      // console.log("ssfsdfwerwerwer",x.itemId,req.body.itemI)
      if (x.itemId == req.body.itemId) {
        // console.log("iffff")
        x.quantity = req.body.quantity
        // console.log("sfasdf", x)
      }
      return x;
    })
  
    // console.log("userrrrrrrrrrrrrrr",userCart[0].cartArray)
    await cart.findOneAndUpdate({ employeeID: req.body.employeeID }, { cartArray: userCart[0].cartArray })
  }

  // console.log("userCarttttttttttttt", userCart)
  res.json({ success: "Cart Updated Successfully", data: userCart })
});


router.put('/', (req, res) => {
  //console.log(req);
  cart.findOneAndDelete({ 'cartArray.title': req.body.title }, (err, doc) => {
    if (!err) {
      res.send(doc)
    }
    else {
      res.json({ doc: [] })
      // console.log('Not deleted' + JSON.stringify(err, undefined, 2));
    }
  })
})

async function getSequenceNextValue(seqName) {
  // console.log({ _id: seqName }, { $inc: { sequenceValue: 1 } })
  var seqDoc = await counterSchema.findOneAndUpdate({ _id: seqName }, { $inc: { sequenceValue: 1 } });
  // console.log("seq", seqDoc)
  return seqDoc.sequenceValue
}
router.post('/deleteCartArray', async (req, res) => {
  // console.log("to be deleted cart details", req.body);

  // let ressss = getNextSequenceValue("orderId")

  // console.log("my orders", myOrders, "ressss", ressss)
  let totalDeductedPoints = 0, updatedPoints = 0;
  req.body.cartDetails.filter((a) => {
    totalDeductedPoints += a.totalPoints
    // return a.totalPoints + b.totalPoints
  })
  // console.log("totalpoinst", totalDeductedPoints)
  try {


    let response, myOrders, availablePoints;
    const orderDetails = await userFavourites.findOne({ 'employeeID': req.body.employeeID }, { points: 1 });

    if (orderDetails.points >= totalDeductedPoints) {
      availablePoints = orderDetails.points - totalDeductedPoints
      let deletedCart = await cart.deleteOne({ 'employeeID': req.body.employeeID })
      //  console.log(deletedCart)
      if (deletedCart) {

        // console.log("orderDetails", orderDetails);
        // let newItemId = 
        // console.log(newItemId)

        myOrders = new orders({
          // _id: await getSequenceNextValue("itemId"),
          orderDetails: req.body.cartDetails,
          employeeID: req.body.employeeID,
          status: "In progress",
          totalOrderPoints: totalDeductedPoints,
          // mealType:req.body.cartDetails.mealType,
          date: req.body.date
        })
        // console.log("my orders",myOrders)

        let result = await myOrders.save()
        const timestamp  =  moment(Date.now()).tz("Asia/Kolkata").format().split("+")[0];
        response = { result, totalDeductedPoints, message: "Order Placed Successfully" }
        updatedPoints = orderDetails.points - totalDeductedPoints
        await userFavourites.updateOne({ 'employeeID': req.body.employeeID }, { points: updatedPoints });

       
        const userPassBook = await passBookSchema.update({employeeID:req.body.employeeID},{
          
            $set:{
            pointsAvailable:availablePoints
             },
             $push:{
                    transactionDetails:[
            {
              "pointsSpent": totalDeductedPoints,
              "transactionType"  : "Debit",
              "transactionReason" : req.body.cartDetails,
              "timestamp": timestamp,
              "Order_Id": result._id
            }
          ]
             }
            
            })
            // pointsAvailable:availablePoint
          console.log("user Passbook", userPassBook)
      }
      else {
        console.log('Error in Deleting', JSON.stringify(err, undefined, 2));
      }


    }

    else
      response = { message: "Failed Due To Insufficient Points" }
    //  res.json()

    // console.log("userpoints",userPoints)
    console.log("tp included", response)
    res.json(response);
  }
  catch (err) {
    console.log("err",err.message)
    res.json({ response: [] })
  }

});

router.get('/getOrders', async (req, res) => {
  // console.log("requ query", req.query)
  // const allOrders = await orders.find({ 'employeeID': req.query.employeeID });
  orders.find({ 'employeeID': req.query.employeeID }, function (err, docs) {
    // console.log("order docs-------------------------------------->", docs)

    // for(let i = 0;i<=docs.length;)
    if (!err) {

      // for(let i=0;i<=docs.length;i++)
      // {

      // }

      docs.forEach(x => {
        // console.log("x--------->",x)
        x.orderDetails.forEach(async y => {

          var itemMealType = await itemsSchema.findOne({ title: y.title }, { mealType: 1 })
          if (itemMealType)
            y.mealType = itemMealType.mealType

        })
      })
      res.json(docs)
      // console.log("orders list ---->", docs)
    }

    else {
      res.send({ docs: [] })
    }


  })
})

router.post('/deleteCartItem', (req, res) => {
  // console.log({employeeID : req.query.employeeID},{$pull:{"cartArray" : {"itemId":req.query.itemId}}})
  // cart.findOneAndDelete({$and : [{'employeeID': req.body.emitemListployeeID},{ "title" : req.body.title }]},(err,doc)=>{
  cart.updateOne({ employeeID: req.body.employeeID }, { $pull: { "cartArray": { "itemId": req.body.itemId } } }, (err, doc) => {
    if (!err) { res.send(doc); }
    else {
      res.json({ doc: [] })
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
    const getAllCartList = await cart.findOne({
      employeeID: req.query.empId
    })
    let cartArray
    // console.log("cart responses", getAllCartList);
    if (getAllCartList && getAllCartList.cartArray) {
      cartArray = getAllCartList.cartArray;

      for (let index = 0; index < cartArray.length; index++) {
        let itemData = await itemsSchema.findOne({ _id: cartArray[index].itemId });
        // console.log("image",itemData.image)
        allItems.push({
          itemId: itemData._id,
          points: itemData.points,
          title: itemData.title,
          likes: itemData.likes,
          image: fileToBase64(itemData.image),
          quantity: cartArray[index].quantity,
          totalPoints: itemData.points * cartArray[index].quantity
        })
      }
      res.json({ allItems, message: "Success" })
    }
    else {
      allItems = []
      res.json({ allItems, message: "Failed" })
    }
    // res.json({ allItems });
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
    res.json([]);
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
    availability: req.body.availability,
    productionTime: mealTypeTimes[req.body.mealType],
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

router.get('/all', async (req, res) => {
  console.log("all ")
  try {
    const getAllItemsList = await itemsSchema.find();

    res.json(getAllItemsList);
  }
  catch (err) {
    res.json({ getAllItemsList: [] });
  }

});

router.delete('/deleteMenu/:itemId', async (req, res) => {
  try {
    var deleteResult = await itemsSchema.deleteOne({ itemId: req.params.itemId })
    res.json({ success: "Deleted Successfully" })
  }
  catch (err) {
    res.json([])
  }

});



module.exports = router;