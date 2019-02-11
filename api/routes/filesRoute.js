var express = require('express');
var moment = require('moment');
var filesCntrl=require('../controllers/filesCntrl');
var userCntrl=require('../controllers/userCntrl');

var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var config = require('../config');
var bluebirdPromise=require('bluebird');
var _=require('lodash');
var s3 = config.initAWSConfig();
var jimp = require('jimp');
var mysqldump = require('mysqldump');

// Scheduler that will run everyday at 11 pm UTC time (server time). It will check files (from db) that are 5 days old, to delete them. 
// It will delete files from the database and AWS s3 bucket. 
// This is to ensure users will save their files as we do not want to treat this application as AWS Storage. 
// It will also backup the mysql database to the same bucket.
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
rule.hour=23;
// rule.second = 1;
 
var deleteFiles = schedule.scheduleJob(rule, function(){
	var startDate = moment();
	var prevDate = startDate.subtract(5, 'days');

	filesCntrl.getExpiredFiles(prevDate.format('YYYY-MM-DD 23:60:60')).then(function(stringData){
		var data =JSON.parse(stringData);

		if(data.length > 0){
			var ids=data.map(function(curr){
				return curr.id;
			});
			
			var params={
				Bucket: config.AWSBucket,
				Delete: {
					Objects: []
				}
			};
			data.forEach(function(curr){
				params['Delete']['Objects'].push({
					Key: 'drones/'+curr['droneID']+'/'+curr.name
				});
				params['Delete']['Objects'].push({
					Key: 'drones/'+curr['droneID']+'/thumbnail-'+curr.name
				});
			});


			s3.deleteObjects(params, function(err, files){
				if(err){
					console.log(err);
				}else{
					filesCntrl.deleteDroneFile(ids).then(function(data){
						console.log('--------------- Old files have been deleted! ---------------')
						console.log(data);
					}, function(err){
						console.log(err);
					});
				}
			});
		}
		
	}, function(err){
		console.log(err);
	});

	mysqldump({
		host: config.mysqlAuth.host,
		user: config.mysqlAuth.username,
		password: config.mysqlAuth.password,
		database: config.mysqlAuth.database,
		port: config.mysqlAuth.port,
		getDump: true,
		// dest: './clouduav.sql'
	}, function(err, mysqlDumpData){
		if(err){
			console.log(err);
		}else{
			s3.putObject({
				Bucket: config.AWSBucket,
				Key: 'mysqldump/clouduav.sql',
				Body: mysqlDumpData
			}, function(err, fileData) {
				if (err){
					console.log(err, err.stack);
					reject(err);
				} else{
					console.log('mysql dump file uploaded to AWS s3!');
				}
			});
		}
	});

});

router.post('/files', function(req, res){
	var droneID = req.query['droneID'];
	var filePath='drones/'+droneID;
	res.setHeader('Content-Type','application/json');

	
	bluebirdPromise.map(Object.keys(req.files), function(curr){
		return new Promise(function(resolve, reject){
			var file = req.files[curr];

			s3.putObject({
				Bucket: config.AWSBucket,
				Key: filePath+'/'+file.name,
				Body: file.data
			}, function(err, fileData) {
				if (err){
					console.log(err, err.stack);
					reject(err);
				} else{
					var obj={
						name: file.name,
						path: filePath+'/'+file.name,
						droneID: droneID,
						uploadDate: moment.utc().format('YYYY-MM-DD HH:mm:ss')
					};

					filesCntrl.postFile(obj).then(function(){
						var extension = file.name.split('.')[1].trim().toLowerCase();

						//since UAV images are huge in size, we want to create thumbnails and store it on AWS s3.
						//this way we can show the thumbnails in our UI without having to download the image, which could make the user wait for many minutes. 
						if(extension =='jpeg' || extension =='png' || extension =='jpg' || extension =='gif'){
							jimp.read(file.data, function(err, img){
								if(err){
									console.log(err);
									reject(err);
								}else{
									img.resize(320, 250).getBuffer(jimp.MIME_JPEG, function(err, buffer){
										if(err){
											console.log(err);
											reject(err);
										}else{
											s3.putObject({
												Bucket: config.AWSBucket,
												Key: filePath+'/thumbnail-'+file.name,
												Body: buffer
											}, function(err, fileData) {
												if (err){
													console.log(err, err.stack);
													reject(err);
												} else{
													resolve();
												}
											});
										}
									});
								}
								
							});
							
							
						}else{
							resolve();
						}
					}, function(err){
						reject(err);
					});
				}
			});
		});
	}).then(function(){
		res.status(201);
		res.send(JSON.stringify({})).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not add file",
			genErr: err
		})).end();
	});
});

router.get('/:droneID/files', function(req, res){
	var droneID=req.params['droneID'];
	res.setHeader('Content-Type','application/json');
	var filter=undefined;

	if(Object.keys(req.query).length > 0){
		filter =req.query['filter'];
	}
	filesCntrl.getAllDroneFiles(droneID, filter).then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not get file",
			genErr: err
		})).end();
	});
	
});

