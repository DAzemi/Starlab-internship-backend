const mysql = require("mysql");
const database = require("../db/db");

exports.insertProductStock = (req, res) => {
  try {
    const { product_id, sasia } = req.body;

    const q = "INSERT INTO product_stock (product_id, quantity) VALUES (?, ?)";

    database.query(q, [product_id, sasia], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.status(200).json(result);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getProductStocks = (req, res) => {
  const q = "SELECT * FROM product_stock";

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result);
  });
};

exports.getProductStock = (req, res) => {
  const product_stock_id = req.params.product_stock_id;
  const q = `SELECT * FROM product_stock where product_stock_id=${product_stock_id}`;

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result[0]);
  });
};

exports.updateProductStock = (req, res) => {
  const product_stock_id = req.params.product_stock_id;
  const { product_id, quantity } = req.body;

  const q =
    "UPDATE product_stock SET product_id = ?, quantity = ? WHERE product_stock_id = ?";
  const values = [product_id, quantity, product_stock_id];

  database.query(q, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json(result);
  });
};

exports.deleteProductStock = (req, res) => {
  const product_stock_id = req.params.product_stock_id;
  const q = `DELETE FROM product_stock WHERE product_stock_id=${product_stock_id}`;

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ data: "Product Stock deleted" });
  });
};
