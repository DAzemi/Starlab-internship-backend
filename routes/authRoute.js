const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const jwt = require("jsonwebtoken");
const passport = require("passport");

router.post("/registerUserToTemporary", authController.registerUserToTemporary);
router.post("/sendEmailVerification", authController.sendEmailVerification);
router.get("/verifyEmail/:token", authController.verifyEmailToken);

router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.get(
  "/getEmailFromResetToken/:resetToken",
  authController.getEmailFromResetToken
);
router.post("/resetPassword", authController.resetPassword);

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/login/success", (req, res) => {
  if (req.user) {
    console.log("There is a success in logging in with Google");
    handleAuthentication();
    res.status(200).json({
      success: true,
      message: "success",
      user: req.user,
      cookies: req.token,
    });
  }
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `http://localhost:3000/googleauth`,
    failureRedirect: "http://localhost:3000/register",
  }),
  function (req, res) {
    console.log("Is it authenticated? : ", req.isAuthenticated);
    if (req.isAuthenticated()) {
      const user = {
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: "user",
      };

      req.session.user = {
        id: req.user.userId,
        email: req.user.email,
        name: req.user.name,
      };

      const token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      console.log("Token from google call: ", token);
      return res.json({ token });
    }
    return res.status(500).json({ message: "Failed to generate token." });
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("http://localhost:3000");
});

router.get("/generate-google-token", (req, res) => {
  console.log("Is the user authenticated? :", req.isAuthenticated());
  if (req.isAuthenticated()) {
    const user = {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email,
      role: "user",
    };

    const token = jwt.sign(user, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } else {
    res.status(500).json({ message: "Failed to generate token." });
  }
});

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Access granted" });
});

module.exports = router;
