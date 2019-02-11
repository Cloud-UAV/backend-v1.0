
var UserModel = require('../models/usersModel');
var RoleModel = require('../models/rolesModel');
var ProjectModel = require('../models/projectsModel');

var roles = {
	postRole: function(data) {
		return new Promise(function(resolve, reject){
			RoleModel.findOrCreate({
				attributes: ['id', 'personnelID', 'name'],
				where: {
					personnelID: data['personnelID'],
					name: data['name']
				},
				defaults: {
					personnelID: data['personnelID'],
					name: data['name']
				}
			}).then(function(data){
				var personnel = data[0], created = data[1];
				resolve(JSON.stringify(personnel));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	deleteRole: function(roleID){
		return new Promise(function(resolve, reject){
			RoleModel.destroy({
				attributes: ['id', 'personnelID', 'name'],
				where: {
					id: roleID
				}
			}).then(function(){
				resolve(JSON.stringify({}))
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	}
};

module.exports=roles;
