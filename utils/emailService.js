const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dren.azemi444@gmail.com",
    pass: "phbk gmgz wiyq opxb",
  },
});

module.exports = transporter;
