var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');
var SensorInventoryModel = require('./sensorInventoryModel');
var MissionModel = require('./missionsModel');

var SensorModel = sequelize.define('Sensors', {
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
	freezeTableName: true
	// classMethods: {
 //        associate : function(models) {
 //        	console.log(models);
 //            ProjectModel.belongsTo(models.Users)
 //        },
 //      }
});

// SensorModel.hasMany(SensorInventoryModel, {foreignKey: 'sensorID', as: 'Inventory'});
// SensorInventoryModel.belongsTo(SensorModel);

SensorModel.hasOne(SensorInventoryModel,  {foreignKey: 'sensorID', as: 'Inventory'});
SensorInventoryModel.belongsTo(SensorModel);

SensorModel.hasOne(MissionModel,  {foreignKey: 'sensorID', as: 'Sensor'});
MissionModel.belongsTo(SensorModel);

module.exports=SensorModel;