(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').run(function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('workoutsRoadmap');
    });
})(angular);

