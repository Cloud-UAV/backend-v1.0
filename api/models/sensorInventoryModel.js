var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');

var SensorInventoryModel = sequelize.define('SensorInventory', {
	inventory: {
		type: Sequelize.STRING
	},
	sensorID: {
		type: Sequelize.INTEGER,
		references: 'Sensors',
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



module.exports=SensorInventoryModel;