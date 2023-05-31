const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");

//add product
router.post("/addproduct", productController.addProduct);

//get product
router.get("/getproduct", productController.getProduct);

// get category
router.get("/getcategory", productController.getCategory);

module.exports = router;
