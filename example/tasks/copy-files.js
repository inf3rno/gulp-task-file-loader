var gulp = require("gulp");
module.exports = function () {
    return gulp.src("src/*")
        .pipe(gulp.dest("dest"));
};