const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const auth = require("../middleware/auth")

//add product
router.post("/addproduct", productController.addProduct);

//get product
router.get("/getproduct", productController.getProduct);

// get product detail
router.get("/getproductdetail/:idproducts", auth, productController.getProductDetail);

// update product
router.post("/updateproduct", productController.updateProduct);

// remove product
router.post("/removeproduct", productController.removeProduct);

// get category
router.get("/getcategory", productController.getCategory);

// get category by id
router.get("/getcategory/:id", productController.getCategorybyID)

module.exports = router;
