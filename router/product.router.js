const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const authenticateToken = require("../middleware/auth");


//add product
router.post("/addproduct", productController.addProduct);

//get product
router.get("/getproduct", productController.getProduct);

// update product


// remove product
// router.delete("/removeproduct", authenticateToken, productController.removeProduct);

// get category
router.get("/getcategory", productController.getCategory);

module.exports = router;
