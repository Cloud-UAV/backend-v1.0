var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');


var ProjectPersonnelRolesModel = sequelize.define('ProjectPersonnelRoles', {
	roleID: {
		type: Sequelize.INTEGER,
		references: 'Roles',
		referencesKey: 'id'
	},
	projectID: {
		type: Sequelize.INTEGER,
		references: 'Projects',
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

module.exports=ProjectPersonnelRolesModel;