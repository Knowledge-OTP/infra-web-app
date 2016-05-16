(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config', []).config([
        function($translateProvider){
            $translateProvider.useLoader('$translatePartialLoader', {
                urlTemplate: '/i18n/{part}/{lang}.json'
            });
        }
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm', [
        'pascalprecht.translate',
        'znk.infra.svgIcon'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'login-form-envelope': 'components/loginForm/svg/login-form-envelope.svg',
                'login-form-lock': 'components/loginForm/svg/login-form-lock.svg' 
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'ui.router'
    ]).config([
        'SvgIconSrvProvider', '$stateProvider',
        function (SvgIconSrvProvider, $stateProvider) {
            var svgMap = {
                'plus-icon': 'components/onBoarding/svg/plus-icon.svg',
                'on-boarding-heart': 'components/onBoarding/svg/on-boarding-heart.svg',
                'on-boarding-target': 'components/onBoarding/svg/on-boarding-target.svg',
                'on-boarding-hat': 'components/onBoarding/svg/on-boarding-hat.svg',
                'dropdown-arrow-icon': 'components/onBoarding/svg/dropdown-arrow.svg',
                'search-icon': 'components/onBoarding/svg/search-icon.svg',
                'arrow-icon': 'components/onBoarding/svg/arrow-icon.svg',
                'info-icon': 'components/onBoarding/svg/info-icon.svg',
                'v-icon': 'components/onBoarding/svg/v-icon.svg'
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
                        userProfile: function (UserProfileService) {
                            return UserProfileService.getProfile();
                        }
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
    ]).run(['$translatePartialLoader', function ($translatePartialLoader) {
        $translatePartialLoader.addPart('onBoarding');
    }]);

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('InfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var InfraConfigSrv = {};

                    return InfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.config').run(['$templateCache', function($templateCache) {

}]);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').directive('loginForm', [
        '$translatePartialLoader', 'LoginFormSrv',
        function ($translatePartialLoader, LoginFormSrv) {
            return {
                templateUrl: 'components/loginForm/templates/loginForm.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginForm');

                    scope.vm = {};

                    scope.vm.submit = function(){
                        LoginFormSrv.login(scope.vm.formData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').service('LoginFormSrv', [
        'ENV', '$http', '$window',
        function (ENV, $http, $window) {
            this.login = function(loginData){
                var ref = new Firebase(ENV.fbGlobalEndPoint);
                return ref.authWithPassword(loginData).then(function(authData){
                    var postUrl = ENV.backendEndpoint + 'firebase/token';
                    var postData = {
                        email: authData.password ? authData.password.email : '',
                        uid: authData.uid,
                        fbDataEndPoint: ENV.fbDataEndPoint,
                        fbEndpoint: ENV.fbGlobalEndPoint,
                        auth: ENV.dataAuthSecret,
                        token: authData.token
                    };

                    return $http.post(postUrl, postData).then(function (token) {
                        var refDataDB = new Firebase(ENV.fbDataEndPoint);
                        refDataDB.authWithCustomToken(token.data).then(function(){
                            var appUrl = ENV.redirectLogin;
                            $window.location.replace(appUrl);
                        });
                    });
                });
            };
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.loginForm').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/loginForm/svg/login-form-envelope.svg",
    "<svg\n" +
    "    class=\"login-form-envelope-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 190.2 143.7\">\n" +
    "    <style>\n" +
    "        .login-form-envelope-svg{\n" +
    "            width: 20px;\n" +
    "            stroke: #CACACA;\n" +
    "            fill: none;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M174.7,141.2H15.4c-7.1,0-12.9-5.8-12.9-12.9V15.4c0-7.1,5.8-12.9,12.9-12.9h159.3c7.1,0,12.9,5.8,12.9,12.9\n" +
    "		v112.8C187.7,135.3,181.9,141.2,174.7,141.2z\"/>\n" +
    "	<path class=\"st0\" d=\"M4.1,7.3l77.3,75.1c7.6,7.4,19.8,7.4,27.4,0l77.3-75.1\"/>\n" +
    "	<line class=\"st0\" x1=\"77\" y1=\"78\" x2=\"7.7\" y2=\"135.5\"/>\n" +
    "	<line class=\"st0\" x1=\"112.8\" y1=\"78\" x2=\"182.1\" y2=\"135.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginForm/svg/login-form-lock.svg",
    "<svg class=\"locked-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .locked-svg{\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginForm/templates/loginForm.directive.html",
    "<ng-form novalidate class=\"login-form-container\" translate-namespace=\"LOGIN_FORM\" ng-submit=\"vm.submit()\">\n" +
    "    <div class=\"title\"\n" +
    "         translate=\".LOGIN\">\n" +
    "    </div>\n" +
    "    <div class=\"inputs-container\">\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"login-form-envelope\"></svg-icon>\n" +
    "            <input type=\"text\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                   name=\"email\"\n" +
    "                   ng-model=\"vm.formData.email\">\n" +
    "        </div>\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"login-form-lock\"></svg-icon>\n" +
    "            <input type=\"password\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.PASSWORD' | translate}}\"\n" +
    "                   name=\"password\"\n" +
    "                   ng-model=\"vm.formData.password\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"submit-btn-wrapper\">\n" +
    "        <button type=\"submit\" translate=\".LOGIN_IN\"></button>\n" +
    "    </div>\n" +
    "    <div class=\"forgot-pwd-wrapper\">\n" +
    "        <span translate=\".FORGOT_PWD\"></span>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth-title\" translate=\".CONNECT_WITH\"></div>\n" +
    "    </div>\n" +
    "</ng-form>\n" +
    "");
}]);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', ['$state', 'onBoardingStep', function($state, onBoardingStep) {
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
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingWelcomesController', ['userProfile', 'OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(userProfile, OnBoardingService, $state, znkAnalyticsSrv) {

            this.username = userProfile.nickname || '';

            this.nextStep = function () {
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingWelcomeStep' });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.GOALS);//   todo(dream school)
                // $state.go('app.onBoarding.schools');todo(dream school)
                $state.go('app.onBoarding.goals');
            };
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('goalSelect', function GoalSelectDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/goalSelect/goalSelect.template.html',
            require: 'ngModel',
            scope: {},
            link: function link(scope, element, attrs, ngModelCtrl) {
                scope.MAX_SCORE = 800;
                scope.MIN_SCORE = 200;

                scope.updateGoal = function (add) {
                    scope.target += add;
                    if (scope.target < scope.MIN_SCORE) {
                        scope.target = scope.MIN_SCORE;
                    } else if (scope.target > scope.MAX_SCORE) {
                        scope.target = scope.MAX_SCORE;
                    }

                    if (angular.isFunction(scope.onChange)) {
                        scope.onChange();
                    }
                    ngModelCtrl.$setViewValue(scope.target);
                };

                ngModelCtrl.$render = function () {
                    scope.target = ngModelCtrl.$viewValue;
                };
            }
        };

        return directive;
    });

})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('onBoardingBar', function OnBoardingBarDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/onBoardingBar/onBoardingBar.template.html',
            scope: {
                step: '@'
            }
        };

        return directive;
    });

})(angular);


