(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingIntroTestToTakeController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv',
        function ($state, OnBoardingService) {


            this.goToTestToTake = function () {
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.TEST_TO_TAKE);
                $state.go('app.onBoarding.testToTake');
            };
        }]);
})(angular);
