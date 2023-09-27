const express = require("express");
const router = express.Router();
const favoriteController = require("../controller/favorite.controller")
const auth = require("../middleware/auth")

router.post("/addFavorite", auth, favoriteController.handleAddFavorite)

router.delete("/deleteFavorite/:idproducts", auth, favoriteController.handleDeleteFavorite)

router.get("/getFavorite", auth, favoriteController.handleGetListFavorite)

module.exports = router;