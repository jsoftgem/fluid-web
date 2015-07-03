/**
 * Created by jerico on 4/17/2015.
 */
module.exports = function (grunt) {
    grunt.initConfig({
            pkg: grunt.file.readJSON("package.json"),
            bower: {
                install: {
                    options: {
                        install: true,
                        copy: false,
                        targetDir: './libs',
                        cleanTargetDir: true
                    }
                }
            },
            jshint: {
                all: ['Gruntfile.js', 'src/js/*.js', '**/*.js']
            },
            karma: {
                options: {
                    configFile: 'test/config/karma.conf.js'
                },
                unit: {
                    singleRun: true
                },

                continuous: {
                    singleRun: false,
                    autoWatch: true
                }
            },
            html2js: {
                dist: {
                    src: ['src/templates/fluid/*.html'],
                    dest: 'tmp/templates.js'
                }
            },
            concat: {
                options: {
                    separator: ';'
                },
                dist: {
                    src: ['src/js/*.js', 'src/js/modules/*.js', 'tmp/*.js'],
                    dest: 'dist/js/fluid.js'
                }
            },
            uglify: {
                dist: {
                    files: {
                        'dist/js/fluid.min.js': ['dist/js/fluid.js']
                    },
                    options: {
                        mangle: false
                    }
                }
            },
            cssmin: {
                target: {
                    files: [
                        {
                            expand: true,
                            cwd: 'dist/css',
                            src: ['*.css'],
                            dest: 'dist/css',
                            ext: '.min.css'
                        }]
                }
            },
            concat_css: {
                options: {},
                all: {
                    src: ["src/css/*.css"],
                    dest: "dist/css/fluid.css"
                }
            }
            , clean: {
                temp: {
                    src: ['tmp', 'dist/css/*.css']
                }
            },
            watch: {
                dev: {
                    files: ['Gruntfile.js', 'src/js/*.js', '*.html'],
                    tasks: ['jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'clean:temp'],
                    options: {
                        atBegin: true
                    }
                }
                ,
                min: {
                    files: ['Gruntfile.js', 'app/*.js', '*.html'],
                    tasks: ['jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'clean:temp', 'uglify:dist'],
                    options: {
                        atBegin: true
                    }
                }
            }
            ,
            compress: {
                dist: {
                    options: {
                        archive: 'dist/<%= pkg.name %>-<%= pkg.version %>.zip'
                    }
                    ,
                    files: [{
                        src: ['dist/**'],
                        dest: 'dist/'
                    }, {
                        src: ['assets/**'],
                        dest: 'assets/'
                    }, {
                        src: ['libs/**'],
                        dest: 'libs/'
                    }]
                }
            },
            strip: {
                main: {
                    src: 'dist/js/fluid.js',
                    dest: 'dist/js/fluid.js',
                    nodes: ['console', 'debug']
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-strip');
    /*
     grunt.registerTask('dev', ['bower', 'connect:server', 'watch:dev']);
     grunt.registerTask('test', ['bower', 'jshint', 'karma:continuous']);
     grunt.registerTask('minified', ['bower', 'connect:server', 'watch:min']);
     grunt.registerTask('package', ['bower', 'jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'uglify:dist',
     'clean:temp', 'compress:dist']);*/
    grunt.registerTask('package', ['bower', 'html2js:dist', 'concat:dist', 'strip', 'uglify:dist',
        'clean:temp', 'compress:dist', 'concat_css', 'cssmin']);
}