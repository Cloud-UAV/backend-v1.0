var config = require('./api/config');
var Sequelize=require('sequelize');

// var Op=Sequelize.Op;

var sequelizeConnect=new Sequelize(config.mysqlAuth.database, config.mysqlAuth.username, config.mysqlAuth.password, {
	host: config.mysqlAuth.host,
	port: config.mysqlAuth.port,
	dialect: 'mysql',
	// operatorsAliases: {
	// 	$and: Op.and, 
	// 	$like: Op.like, 
	// 	$or: Op.or
	// },
	// logging: true,
	define: {
        timestamps: false,
        freezeTableName: true,
    },
    dialectOptions: {
		multipleStatements: true
	}
});

module.exports=sequelizeConnect;