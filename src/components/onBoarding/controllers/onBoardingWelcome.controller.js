(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingWelcomesController', ['userProfile', 'OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(userProfile, OnBoardingService, $state, znkAnalyticsSrv) {

            this.username = userProfile.nickname || '';

            this.nextStep = function () {
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingWelcomeStep' });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.GOALS);//   todo(dream school)
                // $state.go('app.onBoarding.schools');todo(dream school)
                $state.go('onBoarding.goals');
            };
    }]);
})(angular);
