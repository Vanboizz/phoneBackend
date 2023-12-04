const express = require("express");
const router = express.Router();

const userController = require("../controller/user.controller");
const authenticateToken = require("../middleware/auth");
//register
router.post("/register", userController.register);
//login
router.post("/login", userController.login);

//forgot password
router.post("/forgotpassword", userController.forgotpassword);

//change passoword
router.post("/changepassword/:accessToken", userController.changepassword);

//get new token when jwt expried
router.post("/token", userController.token);

//get user
router.get("/getuser", authenticateToken, userController.getUserById);

// get all user 
router.get('/getusers', authenticateToken, userController.getUsers)

//update user
router.post("/updateUser", authenticateToken, userController.updateUser);

//update detail address

router.post('/updatedetailaddress', authenticateToken, userController.updatedetailaddress)

//create new password
router.post("/createnewpassword", authenticateToken, userController.createnewpassword);

module.exports = router;
