var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');
var MissionFiles = require('./missionFilesModel');
var MissionPersonnelsModel = require('./missionPersonnelsModel');
var PersonnelModel = require('./personnelModel');

var Missions = sequelize.define('Missions', {
	projectID: {
		type: Sequelize.INTEGER,
		references: 'Projects',
		referencesKey: 'id'
	},
	droneID: {
		type: Sequelize.INTEGER,
		references: 'Drones',
		referencesKey: 'id'
	},
	sensorID: {
		type: Sequelize.INTEGER,
		references: 'Sensors',
		referencesKey: 'id'
	},
	name: {
		type: Sequelize.STRING
	},
	startTime: {
		type: Sequelize.STRING
	},
	endTime: {
		type: Sequelize.STRING
	},
	description: {
		type: Sequelize.STRING
	},
	location: {
		type: Sequelize.GEOMETRY
	}
},{
	timestamps: false,
	freezeTableName: true,
});

Missions.hasMany(MissionFiles, {foreignKey: 'missionID', as: 'Files'});
MissionFiles.belongsTo(Missions);

Missions.belongsToMany(PersonnelModel, {through: 'MissionPersonnels', foreignKey: 'missionID'});
PersonnelModel.belongsToMany(Missions, {through: 'MissionPersonnels', foreignKey: 'personnelID', as: 'Personnels'});

module.exports=Missions;
