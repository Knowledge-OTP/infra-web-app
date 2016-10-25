(function (angular) {
    'use strict';
    angular.module('demo', [
        'znk.infra-web-app.tests',
        'demoEnv'
    ])
        .config(function ($translateProvider) {
            'ngInject';
            $translateProvider.preferredLanguage('en');
            $translateProvider.useSanitizeValueStrategy(null);
        });
})(angular);
