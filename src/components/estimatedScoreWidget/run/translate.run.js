(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').run(function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('estimatedScoreWidget');
    });
})(angular);

