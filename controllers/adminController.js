const mysql = require("mysql");

const database = require("../db/db");

exports.getAdmins = (req, res) => {
  const q = "SELECT userId, name, email, role FROM users WHERE role='admin'";

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
};

exports.getAdminsCount = (req, res) => {
  const q = "SELECT COUNT(userId) AS adminCount FROM users WHERE role ='admin'";
  database.query(q, (err, result) => {
    if (err) return res.json(err);

    const adminCount = result[0].adminCount;

    return res.status(200).json(adminCount);
  });
};

exports.getAdmin = (req, res) => {
  const q = `
      SELECT * FROM users 
      WHERE userId=${req.params.id} 
      AND role = 'admin'
    `;

  database.query(q, (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result[0]);
  });
};

exports.insertCustomerSupportEmail = (req, res) => {
  const { user_id, issuer_name, email, email_subject, email_body } = req.body;
  const q = `
    INSERT INTO customer_support (user_id, issuer_name, email, email_subject, email_body, issued_at)
    VALUES (?,?, ?, ?, ?, NOW())
  `;
  database.query(
    q,
    [user_id, issuer_name, email, email_subject, email_body],
    (err, result) => {
      if (err) {
        console.error("Error inserting into customer_support table: ", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      return res.status(200).json(result);
    }
  );
};
