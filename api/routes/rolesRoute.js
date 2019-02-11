var express = require('express');
var moment = require('moment');
var rolesController=require('../controllers/rolesCntrl');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var rimraf=require('rimraf');
var path = require('path');
var http = require('http');
var config = require('../config');

router.post('/roles', function(req, res){
	res.setHeader('Content-Type','application/json');
	var data = req.body;

	rolesController.postRole(data).then(function () {
		res.status(201);
		res.send(JSON.stringify({})).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not create role!',
			genErr: err
		})).end();
	});
});

router.delete('/roles/:roleID', function(req, res){
	res.setHeader('Content-Type','application/json');
	var roleID = req.params['roleID'];

	rolesController.deleteRole(roleID).then(function (data) {
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not delete role!',
			genErr: err
		})).end();
	});
});

module.exports = router;