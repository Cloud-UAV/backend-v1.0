var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');
var ProjectPersonnelRolesModel = require('./projectPersonnelRolesModel');

var RolesModel = sequelize.define('Roles', {
	name: {
		type: Sequelize.STRING
	},
	personnelID: {
		type: Sequelize.INTEGER,
		references: 'Personnel',
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

RolesModel.hasMany(ProjectPersonnelRolesModel, {foreignKey: 'roleID', as: 'ProjectPersonnelRoles'});
ProjectPersonnelRolesModel.belongsTo(RolesModel);

module.exports=RolesModel;