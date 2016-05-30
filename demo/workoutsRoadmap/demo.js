'use strict';

angular.module('demo', [
    'znk.infra-web-app.workoutsRoadmap',
    'pascalprecht.translate'
])
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error.message);
        });
    })
    .run(function ($state) {
        $state.go('workoutsRoadmap');
    });
