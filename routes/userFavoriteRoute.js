const express = require("express");
const router = express.Router();
const {
    insertUserFavorites,
    getUserFavorites,
    getUserFavorite,
    updateUserFavorite,
    deleteUserFavorite,
    getUserFavoriteByUserId,
    checkIfRowExists,
} = require("../controllers/userFavoriteController");

router.post("/insertUserFavorites", insertUserFavorites);
router.get("/getUserFavorites", getUserFavorites);
router.get("/getUserFavorite/:favoriteId", getUserFavorite);
router.put("/updateUserFavorite/:favoriteId", updateUserFavorite);
router.delete("/deleteUserFavorite/", deleteUserFavorite);
router.get("/getUserFavoriteByUserId/:userId", getUserFavoriteByUserId);
router.get("/checkIfRowExists/:userId/:productId", getUserFavoriteByUserId);
module.exports = router;    