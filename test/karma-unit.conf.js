// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-02-10 using
// generator-karma 0.9.0

module.exports = function (config) {
    'use strict';

    config.set({
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        usePolling: true,

        // base path, that will be used to resolve files and exclude
        basePath: '../',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'test/crossBrowserSupport/*',
            // bower:js
            'bower_components/angular/angular.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-aria/angular-aria.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/Swiper/dist/js/swiper.js',
            'bower_components/firebase/firebase.js',
            'bower_components/ng-idle/angular-idle.js',
            'bower_components/SHA-1/sha1.js',
            'bower_components/angulartics/src/angulartics.js',
            'bower_components/angular-messages/angular-messages.js',
            'bower_components/angular-translate/angular-translate.js',
            'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            'bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
            'bower_components/plivo/dist/plivo.min.js',
            'bower_components/angular-material/angular-material.js',
            'bower_components/angular-ui-router/release/angular-ui-router.js',
            'bower_components/angular-svg-round-progressbar/build/roundProgress.js',
            'bower_components/infra/dist/main.js',
            'bower_components/ng-tags-input/ng-tags-input.min.js',
            'bower_components/Chart.js/Chart.js',
            'bower_components/angular-chart.js/dist/angular-chart.js',
            'bower_components/v-accordion/dist/v-accordion.js',
            'bower_components/satellizer/dist/satellizer.js',
            'bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
            'bower_components/angular-ui-grid/ui-grid.js',
            'bower_components/es5-shim/es5-shim.js',
            'bower_components/mockfirebase/browser/mockfirebase.js',
            'bower_components/jasmine/lib/jasmine-core/jasmine.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
            'bower_components/aws-sdk/dist/aws-sdk.js',
            'bower_components/angular-mocks/angular-mocks.js',
            // endbower

            'test/jsonFixtures/config.js',
            // JSON fixture
            {
                pattern:  'test/jsonFixtures/*.json',
                watched:  true,
                served:   true,
                included: false
            },

            //html
            'src/**/*.html',
            'src/**/*.svg',

            //utility
            'test/utility/module.js',
            'test/utility/**/*.*',

            //src files
            'src/core/*.js',
            'src/components/**/*.module.js',
            'src/components/**/*.js',

            //mock
            'test/mock/**/*.js',

            //tests
            'test/spec/**/*.spec.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        //browsers: [
        //    'Chrome'
        //],

        // Which plugins to enable
        //plugins: [
        //    'karma-phantomjs-launcher',
        //    'karma-chrome-launcher',
        //    'karma-safari-launcher',
        //    'karma-jasmine',
        //    'karma-jasmine-html-reporter',
        //    'karma-ng-html2js-preprocessor'
        //],

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

        colors: true,
        preprocessors: {
            '**/*.html': ['ng-html2js'],
            '**/*.svg': ['ng-html2js']
        },
        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        reporters: ['progress', 'html'],

        //html to js
        ngHtml2JsPreprocessor: {
            // strip this from the file path
            stripPrefix: 'src/',
            // setting this option will create only a single module that contains templates
            // from all the files, so you can load them all with module('foo')
            moduleName: 'htmlTemplates'
        }
    });
};
