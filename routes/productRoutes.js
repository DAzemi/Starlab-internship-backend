const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  insertProduct,
  getProducts,
  getProduct,
  getProductImages,
  getProductDashboard,
  updateProduct,
  deleteProduct,
  newProduct,
  newProducts,
  newlyArrivedProducts,
  mostExpensiveProducts,
  sumOfProducts,
} = require("../controllers/productController");

// Create a multer storage and upload instance
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

router.post("/insertProduct", upload.single("image_url"), insertProduct);
router.get("/getProducts", getProducts);
router.get("/getProduct/:productId", getProduct);
router.get("/getProductImages/:productId", getProductImages);
router.get("/getProductDashboard/:productId", getProductDashboard);
router.put("/updateProduct/:productId", updateProduct);
router.delete("/deleteProduct/:productId", deleteProduct);
router.get("/newProduct", newProduct);
router.get("/newProducts", newProducts);
router.get("/newlyArrived-products", newlyArrivedProducts);
router.get("/mostExpensiveProducts", mostExpensiveProducts);
router.get("/sumOfProducts", sumOfProducts);

module.exports = router;
