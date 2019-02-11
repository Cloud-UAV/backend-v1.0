var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');
var UserModel = require('./usersModel');
var DroneModel = require('./dronesModel');
var SensorModel = require('./sensorsModel');
var SharedProjectsModel = require('./sharedProjectsModel');
var ProjectComplianceFilesModel = require('./projectComplianceFilesModel');
var ProjectPersonnelRolesModel = require('./projectPersonnelRolesModel');

var PersonnelModel = require('./personnelModel');
var MissionModel = require('./missionsModel');


var ProjectModel = sequelize.define('Projects', {
	name: {
		type: Sequelize.STRING
	},
	description: {
		type: Sequelize.STRING
	},
	userID: {
		type: Sequelize.INTEGER,
		references: 'Users',
		referencesKey: 'id'
	},
	
},{
	timestamps: false,
	freezeTableName: true,
	// classMethods: {
 //        associate : function(models) {
 //        	console.log(models);
 //            ProjectModel.belongsTo(models.Users)
 //        },
 //      }
});

UserModel.hasMany(ProjectModel, {foreignKey: 'userID'});
ProjectModel.belongsTo(UserModel);

ProjectModel.belongsToMany(DroneModel, {through: 'ProjectDrones', foreignKey: 'projectID'});
DroneModel.belongsToMany(ProjectModel, {through: 'ProjectDrones', foreignKey: 'droneID'});

ProjectModel.belongsToMany(SensorModel, {through: 'ProjectSensors', foreignKey: 'projectID'});
SensorModel.belongsToMany(ProjectModel, {through: 'ProjectSensors', foreignKey: 'sensorID'});

ProjectModel.belongsToMany(PersonnelModel, {through: 'ProjectPersonnels', foreignKey: 'projectID', as: 'Personnels'});
PersonnelModel.belongsToMany(ProjectModel, {through: 'ProjectPersonnels', foreignKey: 'personnelID'});

// ProjectModel.hasMany(SharedProjectsModel, {foreignKey: 'projectID', as: 'SharedProjects'});
// SharedProjectsModel.belongsTo(ProjectModel);

UserModel.belongsToMany(ProjectModel, {through: 'SharedProjects', foreignKey: 'userID'});
ProjectModel.belongsToMany(UserModel, {through: 'SharedProjects', foreignKey: 'projectID'});

ProjectModel.hasMany(ProjectComplianceFilesModel, {foreignKey: 'projectID', as: 'ComplianceFiles'});
ProjectComplianceFilesModel.belongsTo(ProjectModel);

ProjectModel.hasMany(ProjectPersonnelRolesModel, {foreignKey: 'projectID', as: 'ProjectPersonnelRoles'});
ProjectPersonnelRolesModel.belongsTo(ProjectModel);

ProjectModel.hasMany(MissionModel, {foreignKey: 'projectID'});
MissionModel.belongsTo(ProjectModel);


module.exports=ProjectModel;