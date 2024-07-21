const mysql = require("mysql");

const database = require("../db/db");

exports.insertOrder = async (orderData) => {
  try {
    const result = await database.query("INSERT INTO orders SET ?", orderData);
    console.log(
      "Order succesfully got inserted into the orders table: ",
      result
    );
  } catch (error) {
    console.error("Error inserting order into order table: ", error);
    throw error;
  }
};

exports.insertOrderDetails = async (orderDetailsData) => {
  try {
    const result = await database.query(
      "INSERT INTO order_details SET ?",
      orderDetailsData
    );
  } catch (error) {
    console.log("Error inserting a order_detail in order_details table", error);
    throw error;
  }
};

exports.updateProductStock = (product_id, quantity) => {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE product_stock SET quantity = quantity - ? WHERE product_id = ?";

    database.query(query, [quantity, product_id], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getOrders = (req, res) => {
  const q = "SELECT * FROM orders";

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result);
  });
};

exports.getOrdersByUserId = (req, res) => {
  const userId = req.params.userId;
  const q = `SELECT * FROM orders WHERE user_id = ${userId}`;

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result);
  });
};

exports.getOrder = (req, res) => {
  const orderId = req.params.orderId;
  const q = `SELECT * FROM orders where orderId=${orderId}`;

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(result[0]);
  });
};

exports.updateOrder = (req, res) => {
  const orderId = req.params.orderId;
  const { name, address, city, country, postal_code } = req.body;

  const q =
    "UPDATE orders SET name = ?, address = ?, city = ?, country = ?, postal_code = ? WHERE orderId = ?";
  const values = [name, address, city, country, postal_code, orderId];

  database.query(q, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    return res.status(200).json(result);
  });
};

exports.deleteOrder = (req, res) => {
  const orderId = req.params.orderId;
  const q = `DELETE FROM orders WHERE orderId=${orderId}`;

  database.query(q, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ data: "Order deleted" });
  });
};

exports.getNewOrdersLastWeek = (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const q = `SELECT COUNT(*) as newOrdersCount FROM orders WHERE order_date >= ?`;

  database.query(q, [oneWeekAgo], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }

    const newOrdersCount = result[0].newOrdersCount;
    return res.status(200).send(String(newOrdersCount));
  });
};