//res.setHeader('Content-Disposition', 'attachment; filename='+filename);
// res.sendFile(path.resolve('./uploads/drones/'+droneID+'/thumbnails/'+tokens[0]+'-150.'+tokens[1]));

router.delete('/files/:fileID', function(req, res){
	var fileID = req.params['fileID'];
	res.setHeader('Content-Type','application/json');

	filesCntrl.deleteDroneFile(fileID).then(function(data){
		var response = JSON.parse(data);
		var filename = response['name'];
		var filePath='drones/'+response['droneID']+'/'+filename;
		var thumbnailPath='drones/'+response['droneID']+'/thumbnail-'+filename;

		s3.deleteObjects({
			Bucket: config.AWSBucket,
			Delete: {
				Objects: [{
					Key: filePath
				},{
					Key: thumbnailPath
				}]
			}
		}, function(err, files){
			if(err){
				console.log(err);
				res.status(400);
				res.send(JSON.stringify({
					error: 'Could not delete file!',
					genErr: err
				})).end();
			}else{
				res.status(200);
				res.send(JSON.stringify({})).end();
			}
		});
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not get file",
			genErr: err
		})).end();
	});
	
});

router.post('/files/share', function(req, res){
	res.setHeader('Content-Type','application/json');
	var obj = req.body;
	obj['uploadDate']=moment.utc().format('YYYY-MM-DD HH:mm:ss');

	userCntrl.getUserByEmail(obj['email']).then(function(data){
		var response = JSON.parse(data);

		if(Object.keys(response).length > 0){
			obj['shareWithUserID']=response['id'];

			filesCntrl.postSharedFile(obj).then(function(data){
				res.status(201);
				res.send(data).end();
			}, function(err){
				res.status(400);
				res.send(JSON.stringify({
					error: "Could not share file with user",
					genErr: err
				})).end();
			});
		}else{
			res.status(400);
			res.send(JSON.stringify({
				error: "Cannot share file with user, because user does not exist. Please check email!",
				genErr: err
			})).end();
		}
		
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Cannot share file with user, because user does not exist. Please check email!",
			genErr: err
		})).end();
	});
	
});

router.post('/files/public', function(req, res){
	res.setHeader('Content-Type','application/json');
	console.log('dkfjsldkfjskdjf');
	var obj = req.body;
	obj['uploadDate']=moment.utc().format('YYYY-MM-DD HH:mm:ss');

	filesCntrl.postPublicFile(obj).then(function(data){
		res.status(201);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not make file public",
			genErr: err
		})).end();
	});
});

router.get('/:userID/files/share', function(req, res){
	var userID = req.params['userID'];
	res.setHeader('Content-Type','application/json');

	filesCntrl.getSharedFilesByUserID(userID).then(function(data){

		var filesData = JSON.parse(data);
		// var filteredFilesData = _.remove(filesData, function(curr){
		// 	console.log(curr);
		// 	console.log(curr['Users'].length);
		// 	return curr['Users'].length != 0;
		// });
		// // console.log(filesData);
		// console.log(filteredFilesData);
		res.status(200);
		res.send(JSON.stringify(filesData)).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not get all shared files for user",
			genErr: err
		})).end();
	});
});

router.get('/files/public', function(req, res){
	res.setHeader('Content-Type','application/json');

	filesCntrl.getAllPublicFiles().then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not get all shared files for user",
			genErr: err
		})).end();
	});
})

router.get('/:userID/files/public', function(req, res){
	var userID = req.params['userID'];
	res.setHeader('Content-Type','application/json');

	filesCntrl.getPublicFilesByUserID(userID).then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not get all shared files for user",
			genErr: err
		})).end();
	});
});

router.get('/files/share/:fileID', function(req, res){
	var fileID = req.params['fileID'];
	res.setHeader('Content-Type','application/json');

	filesCntrl.getSharedFile(fileID).then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not get shared file",
			genErr: err
		})).end();
	});
});

router.get('/files/public/:fileID', function(req, res){
	var fileID = req.params['fileID'];
	res.setHeader('Content-Type','application/json');

	filesCntrl.getPublicFile(fileID).then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not get public file",
			genErr: err
		})).end();
	});
});

router.delete('/files/share/:fileID', function(req, res){
	var fileID = req.params['fileID'];
	var userID = req.query['userID'];

	filesCntrl.deleteSharedFile(userID, fileID).then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not delete file from shared folder.",
			genErr: err
		})).end();
	});
});

router.delete('/files/public/:fileID', function(req, res){
	var fileID = req.params['fileID'];
	
	filesCntrl.deletePublicFile(fileID).then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: "Could not delete file from public folder.",
			genErr: err
		})).end();
	});
});

module.exports = router;