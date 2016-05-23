(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoals', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'ngMaterial',
        'ngTagsInput'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'plus-icon': 'components/userGoals/svg/plus-icon.svg',
                'dropdown-arrow-icon': 'components/userGoals/svg/dropdown-arrow.svg',
                'info-icon': 'components/userGoals/svg/info-icon.svg',
                'v-icon': 'components/userGoals/svg/v-icon.svg',
                'math-section-icon': 'components/userGoals/svg/math-section-icon.svg',
                'verbal-icon': 'components/userGoals/svg/verbal-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoals').filter('cutString', function cutStringFilter() {
        return function (str, length, onlyFullWords) {
            length = +length;
            if (!str || length <= 0) {
                return '';
            }
            if (isNaN(length) || str.length < length) {
                return str;
            }
            var words = str.split(' ');
            var newStr = '';
            if (onlyFullWords) {
                for (var i = 0; i < words.length; i++) {
                    if (newStr.length + words[i].length <= length) {
                        newStr = newStr + words[i] + ' ';
                    } else {
                        break;
                    }
                }
            } else {
                newStr = str.substr(0, length);
            }

            return newStr + '...';
        };
    });
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoals').directive('goalSelect', function GoalSelectDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/userGoals/templates/goalSelect.template.html',
            require: 'ngModel',
            scope: {
                minScore: '=',
                maxScore: '=',
                updateGoalNum: '='
            },
            link: function link(scope, element, attrs, ngModelCtrl) {
                scope.updateGoal = function (isPlus) {
                    scope.target += (isPlus) ? scope.updateGoalNum : -Math.abs(scope.updateGoalNum);
                    if (scope.target < scope.minScore) {
                        scope.target = scope.minScore;
                    } else if (scope.target > scope.maxScore) {
                        scope.target = scope.maxScore;
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

/**
 *  attrs:
 *      events:
 *          onSave
 * */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoals').directive('schoolSelect', ['UserSchoolsService', '$translate', 'UtilitySrv', '$timeout', '$q', '$translatePartialLoader',
        function SchoolSelectDirective(UserSchoolsService, $translate, UtilitySrv, $timeout, $q, $translatePartialLoader) {
            'ngInject';

            var schoolList = [];

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoals/templates/schoolSelect.template.html',
                scope: {
                    events: '=?',
                    getSelectedSchools: '&?'
                },
                link: function link(scope, element, attrs) {
                    $translatePartialLoader.addPart('userGoals');

                    var MIN_LENGTH_AUTO_COMPLETE = 3;
                    var MAX_SCHOOLS_SELECT = 3;
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
                        $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                            scope.d.placeholder = scope.d.userSchools.length ? ' ' : val;
                        });
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
                            $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                                scope.d.placeholder =  val;
                            });
                        }
                        disableSearchOption();
                        return true;
                    };

                    scope.d.querySchools = function ($query) {
                        if ($query.length < 3) {
                            return $q.when([]);
                        }
                        var resultsArr = schoolList.filter(function (school) {
                            return school.text.toLowerCase().indexOf($query.toLowerCase()) > -1;
                        });
                        if (!resultsArr.length) {
                            resultsArr = $translate('SCHOOL_SELECT.NO_RESULTS').then(function(val) {
                                return [{
                                    text: val
                                }];
                            });

                        }
                        return $q.when(resultsArr);
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
    angular.module('znk.infra-web-app.userGoals').directive('userGoals',['UserGoalsService', '$timeout', 'UserSchoolsService', '$q', '$translatePartialLoader',
        function UserGoalsDirective(UserGoalsService, $timeout, UserSchoolsService, $q, $translatePartialLoader) {

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoals/templates/userGoals.template.html',
                scope: {
                    onSave: '&?',
                    setting: '='
                },
                link: function link(scope) {
                    $translatePartialLoader.addPart('userGoals');
                    var userGoalRef;
                    scope.goalsSettingsFromSrv = UserGoalsService.getGoalsSettings();
                    var defaultTitle = scope.saveTitle = scope.setting.saveBtn.title || '.SAVE';

                    var initTotalScore = 0;
                    angular.forEach(scope.goalsSettingsFromSrv.subjects, function() {
                        initTotalScore += scope.goalsSettingsFromSrv.defaultSubjectScore;
                    });
                    scope.totalScore = initTotalScore;

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
                        var newTotalScore = 0;
                        angular.forEach(goals, function(goal, key) {
                            if (angular.isNumber(goal) && key !== 'totalScore') {
                                newTotalScore += goal;
                            }
                        });
                        goals.totalScore = scope.totalScore = newTotalScore;
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

'use strict';

angular.module('znk.infra-web-app.userGoals').provider('UserGoalsService', [function() {

        this.$get = ['InfraConfigSrv', 'StorageSrv', '$q', function (InfraConfigSrv, StorageSrv, $q) {
            var self = this;
            var goalsPath = StorageSrv.variables.appUserSpacePath + '/goals';
            var defaultSubjectScore = self.settings.defaultSubjectScore;
            var subjects = self.settings.subjects;

            var userGoalsServiceObj = {};

            userGoalsServiceObj.getGoals = function () {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.get(goalsPath).then(function (userGoals) {
                        if (angular.equals(userGoals, {})) {
                            userGoals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.setGoals = function (newGoals) {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    if (arguments.length && angular.isDefined(newGoals)) {
                        return studentStorage.set(goalsPath, newGoals);
                    }
                    return studentStorage.get(goalsPath).then(function (userGoals) {
                        if (!userGoals.goals) {
                            userGoals.goals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.calcCompositeScore = function (userSchools, save) {
                // The calculation for composite score in ACT:
                // 1. For each school in US, we have min & max score
                // 2. Calc the average score for each school and set it for each subject goal

                return userGoalsServiceObj.getGoals().then(function (userGoals) {
                    var minSchoolScore = self.settings.minSchoolScore,
                        maxSchoolScore = self.settings.maxSchoolScore,
                        avgScores = [];

                    angular.forEach(userSchools, function (school) {
                        var school25th = isNaN(school.total25th) ? minSchoolScore : school.total25th;
                        var school75th = isNaN(school.total75th) ? maxSchoolScore : school.total75th;
                        avgScores.push((school25th * 0.25) + (school75th * 0.75));
                    });

                    var avgSchoolsScore;
                    if (avgScores.length) {
                        avgSchoolsScore = avgScores.reduce(function (a, b) {
                            return a + b;
                        });
                        avgSchoolsScore = Math.round(avgSchoolsScore / avgScores.length);
                    } else {
                        avgSchoolsScore = defaultSubjectScore;
                    }

                    userGoals = {
                        isCompleted: false
                    };

                    angular.forEach(subjects, function(subject) {
                        userGoals[subject.name] = avgSchoolsScore || defaultSubjectScore;
                    });

                    userGoals.compositeScore = averageSubjectsGoal(userGoals);
                    return save ? userGoalsServiceObj.setGoals(userGoals) : $q.when(userGoals);
                });
            };

            userGoalsServiceObj.getGoalsSettings = function() {
                 return self.settings;
            };

            function _defaultUserGoals() {
                var defaultUserGoals = {
                    isCompleted: false,
                    totalScore: defaultSubjectScore * subjects.length
                };
                angular.forEach(subjects, function(subject) {
                    defaultUserGoals[subject.name] = defaultSubjectScore;
                });
                return defaultUserGoals;
            }

            function averageSubjectsGoal(goalsObj) {
                var goalsSum = 0;
                var goalsLength = 0;
                angular.forEach(goalsObj, function(goal) {
                    if (angular.isNumber(goal)) {
                        goalsSum += goal;
                        goalsLength += 1;
                    }
                });
                return Math.round(goalsSum / goalsLength);
            }

            return userGoalsServiceObj;
        }];
}]);

'use strict';

angular.module('znk.infra-web-app.userGoals').service('UserSchoolsService', ['InfraConfigSrv', 'StorageSrv', 'ENV', '$http', 'UserGoalsService', '$q',
    function(InfraConfigSrv, StorageSrv, ENV, $http, UserGoalsService, $q) {
        var schoolsPath = StorageSrv.variables.appUserSpacePath + '/dreamSchools';

        this.getAppSchoolsList = function () {
            return $http.get(ENV.dreamSchoolJsonUrl, {
                timeout: ENV.promiseTimeOut,
                cache: true
            });
        };

        function _getUserSchoolsData() {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                var defaultValues = {
                    selectedSchools: []
                };
                return studentStorage.get(schoolsPath, defaultValues);
            });
        }

        function _setUserSchoolsData(userSchools) {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                 return studentStorage.set(schoolsPath, userSchools);
            });
        }

        this.getDreamSchools = function () {
            return _getUserSchoolsData().then(function (userSchools) {
                return userSchools.selectedSchools;
            });
        };

        this.setDreamSchools = function (newSchools, updateUserGoals) {
            return _getUserSchoolsData().then(function (userSchools) {
                if (!angular.isArray(newSchools) || !newSchools.length) {
                    newSchools = [];
                }

                if (userSchools.selectedSchools !== newSchools) {
                    userSchools.selectedSchools.splice(0);
                    angular.extend(userSchools.selectedSchools, newSchools);
                }

                var saveUserGoalProm = $q.when();
                if (updateUserGoals) {
                    saveUserGoalProm = UserGoalsService.calcCompositeScore(newSchools, true);
                }

                return $q.all([
                    _setUserSchoolsData(userSchools),
                    saveUserGoalProm
                ]).then(function (res) {
                    return res[0];
                });
            });
        };
}]);


angular.module('znk.infra-web-app.userGoals').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/userGoals/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoals/svg/info-icon.svg",
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
  $templateCache.put("components/userGoals/svg/math-section-icon.svg",
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
  $templateCache.put("components/userGoals/svg/plus-icon.svg",
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
  $templateCache.put("components/userGoals/svg/v-icon.svg",
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
  $templateCache.put("components/userGoals/svg/verbal-icon.svg",
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
  $templateCache.put("components/userGoals/templates/goalSelect.template.html",
    "<div class=\"action-btn minus\" ng-click=\"updateGoal(false)\" ng-show=\"target > minScore\">\n" +
    "    <svg-icon name=\"plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "<div class=\"goal\">{{target}}</div>\n" +
    "<div class=\"action-btn plus\" ng-click=\"updateGoal(true)\" ng-show=\"target < maxScore\">\n" +
    "    <svg-icon name=\"plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/userGoals/templates/schoolSelect.template.html",
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
  $templateCache.put("components/userGoals/templates/userGoals.template.html",
    "<section translate-namespace=\"USER_GOALS\">\n" +
    "    <div class=\"goals-schools-wrapper\" ng-if=\"setting.showSchools || goalsSettingsFromSrv.showSchools\">\n" +
    "        <div class=\"title-wrap\">\n" +
    "            <div class=\"edit-title\" translate=\".DREAM_SCHOOLS\"></div>\n" +
    "            <div class=\"edit-link\" ng-click=\"showSchools()\" ng-class=\"{'active' : showSchoolEdit}\">\n" +
    "                <span translate=\".EDIT\" class=\"edit\"></span>\n" +
    "                <span translate=\".CANCEL\" class=\"cancel\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"selected-schools-container\" ng-switch=\"userSchools.length\">\n" +
    "            <div ng-switch-when=\"0\"\n" +
    "                 class=\"no-school-selected\"\n" +
    "                 translate=\".I_DONT_KNOW\"></div>\n" +
    "            <div ng-switch-default class=\"selected-schools\">\n" +
    "                <div ng-repeat=\"school in userSchools\" class=\"school\">{{school.text}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"subject-wrap\">\n" +
    "        <div class=\"blur-wrap\"></div>\n" +
    "        <div class=\"goals-title\" ng-show=\"setting.recommendedGoalsTitle\">\n" +
    "            <div class=\"recommended-title\" translate=\".RECOMMENDED_GOALS\"></div>\n" +
    "            <div class=\"info-wrap\">\n" +
    "                <md-tooltip md-visible=\"vm.showTooltip\" md-direction=\"top\" class=\"goals-info md-whiteframe-2dp\">\n" +
    "                    <div translate=\"{{goalsSettingsFromSrv.goalsInfoTranslate}}\" class=\"top-text\"></div>\n" +
    "                </md-tooltip>\n" +
    "                <svg-icon class=\"info-icon\" name=\"info-icon\" ng-mouseover=\"vm.showTooltip=true\" ng-mouseleave=\"vm.showTooltip=false\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"subject-goal-wrap\">\n" +
    "            <div class=\"subjects-goal noselect\">\n" +
    "                <div class=\"subject\" ng-repeat=\"subject in goalsSettingsFromSrv.subjects\">\n" +
    "                    <div class=\"icon-wrapper svg-wrapper\" ng-class=\"subject.bgClass\">\n" +
    "                        <svg-icon name=\"{{subject.svgIcon}}\"></svg-icon>\n" +
    "                    </div>\n" +
    "                    <span class=\"subject-title\" translate=\"{{subject.subjectTranslate}}\"></span>\n" +
    "                    <goal-select\n" +
    "                        min-score=\"goalsSettingsFromSrv.minGoalsScore\"\n" +
    "                        max-score=\"goalsSettingsFromSrv.maxGoalsScore\"\n" +
    "                        update-goal-num=\"goalsSettingsFromSrv.updateGoalNum\"\n" +
    "                        ng-model=\"userGoals[subject.name]\"\n" +
    "                        ng-change=\"calcTotal()\">\n" +
    "                    </goal-select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"composite-wrap\">\n" +
    "            <div class=\"composite-score\">\n" +
    "                <div class=\"score-title\" translate=\"{{goalsSettingsFromSrv.scoreTitleTranslate}}\"></div>\n" +
    "                <div class=\"score\">{{totalScore}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"save-btn-wrap\">\n" +
    "        <md-button autofocus tabindex=\"1\"\n" +
    "                   class=\"md-sm primary inline-block\"\n" +
    "                   ng-click=\"saveChanges()\"\n" +
    "                   ng-class=\"setting.saveBtn.wrapperClassName\">\n" +
    "            <svg-icon name=\"v-icon\" class=\"v-icon\" ng-show=\"showVIcon\"></svg-icon>\n" +
    "            <span translate=\"{{saveTitle}}\"></span>\n" +
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
