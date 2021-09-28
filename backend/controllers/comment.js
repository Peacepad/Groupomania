const mysql = require("mysql");
const { promisify } = require("util");
const fs = require("fs");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Peacedu07",
  database: "groupomania",
});

connection.query = promisify(connection.query);

exports.create = (res, req, next) => {
    
}