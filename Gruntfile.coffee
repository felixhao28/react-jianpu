module.exports = (grunt) ->
    require("load-grunt-tasks")(grunt)
    grunt.registerTask "default", "to watch & compile", ["cjsx:build", "watch"]
    grunt.registerTask "build", "to compile", ["cjsx:build"]
    pkg = grunt.file.readJSON "package.json"
    grunt.initConfig
        pkg: pkg

        cjsx:
            build:
                options:
                    bare: true
                files: [
                        expand: true
                        cwd: "source"
                        src: ["**/*.coffee"]
                        dest: "scripts"
                        ext: ".js"
                    ,
                        expand: true
                        cwd: ""
                        src: ["*.coffee", "!Gruntfile.coffee"]
                        dest: "dist"
                        ext: ".js"
                ]

        watch:
            coffee:
                files: ["**/*.coffee"]
                tasks: ["newer:cjsx"]
