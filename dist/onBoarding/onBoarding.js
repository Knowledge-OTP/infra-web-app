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
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.diagnosticDrv'
    ]).config([
        'SvgIconSrvProvider', '$stateProvider',
        function (SvgIconSrvProvider, $stateProvider) {
            var svgMap = {
                'plus-icon': 'components/onBoarding/svg/plus-icon.svg',
                'on-boarding-heart': 'components/onBoarding/svg/onboarding-heart-icon.svg',
                'on-boarding-target': 'components/onBoarding/svg/onboarding-target-icon.svg',
                'on-boarding-hat': 'components/onBoarding/svg/onboarding-hat-icon.svg',
                'dropdown-arrow-icon': 'components/onBoarding/svg/dropdown-arrow.svg',
                'search-icon': 'components/onBoarding/svg/search-icon.svg',
                'arrow-icon': 'components/onBoarding/svg/arrow-icon.svg',
                'info-icon': 'components/onBoarding/svg/info-icon.svg',
                'v-icon': 'components/onBoarding/svg/v-icon.svg',
                'math-section-icon': 'components/onBoarding/svg/math-section-icon.svg',
                'verbal-icon': 'components/onBoarding/svg/verbal-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);

            $stateProvider
                .state('onBoarding', {
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
                .state('onBoarding.welcome', {
                    url: '/welcome',
                    templateUrl: 'components/onBoarding/templates/onBoardingWelcome.template.html',
                    controller: 'OnBoardingWelcomesController',
                    controllerAs: 'vm',
                    resolve: {
                        userProfile: ['UserProfileService', function (UserProfileService) {
                            return UserProfileService.getProfile();
                        }]
                    }
                })
                .state('onBoarding.schools', {
                    url: '/schools',
                    templateUrl: 'components/onBoarding/templates/onBoardingSchools.template.html',
                    controller: 'OnBoardingSchoolsController',
                    controllerAs: 'vm'
                })
                .state('onBoarding.goals', {
                    url: '/goals',
                    templateUrl: 'components/onBoarding/templates/onBoardingGoals.template.html',
                    controller: 'OnBoardingGoalsController',
                    controllerAs: 'vm'
                })
                .state('onBoarding.diagnostic', {
                    url: '/diagnostic',
                    templateUrl: 'components/onBoarding/templates/onBoardingDiagnostic.template.html',
                    controller: 'OnBoardingDiagnosticController',
                    controllerAs: 'vm'
                });
        }
    ]);

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', ['$state', 'onBoardingStep', '$translatePartialLoader', function($state, onBoardingStep, $translatePartialLoader) {
        $translatePartialLoader.addPart('onBoarding');
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
        function($state, OnBoardingService, znkAnalyticsSrv) {
            this.userGoalsSetting = {
                recommendedGoalsTitle: true,
                saveBtn: {
                    title: '.SAVE_AND_CONTINUE',
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

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingSchoolsController', ['$state', 'OnBoardingService', 'UserSchoolsService', 'znkAnalyticsSrv', '$timeout',
        function($state, OnBoardingService, UserSchoolsService, znkAnalyticsSrv, $timeout) {

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
                UserSchoolsService.setDreamSchools(newUserSchools, true).then(function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.GOALS).then(function () {
                        $timeout(function () {
                            $state.go('onBoarding.goals');
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
                    nextState = 'onBoarding.schools';
                } else {
                    nextStep = OnBoardingService.steps.GOALS;
                    nextState = 'onBoarding.goals';
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
    angular.module('znk.infra-web-app.onBoarding').provider('OnBoardingService', [function() {
        this.$get = ['InfraConfigSrv', 'StorageSrv', function(InfraConfigSrv, StorageSrv) {
            var self = this;
            var ONBOARDING_PATH = StorageSrv.variables.appUserSpacePath + '/' + 'onBoardingProgress';
            var onBoardingServiceObj = {};

            var onBoardingUrls = {
                1: 'onBoarding.welcome',
                2: 'onBoarding.schools',
                3: 'onBoarding.goals',
                4: 'onBoarding.diagnostic',
                5: 'workouts.roadmap'
            };

            onBoardingServiceObj.steps = {
                WELCOME: 1,
                SCHOOLS: 2,
                GOALS: 3,
                DIAGNOSTIC: 4,
                ROADMAP: 5
            };

            onBoardingServiceObj.getOnBoardingStep = function () {
                return getProgress().then(function (progress) {
                    return {
                        url: onBoardingUrls[progress.step]
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
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.get(ONBOARDING_PATH).then(function (progress) {
                        if (!progress.step) {
                            progress.step = 1;
                        }
                        return progress;
                    });
                });
            }

            function setProgress(progress) {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.set(ONBOARDING_PATH, progress);
                });
            }

            onBoardingServiceObj.isOnBoardingCompleted = function () {
                return getProgress().then(function (onBoardingProgress) {
                    return onBoardingProgress.step === self.steps.ROADMAP;
                });
            };

            onBoardingServiceObj.getOnBoardingSettings = function() {
                return self.settings;
            };

            return onBoardingServiceObj;
        }];
    }]);
})(angular);

angular.module('znk.infra-web-app.onBoarding').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/onBoarding/svg/arrow-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-468.2 482.4 96 89.8\" class=\"arrow-icon-wrapper\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .arrow-icon-wrapper .st0{fill:#109BAC;}\n" +
    "        .arrow-icon-wrapper .st1{fill:none;stroke:#fff;stroke-width:5.1237;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "    <path class=\"st0\" d=\"M-417.2,572.2h-6.2c-24.7,0-44.9-20.2-44.9-44.9v0c0-24.7,20.2-44.9,44.9-44.9h6.2c24.7,0,44.9,20.2,44.9,44.9\n" +
    "    v0C-372.2,552-392.5,572.2-417.2,572.2z\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-442.8\" y1=\"527.3\" x2=\"-401.4\" y2=\"527.3\"/>\n" +
    "        <line class=\"st1\" x1=\"-401.4\" y1=\"527.3\" x2=\"-414.3\" y2=\"514.4\"/>\n" +
    "        <line class=\"st1\" x1=\"-401.4\" y1=\"527.3\" x2=\"-414.3\" y2=\"540.2\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/info-icon.svg",
    "<svg\n" +
    "    version=\"1.1\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-497 499 28 28\"\n" +
    "    class=\"info-icon\">\n" +
    "<style type=\"text/css\">\n" +
    "	.info-icon .st0{fill:none;stroke:#0A9BAD; stroke-width:2;}\n" +
    "	.info-icon .st2{fill:#0A9BAD;}\n" +
    "</style>\n" +
    "<g>\n" +
    "	<circle class=\"st0\" cx=\"-483\" cy=\"513\" r=\"13.5\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st2\" d=\"M-485.9,509.2h3.9v8.1h3v1.2h-7.6v-1.2h3v-6.9h-2.4V509.2z M-483.5,505.6h1.5v1.9h-1.5V505.6z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/math-section-icon.svg",
    "<svg\n" +
    "    class=\"math-section-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-554 409.2 90 83.8\">\n" +
    "    <g>\n" +
    "        <path d=\"M-491.4,447.3c-3,0-6.1,0-9.1,0c-2.9,0-4.7-1.8-4.7-4.7c0-6.1,0-12.1,0-18.2c0-2.9,1.8-4.7,4.7-4.7c6,0,12,0,18,0\n" +
    "		c2.8,0,4.7,1.9,4.7,4.7c0,6.1,0,12.1,0,18.2c0,2.8-1.8,4.6-4.6,4.6C-485.4,447.4-488.4,447.3-491.4,447.3z M-491.4,435.5\n" +
    "		c2.5,0,5,0,7.5,0c1.6,0,2.5-0.8,2.4-2c-0.1-1.5-1.1-1.9-2.4-1.9c-5,0-10.1,0-15.1,0c-1.6,0-2.6,0.8-2.5,2c0.2,1.4,1.1,1.9,2.5,1.9\n" +
    "		C-496.5,435.5-494,435.5-491.4,435.5z\"/>\n" +
    "        <path d=\"M-526.6,447.3c-3,0-6,0-8.9,0c-3,0-4.7-1.8-4.8-4.8c0-6,0-11.9,0-17.9c0-3,1.9-4.8,4.9-4.8c5.9,0,11.8,0,17.7,0\n" +
    "		c3.1,0,4.9,1.8,4.9,4.8c0,6,0,11.9,0,17.9c0,3.1-1.8,4.8-4.9,4.8C-520.6,447.4-523.6,447.3-526.6,447.3z M-526.4,443.5\n" +
    "		c1.3-0.1,2-0.9,2-2.2c0.1-1.5,0.1-3,0-4.5c0-1.1,0.4-1.4,1.4-1.4c1.4,0.1,2.8,0,4.1,0c1.3,0,2.2-0.5,2.2-1.9c0.1-1.3-0.8-2-2.3-2\n" +
    "		c-1.4,0-2.8-0.1-4.1,0c-1.2,0.1-1.6-0.4-1.5-1.6c0.1-1.4,0-2.8,0-4.1c0-1.3-0.6-2.2-1.9-2.2c-1.4,0-2,0.8-2,2.2c0,1.5,0,3,0,4.5\n" +
    "		c0,1-0.3,1.3-1.3,1.3c-1.5,0-3,0-4.5,0c-1.3,0-2.2,0.6-2.2,2c0,1.4,0.9,1.9,2.2,1.9c1.5,0,3,0,4.5,0c1.1,0,1.4,0.4,1.4,1.4\n" +
    "		c-0.1,1.5,0,3,0,4.5C-528.4,442.6-527.8,443.3-526.4,443.5z\"/>\n" +
    "        <path d=\"M-526.5,454.9c3,0,6,0,8.9,0c3,0,4.8,1.8,4.8,4.8c0,6,0,12,0,18c0,2.9-1.8,4.7-4.7,4.7c-6.1,0-12.1,0-18.2,0\n" +
    "		c-2.8,0-4.6-1.9-4.6-4.6c0-6.1,0-12.1,0-18.2c0-2.9,1.8-4.6,4.7-4.7C-532.5,454.8-529.5,454.9-526.5,454.9z M-526.7,471.1\n" +
    "		c1.6,1.7,2.9,3,4.2,4.3c0.9,0.9,1.9,1.2,3,0.3c1-0.8,0.9-1.9-0.2-3.1c-1-1.1-2.1-2.1-3.2-3.2c-0.6-0.6-0.6-1.1,0-1.7\n" +
    "		c1-1,2-1.9,2.9-2.9c1.3-1.3,1.4-2.4,0.4-3.3c-0.9-0.8-2-0.7-3.2,0.5c-1.2,1.3-2.3,2.6-3.8,4.3c-1.5-1.7-2.6-3-3.8-4.2\n" +
    "		c-1.2-1.3-2.4-1.4-3.3-0.5c-1,0.9-0.8,2,0.5,3.3c1.2,1.2,2.4,2.4,3.8,3.8c-1.4,1.4-2.7,2.6-3.9,3.8c-1.2,1.2-1.3,2.3-0.3,3.2\n" +
    "		c0.9,0.9,2,0.8,3.2-0.4C-529.2,473.9-528.1,472.6-526.7,471.1z\"/>\n" +
    "        <path d=\"M-505.2,468.5c0-3,0-6,0-8.9c0-2.9,1.7-4.7,4.7-4.7c6.1,0,12.1,0,18.2,0c2.9,0,4.6,1.8,4.7,4.7c0,6,0,12,0,18\n" +
    "		c0,2.8-1.9,4.7-4.7,4.7c-6.1,0-12.1,0-18.2,0c-2.8,0-4.6-1.8-4.6-4.6C-505.3,474.7-505.2,471.6-505.2,468.5z M-491.4,476\n" +
    "		c2.5,0,5,0,7.5,0c1.3,0,2.3-0.5,2.4-1.9c0.1-1.3-0.8-2.1-2.4-2.1c-5,0-10.1,0-15.1,0c-1.6,0-2.6,0.9-2.5,2.1\n" +
    "		c0.2,1.4,1.1,1.9,2.5,1.9C-496.5,476-494,476-491.4,476z M-491.4,461.2c-2.5,0-5.1,0-7.6,0c-1.6,0-2.6,0.8-2.5,2\n" +
    "		c0.2,1.4,1.1,1.9,2.5,1.9c5,0,10.1,0,15.1,0c1.3,0,2.3-0.4,2.4-1.9c0.1-1.3-0.8-2-2.4-2C-486.4,461.2-488.9,461.2-491.4,461.2z\"/>\n" +
    "    </g>\n" +
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
  $templateCache.put("components/onBoarding/svg/plus-icon.svg",
    "<svg class=\"plus-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 16 16\"\n" +
    "    style=\"enable-background:new 0 0 16 16;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.plus-svg .st0, .plus-svg .st1 {\n" +
    "        fill: none;\n" +
    "        stroke: #0a9bad;\n" +
    "        stroke-width: 2;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<line class=\"st0\" x1=\"8\" y1=\"1\" x2=\"8\" y2=\"15\"/>\n" +
    "<line class=\"st1\" x1=\"1\" y1=\"8\" x2=\"15\" y2=\"8\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/search-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-314.8 416.5 97.5 99.1\" class=\"search-icon-wrapper\">\n" +
    "<style type=\"text/css\">\n" +
    "	.search-icon-wrapper .st0{fill:none;stroke:#231F20;stroke-width:5;stroke-miterlimit:10;}\n" +
    "	.search-icon-wrapper .st1{fill:none;stroke:#231F20;stroke-width:5;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<circle class=\"st0\" cx=\"-279.1\" cy=\"452.3\" r=\"33.2\"/>\n" +
    "<line class=\"st1\" x1=\"-255.3\" y1=\"477.6\" x2=\"-219.8\" y2=\"513.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/v-icon.svg",
    "<svg class=\"v-icon-wrapper\" x=\"0px\" y=\"0px\" viewBox=\"0 0 334.5 228.7\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .v-icon-wrapper .st0{\n" +
    "            fill:#ffffff;\n" +
    "            stroke:#ffffff;\n" +
    "            stroke-width:26;\n" +
    "            stroke-linecap:round;\n" +
    "            stroke-linejoin:round;\n" +
    "            stroke-miterlimit:10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"13\" y1=\"109.9\" x2=\"118.8\" y2=\"215.7\"/>\n" +
    "	<line class=\"st0\" x1=\"118.8\" y1=\"215.7\" x2=\"321.5\" y2=\"13\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/verbal-icon.svg",
    "<svg\n" +
    "    class=\"verbal-icon-svg\"\n" +
    "    version=\"1.1\"\n" +
    "    id=\"Layer_1\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-586.4 16.3 301.4 213.6\">\n" +
    "<style type=\"text/css\">\n" +
    "	.verbal-icon-svg .st0{fill:none;}\n" +
    "</style>\n" +
    "<path d=\"M-546.8,113.1c0-20.2,0-40.3,0-60.5c0-7.8,0.9-9.1,8.7-8c11.5,1.5,22.9,3.7,34.3,6.1c3.5,0.7,6.8,2.7,10,4.3\n" +
    "	c6.3,3.2,9.2,7.7,9.1,15.5c-0.5,36.6-0.2,73.3-0.2,110c0,8.6-1.3,9.5-9.4,6.7c-15.1-5.2-30.4-8.6-46.5-5.6c-3.6,0.7-5.4-1.1-5.9-4.4\n" +
    "	c-0.2-1.5-0.1-3-0.1-4.5C-546.8,152.7-546.8,132.9-546.8,113.1z M-526.4,142.5c-1.7,0-2.5,0-3.3,0c-3.2,0-6.4,0.2-6.5,4.3\n" +
    "	c-0.1,4.1,3,4.6,6.3,4.5c9.9-0.2,18.9,2.8,27.4,7.8c2.6,1.6,5.1,1.8,6.9-1c1.8-3,0.1-5-2.4-6.5C-507.1,146.2-516.7,143-526.4,142.5z\n" +
    "	 M-529.3,66.9c0.2,0-0.3,0-0.8,0c-3.1,0.2-6.3,0.6-6.1,4.8c0.2,3.9,3.2,4,6.2,4c9.7-0.1,18.6,2.8,26.9,7.7c2.6,1.6,5.4,2.5,7.4-0.7\n" +
    "	c2.1-3.3-0.1-5.2-2.7-6.8C-507.8,70.4-517.8,67.2-529.3,66.9z M-526.6,117.3c-1.8,0-2.6,0-3.5,0c-3.2,0-6.3,0.5-6.2,4.6\n" +
    "	c0.1,3.8,3,4.1,6.1,4.1c9.9,0,18.9,2.8,27.4,7.8c2.8,1.7,5.5,2,7.2-1.2c1.6-3.1-0.4-4.9-2.9-6.4C-507.4,121-517.1,117.7-526.6,117.3\n" +
    "	z M-527.2,92.3c-1.5,0-3-0.1-4.5,0c-2.9,0.2-5.2,1.8-4.4,4.7c0.4,1.6,3.1,3.7,4.7,3.7c10.3,0.1,19.7,2.8,28.5,8\n" +
    "	c2.8,1.6,5.5,2.1,7.3-1.1c1.7-3.1-0.4-5-2.9-6.4C-507.3,95.9-516.8,92.6-527.2,92.3z\"/>\n" +
    "<path class=\"st0\" />\n" +
    "<g>\n" +
    "	<path d=\"M-391.9,156.9l-20,5c-1.1,0.3-2-0.5-1.7-1.7l5-20c0.4-1.5,2.2-2.3,3.1-1.4l15.1,15.1C-389.6,154.7-390.5,156.5-391.9,156.9\n" +
    "		z\"/>\n" +
    "	<path d=\"M-299.8,34.6l13.9,13.9c1.2,1.2,1.2,3.2,0,4.5l-5.9,5.9c-1.2,1.2-3.2,1.2-4.5,0l-13.9-13.9c-1.2-1.2-1.2-3.2,0-4.5l5.9-5.9\n" +
    "		C-303,33.3-301,33.3-299.8,34.6z\"/>\n" +
    "	<path d=\"M-384.3,150.6l85.5-85.5c1-1,1.2-2.5,0.5-3.2l-15.5-15.5c-0.8-0.8-2.2-0.5-3.2,0.5l-85.5,85.5c-1,1-1.2,2.5-0.5,3.2\n" +
    "		l15.5,15.5C-386.7,151.8-385.3,151.6-384.3,150.6z\"/>\n" +
    "</g>\n" +
    "<g>\n" +
    "	<path d=\"M-355.7,129.9c-0.6,0.6-0.9,1.3-0.9,2.1c0,19.4-0.1,38.8,0.1,58.1c0.1,5.5-1.4,7.1-7.1,7.5c-31.1,2-61.3,8.9-90.6,19.6\n" +
    "		c-3.8,1.4-7,1.5-10.9,0.1c-29.9-10.8-60.7-17.9-92.5-19.8c-4.3-0.3-5.5-1.7-5.5-5.7c0.1-52.7,0.1-105.5,0-158.2\n" +
    "		c0-4.5,1.6-6.1,6-6.1c30.5-0.2,60.1,4,88.6,15.5c4.1,1.7,4.5,4.1,4.5,7.9c-0.1,46.5-0.1,93.1-0.1,139.6c0,1.7-0.5,3.7,0.1,5.1\n" +
    "		c0.9,1.8,2.6,3.3,4,4.9c1.6-1.7,3.5-3.1,4.5-5c0.7-1.3,0.2-3.4,0.2-5.1c0-46.3,0.1-92.6-0.1-138.9c0-4.8,1.3-7,5.9-8.8\n" +
    "		c27.7-11.2,56.5-15,86.1-15.1c5.4,0,6.9,1.9,6.9,7.1c-0.1,9.7-0.2,33.9-0.2,39.7c0,0.8,0.9,1.3,1.5,0.8l21.8-20.9\n" +
    "		c0.7-0.5,1.1-1.3,1.1-2.1c0-11.1-0.9-11.6-13.4-13.1c0-2.8,0.1-5.7,0-8.6c-0.2-7.9-4-12.9-11.9-13.2c-11.7-0.5-23.5-0.2-35.3,0.7\n" +
    "		c-21.9,1.7-42.9,7.2-63.3,15.4c-2.4,1-5.9,0.5-8.4-0.5c-27.3-11.3-55.9-15.6-85.2-16.4c-3.6-0.1-7.3,0.1-10.9,0.6\n" +
    "		c-9.1,1.2-12.8,5.3-13,14.3c-0.1,2.5,0,5,0,7.7c-4.7,0.5-8.6,1-12.6,1.5v181.4c3.6,0.3,7.2,1,10.8,1c28.1,0.1,56.2-0.3,84.2,0.3\n" +
    "		c7.7,0.2,15.5,2.4,22.9,5c6,2.1,11.3,2.9,17.1,0c8.6-4.2,17.7-5.5,27.4-5.3c26.8,0.4,53.6,0.1,80.4,0.1c9.4,0,11.3-1.9,11.4-11.2\n" +
    "		c0-31.6-1.6-68.3-1.7-100.3c0-1.4-1.6-2-2.6-1.1C-341.7,115.3-352.5,126.8-355.7,129.9z\"/>\n" +
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
    "        <md-button tabindex=\"2\" class=\"default sm\" ng-click=\"vm.setOnboardingCompleted('app.workouts.roadmap', 'Take It Later')\">\n" +
    "            <span translate=\".TAKE_IT_LATER\"></span>\n" +
    "        </md-button>\n" +
    "        <md-button autofocus tabindex=\"1\" class=\"md-sm primary\" ng-click=\"vm.setOnboardingCompleted('app.workouts.diagnostic', 'Start Test')\">\n" +
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
  $templateCache.put("components/onBoarding/templates/onBoardingWelcome.template.html",
    "<section class=\"step make-padding\" translate-namespace=\"ON_BOARDING.WELCOME\">\n" +
    "    <div class=\"welcome\">\n" +
    "        <div class=\"main-title\">\n" +
    "            <span translate=\".WELCOME\"></span>,\n" +
    "            <span class=\"user-name\">{{vm.username}}!</span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\">\n" +
    "            <div translate=\".THANK_YOU_MESSAGE\"></div>\n" +
    "            <span translate=\".ZINKERZ_ACT\"></span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\" translate=\".WE_ARE_HERE_TO_HELP\"></div>\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <md-button autofocus tabindex=\"1\" class=\"md primary inline-block\"\n" +
    "                       ng-click=\"vm.nextStep()\">\n" +
    "                <span translate=\".CONTINUE\" class=\"continue-title\"></span>\n" +
    "                <svg-icon name=\"dropdown-arrow-icon\"\n" +
    "                          class=\"dropdown-arrow-icon inline-block\">\n" +
    "                </svg-icon>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"smile-raccoon\"></div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"welcome\"></on-boarding-bar>\n" +
    "");
}]);
