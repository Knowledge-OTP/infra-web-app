(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding').run(function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('onBoarding');
    });
})(angular);

