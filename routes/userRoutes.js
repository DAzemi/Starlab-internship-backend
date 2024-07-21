const express = require("express");
const router = express.Router();
const {
    insertUser,
    getUsers,
    getUser,
    deleteUser,
    updateUser,
    getUsersOnly,
    getNewUsersLastWeek,
    getUserNameFromToken
} = require("../controllers/userController");

router.post("/insertuser", insertUser);
router.get("/getUsers", getUsers);
router.get("/getUser/:id", getUser);
router.put("/updateUser/:id", updateUser);
router.delete("/deleteUser/:userId", deleteUser);
router.get("/getUsersOnly", getUsersOnly);
router.get("/getNewUsersLastWeek",getNewUsersLastWeek );
router.get("/getUserName", getUserNameFromToken);

//dsmksd

module.exports = router;    