var express = require('express');
var userController=require('../controllers/userCntrl');
var jwt= require('jsonwebtoken');
var config = require('../config');

var router = express.Router();

//create user
router.post('/users', function(req, res) {
	res.setHeader('Content-Type','application/json');
	var obj = req.body;

	if(!obj.hasOwnProperty('password')){
		res.status(400);
		res.send(JSON.stringify({
			error: "Password is missing."
		})).end();
	}else {
		userController.postUser(obj).then(function(data){
			res.status(201);
			res.send(data).end();
		}, function(err){
			res.status(400);
			res.send(JSON.stringify({
				error: 'Could not create user. User may already have an account!',
				genErr: err
			})).end();
		});
	}
	
});

router.patch('/users/forgotPassword', function(req, res){
 	var email = req.body['email'];
 	var pwd = req.body['password'];
 	res.setHeader('Content-Type','application/json');

 	userController.resetPassword(email, pwd).then(function(data){
		res.status(201);
		res.send(JSON.stringify(data)).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get user by email. Please check email!',
			genErr: err
		})).end();
	});
});

//get user by id
router.get('/users/:id', function(req, res) {
	res.setHeader('Content-Type','application/json');

	userController.getUserByID(req.params.id).then(function(data){
		res.status(200);
		res.send(JSON.stringify(data)).end();
	}, function(err){
		res.status(400);
		res.send(JSON.stringify({
			error: 'Could not get user by email. Please check email!',
			genErr: err
		})).end();
	});
});

router.delete('/:id/logout', function(req, res) {
	res.setHeader('Content-Type','application/json');

	
});

router.delete('/users/:id', function(req, res){
	res.setHeader('Content-Type','application/json');

	if(req.user.role == 'admin'){
		userController.deleteUser(req.params.id).then(function(){
			res.status(200);
			res.send(JSON.stringify({})).end();
		}, function(err){
			res.status(400);
			res.send(JSON.stringify({
				error: 'Could not delete user!',
				genErr: err
			})).end();
		});
	}else{
		res.status(401);
		res.send(JSON.stringify({
			error: 'Unathorized: You do not have access to this resource.',
		})).end();
	}
});

//get user by email or email-password. If no email and password provided then just return all users.
router.get('/users', function(req, res) {
	res.setHeader('Content-Type','application/json');

	if(req.query.hasOwnProperty('email')){
		if(req.query.hasOwnProperty('password')){
			userController.getUserByEmailAndPassword(req.query.email, req.query.password).then(function(data){
				var response = JSON.parse(data);

				response['token']=jwt.sign({
					email: req.query.email,
					id: response['id'],
					role: response['role'],
				}, 'CloudUAV', {
					expiresIn: '2d'
				});

				res.status(200);
				res.send(JSON.stringify(response)).end();
			}, function(err){
				res.status(400);
				res.send(JSON.stringify({
					error: 'Password is incorrect. Please try again.',
					genErr: err
				})).end();
			});
		}else{
			res.status(400);
			res.send(JSON.stringify({
				error: 'No password provided.',
			})).end();
			// userController.getUserByEmail(req.query.email).then(function(data){
			// 	res.status(200);
			// 	res.send(data).end();
			// }, function(err){
			// 	res.status(400);
			// 	res.send(JSON.stringify({
			// 		error: 'Could not get user by email. Please check email!',
			// 		genErr: err
			// 	})).end();
			// });
		}
	}else{
		if(req.user.role == 'admin'){
			userController.getAllUsers().then(function(data){
				res.status(200);
				res.send(data).end();
			}, function(err){
				res.status(400);
				res.send(JSON.stringify({
					error: 'Could not get users!',
					genErr: err
				})).end();
			});
		}else{
			res.status(401);
			res.send(JSON.stringify({
				error: 'Unathorized: You do not have access to this resource.',
			})).end();
		}
		
	}
});

router.patch('/users/:id', function(req, res) {
	res.setHeader('Content-Type','application/json');

	if(req.user.role == 'admin'){
		userController.updateUser(req.params.id, req.body).then(function(data){
			res.status(200);
			res.send(JSON.stringify(data)).end();
		}, function(err){
			res.status(400);
			res.send(JSON.stringify({
				error: 'Could not update user!',
				genErr: err
			})).end();
		});
	}else{
		res.status(401);
		res.send(JSON.stringify({
			error: 'Unathorized: You do not have access to this resource.',
		})).end();
	}
});

module.exports = router;