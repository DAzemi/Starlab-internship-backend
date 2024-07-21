const mysql = require("mysql");
const database = require("../db/db");

exports.insertProduct = (req, res) => {
  if (!req.file && !req.body.image_url) {
    return res
      .status(400)
      .json({ error: "Image file or image_url is required." });
  }

  let image_url;
  if (req.file) {
    image_url = req.file.filename;
  } else {
    image_url = req.body.image_url;
  }

  const sql =
    "INSERT INTO products (`name`,`description`,`price`,`image_url`,`category_id`,`created_at`) VALUES (?)";
  const values = [
    req.body.name,
    req.body.description,
    req.body.price,
    image_url,
    req.body.category_id,
    req.body.created_at,
  ];

  database.query(sql, [values], (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Error during product insertion into the database" });
    }
    return res.status(200).json({ status: "Success" });
  });
};

exports.getProducts = (req, res) => {
  const q = "SELECT * FROM products";

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.getProduct = (req, res) => {
  const productId = req.params.productId;
  const q = `SELECT p.productId, p.name, p.description, p.price, p.image_url, c.name as category_name from products p join categories c ON p.category_id = c.categoryId WHERE p.productId = ${productId}`;

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result[0]);
  });
};
exports.getProductDashboard = (req, res) => {
  const productId = req.params.productId;
  const q = `SELECT * FROM products WHERE productId = ${productId}`;

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result[0]);
  });
};

exports.getProductImages = (req, res) => {
  const productId = req.params.productId;
  const query = `SELECT * FROM product_images WHERE product_Id = ?`;

  database.query(query, [productId], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(result);
  });
};

exports.updateProduct = (req, res) => {
  const { name, description, price, category_id } = req.body;
  const productId = req.params.id;

  let q;
  let values;

  if (req.file) {
    const image_url = req.file.filename;
    q = `UPDATE products SET name=?, description=?, price=?, image_url=?, category_id=? WHERE productId=?`;
    values = [name, description, price, image_url, category_id, productId];
  } else {
    q = `UPDATE products SET name=?, description=?, price=?, category_id=? WHERE productId=?`;
    values = [name, description, price, category_id, productId];
  }

  database.query(q, values, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.deleteProduct = (req, res) => {
  const productId = req.params.productId;
  const q = `Delete FROM products WHERE productId = ${productId}`;

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json({ data: "product deleted" });
  });
};

exports.newProduct = (req, res) => {
  const q = `SELECT image_url FROM products ORDER BY productId DESC LIMIT 1`;
  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result[0]);
  });
};
exports.newProducts = (req, res) => {
  const q = `SELECT * FROM products ORDER BY productId DESC LIMIT 3`;
  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.newlyArrivedProducts = (req, res) => {
  const q = `SELECT * FROM products ORDER BY productId DESC LIMIT 8`;
  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.mostExpensiveProducts = (req, res) => {
  const q = `SELECT * FROM products ORDER BY price DESC LIMIT 5`;
  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.sumOfProducts = (req, res) => {
  const q = `SELECT SUM(export) AS totalExports FROM products`;
  database.query(q, (err, result) => {
    if (err) return res.json(err);
    const totalExports = result[0].totalExports;
    return res.status(200).json(totalExports);
  });
};

exports.topSelling = (req, res) => {
  const query = `
    SELECT
      tp.productId,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.category_id
    FROM
      top_selling_products tp
      JOIN products p ON tp.productId = p.productId
    ORDER BY
      tp.weighted_sales_count DESC
    LIMIT 8;
  `;
  database.query(query, (err, result) => {
    if (err) {
      console.error("Error executing topSelling query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result);
  });
};
