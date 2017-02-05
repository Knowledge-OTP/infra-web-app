(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingIntroTestToTakeController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv',
        function ($state, OnBoardingService, znkAnalyticsSrv) {


            this.goToTestToTake = function () {
                znkAnalyticsSrv.eventTrack({eventName: 'onBoardingIntroTestToTakeStep'});
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.TEST_TO_TAKE);
                $state.go('app.onBoarding.testToTake');
            };
        }]);
})(angular);
