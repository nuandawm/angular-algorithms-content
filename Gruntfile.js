module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    express: {
      all: {
        options: {
          bases: ['/home/nuandawm/Documents/JSProjects/angular-algorithms-content/public'],
          port: 9000,
          hostname: "localhost",
          livereload: true
        }
      }
    },
    watch: {
      all: {
        files: '**/*',
        options: {
          livereload: true
        }
      }
    },
    open: {
      all: {
        path: 'http://localhost:9000/index.html'
      }
    },
    nodemon: {
      dev: {
        script: 'server.js'
      }
    }
  });

  grunt.registerTask('server',['nodemon']);

  grunt.registerTask('client',['express', 'open', 'watch']);
}