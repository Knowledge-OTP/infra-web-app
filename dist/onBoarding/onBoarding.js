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
                    controller: 'OnBoardingTestToTakeController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.testToTake', {
                    templateUrl: 'components/onBoarding/templates/onBoardingTestToTake.template.html',
                    controller: 'OnBoardingIntroTestToTakeController',
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
                saveBtn: {
                    title: '.SAVE_AND_CONTINUE',
                    showSaveIcon: true
                }
            };

            this.saveGoals = function () {
                znkAnalyticsSrv.eventTrack({eventName: 'onBoardingGoalsStep'});
                var nextStep;
                var nextState;

                if (onBoardingSettings.showTestToTake) {
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
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingTestToTakeController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv', 'ExerciseTypeEnum', 'ExerciseParentEnum',
        function ($state, OnBoardingService, znkAnalyticsSrv, ExerciseTypeEnum, ExerciseParentEnum) {
            this.completeExerciseDetails = {
                exerciseId: 1173,
                exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
                exerciseParentId: 43,
                exerciseParentTypeId: ExerciseParentEnum.EXAM.enum
            };
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingWelcomesController', ['userProfile', 'OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(userProfile, OnBoardingService, $state, znkAnalyticsSrv) {

            var onBoardingSettings = OnBoardingService.getOnBoardingSettings();
            this.username = userProfile.nickname || '';

            this.nextStep = function () {
                var nextStep;
                var nextState;
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingWelcomeStep' });
                if (onBoardingSettings.showSchoolStep) {
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
                6: 'app.onBoarding.testToTake',
                7: 'app.onBoarding.recommendedTest'
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

angular.module('znk.infra-web-app.onBoarding').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/onBoarding/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
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
    "<section class=\"step diagnostic\" translate-namespace=\"ON_BOARDING.TEST_TO_TAKE\">\n" +
    "    <div class=\"diagnostic-title\" translate=\".FIGURE_OUT\"></div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"btn-wrap\">\n" +
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
    "                       >\n" +
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
