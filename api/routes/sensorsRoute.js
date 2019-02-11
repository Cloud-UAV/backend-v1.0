var express = require('express');
var moment = require('moment');
var sensorController=require('../controllers/sensorsCntrl');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var rimraf=require('rimraf');
var path = require('path');
var http = require('http');
var config = require('../config');
var _=require('lodash');

router.post('/sensors', function(req, res){
	res.setHeader('Content-Type','application/json');
	var data = req.body;

	sensorController.postSensor(data).then(function () {
		res.status(201);
		res.send(JSON.stringify({})).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not create sensor!',
			genErr: err
		})).end();
	});
});

router.delete('/sensors/:sensorID', function(req, res){
	res.setHeader('Content-Type','application/json');
	var sensorID = req.params['sensorID'];

	sensorController.deleteSensor(sensorID).then(function () {
		res.status(200);
		res.send(JSON.stringify({})).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not delete sensor!',
			genErr: err
		})).end();
	});
});

router.get('/:userID/sensors', function(req, res){
	res.setHeader('Content-Type','application/json');
	var userID=req.params['userID'];

	sensorController.getSensorsByUserID(userID).then(function (data) {
		var response = JSON.parse(data);
		var sensors = _.uniqBy(_.concat(_.concat.apply([], _.map(response['Projects'], function(curr){
			return curr.Sensors;
		})), response['Sensors']), 'id');
	
		res.status(200);
		res.send(JSON.stringify(sensors)).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get sensors!',
			genErr: err
		})).end();
	});
});

router.get('/sensors', function(req, res){
	res.setHeader('Content-Type','application/json');

	sensorController.getAllSensors().then(function (data) {
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get sensors!',
			genErr: err
		})).end();
	});
});



module.exports = router;