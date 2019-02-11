//get the packages we need
var bodyParser = require('body-parser');
var express = require('express');
var fileUpload = require('express-fileupload');
var multer  = require('multer');
var http = require('http');
var fs = require('fs');
var app = express();
var jwt= require('jsonwebtoken');

// var upload = multer({ dest: './uploads/' });
// var personnel = multer({ dest: './uploads/personnel/' });

app.use(bodyParser.json({
	limit: '900mb'
}));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '900mb'
}));
app.use(fileUpload());

//ensure middleware runs before all routes do. 
//check if request came with auth-token if not do not allow them to request any resource other than users (401)
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", '*');
	res.header('Access-Control-Allow-Methods', "GET, PATCH, POST, DELETE, OPTIONS");
	res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, X-Requested-With, auth-token');

	if(req.method ==='OPTIONS'){
		next();
		return;
	}

	var url = req._parsedUrl.pathname;
	if((url =='/api/files/public') || (url == '/api/users' && Object.keys(req.query).length != 0) || (url=='/api/users/forgotPassword' || (url=='/api/users' && req.method=='POST') )){
		next();
		return;
	}
	
	if(req.headers.hasOwnProperty('auth-token')){
		if(req.headers['auth-token'] != null && req.headers['auth-token'] != undefined){
			jwt.verify(req.headers['auth-token'], 'CloudUAV', function(err, decode){
				if(err){
					res.setHeader('Content-Type','application/json');
					res.status(401);
					res.send(JSON.stringify({
						error: 'Auth token is incorrect.',
						genErr: err
					})).end();
				}else{
					req.user = decode;
					next();
				}
			});
		}
	}else{
		res.setHeader('Content-Type','application/json');
		res.status(401);
		res.send(JSON.stringify({
			error: 'Auth token was not provided in the request!',
		})).end();
	}
	
});

var usersRoute=require('./api/routes/usersRoute');
app.use('/api', usersRoute);

var filesRoute=require('./api/routes/filesRoute');
app.use('/api', filesRoute);

var dronesRoute=require('./api/routes/dronesRoute');
app.use('/api', dronesRoute);

var projectsRoute=require('./api/routes/projectsRoute');
app.use('/api', projectsRoute);

var personnelRoute=require('./api/routes/personnelsRoute');
app.use('/api', personnelRoute);

var inventoryRoute=require('./api/routes/inventoryRoute');
app.use('/api', inventoryRoute);

var sensorsRoute=require('./api/routes/sensorsRoute');
app.use('/api', sensorsRoute);

var rolesRoute=require('./api/routes/rolesRoute');
app.use('/api', rolesRoute);

var missionRoute=require('./api/routes/missionsRoute');
app.use('/api', missionRoute);

var httpServer = http.createServer(app);
httpServer.setTimeout(10*60*1000);

httpServer.listen(8080, function(){
	console.log('******** starting http server ********');
	console.log("Started server on port: "+ 8080);
	console.log("http://localhost:"+ 8080+"/api");
});
