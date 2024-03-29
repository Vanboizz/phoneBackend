const express = require("express");
const router = express.Router();
const checkoutController = require("../controller/checkout.controller");
const auth = require("../middleware/auth");

//checkout
router.post("/checkout", auth, checkoutController.checkOut);

// get checkout
router.get("/getcheckout", auth, checkoutController.getCheckOut);

// get checkout
router.post("/detelecheckout", auth, checkoutController.deteleCheckout);    

module.exports = router;
