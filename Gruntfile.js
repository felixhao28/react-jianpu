module.exports = function(grunt) {
  var pkg;
  require("load-grunt-tasks")(grunt);
  grunt.registerTask("default", "to watch & compile", ["cjsx", "watch"]);
  grunt.registerTask("build", "to compile", ["cjsx"]);
  pkg = grunt.file.readJSON("package.json");
  return grunt.initConfig({
    pkg: pkg,
    cjsx: {
      build: {
        options: {
          bare: true
        },
        files: [
          {
            expand: true,
            cwd: "",
            src: ["**/*.coffee"],
            desc: "",
            ext: ".js"
          }
        ]
      }
    },
    watch: {
      coffee: {
        files: ["**/*.coffee"],
        tasks: ["newer:cjsx"]
      }
    }
  });
};
