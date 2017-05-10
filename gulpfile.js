const gulp = require('gulp');
const Server = require('karma').Server;
const debug = require('gulp-debug');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const changed = require('gulp-changed');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const pump = require('pump');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');  // v1.2.2
const sassdoc = require('sassdoc');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();



gulp.task('clean', function() {
    return gulp.src('dist/**/*.*', { read: false })
    .pipe(clean({force: true}));
});

gulp.task('js', function() {
    return gulp.src('src/*.js')
    .pipe(changed('dist', {extension: '.min.js'}))
    .pipe(debug({ title: 'js:', showFiles: false }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())
    ;
});

gulp.task('minjs', function(cb) {
  pump([
        gulp.src('src/*.js'),
        changed('dist'/*, {extension: '.js'}*/),
        debug({ title: 'minjs:', showFiles: true }),
        uglify(),
        rename({ suffix: '.min' }),
        gulp.dest('dist')
    ],
    cb
  );
});

gulp.task('pug', (done) => {

  return gulp.src('src/*.pug')
    // Look for files newer than the corresponding .html
    // file in the destination directory.
    .pipe(changed('dist', {extension: '.html'}))
    // Convert the pug files to html files
    .pipe(pug({
        doctype: 'html',
        pretty: true
    }))
    // Handle pug errors nicely
    .on('error', function(err){
        gutil.log(err.message);
        this.emit('end'); // prevents watch from dying
    })
    .pipe(debug({ title: 'pug:', showFiles: false }))
    // Place the resultant HTML file into the destination directory.
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())
    ;

    done();
});

// - ###########################################################################
// - Compile SASS files to CSS
// - ###########################################################################
gulp.task('sass', function() {

  // See https://www.sitepoint.com/simple-gulpy-workflow-sass/
  var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
  };
  var autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
  };

  return gulp
    .src('src/*.scss', { base: './src'})
    .pipe(changed('dist', {extension: '.css'}))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(debug({ title: 'sass:', showFiles: false }))
    .pipe(gulp.dest('dist'))
    .pipe(sassdoc())
    .pipe(browserSync.stream())
    // Release the pressure back and trigger flowing mode (drain)
    // See: http://sassdoc.com/gulp/#drain-event
    .resume();
});

gulp.task('testpage', (done) => {

  return gulp.src('test/**/*.*')
    .pipe(browserSync.stream())
    ;

    done();
});

/**
 * Run test once and exit
 */
gulp.task('test', ['install'], function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('watch', function() {
  return gulp
    // Watch the input folder for change,
    // and run `sass` task when something happens
    .watch('src/**/*.*', ['pug', 'sass', 'js', 'minjs'])
    // When there is a change,
    // log a message in the console
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});


gulp.task('testloop', function() {
  return gulp
    .watch(['src/**/*.*', 'test/**/*.*'], ['test'])
});

gulp.task('serve', function() {
  browserSync.init({
      server: {
          baseDir: '.',
          index: "test/index.html"
      },
      port: 3070,
      //reloadDelay: 200 // Give the server time to pick up the new files.
  });
  return gulp
    .watch(['src/**/*.*', 'test/**/*.*'], ['testpage', 'pug', 'sass', 'js', 'minjs'])
});

gulp.task('install', ['pug', 'sass', 'js', 'minjs']);

gulp.task('other-tasks-message', function(done) {
  console.log();
  console.log();
  console.log();
  console.log();
  console.log('Other tasks you might find useful:');
  console.log();
  console.log('   serve - display test/index.html with each file change.');
  console.log('   install - convert and install files into ./dist');
  console.log('   test - test the component using karma.');
  console.log('   testloop - test the component using karma with each file change.');
  console.log();
  console.log();
  console.log();
  console.log();
  done();
});

gulp.task('default', function(done) {
  //gulp.series('install', 'other-tasks-message');
  runSequence('install', 'other-tasks-message', done);
});