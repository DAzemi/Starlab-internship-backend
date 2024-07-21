const express = require("express");
const router = express.Router();
const bestSellingController = require("../controllers/bestSellingController");
const {
  storeTopSellingDaily,
  storeTopSellingProducts,
} = require("../controllers/topSellingCron");
const productController = require("../controllers/productController");
const db = require("../db/db");

router.get("/calculateBestSellingProducts", async (req, res) => {
  try {
    const result = await bestSellingController.calculateBestSellingProducts(db);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error in bestSellingRoute" });
  }
});

router.post("/store-best-selling", async (req, res) => {
  const finalBestSellingProducts = req.body;

  try {
    await storeTopSellingDaily();
    console.log(finalBestSellingProducts);
    await storeTopSellingProducts(req, res, finalBestSellingProducts);
    res
      .status(200)
      .json({ message: "Top selling products stored successfully." });
  } catch (error) {
    console.error("Error storing top selling products: ", error);
    res.status(500).json({ error: "Error storing top selling products" });
  }
});

router.get("/top-selling", productController.topSelling);

// router.post("/store-best-selling", async (req, res) => {
//   try {
//     await storeTopSellingDaily();
//     const calculateBestSellingProducts =
//       await bestSellingController.calculateBestSellingProducts(db);

//     console.log("calculateBestSellingProducts: ", calculateBestSellingProducts);

//     const date = new Date();
//     const numericDate =
//       date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
//     console.log("Numeric date: ", numericDate);

//     const values = calculateBestSellingProducts.flatMap((product) => [
//       numericDate,
//       product.productId,
//       product.weightedSalesCount,
//     ]);

//     const chunks = chunkArray(values, 3);

//     const promises = chunks.map((chunk) => {
//       return new Promise((resolve, reject) => {
//         db.query(insertQuery, chunk, (err) => {
//           if (err) {
//             console.log(
//               "Error in storeTopSellingProducs execution, insert query",
//               err.message
//             );
//             reject(err);
//             return;
//           }
//           resolve();
//         });
//       });
//     });

//     await Promise.all(promises);

//     res
//       .status(200)
//       .json({ message: "Top selling products stored successfully." });
//   } catch (error) {
//     console.log("Error in storing topSelling products: ", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

module.exports = router;
