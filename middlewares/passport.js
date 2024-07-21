const mysql = require("mysql");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const database = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/auth/google/callback",
    },

    function (accessToken, refreshToken, profile, done) {
      const email = profile.emails[0].value;
      const name = profile.displayName;

      database.query(
        "SELECT COUNT(*) AS count FROM (SELECT email FROM users UNION SELECT email FROM temporaryUsers) AS combined WHERE email = ?",
        [email, email],
        function (error, results, fields) {
          if (error) {
            console.log("Error in mysql querying");
            return done(error);
          }

          const count = results[0].count;
          if (count === 0) {
            const user = {
              name: name,
              email: email,
              password: "",
              role: "user",
            };

            database.query(
              "INSERT INTO USERS SET ?",
              user,
              function (error, result) {
                if (error) {
                  return done(error);
                }
                user.userId = result.insertId;

                return done(null, user);
              }
            );
          } else {
            const user = results[0];
            return done(null, { user });
          }
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log("Serializing user: ", user);
  done(null, user.userId);
  console.log(user);
});

passport.deserializeUser(function (id, done) {
  console.log("Deserializing user with ID: ", id);
  database.query(
    "SELECT * FROM users WHERE userId = ?",
    [id],
    function (error, results, fields) {
      if (error) {
        console.log("Error during deserialization: ", error);
        return done(error);
      }
      if (results.length === 0) {
        console.log("No user found during deserializaiton");
        return done(null, false);
      }
      const user = results[0];
      console.log("Deserialized user: ", user);
      return done(null, user);
    }
  );
});
