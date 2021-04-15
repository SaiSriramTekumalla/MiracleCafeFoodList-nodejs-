    const express = require('express');
    const { isValidObjectId } = require('mongoose');
    const { any } = require('../middleware/upload');
    const router = express.Router();

    const orderDetails = require('../models/ordersSchema')

    // Get All Orders 
    router.post('/search', async (req, res) => {
        console.log(req.body)
        try {
            if (req.body.mealType !== '' || req.body.date !== "") {
                var ordersList = []
                var finalResult = []
                var resBody
                var orders
                console.log("Param", req.body.mealType, req.body.date)
                console.log({ $or: [{ 'orderDetails.mealType': req.body.mealType }, { date: req.body.date }] })

                if (req.body.mealType != '' && req.body.date === '') {
                    orders = await orderDetails.find({ 'orderDetails.mealType': req.body.mealType });
                }

                if (req.body.date != '' && req.body.mealType === '') {
                    orders = await orderDetails.find({ date: new RegExp(req.body.date) });
                }

                if (req.body.mealType !== '' && req.body.date != '') {
                    orders = await orderDetails.find({ $and: [{ 'orderDetails.mealType': req.body.mealType }, { date: new RegExp(req.body.date) }] });
                }

                console.log("orders", orders, orders.length)
                orders.forEach(ele => {
                    // console.log("For each",ele)
                    ele.orderDetails.forEach(x => {
                        if (x.mealType === req.body.mealType || req.body.date !== '') {
                            console.log("IFfffffffffffff", "ele", ele.employeeID)
                            ordersList.push(x)

                        }

                    })
                    if (ordersList.length !== 0) {
                        resBody = {
                            _id: ele.id,
                            orderDetails: ordersList,
                            // quantity:x.quantity,
                            employeeID: ele.employeeID,
                            status: ele.status,
                            date: ele.date
                        }
                        finalResult.push(resBody)
                    }

                    ordersList = []
                    // res.send(resBody)

                })
                // finalResult.push(resBody)
                console.log("res", resBody, typeof (resBody.date), "final", finalResult)
                res.status(200).json(finalResult);
            }
            else {
                // console.log({'date':ISODate(req.params.param)})
                const orders = await orderDetails.find()
                // res.json({error:"No Match Found"});
                res.status(200).json(orders)
            }
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    })

    // Update Status Of Order

    router.put('')




    module.exports = router;