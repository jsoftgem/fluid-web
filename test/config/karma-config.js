module.exports = function (config) {

    config.set({
        //  root path location that will be used to resolve all relative paths in files and exclude sections, should be the root of your project
        basePath: '../',
        client: {
            captureConsole: true,
            mocha: {
                bail: true
            }
        },
        // files to include, ordered by dependencies
        files: [
            // include relevant Angular files and libs
            '../bower_components/jquery/dist/jquery.js',
            '../bower_components/angular/angular.js',
            '../bower_components/angular-mocks/angular-mocks.js',
            '../bower_components/angular-local-storage/dist/angular-local-storage.js',
            '../bower_components/oclazyload/dist/ocLazyLoad.js',
            //include html files
            '../src/templates/fluid/*.html',
            // include js files
            '../src/js/*.js',
            '../src/js/modules/*.js',
            // include unit test specs
            '../test/unit/*.js',
            '../test/unit/directives/*.js'
        ],
        /*// files to exclude
         exclude: [
         'app/lib/angular/angular-loader.js'
         , 'app/lib/angular/!*.min.js'
         , 'app/lib/angular/angular-scenario.js'
         ],
         */
        // karma has its own autoWatch feature but Grunt watch can also do this
        autoWatch: false,

        // testing framework, be sure to install the karma plugin
        frameworks: ['jasmine'],

        // browsers to test against, be sure to install the correct karma browser launcher plugin
        browsers: ['Chrome', 'PhantomJS'],

        // progress is the default reporter
        reporters: ['progress'],

        // map of preprocessors that is used mostly for plugins
        preprocessors: {
            'src/js/*.js': 'coverage',
            'src/js/modules/*.js': 'coverage',
            'src/templates/fluid/*.html': 'html2js'
        },

        // list of karma plugins
        plugins: [
            'karma-ng-html2js-preprocessor',
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-jshint-preprocessor',
            'karma-coverage'
        ],
        // add the plugin settings
        ngHtml2JsPreprocessor: {
            stripPrefix: 'src/'
        },// add plugin settings
        coverageReporter: {
            // type of file to output, use text to output to console
            type: 'text',
            // directory where coverage results are saved
            dir: 'test-results/coverage/'
            // if type is text or text-summary, you can set the file name
            // file: 'coverage.txt'
        },
        junitReporter: {
            // location of results output file
            outputFile: 'test-results/junit-results.xml'
        }
    })
}