/**
 *  attrs:
 *      events:
 *          onSave
 * */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('schoolSelect', ['UserSchoolsService', '$filter', 'UtilitySrv', '$timeout', '$q',
        function SchoolSelectDirective(UserSchoolsService, $filter, UtilitySrv, $timeout, $q) {
            'ngInject';

            var schoolList = [];

            var directive = {
                restrict: 'E',
                templateUrl: 'app/components/schoolSelect/schoolSelect.template.html',
                scope: {
                    events: '=?',
                    getSelectedSchools: '&?'
                },
                link: function link(scope, element, attrs) {
                    var MIN_LENGTH_AUTO_COMPLETE = 3;
                    var MAX_SCHOOLS_SELECT = 3;
                    var tagsInputEmptyPlaceHolder = $filter('translate')('SCHOOL_SELECT.SELECT_3_SCHOOLS');
                    var userSchools;

                    function disableSearchOption() {
                        if (scope.d.userSchools.length >= MAX_SCHOOLS_SELECT) {
                            element.find('input').attr('disabled', true);
                        } else {
                            element.find('input').removeAttr('disabled');
                        }
                    }

                    function _getTagsInputModelCtrl() {
                        var tagsInputElement = element.find('tags-input');
                        if (tagsInputElement) {
                            var tagsInputElementData = tagsInputElement.data();
                            if (tagsInputElementData.$ngModelController) {
                                scope.d.tagsInputNgModelCtrl = tagsInputElementData.$ngModelController;
                            }
                        }
                    }

                    scope.d = {
                        minLengthAutoComplete: MIN_LENGTH_AUTO_COMPLETE,
                        loadOnEmpty: false,
                        actions: {}
                    };

                    if (!scope.events) {
                        scope.events = {};
                    }
                    var eventsDefault = {
                        onSave: angular.noop
                    };
                    UtilitySrv.object.extendWithoutOverride(scope.events, eventsDefault);

                    //  added in order to provide custom selected schools
                    var getSelectedSchoolsProm;
                    if (attrs.getSelectedSchools) {
                        getSelectedSchoolsProm = $q.when(scope.getSelectedSchools());
                    } else {
                        getSelectedSchoolsProm = UserSchoolsService.getDreamSchools();
                    }
                    getSelectedSchoolsProm.then(function (_userSchools) {
                        userSchools = _userSchools;
                        scope.d.userSchools = angular.copy(userSchools);
                        scope.d.placeholder = scope.d.userSchools.length ? ' ' : tagsInputEmptyPlaceHolder;
                        disableSearchOption();
                    });

                    UserSchoolsService.getAppSchoolsList().then(function (schools) {
                        schoolList = schools.data;
                    });

                    scope.d.onTagAdding = function ($tag) {
                        if (!$tag.id) {
                            return false;
                        }
                        $tag.text = $tag.text.replace(/([-])/g, ' ');
                        scope.d.placeholder = ' ';
                        return scope.d.userSchools.length < MAX_SCHOOLS_SELECT;
                    };

                    scope.d.onTagAdded = function () {
                        disableSearchOption();
                        return true;
                    };

                    scope.d.onTagRemoved = function () {
                        if (!scope.d.userSchools.length) {
                            scope.d.placeholder = tagsInputEmptyPlaceHolder;
                        }
                        disableSearchOption();
                        return true;
                    };

                    scope.d.querySchools = function ($query) {
                        if ($query.length < 3) {
                            return [];
                        }
                        var resultsArr = schoolList.filter(function (school) {
                            return school.text.toLowerCase().indexOf($query.toLowerCase()) > -1;
                        });
                        if (!resultsArr.length) {
                            resultsArr = [{
                                text: $filter('translate')('SCHOOL_SELECT.NO_RESULTS')
                            }];
                        }
                        return resultsArr;
                    };

                    scope.d.save = function () {
                        if (!scope.d.tagsInputNgModelCtrl) {
                            _getTagsInputModelCtrl();
                        }
                        scope.d.tagsInputNgModelCtrl.$setPristine();

                        scope.events.onSave(scope.d.userSchools);
                    };

                    $timeout(function () {
                        _getTagsInputModelCtrl();
                    });
                }
            };

            return directive;
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('userGoals',['UserGoalsService', '$filter', '$timeout', 'UserSchoolsService', '$q',
        function UserGoalsDirective(UserGoalsService, $filter, $timeout, UserSchoolsService, $q) {

            var directive = {
                restrict: 'E',
                templateUrl: 'app/components/userGoals/userGoals.template.html',
                scope: {
                    onSave: '&?',
                    setting: '='
                },
                link: function link(scope) {
                    var translateFilter = $filter('translate');
                    var defaultTitle = translateFilter('USER_GOALS.SAVE');
                    var userGoalRef;
                    scope.saveTitle = scope.setting.saveBtn.title || defaultTitle;

                    UserGoalsService.getGoals().then(function (userGoals) {
                        userGoalRef = userGoals;
                        scope.userGoals = angular.copy(userGoals);
                    });

                    var getDreamSchoolsProm = UserSchoolsService.getDreamSchools().then(function (userSchools) {
                        scope.userSchools = angular.copy(userSchools);
                    });
                    scope.getSelectedSchools = function () {
                        return getDreamSchoolsProm.then(function () {
                            return scope.userSchools;
                        });
                    };

                    scope.showSchools = function () {
                        scope.showSchoolEdit = !scope.showSchoolEdit;
                    };

                    scope.calcTotal = function () {
                        var goals = scope.userGoals;
                        goals.totalScore = goals.verbal + goals.math;
                        return goals.totalScore;
                    };

                    scope.saveChanges = function () {
                        var saveUserSchoolsProm = UserSchoolsService.setDreamSchools(scope.userSchools);

                        angular.extend(userGoalRef, scope.userGoals);
                        var saveUserGoalsProm = UserGoalsService.setGoals(userGoalRef);

                        $q.all([
                            saveUserSchoolsProm,
                            saveUserGoalsProm
                        ]).then(function () {
                            if (angular.isFunction(scope.onSave)) {
                                scope.onSave();
                            }

                            if (scope.setting.saveBtn.afterSaveTitle) {
                                scope.saveTitle = scope.setting.saveBtn.afterSaveTitle;
                                scope.showVIcon = true;
                                $timeout(function () {
                                    scope.saveTitle = defaultTitle;
                                    scope.showVIcon = false;
                                }, 3000);
                            }
                        });
                    };

                    scope.schoolSelectEvents = {
                        onSave: function (newUserDreamSchools) {
                            scope.showSchoolEdit = false;
                            scope.userSchools = newUserDreamSchools;

                            UserGoalsService.calcCompositeScore(newUserDreamSchools).then(function (newUserGoals) {
                                scope.userGoals = newUserGoals;
                            });
                        }
                    };
                }
            };

            return directive;
        }]);
})(angular);

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
  $templateCache.put("components/onBoarding/templates/goalSelect.template.html",
    "<div class=\"action-btn minus\" ng-click=\"updateGoal(-10)\" ng-show=\"target > MIN_SCORE\">\n" +
    "    <svg-icon name=\"plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "<div class=\"goal\">{{target}}</div>\n" +
    "<div class=\"action-btn plus\" ng-click=\"updateGoal(10)\" ng-show=\"target < MAX_SCORE\">\n" +
    "    <svg-icon name=\"plus-icon\"></svg-icon>\n" +
    "</div>\n" +
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
  $templateCache.put("components/onBoarding/templates/schoolSelect.template.html",
    "<div class=\"school-selector\" translate-namespace=\"SCHOOL_SELECT\">\n" +
    "    <div class=\"selector\">\n" +
    "        <div class=\"tag-input-wrap\">\n" +
    "            <div class=\"search-icon-container\">\n" +
    "                <svg-icon name=\"search-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <tags-input ng-model=\"d.userSchools\"\n" +
    "                        text=\"d.text\"\n" +
    "                        key-property=\"id\"\n" +
    "                        placeholder=\"{{d.placeholder}}\"\n" +
    "                        allow-leftover-text=\"true\"\n" +
    "                        add-from-autocomplete-only=\"true\"\n" +
    "                        on-tag-adding=\"d.onTagAdding($tag)\"\n" +
    "                        on-tag-added=\"d.onTagAdded()\"\n" +
    "                        on-tag-removed=\"d.onTagRemoved()\"\n" +
    "                        max-tags=\"3\"\n" +
    "                        template=\"tag-input-template\">\n" +
    "                <auto-complete source=\"d.querySchools($query)\"\n" +
    "                               debounce-delay=\"100\"\n" +
    "                               display-property=\"text\"\n" +
    "                               max-results-to-show=\"9999\"\n" +
    "                               highlight-matched-text=\"true\"\n" +
    "                               min-length=\"{{d.minLengthAutoComplete}}\"\n" +
    "                               load-on-focus=\"true\"\n" +
    "                               template=\"auto-complete-template\">\n" +
    "                </auto-complete>\n" +
    "            </tags-input>\n" +
    "            <button class=\"select-btn go-btn\"\n" +
    "                    ng-click=\"d.save()\"\n" +
    "                    title=\"{{::'SCHOOL_SELECT.SELECT_TO_CONTINUE' | translate}}\"\n" +
    "                    ng-disabled=\"d.tagsInputNgModelCtrl.$pristine\">\n" +
    "                <svg-icon name=\"arrow-icon\"\n" +
    "                          class=\"arrow-icon\">\n" +
    "                </svg-icon>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<script type=\"text/ng-template\" id=\"auto-complete-template\">\n" +
    "    <div ng-show=\"$index==0\" class=\"list-title\">\n" +
    "        <div class=\"list-left-panel\" translate=\".SCHOOLS\"></div>\n" +
    "        <div class=\"list-right-panel\" translate=\".REQUIRED_SCORE\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"left-panel\">\n" +
    "        {{::data.text}}\n" +
    "        <span class=\"location\">{{::data.city}}, {{::data.state}}</span>\n" +
    "    </div>\n" +
    "    <div class=\"right-panel\">\n" +
    "        {{::data.total25th}}{{data.total75th == 'N/A' ? '' : '-' + data.total75th}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "<script type=\"text/ng-template\" id=\"tag-input-template\">\n" +
    "    <div class=\"tag-wrap\">\n" +
    "        <span title=\"{{data.text}}\">{{data.text | cutString: 15}}</span>\n" +
    "        <a class=\"remove-button\" ng-click=\"$removeTag()\">&#10006;</a>\n" +
    "    </div>\n" +
    "</script>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/userGoals.template.html",
    "<section translate-namespace=\"USER_GOALS\">\n" +
    "    <!-- dream school is currently disabled todo(dream school)-->\n" +
    "    <!--<div class=\"title-wrap\">-->\n" +
    "        <!--<div class=\"edit-title\" translate=\".DREAM_SCHOOLS\"></div>-->\n" +
    "        <!--<div class=\"edit-link\" ng-click=\"showSchools()\" ng-class=\"{'active' : showSchoolEdit}\">-->\n" +
    "            <!--<span translate=\".EDIT\" class=\"edit\"></span>-->\n" +
    "            <!--<span translate=\".CANCEL\" class=\"cancel\"></span>-->\n" +
    "        <!--</div>-->\n" +
    "    <!--</div>-->\n" +
    "    <!--<div class=\"selected-schools-container\" ng-switch=\"userSchools.length\">-->\n" +
    "        <!--<div ng-switch-when=\"0\"-->\n" +
    "             <!--class=\"no-school-selected\"-->\n" +
    "             <!--translate=\".I_DONT_KNOW\"></div>-->\n" +
    "        <!--<div ng-switch-default class=\"selected-schools\">-->\n" +
    "            <!--<div ng-repeat=\"school in userSchools\" class=\"school\">{{school.text}}</div>-->\n" +
    "        <!--</div>-->\n" +
    "    <!--</div>-->\n" +
    "    <div class=\"subject-wrap\">\n" +
    "        <div class=\"blur-wrap\"></div>\n" +
    "        <div class=\"goals-title\" ng-show=\"setting.recommendedGoalsTitle\">\n" +
    "            <div class=\"recommended-title\" translate=\".RECOMMENDED_GOALS\"></div>\n" +
    "            <div class=\"info-wrap\">\n" +
    "                <md-tooltip md-visible=\"vm.showTooltip\" md-direction=\"top\" class=\"goals-info md-whiteframe-2dp\">\n" +
    "                    <div translate=\".GOALS_INFO\" class=\"top-text\"></div>\n" +
    "                </md-tooltip>\n" +
    "                <svg-icon class=\"info-icon\" name=\"info-icon\" ng-mouseover=\"vm.showTooltip=true\" ng-mouseleave=\"vm.showTooltip=false\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"subject-goal-wrap\">\n" +
    "            <div class=\"subjects-goal noselect\">\n" +
    "                <div class=\"subject\">\n" +
    "                    <div class=\"icon-wrapper svg-wrapper math-bg\">\n" +
    "                        <svg-icon name=\"math-section-icon\"></svg-icon>\n" +
    "                    </div>\n" +
    "                    <span class=\"subject-title\" translate=\".MATH\"></span>\n" +
    "                    <goal-select ng-model=\"userGoals.math\" ng-change=\"calcTotal()\"></goal-select>\n" +
    "                </div>\n" +
    "                <div class=\"subject\">\n" +
    "                    <div class=\"icon-wrapper svg-wrapper verbal-bg\">\n" +
    "                        <svg-icon name=\"verbal-icon\"></svg-icon>\n" +
    "                    </div>\n" +
    "                    <span class=\"subject-title\" translate=\".VERBAL\"></span>\n" +
    "                    <goal-select ng-model=\"userGoals.verbal\" ng-change=\"calcTotal()\"></goal-select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"composite-wrap\">\n" +
    "            <div class=\"composite-score\">\n" +
    "                <div class=\"score-title\" translate=\".TOTAL_SCORE\"></div>\n" +
    "                <div class=\"score\">{{userGoals.verbal + userGoals.math}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"save-btn-wrap\">\n" +
    "        <md-button autofocus tabindex=\"1\"\n" +
    "                   class=\"md-sm primary inline-block\"\n" +
    "                   ng-click=\"saveChanges()\"\n" +
    "                   ng-class=\"setting.saveBtn.wrapperClassName\">\n" +
    "            <svg-icon name=\"v-icon\" class=\"v-icon\" ng-show=\"showVIcon\"></svg-icon>\n" +
    "            <span>{{saveTitle}}</span>\n" +
    "            <svg-icon name=\"dropdown-arrow-icon\" class=\"dropdown-arrow-icon\" ng-show=\"setting.saveBtn.showSaveIcon\"></svg-icon>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "    <div class=\"school-selector-wrap animate-if\"\n" +
    "         ng-if=\"showSchoolEdit\">\n" +
    "        <school-select events=\"schoolSelectEvents\"\n" +
    "                       get-selected-schools=\"getSelectedSchools()\">\n" +
    "        </school-select>\n" +
    "    </div>\n" +
    "</section>\n" +
    "\n" +
    "\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app', []);
})(angular);
