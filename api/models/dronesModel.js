var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');
var DroneInventoryModel = require('./droneInventoryModel');
var DroneFilesModel = require('./droneFilesModel');
var UserModel = require('./usersModel');
var MissionModel = require('./missionsModel');


var DroneModel = sequelize.define('Drones', {
	name: {
		type: Sequelize.STRING
	},
	description: {
		type: Sequelize.STRING
	},
	thingID: {
		type: Sequelize.INTEGER
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

// DroneModel.hasMany(DroneInventoryModel, {foreignKey: 'droneID', as: 'Inventory'});
// DroneInventoryModel.belongsTo(DroneModel);

DroneModel.hasOne(DroneInventoryModel,  {foreignKey: 'droneID', as: 'Inventory'});
DroneInventoryModel.belongsTo(DroneModel);

DroneModel.hasMany(DroneFilesModel, {foreignKey: 'droneID', as: 'Files'});
DroneFilesModel.belongsTo(DroneModel);

UserModel.hasMany(DroneModel, {foreignKey: 'userID', as: 'Drones'});
DroneModel.belongsTo(UserModel);

DroneModel.hasOne(MissionModel,  {foreignKey: 'droneID', as: 'Drone'});
MissionModel.belongsTo(DroneModel);

module.exports=DroneModel;