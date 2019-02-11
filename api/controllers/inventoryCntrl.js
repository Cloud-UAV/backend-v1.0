var db = require('../../dbConnection');

var inventory = {
	postInventory: function(data) {
		return new Promise(function(resolve, reject){
			db.getConnection(function(err, connection){
				if(err){
					connection.release();
					console.log("Error getting mysql_pool connection: "+err);
					reject(err);
				}
				
				connection.query('',[],function(err, rows, fields){
					connection.release();
					if(err){
						reject(err);
					}else{
						resolve(JSON.stringify(rows[1][0]));
					}
				});
			});
		});
	},
	getDroneInventoryForUser: function() {
		return new Promise(function(resolve, reject){
			db.getConnection(function(err, connection){
				if(err){
					connection.release();
					console.log("Error getting mysql_pool connection: "+err);
					reject(err);
				}
				
				connection.query('select Drones.name as droneName, Drones.description as droneDescription, DroneInventory.* from Drones inner join DroneInventory on Drones.id=DroneInventory.droneID;', function(err, rows, fields){
					connection.release();
					if(err){
						reject(err);
					}else{
						resolve(JSON.stringify(rows));
					}
				});
			});
		});
	},
	deleteInventory: function(inventoryID){
		return new Promise(function(resolve, reject){
			db.getConnection(function(err, connection){
				if(err){
					connection.release();
					console.log("Error getting mysql_pool connection: "+err);
					reject(err);
				}
				
				connection.query('delete from DroneInventory where id=?',[inventoryID],function(err, rows, fields){
					connection.release();

					if(err){
						reject(err);
					}else{
						resolve();
					}
				});
			});
		});
	}
};

module.exports=inventory;