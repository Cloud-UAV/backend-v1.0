var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');

var MissionPersonnels = sequelize.define('MissionPersonnels', {
	missionID: {
		type: Sequelize.INTEGER,
		references: 'Missions',
		referencesKey: 'id'
	},
	personnelID: {
		type: Sequelize.INTEGER,
		references: 'Personnel',
		referencesKey: 'id'
	}
},{
	timestamps: false,
	freezeTableName: true,
});

module.exports=MissionPersonnels;
