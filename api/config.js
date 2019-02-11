var AWS = require('aws-sdk');

var config={
	AWSBucket: process.env.AWS_BUCKET,
	initAWSConfig: function(){
		var s3 = new AWS.S3();
		return s3;
	},
	mysqlAuth: {
		database: process.env.DATABASE,
		host: process.env.HOST,
		port: process.env.PORT,
		username: process.env.USERNAME,
		password: process.env.PASSWORD
	}
};

module.exports = config;