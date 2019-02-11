var PublicDroneFiles = require('../models/publicDroneFilesModel');
var SharedDroneFilesModel = require('../models/sharedDroneFilesModel');

var DroneFilesModel = require('../models/droneFilesModel');

var DroneModel = require('../models/dronesModel');
var UserModel = require('../models/usersModel');

var files = {
	postFile: function(obj){
		return new Promise(function(resolve, reject){
			DroneFilesModel.findOrCreate({
				where: {
					name: obj.name,
					droneID: obj.droneID
				},
				defaults: {
					name: obj.name,
					droneID: obj.droneID,
					path: obj.path,
					uploadDate: obj.uploadDate
				}
			}).then(function(data){
				var res = data[0], created=data[1];

				resolve(JSON.stringify(res));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	postSharedFile: function(obj){
		return new Promise(function(resolve, reject){
			DroneFilesModel.find({
				attributes: ['id', 'name', 'path', 'uploadDate', 'droneID'],
				where: {
					id: obj['fileID']
				}
			}).then(function(response){
				response['setUsers']([obj['shareWithUserID']], {
					through: {
						'uploadDate': obj['uploadDate']
					}
					
				}).then(function(){
					resolve(JSON.stringify(response));
				}, function(err){
					console.log(err);
					reject(err);
				});
				
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	postPublicFile: function(obj){
		return new Promise(function(resolve, reject){
			PublicDroneFiles.findOrCreate({
				attributes: ['id', 'fileID', 'uploadDate'],
				where: {
					fileID: obj['fileID']
				},
				defaults: {
					fileID: obj['fileID'],
					uploadDate: obj['uploadDate']
				}
			}).then(function(){
				resolve(JSON.stringify({}));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getAllDroneFiles: function(droneID, filter){
		return new Promise(function(resolve, reject){
			var whereObj;

			if(filter != undefined){
				whereObj={
					droneID: droneID,
					name: {
						$like: '%.'+filter
					}
				}
			}else{
				whereObj={
					droneID: droneID
				}
			}
			DroneFilesModel.findAll({
				where: whereObj,
				attributes: ['id', 'name', 'path', 'uploadDate', 'droneID']
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getFileByID: function(fileID){
		return new Promise(function(resolve, reject){
			DroneFilesModel.find({
				where: {
					id: fileID,
				}
			}).then(function(response){
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});

		});
	},
	getAllPublicFiles: function(){
		return new Promise(function(resolve, reject){
			PublicDroneFiles.findAll({
				attributes: ['id', 'uploadDate'],

				include: [{
					model: DroneFilesModel,
					nested: true,
					as: 'File',
					attributes: ['id', 'name', 'path', 'uploadDate'],
					include: [{
						model: DroneModel,
						nested: true,
						attributes: ['id'],
						include: [{
							nested: true,
							model: UserModel,
							attributes: ['id', 'firstName', 'lastName', 'email']
						}]
					}]
				}]
			}).then(function(response){
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getPublicFilesByUserID: function(userID){
		return new Promise(function(resolve, reject){
			// DroneModel.findAll({
			// 	where: {
			// 		userID: userID
			// 	},
			// 	attributes: ['id', 'name', 'userID', 'description', 'thingID'],
			// 	include: [{
			// 		model: DroneFilesModel,
			// 		nested: true,
			// 		as: 'Files',
			// 		attributes: ['id', 'name', 'path', 'uploadDate'],
			// 		include: [{
			// 			model: PublicDroneFiles,
			// 			as: 'PublicFiles',
			// 			nested: true,
			// 			attributes: ['id', 'uploadDate'],
			// 		}]
			// 	}]
			// }).then(function(response){
			// 	resolve(JSON.stringify(response));
			// }, function(err){
			// 	console.log(err);
			// 	reject(err);
			// });
			PublicDroneFiles.findAll({
				attributes: ['id', 'uploadDate'],

				include: [{
					model: DroneFilesModel,
					nested: true,
					as: 'File',
					attributes: ['id', 'name', 'path', 'uploadDate'],
					include: [{
						model: DroneModel,
						nested: true,
						attributes: ['id', 'name', 'userID', 'description', 'thingID'],
						where: {
							userID: userID
						}
					}]
				}]
			}).then(function(response){
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getSharedFilesByUserID: function(userID){
		return new Promise(function(resolve, reject){
			SharedDroneFilesModel.findAll({
				attributes: ['id', 'uploadDate'],
				where: {
					sharedWith_userID: userID
				},
				include: [{
					model: DroneFilesModel,
					nested: true,
					as: 'File',
					attributes: ['id', 'name', 'path', 'uploadDate'],

					include: [{
						model: DroneModel,
						nested: true,
						attributes: ['id', 'name', 'userID', 'description', 'thingID'],
						include: [{
							nested: true,
							model: UserModel,
							attributes: ['id', 'firstName', 'lastName', 'email']
						}]
					}]
				}]
			}).then(function(response){
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getSharedFile: function(fileID){
		return new Promise(function(resolve, reject){
			DroneFilesModel.find({
				attributes: ['id', 'name', 'path', 'uploadDate', 'droneID'],
				where: {
					id: fileID
				},
				include: [{
					model: UserModel,
					nested: true,
					as: 'Users',
					attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
					through: {
						attributes: []
					}
				}]
			}).then(function(response){
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getPublicFile: function(fileID){
		return new Promise(function(resolve, reject){
			PublicDroneFiles.find({
				attributes: ['id', 'fileID', 'uploadDate'],
				where: {
					fileID: fileID
				}
			}).then(function(response){
				if(response == null){
					response ={};
				}
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});

		});
	},
	getExpiredFiles: function(date){
		return new Promise(function(resolve, reject){
			DroneFilesModel.findAll({
				attributes: ['id', 'name', 'path', 'droneID', 'uploadDate'],
				where: {
					uploadDate: {
						$lte: date
					}
				}
			}).then(function(response){
				if(response == null){
					response ={};
				}
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});

		});
	},
	deleteDroneFile: function(fileID){
		return new Promise(function(resolve, reject){
			DroneFilesModel.find({
				where: {
					id: fileID,
				},
				attributes: ['id', 'name', 'droneID']
			}).then(function(response){
				DroneFilesModel.destroy({
					where: {
						id: fileID,
					}
				}).then(function(data){
					resolve(JSON.stringify(response));
				}, function(err){
					console.log(err);
					reject(err);
				});
			}, function(err){
				console.log(err);
				reject(err);
			});
			
		});
	},
	deleteSharedFile: function(userID, fileID){
		return new Promise(function(resolve, reject){
			DroneFilesModel.find({
				attributes: ['id', 'name', 'path', 'uploadDate', 'droneID'],
				where: {
					id: fileID
				}
			}).then(function(response){
				response['removeUsers']([userID]).then(function(){
					resolve(JSON.stringify({}));
				}, function(err){
					console.log(err);
					reject(err);
				});
				
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	deletePublicFile: function(fileID){
		return new Promise(function(resolve, reject){
			PublicDroneFiles.destroy({
				attributes: ['id', 'fileID', 'uploadDate'],
				where: {
					fileID: fileID
				}
			}).then(function(){
				resolve(JSON.stringify({}));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	}
};

module.exports=files;