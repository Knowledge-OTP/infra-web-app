(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingGoalsController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv',
        function ($state, OnBoardingService, znkAnalyticsSrv) {

            var onBoardingSettings = OnBoardingService.getOnBoardingSettings();
            this.userGoalsSetting = {
                recommendedGoalsTitle: true,
                saveBtn: {
                    title: '.SAVE_AND_CONTINUE',
                    showSaveIcon: true
                }
            };

            this.saveGoals = function () {
                znkAnalyticsSrv.eventTrack({eventName: 'onBoardingGoalsStep'});
                var nextStep;
                var nextState;

                if (onBoardingSettings.showTestToTake) {
                    nextStep = OnBoardingService.steps.INTRO_TEST_TO_TAKE;
                    nextState = 'app.onBoarding.introTestToTake';
                } else {
                    nextStep = OnBoardingService.steps.DIAGNOSTIC;
                    nextState = 'app.onBoarding.diagnostic';
                }

                OnBoardingService.setOnBoardingStep(nextStep);
                $state.go(nextState);
            };
        }]);
})(angular);
