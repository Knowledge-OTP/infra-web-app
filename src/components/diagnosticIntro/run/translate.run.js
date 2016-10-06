(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticIntro').run(function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('diagnosticIntro');
    });
})(angular);

