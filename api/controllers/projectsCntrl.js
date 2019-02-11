var bluebirdPromise=require('bluebird');
var _=require('lodash');

var droneController=require('../controllers/dronesCntrl');
var sensorController=require('../controllers/sensorsCntrl');


var DroneInventoryModel = require('../models/droneInventoryModel');
var SensorInventoryModel = require('../models/sensorInventoryModel');
var SharedProjectsModel = require('../models/sharedProjectsModel');

var ProjectComplianceFilesModel = require('../models/projectComplianceFilesModel');
var PersonnelRoleModel = require('../models/rolesModel');

var ProjectPersonnelRoleModel = require('../models/projectPersonnelRolesModel');

var MissionsModel = require('../models/missionsModel');
var MissionFilesModel = require('../models/missionFilesModel');

var UserModel = require('../models/usersModel');
var DroneModel = require('../models/dronesModel');
var SensorModel = require('../models/sensorsModel');
var PersonnelModel = require('../models/personnelModel');
var ProjectModel = require('../models/projectsModel');


var projects = {
	postProject: function(data) {
		return new Promise(function(resolve, reject){
			var whereClause;

			if(data.hasOwnProperty('projectID')){
				whereClause={
					id: data['projectID']
				};
			}else{
				whereClause={
					name: data.name,
					userID: data.userID,
				};
			}

			ProjectModel.findOrCreate({
				where: whereClause,
				attributes: ['id', 'name', 'description', 'userID'],
				defaults: {
					name: data.name,
					description: data.description,
					userID: data.userID
				},
				// include: [{
				// 	model: DroneModel,
				// 	include: [{
				// 		model: DroneInventoryModel
				// 	}]
				// }]
			}).then(function(rawData){
				var project = rawData[0], created=rawData[1];
				var projectObj = JSON.parse(JSON.stringify(rawData[0]));
				var promise=Promise.resolve();
				if(created == false){
					console.log('Already created....');
				}else{
					promise = project.setUsers([data.userID]);
				}
				promise.then(function(){
					bluebirdPromise.map(['Drones', 'Sensors', 'Personnels', 'ProjectPersonnelRoles','ShareProject'], function(curr){
						return new Promise(function(resolve, reject){
							if(data.hasOwnProperty(curr)){
								if(data[curr].length > 0){
									if(curr == 'ShareProject'){
										var emails = _.map(data['ShareProject'], function(curr){
											return {
												email: curr
											};
										});
										UserModel.findAll({
											attributes: ['id'],
											where: {
												$or: emails
											}
										}).then(function(res){
											var ids = JSON.parse(JSON.stringify(res));
											var shareProjectWithUsers = _.map(ids, function(curr){
												return {
													userID: curr.id,
													projectID: projectObj['id']
												};
												// return curr.id;
											});

											// project.setUsers(shareProjectWithUsers).then(function(){
											// 	resolve();
											// }, function(err){
											// 	reject(err);
											// });

											SharedProjectsModel.bulkCreate(shareProjectWithUsers).then(function(){
												return SharedProjectsModel.findAll();
											}).then(function(sharedProjects){
												resolve();
											}, function(err){
												console.log(err);
												reject(err);
											})
										}, function(err){
											reject(err);
										});
									}else if (curr == 'ProjectPersonnelRoles'){
										data[curr].forEach(function(elem, i){
											var roleID = elem;
											data[curr][i]={
												roleID: roleID,
												projectID: projectObj['id']
											};
										});
										ProjectPersonnelRoleModel.bulkCreate(data[curr]).then(function(){
											return ProjectPersonnelRoleModel.findAll();
										}).then(function(projectPersRoleData){
											resolve();
										}, function(err){
											reject(err);
										});									
									}else{
										project['set'+curr](data[curr]).then(function(){
											resolve();
										}, function(err){
											console.log(err);
											reject(err);
										});
									}
									
								}else{
									resolve();
								}
							}else{
								resolve()
							}						
						});
					}).then(function(){
						resolve(JSON.stringify(rawData[0]));
					}, function(err){
						console.log(err);
						reject(err);
					});
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
	postComplianceFiles: function(obj){
		return new Promise(function(resolve, reject){
			ProjectComplianceFilesModel.findOrCreate({
				attributes: ['id', 'projectID', 'name', 'path', 'uploadDate'],
				where: {
					projectID: obj['projectID'],
					name: obj['name']
				},
				defaults: {
					projectID: obj['projectID'],
					name: obj['name'],
					uploadDate: obj['uploadDate'],
					path: obj['path']
				}
			}).then(function(data){
				resolve();
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getProjectPersonnelRoles: function(projectID){
		return new Promise(function(resolve, reject){
			ProjectModel.find({
				attributes: ['userID', 'id', 'name', 'description'],
				where: {
					id: projectID
				},
				include: [{
					model: ProjectPersonnelRoleModel,
					nested: true,
					as: 'ProjectPersonnelRoles',
					attributes: ['id', 'roleID'],
					include: [{
						model: PersonnelRoleModel,
						nested: true,
						as: 'Roles',
						attributes: ['id', 'name'],
						include: [{
							model: PersonnelModel,
							nested: true,
							attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number', 'imagePath', 'userID']
						}]
					}]
				}]
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getProjectComplianceFile: function(fileID){
		return new Promise(function(resolve, reject){
			ProjectComplianceFilesModel.find({
				attributes: ['id', 'projectID', 'name', 'path', 'uploadDate'],
				where: {
					id: fileID
				}
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getDronesForProject: function(projectID){
		return new Promise(function(resolve, reject){
			ProjectModel.find({
				attributes: ['id', 'name', 'description', 'userID'],
				where: {
					id: projectID
				},
				include: [{
					nested: true,
					model: DroneModel,
					as: 'Drones',
					attributes: ['id', 'name', 'description', 'thingID'],
					through: {
						attributes: []
					},
					include: [{
						nested: true,
						model: DroneInventoryModel,
						attributes: ['id', 'description'],
						as: 'Inventory'
					}]
				}]
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getProjectInfo: function(projectID){
		return new Promise(function(resolve, reject){
			ProjectModel.find({
				attributes: ['id', 'name', 'description', 'userID'],
				where: {
					id: projectID
				},
				include: [{
					nested: true,
					model: DroneModel,
					as: 'Drones',
					attributes: ['id', 'name', 'description', 'thingID'],
					through: {
						attributes: []
					},
					include: [{
						nested: true,
						model: DroneInventoryModel,
						attributes: ['id', 'description'],
						as: 'Inventory'
					}]
				},{
					nested: true,
					model: SensorModel,
					as: 'Sensors',
					attributes: ['id', 'name', 'description'],
					through: {
						attributes: []
					},
					include: [{
						nested: true,
						model: SensorInventoryModel,
						attributes: ['id', 'inventory'],
						as: 'Inventory'
					}]
				},{
					nested: true,
					model: PersonnelModel, 
					as: 'Personnels',
					attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number'],
					through: {
						attributes: []
					}
				},{
					model: ProjectPersonnelRoleModel,
					nested: true,
					as: 'ProjectPersonnelRoles',
					attributes: ['id'],
					include: [{
						model: PersonnelRoleModel,
						nested: true,
						attributes: ['id', 'name', 'personnelID'],
						
					}]
				},{
					nested: true,
					model: ProjectComplianceFilesModel, 
					as: 'ComplianceFiles',
					attributes: ['id', 'name', 'path', 'uploadDate']
				},{
					nested: true,
					model: MissionsModel, 
					as: 'Missions',
					attributes: ['id', 'startTime', 'endTime', 'name', 'droneID', 'sensorID', 'description', 'location'],
					include: [{
						attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number', 'imagePath', 'userID'],
						nested: true,
						model: PersonnelModel,
						as: 'Personnels',
						through: {
							attributes: []
						}
					},{
						attributes: ['id', 'name', 'path', 'uploadDate'],
						nested: true,
						model: MissionFilesModel,
						as: 'Files'
					}]
				}]
			}).then(function(projects){
				var response = JSON.stringify(projects);
				resolve(response);
			});
			// db.query('select * from Projects where id='+projectID, {model: ProjectModel}).then(function(projects){
			// 	var response = JSON.stringify(projects);
			// 	console.log('helloooooo');
			// 	console.log(response);
			// 	resolve(response);
			// });
		});
	},
	getAllProjectsJoinDrones: function(userID){
		return new Promise(function(resolve, reject){
			ProjectModel.findAll({
				attributes: ['id', 'name', 'description', 'userID'],
				where: {
					userID: userID
				},
				include: [{
					nested: true,
					model: DroneModel,
					as: 'Drones',
					through: {
						attributes: []
					},
					include: [{
						nested: true,
						model: DroneInventoryModel,
						attributes: ['id', 'description'],
						as: 'Inventory'
					}]
				}]
			}).then(function(data){
				SharedProjectsModel.findAll({
					attributes: [],
					where: {
						userID: userID
					},
					include: [{
						nested: true,
						model: ProjectModel,
						attributes: ['id', 'name', 'description', 'userID'],
						include: [{
							nested: true,
							model: DroneModel,
							as: 'Drones',
							through: {
								attributes: []
							},
							include: [{
								nested: true,
								model: DroneInventoryModel,
								attributes: ['id', 'description'],
								as: 'Inventory'
							}]
						}]
					}]
				}).then(function(response){
					resolve(JSON.stringify([data, response]))
				}, function(err){
					reject(err);
				});
				
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	deleteProject: function(projectID){
		return new Promise(function(resolve, reject){
			ProjectModel.destroy({
				where: {
					id: projectID
				}
			}).then(function(){
				resolve();
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getExpandOnProjects: function(userID, params){
		return new Promise(function(resolve, reject){
			var includeOption=[];
			params.forEach(function(curr){
				if(curr == 'sensors'){
					includeOption.push({
						nested: true,
						model: SensorModel,
						as: 'Sensors',
						attributes: ['id', 'name', 'description'],
						through: {
							attributes: []
						}
					});
				}else if(curr == 'drones'){
					includeOption.push({
						nested: true,
						model: DroneModel,
						as: 'Drones',
						attributes: ['id', 'name', 'description', 'thingID'],
						through: {
							attributes: []
						},
					});
				}else if(curr=='personnels' || curr=='personnels/role'){
					// includeOption.push({
					// 	model: ProjectPersonnelRoleModel,
					// 	nested: true,
					// 	as: 'ProjectPersonnelRoles',
					// 	attributes: ['id'],
					// 	include: [{
					// 		model: PersonnelRoleModel,
					// 		nested: true,
					// 		as: 'Role',
					// 		attributes: ['id', 'name'],
					// 		include: [{
					// 			model: PersonnelModel,
					// 			nested: true,
					// 			attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number', 'imagePath', 'userID']
					// 		}]
					// 	}]
					// });
					if(curr=='personnels'){
						includeOption.push({
							nested: true,
							model: PersonnelModel, 
							as: 'Personnels',
							attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number'],
							through: {
								attributes: []
							}
						});
					}if(curr=='personnels/role'){
						includeOption.push({
							model: ProjectPersonnelRoleModel,
							nested: true,
							as: 'ProjectPersonnelRoles',
							attributes: ['id'],
							include: [{
								model: PersonnelRoleModel,
								nested: true,
								attributes: ['id', 'name', 'personnelID'],
								
							}]
						});
					}
					
				}else if(curr=='roles'){
					includeOption.push({
						model: ProjectPersonnelRoleModel,
						nested: true,
						as: 'ProjectPersonnelRoles',
						attributes: ['id'],
						include: [{
							model: PersonnelRoleModel,
							nested: true,
							attributes: ['id', 'name', 'personnelID'],
							
						}]
					});
				}else if(curr=='missions'){
					includeOption.push({
						nested: true,
						model: MissionsModel, 
						as: 'Missions',
						attributes: ['id', 'name', 'droneID', 'sensorID', 'startTime', 'endTime', 'description', 'location'],
						include: [{
							attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number', 'imagePath', 'userID'],
							nested: true,
							model: PersonnelModel,
							as: 'Personnels',
							through: {
								attributes: []
							}
						},{
							attributes: ['id', 'name', 'path', 'uploadDate'],
							nested: true,
							model: MissionFilesModel,
							as: 'Files'
						}]
					});
				}
			});
			var index = _.indexOf(params, 'shared');

			if(index != -1){
				UserModel.find({
					attributes: [],
					where: {
						id: userID
					},
					include: [{
						attributes: ['id', 'name', 'description', 'userID'],
						nested: true,
						model: ProjectModel,
						as: 'Projects',
						include: includeOption
					}]
				}).then(function(data){
					resolve(JSON.stringify(data['Projects']));
					
				},function(err){
					console.log(err);
					reject(err);
				});
			}else{
				ProjectModel.findAll({
					attributes: ['id', 'name', 'description', 'userID'],
					where: {
						userID: userID
					},
					include: includeOption
				}).then(function(data){
					resolve(JSON.stringify(data));
				},function(err){
					console.log(err);
					reject(err);
				});
			}
		});
	},
	getUserProjectsOnly: function(userID){
		return new Promise(function(resolve, reject){
			ProjectModel.findAll({
				attributes: ['id', 'name', 'description', 'userID'],
				where: {
					userID: userID
				},

			}).then(function(data){
				resolve(JSON.stringify(data));
			},function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getAllProjectsForUser: function(userID){
		return new Promise(function(resolve, reject){
			UserModel.find({
				attributes: [],
				where: {
					id: userID
				},
				include: [{
					nested: true,
					model: ProjectModel,
					as: 'SharedProjects',
					attributes: ['id', 'name', 'description', 'userID'],
					through: {
						attributes: []
					}
				},{
					nested: true,
					model: ProjectModel,
					as: 'Projects',
					attributes: ['id', 'name', 'description', 'userID'],
				}]
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
			// ProjectModel.findAll({
			// 	attributes: ['id', 'name', 'description', 'userID'],
			// 	where: {
			// 		userID: userID
			// 	},

			// }).then(function(data){
			// 	SharedProjectsModel.findAll({
			// 		attributes: [],
			// 		where: {
			// 			userID: userID
			// 		},
			// 		include: [{
			// 			nested: true,
			// 			model: ProjectModel,
			// 			attributes: ['id', 'name', 'description', 'userID'],
			// 		}]
			// 	}).then(function(response){
			// 		resolve(JSON.stringify([data, response]))
			// 	}, function(err){
			// 		reject(err);
			// 	});
			// }, function(err){
			// 	reject(err);
			// });
		});
	}
};

module.exports=projects;