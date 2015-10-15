var loader = require("../index");
loader("tasks/*.js", {
    "build": ["copy-files"],
    "copy-files": ["clean"]
});