var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');

var SharedDroneFiles = sequelize.define('SharedDroneFiles', {
	fileID: {
		type: Sequelize.INTEGER,
		references: 'DroneFiles',
		referencesKey: 'id'
	},
	sharedWith_userID: {
		type: Sequelize.INTEGER,
		references: 'Users',
		referencesKey: 'id'
	},
	uploadDate: {
		type: Sequelize.STRING
	}
	
},{
	timestamps: false,
	freezeTableName: true,
});

module.exports=SharedDroneFiles;
