var express = require('express');
var moment = require('moment');
var missionController=require('../controllers/missionsCntrl');

var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var http = require('http');
var bluebirdPromise=require('bluebird');
var _=require('lodash');
var config = require('../config');

var s3 = config.initAWSConfig();

router.post('/missions', function(req, res){
	var data = req.body;
	res.setHeader('Content-Type','application/json');

	missionController.postMission(data).then(function(response){
		res.status(201);
		res.send(response).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not create mission!',
			'genErr': err
		})).end();
	});
});

router.post('/missions/:missionID/files', function(req, res){
	var missionID=req.params['missionID'];
	var data = req.body;

	var filePath='missions/'+missionID+'/';
	res.setHeader('Content-Type','application/json');

	if(data != null && data != undefined){
		var keysArr=[], dataNameFlag=false;
		if(data.hasOwnProperty('name')){
			keysArr.push(data.name);
			dataNameFlag=true;
		}else{
			keysArr= Object.keys(data['data']);
		}
		var responseInfo=[];
		bluebirdPromise.map(keysArr, function(curr){
			return new Promise(function(resolve, reject){
				var fileData, name=curr;
					
				if(dataNameFlag){
					if(data['extension'] == 'json'){
						fileData=JSON.stringify(data['data']);
					}else{
						fileData=data['data'];
					}
				}else{
					if(data['extension'] == 'json'){
						fileData=JSON.stringify(data['data'][curr]);
					}else{
						fileData=data['data'][curr];
					}
					name = curr+'.'+data['extension'];
				}

				s3.putObject({
					Bucket: config.AWSBucket,
					Key: filePath+name,
					ContentType: 'application/json',
					Body: fileData
				}, function(err, s3File) {
					if(err){
						reject(err);
					}else{
						var obj={
							name: name,
							path: filePath+name,
							missionID: missionID,
							uploadDate: moment.utc().format('YYYY-MM-DD HH:mm:ss')
						};

						 missionController.postFile(obj).then(function(response){
						 	responseInfo.push(JSON.parse(response));
							resolve();
						}, function(err){
							reject(err);
						});
					}
				});
			});
		}).then(function(){
			res.status(201);
			res.send(JSON.stringify(responseInfo)).end();
			
		}, function(err){
			res.status(400);
			res.send(JSON.stringify({
				error: 'Could not upload file to mission!',
				'genErr': err
			})).end();
		});
	}else{
		res.status(400);
		res.send(JSON.stringify({
			error: 'No data sent with request in order to create a file. Please try again!',
		})).end();
	}
});


router.patch('/missions/:missionID', function(req, res){
	var missionID = req.params['missionID'];
	var data = req.body;
	res.setHeader('Content-Type','application/json');

	missionController.patchMission(data, missionID).then(function(patch){
		res.status(200);
		res.send(patch).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not find thumbnail!'
		})).end();
	});
});

router.get('/:projectID/missions', function(req, res){
	var projectID = req.params['projectID'];
	res.setHeader('Content-Type','application/json');

	missionController.getProjectMissions(projectID).then(function(response){
		res.status(200);
		res.send(response).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get missions for project id specified!',
			'genErr': err
		})).end();
	});
});

router.get('/missions/:missionID', function(req, res){
	var missionID = req.params['missionID'];
	var query = req.query['$expand'];
	var queryFiltered=[];

	if(query != undefined){
		var tokens = query.split(',');
		queryFiltered = _.map(tokens, function(curr){
			return curr.toLowerCase().trim();
		});
	}
	
	res.setHeader('Content-Type','application/json');

	missionController.getMissionInfo(missionID, queryFiltered).then(function(response){
		res.status(200);
		res.send(response).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get mission info!',
			'genErr': err
		})).end();
	});
});

router.delete('/missions/:missionID', function(req, res){
	var missionID = req.params['missionID'];
	res.setHeader('Content-Type','application/json');

	missionController.deleteMission(missionID).then(function(response){
		s3.listObjects({
			Bucket: config.AWSBucket,
			Prefix: 'missions/'+missionID+"/"
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
			error: 'Could not delete mission!',
			'genErr': err
		})).end();
	});
});

module.exports=router;