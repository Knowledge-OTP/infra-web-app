(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').config(
        function ($stateProvider) {
            'ngInject';

            $stateProvider
                .state('app.diagnostic', {
                    url: '/diagnostic/:skipIntro/:forceSkipIntro',
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnostic.template.html',
                    resolve: {
                        currentState: function currentState(WorkoutsDiagnosticFlow, $stateParams) {
                            'ngInject';// jshint ignore:line
                            return WorkoutsDiagnosticFlow.getDiagnosticFlowCurrentState(null, $stateParams.skipIntro, $stateParams.forceSkipIntro);
                        }
                    },
                    controller: 'WorkoutsDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('app.diagnostic.intro', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticIntro.template.html',
                    controller: 'WorkoutsDiagnosticIntroController',
                    controllerAs: 'vm'
                })
                .state('app.diagnostic.exercise', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticExercise.template.html',
                    controller: 'WorkoutsDiagnosticExerciseController',
                    controllerAs: 'vm',
                    resolve: {
                        exerciseData: function exerciseData($q, ExamSrv, ExerciseTypeEnum, ExerciseResultSrv, WorkoutsDiagnosticFlow) {
                            'ngInject';// jshint ignore:line
                            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                            var examId = WorkoutsDiagnosticFlow.getDiagnosticSettings().diagnosticId;
                            var sectionId = WorkoutsDiagnosticFlow.getCurrentState().params.sectionId;
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
                                            return {
                                                questionId: question.id,
                                                categoryId: question.categoryId,
                                                categoryId2: question.categoryId2
                                            };
                                        }) : [];
                                        sectionResult.duration = 0;
                                    }

                                    sectionResult.$save();

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
                        'ngInject'; // jshint ignore:line
                        var currentSection = WorkoutsDiagnosticFlow.getCurrentSection();

                        if (currentSection.done) {
                            WorkoutsDiagnosticFlow.markSectionAsDoneToggle(false);
                            return;
                        }

                        var questionResults = exerciseData.resultsData.questionResults;
                        var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                        var lastQuestion = questionResults[questionResults.length - 1];

                        var isCurrentQuestion = function (question) {
                            return question.questionId === currentSection.currentQuestion.id;
                        };
                        var isLastQuestion = function () {
                            return isCurrentQuestion(lastQuestion);
                        };

                        if (currentSection.currentQuestion) {
                            if (!diagnosticSettings.isFixed) {
                                if (isLastQuestion()) {
                                    delete lastQuestion.userAnswer;
                                } else {
                                    questionResults.pop();
                                    delete lastQuestion.userAnswer;
                                }
                            } else {
                                var answersArr = questionResults.filter(isCurrentQuestion);
                                if (answersArr.length > 0) {
                                    delete answersArr[0].userAnswer;
                                }
                            }
                            exerciseData.resultsData.$save();
                        }
                    }
                })
                .state('app.diagnostic.preSummary', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticPreSummary.template.html',
                    controller: ['$timeout', '$state', function ($timeout, $state, ENV, WorkoutsDiagnosticFlow) {
                        var VIDEO_DURATION = 6000;
                        $timeout(function () {
                            WorkoutsDiagnosticFlow.getMarketingToefl().then(function (marketingObj) {
                                if (marketingObj && marketingObj.status) {
                                    var state = marketingObj.status === 2 ? 'email' : 'purchase';
                                    window.location.href = `${ENV.zinkerzWebsiteBaseUrl}myzinkerz/toefl/${state}`;
                                } else {
                                    $state.go('app.diagnostic.summary');
                                }
                            });
                        }, VIDEO_DURATION);
                    }],
                    controllerAs: 'vm'
                })
                .state('app.diagnostic.summary', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticSummary.template.html',
                    controller: 'WorkoutsDiagnosticSummaryController',
                    controllerAs: 'vm',
                    resolve: {
                        diagnosticSummaryData: function (EstimatedScoreSrv, UserGoalsService, $q, WorkoutsDiagnosticFlow, ScoringService, $log) {
                            'ngInject';// jshint ignore:line
                            var userStatsProm = EstimatedScoreSrv.getLatestEstimatedScore().then(function (latestScores) {
                                var estimatedScores = {};

                                angular.forEach(latestScores, function (estimatedScore, subjectId) {
                                    estimatedScores[subjectId] = estimatedScore.score ? Math.round(estimatedScore.score) : null;
                                });
                                return estimatedScores;
                            });
                            var userGoalsProm = UserGoalsService.getGoals();
                            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                            var diagnosticResult = WorkoutsDiagnosticFlow.getDiagnostic();
                            var scoringLimits = ScoringService.getScoringLimits();
                            return $q.all([userGoalsProm, userStatsProm, diagnosticResult]).then(function (results) {
                                var diagnosticScoresObjToArr = [];
                                var userStats = results[1];
                                angular.forEach(diagnosticSettings.summary.subjects, function (subject) {
                                    var curStat = userStats[subject.id];
                                    if (curStat) {
                                        diagnosticScoresObjToArr.push(curStat);
                                    }
                                });
                                var getExamScoreFnProm = ScoringService.getExamScoreFn(diagnosticScoresObjToArr);
                                return getExamScoreFnProm.then(function (examScoreFn) {
                                    var totalScore = examScoreFn(diagnosticScoresObjToArr);
                                    if (!totalScore) {
                                        $log.error('diagnosticSummaryData resolve of route diagnostic.summary: totalScore is empty! result:', totalScore);
                                    }
                                    return {
                                        userGoals: results[0],
                                        userStats: userStats,
                                        diagnosticResult: results[2],
                                        compositeScore: totalScore,
                                        scoringLimits: scoringLimits
                                    };
                                });
                            });
                        }
                    }
                });
        });
})(angular);
