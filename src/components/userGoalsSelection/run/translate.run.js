(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoalsSelection').run(function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('userGoalsSelection');
    });
})(angular);

