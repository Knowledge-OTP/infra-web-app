(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingDiagnosticController',
        function(OnBoardingService, $state, znkAnalyticsSrv) {
            'ngInject';

            var onBordingSettings = OnBoardingService.getOnBoardingSettings();

            this.setOnboardingCompleted = function (nextState, eventText) {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'onBoardingDiagnosticStep',
                    props: {
                        clicked: eventText
                    }
                });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.ROADMAP).then(function () {
                    if (nextState === 'app.diagnostic' && onBordingSettings.ignoreDiagnosticIntro) {
                        $state.go(nextState, { skipIntro: true });
                    } else {
                        $state.go(nextState);
                    }
                });
            };
    });
})(angular);
