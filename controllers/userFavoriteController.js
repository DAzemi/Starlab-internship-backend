const mysql = require("mysql");

const database = require("../db/db");

exports.insertUserFavorites = (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const checkIfExistsQuery =
      "SELECT * FROM user_favorites WHERE user_id = ? AND product_id = ?";
    const insertQuery =
      "INSERT INTO user_favorites (user_id, product_id) VALUES (?, ?)";

    database.query(checkIfExistsQuery, [user_id, product_id], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (rows && rows.length > 0) {
        return res.status(400).json({ error: "Record already exists" });
      }

      database.query(insertQuery, [user_id, product_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.status(200).json(result);
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserFavorites = (req, res) => {
  const q = "SELECT * FROM user_favorites";

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result);
  });
};

exports.getUserFavorite = (req, res) => {
  const favoriteId = req.params.favoriteId;
  const q = `SELECT * FROM user_favorites where favoriteId =${favoriteId}`;

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result[0]);
  });
};
exports.getUserFavoriteByUserId = (req, res) => {
  const userId = req.params.userId;
  const q = `SELECT * FROM user_favorites WHERE user_id = ${userId}`;

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No favorites found for this user" });
    }
    return res.status(200).json(result);
  });
};

exports.updateUserFavorite = (req, res) => {
  const favoriteId = req.params.favoriteId;
  const { user_id, product_id } = req.body;

  const q =
    "UPDATE user_favorites SET user_id = ?, product_id = ? WHERE favoriteId = ?";
  const values = [user_id, product_id, favoriteId];

  database.query(q, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json(result);
  });
};

exports.deleteUserFavorite = (req, res) => {
  const { user_id, product_id } = req.query;
  const q = "DELETE FROM user_favorites WHERE user_id = ? AND product_id = ?";

  database.query(q, [user_id, product_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ data: "User Favorite deleted" });
  });
};
