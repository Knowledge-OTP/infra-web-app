(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingDiagnosticController',
        function (OnBoardingService, $state, znkAnalyticsSrv) {
            'ngInject';

            var vm = this;
            var onBordingSettings = OnBoardingService.getOnBoardingSettings();

            vm.showInstructions = angular.isDefined(onBordingSettings.showInstructions) ? onBordingSettings.showInstructions : false;
            vm.showIconsSection = angular.isDefined(onBordingSettings.showIconsSection) ? onBordingSettings.showIconsSection : true;
            getMarketingToefl();

            this.setOnboardingCompleted = function (nextState, eventText) {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'onBoardingDiagnosticStep',
                    props: {
                        clicked: eventText
                    }
                });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.ROADMAP).then(function () {
                    if (nextState === 'app.diagnostic' && onBordingSettings.forceSkipIntro) {
                        $state.go(nextState, {forceSkipIntro: true});
                    } else {
                        $state.go(nextState);
                    }
                });
            };

            function getMarketingToefl() {
                OnBoardingService.getMarketingToefl().then(function (marketingObj) {
                    vm.isMarketingToefl = !!marketingObj && !!marketingObj.status;
                });
            }
        });
})(angular);
