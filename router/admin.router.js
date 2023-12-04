const express = require("express");
const router = express.Router();

const adminController = require("../controller/admin.controller");
const authenticateToken = require("../middleware/auth");

router.post("/register", adminController.register);


module.exports = router;
