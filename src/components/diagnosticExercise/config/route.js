(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('diagnostic', {
                    url: '/diagnostic?skipIntro',
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnostic.template.html',
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
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticIntro.template.html',
                    controller: 'WorkoutsDiagnosticIntroController',
                    controllerAs: 'vm'
                })
                .state('diagnostic.exercise', {
                    url: '/exercise/:id/:sectionId',
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticExercise.template.html',
                    controller: 'WorkoutsDiagnosticExerciseController',
                    controllerAs: 'vm',
                    resolve: {
                        exerciseData: function exerciseData($q, ExamSrv, $stateParams, ExerciseTypeEnum, ExerciseResultSrv, WorkoutsDiagnosticFlow) {
                            'ngInject';
                            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
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
                                        sectionResult.questionResults = diagnosticSettings.isFixed ? section.questions.map(function (question) {
                                            return { questionId: question.id };
                                        }) : [];
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
                                if (currentSection.currentQuestion &&
                                    questionResults[questionResults.length - 1].questionId === currentSection.currentQuestion.id) {
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
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticPreSummary.template.html',
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
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticSummary.template.html',
                    controller: 'WorkoutsDiagnosticSummaryController',
                    controllerAs: 'vm',
                    resolve: {
                        diagnosticSummaryData: ['EstimatedScoreSrv', 'UserGoalsService', '$q', 'WorkoutsDiagnosticFlow', 'ScoringService', '$log', 'SubjectEnum',
                            function (EstimatedScoreSrv, UserGoalsService, $q, WorkoutsDiagnosticFlow, ScoringService, $log, SubjectEnum) {
                                'ngInject';
                                var userStatsProm = EstimatedScoreSrv.getLatestEstimatedScore().then(function (latestScores) {
                                    var estimatedScores = {};
                                    angular.forEach(latestScores, function (estimatedScore, subjectId) {
                                        estimatedScores[subjectId] = Math.round(estimatedScore.score) || 0;
                                    });
                                    return estimatedScores;
                                });
                                var userGoalsProm = UserGoalsService.getGoals();
                                var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                                var diagnosticResult = WorkoutsDiagnosticFlow.getDiagnostic();
                                return $q.all([userGoalsProm, userStatsProm, diagnosticResult]).then(function (results) {
                                    var diagnosticScoresObjToArr = [];
                                    var userStats = results[1];
                                    angular.forEach(diagnosticSettings.summary.subjects, function (subject) {
                                        var curStat = userStats[subject.id];
                                        if (curStat) {
                                            diagnosticScoresObjToArr.push(curStat);
                                        }
                                    });
                                    return ScoringService.getTotalScoreResult(diagnosticScoresObjToArr).then(function (totalScore) {
                                        if (!totalScore) {
                                            $log.error('diagnosticSummaryData resolve of route diagnostic.summary: totalScore is empty! result:', totalScore);
                                        }
                                        return {
                                            userGoals: results[0],
                                            userStats: userStats,
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
