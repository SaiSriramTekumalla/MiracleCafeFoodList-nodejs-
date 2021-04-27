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

    // console.log("1st If", "doc >>", resdata)
    if (resdata.length > 0) {
      resBody = resdata[0];
      console.log("............................IF resopnse..............................")
      return res.status(200).json([{ data: resBody }])
    }
    else {
      let response = await axios.post('https://www.miraclesoft.com/HubbleServices/hubbleresources/generalServices/generalEmployeeDetails', {
        Authorization: "YWRtaW46YWRtaW4=",
        LoginId: req.body.userName,
        Password: req.body.password,
      })
      console.log("else reached", response)
      if (response && response.data.IsAuthenticate && response.data.ResultString == "Valid") {
        let data = response.data;
        const newUserData = new userFavourites({
          // favourites: [],
          days: [],
          allergies: [],
          cart: [],
          bookmarks: [],
          username: req.body.userName,
          password: req.body.password,
          employeeID: data.EmpId,
          department: data.department,
          anniversary: data.anniversary || "",
          diet: data.diet || "",
          userImage: data.userImage,
          role: data.role || "",
          points: data.points || 0
        })
        const savedResult = await newUserData.save();
        // console.log("passbook empId", req.body.employeeID)
        passBook = new passBookSchema({
          pointsAvailable: 0,
          employeeID: data.EmpId,
          transactionDetails: []
        })

        await passBook.save();
      
      if (data && data.role == "manager") {
        const response = await axios.post('https://uat-hubble-api.miraclesoft.com/v2/employee/login', {
          loginId: req.body.userName,
          password: req.body.password,
        })
        // console.log("response", response)
        // console.log(response.data.data.token)
        console.log(`https://uat-hubble-api.miraclesoft.com/v2/employee/my-team-members/${req.body.userName}`)
        // const managedUsers = await 
        const managedUsers = await axios.get(`https://uat-hubble-api.miraclesoft.com/v2/employee/my-team-members/${req.body.userName}`, { headers: { 'Authorization': `Bearer ${response.data.data.token}` } })
        console.log(Array.isArray(managedUsers.data.data))
        const employeesDetails = managedUsers.data.data.map(user => ({ employeeID: user.id, name: user.name, username: user.loginId, designation: user.designation }));
        if (employeesDetails) {
          await new managerSchema({
            employeesDetails,
            managerId: data.EmpId,
            totalPoints: 0
          }).save()
        }
      }

        // console.log("else", savedResult)
        console.log("............................Else resopnse..............................")
        return res.status(200).json([{ data: savedResult }])
      } else {
        return res.status(400).send(`No records found with id: ${req.body.userName} or invalid credentails`);
      }
    }


  } catch (error) {
    return res.status(500).send(`Failed due to ${error}`);
  }
});

//  localhost:8000/users/updateRewards

router.post('/updateRewards', async (req, res) => {
  // console.log("req body", req.body)
  var modelObject = {
    employeeID: req.body.employeeID,
    points: req.body.points,

  };
  const userPoints = await userFavourites.findOne({ 'employeeID': req.body.employeeID }, { points: 1 });
  console.log("upts", userPoints)
  let availablePoints = req.body.transactionType === 'Debit' ? userPoints.points - req.body.points : userPoints.points + req.body.points
  // console.log("ava",availablePoints)
  await userFavourites.updateOne({ employeeID: req.body.employeeID }, { points: availablePoints })
  const timestamp = moment(Date.now()).tz("Asia/Kolkata").format("DD/MM/YYYY h:mm A")
  const ress = await passBookSchema.updateOne({ employeeID: req.body.employeeID }, {

    $set: {
      pointsAvailable: availablePoints
    },
    $push: {
      transactionDetails: [
        {
          "pointsSpent": req.body.points,
          "transactionType": req.body.transactionType,
          "transactionReason": req.body.transactionReason,
          "transactionDetails": '',
          "timestamp": timestamp,
        }
      ]
    }

  })

  // console.log("res",ress)

  // userFavourites.findOneAndUpdate({ "employeeID": req.body.employeeID }, { $set: modelObject }, { new: true }, (err, doc) => {
  //   if (!err) {
  //     console.log(doc)
  //     res.send(doc)

  //   }
  //   else {
  //     console.log('Not updated' + JSON.stringify(err, undefined, 2));
  //   }
  // });
});




//  localhost:8000/users/saveBookmarks

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
    // console.log("login",req.body)
    // const response = await axios.post('https://uat-hubble-api.miraclesoft.com/v2/employee/login', {
    //   loginId: req.body.loginId,
    //   password: req.body.password,
    // })
    // // console.log("response", response)
    // // console.log(response.data.data.token)
    // console.log(`https://uat-hubble-api.miraclesoft.com/v2/employee/my-team-members/${req.body.userName}`)
    // // const managedUsers = await 
    // const managedUsers = await axios.get(`https://uat-hubble-api.miraclesoft.com/v2/employee/my-team-members/${req.body.userName}`, { headers: { 'Authorization': `Bearer ${response.data.data.token}` } })
    // // console.log(Array.isArray(managedUsers.data.data))
    // // console.log("managedUsers",managedUsers.data.data)
    // const employeesDetails = managedUsers.data.data.map(user => ({ employeeID: user.id, name: user.name, username: user.loginId, designation: user.designation }));
    // console.log("here we are", employeesDetails)
    let searchKey = req.body.title;
    if (searchKey === "" || searchKey === null) {
      managerSchema.find(function (err, docs) {
        res.json(docs)
      })

    }
    //console.log(item)
    // {$or : [{title :  fname}, { mealtype: fname },{foodtype : fname} ]}
    managerSchema.find({managerId : req.body.employeeID},{ employeeDetails: {$or: [{ employeeID: new RegExp(searchKey, 'i') }, { username: new RegExp(searchKey, 'i') }, { name: new RegExp(searchKey, 'i') }] }}, null, function (err, docs) {
      res.json({ docs })
    })
  }
  catch (err) {
    console.log(err.message)
    res.json([])
  }
});


module.exports = router;