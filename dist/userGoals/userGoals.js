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
                'user-goals-plus-icon': 'components/userGoals/svg/plus-icon.svg',
                'user-goals-dropdown-arrow-icon': 'components/userGoals/svg/dropdown-arrow.svg',
                'user-goals-arrow-icon': 'components/userGoals/svg/arrow-icon.svg',
                'user-goals-info-icon': 'components/userGoals/svg/info-icon.svg',
                'user-goals-v-icon': 'components/userGoals/svg/v-icon.svg',
                'user-goals-search-icon': 'components/userGoals/svg/search-icon.svg'
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
  $templateCache.put("components/userGoals/svg/arrow-icon.svg",
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
  $templateCache.put("components/userGoals/svg/search-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-314.8 416.5 97.5 99.1\" class=\"search-icon-wrapper\">\n" +
    "<style type=\"text/css\">\n" +
    "	.search-icon-wrapper .st0{fill:none;stroke:#231F20;stroke-width:5;stroke-miterlimit:10;}\n" +
    "	.search-icon-wrapper .st1{fill:none;stroke:#231F20;stroke-width:5;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<circle class=\"st0\" cx=\"-279.1\" cy=\"452.3\" r=\"33.2\"/>\n" +
    "<line class=\"st1\" x1=\"-255.3\" y1=\"477.6\" x2=\"-219.8\" y2=\"513.1\"/>\n" +
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
  $templateCache.put("components/userGoals/templates/goalSelect.template.html",
    "<div class=\"action-btn minus\" ng-click=\"updateGoal(false)\" ng-show=\"target > minScore\">\n" +
    "    <svg-icon name=\"user-goals-plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "<div class=\"goal\">{{target}}</div>\n" +
    "<div class=\"action-btn plus\" ng-click=\"updateGoal(true)\" ng-show=\"target < maxScore\">\n" +
    "    <svg-icon name=\"user-goals-plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/userGoals/templates/schoolSelect.template.html",
    "<div class=\"school-selector\" translate-namespace=\"SCHOOL_SELECT\">\n" +
    "    <div class=\"selector\">\n" +
    "        <div class=\"tag-input-wrap\">\n" +
    "            <div class=\"search-icon-container\">\n" +
    "                <svg-icon name=\"user-goals-search-icon\"></svg-icon>\n" +
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
    "                <svg-icon name=\"user-goals-arrow-icon\"\n" +
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
    "                    <div translate=\".GOALS_INFO\" class=\"top-text\"></div>\n" +
    "                </md-tooltip>\n" +
    "                <svg-icon class=\"user-goals-info-icon\" name=\"info-icon\" ng-mouseover=\"vm.showTooltip=true\" ng-mouseleave=\"vm.showTooltip=false\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"subject-goal-wrap\">\n" +
    "            <div class=\"subjects-goal noselect\">\n" +
    "                <div class=\"subject\" ng-repeat=\"subject in goalsSettingsFromSrv.subjects\">\n" +
    "                    <div class=\"icon-wrapper svg-wrapper\" ng-class=\"subject.name+'-bg'\">\n" +
    "                        <svg-icon name=\"{{subject.svgIcon}}\"></svg-icon>\n" +
    "                    </div>\n" +
    "                    <span class=\"subject-title\" translate=\".{{subject.name | uppercase}}\"></span>\n" +
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
    "                <div class=\"score-title\" translate=\".TOTAL_SCORE\"></div>\n" +
    "                <div class=\"score\">{{totalScore}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"save-btn-wrap\">\n" +
    "        <md-button autofocus tabindex=\"1\"\n" +
    "                   class=\"md-sm primary inline-block\"\n" +
    "                   ng-click=\"saveChanges()\"\n" +
    "                   ng-class=\"setting.saveBtn.wrapperClassName\">\n" +
    "            <svg-icon name=\"user-goals-v-icon\" class=\"v-icon\" ng-show=\"showVIcon\"></svg-icon>\n" +
    "            <span translate=\"{{saveTitle}}\"></span>\n" +
    "            <svg-icon name=\"user-goals-dropdown-arrow-icon\" class=\"dropdown-arrow-icon\" ng-show=\"setting.saveBtn.showSaveIcon\"></svg-icon>\n" +
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
