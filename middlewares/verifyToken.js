const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  console.log("verifyToken function called");
  const token = (req.headers.authorization || "").split(" ")[1];

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    console.log("Token verification succesful. Decoded data: ", decoded);
    req.userId = decoded.userId;
    next();
  });
}

module.exports = verifyToken;
