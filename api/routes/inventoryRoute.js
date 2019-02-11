var express = require('express');
var moment = require('moment');
var inventoryController=require('../controllers/inventoryCntrl');
var router = express.Router();
var multer  = require('multer');
var fs = require('fs');
var rimraf=require('rimraf');
var path = require('path');
var http = require('http');
var config = require('../config');

router.post('/inventory', function(req, res){
	
});

router.delete('/inventory/:inventoryID', function(req, res){
	res.setHeader('Content-Type','application/json');

	inventoryController.deleteInventory().then(function () {
		res.status(200);
		res.send().end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not delete inventory!',
			genErr: err
		})).end();
	});
});

router.get('/inventory/:inventoryID', function(req, res){
	
});

router.get('/:userID/inventory', function(req, res){
	res.setHeader('Content-Type','application/json');
	var userID = req.params['userID'];
	inventoryController.getDroneInventoryForUser(userID).then(function (data) {
		res.status(200);
		res.send(data).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get inventory!',
			genErr: err
		})).end();
	});
});



module.exports = router;