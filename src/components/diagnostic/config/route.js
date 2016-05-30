(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('diagnostic', {
                    url: '/diagnostic?skipIntro',
                    templateUrl: 'components/diagnostic/templates/workoutsDiagnostic.template.html',
                    resolve: {
                        currentState: function currentState(WorkoutsDiagnosticFlow, $stateParams) {
                            'ngInject';
                            return WorkoutsDiagnosticFlow.getDiagnosticFlowCurrentState(null, $stateParams.skipIntro);
                        }
                    },
                    controller: 'WorkoutsDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('diagnostic.intro', {
                    url: '/intro/:id/:subjectId/:order',
                    templateUrl: 'components/diagnostic/templates/workoutsDiagnosticIntro.template.html',
                    controller: 'WorkoutsDiagnosticIntroController',
                    controllerAs: 'vm'
                })
                .state('diagnostic.exercise', {
                    url: '/exercise/:id/:sectionId',
                    templateUrl: 'components/diagnostic/templates/workoutsDiagnosticExercise.template.html',
                    controller: 'WorkoutsDiagnosticExerciseController',
                    controllerAs: 'vm',
                    resolve: {
                        exerciseData: function exerciseData($q, ExamSrv, $stateParams, ExerciseTypeEnum, ExerciseResultSrv) {
                            'ngInject';
                            var examId = +$stateParams.id;
                            var sectionId = +$stateParams.sectionId;
                            var getExamProm = ExamSrv.getExam(examId);
                            var getSectionProm = ExamSrv.getExamSection(sectionId);
                            var getExamResultProm = ExerciseResultSrv.getExamResult(examId);
                            return $q.all([getExamProm, getSectionProm, getExamResultProm]).then(function (resArr) {
                                var examObj = resArr[0];
                                var section = resArr[1];
                                var examResultObj = resArr[2];
                                var getSectionResultProm = ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, sectionId, examId, examObj.sections.length);
                                return getSectionResultProm.then(function (sectionResult) {
                                    if (!sectionResult.questionResults.length) {
                                        sectionResult.questionResults = obj.isDiagnostic ? [] : section.questions.map(function (question) {
                                            return { questionId: question.id };
                                        });
                                        sectionResult.duration = 0;
                                    }

                                    examResultObj.$save();

                                    return {
                                        exerciseTypeId: sectionResult.exerciseTypeId,
                                        questionsData: section,
                                        resultsData: sectionResult,
                                        exam: examObj,
                                        examResult: examResultObj
                                    };
                                });
                            });
                        }
                    },
                    onExit: function (exerciseData, WorkoutsDiagnosticFlow) {
                        'ngInject';
                            var questionResults = exerciseData.resultsData.questionResults;
                            var currentSection = WorkoutsDiagnosticFlow.getCurrentSection();
                            if (currentSection.done) {
                                WorkoutsDiagnosticFlow.markSectionAsDoneToggle(false);
                            } else {
                                if (questionResults[questionResults.length - 1].questionId === currentSection.currentQuestion.id) {
                                    if (questionResults[questionResults.length - 1].userAnswer) {
                                        delete questionResults[questionResults.length - 1].userAnswer;
                                    }
                                } else {
                                    questionResults.pop();
                                    delete questionResults[questionResults.length - 1].userAnswer;
                                }
                                exerciseData.resultsData.$save();
                            }
                    }
                })
                .state('diagnostic.preSummary', {
                    url: '/preSummary',
                    templateUrl: 'components/diagnostic/templates/workoutsDiagnosticPreSummary.template.html',
                    controller: ['$timeout', '$state', function ($timeout, $state) {
                        var VIDEO_DURATION = 6000;
                        $timeout(function () {
                            $state.go('app.workouts.diagnostic.summary');
                        }, VIDEO_DURATION);
                    }],
                    controllerAs: 'vm'
                })
                .state('diagnostic.summary', {
                    url: '/summary',
                    templateUrl: 'components/diagnostic/templates/workoutsDiagnosticSummary.template.html',
                    controller: 'WorkoutsDiagnosticSummaryController',
                    controllerAs: 'vm',
                    resolve: {
                        diagnosticSummaryData: ['EstimatedScoreSrv', 'UserGoalsService', '$q', 'WorkoutsDiagnosticFlow', 'ScoringService', '$log', 'SubjectEnum',
                            function (EstimatedScoreSrv, UserGoalsService, $q, WorkoutsDiagnosticFlow, ScoringService, $log, SubjectEnum) {
                                'ngInject';
                                var userStatsProm = EstimatedScoreSrv.getEstimatedScores();
                                var userGoalsProm = UserGoalsService.getGoals();
                                var diagnosticResult = WorkoutsDiagnosticFlow.getDiagnostic();
                                return $q.all([userGoalsProm, userStatsProm, diagnosticResult]).then(function (results) {
                                    var diagnosticScoresObjToArr = [];
                                    angular.forEach(results[1], function (value, key) {
                                        // exclude writing in diagnostic
                                        if (+key !== SubjectEnum.WRITING.enum) {
                                            diagnosticScoresObjToArr.push(value);
                                        }
                                    });
                                    return ScoringService.getTotalScoreResult(diagnosticScoresObjToArr).then(function (totalScore) {
                                        if (!totalScore) {
                                            $log.error('diagnosticSummaryData resolve of route app.workouts.diagnostic.summary: totalScore is empty! result:', totalScore);
                                        }
                                        return {
                                            userGoals: results[0],
                                            userStats: results[1],
                                            diagnosticResult: results[2],
                                            compositeScore: totalScore
                                        };
                                    });
                                });
                            }]
                    }
                });
        }]);
})(angular);
