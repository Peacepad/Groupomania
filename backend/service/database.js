const mysql = require("mysql");
const { promisify } = require("util");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Peacedu07",
  database: "groupomania",
  charset: "utf8mb4"
});

connection.query = promisify(connection.query);

module.exports = connection;
