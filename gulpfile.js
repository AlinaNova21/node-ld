const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const browserify = require('gulp-browserify');
 
gulp.task('default', ['node','browser'])
gulp.task('node', ['es6'])
gulp.task('browser', ['compress']);

gulp.task('es6', ()=>{
	return gulp.src('src/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('bundle', ['es6'], ()=>{
	// Single entry point to browserify 
	return gulp.src('dist/browser.js')
		.pipe(browserify({
		  insertGlobals : true,
		  debug : true
		}))
		.pipe(gulp.dest('./build'))
	})

gulp.task('compress', ['bundle'], ()=>{
	return gulp.src('build/browser.js')
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('./build'));
});