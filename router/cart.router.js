const express = require("express");
const router = express.Router();

const cartController = require("../controller/cart.controller");
const auth = require("../middleware/auth");

router.post("/addcart", auth, cartController.addCart);
router.get("/getcart", auth, cartController.getCart);
router.delete("/deletecart/:idsize/:idcolor", auth, cartController.deleteCart);
router.post("/increasequantity", auth, cartController.increaseQuantity);
router.post("/decreasequantity", auth, cartController.decreaseQuantity);
router.delete("/deleteallcart", auth, cartController.deleteAllCart);

module.exports = router;
