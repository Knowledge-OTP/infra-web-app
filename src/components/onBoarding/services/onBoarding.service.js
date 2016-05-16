(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').service('OnBoardingService', ['ActStorageSrv', function(ActStorageSrv) {
        var self = this;

        var ONBOARDING_PATH = ActStorageSrv.variables.appUserSpacePath + '/' + 'onBoardingProgress';

        var onBoardingUrls = {
            1: 'app.onBoarding.welcome',
            2: 'app.onBoarding.schools',
            3: 'app.onBoarding.goals',
            4: 'app.onBoarding.diagnostic',
            5: 'app.workouts.roadmap'
        };

        this.steps = {
            WELCOME: 1,
            SCHOOLS: 2,
            GOALS: 3,
            DIAGNOSTIC: 4,
            ROADMAP: 5
        };

        this.getOnBoardingStep = function () {
            return getProgress().then(function (progress) {
                return {
                    url: onBoardingUrls[progress.step]
                };
            });
        };

        this.setOnBoardingStep = function (stepNum) {
            return getProgress().then(function (progress) {
                progress.step = stepNum;
                return ActStorageSrv.set(ONBOARDING_PATH, progress);
            });
        };

        function getProgress() {
            return ActStorageSrv.get(ONBOARDING_PATH).then(function (progress) {
                if (!progress.step) {
                    progress.step = 1;
                }
                return progress;
            });
        }

        this.isOnBoardingCompleted = function () {
            return getProgress().then(function (onBoardingProgress) {
                return onBoardingProgress.step === self.steps.ROADMAP;
            });
        };
    }]);
})(angular);
