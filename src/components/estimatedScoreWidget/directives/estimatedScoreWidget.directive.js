/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').directive('estimatedScoreWidget',
        function (EstimatedScoreSrv, $q, SubjectEnum, UserGoalsService, EstimatedScoreWidgetSrv,
                  userGoalsSelectionService, $timeout, ScoringService, DiagnosticSrv, ENV) {
            'ngInject';
            var previousValues;

            return {
                templateUrl: 'components/estimatedScoreWidget/directives/estimatedScoreWidget.template.html',
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

                    var getLatestEstimatedScoreProm = EstimatedScoreSrv.getLatestEstimatedScore();
                    var getSubjectOrderProm = EstimatedScoreWidgetSrv.getSubjectOrder();
                    var getExamScoreProm = ScoringService.getExamScoreFn();
                    var isDiagnosticCompletedProm = DiagnosticSrv.getDiagnosticStatus();
                    var subjectEnumToValMap = SubjectEnum.getEnumMap();
                    scope.d.showGoalsEdit = showGoalsEdit;
                    scope.d.ignoreCompositeScore = ENV.ignoreCompositeScore;
                    scope.d.ignoreCompositeGoal = ENV.ignoreCompositeGoal;

                    if (isNavMenuFlag) {
                        angular.element.addClass(element[0], 'is-nav-menu');
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
                                var estimatedScoreForSubject = estimatedScore[subjectId];
                                var isSubjectExist = estimatedScoreForSubject && estimatedScoreForSubject.score;
                                return {
                                    subjectId: subjectId,
                                    estimatedScore: (scope.d.isDiagnosticComplete && (isSubjectExist && typeof (estimatedScoreForSubject.score) === 'number')) ? estimatedScoreForSubject.score : '-',
                                    estimatedScorePercentage: (scope.d.isDiagnosticComplete && isSubjectExist) ? calcPercentage(estimatedScoreForSubject.score, subjectId) : 0,
                                    userGoal: userGoalForSubject,
                                    userGoalPercentage: calcPercentage(userGoalForSubject, subjectId),
                                    pointsLeftToMeetUserGoal: (scope.d.isDiagnosticComplete && isSubjectExist) ? (userGoalForSubject - estimatedScoreForSubject.score) : 0,
                                    showScore: (typeof userGoals[subjectEnumToValMap[subjectId]] !== 'undefined')
                                };
                            });

                            scores = createAndCountScoresArray(scope.d.widgetItems);

                            scope.d.estimatedCompositeScore = scores.scoresArr.length === scores.subjectsToShow ? examScoresFn(scores.scoresArr) : '-';

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

                    function calcPercentage(correct, subjectId) {
                        var scoringLimits = ScoringService.getScoringLimits();
                        var maxEstimatedScore = typeof scoringLimits.subjects[subjectId] !== 'undefined' ? scoringLimits.subjects[subjectId].max : scoringLimits.subjects.max;
                        return (correct / maxEstimatedScore) * 100;
                    }

                    function showGoalsEdit() {
                        userGoalsSelectionService.openEditGoalsDialog();
                    }
                }
            };
        }
    );
})(angular);

