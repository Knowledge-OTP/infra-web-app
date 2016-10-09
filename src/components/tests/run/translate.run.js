(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').run(function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('tests');
    });
})(angular);

