const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const verifyToken = require("../middlewares/verifyToken");
const transporter = require("../utils/emailService");
const cookieSession = require("cookie-session");

const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const mailOptions = {
  from: "SUPERNOVA TEAM <dren.azemi444@.com",
  subject: "Reset your Password - SUPERNOVA TEAM",
  text: ``,
};

exports.registerUserToTemporary = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const verificationEmailToken = crypto.randomBytes(32).toString("hex");

  database.query(
    "SELECT COUNT(*) AS count FROM (SELECT email FROM users UNION SELECT email FROM temporaryUsers) AS combined WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Internal server error",
        });
      } else if (result[0].count > 0) {
        return res.status(400).json({
          message: "This email is already in use!",
        });
      }
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        database.query(
          "INSERT INTO temporaryUsers (name, email, password, isVerified, verification_token, role) VALUES (?,?,?,?,?)",
          [name, email, hashedPassword, 0, verificationEmailToken, role],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                message: "Internal server error",
              });
            }
            res.status(201).json({
              message: "User registered",
            });
          }
        );
      } catch (hashingError) {
        console.error(hashingError);
        res.status(500).json({
          message: "Password hashing error",
        });
      }
    }
  );
};

exports.sendEmailVerification = async (req, res, next) => {
  const { email } = req.body;

  database.query(
    "SELECT verification_token FROM temporaryusers WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Internal server error",
        });
      }
      if (result.length === 1) {
        const verificationEmailToken = result[0].verification_token;
        const verifyLink = `http://localhost:3000/verifyEmail/${verificationEmailToken}`;
        const mailOptions = {
          from: "SUPERNOVA TEAM <dren.azemi444.com>",
          to: email,
          subject: "Email Verification Link",
          html: `
              Click the following link to verify: <a href="${verifyLink}">${verifyLink}</a>
            `,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error while sending the email:", error);
            return res.status(500).json({
              message: "Failed to send verification email",
            });
          } else {
            console.log("Email sent", info.response);
            return res.status(200).json({
              message: "Verification email sent successfully",
            });
          }
        });
      } else {
        return res.status(404).json({
          message: "User not found",
        });
      }
    }
  );
};

exports.verifyEmailToken = async (req, res, next) => {
  const { token } = req.params;
  console.log("Received token", token);

  database.query(
    "SELECT userId, name, email, password, role FROM temporaryusers WHERE verification_token = ?",
    [token],
    async (err, tempUserResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Internal server error",
        });
      }

      console.log("tempUserResult: ", tempUserResult);
      if (tempUserResult.length === 1) {
        const tempUser = tempUserResult[0];

        console.log("tempUser: ", tempUser);

        database.query(
          "INSERT INTO users (userId, name, email, password, role) VALUES (?,?,?,?,?)",
          [
            tempUser.userId,
            tempUser.name,
            tempUser.email,
            tempUser.password,
            tempUser.role,
          ],
          (err, insertResult) => {
            if (err) {
              console.error(err);
              return res.status(500).json({
                message: "Internal server error",
              });
            }

            database.query(
              "DELETE FROM temporaryUsers WHERE email = ?",
              [tempUser.email],
              (err, deleteResult) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({
                    message: "Internal server error",
                  });
                }

                return res.status(200).json({
                  message: "Email verified and user registered successfully",
                });
              }
            );
          }
        );
      } else {
        console.log("No user found with this token: ", token);
        return res.status(400).json({
          message: "Invalid or expired token",
        });
      }
    }
  );
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  database.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: "Email not found!",
        });
      }

      const user = result[0];
      const hashedPassword = user.password;
      console.log(user);
      try {
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        if (!passwordMatch) {
          return res.status(401).json({
            message: "Email or password not correct!",
          });
        }

        req.login(user, (loginErr) => {
          if (loginErr) {
            return res.status(500).json({
              message: "Error while creating a session",
            });
          }
        });

        const token = jwt.sign(
          { userId: user.userId },
          process.env.SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );

        return res
          .status(200)
          .json({
            token: token,
            role: user.role,
            userId: user.userId,
            name: user.name,
            email: user.email
          });
      } catch (compareError) {
        console.error("Error while comparing passwords", compareError);
        return res.status(500).json({
          message: "Email or password incorrect",
        });
      }
    }
  );
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  database.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Internal server error",
        });
      }
      if (result.length === 0) {
        return res.status(404).json({
          message: "There is no user with this email",
        });
      }

      const user = result[0];

      const resetToken = crypto.randomBytes(32).toString("hex");

      const expirationTime = new Date(
        Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRATION, 10)
      );

      const mailOptions = {
        from: "SUPERNOVA TEAM <dren.azemi444@.com",
        to: email,
        subject: "Reset your password - SUPERNOVA TEAM",
        text: `To reset your password as requested, please click on the following link http://localhost:3000/resetPassword/${resetToken}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Email sent" + info.response);
        }
      });

      database.query(
        "INSERT INTO resetpasswords(user_id, email, reset_token, expiration_time) VALUES (?,?,?,?)",
        [user.userId, user.email, resetToken, expirationTime],
        async (err, result) => {
          if (err) {
            console.log("Error sending the token", err);
            return res.status(500).json({
              message: "Error sending a reset token",
            });
          }
          res.status(200).json({
            message: "Reset token is sent to your email",
          });
        }
      );
    }
  );
};

exports.resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  const validateQuery =
    "SELECT email, reset_token, user_id, expiration_time FROM resetpasswords WHERE reset_token=?";
  database.query(validateQuery, [token], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const { email, user_id, reset_token, expiration_time } = result[0];
    const currentTime = new Date();

    if (currentTime > expiration_time) {
      return res.status(400).json({ message: "Token has expired" });
    }

    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Internal server error",
        });
      }
      const updatePasswordQuery =
        "UPDATE users SET password = ? WHERE userId = ?";
      database.query(
        updatePasswordQuery,
        [hashedPassword, user_id],
        (err, updateResult) => {
          if (err) {
            return res.status(500).json({
              message: "Updating password error",
            });
          }
          if (updateResult.affectedRows === 1) {
            const deleteTokenQuery =
              "UPDATE resetpasswords SET reset_token = NULL WHERE reset_token = ?";
            database.query(
              deleteTokenQuery,
              [reset_token],
              (err, deleteResult) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json({
                    message: "deleting token from userId failed",
                  });
                }

                res.status(200).json({
                  message: "Password reset successful",
                });
              }
            );
          } else {
            res.status(500).json({
              message: "Password reset failed",
            });
          }
        }
      );
    });
  });
};

exports.getEmailFromResetToken = (req, res, next) => {
  const { resetToken } = req.params;

  verifyToken(resetToken)
    .then((decoded) => {
      const userId = decoded.userId;
      console.log("Verified user ID:", userId);
      const query = "SELECT email FROM users WHERE userId = ?";

      database.query(query, [userId], (err, result) => {
        if (err) {
          console.log(database.query);
          console.error("Error in getEmailFromResetToken: ", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        if (result.length === 0) {
          res.status(404).json({ message: "No user found" });
        }

        const email = result[0].email;
        return res.status(200).json({ email });
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ message: "Invalid reset token" });
    });
};
