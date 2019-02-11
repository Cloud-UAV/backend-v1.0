var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');

var SharedDroneFiles = require('./sharedDroneFilesModel');
var PublicDroneFiles = require('./publicDroneFilesModel');
var UserModel = require('./usersModel');

var DroneFilesModel = sequelize.define('DroneFiles', {
	name: {
		type: Sequelize.STRING
	},
	path: {
		type: Sequelize.STRING
	},
	uploadDate: {
		type: Sequelize.INTEGER
	},
	// userID: {
	// 	type: Sequelize.INTEGER,
	// 	references: 'Users',
	// 	referencesKey: 'id'
	// },
	droneID: {
		type: Sequelize.INTEGER,
		references: 'Drones',
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

PublicDroneFiles.belongsTo(DroneFilesModel, {foreignKey: 'fileID', as: 'File'});
DroneFilesModel.hasOne(PublicDroneFiles, {foreignKey: 'fileID', as: 'PublicFiles'});

// DroneFilesModel.hasMany(PublicDroneFiles, {foreignKey: 'fileID', as: 'PublicFiles'});
// PublicDroneFiles.belongsTo(DroneFilesModel);

DroneFilesModel.hasMany(SharedDroneFiles, {foreignKey: 'fileID', as: 'File'});
SharedDroneFiles.belongsTo(DroneFilesModel, {foreignKey: 'fileID', as: 'File'});

UserModel.belongsToMany(DroneFilesModel, {through: 'SharedDroneFiles', foreignKey: 'sharedWith_userID', as: 'Users'});
DroneFilesModel.belongsToMany(UserModel, {through: 'SharedDroneFiles', foreignKey: 'fileID'});


module.exports=DroneFilesModel;