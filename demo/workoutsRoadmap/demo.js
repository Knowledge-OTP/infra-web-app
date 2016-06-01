'use strict';

angular.module('demo', [
    'znk.infra-web-app.workoutsRoadmap',
    'znk.infra.exams'
])
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error.message);
        });
    })
    .run(function ($state) {
        $state.go('workoutsRoadmap');
    });
