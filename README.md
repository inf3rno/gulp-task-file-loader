# gulp-task-file-loader
Loading [gulp](http://gulpjs.com/) tasks from module files and using JSON to describe dependencies.

## usage

 1. Install the package `npm install --save-dev gulp-task-file-loader`.
 1. Create a `tasks` directory and put some task file into it.
    A task file is a node.js module, which contains a gulp task.

    e.g. `tasks/copy-files.js`
    ```js
    var gulp = require("gulp");
    module.exports = function () {
        return gulp.src("src/*")
            .pipe(gulp.dest("dest"));
    };
    ```
    or `tasks/clean.js`
    ```js
    var del = require("del");
    module.exports = function () {
        return del(["dest"]);
    };
    ```
 1. Create a `gulpfile.js` in the project root which loads the tasks using a [glob](https://github.com/isaacs/node-glob) pattern.

    ```js
    var loader = require("gulp-task-file-loader");
    loader("tasks/*");
    ```
    And that's all, your tasks will be loaded! :-)

    The non-javascript files will be automatically filtered out so you don't have to worry about them.

    If you want to use the glob with options, e.g. `glob.sync(pattern, options)`, then you have to pass an array as first parameter.

    ```js
    loader(["tasks/**/*.js", {debug: true, strict: true}]);
    ```

 1. When your tasks are dependent on each other you can create a dependency descriptor JSON file.

    e.g. `tasks/deps.json`
    ```js
    {
        "copy-files": ["clean"]
    }
    ```
    In this case the `copy-files` task is dependent on the `clean` task, since it has to wait until the old files are deleted from the `dest` directory before copying the new files to it.

    You can load this JSON file by passing the file name to the `loader`.
    ```js
    loader("tasks/*.js", "tasks/deps.json");
    ```
    or you can use a javascript object instead of a JSON file if that's what you prefer
    ```js
    loader("tasks/*.js", {
        "copy-files": ["clean"]
    });
    ```

    When you have a root task, which only concerns about pulling in dependencies, then you don't have to create a dummy task file. Adding the task to the dependencies is enough.

    e.g. by `gulp build`
    ```js
    loader("tasks/*.js", {
        "build": ["copy-files"],
        "copy-files": ["clean"]
    });
    ```

 1. Enjoy! :P

## testing

I was lazy to write tests. Sorry for that! Maybe I'll do it later. (or not) xD

## limitations

The only limitation currently that the task name generation is hardcoded `var name = path.basename(file, ext);`.
Which means that you cannot have two files with the same `basename`, because that would cause a task name duplication error.
For example if you have a `pattern` like `tasks/**/*.js` and you have task files like `tasks/clean.js` and `tasks/subtask/clean.js`, then the `clean` task name would be used twice.
If you have a better strategy to generate task names, then please contribute!

## contribution

If you have any ideas about further enhancements, then please [open an issue](https://github.com/inf3rno/gulp-task-file-loader/issues) or send a pull request!

## license

MIT - 2015 Jánszky László Lajos