(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').run(function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('completeExercise');
    });
})(angular);

