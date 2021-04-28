
const express = require('express');
const router = express.Router();

const rewards = require('../models/rewardsSchema');


// localhost:8000/rewards/allRewards
router.get('/allRewards', async (req, res) => {
    try {
      const getRewardPoints = await rewards.find();
  
      res.json(getRewardPoints);
    }
    catch (err) {
      res.json({ message: err });
    }
  });


//localhost:8000/rewards/postRewards  (post)       [Insert menu Items]

// router.post('/postRewards', async (req, res) => {
//     console.log(req.body);
//     const postAllItemList = new rewards({
//         category: req.body.category,
//         points: req.body.points
//     })
//     try {
//       const savedList = await postAllItemList.save();
//       res.json(savedList);
//     }
//     catch (err) {
//       res.json({ message: err });
//     }
//   });

module.exports = router;
