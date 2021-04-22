const express = require('express');
const router = express.Router();
const userFavourites = require('../models/userFavourites');
const upload = require('../middleware/upload');
const rewardsSchema = require('../models/rewardsSchema');
const itemsSchema = require('../models/itemsSchema');
const axios = require('axios');
const passBookSchema = require('../models/passbookSchema')

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


router.post('/getFavs', async (req, res) => {
  console.log("reqBody", req.body)
  var name = req.body.userName;
  var password = req.body.password;
console.log(name, password)
  let resdata = await userFavourites.findOne({ $and: [{ username: name }, { password: password }] })

      console.log("1st If", "doc >>", resBody)
      if (resdata.length > 0) {
      let resBody = resdata[0];
        if (resBody && resBody.role == "manager") {
          const response = await axios.post('https://uat-hubble-api.miraclesoft.com/v2/employee/login', {
            LoginId: req.body.userName,
            Password: req.body.password,
          })

          const managedUsers = await axios.post(`https://uat-hubble-api.miraclesoft.com/v2/employee/my-team-members/${req.body.userName}`, {
            LoginId: req.body.userName,
            Password: req.body.password,
          }, new Headers({ Authorization: `Bearer ${response.token}` }))

          let employeesDetails = managedUsers.map(user => ({ employeeID: user.id, name: user.name, username: loginId, designation: user.designation }));
          console.log("here we are")
          await userFavourites.findOneAndUpdate({ userName: req.body.userName }, {$set :  { employeesDetails: employeesDetails }})
          res.send([{ data: resBody }]);
        }

      }
      else {
        let response = await axios.post('https://www.miraclesoft.com/HubbleServices/hubbleresources/generalServices/generalEmployeeDetails', {
          Authorization: "YWRtaW46YWRtaW4=",
          LoginId: req.body.userName,
          Password: req.body.password,
        })
        console.log("else reached")
        if (response && response.IsAuthenticate && response.ResultString == "Valid") {
          const newUserData = new userFavourites({
            // favourites: [],
            days: [],
            allergies: [],
            cart: [],
            bookmarks: [],
            username: req.body.userName,
            password: req.body.password,
            employeeID: req.body.employeeID,
            department: req.body.department,
            anniversary: req.body.anniversary || "",
            diet: req.body.diet || "",
            userImage: req.body.userImage,
            role: req.body.role || "",
            points: req.body.points || 0
          })
          const savedResult = await newUserData.save();
          console.log("passbook empId", req.body.employeeID)
          passBook = new passBookSchema({
            pointsAvailable: 0,
            employeeID: req.body.employeeID,
            transactionDetails: []
          })

          await passBook.save();
          console.log("else", savedResult)
          return res.status(200).json([{ data: savedResult }])
        } else if (err) {
          return res.status(400).send(`No records found with id: ${req.params.username}`);

        }
      }


});

//  localhost:8000/users/updateRewards

router.post('/updateRewards', (req, res) => {
  console.log("req body", req.body)
  var modelObject = {
    employeeID: req.body.employeeID,
    points: req.body.points
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

module.exports = router;