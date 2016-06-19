(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.tests', {
                    url: '/tests',
                    template: '<ui-view></ui-view>'
                })
                .state('app.tests.roadmap', {
                    url: '/roadmap?exam',
                    templateUrl: 'components/tests/templates/testsRoadmap.template.html',
                    resolve: {
                        testsData: function (ExamSrv, ExerciseResultSrv, $q) {
                            return ExamSrv.getAllExams(true).then(function (exams) {
                                var examResultsProms = [];
                                angular.forEach(exams, function (exam) {
                                    examResultsProms.push(ExerciseResultSrv.getExamResult(exam.id, true));
                                });
                                return $q.all(examResultsProms).then(function (examsResults) {
                                    return {
                                        exams: exams,
                                        examsResults: examsResults
                                    };
                                });
                            });
                        },
                        diagnosticData: function (WorkoutsDiagnosticFlow) {
                            return WorkoutsDiagnosticFlow.getDiagnostic().then(function (result) {
                                return (result.isComplete) ? result.isComplete : false;
                            });
                        }
                    },
                    controller: 'TestsRoadMapController',
                    controllerAs: 'vm'
                })
                .state('app.tests.section', {
                    url: '/section/:examId/:sectionId',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsWorkoutController',
                    resolve: {
                        exerciseData: function exerciseData($q, ExamSrv, $stateParams, ExerciseTypeEnum, ExerciseResultSrv, $state, $filter) {
                            var examId = +$stateParams.examId;
                            var sectionId = +$stateParams.sectionId;
                            var getSectionProm = ExamSrv.getExamSection(sectionId);
                            var getExam = ExamSrv.getExam(examId);
                            var getExamResultProm = ExerciseResultSrv.getExamResult(examId);
                            return $q.all([getExam, getExamResultProm]).then(function (results) {
                                var examExercise = results[0];
                                var examResultsExercise = results[1];
                                var getExerciseResultProm = ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, sectionId, examId, examExercise.sections.length);
                                return {
                                    headerTitlePrefix: $filter('translate')('TEST_TEST.SECTION'),
                                    exerciseProm: getSectionProm,
                                    exerciseResultProm: getExerciseResultProm,
                                    exerciseTypeId: ExerciseTypeEnum.SECTION.enum,
                                    examData: examExercise,
                                    examResult: examResultsExercise,
                                    headerExitAction: function () {
                                        $state.go('app.tests.roadmap', {exam: $stateParams.examId});
                                    }
                                };
                            });
                        }
                    },
                    controllerAs: 'vm'
                })
                .state('app.tests.section.intro', {
                    templateUrl: 'components/tests/templates/testsSectionIntro.template.html',
                    controller: 'TestsSectionIntroController',
                    controllerAs: 'vm'
                });
                /*.state('app.tests.section.exercise', {
                    views: {
                        '@app': {
                            templateUrl: 'app/workouts/templates/workoutsWorkoutExercise.template.html',
                            controller: 'WorkoutsWorkoutExerciseController',
                            controllerAs: 'vm'
                        }
                    },
                    onExit: function (exerciseData) {
                        if (angular.isDefined(exerciseData.resultsData)) {
                            exerciseData.resultsData.$save();
                        }
                    }
                })
                .state('app.tests.section.summary', {
                    views: {
                        '@app': {
                            templateUrl: 'app/workouts/templates/workoutsWorkoutSummary.template.html',
                            controller: 'WorkoutsWorkoutSummaryController',
                            controllerAs: 'vm'
                        }
                    }
                });*/
        }]);
})(angular);
