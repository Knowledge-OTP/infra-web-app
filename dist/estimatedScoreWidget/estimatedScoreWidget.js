(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.enum',
        'znk.infra.config',
        'znk.infra.storage',
        'znk.infra.general',
        'znk.infra.exerciseResult',
        'znk.infra.utility',
        'znk.infra.contentAvail',
        'znk.infra.content',
        'znk.infra.znkExercise',
        'znk.infra.scroll',
        'znk.infra.autofocus',
        'znk.infra.exerciseUtility',
        'znk.infra.estimatedScore',
        'znk.infra.scoring',
        'znk.infra.svgIcon',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.diagnostic'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'estimated-score-widget-goals': 'components/estimatedScoreWidget/svg/goals-top-icon.svg',
                'estimated-score-widget-close-popup': 'components/estimatedScoreWidget/svg/estimated-score-widget-close-popup.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').directive('estimatedScoreWidget',
        ["EstimatedScoreSrv", "$q", "SubjectEnum", "UserGoalsService", "EstimatedScoreWidgetSrv", "userGoalsSelectionService", "$timeout", "ScoringService", "DiagnosticSrv", function (EstimatedScoreSrv, $q, SubjectEnum, UserGoalsService, EstimatedScoreWidgetSrv, userGoalsSelectionService, $timeout, ScoringService, DiagnosticSrv) {
            'ngInject';
            var previousValues;

            return {
                templateUrl: 'components/estimatedScoreWidget/templates/estimatedScoreWidget.template.html',
                require: '?ngModel',
                restrict: 'E',
                scope: {
                    isNavMenu: '@',
                    widgetTitle: '@'
                },
                link: function (scope, element, attrs, ngModelCtrl) {
                    scope.d = {};

                    var isNavMenuFlag = (scope.isNavMenu === 'true');
                    var scores;

                    var getLatestEstimatedScoreProm = EstimatedScoreSrv.getEstimatedScoresData();
                    var getSubjectOrderProm = EstimatedScoreWidgetSrv.getSubjectOrder();
                    var getExamScoreProm = ScoringService.getExamScoreFn();
                    var isDiagnosticCompletedProm = DiagnosticSrv.getDiagnosticStatus();
                    var subjectEnumToValMap = SubjectEnum.getEnumMap();

                    if (isNavMenuFlag) {
                        angular.element.addClass(element[0], 'is-nav-menu');
                    }

                    function adjustWidgetData(userGoals) {
                        $q.all([
                            getLatestEstimatedScoreProm,
                            isDiagnosticCompletedProm,
                            $q.when(false),
                            getSubjectOrderProm,
                            getExamScoreProm
                        ]).then(function (res) {
                            var estimatedScore = res[0];
                            var isDiagnosticCompleted = res[1];
                            var subjectOrder = res[3];
                            var examScoresFn = res[4];

                            scope.d.isDiagnosticComplete = isDiagnosticCompleted === 2;

                            scope.d.userCompositeGoal = (userGoals) ? userGoals.totalScore : '-';
                            scope.d.widgetItems = subjectOrder.map(function (subjectId) {
                                var userGoalForSubject = (userGoals) ? userGoals[subjectEnumToValMap[subjectId]] : 0;
                                var estimatedScoreForSubjectArr = estimatedScore[subjectId];
                                var estimatedScoreForSubject = estimatedScoreForSubjectArr[estimatedScoreForSubjectArr.length - 1];
                                var isSubjectExist = estimatedScoreForSubject && estimatedScoreForSubject.score;
                                return {
                                    subjectId: subjectId,
                                    estimatedScore: (scope.d.isDiagnosticComplete && (isSubjectExist && typeof (estimatedScoreForSubject.score) === 'number')) ? estimatedScoreForSubject.score : '-',
                                    estimatedScorePercentage: (scope.d.isDiagnosticComplete && isSubjectExist) ? calcPercentage(estimatedScoreForSubject.score) : 0,
                                    userGoal: userGoalForSubject,
                                    userGoalPercentage: calcPercentage(userGoalForSubject),
                                    pointsLeftToMeetUserGoal: (scope.d.isDiagnosticComplete && isSubjectExist) ? (userGoalForSubject - estimatedScoreForSubject.score) : 0,
                                    showScore: (typeof userGoals[subjectEnumToValMap[subjectId]] !== 'undefined')
                                };
                            });

                            scores = createAndCountScoresArray(scope.d.widgetItems);

                            scope.d.estimatedCompositeScore = scores.scoresArr.length === scores.subjectsToShow ? examScoresFn(scores.scoresArr): '-';

                            function filterSubjects(widgetItem) {
                                return !!('showScore' in widgetItem && (widgetItem.showScore) !== false);
                            }

                            scope.d.widgetItems = scope.d.widgetItems.filter(filterSubjects);

                            if (isNavMenuFlag) {
                                if (angular.isUndefined(scope.d.currentSubject)) {
                                    scope.d.onSubjectClick(scope.d.widgetItems[0].subjectId);
                                }
                            }

                            if (previousValues) {
                                scope.d.subjectsScores = previousValues;
                            }

                            $timeout(function () {
                                scope.d.enableEstimatedScoreChangeAnimation = true;
                                $timeout(function () {
                                    scope.d.subjectsScores = scope.d.widgetItems;
                                }, 1200);
                            });
                            previousValues = scope.d.widgetItems;
                        });
                    }

                    function createAndCountScoresArray(subjectsArr) {
                        var scoresArr = [];
                        var subjectsToShow = 0;
                        for (var i = 0; i < subjectsArr.length; i++) {
                            if (typeof (subjectsArr[i].estimatedScore) === 'number') {
                                scoresArr.push(subjectsArr[i].estimatedScore);
                            }
                            if (subjectsArr[i].showScore) {
                                subjectsToShow++;
                            }
                        }
                        var scores = {
                            scoresArr: scoresArr,
                            subjectsToShow: subjectsToShow
                        };
                        return scores;
                    }

                    function calcPercentage(correct) {
                        var scoringLimits = ScoringService.getScoringLimits();
                        var maxEstimatedScore = typeof scoringLimits.subjects[Object.getOwnPropertyNames(scoringLimits.subjects)] !== 'undefined' ? scoringLimits.subjects[Object.getOwnPropertyNames(scoringLimits.subjects)].max : scoringLimits.subjects.max;
                        return (correct / maxEstimatedScore) * 100;
                    }

                    scope.d.showGoalsEdit = function () {
                        userGoalsSelectionService.openEditGoalsDialog();
                    };

                    if (isNavMenuFlag) {
                        scope.d.onSubjectClick = function (subjectId) {
                            ngModelCtrl.$setViewValue(+subjectId);
                            scope.d.currentSubject = subjectId;
                        };

                        ngModelCtrl.$render = function () {
                            scope.d.currentSubject = ngModelCtrl.$viewValue;
                        };
                    }

                    UserGoalsService.getGoals().then(function (userGoals) {
                        scope.$watchCollection(function () {
                            return userGoals;
                        }, function (newVal) {
                            adjustWidgetData(newVal);
                        });
                    });
                }
            };
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').run(["$translatePartialLoader", function ($translatePartialLoader) {
        'ngInject';
        $translatePartialLoader.addPart('estimatedScoreWidget');
    }]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').provider('EstimatedScoreWidgetSrv', [
        function () {
            var _subjectOrderGetter;
            this.setSubjectOrder = function(subjectOrderGetter){
                _subjectOrderGetter = subjectOrderGetter;
            };

            this.$get = ["$log", "$injector", "$q", function ($log, $injector, $q) {
                'ngInject';

                var EstimatedScoreWidgetSrv = {};

                EstimatedScoreWidgetSrv.getSubjectOrder = function(){
                    if(!_subjectOrderGetter){
                        var errMsg = 'EstimatedScoreWidgetSrv: subjectOrderGetter was not set';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return $q.when($injector.invoke(_subjectOrderGetter));
                };

                return EstimatedScoreWidgetSrv;
            }];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.estimatedScoreWidget').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/estimatedScoreWidget/svg/estimated-score-widget-close-popup.svg",
    "<svg\n" +
    "    class=\"estimated-score-widget-close-popup-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .estimated-score-widget-close-popup-svg .st1{\n" +
    "            fill:none;\n" +
    "            stroke: white;\n" +
    "            stroke-width: 6px;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/estimatedScoreWidget/svg/goals-top-icon.svg",
    "<svg class=\"estimated-score-widget-goals-svg\" x=\"0px\" y=\"0px\" viewBox=\"-632.7 361.9 200 200\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .estimated-score-widget-goals-svg .st0{fill:none;}\n" +
    "        .estimated-score-widget-goals-svg .st1{fill: white;}\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<path class=\"st1\" d=\"M-632.7,473.9c7.1,0.1,14.2,0.4,21.4,0.4c3,0,4.1,0.9,4.9,4c7.8,30.3,26.9,49.5,57.3,57.3c3.2,0.8,4,2,3.9,4.9\n" +
    "		c-0.3,7.1-0.3,14.3-0.4,21.4c-1.3,0-5.4-0.8-6.2-1c-36.3-7.9-61.4-29.2-75.2-63.6C-629.5,491.3-632.7,475.5-632.7,473.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-519.7,561.9c-0.1-7.6-0.4-15.2-0.3-22.9c0-1.1,1.7-2.7,2.8-3c31.2-7.9,50.7-27.4,58.6-58.6c0.3-1.3,2.6-2.8,4-2.9\n" +
    "		c7.3-0.4,14.6-0.4,21.9-0.6c0,1.7-0.8,6.4-1,7.2c-8,36.5-29.4,61.7-64.1,75.4C-503.6,558.7-518.3,561.9-519.7,561.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-545.7,361.9c0.1,7.5,0.4,15,0.3,22.4c0,1.2-1.7,3.1-2.9,3.4c-31.1,7.9-50.5,27.3-58.4,58.5c-0.3,1.2-1.9,2.9-3,2.9\n" +
    "		c-7.6,0.1-15.3-0.1-22.9-0.3c0-1.3,0.8-5.4,1-6.2c7.7-35.8,28.5-60.7,62.2-74.7C-563.1,365.4-547,361.9-545.7,361.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-432.7,448.9c-7.6,0.1-15.3,0.4-22.9,0.2c-1.1,0-2.8-2.3-3.2-3.8c-7.3-27.7-24.3-46.4-51.5-55.6\n" +
    "		c-9.8-3.3-9.9-3.1-9.8-13.4c0-4.8,0.3-9.6,0.4-14.4c1.3,0,5.4,0.8,6.2,1c36.6,7.9,61.7,29.4,75.4,64.1\n" +
    "		C-435.8,432.7-432.7,447.5-432.7,448.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-581.2,474.6c12,0,23.6,0,35.5,0c0,12,0,23.7,0,35.4C-560.5,508.7-577.8,491.6-581.2,474.6z\"/>\n" +
    "	<path class=\"st1\" d=\"M-519.8,474.6c12,0,23.7,0,35.4,0c-2.3,16-19.5,33.2-35.4,35.5C-519.8,498.4-519.8,486.7-519.8,474.6z\"/>\n" +
    "	<path class=\"st1\" d=\"M-545.9,448.9c-11.9,0-23.5,0-35.7,0c5.6-18.4,17.2-30,35.7-35.9C-545.9,425.2-545.9,436.9-545.9,448.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-519.8,413.5c16.2,2.7,32.7,19.2,35.5,35.4c-11.8,0-23.5,0-35.5,0C-519.8,437.1-519.8,425.5-519.8,413.5z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/estimatedScoreWidget/templates/estimatedScoreWidget.template.html",
    "<div class=\"score-estimate-container base-border-radius base-box-shadow\"\n" +
    "     ng-class=\"{'estimated-score-animation': d.enableEstimatedScoreChangeAnimation}\"\n" +
    "     translate-namespace=\"ESTIMATED_SCORE_WIDGET_DIRECTIVE\">\n" +
    "    <div class=\"title\" translate=\"{{::widgetTitle}}\"></div>\n" +
    "    <div class=\"unfinished-diagnostic-title\" ng-if=\"!d.isDiagnosticComplete\" translate=\".UNFINISHED_DIAGNOSTIC_TITLE\"></div>\n" +
    "    <div class=\"subjects-wrap\">\n" +
    "        <div ng-repeat=\"widgetItem in d.subjectsScores track by widgetItem.subjectId\"\n" +
    "             ng-click=\"d.onSubjectClick(widgetItem.subjectId)\"\n" +
    "             ng-class=\"{ 'selected': (d.currentSubject === widgetItem.subjectId) }\"\n" +
    "             class=\"subject\"\n" +
    "             subject-id-to-attr-drv=\"{{widgetItem.subjectId}}\"\n" +
    "             context-attr=\"class\"\n" +
    "             tabindex=\"{{isNavMenu ? 0 : -1}}\">\n" +
    "            <div class=\"subject-title\">\n" +
    "                <span class=\"capitalize\" translate=\"SUBJECTS.{{widgetItem.subjectId}}\"></span>\n" +
    "                <span class=\"to-go\" ng-if=\"widgetItem.pointsLeftToMeetUserGoal > 0\"\n" +
    "                      translate=\".PTS_TO_GO\"\n" +
    "                      translate-values=\"{pts: {{widgetItem.pointsLeftToMeetUserGoal}} }\"></span>\n" +
    "            </div>\n" +
    "            <div class=\"score\" ng-if=\"widgetItem.showScore\">\n" +
    "                <hr class=\"bar\">\n" +
    "                <hr class=\"user-goal-fill\"\n" +
    "                    subject-id-to-attr-drv=\"{{widgetItem.subjectId}}\"\n" +
    "                    context-attr=\"class\"\n" +
    "                    ng-style=\"{ width: widgetItem.userGoalPercentage + '%' }\"\n" +
    "                    ng-class=\"{\n" +
    "                        'user-goal-met' : (widgetItem.estimatedScore >= widgetItem.userGoal),\n" +
    "                        'bar-full'    : (widgetItem.userGoalPercentage >= 100)\n" +
    "                    }\">\n" +
    "                <hr class=\"current-estimated-score-fill\"\n" +
    "                    subject-id-to-attr-drv=\"{{widgetItem.subjectId}}\"\n" +
    "                    context-attr=\"class\"\n" +
    "                    suffix=\"bg\"\n" +
    "                    ng-style=\"{ width: widgetItem.estimatedScorePercentage + '%' }\">\n" +
    "                <div class=\"current-estimated-score\">\n" +
    "                        <span subject-id-to-attr-drv=\"{{widgetItem.subjectId}}\"\n" +
    "                              context-attr=\"class\"\n" +
    "                              suffix=\"bc\"\n" +
    "                              ng-style=\"{ left: widgetItem.estimatedScorePercentage + '%' }\">\n" +
    "                              <md-tooltip md-visible=\"\"\n" +
    "                                          md-direction=\"top\"\n" +
    "                                          class=\"tooltip-for-estimated-score-widget md-whiteframe-2dp\">\n" +
    "                                  <div translate=\".YOUR_GOAL\" translate-values=\"{ goal: {{widgetItem.userGoal}} }\" class=\"top-text\"></div>\n" +
    "                                      <span class=\"bottom-text\" ng-if=\"widgetItem.estimatedScore >= widgetItem.userGoal\" translate=\".GOAL_REACHED\"></span>\n" +
    "                                      <span class=\"bottom-text\" ng-if=\"widgetItem.estimatedScore\" translate=\".PTS_TO_GO\" translate-values=\"{ pts: {{widgetItem.pointsLeftToMeetUserGoal}} }\"></span>\n" +
    "                              </md-tooltip>\n" +
    "                            {{widgetItem.estimatedScore === 0 ? '?' : widgetItem.estimatedScore}}\n" +
    "                        </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"divider\"></div>\n" +
    "\n" +
    "    <div class=\"inner\">\n" +
    "        <table class=\"score-summary\">\n" +
    "            <tr class=\"composite\">\n" +
    "                <td translate=\".COMPOSITE_SCORE\"></td>\n" +
    "                <td class=\"num\">{{d.estimatedCompositeScore}}</td>\n" +
    "            </tr>\n" +
    "            <tr class=\"goal\">\n" +
    "                <td translate=\".GOAL_SCORE\"></td>\n" +
    "                <td class=\"num\">{{d.userCompositeGoal}}</td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "        <span class=\"edit-my-goals\"\n" +
    "              ng-click=\"d.showGoalsEdit()\"\n" +
    "              translate=\".EDIT_MY_GOALS\"></span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
