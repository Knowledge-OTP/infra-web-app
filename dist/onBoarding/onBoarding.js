(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'znk.infra.config',
        'znk.infra.analytics',
        'znk.infra.storage',
        'znk.infra.user',
        'ui.router',
        'ngMaterial',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.diagnosticIntro'
    ]).config([
        'SvgIconSrvProvider', '$stateProvider',
        function (SvgIconSrvProvider, $stateProvider) {
            var svgMap = {
                'on-boarding-heart': 'components/onBoarding/svg/onboarding-heart-icon.svg',
                'on-boarding-target': 'components/onBoarding/svg/onboarding-target-icon.svg',
                'on-boarding-hat': 'components/onBoarding/svg/onboarding-hat-icon.svg',
                'on-boarding-bubble-1': 'components/onBoarding/svg/onboarding-bubble-1.svg',
                'on-boarding-bubble-2': 'components/onBoarding/svg/onboarding-bubble-2.svg',
                'on-boarding-dropdown-arrow-icon': 'components/onBoarding/svg/dropdown-arrow.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);

            $stateProvider
                .state('app.onBoarding', {
                    url: '/onBoarding',
                    templateUrl: 'components/onBoarding/templates/onBoarding.template.html',
                    controller: 'OnBoardingController',
                    controllerAs: 'vm',
                    resolve: {
                        onBoardingStep: ['OnBoardingService', function (OnBoardingService) {
                            return OnBoardingService.getOnBoardingStep();
                        }]
                    }
                })
                .state('app.onBoarding.welcome', {
                    templateUrl: 'components/onBoarding/templates/onBoardingWelcome.template.html',
                    controller: 'OnBoardingWelcomesController',
                    controllerAs: 'vm',
                    resolve: {
                        userProfile: ['UserProfileService', function (UserProfileService) {
                            return UserProfileService.getProfile();
                        }]
                    }
                })
                .state('app.onBoarding.schools', {
                    templateUrl: 'components/onBoarding/templates/onBoardingSchools.template.html',
                    controller: 'OnBoardingSchoolsController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.goals', {
                    templateUrl: 'components/onBoarding/templates/onBoardingGoals.template.html',
                    controller: 'OnBoardingGoalsController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.diagnostic', {
                    templateUrl: 'components/onBoarding/templates/onBoardingDiagnostic.template.html',
                    controller: 'OnBoardingDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.introTestToTake', {
                    templateUrl: 'components/onBoarding/templates/onBoardingIntroTestToTake.template.html',
                    controller: 'OnBoardingIntroTestToTakeController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.testToTake', {
                    templateUrl: 'components/onBoarding/templates/onBoardingTestToTake.template.html',
                    controller: 'OnBoardingTestToTakeController',
                    controllerAs: 'vm'
                });
        }
    ]);

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', ["$state", "onBoardingStep", function($state, onBoardingStep) {
        'ngInject';
        $state.go(onBoardingStep.url);
    }]);
})(angular);

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

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingGoalsController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv',
        function ($state, OnBoardingService, znkAnalyticsSrv) {

            var onBoardingSettings = OnBoardingService.getOnBoardingSettings();
            this.userGoalsSetting = {
                recommendedGoalsTitle: true,
                hideTotalScore: onBoardingSettings ? onBoardingSettings.hideTotalScore : false,
                saveBtn: {
                    title: '.SAVE_AND_CONTINUE',
                    showSaveIcon: true
                }
            };

            this.saveGoals = function () {
                znkAnalyticsSrv.eventTrack({eventName: 'onBoardingGoalsStep'});
                var nextStep;
                var nextState;

                if (onBoardingSettings && onBoardingSettings.showTestToTake) {
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

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingIntroTestToTakeController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv',
        function ($state, OnBoardingService, znkAnalyticsSrv) {


            this.goToTestToTake = function () {
                znkAnalyticsSrv.eventTrack({eventName: 'onBoardingIntroTestToTakeStep'});
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.TEST_TO_TAKE);
                $state.go('app.onBoarding.testToTake');
            };
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingSchoolsController', ['$state', 'OnBoardingService', 'userGoalsSelectionService', 'znkAnalyticsSrv', '$timeout',
        function($state, OnBoardingService, userGoalsSelectionService, znkAnalyticsSrv, $timeout) {

            function _addEvent(clicked) {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'onBoardingSchoolsStep',
                    props: {
                        clicked: clicked
                    }
                });
            }

            function _goToGoalsState(newUserSchools, evtName) {
                _addEvent(evtName);
                userGoalsSelectionService.setDreamSchools(newUserSchools, true).then(function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.GOALS).then(function () {
                        $timeout(function () {
                            $state.go('app.onBoarding.goals');
                        });
                    });
                });
            }

            this.schoolSelectEvents = {
                onSave: function save(newUserSchools) {
                    _goToGoalsState(newUserSchools, 'Save and Continue');
                }
            };

            this.skipSelection = function () {
                _goToGoalsState([], 'I don\'t know yet');
            };
    }]);
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingTestToTakeController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv', 'ExerciseTypeEnum', 'ExerciseParentEnum', 'ENV',
        function ($state, OnBoardingService, znkAnalyticsSrv, ExerciseTypeEnum, ExerciseParentEnum, ENV) {
            this.completeExerciseDetails = {
                exerciseId: ENV.testToTakeExerciseId,
                exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
                exerciseParentId: ENV.testToTakeExamId,
                exerciseParentTypeId: ExerciseParentEnum.EXAM.enum,
                hideQuit:true,
                ignoreIntro: true
            };
            this.completeExerciseSettings = {
                continueAction: function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                    $state.go('app.onBoarding.diagnostic');
                },
                setOnBoardingSummaryStepAction: function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                }
            };
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingWelcomesController', ['userProfile', 'OnBoardingService', '$state', 'znkAnalyticsSrv',
        function (userProfile, OnBoardingService, $state, znkAnalyticsSrv) {

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
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('onBoardingBar', function OnBoardingBarDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/onBoarding/templates/onBoardingBar.template.html',
            scope: {
                step: '@'
            }
        };

        return directive;
    });

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding').run(["$rootScope", "OnBoardingService", "$state", function ($rootScope, OnBoardingService, $state) {
        'ngInject';
        var isOnBoardingCompleted = false;
        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState) {//eslint-disable-line
            if (isOnBoardingCompleted) {
                return;
            }

            var APP_WORKOUTS_STATE = 'app.workouts.roadmap';
            var isGoingToWorkoutsState = toState.name.indexOf(APP_WORKOUTS_STATE) !== -1;

            if (isGoingToWorkoutsState) {
                evt.preventDefault();

                OnBoardingService.isOnBoardingCompleted().then(function (_isOnBoardingCompleted) {
                    isOnBoardingCompleted = _isOnBoardingCompleted;

                    if (!isOnBoardingCompleted) {
                        var ON_BOARDING_STATE_NAME = 'app.onBoarding';
                        var isNotFromOnBoardingState = fromState.name.indexOf(ON_BOARDING_STATE_NAME) === -1;
                        if (isNotFromOnBoardingState) {
                            $state.go(ON_BOARDING_STATE_NAME);
                        }
                    } else {
                        $state.go(toState, toParams, {
                            reload: true
                        });
                    }
                });
            }
        });
    }]);

})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').provider('OnBoardingService', [function () {
        this.$get = ['InfraConfigSrv', 'StorageSrv', function (InfraConfigSrv, StorageSrv) {
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

            onBoardingServiceObj.isOnBoardingCompleted = function () {
                return getProgress().then(function (onBoardingProgress) {
                    return onBoardingProgress.step === onBoardingServiceObj.steps.ROADMAP;
                });
            };

            onBoardingServiceObj.getOnBoardingSettings = function () {
                return self.settings;
            };

            return onBoardingServiceObj;
        }];
    }]);
})(angular);

