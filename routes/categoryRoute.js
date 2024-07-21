const express = require("express");
const router = express.Router();
const {
    insertCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

router.post("/insertCategory", insertCategory);
router.get("/getCategories", getCategories);
router.get("/getCategory/:categoryId", getCategory);
router.put("/updateCategory/:categoryId", updateCategory);
router.delete("/deleteCategory/:categoryId", deleteCategory);


module.exports = router;    