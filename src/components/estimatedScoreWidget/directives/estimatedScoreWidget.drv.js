// export function estimatedScoreWidgetDirective(appConstants, $q, UserGoalsService, EstimatedScoreSrv, SubjectEnum, $mdDialog, $timeout, WorkoutsDiagnosticFlow) {
//     'ngInject';
//
//     var previousValues;
//
//     var directive = {
//         templateUrl: 'app/components/estimatedScore/estimatedScoreWidget.template.html',
//         require: '?ngModel',
//         restrict: 'E',
//         scope: {
//             isNavMenu: '@'
//         },
//         link: function (scope, element, attrs, ngModelCtrl) {
//             scope.vm = {};
//
//             var isNavMenuFlag = (scope.isNavMenu === 'true');
//             var getEstimatedScoreProm = EstimatedScoreSrv.getEstimatedScores();
//             var isDiagnosticCompletedProm = WorkoutsDiagnosticFlow.isDiagnosticCompleted();
//             var subjectEnumToValMap = SubjectEnum.getEnumMap();
//
//             if (isNavMenuFlag) angular.element.addClass(element[0], 'is-nav-menu');
//
//             function adjustWidgetData(userGoals) {
//                 $q.all([getEstimatedScoreProm, isDiagnosticCompletedProm]).then(function (res) {
//                     var estimatedScore = res[0];
//                     var isDiagnosticCompleted = res[1];
//                     scope.vm.isDiagnosticComplete = isDiagnosticCompleted;
//                     scope.vm.estimatedCompositeScore = isDiagnosticCompleted ? estimatedScore[SubjectEnum.MATH.enum] + estimatedScore[SubjectEnum.VERBAL.enum] : '-';
//                     scope.vm.userCompositeGoal = (userGoals) ? userGoals.totalScore : '-';
//                     scope.vm.widgetItems = [];
//
//                     var subjectToIndexMap = {
//                         [SubjectEnum.MATH.enum]: 0,
//                         [SubjectEnum.VERBAL.enum]: 1
//                     };
//
//                     if (isNavMenuFlag) {
//                         subjectToIndexMap[SubjectEnum.ESSAY.enum] = 2;
//                     }
//
//                     angular.forEach(estimatedScore, function (estimatedScoreForSubject, subjectId) {
//                         var subjectIndex = subjectToIndexMap[subjectId];
//                         var userGoalForSubject = (userGoals) ? userGoals[subjectEnumToValMap[subjectId]] : 0;
//                         scope.vm.widgetItems[subjectIndex] = {
//                             subjectId: subjectId,
//                             estimatedScore: (scope.vm.isDiagnosticComplete) ? estimatedScoreForSubject : 0,
//                             estimatedScorePercentage: (scope.vm.isDiagnosticComplete) ? calcPercentage(estimatedScoreForSubject) : 0,
//                             userGoal: userGoalForSubject,
//                             userGoalPercentage: calcPercentage(userGoalForSubject),
//                             pointsLeftToMeetUserGoal: (scope.vm.isDiagnosticComplete) ? (userGoalForSubject - estimatedScoreForSubject) : 0,
//                             showScore: (+subjectId !== SubjectEnum.ESSAY.enum)
//                         };
//                     });
//
//                     if (!previousValues) {
//                         scope.vm.subjectsScores = scope.vm.widgetItems;
//                     } else {
//                         scope.vm.subjectsScores = previousValues;
//                         $timeout(function () {
//                             scope.vm.enableEstimatedScoreChangeAnimation = true;
//                             $timeout(function () {
//                                 scope.vm.subjectsScores = scope.vm.widgetItems;
//                             }, 1200);
//                         });
//                     }
//
//                     previousValues = scope.vm.widgetItems;
//                 });
//             }
//
//             function calcPercentage(correct) {
//                 return (correct / appConstants.MAX_ESTIMATED_SCORE) * 100;
//             }
//
//             // TODO: this should come from a service, duplicated from znk-header
//             scope.vm.showGoalsEdit = function () {
//                 $mdDialog.show({
//                     controller: 'SettingsEditGoalsController',
//                     controllerAs: 'vm',
//                     templateUrl: 'app/settings/templates/settingsEditGoals.template.html',
//                     clickOutsideToClose: false
//                 });
//             };
//
//             if (isNavMenuFlag) {
//                 scope.vm.onSubjectClick = function (subjectId) {
//                     ngModelCtrl.$setViewValue(+subjectId);
//                     scope.vm.currentSubject = subjectId;
//                 };
//
//                 ngModelCtrl.$render = function () {
//                     scope.vm.currentSubject = '' + ngModelCtrl.$viewValue;
//                 };
//             }
//
//             UserGoalsService.getGoals().then(function (userGoals) {
//                 scope.$watchCollection(function () {
//                     return userGoals;
//                 }, function (newVal) {
//                     adjustWidgetData(newVal);
//                 });
//             });
//         }
//     };
//
//     return directive;
// }
