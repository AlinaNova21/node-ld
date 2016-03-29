const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babelify = require('babelify')
const watchify = require('watchify')
const browserify = require('browserify');
const transform = require('vinyl-transform');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const browserifyOpts = {
	entries: ['./browser.js'],
	insertGlobals : true,
	debug : false,
	standalone: 'ld',
	transforms: [
		babelify.configure({
			// Use all of the ES2015 spec
			presets: ["es2015"]
		})
	]
}

gulp.task('default', ['node','browser'])
gulp.task('node', ['es6'])
gulp.task('browser', ['bundle']);

gulp.task('es6', ()=>{
	return gulp.src('src/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('bundle', ['es6'], ()=>{
	return browserify(browserifyOpts)
  		.bundle()
  		.pipe(source('./browser.js'))
  		.pipe(buffer())
  		.pipe(rename({ basename: 'node-ld' }))
  		.pipe(gulp.dest('./build/browser/'))
  		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('./build/browser/'));
})
