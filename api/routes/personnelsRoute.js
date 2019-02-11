var express = require('express');
var moment = require('moment');
var personnelController=require('../controllers/personnelCntrl');
var rolesController=require('../controllers/rolesCntrl');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var rimraf=require('rimraf');
var path = require('path');
var http = require('http');
var bluebirdPromise=require('bluebird');
var config = require('../config');
var _=require('lodash');
var s3 = config.initAWSConfig();

router.post('/personnel', function(req, res){
	var reqBody = req.body;
	var roles = JSON.parse(reqBody['roles']);
	console.log(roles);
	var files, fileKeys;

	if(req.files != undefined){
		files = req.files;
		fileKeys = Object.keys(req.files);
	}
	
	res.setHeader('Content-Type','application/json');

	personnelController.postPersonnel(reqBody).then(function(response){
		if(response != undefined){
			var data = JSON.parse(response);
			//add the personnel roles to the table.
			bluebirdPromise.map(roles, function(curr){
				var obj={
					name: curr,
					personnelID: data['id']
				};

				return bluebirdPromise.resolve(rolesController.postRole(obj));
			},{
				concurrency: 18
			}).then(function(){
				//add files to personnelFiles table
				if(fileKeys != undefined){
					bluebirdPromise.map(fileKeys, function(curr){
						return new Promise(function(resolve, reject){
							var params = {
								Bucket: config.AWSBucket,
								Key: "personnel/"+data.id+'/'+files[curr].name,
								Body: files[curr].data
							};
							s3.putObject(params, function(err, fileData) {
								if (err){
									console.log(err, err.stack); // an error occurred
									reject(err);
								} else{
									if(curr == 'personnelImage'){
										data['imagePath'] = 'personnel/'+data.id+'/'+files[curr].name;
										personnelController.updatePersonnelImage(data).then(function(){
											resolve();
										}, function(err){
											reject(err)
										});
									}else{
										var dataObj={
											personnelID: data['id'],
											name: files[curr].name,
											path: 'personnel/'+data['id']+'/'+files[curr].name,
											uploadDate: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
										};

										personnelController.postPersonnelFiles(dataObj).then(function(){
											resolve();
										}, function(err){
											reject(err);
										});
									}
								}
							});
						});
					}).then(function(){
						res.status(201);
						res.send(JSON.stringify(data)).end();
					}, function(err){
						res.status(400);
						res.send(JSON.stringify({
							error: 'Could not add role!',
							'genErr': err
						})).end();
					});
				}else{
					res.status(201);
					res.send(response).end();
				}
			}, function(err){
				console.log(err);
				res.status(400);
				res.send(JSON.stringify({
					error: 'Could not add role!',
					'genErr': err
				})).end();
			});
		}
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not create personnel!',
			'genErr': err
		})).end();
	});
});

router.delete('/personnel/:personnelID', function(req, res){
	var personnelID = req.params['personnelID'];
	res.setHeader('Content-Type','application/json');

	personnelController.deletePersonnel(personnelID).then(function(){
		s3.listObjects({
			Bucket: config.AWSBucket,
			Prefix: 'personnel/'+personnelID+"/"
		}, function(err, fileData) {
			if(err){
				console.log(err);
				res.status(400);
				res.send(JSON.stringify({
					error: 'Could not delete file!',
					genErr: err
				})).end();
			}else{
				var params = {
					Bucket: config.AWSBucket,
					Delete: {
						Objects: []
					}
				};
				fileData.Contents.forEach(function(content) {
					params.Delete.Objects.push({Key: content.Key});
				});

				s3.deleteObjects(params, function(err, files){
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
			}
		});
		
		// if(fs.existsSync('./uploads/personnel/'+personnelID+'/')){
		// 	rimraf('./uploads/personnel/'+personnelID+'/', function(err){
		// 		if(err){
		// 			res.status(400);
		// 			res.send(JSON.stringify({
		// 				error: 'Could not delete file!',
		// 				genErr: err
		// 			})).end();
		// 		}else{
		// 			res.status(200);
		// 			res.send(JSON.stringify({})).end();
		// 		}
		// 	});
		// }else{
		// 	res.status(200);
		// 	res.send(JSON.stringify({})).end();
		// }
		
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get drones!',
			genErr: err
		})).end();
	})	
});

router.get('/personnel/:personnelID', function(req, res){
	var personnelID = req.params['personnelID'];

	personnelController.getAllPersonnelInfo(personnelID).then(function(data){
		res.status(200);
		res.send(data).end();
	},function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get personnel!',
			genErr: err
		})).end();
	});
});

router.get('/personnel/:personnelID/:filename', function(req, res){
	var personnelID = req.params['personnelID'];
	var filename = req.params['filename'];

	var stream = s3.getObject({
		Bucket: config.AWSBucket,
		Key: 'personnel/'+personnelID+'/'+filename
	}).createReadStream();
	stream.pipe(res);
	// res.sendFile(path.resolve('./uploads/personnel/'+ personnelID+'/'+filename));
});

router.get('/personnel/:personnelID/files', function(req, res){
	var personnelID = req.params['personnelID'];
	res.setHeader('Content-Type','application/json');

	personnelController.getPersonnelFiles(personnelID).then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get personnel for the requested project!',
			genErr: err
		})).end();
	});
});

// router.get('/projects/:projectID/personnel', function(req, res){
// 	var projectID = req.params['projectID'];
// 	res.setHeader('Content-Type','application/json');

// 	personnelController.getProjectPersonnel(projectID).then(function(data){
// 		res.status(200);
// 		res.send(JSON.stringify(data)).end();
// 	}, function(err){
// 		res.status(400);
// 		res.send(JSON.stringify({
// 			error: 'Could not get personnel for the requested project!',
// 			genErr: err
// 		})).end();
// 	});
// });

router.get('/:userID/personnel', function(req, res){
	res.setHeader('Content-Type','application/json');
	var userID = req.params['userID'];

	personnelController.getPersonnelByUserID(userID).then(function(data){
		var response = JSON.parse(data);
		var personnels = _.uniqBy(_.concat(_.concat.apply([], _.map(response['Projects'], function(curr){
			return curr['Personnels'];
		})), response['Personnels']), 'id');

		res.status(200);
		res.send(JSON.stringify(personnels)).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get personnel!',
			genErr: err
		})).end();
	});
});


module.exports = router;