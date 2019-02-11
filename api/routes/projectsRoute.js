var express = require('express');
var moment = require('moment');
var projectController=require('../controllers/projectsCntrl');
var droneController=require('../controllers/dronesCntrl');
var personnelController=require('../controllers/personnelCntrl');
var sensorController=require('../controllers/sensorsCntrl');

var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var http = require('http');
var bluebirdPromise=require('bluebird');
var _=require('lodash');

var config = require('../config');
var s3 = config.initAWSConfig();

router.post('/projects', function(req, res){
	var data = JSON.parse(req.body['ProjectData']);
	res.setHeader('Content-Type','application/json');
	
	projectController.postProject(data).then(function(response){
		var project = JSON.parse(response);

		if(req.files != null){
			var filePath='projects/'+project['id']+'/';
			
			bluebirdPromise.map(Object.keys(req.files), function(curr){
				return new Promise(function(resolve, reject){
					var file = req.files[curr];

					s3.putObject({
						Bucket: config.AWSBucket,
						Key: filePath+file.name,
						Body: file.data
					}, function(err, fileData) {
						if (err){
							console.log(err, err.stack); // an error occurred
							reject(err);
						} else{
							projectController.postComplianceFiles({
								projectID: project['id'],
								name: file.name,
								path: filePath+ '/'+file.name,
								uploadDate: moment.utc().format('YYYY-MM-DD HH:mm:ss')
							}).then(function(){
								resolve();
							}, function(err){
								reject(err);
							});
						}
					});
				});
			}).then(function(){
				res.status(201);
				res.send(response).end();
			}, function(err){
				res.status(400);
				res.send(JSON.stringify({
					error: 'Error: Can\'t upload compliance file!',
					'genErr': {}
				})).end();
			});
		}else{
			res.status(201);
			res.send(response).end();
		}
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not add sensors or peronnel to project! Already added to this project!',
			'genErr': err
		})).end();
	});
});

//delete a project
router.delete('/projects/:projectID', function(req, res){
	var projectID = req.params['projectID'];
	res.setHeader('Content-Type','application/json');

	projectController.deleteProject(projectID).then(function(){
		s3.listObjects({
			Bucket: config.AWSBucket,
			Prefix: 'projects/'+projectID+"/"
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
		
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get drones!',
			genErr: err
		})).end();
	})	
});

router.get('/projects/compliance/files/:complianceID', function(req, res){
	var complianceID=req.params['complianceID'];

	projectController.getProjectComplianceFile(complianceID).then(function(data){
		var file = JSON.parse(data);

		res.setHeader('Content-Disposition', 'attachment; filename='+file.name);
		res.sendFile(path.resolve('./uploads/projects/'+file.projectID+'/'+file.name));
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get compliance files for project!',
			genErr: err
		})).end();
	})
});

//get project info
router.get('/projects/:projectID', function(req, res){
	var projectID = req.params['projectID'];
	res.setHeader('Content-Type','application/json');
	
	projectController.getProjectInfo(projectID).then(function(jsonData){
		var data = JSON.parse(jsonData);
		var projectRoles={};
		data['ProjectPersonnelRoles'].forEach(function(curr){
			var role=curr['Role'];

			projectRoles[role.personnelID]={
				id: role.id,
				name: role.name
			};
		});
		data['Personnels'].forEach(function(curr){
			curr['Role']={
				id: projectRoles[curr['id']].id,
				name: projectRoles[curr['id']].name,
			}
		});
		delete data['ProjectPersonnelRoles'];

		res.status(200);
		res.send(JSON.stringify(data)).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get drones!',
			genErr: err
		})).end();
	});
});

//get all projects associated to a user.
router.get('/:userID/projects', function(req, res){
	var userID = req.params['userID'];
	res.setHeader('Content-Type','application/json');

	if(req.query.hasOwnProperty('$expand')){
		var tokens = req.query['$expand'].split(',');
		var results={};
		var filterTokens=_.map(_.remove(tokens, function(value){
			if(value.indexOf(',') > -1){
				return false;
			}
			return true;
		}), function(curr){
			return curr.toLowerCase();
		});

		projectController.getExpandOnProjects(userID, filterTokens).then(function(jsonData){
			var personnelRolesFlag=false;
			filterTokens.some(function(curr){
				if(curr == 'personnels/role'){
					personnelRolesFlag=true;
					return true;
				}
			});
			if(personnelRolesFlag){
				var data = JSON.parse(jsonData);
				var projectRoles={};
				console.log(data);
				data['ProjectPersonnelRoles'].forEach(function(curr){
					var role=curr['Role'];

					projectRoles[role.personnelID]={
						id: role.id,
						name: role.name
					};
				});
				data['Personnels'].forEach(function(curr){
					curr['Role']={
						id: projectRoles[curr['id']].id,
						name: projectRoles[curr['id']].name,
					}
				});
				delete data['ProjectPersonnelRoles'];
				res.status(200);
				res.send(JSON.stringify(data)).end();
			}else{
				res.status(200);
				res.send(jsonData).end();
			}
			
		}, function(err){
			res.status(400);
			res.send(JSON.stringify({
				error: 'Could not get project for the userID specified!',
				genErr: err
			})).end();
		});
	}else{
		projectController.getUserProjectsOnly(userID).then(function(data){
			res.status(200);
			res.send(data).end();
		}, function(err){
			res.status(400);
			res.send(JSON.stringify({
				error: 'Could not get data!',
				genErr: err
			})).end();
		});
	}
});

router.get('/projects/:projectID/drones', function(req, res){
	var projectID = req.params['projectID'];
	res.setHeader('Content-Type','application/json');

	droneController.getProjectDrones(projectID).then(function(data){
		res.status(200);
		res.send(data).end();
	},function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get drones!',
			genErr: err
		})).end();
	});
});

router.get('/projects/:projectID/personnel/roles/', function(req, res){
	var projectID = req.params['projectID'];
	res.setHeader('Content-Type','application/json');

	projectController.getProjectPersonnelRoles(projectID).then(function(data){
		res.status(200);
		res.send(JSON.stringify(data)).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get drones!',
			genErr: err
		})).end();
	});
});

router.get('/admin/projects', function(req, res){
	res.setHeader('Content-Type','application/json');

	if(req.query.hasOwnProperty('$expand')){
		if(req.query['$expand'] =='drones'){
			projectController.getAllProjectsJoinDrones('admin').then(function(data){
				res.status(200);
				res.send(JSON.stringify(data)).end();
			}, function(err){
				res.status(400);
				res.send(JSON.stringify({
					error: 'Could not get drones!',
					genErr: err
				})).end();
			});

		}
	}else{
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get drones!',
		})).end();
	}
});


module.exports = router;