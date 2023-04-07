const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");

//add category
router.post("/addcategory", productController.addCategory);

//add product
router.post("/addproduct", productController.addProduct);

//add image
router.post("/addimage", productController.addImage);

//add size
router.post("/addsize", productController.addSize);

//add color
router.post("/addcolor", productController.addColor);

//get product
router.get("/getproduct", productController.getProduct)

module.exports = router;
