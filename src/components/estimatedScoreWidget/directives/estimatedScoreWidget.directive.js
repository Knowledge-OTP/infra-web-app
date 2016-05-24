/**
 * attrs:
 */

(function (angular) {
    'use strict';

    // angular.module('znk.infra-web-app').directive('EstimatedScoreWidget', ['$q', '$timeout', 'SubjectEnum', '$mdDialog', 'EstimatedScoreSrv', 'UserGoalsService', 'appConstants', 'WorkoutsDiagnosticFlow',
    angular.module('znk.infra-web-app').directive('EstimatedScoreWidget', [
        function () {
            return {
                templateUrl: 'app/components/estimatedScore/estimatedScoreWidget.template.html',
                require: '?ngModel',
                restrict: 'E',
                scope: {
                    isNavMenu: '@'
                },
                link: function (scope, element, attrs, ngModelCtrl) {
                    scope.d = {};

                    var isNavMenuFlag = (scope.isNavMenu === 'true');
                    var getEstimatedScoreProm = EstimatedScoreSrv.getEstimatedScores();
                    var getEstimatedScoreCompositeProm = EstimatedScoreSrv.getCompositeScore();
                    var isDiagnosticCompletedProm = WorkoutsDiagnosticFlow.isDiagnosticCompleted();
                    var subjectEnumToValMap = SubjectEnum.getEnumMap();

                    if (isNavMenuFlag) angular.element.addClass(element[0], 'is-nav-menu');

                    function adjustWidgetData(userGoals) {
                        $q.all([getEstimatedScoreProm, getEstimatedScoreCompositeProm, isDiagnosticCompletedProm]).then(function (res) {
                            var estimatedScore = res[0];
                            var isDiagnosticCompleted = res[2];
                            scope.d.isDiagnosticComplete = isDiagnosticCompleted;
                            scope.d.estimatedCompositeScore = isDiagnosticCompleted ? res[1].compositeScoreResults || '-' : '-';
                            scope.d.userCompositeGoal = (userGoals) ? userGoals.compositeScore : '-';
                            scope.d.widgetItems = [];

                            var subjectToIndexMap = {
                                [SubjectEnum.ENGLISH.enum]: 0,
                                [SubjectEnum.MATH.enum]: 1,
                                [SubjectEnum.READING.enum]: 2,
                                [SubjectEnum.SCIENCE.enum]: 3,
                                [SubjectEnum.WRITING.enum]: 4
                            };

                            angular.forEach(estimatedScore, function (estimatedScoreForSubject, subjectId) {
                                var subjectIndex = subjectToIndexMap[subjectId];
                                var userGoalForSubject = (userGoals) ? userGoals[subjectEnumToValMap[subjectId]] : 0;
                                scope.d.widgetItems[subjectIndex] = {
                                    subjectId: subjectId,
                                    estimatedScore: (scope.d.isDiagnosticComplete) ? estimatedScoreForSubject : 0,
                                    estimatedScorePercentage: (scope.d.isDiagnosticComplete) ? calcPercentage(estimatedScoreForSubject) : 0,
                                    userGoal: userGoalForSubject,
                                    userGoalPercentage: calcPercentage(userGoalForSubject),
                                    pointsLeftToMeetUserGoal: (scope.d.isDiagnosticComplete) ? (userGoalForSubject - estimatedScoreForSubject) : 0
                                };
                            });

                            if (!previousValues) {
                                scope.d.subjectsScores = scope.d.widgetItems;
                            } else {
                                scope.d.subjectsScores = previousValues;
                                $timeout(function () {
                                    scope.d.enableEstimatedScoreChangeAnimation = true;
                                    $timeout(function () {
                                        scope.d.subjectsScores = scope.d.widgetItems;
                                    }, 1200);
                                });
                            }

                            previousValues = scope.d.widgetItems;
                        });
                    }

                    function calcPercentage(correct) {
                        return (correct / appConstants.MAX_ESTIMATED_SCORE) * 100;
                    }

                    // TODO: this should come from a service, duplicated from znk-header
                    scope.d.showGoalsEdit = function () {
                        $mdDialog.show({
                            controller: 'SettingsEditGoalsController',
                            controllerAs: 'vm',
                            templateUrl: 'app/settings/templates/settingsEditGoals.template.html',
                            clickOutsideToClose: false
                        });
                    };

                    if (isNavMenuFlag) {
                        scope.d.onSubjectClick = function (subjectId) {
                            ngModelCtrl.$setViewValue(+subjectId);
                            scope.d.currentSubject = subjectId;
                        };

                        ngModelCtrl.$render = function () {
                            scope.d.currentSubject = '' + ngModelCtrl.$viewValue;
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
    ]);
})(angular);

