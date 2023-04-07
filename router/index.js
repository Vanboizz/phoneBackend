const userRouter = require("./user.router");
const adminRouter = require("./admin.router");
const productRouter = require("./product.router")
const cartRouter = require("./cart.router")
const express = require("express");
const router = express.Router();

router.use("/auth/admin", adminRouter);
router.use("/auth/user",userRouter)
router.use("/product", productRouter);
router.use("/cart",cartRouter)

module.exports = router;
