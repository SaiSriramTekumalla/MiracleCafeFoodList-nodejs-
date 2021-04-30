const express = require('express');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
require('dotenv/config');
const cors = require('cors');
const PORT = process.env.PORT || 8000
//middleware

app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204,
  "Access-Control-Allow-Origin": '*'
}));
// app.use(bodyParser.json());
// var bodyParser = require('body-parser');
//Impotring Routes
app.use(bodyParser.json({ limit: '50mb' }))
const itemsList = require('./routes/itemsList');
app.use('/itemList', itemsList);

const cartController = require('./routes/cartController');
app.use('/cart', cartController);

const usersController = require('./routes/users');
app.use('/users', usersController);

const rewardsController = require('./routes/rewardsController');
app.use('/rewards', rewardsController);

const orderDetails = require('./routes/orderdetails');

app.use('/orders', orderDetails);

app.use('/uploadsFolder', express.static('uploadsFolder'));
//Connecting To MongoDB
mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('Connection With MongoDB established'));

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
