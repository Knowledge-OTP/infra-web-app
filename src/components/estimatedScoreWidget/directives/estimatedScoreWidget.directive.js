/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').directive('estimatedScoreWidget',
        function (EstimatedScoreSrv, $q, SubjectEnum, UserGoalsService, EstimatedScoreWidgetSrv, $translatePartialLoader, userGoalsSelectionService, $timeout, ScoringService, DiagnosticSrv) {
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
                    $translatePartialLoader.addPart('estimatedScoreWidget');
                    scope.d = {};

                    var isNavMenuFlag = (scope.isNavMenu === 'true');

                    var getLatestEstimatedScoreProm = EstimatedScoreSrv.getLatestEstimatedScore();
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
                                var estimatedScoreForSubject = estimatedScore[subjectId];
                                return {
                                    subjectId: subjectId,
                                    estimatedScore: (scope.d.isDiagnosticComplete) ? estimatedScoreForSubject.score : 0,
                                    estimatedScorePercentage: (scope.d.isDiagnosticComplete) ? calcPercentage(estimatedScoreForSubject.score) : 0,
                                    userGoal: userGoalForSubject,
                                    userGoalPercentage: calcPercentage(userGoalForSubject),
                                    pointsLeftToMeetUserGoal: (scope.d.isDiagnosticComplete) ? (userGoalForSubject - estimatedScoreForSubject.score) : 0,
                                    showScore: (typeof userGoals[subjectEnumToValMap[subjectId]] !== 'undefined')
                                };
                            });

                            var scoresArr = [];
                            for (var i = 0; i < scope.d.widgetItems.length; i++) {
                                if (angular.isDefined(scope.d.widgetItems[i].estimatedScore)) {
                                    scoresArr.push(scope.d.widgetItems[i].estimatedScore);
                                }
                            }

                            scope.d.estimatedCompositeScore = examScoresFn(scoresArr);

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

                            // if (!previousValues) {
                            //     scope.d.subjectsScores = scope.d.widgetItems;
                            // } else {
                            //     scope.d.subjectsScores = previousValues;
                            //     $timeout(function () {
                            //         scope.d.enableEstimatedScoreChangeAnimation = true;
                            //         $timeout(function () {
                            //             scope.d.subjectsScores = scope.d.widgetItems;
                            //         }, 1200);
                            //     });
                            // }

                            previousValues = scope.d.widgetItems;
                        });
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
        }
    );
})(angular);

