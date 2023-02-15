const express = require("express")
const router= express.Router()

const controller = require("../controller/apiController")

router.get("/register", controller.register)

module.exports = router