angular.module('znk.infra-web-app.onBoarding').run(['$templateCache', function ($templateCache) {
  $templateCache.put("components/onBoarding/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-bubble-1.svg",
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n" +
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 294.6 215.3\" style=\"enable-background:new 0 0 294.6 215.3;\" xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.st0{fill:#FFFFFF;}\n" +
    "	.st1{fill:#B899C8;}\n" +
    "	.st2{fill:#B99AD6;}\n" +
    "</style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M247.3,59.3c-0.9,0-1.8,0-2.7,0.1c-7.8-19.1-26.6-32.6-48.5-32.6c-7,0-13.7,1.4-19.8,3.9\n" +
    "		c-9.7-17.4-28.2-29.2-49.5-29.2c-21.2,0-39.7,11.7-49.4,29c-0.6,0-1.2,0-1.8,0c-40.9,0-74.1,26.4-74.1,59\n" +
    "		c0,31.3,30.5,56.9,69.1,58.9c3.1,15.1,20.7,26.7,42.1,26.7c10.9,0,20.8-3,28.3-7.9c10.1,7.9,23.2,12.7,37.6,12.7\n" +
    "		c24.5,0,45.4-14,53.9-33.7c4.6,1.5,9.6,2.4,14.8,2.4c25.3,0,45.8-20,45.8-44.6S272.6,59.3,247.3,59.3z\"/>\n" +
    "	<path class=\"st1\" d=\"M178.6,181.3c-13.7,0-27.1-4.4-37.7-12.4c-7.9,4.9-17.9,7.6-28.2,7.6c-21.4,0-39.4-11.2-43.3-26.7\n" +
    "		C30.4,147.3,0,120.9,0,89.5c0-33.4,33.9-60.5,75.6-60.5c0.3,0,0.6,0,0.9,0C86.9,11.1,106.1,0,126.8,0c20.7,0,39.8,11,50.2,28.8\n" +
    "		c6.1-2.3,12.5-3.5,19.1-3.5c21.6,0,41,12.7,49.5,32.6c0.6,0,1.2,0,1.7,0c26.1,0,47.3,20.7,47.3,46.1S273.4,150,247.3,150\n" +
    "		c-4.8,0-9.4-0.7-14-2.1C224,168.3,202.7,181.3,178.6,181.3z M141.1,165.2l0.8,0.7c10.2,8,23.2,12.4,36.7,12.4\n" +
    "		c23.4,0,44-12.9,52.5-32.8l0.5-1.3l1.3,0.4c4.6,1.5,9.4,2.3,14.3,2.3c24.4,0,44.3-19.3,44.3-43.1s-19.9-43.1-44.3-43.1\n" +
    "		c-0.8,0-1.6,0-2.6,0.1l-1.1,0.1l-0.4-1c-7.9-19.2-26.4-31.7-47.1-31.7c-6.6,0-13.1,1.3-19.2,3.8l-1.2,0.5l-0.6-1.2\n" +
    "		C165.3,13.9,146.8,3,126.8,3c-19.9,0-38.3,10.8-48.1,28.2L78.3,32l-1.5,0c-0.4,0-0.8,0-1.1,0C35.6,31.9,3,57.7,3,89.5\n" +
    "		c0,30.2,29.7,55.4,67.7,57.4l1.2,0.1l0.2,1.1c2.9,14.5,20.4,25.5,40.6,25.5c10.1,0,19.9-2.7,27.5-7.7L141.1,165.2z\"/>\n" +
    "</g>\n" +
    "<g>\n" +
    "	<circle class=\"st0\" cx=\"248.2\" cy=\"198.8\" r=\"15\"/>\n" +
    "	<path class=\"st1\" d=\"M248.2,215.3c-9.1,0-16.5-7.4-16.5-16.5s7.4-16.5,16.5-16.5c9.1,0,16.5,7.4,16.5,16.5S257.3,215.3,248.2,215.3\n" +
    "		z M248.2,185.3c-7.4,0-13.5,6.1-13.5,13.5s6.1,13.5,13.5,13.5s13.5-6.1,13.5-13.5S255.7,185.3,248.2,185.3z\"/>\n" +
    "</g>\n" +
    "<g>\n" +
    "	<path class=\"st2\" d=\"M78.7,87.1V106c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8V92.5l-4.6,6.4c-0.4,0.5-0.9,0.7-1.4,0.7h0h0\n" +
    "		c-0.6,0-1.1-0.3-1.5-0.7L63,92.5V106c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8V87.1c0-1,0.8-1.8,1.8-1.8c0,0,0,0,0.1,0\n" +
    "		c0.5,0,1.1,0.3,1.4,0.7l6.4,8.8l6.4-8.8c0.4-0.5,0.9-0.7,1.4-0.7c0,0,0,0,0,0C77.9,85.4,78.7,86.2,78.7,87.1z\"/>\n" +
    "	<path class=\"st2\" d=\"M99,99.8v6.3c0,0.9-0.8,1.7-1.7,1.7c-0.8,0-1.5-0.6-1.7-1.4c-1.2,0.9-2.7,1.4-4.3,1.4c-2.2,0-4.1-0.9-5.4-2.3\n" +
    "		c-1.4-1.5-2.2-3.5-2.2-5.6c0-2.2,0.8-4.2,2.2-5.6c1.4-1.5,3.3-2.4,5.4-2.4c1.6,0,3,0.5,4.3,1.4c0.2-0.8,0.8-1.4,1.7-1.4\n" +
    "		c0.9,0,1.7,0.8,1.7,1.7V99.8z M95.6,99.8c0-1.3-0.5-2.5-1.2-3.3c-0.8-0.9-1.9-1.3-3-1.3c-1.2,0-2.2,0.4-3,1.3\n" +
    "		c-0.8,0.8-1.2,2-1.2,3.3c0,1.3,0.4,2.5,1.2,3.3c0.7,0.8,1.8,1.2,3,1.2c1.1,0,2.2-0.4,3-1.2C95.1,102.2,95.6,101.1,95.6,99.8z\"/>\n" +
    "	<path class=\"st2\" d=\"M111.8,93.5c0,1-0.8,1.8-1.8,1.8h-0.8v8.9c1,0,1.8,0.8,1.8,1.8c0,1-0.8,1.8-1.8,1.8c-2,0-3.6-1.6-3.6-3.6v-8.9\n" +
    "		h-0.9c-1,0-1.8-0.8-1.8-1.8c0-1,0.8-1.8,1.8-1.8h0.9v-4.6c0-1,0.8-1.8,1.8-1.8c1,0,1.8,0.8,1.8,1.8v4.6h0.8\n" +
    "		C111,91.8,111.8,92.5,111.8,93.5z\"/>\n" +
    "	<path class=\"st2\" d=\"M119.7,106c0,1-0.8,1.8-1.8,1.8c-0.8,0-1.5-0.6-1.7-1.3c0-0.1-0.1-0.3-0.1-0.4V87.1c0-1,0.8-1.8,1.8-1.8\n" +
    "		c1,0,1.8,0.8,1.8,1.8v5.6c1-0.5,2.2-0.9,3.4-0.9c3.9,0,7,3.2,7,7v7.2c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8v-7.2\n" +
    "		c0-1.9-1.5-3.4-3.5-3.5c-1.9,0-3.4,1.6-3.4,3.5V106z\"/>\n" +
    "	<path class=\"st2\" d=\"M144.4,106V87.1c0-1,0.8-1.8,1.8-1.8c1,0,1.8,0.8,1.8,1.8v17.1h8.7c0.9,0,1.8,0.8,1.8,1.8c0,1-0.8,1.8-1.8,1.8\n" +
    "		h-10.4c-0.1,0-0.1,0-0.1,0c0,0,0,0,0,0C145.2,107.8,144.4,107,144.4,106z\"/>\n" +
    "	<path class=\"st2\" d=\"M160,99.8c0-4.4,3.4-8,7.8-8c4.2,0,7.5,3.1,7.7,7.4c0,0,0,0.1,0,0.2s0,0.2,0,0.3c-0.1,0.8-0.8,1.3-1.7,1.3\n" +
    "		h-10.2c0.2,0.7,0.5,1.6,1.1,2.1c0.7,0.8,2,1.3,3.1,1.4c1.2,0.1,2.5-0.2,3.3-0.8c0.7-0.7,2-0.6,2.4-0.1c0.4,0.4,0.7,1.4,0,2.1\n" +
    "		c-1.6,1.4-3.5,2.1-5.7,2.1C163.4,107.7,160.1,104.1,160,99.8z M163.5,98.2h9.1c-0.3-1.3-2-3.2-4.7-3.4\n" +
    "		C165.1,94.9,163.8,96.9,163.5,98.2z\"/>\n" +
    "	<path class=\"st2\" d=\"M191.8,94.3l-5.2,12.4c0,0.1-0.1,0.2-0.1,0.2c0,0,0,0,0,0c-0.1,0.1-0.1,0.2-0.2,0.2c0,0,0,0,0,0\n" +
    "		c-0.1,0.1-0.1,0.1-0.2,0.2c0,0,0,0,0,0c-0.1,0.1-0.1,0.1-0.2,0.2c0,0,0,0-0.1,0c0,0,0,0,0,0c-0.1,0-0.2,0-0.3,0.1c0,0,0,0-0.1,0\n" +
    "		c-0.1,0-0.2,0-0.3,0c-0.1,0-0.2,0-0.3,0c0,0,0,0-0.1,0c-0.1,0-0.2-0.1-0.3-0.1c0,0,0,0,0,0c-0.1,0-0.1,0-0.1,0\n" +
    "		c-0.1,0-0.2-0.1-0.3-0.2c0,0,0,0,0,0c-0.1-0.1-0.1-0.1-0.2-0.2c0,0,0,0-0.1,0c0-0.1-0.1-0.2-0.2-0.2c0,0,0,0,0,0\n" +
    "		c-0.1,0-0.1-0.1-0.1-0.2l-5.2-12.4c-0.4-0.9,0-1.8,0.9-2.2c0.8-0.4,1.8,0.1,2.1,0.9l3.7,8.7l3.7-8.7c0.4-0.9,1.3-1.3,2.1-0.9\n" +
    "		C191.8,92.5,192.2,93.5,191.8,94.3z\"/>\n" +
    "	<path class=\"st2\" d=\"M195.1,99.8c0-4.4,3.4-8,7.8-8c4.2,0,7.5,3.1,7.7,7.4c0,0,0,0.1,0,0.2s0,0.2,0,0.3c-0.1,0.8-0.8,1.3-1.7,1.3\n" +
    "		h-10.2c0.2,0.7,0.5,1.6,1.1,2.1c0.7,0.8,2,1.3,3.1,1.4c1.2,0.1,2.5-0.2,3.3-0.8c0.7-0.7,2-0.6,2.4-0.1c0.4,0.4,0.7,1.4,0,2.1\n" +
    "		c-1.6,1.4-3.5,2.1-5.7,2.1C198.5,107.7,195.1,104.1,195.1,99.8z M198.6,98.2h9.1c-0.3-1.3-2-3.2-4.7-3.4\n" +
    "		C200.2,94.9,198.8,96.9,198.6,98.2z\"/>\n" +
    "	<path class=\"st2\" d=\"M217,85.4c1,0,1.8,0.8,1.8,1.8V106c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8V87.1\n" +
    "		C215.3,86.2,216.1,85.4,217,85.4z\"/>\n" +
    "	<path class=\"st2\" d=\"M237.1,87.1V106c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8V90.3l-1.3,0.7c-0.3,0.2-0.6,0.3-0.9,0.3\n" +
    "		c-0.6,0-1.2-0.3-1.5-0.9c-0.5-0.8-0.3-1.9,0.6-2.4l3.9-2.3c0,0,0.1,0,0.1-0.1c0.1,0,0.1-0.1,0.2-0.1c0.1,0,0.1,0,0.2,0\n" +
    "		c0,0,0.1,0,0.1,0c0.1,0,0.2,0,0.2,0c0,0,0.1,0,0.1,0h0c0.1,0,0.2,0,0.2,0c0,0,0.1,0,0.1,0c0.1,0,0.1,0,0.2,0.1c0,0,0.1,0,0.1,0\n" +
    "		c0.1,0.1,0.1,0.1,0.2,0.1c0,0,0.1,0.1,0.1,0.1c0,0,0.1,0.1,0.1,0.1c0.1,0,0.1,0.1,0.1,0.1c0,0,0.1,0.1,0.1,0.1c0,0,0.1,0.1,0.1,0.1\n" +
    "		l0,0.1c0,0,0,0.1,0,0.1c0,0.1,0.1,0.1,0.1,0.2c0,0.1,0,0.1,0.1,0.2c0,0.1,0,0.1,0,0.2C237,86.9,237,87,237.1,87.1\n" +
    "		C237.1,87.1,237.1,87.1,237.1,87.1z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-bubble-2.svg",
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n" +
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 294.6 215.3\" style=\"enable-background:new 0 0 294.6 215.3;\" xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.st0{fill:#FFFFFF;}\n" +
    "	.st1{fill:#8E6FAB;}\n" +
    "</style>\n" +
    "<g>\n" +
    "	<circle class=\"st0\" cx=\"20.7\" cy=\"197.8\" r=\"15\"/>\n" +
    "	<path class=\"st1\" d=\"M20.7,214.3c-9.1,0-16.5-7.4-16.5-16.5s7.4-16.5,16.5-16.5s16.5,7.4,16.5,16.5S29.8,214.3,20.7,214.3z\n" +
    "		 M20.7,184.3c-7.4,0-13.5,6.1-13.5,13.5s6.1,13.5,13.5,13.5s13.5-6.1,13.5-13.5S28.2,184.3,20.7,184.3z\"/>\n" +
    "</g>\n" +
    "<path class=\"st1\" d=\"M153.8,197c-19.5,0-37.8-6.9-50.5-19.1c-4.6,1.5-9.4,2.2-14.2,2.2c-25.4,0-46.1-20.5-46.6-45.8\n" +
    "	c-22.1-3.6-38.6-22.8-38.6-45.4c0-25.4,20.6-46,46-46c1.7,0,3.3,0.1,5,0.3C62.7,18.9,85.6,2,111.3,2c17.4,0,33.7,7.5,45,20.7\n" +
    "	c11.9-7.9,26.7-12.3,42-12.3c36.8,0,66.7,24.7,66.7,55c0,5.2-0.9,10.4-2.7,15.4c16.6,9.9,26.8,27.9,26.8,47.2c0,30.3-24.7,55-55,55\n" +
    "	c-9.7,0-19.3-2.6-27.6-7.5C193.9,189,174.3,197,153.8,197z M104.3,173.3l0.9,0.9c12,11.9,29.7,18.8,48.6,18.8\n" +
    "	c20.1,0,39.1-7.9,50.9-21.2l1.1-1.3l1.4,0.9c8.1,5,17.4,7.7,27,7.7c28.1,0,51-22.9,51-51c0-18.5-10-35.6-26.2-44.6l-1.5-0.9L258,81\n" +
    "	c2-5,3-10.3,3-15.6c0-28.1-28.1-51-62.7-51c-15.2,0-29.8,4.5-41.2,12.6l-1.5,1.1l-1.2-1.5C143.8,13.5,128.2,6,111.3,6\n" +
    "	C86.8,6,65,22.4,58.3,46l-0.5,1.7L56,47.4c-2-0.3-4.1-0.5-6.2-0.5c-23.1,0-42,18.8-42,42c0,21.2,15.8,39.1,36.8,41.6l1.8,0.2\n" +
    "	l-0.1,2.2c0,0.2,0,0.3,0,0.5c0,23.5,19.1,42.6,42.6,42.6c4.8,0,9.5-0.8,14-2.4L104.3,173.3z\"/>\n" +
    "<g>\n" +
    "	<path class=\"st1\" d=\"M73.9,89.4v18.9c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8V94.8l-4.6,6.4c-0.4,0.5-0.9,0.7-1.4,0.7h0h0\n" +
    "		c-0.6,0-1.1-0.3-1.5-0.7l-4.6-6.4v13.5c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8V89.4c0-1,0.8-1.8,1.8-1.8c0,0,0,0,0.1,0\n" +
    "		c0.5,0,1.1,0.3,1.4,0.7l6.4,8.8l6.4-8.8c0.4-0.5,0.9-0.7,1.4-0.7c0,0,0,0,0,0C73,87.7,73.9,88.5,73.9,89.4z\"/>\n" +
    "	<path class=\"st1\" d=\"M94.2,102.1v6.3c0,0.9-0.8,1.7-1.7,1.7c-0.8,0-1.5-0.6-1.7-1.4c-1.2,0.9-2.7,1.4-4.3,1.4\n" +
    "		c-2.2,0-4.1-0.9-5.4-2.3c-1.4-1.5-2.2-3.5-2.2-5.6c0-2.2,0.8-4.2,2.2-5.6c1.4-1.5,3.3-2.4,5.4-2.4c1.6,0,3,0.5,4.3,1.4\n" +
    "		c0.2-0.8,0.8-1.4,1.7-1.4c0.9,0,1.7,0.8,1.7,1.7V102.1z M90.8,102.1c0-1.3-0.5-2.5-1.2-3.3c-0.8-0.9-1.9-1.3-3-1.3\n" +
    "		c-1.2,0-2.2,0.4-3,1.3c-0.8,0.8-1.2,2-1.2,3.3c0,1.3,0.4,2.5,1.2,3.3c0.7,0.8,1.8,1.2,3,1.2c1.1,0,2.2-0.4,3-1.2\n" +
    "		C90.3,104.6,90.8,103.4,90.8,102.1z\"/>\n" +
    "	<path class=\"st1\" d=\"M107,95.8c0,1-0.8,1.8-1.8,1.8h-0.8v8.9c1,0,1.8,0.8,1.8,1.8c0,1-0.8,1.8-1.8,1.8c-2,0-3.6-1.6-3.6-3.6v-8.9\n" +
    "		h-0.9c-1,0-1.8-0.8-1.8-1.8c0-1,0.8-1.8,1.8-1.8h0.9v-4.6c0-1,0.8-1.8,1.8-1.8c1,0,1.8,0.8,1.8,1.8v4.6h0.8\n" +
    "		C106.2,94.1,107,94.8,107,95.8z\"/>\n" +
    "	<path class=\"st1\" d=\"M114.9,108.3c0,1-0.8,1.8-1.8,1.8c-0.8,0-1.5-0.6-1.7-1.3c0-0.1-0.1-0.3-0.1-0.4V89.4c0-1,0.8-1.8,1.8-1.8\n" +
    "		c1,0,1.8,0.8,1.8,1.8V95c1-0.5,2.2-0.9,3.4-0.9c3.9,0,7,3.2,7,7v7.2c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8v-7.2\n" +
    "		c0-1.9-1.5-3.4-3.5-3.5c-1.9,0-3.4,1.6-3.4,3.5V108.3z\"/>\n" +
    "	<path class=\"st1\" d=\"M139.6,108.3V89.4c0-1,0.8-1.8,1.8-1.8c1,0,1.8,0.8,1.8,1.8v17.1h8.7c0.9,0,1.8,0.8,1.8,1.8\n" +
    "		c0,1-0.8,1.8-1.8,1.8h-10.4c-0.1,0-0.1,0-0.1,0c0,0,0,0,0,0C140.4,110.1,139.6,109.3,139.6,108.3z\"/>\n" +
    "	<path class=\"st1\" d=\"M155.2,102.1c0-4.4,3.4-8,7.8-8c4.2,0,7.5,3.1,7.7,7.4c0,0,0,0.1,0,0.2s0,0.2,0,0.3c-0.1,0.8-0.8,1.3-1.7,1.3\n" +
    "		h-10.2c0.2,0.7,0.5,1.6,1.1,2.1c0.7,0.8,2,1.3,3.1,1.4c1.2,0.1,2.5-0.2,3.3-0.8c0.7-0.7,2-0.6,2.4-0.1c0.4,0.4,0.7,1.4,0,2.1\n" +
    "		c-1.6,1.4-3.5,2.1-5.7,2.1C158.6,110,155.2,106.4,155.2,102.1z M158.7,100.5h9.1c-0.3-1.3-2-3.2-4.7-3.4\n" +
    "		C160.3,97.2,158.9,99.2,158.7,100.5z\"/>\n" +
    "	<path class=\"st1\" d=\"M187,96.6l-5.2,12.4c0,0.1-0.1,0.2-0.1,0.2c0,0,0,0,0,0c-0.1,0.1-0.1,0.2-0.2,0.2c0,0,0,0,0,0\n" +
    "		c-0.1,0.1-0.1,0.1-0.2,0.2c0,0,0,0,0,0c-0.1,0.1-0.1,0.1-0.2,0.2c0,0,0,0-0.1,0c0,0,0,0,0,0c-0.1,0-0.2,0-0.3,0.1c0,0,0,0-0.1,0\n" +
    "		c-0.1,0-0.2,0-0.3,0c-0.1,0-0.2,0-0.3,0c0,0,0,0-0.1,0c-0.1,0-0.2-0.1-0.3-0.1c0,0,0,0,0,0c-0.1,0-0.1,0-0.1,0\n" +
    "		c-0.1,0-0.2-0.1-0.3-0.2c0,0,0,0,0,0c-0.1-0.1-0.1-0.1-0.2-0.2c0,0,0,0-0.1,0c0-0.1-0.1-0.2-0.2-0.2c0,0,0,0,0,0\n" +
    "		c-0.1,0-0.1-0.1-0.1-0.2l-5.2-12.4c-0.4-0.9,0-1.8,0.9-2.2c0.8-0.4,1.8,0.1,2.1,0.9l3.7,8.7l3.7-8.7c0.4-0.9,1.3-1.3,2.1-0.9\n" +
    "		C187,94.8,187.4,95.8,187,96.6z\"/>\n" +
    "	<path class=\"st1\" d=\"M190.3,102.1c0-4.4,3.4-8,7.8-8c4.2,0,7.5,3.1,7.7,7.4c0,0,0,0.1,0,0.2s0,0.2,0,0.3c-0.1,0.8-0.8,1.3-1.7,1.3\n" +
    "		h-10.2c0.2,0.7,0.5,1.6,1.1,2.1c0.7,0.8,2,1.3,3.1,1.4c1.2,0.1,2.5-0.2,3.3-0.8c0.7-0.7,2-0.6,2.4-0.1c0.4,0.4,0.7,1.4,0,2.1\n" +
    "		c-1.6,1.4-3.5,2.1-5.7,2.1C193.7,110,190.3,106.4,190.3,102.1z M193.7,100.5h9.1c-0.3-1.3-2-3.2-4.7-3.4\n" +
    "		C195.3,97.2,194,99.2,193.7,100.5z\"/>\n" +
    "	<path class=\"st1\" d=\"M212.2,87.7c1,0,1.8,0.8,1.8,1.8v18.9c0,1-0.8,1.8-1.8,1.8c-1,0-1.8-0.8-1.8-1.8V89.4\n" +
    "		C210.5,88.5,211.3,87.7,212.2,87.7z\"/>\n" +
    "	<path class=\"st1\" d=\"M240.1,108.3c0,1-0.8,1.8-1.8,1.8H227c0,0,0,0,0,0h0c-0.5,0-1-0.2-1.3-0.6c-0.7-0.7-0.6-1.8,0.1-2.5l9.5-8.6\n" +
    "		c0.9-0.8,1.3-1.9,1.3-3.1c0-1-0.4-2-1.1-2.8c-0.8-0.9-2-1.3-3.1-1.3c-1,0-2,0.4-2.8,1.1l-1,0.9c-0.7,0.7-1.8,0.6-2.5-0.1\n" +
    "		c-0.6-0.7-0.6-1.8,0.1-2.5l1-0.9c1.4-1.3,3.3-2,5.2-2c2.1,0,4.2,0.9,5.7,2.5c1.3,1.4,2,3.3,2,5.2c0,2.1-0.9,4.2-2.5,5.7l-6,5.5h6.8\n" +
    "		C239.3,106.5,240.1,107.3,240.1,108.3z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-hat-icon.svg",
    "<svg class=\"on-boarding-hat-svg\"\n" +
    "     version=\"1.1\" id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-366 104.4 57.2 34.6\"\n" +
    "     style=\"enable-background:new -366 104.4 57.2 34.6;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.on-boarding-hat-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "        width: 47px;\n" +
    "    }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M-339.5,139.1c-9.8,0-15.9-5.6-16-5.7c-0.2-0.2-0.3-0.5-0.3-0.7v-11.2c0-0.6,0.4-1,1-1s1,0.4,1,1v10.7\n" +
    "		c2.1,1.7,13.5,10.2,30-0.1v-10.6c0-0.6,0.4-1,1-1s1,0.4,1,1v11.2c0,0.3-0.2,0.7-0.5,0.8C-328.7,137.7-334.6,139.1-339.5,139.1z\"/>\n" +
    "	<path class=\"st0\" d=\"M-338.7,128.5c-0.1,0-0.3,0-0.4-0.1l-26.1-10.5c-0.4-0.2-0.7-0.6-0.7-1.1c0-0.5,0.3-0.9,0.7-1.1l26.5-11.2\n" +
    "		c0.3-0.1,0.6-0.1,0.9,0l26.6,11.2c0.4,0.2,0.7,0.6,0.7,1.1c0,0.5-0.3,0.9-0.7,1.1l-27,10.5C-338.4,128.4-338.6,128.5-338.7,128.5z\n" +
    "		 M-361.7,116.8l23,9.3l23.9-9.3l-23.5-9.9L-361.7,116.8z\"/>\n" +
    "	<path class=\"st0\" d=\"M-312.8,126.5c-0.6,0-1-0.4-1-1v-8c0-0.6,0.4-1,1-1s1,0.4,1,1v8C-311.8,126.1-312.2,126.5-312.8,126.5z\"/>\n" +
    "	<path class=\"st0\" d=\"M-312,130.5c-1.7,0-3.1-1.4-3.1-3.1c0-1.7,1.4-3.1,3.1-3.1s3.1,1.4,3.1,3.1\n" +
    "		C-308.9,129.1-310.3,130.5-312,130.5z M-312,126.7c-0.4,0-0.7,0.3-0.7,0.7s0.3,0.7,0.7,0.7s0.7-0.3,0.7-0.7S-311.6,126.7-312,126.7\n" +
    "		z\"/>\n" +
    "	<path class=\"st0\" d=\"M-315,132.7l1.5-2.7c0.6-1.1,2.2-1.1,2.9,0l1.5,2.7c0.6,1.1-0.2,2.5-1.4,2.5h-3.1\n" +
    "		C-314.8,135.2-315.6,133.8-315,132.7z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-heart-icon.svg",
    "<svg class=\"on-boarding-heart-svg\"\n" +
    "     version=\"1.1\"\n" +
    "     id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-377 106.7 35.9 31.3\"\n" +
    "     style=\"enable-background:new -377 106.7 35.9 31.3;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.on-boarding-heart-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "    }\n" +
    "    </style>\n" +
    "\n" +
    "<path class=\"st0\" d=\"M-359,138c-0.2,0-0.4-0.1-0.6-0.2c-0.1,0-0.1-0.1-0.2-0.1l-0.2-0.2c-4.3-4-8.8-7.9-13.2-11.6\n" +
    "	c-3.1-2.7-4.4-6.5-3.6-10.4c0.9-4,4-7.5,7.7-8.6c3.4-1,6.9,0,10,2.9c3.1-2.9,6.7-3.9,10.1-2.9c3.7,1.1,6.7,4.4,7.6,8.5\n" +
    "	c0.9,3.9-0.4,7.8-3.6,10.5c-6.5,5.5-11.4,10-13,11.5l-0.3,0.2C-358.5,137.9-358.7,138-359,138z M-366.6,108.2\n" +
    "	c-0.7,0-1.4,0.1-2.1,0.3c-3.2,0.9-5.8,3.9-6.6,7.4c-0.4,2-0.6,5.8,3.1,8.9c4.4,3.7,8.8,7.6,13.2,11.6l0,0c1.6-1.5,6.6-6,13-11.6\n" +
    "	c2.7-2.3,3.8-5.6,3.1-9c-0.8-3.5-3.4-6.4-6.5-7.3c-3.1-0.9-6.3,0.2-9.1,3c-0.1,0.1-0.3,0.2-0.5,0.2c0,0,0,0,0,0\n" +
    "	c-0.2,0-0.4-0.1-0.5-0.2C-361.8,109.3-364.2,108.2-366.6,108.2z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-target-icon.svg",
    "<svg class=\"on-boarding-target-svg\"\n" +
    "     version=\"1.1\"\n" +
    "     id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-378 104 35 35\"\n" +
    "     style=\"enable-background:new -378 104 35 35;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.on-boarding-target-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M-361,134.6c-7.5,0-13.5-6.1-13.5-13.5s6.1-13.5,13.5-13.5c7.5,0,13.5,6.1,13.5,13.5S-353.5,134.6-361,134.6z\n" +
    "		 M-361,108.8c-6.8,0-12.3,5.5-12.3,12.3c0,6.8,5.5,12.3,12.3,12.3s12.3-5.5,12.3-12.3C-348.7,114.3-354.2,108.8-361,108.8z\"/>\n" +
    "	<path class=\"st0\" d=\"M-361,129c-4.4,0-7.9-3.6-7.9-7.9c0-4.4,3.6-7.9,7.9-7.9c4.4,0,7.9,3.6,7.9,7.9\n" +
    "		C-353.1,125.5-356.6,129-361,129z M-361,114.4c-3.7,0-6.7,3-6.7,6.7c0,3.7,3,6.7,6.7,6.7s6.7-3,6.7-6.7\n" +
    "		C-354.3,117.4-357.3,114.4-361,114.4z\"/>\n" +
    "	<path class=\"st0\" d=\"M-361,139c-0.6,0-1-0.4-1-1v-33c0-0.6,0.4-1,1-1s1,0.4,1,1v33C-360,138.6-360.4,139-361,139z\"/>\n" +
    "	<path class=\"st0\" d=\"M-344,122h-33c-0.6,0-1-0.4-1-1s0.4-1,1-1h33c0.6,0,1,0.4,1,1S-343.4,122-344,122z\"/>\n" +
    "	<circle class=\"st0\" cx=\"-360.9\" cy=\"121.3\" r=\"1.9\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoarding.template.html",
    "<div class=\"on-board\">\n" +
    "    <div class=\"container base-border-radius base-box-shadow\" ui-view></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingBar.template.html",
    "<div class=\"on-board-pager-wrap\">\n" +
    "    <div class=\"on-board-pager\">\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'heart-circle-selected': step === 'welcome'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-heart\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'target-circle-selected': step === 'goals'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-target\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'hat-circle-selected': step === 'diagnostic'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-hat\"></svg-icon>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingDiagnostic.template.html",
    "<section class=\"step diagnostic\" translate-namespace=\"ON_BOARDING.DIAGNOSTIC\">\n" +
    "    <div class=\"diagnostic-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "    <diagnostic-intro></diagnostic-intro>\n" +
    "    <div class=\"btn-wrap\">\n" +
    "        <md-button aria-label=\"{{'ON_BOARDING.DIAGNOSTIC.TAKE_IT_LATER' | translate}}\"\n" +
    "            tabindex=\"2\" class=\"default sm\" ng-click=\"vm.setOnboardingCompleted('app.workouts.roadmap', 'Take It Later')\">\n" +
    "            <span translate=\".TAKE_IT_LATER\"></span>\n" +
    "        </md-button>\n" +
    "        <md-button aria-label=\"{{'ON_BOARDING.DIAGNOSTIC.START_TEST' | translate}}\"\n" +
    "            autofocus tabindex=\"1\" class=\"md-sm znk md-primary\" ng-click=\"vm.setOnboardingCompleted('app.diagnostic', 'Start Test')\">\n" +
    "            <span translate=\".START_TEST\"></span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"diagnostic\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingGoals.template.html",
    "<section class=\"step\" translate-namespace=\"ON_BOARDING.GOALS\">\n" +
    "    <div class=\"goals\">\n" +
    "        <div class=\"main-title\" translate=\".SET_SCORE_GOALS\"></div>\n" +
    "        <user-goals on-save=\"vm.saveGoals()\" setting=\"vm.userGoalsSetting\"></user-goals>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"goals\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingIntroTestToTake.template.html",
    "<section class=\"step intro-test-to-take\" translate-namespace=\"ON_BOARDING.TEST_TO_TAKE\">\n" +
    "    <div class=\"diagnostic-title\" translate=\".FIGURE_OUT\"></div>\n" +
    "\n" +
    "    <div class=\"diagnostic-intro-drv\">\n" +
    "        <div class=\"description\">\n" +
    "            <div class=\"diagnostic-text\"\n" +
    "                 translate=\"{{'.FIGURE_OUT_DESC' | translate}}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"icons-section\">\n" +
    "        <div class=\"icon-wrapper\">\n" +
    "            <svg-icon class=\"on-boarding-bubble\"  name=\"on-boarding-bubble-1\"></svg-icon>\n" +
    "            <span class=\"diagnostic-text-or\" translate=\".OR\">or</span>\n" +
    "            <svg-icon class=\"on-boarding-bubble\"  name=\"on-boarding-bubble-2\"></svg-icon>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"raccoon-img-container\">\n" +
    "        <div class=\"raccoon-img-wrapper\">\n" +
    "            <div class=\"diagnostic-raccoon\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"btn-wrap\">\n" +
    "\n" +
    "        <md-button aria-label=\"{{'.START_TEST' | translate}}\"\n" +
    "                   autofocus tabindex=\"1\" class=\"md-sm znk md-primary\"\n" +
    "                   ng-click=\"vm.goToTestToTake()\">\n" +
    "            <span translate=\".START_TEST\"></span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"diagnostic\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingSchools.template.html",
    "<section class=\"step\" translate-namespace=\"ON_BOARDING.GOALS\">\n" +
    "    <div class=\"goals\">\n" +
    "        <div class=\"main-title\" translate=\".SET_SCORE_GOALS\"></div>\n" +
    "        <div class=\"sub-title\" translate=\".WHATS_YOUR_DREAM_SCHOOL\"></div>\n" +
    "        <div class=\"select-schools-title\" translate=\".SELECT_3_DREAM_SCHOOLS\"></div>\n" +
    "        <school-select user-schools=\"vm.userSchools\"\n" +
    "                       events=\"vm.schoolSelectEvents\">\n" +
    "        </school-select>\n" +
    "        <div class=\"light-title\" ng-click=\"vm.skipSelection()\" translate=\".I_DONT_KNOW\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"bg-wrap\">\n" +
    "        <div class=\"thinking-raccoon\"></div>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"goals\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingTestToTake.template.html",
    "<div class=\"complete-exercise-container base-border-radius\">\n" +
    "    <complete-exercise exercise-details=\"vm.completeExerciseDetails\"\n" +
    "                       settings=\"vm.completeExerciseSettings\">\n" +
    "    </complete-exercise>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingWelcome.template.html",
    "<section class=\"step make-padding\" translate-namespace=\"ON_BOARDING.WELCOME\">\n" +
    "    <div class=\"welcome\">\n" +
    "        <div class=\"main-title\">\n" +
    "            <span translate=\".WELCOME\"></span>,\n" +
    "            <span class=\"user-name\">{{vm.username}}!</span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\">\n" +
    "            <div translate=\".THANK_YOU_MESSAGE\"></div>\n" +
    "            <span translate=\".ZINKERZ_APP_WELCOME_TEXT\"></span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\" translate=\".WE_ARE_HERE_TO_HELP\"></div>\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <md-button aria-label=\"{{'ON_BOARDING.WELCOME.CONTINUE' | translate}}\"\n" +
    "                autofocus tabindex=\"1\" class=\"md-primary znk inline-block\" ng-click=\"vm.nextStep()\" ng-cloak>\n" +
    "                <div class=\"btn-text\">\n" +
    "                    <span translate=\".CONTINUE\" class=\"continue-title\"></span>\n" +
    "                    <svg-icon name=\"on-boarding-dropdown-arrow-icon\" class=\"dropdown-arrow-icon\"></svg-icon>\n" +
    "                </div>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"smile-raccoon\"></div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"welcome\"></on-boarding-bar>\n" +
    "");
}]);
