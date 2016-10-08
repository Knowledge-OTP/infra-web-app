(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', function($state, onBoardingStep) {
        'ngInject';
        $state.go(onBoardingStep.url);
    });
})(angular);
