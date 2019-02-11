var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');

var PersonnelFilesModel = sequelize.define('PersonnelFiles', {
	name: {
		type: Sequelize.STRING
	},
	path: {
		type: Sequelize.STRING
	},
	uploadDate: {
		type: Sequelize.STRING
	},
	
},{
	timestamps: false,
	freezeTableName: true,
});

module.exports= PersonnelFilesModel;