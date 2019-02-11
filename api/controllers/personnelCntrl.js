var RolesModel = require('../models/rolesModel');
var PersonnelFilesModel = require('../models/personnelFilesModel');
var SharedProjectsModel = require('../models/sharedProjectsModel');

var PersonnelModel = require('../models/personnelModel');
var ProjectModel = require('../models/projectsModel');
var UserModel = require('../models/usersModel');

var personnel = {
	postPersonnel: function(data) {
		return new Promise(function(resolve, reject){
			console.log(data);
			PersonnelModel.findOrCreate({
				attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number', 'imagePath', 'userID'],
				where: {
					email: data['email']
				},
				defaults: {
					firstName: data['firstName'],
					lastName: data['lastName'],
					email: data['email'],
					phone_number: data['phoneNumber'],
					imagePath: null,
					userID: data['userID'],
				}
			}).then(function(seqData){
				var personnel = seqData[0], created=seqData[1];
				resolve(JSON.stringify(personnel));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	postPersonnelFiles: function(data){
		return new Promise(function(resolve, reject){
			PersonnelFilesModel.findOrCreate({
				attributes: ['id', 'personnelID', 'name', 'path', 'uploadDate'],
				where: {
					personnelID: data['personnelID'],
					name: data['name']
				},
				defaults: {
					personnelID: data['personnelID'],
					name: data['name'],
					path: data['path'],
					uploadDate: data['uploadDate']
				}
			}).then(function(seqData){
				var personnelFiles=seqData[0], created=seqData[1];
				resolve(JSON.stringify(personnelFiles));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	updatePersonnelImage: function(data) {
		return new Promise(function(resolve, reject){
			PersonnelModel.update({
				imagePath: data['imagePath']
			}, {
				where: {
					id: data['id']
				}
			}).then(function(seqData){
				resolve(JSON.stringify(seqData));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getPersonnelFiles: function(personnelID){
		return new Promise(function(resolve, reject){
			PersonnelModel.find({
				where: {
					id: personnelID
				},
				include: [{
					nested: true,
					model: PersonnelFilesModel,
					as: 'Files',
					attributes: ['id', 'name', 'path', 'uploadDate']
				}]
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				reject(err);
			});
			
		});
	},
	getPersonnelByUserID: function(userID){
		return new Promise(function(resolve, reject){
			UserModel.find({
				where: {
					id: userID
				},
				attributes: [],
				include: [{
					nested: true,
					model: ProjectModel,
					as: 'Projects',
					attributes: ['id', 'name', 'description', 'userID'],
					through: {
						attributes: [],
					},
					include: [{
						nested: true,
						model: PersonnelModel,
						as: 'Personnels',
						attributes: ['id', 'firstName', 'lastName','email', 'phone_number', 'imagePath', 'userID'],
						through: {
							attributes: []
						},
						include: [{
							nested: true,
							model: RolesModel,
							as: 'Roles',
							attributes: ['id', 'personnelID', 'name']
						}]
					}]
				}, {
					nested: true,
					model: PersonnelModel,
					as: 'Personnels',
					attributes: ['id', 'firstName', 'lastName','email', 'phone_number', 'imagePath', 'userID'],
					required: true,
					include: [{
						nested: true,
						model: RolesModel,
						as: 'Roles',
						attributes: ['id', 'personnelID', 'name']
					}]
				}]
			})
			.then(function(response){
				console.log(JSON.stringify(response));
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getAllPersonnelInfo: function(personnelID){
		return new Promise(function(resolve, reject){
			PersonnelModel.find({
				attributes: ['id', 'firstName', 'lastName','email', 'phone_number', 'imagePath'],
				where: {
					id: personnelID
				},
				include: [{
					nested: true,
					model: PersonnelFilesModel,
					as: 'Files',
					attributes: ['id', 'name', 'path', 'uploadDate']
				}, {
					nested: true,
					model: RolesModel,
					as: 'Roles',
					attributes: ['id', 'name']
				}]
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getProjectPersonnel: function(projectID){
		return new Promise(function(resolve, reject){
			ProjectModel.find({
				attributes: ['id', 'projectID'],
				where: {
					projectID: projectID
				},
				include: [{
					nested: true,
					model: PersonnelModel, 
					as: 'Personnels',
					attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number'],
					through: {
						attributes: []
					},
					include: [{
						nested: true,
						model: PersonnelFilesModel,
						as: 'Files',
						attributes: ['id', 'name', 'path', 'uploadDate']
					}, {
						nested: true,
						model: RolesModel,
						as: 'Roles',
						attributes: ['id', 'name']
					}]
				}]
			}).then(function(data){
				resolve(data);
			}, function(err){
				reject(err);
			});
		});
	},
	deletePersonnel: function(personnelID){
		return new Promise(function(resolve, reject){
			PersonnelModel.destroy({
				where: {
					id: personnelID
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

module.exports=personnel;