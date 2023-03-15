const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.APP_HOST,
  user: process.env.APP_USER,
  password: process.env.APP_PASSWORD,
  database: process.env.APP_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.log(err);
  }
  console.log("success");
});

module.exports = {
  connection,
};
