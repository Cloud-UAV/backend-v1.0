var _=require('lodash');

var ProjectPersonnelRoleModel = require('../models/projectPersonnelRolesModel');
var PersonnelRoleModel = require('../models/rolesModel');
var MissionFilesModel = require('../models/missionFilesModel');

var MissionsModel = require('../models/missionsModel');

var UserModel = require('../models/usersModel');
var DroneModel = require('../models/dronesModel');
var SensorModel = require('../models/sensorsModel');
var PersonnelModel = require('../models/personnelModel');
var ProjectModel = require('../models/projectsModel');

var missions={
	postMission: function(data) {
		return new Promise(function(resolve, reject){
			var defaultOptions={
				projectID: data['projectID'],
				name: data['name']
			};

			if(data.hasOwnProperty('sensorID')){
				defaultOptions['sensorID']=data['sensorID'];
			}if(data.hasOwnProperty('droneID')){
				defaultOptions['droneID']=data['droneID'];
			}if(data.hasOwnProperty('startTime')){
				defaultOptions['startTime']=data['startTime'];
			}if(data.hasOwnProperty('endTime')){
				defaultOptions['endTime']=data['endTime'];
			}if(data.hasOwnProperty('description')){
				defaultOptions['description']=data['description'];
			}if(data.hasOwnProperty('location')){
				defaultOptions['location']=data['location'];
			}
			MissionsModel.findOrCreate({
				attributes: ['id', 'name', 'projectID', 'droneID', 'sensorID', 'startTime', 'endTime', 'description', 'location'],
				where: {
					name: data['name'],
					projectID: data['projectID']
				},
				defaults: defaultOptions
			}).then(function(res){
				var mission = res[0], created=res[1];
				var missionData = JSON.parse(JSON.stringify(mission));

				if(data.hasOwnProperty('Personnels')){
					mission.setPersonnels(data['Personnels']).then(function(){
						resolve(JSON.stringify(mission));
					}, function(err){
						console.log(err);
						reject(err);
					})
				}else{
					resolve(JSON.stringify(mission));
				}
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	postFile: function(data){
		return new Promise(function(resolve, reject){
			console.log(data);
			MissionFilesModel.findOrCreate({
				attributes: ['id', 'missionID', 'name', 'path', 'uploadDate'],
				where: {
					name: data.name,
					missionID: data['missionID']
				},
				defaults: {
					name: data.name,
					missionID: data['missionID'],
					path: data.path,
					uploadDate: data['uploadDate']
				}
			}).then(function(file){
				var createdFile = file[0], created=file[1];
				resolve(JSON.stringify(createdFile));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	patchMission: function(data, missionID){
		return new Promise(function(resolve, reject){
			console.log(data);
			MissionsModel.update(data, {
				attributes: ['id', 'name', 'projectID', 'droneID', 'sensorID', 'startTime', 'endTime', 'description', 'location'],
				where: {
					id: missionID
				}
			}).then(function(res){
				resolve(JSON.stringify({}));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getFileByID: function(fileID){
		return new Promise(function(resolve, reject){
			MissionFilesModel.find({
				attributes: ['id', 'missionID', 'name', 'path', 'uploadDate'],
				where: {
					id: fileID,
				}
			}).then(function(file){
				resolve(JSON.stringify(file));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getMissionInfo: function(missionID, query) {
		return new Promise(function(resolve, reject){
			var includeOptions=[];

			query.forEach(function(curr){
				if(curr == 'files'){
					includeOptions.push({
						attributes: ['id', 'name', 'path', 'uploadDate'],
						nested: true,
						model: MissionFilesModel,
						as: 'Files'
					});
				}else if(curr == 'sensor' || curr == 'sensors'){
					includeOptions.push({
						attributes: ['id', 'name', 'description', 'userID'],
						nested: true,
						model: SensorModel,
						as: 'Sensor'
					});
				}else if(curr == 'drone' || curr == 'drones'){
					includeOptions.push({
						attributes: ['id', 'name', 'description', 'userID', 'thingID'],
						nested: true,
						model: DroneModel,
						as: 'Drone'
					});
				}else if(curr == 'personnel' || curr == 'personnels'){
					includeOptions.push({
						attributes: ['id', 'firstName', 'lastName', 'email', 'phone_number', 'imagePath', 'userID'],
						nested: true,
						model: PersonnelModel,
						as: 'Personnels',
						through: {
							attributes: []
						},
						include: [{
							nested: true,
							model: PersonnelRoleModel,
							as: 'Roles',
							attributes: ['id', 'personnelID', 'name']
						}]
					});
				}
			});

			MissionsModel.find({
				attributes: ['id', 'name', 'projectID', 'droneID', 'sensorID', 'startTime', 'endTime', 'description', 'location'],
				where: {
					id: missionID
				},
				include: includeOptions
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getProjectMissions: function(projectID) {
		return new Promise(function(resolve, reject){
			MissionsModel.findAll({
				attributes: ['id', 'name', 'projectID', 'droneID', 'sensorID', 'startTime', 'endTime', 'description' , 'location'],
				where: {
					projectID: projectID
				},
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
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	deleteMission: function(missionID) {
		return new Promise(function(resolve, reject){
			MissionsModel.destroy({
				where: {
					id: missionID
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

module.exports=missions;