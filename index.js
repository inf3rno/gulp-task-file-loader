var gulp = require("gulp"),
    glob = require("glob"),
    path = require("path");

var TaskLoader = function () {
};
TaskLoader.prototype = {
    load: function (pattern, depGraph) {
        var registry = new TaskRegistry();
        this.loadTaskModules(registry, pattern);
        this.parseDependencyGraph(registry, depGraph);
        this.addGulpTasks(registry);
        return this;
    },
    loadTaskModules: function (registry, pattern) {
        if (typeof (pattern) == "string")
            pattern = [pattern];
        if (!(pattern instanceof Array))
            throw new Error("invalid gulp task loader glob pattern \n" + pattern);
        var files = glob.sync.apply(glob, pattern);
        for (var i = 0; i < files.length; ++i) {
            var file = files[i];
            var ext = path.extname(file);
            if (ext != ".js")
                continue;
            var name = path.basename(file, ext);
            var task = require(path.resolve(file));
            registry.register(name, null, task);
        }
    },
    parseDependencyGraph: function (registry, options) {
        var graph = options || {};
        if (typeof (options) == "string")
            graph = require(path.resolve(options));
        if (graph.constructor !== Object)
            throw new Error("invalid gulp task loader dependencies: not an Object instance \n" + graph);
        for (var name in graph) {
            var deps = graph[name];
            registry.register(name, deps, null);
            if (deps)
                for (var i = 0; i < deps.length; ++i)
                    registry.register(deps[i], null, null);
        }
    },
    addGulpTasks: function (registry) {
        var records = registry.records();
        for (var name in records) {
            var record = records[name],
                deps = record.deps,
                task = record.task;
            if (!deps && !task)
                throw new Error("invalid gulp task: '" + name + "', cannot find module and dependencies");
            var args = [name];
            if (deps)
                args.push(deps);
            if (task)
                args.push(task);
            gulp.task.apply(gulp, args);
        }
    }
};

var TaskRegistry = function () {
    this.data = {};
};
TaskRegistry.prototype = {
    register: function (name, deps, task) {
        var record;
        if (this.data.hasOwnProperty(name))
            record = this.data[name];
        else {
            record = {};
            this.data[name] = record;
        }
        if (deps)
            record.deps = deps;
        if (task) {
            if (record.task)
                throw new Error("task name duplication '" + name + "'");
            record.task = task;
        }

    },
    records: function () {
        return this.data;
    }
};

var loader = new TaskLoader();

module.exports = loader.load.bind(loader);