const express = require('express');
const router = express.Router();
const userFavourites = require('../models/userFavourites');
const upload = require('../middleware/upload');
const rewardsSchema = require('../models/rewardsSchema');
const itemsSchema = require('../models/itemsSchema');
const managerSchema = require('../models/managerSchema');
const axios = require('axios');
const passBookSchema = require('../models/passbookSchema')
const moment = require('moment-timezone');
// const fileToBase64 = require('../middleware/imageconversion');
router.get('/getByCredentials', async (req, res) => {
  try {
    console.log(req.query);
    const credentials = await userFavourites.find({ username: req.query.username, password: req.query.password });
    res.json({ status: "success", data: credentials });
    console.log(credentials)
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



router.post('/addFavrouties', async (req, res) => {
  console.log(req.body);
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


router.post('/updateBookmarks', async (req, res) => {
  console.log("update", req.body);
  try {
    userFavourites.findOneAndUpdate({ "employeeID": req.body.employeeID }, { $pull: { bookmarks: req.body.itemID } }, { multi: false }, (err, doc) => {
      if (!err) {
        console.log(doc)
        res.send(doc)
      }
      else {
        console.log('Not updated' + JSON.stringify(err, undefined, 2));
      }
    });
  }
  catch (err) {
    res.json({ message: err });
  }
});

//  localhost:8000/users/  
router.post('/getFavs', async (req, res) => {
  try {
    // console.log("reqBody", req.body)
    var name = req.body.userName;
    var password = req.body.password;
    let resBody;
    let resdata = await userFavourites.find({ $and: [{ username: name }, { password: password }] })

    // console.log("1st If", "doc >>", req.body)
    if (resdata.length > 0) {
      resBody = resdata[0];
      console.log("............................IF resopnse..............................")
      return res.status(200).json([{ data: resBody }])
    }
    else {
      let response = await axios.post('https://uat-hubble-api.miraclesoft.com/v2/employee/login', {
        loginId: req.body.userName,
        password: req.body.password
      })
console.log("empRes",response)
      if (response && response.data && response.data.success) {

        let data = response.data.data;

        let userData = await userFavourites.create({
          // favourites: [],
          days: [],
          allergies: [],
          cart: [],
          bookmarks: [],
          username: req.body.userName,
          password: req.body.password,
          employeeID: data.EmpId,
          department: data.Department,
          anniversary: data.anniversary || "",
          diet: data.diet || "",
          userImage: data.ProfilePic,
          role: data.IsManager ? "manager" : req.body.userName == "admin" ? "owner" : "employee",
          points: data.points || data.IsManager ? 1000 : 0,
          pointsAssigned:0,
          pointsTransaction:0,
          IsManager: data.IsManager
        });
        console.log("here is okay")
        // userFavourites.insert()
        // .then(data => console.log(data))
        // .catch(err => console.log(err));
        console.log("something is fishy")
        // console.log("passbook empId", newUserData)
       
          let passBook = new passBookSchema({
            pointsAvailable: 0,
            pointsAssigned:0,
            employeeID: data.EmpId,
            transactionDetails: []
          })
  
          var result = await passBook.save();
        
     
        console.log("res",data.IsManager,result)
        if (data && data.IsManager) {
        
          // console.log(`https://uat-hubble-api.miraclesoft.com/v2/employee/my-team-members/${req.body.userName}`)
          // const managedUsers = await 
          const managedUsers = await axios.get(`https://uat-hubble-api.miraclesoft.com/v2/employee/my-team-members/${req.body.userName}`, { headers: { 'Authorization': `Bearer ${data.token}` } })
          // console.log(Array.isArray(managedUsers.data.data))
          const employeesDetails = await managedUsers.data.data.map(user => ({ employeeID: user.id.toString(), name: user.name, username: user.loginId, designation: user.designation,departmentId:user.departmentId,points:0,description:"" }));
          // console.log("empssdfsd",managedUsers.data.data)
          if (employeesDetails.length > 0) {
            await new managerSchema({
              employeeDetails: employeesDetails,
              managerId: data.EmpId
            }).save()
          }
        }

        // console.log("else", savedResult)
        console.log("............................Else resopnse..............................")
        return res.status(200).json([{ data: userData }])
      } else {
        return res.status(400).send([{ data: `No records found with id: ${req.body.userName} or invalid credentails` }]);
      }
    }


  } catch (error) {
    console.log(error)
    return res.status(500).send(`Failed due to ${error}`);
  }
});

//  localhost:8000/users/updateRewards

router.post('/updateRewards', async (req, res) => {
  console.log("req body", req.body.employeeID)
  var modelObject = {
    employeeID: req.body.employeeID,
    points: req.body.points,

  };
  const userPoints = await userFavourites.findOne({ 'employeeID': req.body.employeeID }, { points: 1 });
  const managerPoints = await userFavourites.findOne({ 'employeeID': req.body.managerId }, { points: 1 });
  console.log("upts", userPoints)
  if(userPoints !== null)
  {
    await userFavourites.findOneAndUpdate({ 'employeeID': req.body.employeeID }, { pointsAssigned: req.body.points });
    var availablePoints = req.body.transactionType == 'Debit' ? userPoints.points - req.body.points : userPoints.points + req.body.points
  
 
  // console.log("ava",availablePoints)
  await userFavourites.updateOne({ employeeID: req.body.employeeID }, { points: availablePoints })
  const timestamp = moment(Date.now()).tz("Asia/Kolkata").format("DD/MM/YYYY h:mm A")
  var userAssignedPoints = await passBookSchema.findOne({employeeID: req.body.employeeID},{pointsAssigned:1})
  const ress = await passBookSchema.updateOne({ employeeID: req.body.employeeID }, {

    $set: {
      pointsAvailable: availablePoints,
      pointsAssigned:userAssignedPoints.pointsAssigned + req.body.points,
    },
    $push: {
      transactionDetails: [
        {
          "pointsSpent": req.body.points,
          "transactionType": req.body.transactionType,
          "transactionReason": req.body.transactionReason,
          "transactionDetails": req.body.transactionDetails,
          "timestamp": timestamp,
        }
      ]
    }

  })

  managerPoints
  await passBookSchema.updateOne({ employeeID: req.body.managerId }, {
    $set: {
      pointsAvailable: managerPoints.points,
      // pointsAssigned:req.body.points,
    },
    $push: {
      transactionDetails: [
        {
          "pointsSpent": req.body.points,
          "pointsAssignedTo":req.body.username,
          "transactionType": 'Debit',
          "transactionReason": req.body.transactionReason,
          "transactionDetails": req.body.transactionDetails,
          "timestamp": timestamp,
        }
      ]
    }

  })

  res.json({message:"Rewards Added Succesfully"})
  }
  else{
    res.json({message:"User Doesn't Have Miracle Cafe Account"})
  }

});

router.post('/saveBookmarks', async (req, res) => {
  console.log("req", req.body.employeeID)
  try {

    const isExists = await userFavourites.find({ $and: [{ employeeID: req.body.employeeID }, { bookmarks: { $in: [req.body.itemID] } }] })
    if (isExists.length === 0 && req.body.status === 1) {
      console.log("item does not Exists", isExists)

      const result = userFavourites.findOneAndUpdate({
        'employeeID': req.body.employeeID,
      }, {
        $push: {
          'bookmarks': req.body.itemID
        }
      }, { new: true }, (err, doc) => {
        if (!err) {
          res.json({ status: "Saved Successfully" })
        }
        else {
          console.log('Not updated' + JSON.stringify(err, undefined, 2));
        }
        // res.json(result)
      });
      return
    }
    else if (req.body.status === 0 && isExists.length !== 0) {
      console.log("else reached")
      const removed = await userFavourites.findOneAndUpdate(
        { employeeID: req.body.employeeID },

        { $pull: { 'bookmarks': req.body.itemID }, }

      )
      console.log("exists", isExists, "removed", removed)
      res.json({ status: "Removed Successfully" })
    }

    // const empData = await userFavourites.find({employeeID:req.body.employeeID},{bookmarks:1})
    // console.log(empData)


  } catch (err) {
    res.json({ message: err.message });
  }


})



router.post('/updateDays', (req, res) => {
  console.log("req body", req.body)
  var modelObject = {
    employeeID: req.body.employeeID,
    days: req.body.days,
    allergies: req.body.allergies
  };
  userFavourites.findOneAndUpdate({ "employeeID": req.body.employeeID }, { $set: modelObject }, { new: true }, (err, doc) => {
    if (!err) {
      console.log(doc)
      res.send(doc)

    }
    else {
      console.log('Not updated' + JSON.stringify(err, undefined, 2));
    }
  });
})


//  localhost:8000/users/getBookmarks?employeeID=xxxx

var fs = require('fs');
const { isValidObjectId } = require('mongoose');
const { use } = require('./cartController');
const { response } = require('express');
const { isMaster } = require('cluster');

function fileToBase64(filename) {
  if (filename !== undefined) {
    // var filename = filename;
    // console.log(filename)
    var binaryData = fs.readFileSync(filename)
    var base64String = new Buffer(binaryData).toString("base64")
    // console.log(base64String)  


    // base64_s.push(base64String)
    // console.log(base64String)
    return base64String
  }


}

router.get('/getBookmarks', async (req, res) => {

  try {
    userBookmarks = []

    console.log(req.query.employeeID)

    const favItems = await userFavourites.findOne({ "employeeID": req.query.employeeID }, { bookmarks: 1 })
    // console.log("favItems",favItems)

    for (let i = 0; i <= favItems.bookmarks.length; i++) {
      const data = await itemsSchema
        .findOne({ _id: favItems.bookmarks[i] }).lean()
        .catch((error) => {
          console.log(error);
        });
      userBookmarks.push(data)
    }
    console.log("user bookmarks", userBookmarks);
    res.send({ "userBookmarks": userBookmarks })


  } catch (err) {
    res.json({ message: err.message });
  }

})

// get all user favourites based on the username

router.get('/getAllLikedItems', (req, res) => {
  try {

  } catch (err) {
    res.json({ message: err.message });
  }
})


router.post('/getEmployees', async (req, res) => {

  try {
  console.log(req.body)
    let searchKey = req.body.title;
    var employeeDetails;
    if (searchKey === "" || searchKey === null) {
      emplDetails = await managerSchema.find();
      employeeDetails = emplDetails[0]["employeeDetails"];

    }
    else {
      employeeDetails = await managerSchema.aggregate([
      {$match : {managerId: req.body.employeeID }},
      {$unwind : '$employeeDetails'},
      {$match : {
        $or: [
            { 'employeeDetails.name': { "$regex": searchKey, $options: 'xi' } },
            { 'employeeDetails.username': { "$regex": searchKey, $options: 'xi' } },
            { 'employeeDetails.employeeID': { "$regex": searchKey, $options: 'xi' }}
        ]
    }}
      ])
    employeeDetails = employeeDetails.map(data => data.employeeDetails)
    }
    res.send(employeeDetails)
  }
  catch (err) {
    console.log(err.message)
    res.json([])
  }
});


module.exports = router;