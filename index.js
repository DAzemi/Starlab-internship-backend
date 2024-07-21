const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const passport = require("passport");
const passportSetup = require("./middlewares/passport");
const morgan = require("morgan");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

// ROUTES
const auth = require("./routes/authRoute");
const orders = require("./routes/orderRoutes");
const users = require("./routes/userRoutes");
const products = require("./routes/productRoutes");
const category = require("./routes/categoryRoute");
const productStock = require("./routes/productStockRoute");
const admin = require("./routes/adminRoute");
const userFavorite = require("./routes/userFavoriteRoute");
const stripeRoutes = require("./routes/stripeRoutes");
const bestSellingRoute = require("./routes/bestSellingRoute");

// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: true,
  })
);

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(
  cookieSession({
    name: "session",
    keys: ["supernova"],
    maxAge: process.env.MAX_AGE,
    signed: false,
    httpOnly: true,
  })
);

app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }

  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());

//ROUTE MIDDLEWARE
app.use("/api", auth);
app.use("/api", users);
app.use("/api", orders);
app.use("/api", products);
app.use("/api", category);
app.use("/api", productStock);
app.use("/api", admin);
app.use("/api", userFavorite);
app.use("/api/auth", auth);
app.use("/api", stripeRoutes);
app.use("/api", bestSellingRoute);

app.get("/", (req, res) => {
  res.send("Hello, Express, from SUPERNOVA group!");
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.use((err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
