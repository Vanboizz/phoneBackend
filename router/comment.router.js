const express = require("express");
const router = express.Router();
const commentController = require("../controller/comment.controller");
const auth = require("../middleware/auth")


router.post("/addComment", auth, commentController.addComment)

router.get("/getComment/:idproducts", commentController.getComment)

module.exports = router;
