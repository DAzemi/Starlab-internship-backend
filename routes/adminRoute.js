const express = require("express");
const router = express.Router();
const {
  getAdmins,
  getAdminsCount,
  getAdmin,
  insertCustomerSupportEmail,
} = require("../controllers/adminController");

router.get("/getAdmins", getAdmins);
router.get("/getAdminsCount", getAdminsCount);
router.get("/getAdmin/:id", getAdmin);
router.post("/insertCustomerSupportEmail", insertCustomerSupportEmail);

module.exports = router;
