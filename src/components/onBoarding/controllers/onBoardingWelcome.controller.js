(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingWelcomesController',
        function (userProfile, OnBoardingService, $state, znkAnalyticsSrv) {
            'ngInject';
            var onBoardingSettings = OnBoardingService.getOnBoardingSettings();
            this.username = userProfile.nickname || '';

            this.nextStep = function () {
                var nextStep;
                var nextState;
                znkAnalyticsSrv.eventTrack({eventName: 'onBoardingWelcomeStep'});
                if (onBoardingSettings && onBoardingSettings.showSchoolStep) {
                    nextStep = OnBoardingService.steps.SCHOOLS;
                    nextState = 'app.onBoarding.schools';
                } else {
                    nextStep = OnBoardingService.steps.GOALS;
                    nextState = 'app.onBoarding.goals';
                }
                OnBoardingService.setOnBoardingStep(nextStep);
                $state.go(nextState);
            };
        });
})(angular);
