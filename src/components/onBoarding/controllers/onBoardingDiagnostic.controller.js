(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingDiagnosticController', ['OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(OnBoardingService, $state, znkAnalyticsSrv) {
        this.setOnboardingCompleted = function (nextState, eventText) {
            znkAnalyticsSrv.eventTrack({
                eventName: 'onBoardingDiagnosticStep',
                props: {
                    clicked: eventText
                }
            });
            OnBoardingService.setOnBoardingStep(OnBoardingService.steps.ROADMAP).then(function () {
                $state.go(nextState);
            });
        };
    }]);
})(angular);
