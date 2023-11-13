const express = require("express");
const router = express.Router();
const statisticController = require("../controller/statistic.controller");

// get months_revenue
router.get("/getmonthsrevenue", statisticController.getMonthsRevenue);

// getCateRevenue
router.get("/getcaterevenue", statisticController.getCateRevenue);

// getTopSales
router.get('/gettopsales', statisticController.getTopSales);
 
module.exports = router;