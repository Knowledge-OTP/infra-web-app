(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', ['$state', 'onBoardingStep', '$translatePartialLoader', function($state, onBoardingStep, $translatePartialLoader) {
        $translatePartialLoader.addPart('onBoarding');
        $state.go(onBoardingStep.url);
    }]);
})(angular);
