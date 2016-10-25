(function(angular) {
    'use strict';
    angular.module('demo', [
        'demoEnv',
        'znk.infra-web-app.liveLessons'
    ])
        .config(function ($translateProvider) {
            'ngInject';
            $translateProvider.preferredLanguage('en');
            $translateProvider.useSanitizeValueStrategy(null);
        });
})(angular);
