var config = require('./api/config');
var mysql = require('mysql');

var pool = mysql.createPool({
	host: config.mysqlAuth.host,
	user: config.mysqlAuth.username,
	password: config.mysqlAuth.password,
	port: config.mysqlAuth.port,
	database: config.mysqlAuth.database,
	multipleStatements: true
});

module.exports=pool;
