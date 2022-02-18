const mysql = require("mysql");
const { promisify } = require("util");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "groupomania",
  charset: "utf8mb4",
  timezone: 'utc'
});

connection.query = promisify(connection.query);

module.exports = connection;
