const express = require("express");
const router = express.Router();

const cartController = require("../controller/cart.controller");
const auth = require("../middleware/auth");

router.post("/addcart", auth, cartController.addCart);
router.get("/getcart", auth, cartController.getCart);

module.exports = router;
