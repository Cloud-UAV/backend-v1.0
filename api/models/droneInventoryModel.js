var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');

var DroneInventoryModel = sequelize.define('DroneInventory', {
	description: {
		type: Sequelize.STRING
	},
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



module.exports=DroneInventoryModel;