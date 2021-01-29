const mysql = require("mysql");
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'central_kitchen',
  multipleStatements: true
});



module.exports = connection;
