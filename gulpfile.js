"use strict";
const gulp = require("gulp");
const wait = require("gulp-wait");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const gutil = require("gulp-util");
const del = require("del");
const pugInheritance = require("gulp-pug-inheritance");
const pug = require("gulp-pug");
const changed = require("gulp-changed");
const cached = require("gulp-cached");
const gulpif = require("gulp-if");
const filter = require("gulp-filter");
const autoprefixer = require("gulp-autoprefixer");
const babelify = require("babelify");
const browserify = require("browserify");
const watchify = require("watchify");
const watch = require("gulp-watch");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const sourcemaps = require("gulp-sourcemaps");
const minify = require("gulp-minify");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;

// Clean www, do not remove public dir.
gulp.task("clean:www", () => {
	gutil.log(gutil.colors.yellow.bold.underline("Cleaning www..."));
	del(["www/**/*", "!www/public/", "!www/public/**"], {
		dot: true,
	});
});

// Css and Fonts, move to working dir.
gulp.task("css", () => {
	return gulp
		.src("dev/css/**/*.{css,ttf,eot,otf,svg,woff,woff2}")
		.pipe(wait(1000))
		.pipe(
			plumber({
				errorHandler: function (err) {
					notify.onError({
						title: "CSS/FONTS error in " + err.plugin,
						message: err.message,
					})(err);
					gutil.beep();
					this.emit("end");
				},
			})
		)
		.pipe(gulp.dest("www/css/"))
		.pipe(
			reload({
				stream: true,
			})
		);
});

// Only changed compile for pug files watch fix.
gulp.task("setWatchPugInheritance", function () {
	global.isWatching = true;
});

// Compile pug files to html
gulp.task("pug", () => {
	return gulp
		.src("dev/pug/**/*.pug")
		.pipe(
			plumber({
				errorHandler: function (err) {
					notify.onError({
						title: "PUG error in " + err.plugin,
						message: err.message,
					})(err);
					gutil.beep();
					this.emit("end");
				},
			})
		)
		.pipe(
			changed("www", {
				extension: ".html",
			})
		)
		.pipe(gulpif(global.isWatching, cached("pug")))
		.pipe(
			pugInheritance({
				basedir: "dev/pug",
				skip: "node_modules",
			})
		)
		.pipe(
			filter(function (file) {
				return !/\/_/.test(file.path) && !/^_/.test(file.relative);
			})
		)
		.pipe(
			pug({
				pretty: true,
			})
		)
		.pipe(gulp.dest("www"))
		.pipe(
			reload({
				stream: true,
			})
		);
});

// Json, move to working dir.
gulp.task("json", () => {
	return gulp
		.src("dev/json/**/*.json")
		.pipe(gulp.dest("www/json/"))
		.pipe(
			reload({
				stream: true,
			})
		);
});

// Js, move to working dir.
gulp.task("js", () => {
	return gulp
		.src(["dev/js/**/*.js", "!dev/js/**/app.js"])
		.pipe(
			plumber({
				errorHandler: function (err) {
					notify.onError({
						title: "JS error in " + err.plugin,
						message: err.message,
					})(err);
					gutil.beep();
					this.emit("end");
				},
			})
		)
		.pipe(gulp.dest("www/js/"))
		.pipe(
			reload({
				stream: true,
			})
		);
});

// ES6 task as function-task.
gulp.task("es6", es6);

// ES6, Transpiling for js files.
function es6(watch) {
	let b = browserify({
		entries: "dev/js/app.js",
	}).transform(
		babelify.configure({
			presets: ["@babel/preset-env"],
		})
	);
	if (watch) b = watchify(b);

	let rebundle = function () {
		gutil.log(gutil.colors.magenta.bold.underline("Transpiling [app.js] ..."));
		return b
			.bundle()
			.on("error", function (err) {
				gutil.beep();
				gutil.log(gutil.colors.bgRed("ERROR (Browserify): " + err.message));
			})
			.pipe(source("app.js"))
			.pipe(buffer())
			.pipe(
				sourcemaps.init({
					loadMaps: true,
				})
			)
			.pipe(sourcemaps.write("./"))
			.pipe(gulp.dest("www/js/"))
			.pipe(
				reload({
					stream: true,
				})
			);
	};

	b.on("update", function () {
		return rebundle();
	});

	return rebundle();
}

// The working directory.
gulp.task(
	"browser-sync",
	["css", "setWatchPugInheritance", "pug", "json", "js", "es6"],
	function () {
		browserSync.init({
			server: {
				baseDir: "./www/",
			},
		});
		gutil.log(gutil.colors.green.bold.underline("SERVE HAS BEEN STARTED."));
	}
);

// Watch files comiling.
gulp.task("watch", function () {
	gulp.watch("dev/css/**/*", ["css"]);
	gulp.watch("dev/pug/**/*", ["pug"]);
	gulp.watch("dev/json/**/*", ["json"]);
	gulp.watch("dev/js/**/*", ["js"]);
});

// Default task.
gulp.task("default", ["watch", "browser-sync"]);

// Clean & Build task.
gulp.task(
	"build",
	["clean:www", "css", "setWatchPugInheritance", "pug", "json", "js", "es6"],
	() => {
		gutil.log(gutil.colors.cyan.bold.underline("OK! (BUILD IS DONE.)"));
		process.exit(0);
	}
);

// Project Setup Message.
gulp.task("setupLog", () => {
	gutil.log(
		gutil.colors.bgGreen(
			'OK! (SETUP COMPLETED.), Type "npm run start" to start.'
		)
	);
	process.exit(0);
});
