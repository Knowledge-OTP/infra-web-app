/*jshint -W117 */
/*jshint unused:false*/
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').provider('OnBoardingService', [function () {
        this.$get = function (InfraConfigSrv, StorageSrv) {
            'ngInject';

            var self = this;
            var ONBOARDING_PATH = StorageSrv.variables.appUserSpacePath + '/' + 'onBoardingProgress';
            var onBoardingServiceObj = {};

            var onBoardingStates = {
                1: 'app.onBoarding.welcome',
                2: 'app.onBoarding.schools',
                3: 'app.onBoarding.goals',
                4: 'app.onBoarding.diagnostic',
                5: 'app.workouts.roadmap',
                6: 'app.onBoarding.introTestToTake',
                7: 'app.onBoarding.testToTake'
            };

            onBoardingServiceObj.steps = {
                WELCOME: 1,
                SCHOOLS: 2,
                GOALS: 3,
                DIAGNOSTIC: 4,
                ROADMAP: 5,
                INTRO_TEST_TO_TAKE: 6,
                TEST_TO_TAKE: 7
            };

            onBoardingServiceObj.getOnBoardingStep = function () {
                return getProgress().then(function (progress) {
                    return {
                        url: onBoardingStates[progress.step]
                    };
                });
            };

            onBoardingServiceObj.setOnBoardingStep = function (stepNum) {
                return getProgress().then(function (progress) {
                    progress.step = stepNum;
                    return setProgress(progress);
                });
            };
            onBoardingServiceObj.setPage = function (pageName) {
                ga('set', 'page', `/${pageName}.html`);
            };

            onBoardingServiceObj.sendPage = function () {
                ga('send', 'pageview');
            };

            onBoardingServiceObj.updatePage = function (pageName) {
                onBoardingServiceObj.setPage(pageName);
                onBoardingServiceObj.sendPage();
            };
            /**
             * sendEvent
             * @param eventCategory - Typically the object that was interacted with (e.g. 'Video')
             * @param eventAction - The type of interaction (e.g. 'play')
             * @param eventType - click etc.
             * @param isFb - use facebook event
             */
            onBoardingServiceObj.sendEvent = function (eventCategory, eventAction, eventType, isFb) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: eventCategory,
                    eventAction: eventType ? `${eventType}-${eventAction}` : eventAction,
                    eventLabel: 'Toefl Campaign',
                });
                if (isFb) {
                    fbq('track', eventAction);

                }
            };

            function getProgress() {
                return InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    return studentStorage.get(ONBOARDING_PATH).then(function (progress) {
                        if (!progress.step) {
                            progress.step = 1;
                        }
                        return progress;
                    });
                });
            }

            function setProgress(progress) {
                return InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    return studentStorage.set(ONBOARDING_PATH, progress);
                });
            }

            onBoardingServiceObj.getMarketingToefl = function () {
                var marketingPath = StorageSrv.variables.appUserSpacePath + `/marketing`;
                return InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    return studentStorage.get(marketingPath).then(function (marketing) {
                        return marketing;
                    });
                });
            };
            onBoardingServiceObj.isOnBoardingCompleted = function () {
                return getProgress().then(function (onBoardingProgress) {
                    return onBoardingProgress.step === onBoardingServiceObj.steps.ROADMAP;
                });
            };

            onBoardingServiceObj.getOnBoardingSettings = function () {
                return self.settings;
            };

            return onBoardingServiceObj;
        };
    }]);
})(angular);
