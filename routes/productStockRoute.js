const express = require("express");
const router = express.Router();
const {
    insertProductStock,
    getProductStocks,
    getProductStock,
    updateProductStock,
    deleteProductStock
} = require("../controllers/productStockController");

router.post("/insertProductStock", insertProductStock);
router.get("/getProductStocks", getProductStocks);
router.get("/getProductStock/:product_stock_id", getProductStock);
router.put("/updateProductStock/:product_stock_id", updateProductStock);
router.delete("/deleteProductStock/:product_stock_id", deleteProductStock);


module.exports = router;    