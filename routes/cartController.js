const express = require('express');
const router = express.Router();
const cart = require('../models/card');
module.exports = router;



//localhost:8000/itemList/cartItems   (post)  (Post cart Items)

router.post('/cartItems', async (req, res) => {
    // console.log(req.body);
  
    try {
      const getAllCartList = await cart.find({
        employeeID: req.body.employeeID
      });
      // if (employeeID) {
      console.log(req.body.employeeID)
      console.log('allCart', getAllCartList);
      if (getAllCartList.length) {
        console.log("if existed user")
        var isExisted = false;
        getAllCartList[0].cartArray.forEach(element => {
          if (element.title == req.body.title) {
            isExisted = true;
          }
        })
        if (isExisted) {
          console.log("into existed item", req.body.employeeID)
          cart.findOneAndUpdate({
            'employeeID': req.body.employeeID,
            'cartArray.title': req.body.title
          }, {
            $set: {
              'cartArray.$.quantity': req.body.quantity,
              'cartArray.$.totalPoints': req.body.totalPoints
            }
          }, { new: true }, (err, doc) => {
            if (!err) {
              console.log("response from existed item", doc)
              res.send(doc)
            }
            else {
              console.log('Not updated' + JSON.stringify(err, undefined, 2));                                   //Display error if not updated
            }
          });
        }
        else {
          let query = {
            ///   cartArray:[{
            title: req.body.title,
            quantity: req.body.quantity,
            itemId: req.body.itemId,
            points: req.body.points,
            totalPoints: req.body.totalPoints,
            // image: req.body.image,
            //   }],
            // employeeID:req.body.employeeID
          }
  
          cart.findOneAndUpdate({
            'employeeID': req.body.employeeID,
          }, {
            $push: {
              'cartArray': query
            }
          }, { new: true }, (err, doc) => {
            if (!err) {
              res.send(doc)
            }
            else {
              console.log('Not updated' + JSON.stringify(err, undefined, 2));
            }
          });
        }
      }
      else {
        console.log("new user")
        const postCartItems = new cart({
          cartArray: [{
            title: req.body.title,
            quantity: req.body.quantity,
            itemId: req.body.itemId,
            points: req.body.points,
            totalPoints: req.body.totalPoints,
            image: req.body.image,
          }],
          employeeID: req.body.employeeID
          //{$push: {points:req.body.points},{quantity:req.body.quantity}}
        })
        const savedCartList = await postCartItems.save();
        res.json(savedCartList);
      }
    }
    // if (err) {
    //   res.json({ message: err });
    // }
    // }
    catch (err) {
      res.json({ message: err });
    }
  
  });



router.put('/updateCart', (req, res) => {

    console.log('req.body', req.body);
    cart.findOneAndUpdate({
      'employeeID': req.body.employeeID,
      'cartArray.title': req.body.title
    }, {
      $set: {
        'cartArray.$.quantity': req.body.quantity,
        'cartArray.$.totalPoints': req.body.totalPoints
      }
    }, { new: true }, (err, doc) => {
  
      if (!err) {
        res.send(doc)
  
      }
      else {
        console.log('Not updated' + JSON.stringify(err, undefined, 2));                                   //Display error if not updated
      }
    });
  
  });


router.put('/', (req, res) => {
    //console.log(req);
    cart.findOneAndDelete({ 'cartArray.title': req.body.title }, (err, doc) => {
      if (!err) {
        res.send(doc)
      }
      else {
        console.log('Not deleted' + JSON.stringify(err, undefined, 2));                                   //Display error if not updated
      }
    })
  })


  router.post('/deleteCartArray', (req, res) => {
    console.log("req", req.body.cartDetails);
    cart.deleteOne({ 'employeeID': req.body.employeeID },async (err, doc) => {
      if (!err) {
        const orderDetails =  await orders.find({ 'employeeID': req.body.employeeID });
        console.log("orderDetails", orderDetails);
          const myOrders = new orders({
            orderDetails: req.body.cartDetails,
            employeeID: req.body.employeeID
          })
          console.log("--------------------------------------->",myOrders)

            const result = await myOrders.save();
            res.json({ message: result });
  
    }
      else {
        console.log('Error in Deleting', JSON.stringify(err, undefined, 2));
      }
    });
  });

  router.post('/deleteCartItem', (req, res) => {
    cart.updateOne({ employeeID: req.body.employeeID }, { $pull: { "cartArray": { "itemId": req.body.itemId } } }, (err, doc) => {
      if (!err) {
        res.send(doc);
  
      }
      else {
        console.log('Not deleted' + JSON.stringify(err, undefined, 2));
      }
    })
  });

  router.get('/allCart', async (req, res) => {
    // console.log("cart response",req.query);
    try {
      const getAllCartList = await cart.find({
        employeeID: req.query.empId
      });
      // console.log("cartList",getAllCartList);
      res.json(getAllCartList[0]);
    }
    catch (err) {
      res.json({ message: err });
    }
  });
