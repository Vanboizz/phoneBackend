const userRouter = require("./user.router");
const adminRouter = require("./admin.router");
const productRouter = require("./product.router");
const cartRouter = require("./cart.router");
const checkoutRouter = require("./checkout.router");
const favoriteRouter = require("./favorite.router")
const evaluateRouter = require("./evaluate.router")
const statisticRouter = require("./statistic.router")
const paypalRouter = require("./paypal.router")
const commentRouter = require("./comment.router")
const express = require("express");
const router = express.Router();

router.use("/auth/admin", adminRouter);
router.use("/auth/user", userRouter);
router.use("/product", productRouter);
router.use("/cart", cartRouter);
router.use("/invoice", checkoutRouter);
router.use("/favorite", favoriteRouter)
router.use("/evaluate", evaluateRouter)
router.use("/my-server", paypalRouter)
router.use("/comment", commentRouter)
router.use("/statistic", statisticRouter);


module.exports = router;
