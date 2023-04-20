const express = require("express");
const router = express.Router();
const checkoutController = require("../controller/checkout.controller");
const auth = require("../middleware/auth");

//checkout
router.post("/checkout", auth, checkoutController.checkOut);

module.exports = router;
