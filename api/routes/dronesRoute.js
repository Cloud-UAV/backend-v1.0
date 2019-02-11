var express = require('express');
var moment = require('moment');
var droneController=require('../controllers/dronesCntrl');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var path = require('path');
var http = require('http');
var config = require('../config');

router.post('/drones', function(req, res){
	var data = req.body;
	res.setHeader('Content-Type','application/json');
	console.log(data);
	droneController.postDrone(data).then(function(data){
		res.status(201);
		res.send(JSON.stringify({
		})).end();
	}, function(data){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could create drone!'
		})).end();
	});
});

router.delete('/drones/:droneID', function(req, res){
	var droneID = req.params['droneID'];
	res.setHeader('Content-Type','application/json');

	droneController.deleteDrone(droneID).then(function(){
		res.status(200);
		res.send(JSON.stringify({})).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get drones!',
			genErr: err
		})).end();
	})	
});

router.get('/:userID/drones', function(req, res){
	var userID = req.params['userID'];
	res.setHeader('Content-Type','application/json');

	droneController.getAllDronesForUser(userID).then(function(data){
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get drones!',
			genErr: err
		})).end();
	});
});

module.exports = router;