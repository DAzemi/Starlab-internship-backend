const mysql = require("mysql");

const database = require("../db/db");

exports.insertCategory = (req, res) => {
  try {
    const { name, description } = req.body;

    const q = "INSERT INTO categories (name, description) VALUES (?, ?)";

    database.query(
      q,
      [name, description],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(200).json(result);
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getCategories = (req, res) => {
  const q = "SELECT * FROM categories";

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result);
  });
};


exports.getCategory = (req, res) => {
  const categoryId = req.params.categoryId;
    const q = `SELECT * FROM categories where categoryId=${categoryId}`;
  
    database.query(q, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.status(200).json(result[0]);
    });
};

exports.updateCategory= (req, res) => {
  const categoryId = req.params.categoryId;
  const { name, description } = req.body;
  
  const q = "UPDATE categories SET name = ?, description = ? WHERE categoryId = ?";
  const values = [name, description, categoryId];
  
  database.query(q, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    
    return res.status(200).json(result);
  });
};

exports.deleteCategory= (req, res) => {
  const categoryId = req.params.categoryId;
    const q = `DELETE FROM categories WHERE categoryId=${categoryId}`;
  
    database.query(q, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.status(200).json({ data: "Category deleted" });
    });
};
