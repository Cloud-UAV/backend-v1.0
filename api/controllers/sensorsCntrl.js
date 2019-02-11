var SensorInventoryModel = require('../models/sensorInventoryModel');
var SharedProjectsModel = require('../models/sharedProjectsModel');

var UserModel = require('../models/usersModel');
var SensorModel = require('../models/sensorsModel');
var ProjectModel = require('../models/projectsModel');

var sensors = {
	postSensor: function(data) {
		return new Promise(function(resolve, reject){
			var options={
				where: {
					name: data.name,
					userID: data.userID
				},
				defaults: {
					name: data.name,
					userID: data.userID,
					description: data.description
				},
				include: []
			};

			if(data.hasOwnProperty('Inventory')){
				options['defaults']['Inventory']={
					inventory: data['Inventory'].description,
				};
				options['include'].push({
					model: SensorInventoryModel,
					as: 'Inventory'
				});
			}
			
			SensorModel.findOrCreate(options).then(function(res){
				resolve(JSON.stringify(res));
			}, function(err){
				console.log(err);
				reject(err);
			});
			
		});
	},
	getSensorsByUserID: function(userID) {
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
						model: SensorModel,
						as: 'Sensors',
						attributes: ['id', 'name', 'description', 'userID'],
						through: {
							attributes: []
						},
						include: [{
							nested: true,
							model: SensorInventoryModel,
							attributes: ['id', 'inventory'],
							as: 'Inventory'
						}]
					}]
				}, {
						nested: true,
						model: SensorModel,
						as: 'Sensors',
						attributes: ['id', 'name', 'description', 'userID'],
						required: true,
						include: [{
							nested: true,
							model: SensorInventoryModel,
							attributes: ['id', 'inventory'],
							as: 'Inventory'
						}]
					}]
			})
			.then(function(response){
				resolve(JSON.stringify(response));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	deleteSensor: function(sensorID){
		return new Promise(function(resolve, reject){
			SensorModel.destroy({
				where: {
					id: sensorID
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

module.exports=sensors;