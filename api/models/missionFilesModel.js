var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');

var MissionFiles = sequelize.define('MissionFiles', {
	missionID: {
		type: Sequelize.INTEGER,
		references: 'Missions',
		referencesKey: 'id'
	},
	name: {
		type: Sequelize.STRING
	},
	path: {
		type: Sequelize.STRING
	},
	uploadDate: {
		type: Sequelize.STRING
	}
	
},{
	timestamps: false,
	freezeTableName: true,
});

module.exports=MissionFiles;
