const db = require("../db/db");

exports.calculateBestSellingProducts = async (db) => {
  const dateRanges = [
    { label: "1Day", days: 1 },
    { label: "3Days", days: 3 },
    { label: "1Week", days: 7 },
    { label: "2Weeks", days: 14 },
    { label: "1Month", days: 30 },
  ];

  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - 30);

  const formattedStartDate = startDate.toISOString().split("T")[0];

  const query = `
    SELECT
      od.product_id,
      od.quantity,
      o.order_date
    FROM
      orders o
    JOIN
      order_details od ON o.orderId = od.order_id
    WHERE
      o.order_date >= ? AND o.order_date <= ?
  `;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(
        query,
        [formattedStartDate, currentDate.toISOString().split("T")[0]],
        (err, results, fields) => {
          if (err) {
            console.error("Error executing query:", err.message);
            reject(err);
            return;
          }
          resolve(results);
        }
      );
    });

    const products = results.map((row) => ({
      productId: row.product_id,
      order_date: new Date(row.order_date).toISOString().split("T")[0],
      quantity: row.quantity,
    }));

    const totalSales = calculateTotalSales(products, dateRanges);
    const detailedSales = calculateDetailedSales(products, dateRanges);

    const bestSellingProducts = results.map((row) => ({
      productId: row.product_id,
      weightedSalesCount:
        row.quantity *
        calculateWeightedScores(totalSales, detailedSales, dateRanges),
    }));

    bestSellingProducts.sort(
      (a, b) => b.weightedSalesCount - a.weightedSalesCount
    );

    const finalBestSellingProducts = calculateWeightedScores(
      totalSales,
      detailedSales,
      dateRanges
    );

    if (!calculateWeightedScores.hasBeenLogged) {
      // console.log("Final Best Selling Products: ", finalBestSellingProducts)
      calculateWeightedScores.hasBeenLogged = true;
    }

    // const finalBestSellingProducts = bestSellingProducts.slice(0, 8);

    console.log("Final Best Selling Products:", finalBestSellingProducts);
    return finalBestSellingProducts;
  } catch (error) {
    console.error("Error: ", error.message);
    return [];
  }
};

function calculateTotalSales(products, dateRanges) {
  const totalSales = {};

  dateRanges.forEach((range) => {
    totalSales[range.label] = {};

    products.forEach((product) => {
      totalSales[range.label][product.productId] = 0;
    });
  });

  products.forEach((product) => {
    dateRanges.forEach((range) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - range.days);

      if (product.order_date >= startDate.toISOString()) {
        totalSales[range.label][product.productId] += product.quantity;
      }
    });
  });

  return totalSales;
}

function calculateDetailedSales(products, dateRanges) {
  const detailedSales = [];

  if (!Array.isArray(detailedSales)) {
    return [];
  }

  products.forEach((product) => {
    dateRanges.forEach((range) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - range.days);

      if (product.order_date >= startDate.toISOString()) {
        detailedSales.push({
          productId: product.productId,
          order_date: product.order_date,
          quantity: product.quantity,
          range: range.label,
        });
      }
    });
  });

  return detailedSales;
}

function calculateWeightedScores(totalSales, detailedSales, dateRanges) {
  const productScores = new Map();

  detailedSales.forEach((sale) => {
    const dateScore = calculateDateScore(sale.order_date, dateRanges);
    const quantity = totalSales[sale.range][sale.productId];
    const quantityScore = calculateQuantityScore(quantity);

    if (!isNaN(quantity) && !isNaN(dateScore) && !isNaN(quantityScore)) {
      const score = sale.quantity * dateScore * quantityScore;

      if (productScores.has(sale.productId)) {
        productScores.set(
          sale.productId,
          productScores.get(sale.productId) + score
        );
      } else {
        productScores.set(sale.productId, score);
      }
    } else {
      console.log("Invalid values in calculation. Details: ", {
        sale,
        dateScore,
        quantityScore,
        quantity,
      });
    }
  });

  const bestSellingProducts = Array.from(
    productScores,
    ([productId, weightedSalesCount]) => ({
      productId,
      weightedSalesCount,
    })
  );

  bestSellingProducts.sort(
    (a, b) => b.weightedSalesCount - a.weightedSalesCount
  );

  const finalBestSellingProducts = bestSellingProducts.slice(0, 8);
  // console.log(
  //   "From line 170 final best selling products: ",
  //   finalBestSellingProducts
  // );

  return finalBestSellingProducts;
}

function calculateDateScore(orderDate, dateRanges) {
  const MILLISECONDS_IN_30_DAYS = 30 * 24 * 60 * 60 * 1000;
  const DEFAULT_SCORE = 0.01;
  const currentDate = new Date();
  const parsedOrderDate = new Date(orderDate);

  if (isNaN(parsedOrderDate.getTime())) {
    console.log("Error parsing orderDate: ", orderDate);
    return DEFAULT_SCORE;
  }

  const rangeDuration = currentDate.getTime() - parsedOrderDate.getTime();
  const normalizedScore = Math.max(
    0,
    Math.min(1, rangeDuration / MILLISECONDS_IN_30_DAYS)
  );
  ``;
  return 0.5 + normalizedScore * 0.5;
}

function calculateQuantityScore(quantity) {
  const score = Math.max(0.2, Math.min(1, quantity / 100));

  if (isNaN(score)) {
    console.error("Invalid quantity score: ", score);
  }
  return score;
}
