module.exports = (grunt) ->

  # load tasks
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-ejs-static"

  grunt.initConfig
    dir:
      src: "src"
      dest: "site"
    coffee:
      compile:
        options:
          join: true
        files:
          "<%= dir.dest %>/scripts/app.js": ["<%= dir.src %>/scripts/*.coffee"]
    uglify:
      files:
        expand: true
        cwd: "<%= dir.dest %>/scripts"
        src: ["*.js", "!*.min.js"]
        dest: "<%= dir.dest %>/scripts"
        ext: ".min.js"
      options: ""
    ejs_static:
      optimize:
        options:
          dest: "<%= dir.dest %>"
          path_to_data: "<%= dir.src %>/data/routes.json"
          path_to_layouts: "<%= dir.src %>/layouts"
          index_page: "index"
          parent_dirs: true
          underscores_to_dashes: true
          file_extension: ".html"
    copy:
      static:
        expand: true
        cwd: "<%= dir.src %>/static"
        src: "**"
        dest: "<%= dir.dest %>"
    watch:
      coffee:
        files: ["<%= dir.src %>/scripts/*.coffee"]
        tasks: [
          "coffee"
          "uglify"
        ]
      ejs:
        files: [
          "<%= dir.src %>/layouts/*"
          "<%= dir.src %>/partials/*"
        ]
        tasks: ["ejs_static"]
      static:
        files: ["<%= dir.src %>/static/*"]
        tasks: ["copy"]

  grunt.registerTask "default", ["copy", "ejs_static", "coffee", "uglify"]
