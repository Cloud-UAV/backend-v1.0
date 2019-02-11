var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var removeCode = require('gulp-remove-code');
var runSequence = require('run-sequence');
var argv = require('yargs').argv;
var del = require('del');

var prod = false,
    dev = true;

gulp.task('clean', function(){
	return del(['./dist']);
});

gulp.task('scripts', function(){
	gulp.src(['./*.js', './*.json']).pipe(removeCode({
		prod: prod,
		dev: dev
	})).pipe(gulp.dest('./dist/'));

	gulp.src(['./api/**/*.js']).pipe(removeCode({
		prod: prod,
		dev: dev
	})).pipe(gulp.dest('./dist/api/'));
});

gulp.task('run', function(){
	return nodemon({
		script: './server.js',
		ext: 'js',
	});
});

gulp.task('build', ['clean'], function(){
	if(argv.prod == true){
		prod= true;
		dev = false;
		runSequence('scripts');
	}else{
		runSequence(['run']);
	}
});