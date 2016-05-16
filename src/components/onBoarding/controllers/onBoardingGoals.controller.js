(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingDiagnosticController', ['$state', '$filter', 'OnBoardingService', 'znkAnalyticsSrv',
        function($state, $filter, OnBoardingService, znkAnalyticsSrv) {
            var translateFilter = $filter('translate');
            this.userGoalsSetting = {
                recommendedGoalsTitle: true,
                saveBtn: {
                    title: translateFilter('USER_GOALS.SAVE_&_CONTINUE'),
                    showSaveIcon: true
                }
            };

            this.saveGoals = function () {
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingGoalsStep' });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                $state.go('app.onBoarding.diagnostic');
            };
        }]);
})(angular);
