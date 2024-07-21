const mysql = require("mysql");

const database = require("../db/db");

exports.insertUser = (req, res) => {
  const q = "INSERT INTO users SET ?";

  const { name, email, password, role } = req.body;

  database.query(q, { name, email, password, role }, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.getUsers = (req, res) => {
  const q = "SELECT * FROM users";

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.getUser = (req, res) => {
  const q = `SELECT * FROM users where userId=${req.params.id}`;

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result[0]);
  });
};

exports.updateUser = (req, res) => {
  const { name, email, password, role } = req.body;
  const q = `UPDATE users SET ? where userId=${req.params.id}`;
  database.query(q, { name, email, password, role }, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.deleteUser = (req, res) => {
  const userId = req.params.userId;
  const q = `DELETE FROM users WHERE userId=${userId}`;

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json({ data: "user deleted" });
  });
};

exports.getUsersOnly = (req, res) => {
  const q = "SELECT userId, name, email, role FROM users WHERE role='user'";

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.getNewUsersLastWeek = (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const q = `SELECT COUNT(*) as newUsersCount FROM users WHERE created_at >= ?`;

  database.query(q, [oneWeekAgo], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }

    const newUsersCount = result[0].newUsersCount;
    return res.status(200).send(String(newUsersCount));
  });
};

const jwt = require('jsonwebtoken');


exports.getUserNameFromToken = (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, 'your_secret_key', (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = decodedToken.userId;

    // Fetch user's name using the userId
    const q = `SELECT name FROM users WHERE userId = ?`;

    database.query(q, [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database Error' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userName = result[0].name;
      return res.status(200).json({ name: userName });
    });
  });
};