const express = require("express");
const router = express.Router();

const userController = require("../controller/user.controller");
const auth = require("../middleware/auth");
//register
router.post("/register", userController.register);
//login
router.post("/login", userController.login);
//get new token when jwt expried
router.post("/token", userController.token);

//get user
router.get("/user/:id", auth, userController.getUserById);

module.exports = router;
