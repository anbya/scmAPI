const mysql = require("mysql");

const oauthConnection = mysql.createPool({
  host: 'dci09.dewaweb.com',
  user: 'nahmthai_hris',
  password: '2A6BUSt-q}3g',
  database: 'nahmthai_hris',
  multipleStatements: true
});


module.exports = oauthConnection;