/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').directive('estimatedScoreWidget',
        function (EstimatedScoreSrv, $q, SubjectEnum, UserGoalsService, EstimatedScoreWidgetSrv, $translatePartialLoader) {
            'ngInject';
            var previousValues;

            return {
                templateUrl: 'components/estimatedScoreWidget/templates/estimatedScoreWidget.template.html',
                require: '?ngModel',
                restrict: 'E',
                scope: {
                    isNavMenu: '@'
                },
                link: function (scope, element, attrs, ngModelCtrl) {
                    $translatePartialLoader.addPart('estimatedScoreWidget');
                    scope.d = {};

                    var isNavMenuFlag = (scope.isNavMenu === 'true');

                    var getLatestEstimatedScoreProm = EstimatedScoreSrv.getLatestEstimatedScore();
                    var getSubjectOrderProm = EstimatedScoreWidgetSrv.getSubjectOrder();
                    // var getEstimatedScoreCompositeProm = EstimatedScoreSrv.getCompositeScore();
                    // var isDiagnosticCompletedProm = WorkoutsDiagnosticFlow.isDiagnosticCompleted();todo implement once diagnostic service will be ready
                    var subjectEnumToValMap = SubjectEnum.getEnumMap();

                    if (isNavMenuFlag) angular.element.addClass(element[0], 'is-nav-menu');

                    function adjustWidgetData(userGoals) {
                        $q.all([
                            getLatestEstimatedScoreProm,
                            $q.when(false),
                            getSubjectOrderProm

                        ]).then(function (res) {
                            var estimatedScore = res[0];
                            var isDiagnosticCompleted = res[1];
                            var subjectOrder = res[2];

                            scope.d.isDiagnosticComplete = isDiagnosticCompleted;

                            // scope.d.estimatedCompositeScore = isDiagnosticCompleted ? res[1].compositeScoreResults || '-' : '-';todo need to figure out what it do
                            scope.d.userCompositeGoal = (userGoals) ? userGoals.compositeScore : '-';
                            scope.d.widgetItems = subjectOrder.map(function (subjectId) {
                                var userGoalForSubject = (userGoals) ? userGoals[subjectEnumToValMap[subjectId]] : 0;
                                var estimatedScoreForSubject = estimatedScore[subjectId];
                                return {
                                    subjectId: subjectId,
                                    // estimatedScore: (scope.d.isDiagnosticComplete) ? estimatedScoreForSubject : 0,
                                    estimatedScore: (scope.d.isDiagnosticComplete) ? estimatedScoreForSubject : 10,
                                    // estimatedScorePercentage: (scope.d.isDiagnosticComplete) ? calcPercentage(estimatedScoreForSubject) : 0,
                                    estimatedScorePercentage: (scope.d.isDiagnosticComplete) ? calcPercentage(estimatedScoreForSubject) : 30,
                                    // userGoal: userGoalForSubject,
                                    userGoal: 25,
                                    // userGoalPercentage: calcPercentage(userGoalForSubject),
                                    userGoalPercentage: 60,
                                    pointsLeftToMeetUserGoal: (scope.d.isDiagnosticComplete) ? (userGoalForSubject - estimatedScoreForSubject) : 0,
                                    showScore: (+subjectId !== 9)
                                };
                            });


                            // var subjectOrder = {
                            //     [SubjectEnum.ENGLISH.enum]: 0,
                            //     [SubjectEnum.MATH.enum]: 1,
                            //     [SubjectEnum.READING.enum]: 2,
                            //     [SubjectEnum.SCIENCE.enum]: 3,
                            //     [SubjectEnum.WRITING.enum]: 4
                            // };
                            //
                            // angular.forEach(estimatedScore, function (estimatedScoreForSubject, subjectId) {
                            //     var subjectIndex = subjectOrder[subjectId];
                            //     var userGoalForSubject = (userGoals) ? userGoals[subjectEnumToValMap[subjectId]] : 0;
                            //     scope.d.widgetItems.push({
                            //         subjectId: subjectId,
                            //         estimatedScore: (scope.d.isDiagnosticComplete) ? estimatedScoreForSubject : 0,
                            //         estimatedScorePercentage: (scope.d.isDiagnosticComplete) ? calcPercentage(estimatedScoreForSubject) : 0,
                            //         // userGoal: userGoalForSubject,
                            //         userGoal: 25,
                            //         // userGoalPercentage: calcPercentage(userGoalForSubject),
                            //         userGoalPercentage: 60,
                            //         pointsLeftToMeetUserGoal: (scope.d.isDiagnosticComplete) ? (userGoalForSubject - estimatedScoreForSubject) : 0,
                            //         showScore: (+subjectId !== 9)
                            //     });
                            // });

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
                        // return (correct / appConstants.MAX_ESTIMATED_SCORE) * 100;
                        return (correct / 600) * 100;
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
    );
})(angular);

