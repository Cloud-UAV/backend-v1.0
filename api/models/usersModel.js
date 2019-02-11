var sequelize = require('../../sequelizeConnection');
var Sequelize=require('sequelize');
var SensorModel = require('./sensorsModel');
var PersonnelModel = require('./personnelModel');

var UserModel = sequelize.define('Users', {
	firstName: {
		type: Sequelize.STRING
	},
	lastName: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING
	},
	password: {
		type: Sequelize.STRING
	},
	role: {
		type: Sequelize.STRING
	}
},{
	timestamps: false,
	freezeTableName: true,
});

UserModel.hasMany(SensorModel, {foreignKey: 'userID', as: 'Sensors'});
SensorModel.belongsTo(UserModel);


UserModel.hasMany(PersonnelModel, {foreignKey: 'userID', as: 'Personnels'});
PersonnelModel.belongsTo(UserModel);

// UserModel.hasMany(PersonnelModel, {foreignKey: 'userID', as: 'Personnel'});
// PersonnelModel.belongsTo(UserModel);

// UserModel.hasMany(FilesModel, {foreignKey: 'userID'});
// FilesModel.belongsTo(UserModel);


module.exports=UserModel;