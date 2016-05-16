(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', ['$state', 'onBoardingStep', function($state, onBoardingStep) {
        $state.go(onBoardingStep.url);
    }]);
})(angular);
