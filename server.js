const mysql = require('mysql');
const dotenv = require('dotenv');
const cors = require('cors');
//const email = require('./utils/emailService');

dotenv.config({ path: './config.env' });

const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = require('./index');
const { getUsers } = require('./controllers/userController');

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
