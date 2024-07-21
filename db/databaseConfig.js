const mysql = require("mysql2/promise");
require("dotenv").config();

async function updateBestSellingProducts(products) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    for (const product of products) {
      await connection.execute(
        `
              INSERT INTO best_selling_products (productId, productName, weightedSalesCount, ranges)
              VALUES (?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
              weightedSalesCount = VALUES(weightedSalesCount),
              ranges = VALUES(ranges)
            `,
        [
          product.productId,
          product.productName,
          product.weightedSalesCount,
          JSON.stringify(product.ranges),
        ]
      );
    }
  } finally {
    connection.end();
  }
}

module.exports = {
  updateBestSellingProducts,
};
