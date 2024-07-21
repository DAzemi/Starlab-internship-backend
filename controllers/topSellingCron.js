const cron = require("node-cron");
const bestSellingController = require("../controllers/bestSellingController");
const db = require("../db/db");

exports.storeTopSellingDaily = async () => {
  const date = new Date();
  const numericDate =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

  const insertQuery =
    "INSERT INTO top_selling (id, created_at) VALUES (?, NOW())";
  const values = [numericDate];

  try {
    await new Promise((resolve, reject) => {
      db.query(insertQuery, values, (err) => {
        if (err) {
          console.log("Error in insertquery: ", err.message);
          reject(err);
          return;
        }
        resolve();
      });
    });
  } catch (error) {
    console.log("Error storing a topSellingDaily row: ", error.message);
    throw error;
  }
};

exports.storeTopSellingProducts = async (req, res) => {
  const insertQuery = `
      INSERT INTO top_selling_products (top_selling_id, product_id, weighted_sales_count)
      VALUES (?, ?, ?)
    `;

  try {
    const results = await bestSellingController.calculateBestSellingProducts(
      db
    );
    // const results = [
    //   { productId: 3, weightedSalesCount: 54.46212861151622 },
    //   { productId: 2, weightedSalesCount: 52.75365813728394 },
    //   { productId: 5, weightedSalesCount: 34.84243982371142 },
    //   { productId: 98, weightedSalesCount: 17.18262180148148 },
    //   { productId: 46, weightedSalesCount: 1.0067942461805557 },
    //   { productId: 75, weightedSalesCount: 1.0067942461805557 },
    //   { productId: 18, weightedSalesCount: 0.3355980820601852 },
    //   { productId: 19, weightedSalesCount: 0.3355980820601852 },
    // ];
    const date = new Date();
    const numericDate =
      date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    console.log("Numeric date: ", numericDate);
    console.log("Results from topSellingCron.js: ", results);

    const values = results.flatMap((product) => [
      numericDate,
      product.productId,
      product.weightedSalesCount,
    ]);

    const chunks = chunkArray(values, 3);

    const promises = chunks.map((chunk) => {
      return new Promise((resolve, reject) => {
        db.query(insertQuery, chunk, (err) => {
          if (err) {
            console.log(
              "Error in storeTopSellingProducs execution, insert query",
              err.message
            );
            reject(err);
            return;
          }
          resolve();
        });
      });
    });

    try {
      await Promise.all(promises);
      //   res
      //     .status(200)
      //     .json({ message: "Top selling products stored successfully." });
    } catch (error) {
      console.log("Error in promise.all: ", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.log("Error saving topSelling products: ", error.message);
    if (res) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.log("Response object is undefined.");
    }
  }
};

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// cron.schedule("0 0 */1 * *", async () => {
//   console.log("Updating most top_selling and top_selling_products");

//   try {
//     const finalBestSellingProducts =
//       await bestSellingController.calculateBestSellingProducts();

//     const topSellingId = await exports.storeTopSellingDaily();

//     await exports.storeTopSellingProducts(
//       topSellingId,
//       finalBestSellingProducts
//     );

//     console.log("Top selling products updated successfully.");
//   } catch (error) {
//     console.error("Error updating top selling products: ", error.message);
//   }
// });
