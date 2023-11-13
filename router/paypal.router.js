const express = require("express");
const router = express.Router();
const paypalController = require("../controller/paypal.controller")
const auth = require("../middleware/auth.js")

router.post("/create-paypal-order", paypalController.createPayPalOrder)

router.post("/capture-paypal-order", auth, paypalController.capturePayPalOrder)


module.exports = router;
