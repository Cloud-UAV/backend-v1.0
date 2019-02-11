var DroneInventoryModel = require('../models/droneInventoryModel');
var SharedProjectsModel = require('../models/sharedProjectsModel');

var UserModel = require('../models/usersModel');
var DroneModel = require('../models/dronesModel');
var ProjectModel = require('../models/projectsModel');

var drones = {
	postDroneArr: function(data){
		return new Promise(function(resolve, reject){
			console.log(data);
			DroneModel.bulkCreate(data, {include: [DroneInventoryModel]}).then(function(){
				var searchObj=[];
				data.forEach(function(curr){
					searchObj.push({
						name: curr.name,
						description: curr.description,
						thingID: curr.thingID
					});
				});
				return DroneModel.findAll({
					where: {
						$or: searchObj
					}
				});
			}).then(function(drones){
				var dronesArr= JSON.parse(JSON.stringify(drones));
				var inventoryArr=[];
				
				data.forEach(function(curr, i){
					if(curr.hasOwnProperty('DroneInventory')){
						inventoryArr.push({
							description: curr.DroneInventory.description,
							droneID: dronesArr[i]['id']
						});
					}
				});

				if(inventoryArr.length > 0){
					DroneInventoryModel.bulkCreate(inventoryArr).then(function(){
						return DroneInventoryModel.findAll();
					}).then(function(inventory){
						resolve(JSON.stringify(drones));
					}, function(err){
						console.log('bulk inventory error!');
						reject(err);
					});
				}else{
					resolve(JSON.stringify(drones));
				}
				
			}, function(err){
				console.log(err);
				reject(err);
			});

		});
	},
	postDrone: function(data) {
		return new Promise(function(resolve, reject){
			console.log(data);
			DroneModel.findOrCreate({
				where: {
					name: data.name,
					userID: data.userID,
					thingID: data.thingID
				},
				attributes: ['id', 'name', 'description', 'thingID', 'userID'],
				defaults: {
					userID: data.userID,
					name: data.name,
					description: data.description,
					thingID: data.thingID,
					Inventory: {
						description: data['Inventory'].description
					}
				},
				include: [{
					model: DroneInventoryModel,
					as: 'Inventory'
				}]
			}).then(function(drone){
				var response = JSON.parse(JSON.stringify(drone[0]));

				// DroneInventoryModel.findOrCreate({
				// 	where: {
				// 		description: data.inventory,
				// 		droneID: response.id
				// 	},
				// 	defaults: {
				// 		description: data.inventory,
				// 		droneID: response.id
				// 	}
				// }).then(function(elem){
					resolve(JSON.stringify(response));
				// }, function(err){
				// 	console.log(err);
				// 	reject(err);
				// });
				
			}, function(err){
				console.log(err);
				reject(err);
			});
			
		});
	},
	getProjectDrones: function(projectID){
		return new Promise(function(resolve, reject){
			var whereObj={
				id: projectID
			};
			// if(projectID instanceof Array){
			// 	whereObj={
			// 		$or: []
			// 	};
			// 	projectID.forEach(function(curr){
			// 		whereObj['$or'].push({
			// 			id: curr
			// 		});
			// 	});
			// }

			DroneModel.findAll({
				attributes: ['id', 'name', 'userID', 'description', 'thingID'],
				include: [{
					nested: true,
					model: ProjectModel,
					attributes: [],
					where: whereObj,
					through: {
						attributes: []
					}
				}]
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	deleteDrone: function(droneID){
		return new Promise(function(resolve, reject){
			DroneModel.destroy({
				where: {
					id: droneID
				}
			}).then(function(){
				resolve();
			}, function(err){
				console.log(err);
				reject(err);
			});
		});
	},
	getAllDronesForUser: function(userID){
		return new Promise(function(resolve, reject){
			DroneModel.findAll({
				where: {
					userID: userID
				},
				attributes: ['id', 'name', 'description', 'thingID', 'userID'],
				include: [{
					nested: true,
					model: DroneInventoryModel,
					attributes: ['id', 'description'],
					as: 'Inventory'
				}]
			}).then(function(data){
				resolve(JSON.stringify(data));
			}, function(err){
				console.log(err);
				reject(err);
			});
			
		});
	}
};

module.exports=drones;