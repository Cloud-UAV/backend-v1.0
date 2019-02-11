var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');


var SharedProjectsModel = sequelize.define('SharedProjects', {
	projectID: {
		type: Sequelize.INTEGER,
		references: 'Projects',
		referencesKey: 'id'
	},
	userID: {
		type: Sequelize.INTEGER,
		references: 'Users',
		referencesKey: 'id'
	},
});

module.exports=SharedProjectsModel;