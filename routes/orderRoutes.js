const express = require("express");
const router = express.Router();
const {
    insertOrder,
    getOrders,
    getOrdersByUserId,
    getOrder,
    deleteOrder,
    updateOrder,
    getNewOrdersLastWeek,
} = require("../controllers/orderController");

router.post("/insertOrder", insertOrder);
router.get("/getOrders", getOrders);
router.get("/getOrdersByUserId/:userId", getOrdersByUserId);
router.get("/getOrder/:orderId", getOrder);
router.put("/updateOrder/:orderId", updateOrder);
router.delete("/deleteOrder/:orderId", deleteOrder);
router.get("/getNewOrdersLastWeek", getNewOrdersLastWeek);

module.exports = router;
