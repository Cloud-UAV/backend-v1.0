var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');

var PublicDroneFiles = sequelize.define('PublicDroneFiles', {
	fileID: {
		type: Sequelize.INTEGER,
		references: 'DroneFiles',
		referencesKey: 'id',
	},
	uploadDate: {
		type: Sequelize.STRING
	}
	
},{
	timestamps: false,
	freezeTableName: true,
});

module.exports=PublicDroneFiles;