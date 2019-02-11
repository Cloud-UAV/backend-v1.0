var bcrypt = require('bcrypt-nodejs');

var UserModel = require('../models/usersModel');
var DroneModel = require('../models/dronesModel');
var ProjectModel = require('../models/projectsModel');

var user={
	postUser: function(obj){
		return new Promise(function(resolve, reject){
			var hash = bcrypt.hashSync(obj['password']);

			UserModel.findOrCreate({
				attributes: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
				where: {
					email: obj['email']
				},
				defaults: {
					firstName: obj['firstName'],
					lastName: obj['lastName'],
					email: obj['email'],
					password: hash,
					role: obj['role'],
				}
			}).then(function(data){
				var response = JSON.parse(JSON.stringify(data[0])), created = data[1];
				
				resolve(JSON.stringify({
					id: response['id'],
					firstName: response['firstName'],
					lastName: response['lastName'],
					email: response['email'],
					role: response['role']
				}));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	resetPassword: function(email, pwd){
		return new Promise(function(resolve, reject){
			var hash = bcrypt.hashSync(pwd);
			console.log(email, hash);
			UserModel.update({
				password: hash
			},{
				where: {
					email: email
				}
			}).then(function(data){
				console.log(data);
				if(data == null){
					data = {};
				}
				
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getUserByEmail: function(email){
		return new Promise(function(resolve, reject){
			UserModel.find({
				attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
				where: {
					email: email
				}
			}).then(function(data){
				if(data == null){
					data = {};
				}
				
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getUserByEmailAndPassword: function(email, password){
		return new Promise(function(resolve, reject){
			UserModel.find({
				attributes: ['id', 'firstName', 'lastName', 'email', 'password', 'role'],
				where: {
					email: email
				}
			}).then(function(data){
				if(data == null){
					reject({
						error: 'User does not exist. Please create an account!'
					});
				}else{
					var response = JSON.parse(JSON.stringify(data));
					var compareHash = bcrypt.compareSync(password, response['password']);
						
					if(compareHash == true){
						resolve(JSON.stringify({
							id: response['id'],
							firstName: response['firstName'],
							lastName: response['lastName'],
							email: response['email'],
							role: response['role']
						}));
					}else{
						reject({
							error: 'Incorrect Password'
						});
					}
					resolve(JSON.stringify(data));
				}
				
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getUserByID: function(userID){
		return new Promise(function(resolve, reject){
			UserModel.find({
				attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
				where: {
					id: userID
				}
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getAllUsers: function(){
		return new Promise(function(resolve, reject){			
			UserModel.findAll({
				attributes: ['id', 'firstName', 'lastName', 'email', 'role']
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	updateUser: function(userID, data){
		return new Promise(function(resolve, reject){
			var obj =data;
			
			UserModel.update(obj,{
				where: {
					id: userID
				}
			}).then(function(data){
				resolve(data);
			}, function(err){
				reject(err);
			})
		});
	},
	deleteUser: function(userID){
		return new Promise(function(resolve, reject){
			UserModel.destroy({
				where: {
					id: userID
				}
			}).then(function(){
				resolve();
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	}
};

module.exports = user;
