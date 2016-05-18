(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingGoalsController', ['$state', '$filter', 'OnBoardingService', 'znkAnalyticsSrv',
        function($state, $filter, OnBoardingService, znkAnalyticsSrv) {
            var translateFilter = $filter('translate');
            this.userGoalsSetting = {
                recommendedGoalsTitle: true,
                saveBtn: {
                    title: translateFilter('USER_GOALS.SAVE_AND_CONTINUE'),
                    showSaveIcon: true
                }
            };

            this.saveGoals = function () {
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingGoalsStep' });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                $state.go('onBoarding.diagnostic');
            };
        }]);
})(angular);
