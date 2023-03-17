const userRouter = require("./user.router");
const adminRouter = require("./admin.router");
const express = require("express");
const router = express.Router();

router.use("/auth", userRouter);
router.use("/admin/auth", adminRouter);

module.exports = router;
