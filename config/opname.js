const mysql = require("mysql");
const connection = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: 'opname',
  multipleStatements: true
});



module.exports = connection;
