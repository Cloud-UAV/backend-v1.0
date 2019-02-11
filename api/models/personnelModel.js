var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');
var UserModel = require('./usersModel');
var RoleModel = require('./rolesModel');
var PersonnelFilesModel = require('./personnelFilesModel');
var SharedProjectsModel = require('./sharedProjectsModel');

var PersonnelModel = sequelize.define('Personnel', {
	firstName: {
		type: Sequelize.STRING
	},
	lastName: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING
	},
	phone_number: {
		type: Sequelize.STRING
	},
	imagePath: {
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


RoleModel.belongsTo(PersonnelModel);
PersonnelModel.hasMany(RoleModel, {foreignKey: 'personnelID', as: 'Roles'});

PersonnelFilesModel.belongsTo(PersonnelModel);
PersonnelModel.hasMany(PersonnelFilesModel, {foreignKey: 'personnelID', as: 'Files'});

module.exports=PersonnelModel;