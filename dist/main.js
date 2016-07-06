(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app', [
        'znk.infra-web-app.angularMaterialOverride',
        'znk.infra-web-app.config',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.diagnosticExercise',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra-web-app.estimatedScoreWidget',
        'znk.infra-web-app.iapMsg',
        'znk.infra-web-app.infraWebAppZnkExercise',
        'znk.infra-web-app.invitation',
        'znk.infra-web-app.onBoarding',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.socialSharing',
        'znk.infra-web-app.uiTheme',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.workoutsRoadmap',
        'znk.infra-web-app.znkExerciseHeader',
        'znk.infra-web-app.znkHeader'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.angularMaterialOverride', [
        'ngMaterial'
    ]);
})(angular);

angular.module('znk.infra-web-app.angularMaterialOverride').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config', []).config([
        function(){}
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('WebAppInfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var webAppInfraConfigSrv = {};

                    return webAppInfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.config').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic', [
        'znk.infra.exerciseResult',
        'znk.infra.exerciseUtility'
        
    ]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.diagnostic').provider('DiagnosticSrv', function () {
        var _diagnosticExamIdGetter;
        this.setDiagnosticExamIdGetter = function(diagnosticExamIdGetter){
            _diagnosticExamIdGetter = diagnosticExamIdGetter;
        };

        this.$get = ["$log", "$q", "ExerciseResultSrv", "ExerciseStatusEnum", "$injector", function($log, $q, ExerciseResultSrv, ExerciseStatusEnum, $injector){
            'ngInject';

            var DiagnosticSrv = {};

            DiagnosticSrv.getDiagnosticExamId = function(){
                if(!_diagnosticExamIdGetter){
                    var errMsg = 'DiagnosticSrv: diagnostic exam id was not set';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                var diagnosticExamId;
                if(angular.isFunction(_diagnosticExamIdGetter)){
                    diagnosticExamId = $injector.invoke(_diagnosticExamIdGetter);
                }else{
                    diagnosticExamId = _diagnosticExamIdGetter;
                }
                return $q.when(diagnosticExamId);
            };

            DiagnosticSrv.getDiagnosticExamResult = function(){
                return DiagnosticSrv.getDiagnosticExamId().then(function(diagnosticExamId) {
                    return ExerciseResultSrv.getExamResult(diagnosticExamId, true);
                });
            };

            DiagnosticSrv.getDiagnosticStatus = function(){
                return DiagnosticSrv.getDiagnosticExamResult().then(function(diagnosticExamResult){
                    if(diagnosticExamResult === null){
                        return ExerciseStatusEnum.NEW.enum;
                    }

                    if(diagnosticExamResult.isComplete){
                        return ExerciseStatusEnum.COMPLETED.enum;
                    }

                    var startedSectionsNum= Object.keys(diagnosticExamResult.sectionResults);
                    return startedSectionsNum ? ExerciseStatusEnum.ACTIVE.enum : ExerciseStatusEnum.NEW.enum;
                });
            };

            DiagnosticSrv.isDiagnosticCompleted = function(){
                return DiagnosticSrv.getDiagnosticStatus().then(function(diagnosticStatus){
                    return diagnosticStatus === ExerciseStatusEnum.COMPLETED.enum;
                });
            };

            return DiagnosticSrv;
        }];
    });
})(angular);

angular.module('znk.infra-web-app.diagnostic').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise', [
        'pascalprecht.translate',
        'ngMaterial',
        'chart.js',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.analytics',
        'znk.infra.exams',
        'znk.infra.estimatedScore',
        'znk.infra.exerciseUtility',
        'znk.infra.exerciseResult',
        'znk.infra.znkExercise',
        'znk.infra.scroll',
        'znk.infra.stats',
        'znk.infra.scoring',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra-web-app.znkExerciseHeader',
        'znk.infra.general'
    ]).config(["SvgIconSrvProvider", function(SvgIconSrvProvider) {
        'ngInject';
        var svgMap = {
            'diagnostic-dropdown-arrow-icon': 'components/diagnosticExercise/svg/dropdown-arrow.svg',
            'diagnostic-check-mark': 'components/diagnosticExercise/svg/check-mark-icon.svg',
            'diagnostic-flag-icon': 'components/diagnosticExercise/svg/flag-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').config(
        ["$stateProvider", function ($stateProvider) {
            'ngInject';

            $stateProvider
                .state('app.diagnostic', {
                    url: '/diagnostic?skipIntro',
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnostic.template.html',
                    resolve: {
                        currentState: ["WorkoutsDiagnosticFlow", "$stateParams", function currentState(WorkoutsDiagnosticFlow, $stateParams) {
                            'ngInject';// jshint ignore:line
                            return WorkoutsDiagnosticFlow.getDiagnosticFlowCurrentState(null, $stateParams.skipIntro);
                        }]
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
                        exerciseData: ["$q", "ExamSrv", "ExerciseTypeEnum", "ExerciseResultSrv", "WorkoutsDiagnosticFlow", function exerciseData($q, ExamSrv, ExerciseTypeEnum, ExerciseResultSrv, WorkoutsDiagnosticFlow) {
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
                                            return {questionId: question.id};
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
                        }]
                    },
                    onExit: ["exerciseData", "WorkoutsDiagnosticFlow", function (exerciseData, WorkoutsDiagnosticFlow) {
                        'ngInject'; // jshint ignore:line
                        var currentSection = WorkoutsDiagnosticFlow.getCurrentSection();

                        if (currentSection.done) {
                            WorkoutsDiagnosticFlow.markSectionAsDoneToggle(false);
                            return;
                        }

                        var questionResults = exerciseData.resultsData.questionResults;
                        var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                        var lastQuestion = questionResults[questionResults.length - 1];

                        var isCurrentQuestion = function(question) {
                            return question.questionId === currentSection.currentQuestion.id;
                        };
                        var isLastQuestion = function() {
                            return isCurrentQuestion(lastQuestion);
                        };

                        if (currentSection.currentQuestion) {
                            if(!diagnosticSettings.isFixed) {
                                if(isLastQuestion()) {
                                    delete lastQuestion.userAnswer;
                                } else {
                                    questionResults.pop();
                                    delete lastQuestion.userAnswer;
                                }
                            } else {
                                var answersArr = questionResults.filter(isCurrentQuestion);
                                if(answersArr.length > 0) {
                                    delete answersArr[0].userAnswer;
                                }
                            }
                            exerciseData.resultsData.$save();
                        }
                    }]
                })
                .state('app.diagnostic.preSummary', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticPreSummary.template.html',
                    controller: ['$timeout', '$state', function ($timeout, $state) {
                        var VIDEO_DURATION = 6000;
                        $timeout(function () {
                            $state.go('app.diagnostic.summary');
                        }, VIDEO_DURATION);
                    }],
                    controllerAs: 'vm'
                })
                .state('app.diagnostic.summary', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticSummary.template.html',
                    controller: 'WorkoutsDiagnosticSummaryController',
                    controllerAs: 'vm',
                    resolve: {
                        diagnosticSummaryData: ["EstimatedScoreSrv", "UserGoalsService", "$q", "WorkoutsDiagnosticFlow", "ScoringService", "$log", function (EstimatedScoreSrv, UserGoalsService, $q, WorkoutsDiagnosticFlow, ScoringService, $log) {
                            'ngInject';// jshint ignore:line
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
                        }]
                    }
                });
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticController', ["$state", "currentState", "$translatePartialLoader", function($state, currentState, $translatePartialLoader) {
        'ngInject';

        var EXAM_STATE = 'app.diagnostic';

        $translatePartialLoader.addPart('diagnosticExercise');

        $state.go(EXAM_STATE + currentState.state, currentState.params);
    }]);
})(angular);


/* eslint object-shorthand: 0 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticExerciseController',
        ["ZnkExerciseSlideDirectionEnum", "ZnkExerciseViewModeEnum", "exerciseData", "WorkoutsDiagnosticFlow", "$location", "$log", "$state", "ExerciseResultSrv", "ExerciseTypeEnum", "$q", "$timeout", "ZnkExerciseUtilitySrv", "$rootScope", "ExamTypeEnum", "exerciseEventsConst", "$filter", "SubjectEnum", "znkAnalyticsSrv", "StatsEventsHandlerSrv", function (ZnkExerciseSlideDirectionEnum, ZnkExerciseViewModeEnum, exerciseData, WorkoutsDiagnosticFlow, $location,
                  $log, $state, ExerciseResultSrv, ExerciseTypeEnum, $q, $timeout, ZnkExerciseUtilitySrv,
                  $rootScope, ExamTypeEnum, exerciseEventsConst, $filter, SubjectEnum, znkAnalyticsSrv, StatsEventsHandlerSrv) {
            'ngInject';
            var self = this;
            this.subjectId = exerciseData.questionsData.subjectId;
            // current section data
            var questions = exerciseData.questionsData.questions;
            var resultsData = exerciseData.resultsData;
            var translateFilter = $filter('translate');
            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
            var nextQuestion;

            function _isUndefinedUserAnswer(questionResults) {
                return questionResults.filter(function (val) {
                    return angular.isUndefined(val.userAnswer);
                });
            }

            function _getInitNumQuestion(questionResults) {
                var num = 0;
                if (questionResults.length > 0) {
                    var isUndefinedUserAnswer = _isUndefinedUserAnswer(questionResults);
                    if (!diagnosticSettings.isFixed) {
                        if (isUndefinedUserAnswer.length === 0) {
                            num = questionResults.length;
                        } else {
                            num = questionResults.length - 1;
                        }
                    } else {
                        num = questionResults.length - isUndefinedUserAnswer.length;
                    }
                }
                return num;
            }

            function _goToCurrentState(flagForPreSummery) {
                WorkoutsDiagnosticFlow.getDiagnosticFlowCurrentState(flagForPreSummery).then(function (currentState) {
                    $state.go('^' + currentState.state, currentState.params);
                });
            }

            function _setNumSlideForNgModel(num) {
                self.numSlide = num;
            }

            function _onDoneSaveResultsData() {
                exerciseData.resultsData.isComplete = true;
                exerciseData.resultsData.endedTime = Date.now();
                exerciseData.resultsData.subjectId = exerciseData.questionsData.subjectId;
                exerciseData.resultsData.exerciseDescription = exerciseData.exam.name;
                exerciseData.resultsData.exerciseName = translateFilter('ZNK_EXERCISE.SECTION');
                exerciseData.resultsData.$save();
                exerciseData.exam.typeId = ExamTypeEnum.DIAGNOSTIC.enum;//  todo(igor): current diagnostic type is incorrect
                $rootScope.$broadcast(exerciseEventsConst.section.FINISH, exerciseData.questionsData,
                    exerciseData.resultsData, exerciseData.exam);
                StatsEventsHandlerSrv.addNewExerciseResult(ExerciseTypeEnum.SECTION.enum, exerciseData.questionsData, exerciseData.resultsData);
            }

            function _isLastSubject() {
                return WorkoutsDiagnosticFlow.getDiagnostic().then(function (examResult) {
                    var isLastSubject = false;
                    var sectionResultsKeys = Object.keys(examResult.sectionResults);
                    if (sectionResultsKeys.length === exerciseData.exam.sections.length) {
                        var sectionsByOrder = exerciseData.exam.sections.sort(function (a, b) {
                            return a.order > b.order;
                        });
                        var lastSection = sectionsByOrder[sectionsByOrder.length - 1];
                        var lastIdStr = lastSection.id.toString();
                        var isMatchingLastSectionToResults = sectionResultsKeys.findIndex(function (element) {
                                return element === lastIdStr;
                            }) !== -1;
                        if (!isMatchingLastSectionToResults) {
                            $log.error('WorkoutsDiagnosticExerciseController _isLastSubject: can\'t find index of the last section that match one section results, that\'s not suppose to happen!');
                            return $q.reject();
                        }
                        if (isMatchingLastSectionToResults) {
                            var getSectionResultProm = ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, lastSection.id, exerciseData.exam.id);
                            return getSectionResultProm.then(function (result) {
                                if (result.isComplete) {
                                    isLastSubject = true;
                                }
                                return isLastSubject;
                            });
                        }
                    }
                    return false;
                });
            }

            var numQuestionCounter = _getInitNumQuestion(exerciseData.resultsData.questionResults);

            function _getNumberOfQuestions() {
                return diagnosticSettings.isFixed ? questions.length : diagnosticSettings.questionsPerSubject;
            }

            function _isLastQuestion() {
                return numQuestionCounter === _getNumberOfQuestions();
            }

            function _getCurrentIndex() {
                return self.actions.getCurrentIndex();
            }

            function _isAnswerCorrect() {
                var currentIndex = _getCurrentIndex();
                var result = self.resultsData.questionResults[currentIndex];
                return result.isAnsweredCorrectly;
            }

            function pushSlide(newQuestion) {
                self.resultsData.questionResults.push(newQuestion.result);
                self.resultsData.questionResults = angular.copy(self.resultsData.questionResults);
                self.questions.push(newQuestion.question);
                $log.debug('WorkoutsDiagnosticExerciseController pushSlide: push data', self.questionResults, self.questions);
            }

            function _getNewSlideType(questionId) {
                var type;
                $log.debug('WorkoutsDiagnosticExerciseController _getNewSlideType: initial func', questionId);
                if (!nextQuestion) {
                    nextQuestion = questionId;
                    type = 'push';
                } else if (questionId === nextQuestion) {
                    type = 'same';
                } else if (questionId !== nextQuestion) {
                    nextQuestion = questionId;
                    type = 'pop_push';
                }
                $log.debug('WorkoutsDiagnosticExerciseController _getNewSlideType: type returned value', type);
                return type;
            }

            function popSlide() {
                self.resultsData.questionResults.pop();
                self.resultsData.questionResults = angular.copy(self.resultsData.questionResults);
                self.questions.pop();
                $log.debug('WorkoutsDiagnosticExerciseController popSlide: pop data', self.questionResults, self.questions);
            }

            function _handleNewSlide(newQuestion) {
                var type = _getNewSlideType(newQuestion.question.id);
                switch (type) {
                    case 'push':
                        pushSlide(newQuestion);
                        $log.debug('WorkoutsDiagnosticExerciseController _handleNewSlide: push question', newQuestion);
                        break;
                    case 'pop_push':
                        $timeout(function () {
                            popSlide();
                        });
                        $timeout(function () {
                            pushSlide(newQuestion);
                        });
                        $log.debug('WorkoutsDiagnosticExerciseController _handleNewSlide: pop_push question', newQuestion);
                        break;
                    case 'same':
                        $log.debug('WorkoutsDiagnosticExerciseController _handleNewSlide: same question');
                        break;
                    default:
                        $log.error('WorkoutsDiagnosticExerciseController _handleNewSlide: should have a type of push, pop_push or same! type:', type);
                }
            }

            _setNumSlideForNgModel(numQuestionCounter);


            if (exerciseData.questionsData.subjectId === SubjectEnum.READING.enum) {     // adding passage title to reading questions
                var groupDataTypeTitle = {};
                var PASSAGE = translateFilter('ZNK_EXERCISE.PASSAGE');
                var groupDataCounter = 0;
                for (var i = 0; i < questions.length; i++) {
                    var groupDataId = questions[i].groupDataId;
                    if (angular.isUndefined(groupDataTypeTitle[groupDataId])) {
                        groupDataCounter++;
                        groupDataTypeTitle[groupDataId] = PASSAGE + groupDataCounter;
                    }
                    questions[i].passageTitle = groupDataTypeTitle[groupDataId];
                }
            }

            //  current slide data (should be initialize in every slide)
            var currentDifficulty = diagnosticSettings.levels.medium.num;

            var initSlideIndex;
            var mediumLevelNum = diagnosticSettings.levels.medium.num;

            ZnkExerciseUtilitySrv.setQuestionsGroupData(exerciseData.questionsData.questions, exerciseData.questionsData.questionsGroupData, exerciseData.resultsData.playedAudioArticles);

            // init question and questionResults for znk-exercise
            if (!diagnosticSettings.isFixed) {
                if (resultsData.questionResults.length === 0) {
                    WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, resultsData.questionResults, mediumLevelNum, numQuestionCounter + 1, function (diagnosticFlowResults) {
                        self.questions = [diagnosticFlowResults.question];
                        resultsData.questionResults = [diagnosticFlowResults.result];
                    });
                } else {
                    self.questions = resultsData.questionResults.reduce(function (prevValue, currentValue) {
                        var question = questions.filter(function (element) {
                            return currentValue.questionId === element.id;
                        })[0];
                        prevValue.push(question);
                        return prevValue;
                    }, []);
                    if (_isUndefinedUserAnswer(resultsData.questionResults).length === 0) {
                        WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, resultsData.questionResults, mediumLevelNum, numQuestionCounter + 1, function (diagnosticFlowResults) {
                            self.questions.push(diagnosticFlowResults.question);
                            resultsData.questionResults.push(diagnosticFlowResults.result);
                        });
                    }
                    initSlideIndex = resultsData.questionResults.length - 1;
                    currentDifficulty = self.questions[self.questions.length - 1].difficulty;
                }
            } else {
                self.questions = questions;
                initSlideIndex = numQuestionCounter;
            }

            self.resultsData = resultsData;

            // settings for znkExercise
            self.settings = {
                viewMode: ZnkExerciseViewModeEnum.MUST_ANSWER.enum,
                toolBoxWrapperClass: 'diagnostic-toolbox',
                initSlideDirection: ZnkExerciseSlideDirectionEnum.NONE,
                initPagerDisplay: false,
                onSlideChange: function (value, index) {
                    $log.debug('WorkoutsDiagnosticExerciseController onSlideChange: initial func');
                    WorkoutsDiagnosticFlow.setCurrentQuestion(value.id, index);
                    self.actions.setSlideDirection(ZnkExerciseSlideDirectionEnum.NONE.enum);
                    nextQuestion = void(0);
                    numQuestionCounter = numQuestionCounter + 1;
                    _setNumSlideForNgModel(numQuestionCounter);
                    znkAnalyticsSrv.pageTrack({props: {url: $location.url() + '/index/' + numQuestionCounter + '/questionId/' + (value.id || '')}});
                },
                onQuestionAnswered: function () {
                    $log.debug('WorkoutsDiagnosticExerciseController onQuestionAnswered: initial func');
                    self.actions.setSlideDirection(ZnkExerciseSlideDirectionEnum.LEFT.enum);
                    exerciseData.resultsData.$save();
                    if (_isLastQuestion()) {
                        self.actions.forceDoneBtnDisplay(true);
                        return;
                    }
                    if (!diagnosticSettings.isFixed) {
                        var isAnswerCorrectly = _isAnswerCorrect();
                        var currentIndex = _getCurrentIndex();
                        var newDifficulty = WorkoutsDiagnosticFlow.getDifficulty(currentDifficulty, isAnswerCorrectly,
                            self.resultsData.questionResults[currentIndex].timeSpent);
                        currentDifficulty = newDifficulty;
                        WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, self.resultsData.questionResults, newDifficulty, numQuestionCounter + 1, function (newQuestion) {
                            _handleNewSlide(newQuestion);
                        });
                    }
                },
                onDone: function () {
                    WorkoutsDiagnosticFlow.markSectionAsDoneToggle(true);
                    _onDoneSaveResultsData();
                    _isLastSubject().then(function (isLastSubject) {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'diagnosticSectionCompleted',
                            questionsArr: exerciseData.resultsData.questionResults,
                            props: {
                                sectionId: exerciseData.questionsData.id,
                                order: exerciseData.questionsData.order,
                                subjectId: exerciseData.questionsData.subjectId
                            }
                        });
                        if (isLastSubject) {
                            _goToCurrentState(true);
                        } else {
                            _goToCurrentState();
                        }
                    });
                },
                initForceDoneBtnDisplay: false,
                initSlideIndex: initSlideIndex || 0,
                allowedTimeForExercise: 12 * 60 * 1000
            };

            self.questionsPerSubject = _getNumberOfQuestions();

            this.onClickedQuit = function () {
                $log.debug('WorkoutsDiagnosticExerciseController: click on quit');
                $state.go('app.workoutsRoadmap');
            };
        }]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticIntroController',
        ["WORKOUTS_DIAGNOSTIC_FLOW", "$log", "$state", "WorkoutsDiagnosticFlow", "znkAnalyticsSrv", function(WORKOUTS_DIAGNOSTIC_FLOW, $log, $state, WorkoutsDiagnosticFlow, znkAnalyticsSrv) {
        'ngInject';
            var vm = this;

            vm.params = WorkoutsDiagnosticFlow.getCurrentState().params;
            vm.diagnosticId = WorkoutsDiagnosticFlow.getDiagnosticSettings().diagnosticId;

            WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {
                vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
            });

            this.onClickedQuit = function () {
                $log.debug('WorkoutsDiagnosticIntroController: click on quit, go to roadmap');
                $state.go('app.workoutsRoadmap');
            };

            this.goToExercise = function () {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'diagnosticSectionStarted',
                    props: {
                        sectionId: vm.params.sectionId,
                        order: vm.params.order,
                        subjectId: vm.params.subjectId
                    }
                });
                znkAnalyticsSrv.timeTrack({ eventName: 'diagnosticSectionCompleted' });
                $state.go('app.diagnostic.exercise');
            };
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticSummaryController',
        ["diagnosticSummaryData", "SubjectEnum", "SubjectEnumConst", "WorkoutsDiagnosticFlow", function(diagnosticSummaryData, SubjectEnum, SubjectEnumConst, WorkoutsDiagnosticFlow) {
        'ngInject';

            var self = this;

            var diagnosticScoresObj = diagnosticSummaryData.userStats;
            var goalScoreObj = diagnosticSummaryData.userGoals;
            var diagnosticResultObj = diagnosticSummaryData.diagnosticResult;
            var diagnosticCompositeScore = diagnosticSummaryData.compositeScore;
            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
            var scoringLimits = diagnosticSummaryData.scoringLimits;
            var enumArrayMap = {};
            angular.forEach(SubjectEnum, function (enumObj) {
                enumArrayMap[enumObj.enum] = enumObj;
            });

            function getMaxScore(subjectId) {
                if(scoringLimits.subjects && scoringLimits.subjects.max) {
                    return scoringLimits.subjects.max;
                }
                return scoringLimits.subjects[subjectId] && scoringLimits.subjects[subjectId].max;
            }

            var GOAL = 'Goal';
            var MAX = 'Max';

            if (!diagnosticResultObj.userStats) {
                diagnosticResultObj.userStats = diagnosticScoresObj;
                diagnosticResultObj.compositeScore = diagnosticCompositeScore;
                diagnosticResultObj.$save();
            }

            if (diagnosticResultObj.compositeScore > diagnosticSettings.greatStart) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.GREAT_START';
            } else if (diagnosticResultObj.compositeScore > diagnosticSettings.goodStart) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.GOOD_START';
            } else {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.BAD_START';
            }

            this.compositeScore = diagnosticResultObj.compositeScore;

            var doughnutValues = {};
            for (var subjectId in diagnosticResultObj.userStats) {
                if (diagnosticResultObj.userStats.hasOwnProperty(subjectId)) {
                    var subjectName = enumArrayMap[subjectId].val;
                    doughnutValues[subjectName] = diagnosticResultObj.userStats[subjectId];
                    doughnutValues[subjectName + GOAL] = goalScoreObj[subjectName] > diagnosticResultObj.userStats[subjectId] ? (goalScoreObj[subjectName] - diagnosticResultObj.userStats[subjectId]) : 0;
                    doughnutValues[subjectName + MAX] = getMaxScore(subjectId) - (doughnutValues[subjectName + GOAL] + diagnosticResultObj.userStats[subjectId]);
                }
            }

            function GaugeConfig(_subjectName, _subjectId, colorsArray) {
                this.labels = ['Correct', 'Wrong', 'Unanswered'];
                this.options = {
                    scaleLineWidth: 40,
                    percentageInnerCutout: 92,
                    segmentShowStroke: false,
                    animationSteps: 100,
                    animationEasing: 'easeOutQuint',
                    showTooltips: false
                };
                this.goalPoint = getGoalPoint(goalScoreObj[_subjectName], _subjectId);
                this.data = [doughnutValues[_subjectName], doughnutValues[_subjectName + GOAL], doughnutValues[_subjectName + MAX]];
                this.colors = colorsArray;
                this.subjectName  =  'WORKOUTS_DIAGNOSTIC_SUMMARY.' + angular.uppercase(_subjectName);
                this.score = diagnosticResultObj.userStats[_subjectId];
                this.scoreGoal = goalScoreObj[_subjectName];
            }

            function getGoalPoint(scoreGoal, subjectId) {
                var degree = (scoreGoal / getMaxScore(subjectId)) * 360 - 90;    // 90 - degree offset
                var radius = 52.5;
                var x = Math.cos((degree * (Math.PI / 180))) * radius;
                var y = Math.sin((degree * (Math.PI / 180))) * radius;
                x += 105;
                y += 49;
                return {
                    x: x,
                    y: y
                };
            }
            var dataArray = [];
            angular.forEach(diagnosticSettings.summary.subjects, function(subject) {
                dataArray.push(new GaugeConfig(subject.name, subject.id, subject.colors));
            });

            this.doughnutArray = dataArray;
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').constant('WORKOUTS_DIAGNOSTIC_FLOW', {
        isFixed: false,
        timeLimit: 3 * 60 * 1000,
        questionsPerSubject: 4,
        levels: {
            very_easy: {
                num: 1
            },
            easy: {
                num: 2
            },
            medium: {
                num: 3
            },
            hard: {
                num: 4
            },
            very_hard: {
                num: 5
            }
        }
    });

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').provider('WorkoutsDiagnosticFlow',[function () {

        var _diagnosticSettings;

        this.setDiagnosticSettings = function(diagnosticSettings) {
            _diagnosticSettings = diagnosticSettings;
        };

        this.$get = ['WORKOUTS_DIAGNOSTIC_FLOW', '$log', 'ExerciseTypeEnum', '$q', 'ExamSrv', 'ExerciseResultSrv', 'znkAnalyticsSrv', '$injector',
            function (WORKOUTS_DIAGNOSTIC_FLOW, $log, ExerciseTypeEnum, $q, ExamSrv, ExerciseResultSrv, znkAnalyticsSrv, $injector) {
            var workoutsDiagnosticFlowObjApi = {};
            var currentSectionData = {};
            var countDifficultySafeCheckErrors = 0;
            var countQuestionsByDifficultyAndOrderErrors = 0;
            var currentState;

            workoutsDiagnosticFlowObjApi.getDiagnosticSettings = function() {
                var diagnosticData = $injector.invoke(_diagnosticSettings);
                return angular.extend(WORKOUTS_DIAGNOSTIC_FLOW, diagnosticData);
            };

            workoutsDiagnosticFlowObjApi.setCurrentQuestion = function (questionId, index)  {
                currentSectionData.currentQuestion = { id: questionId, index: index };
            };
            workoutsDiagnosticFlowObjApi.markSectionAsDoneToggle = function (isDone) {
                currentSectionData.done = isDone;
            };
            workoutsDiagnosticFlowObjApi.getCurrentSection = function () {
                return currentSectionData;
            };

            workoutsDiagnosticFlowObjApi.getCurrentState = function () {
                return currentState;
            };

            var diagnosticSettings = workoutsDiagnosticFlowObjApi.getDiagnosticSettings();

            function _getDataProm() {
                var examId = diagnosticSettings.diagnosticId;
                var getExamProm = ExamSrv.getExam(examId);
                var getExamResultProm = ExerciseResultSrv.getExamResult(examId);
                return [getExamProm, getExamResultProm];
            }

            function _getExerciseResultProms(sectionResults, examId) {
                if (angular.isUndefined(sectionResults)) {
                    sectionResults = [];
                }

                var sectionResultsKeys = Object.keys(sectionResults);
                var exerciseResultPromises = [];

                angular.forEach(sectionResultsKeys, function (sectionId) {
                    sectionId = +sectionId;
                    var exerciseResultProm = ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, sectionId, examId);
                    exerciseResultPromises.push(exerciseResultProm);
                });

                return exerciseResultPromises;
            }

            function _getStateDataByExamAndExerciseResult(exam, exerciseResult) {
                var currentSection;
                var currentQuestionResults;
                var currentExercise;

                var sectionsByOrder = exam.sections.sort(function (a, b) {
                    return a.order > b.order;
                });

                var exerciseResultByKey = exerciseResult.reduce(function (previousValue, currentValue) {
                    previousValue[currentValue.exerciseId] = currentValue;
                    return previousValue;
                }, {});

                for (var i = 0, ii = sectionsByOrder.length; i < ii; i++) {
                    currentSection = sectionsByOrder[i];
                    currentExercise = exerciseResultByKey[currentSection.id];
                    if (currentExercise) {
                        if (!currentExercise.isComplete) {
                            currentQuestionResults = true;
                            break;
                        }
                    } else if (!currentExercise) {
                        currentQuestionResults = void(0);
                        break;
                    }
                }

                return {
                    currentQuestionResults: currentQuestionResults,
                    currentSection: currentSection
                };
            }

            function _getNextDifficulty(difficulty, type) {
                var veryEasyNumLevel = diagnosticSettings.levels.very_easy.num;
                var veryHardNumLevel = diagnosticSettings.levels.very_hard.num;
                var nextDifficulty;
                if (type === 'increment') {
                    nextDifficulty = (difficulty + 1 > veryHardNumLevel) ? difficulty : difficulty + 1;
                } else if (type === 'decrement') {
                    nextDifficulty = (difficulty - 1 >= veryEasyNumLevel) ? difficulty - 1 : difficulty;
                } else {
                    nextDifficulty = difficulty;
                }
                return nextDifficulty;
            }

            function _getDifficultySafeCheck(difficulty, type, cb) {
                var safeDifficulty = _getNextDifficulty(difficulty, type);
                if (safeDifficulty === difficulty) {
                    countDifficultySafeCheckErrors += 1;
                    if (countDifficultySafeCheckErrors < 10) {
                        _getDifficultySafeCheck(difficulty, (type === 'increment') ? 'decrement' : 'increment', cb);
                    }
                } else {
                    cb(safeDifficulty, type);
                }
            }

           workoutsDiagnosticFlowObjApi.getDiagnosticFlowCurrentState = function (flagForPreSummery, skipIntroBool) {
                $log.debug('WorkoutsDiagnosticFlow getDiagnosticFlowCurrentState: initial func', arguments);
                currentState = { state: '', params: '', subjectId: '' };
                var getDataProm = _getDataProm();
                return $q.all(getDataProm).then(function (results) {
                    if (!results[0]) {
                        $log.error('WorkoutsDiagnosticFlow getDiagnosticFlowCurrentState: crucial data is missing! getExamProm (results[0]): ' + results[0]);
                    }
                    var exam = results[0];
                    var examResults = results[1];

                    if (examResults.isComplete) {
                        if (flagForPreSummery) {
                            znkAnalyticsSrv.eventTrack({ eventName: 'diagnosticEnd' });
                        }
                        currentState.state = flagForPreSummery ? '.preSummary' : '.summary';
                        return currentState;
                    }

                    if (!examResults.isStarted) {
                        znkAnalyticsSrv.eventTrack({ eventName: 'diagnosticStart' });
                        znkAnalyticsSrv.timeTrack({ eventName: 'diagnosticEnd' });
                        examResults.isStarted = true;
                        skipIntroBool = false;
                        examResults.$save();
                    }

                    var exerciseResultPromises = _getExerciseResultProms(examResults.sectionResults, exam.id);

                    return $q.all(exerciseResultPromises).then(function (exerciseResult) {
                        var stateResults = _getStateDataByExamAndExerciseResult(exam, exerciseResult);
                        var currentQuestionResults = stateResults.currentQuestionResults;
                        var currentSection = stateResults.currentSection;

                        if (angular.isUndefined(currentQuestionResults) && !skipIntroBool) {
                            currentState.state = '.intro';
                            currentState.subjectId = currentSection.subjectId;
                            currentState.params = { id: exam.id, sectionId: currentSection.id, subjectId: currentSection.subjectId, order: currentSection.order };
                        } else {
                            currentState.state = '.exercise';
                            currentState.subjectId = currentSection.subjectId;
                            currentState.params = { id: exam.id, sectionId: currentSection.id };
                        }
                        return currentState;
                    });
                });
            };

            workoutsDiagnosticFlowObjApi.getQuestionsByDifficultyAndOrder = function (questions, results, difficulty, order, cb, difficultyType) {
                difficultyType = difficultyType || 'increment';
                var diagnosticFlowResults = {};
                $log.debug('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: initial func', arguments);
                for (var i = 0, ii = questions.length; i < ii; i++) {
                    var dirty = false;
                    if (questions[i].difficulty === difficulty && questions[i].order === order) {
                        for (var resultsIndex = 0, resultsArr = results.length; resultsIndex < resultsArr; resultsIndex++) {
                            if (questions[i].id === results[resultsIndex].questionId) {
                                dirty = true;
                                break;
                            }
                        }
                        if (!dirty) {
                            diagnosticFlowResults.question = questions[i];
                            diagnosticFlowResults.result = { questionId: questions[i].id };
                            dirty = false;
                            break;
                        }
                    }
                }
                if (Object.keys(diagnosticFlowResults).length === 0) {
                    $log.error('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: diagnosticFlowResults cant get the value from arguments', arguments);
                    _getDifficultySafeCheck(difficulty, difficultyType, function (difficultySafe, type) {
                        countQuestionsByDifficultyAndOrderErrors += 1;
                        if (countQuestionsByDifficultyAndOrderErrors < 10) {
                            workoutsDiagnosticFlowObjApi.getQuestionsByDifficultyAndOrder(questions, results, difficultySafe, order, cb, type);
                        }
                    });
                } else {
                    cb(diagnosticFlowResults);
                }
            };

           workoutsDiagnosticFlowObjApi.getDifficulty = function (currentDifficulty, isAnswerCorrectly, startedTime) {
                var newDifficulty;
                $log.debug('WorkoutsDiagnosticFlow getDifficulty: initial func', arguments);
                if (startedTime > diagnosticSettings.timeLimit) {
                    newDifficulty = currentDifficulty;
                } else if (isAnswerCorrectly) {
                    newDifficulty = _getNextDifficulty(currentDifficulty, 'increment');
                } else {
                    newDifficulty = _getNextDifficulty(currentDifficulty, 'decrement');
                }
                $log.debug('WorkoutsDiagnosticFlow getDifficulty: newDifficulty returned value', newDifficulty);
                return newDifficulty;
            };

           workoutsDiagnosticFlowObjApi.getDiagnostic = function () {
                return ExerciseResultSrv.getExamResult(diagnosticSettings.diagnosticId);
            };

           workoutsDiagnosticFlowObjApi.getDiagnosticExam = function () {
                return ExamSrv.getExam(diagnosticSettings.diagnosticId);
            };

           workoutsDiagnosticFlowObjApi.getActiveSubject = function () {
                var activeSubject;
                var COMPLETED = 'all';
                var NO_ACTIVE_SUBJECT = 'none';

                var diagnosticProms = [workoutsDiagnosticFlowObjApi.getDiagnosticExam(), workoutsDiagnosticFlowObjApi.getDiagnostic()];
                return $q.all(diagnosticProms).then(function (diagnostic) {
                    var diagnosticExam = diagnostic[0];
                    var diagnosticResults = diagnostic[1];

                    if (diagnosticResults.isComplete) {
                        return COMPLETED;
                    }

                    var exerciseResultPromises = _getExerciseResultProms(diagnosticResults.sectionResults, diagnosticSettings.diagnosticId);
                    return $q.all(exerciseResultPromises).then(function (completedSections) {
                        if (completedSections.length === 0 && !diagnosticResults.isStarted) {
                            return NO_ACTIVE_SUBJECT;
                        }
                        // reduce the array to an object so we can reference an object by an id
                        var completedSectionsObject = completedSections.reduce(function (o, v) {
                            o[v.exerciseId] = v.isComplete;
                            return o;
                        }, {});

                        // sort sections by order
                        var sectionsByOrder = diagnosticExam.sections.sort(function (a, b) {
                            return a.order > b.order;
                        });

                        for (var i = 0; i < sectionsByOrder.length; i++) {
                            var value = sectionsByOrder[i];
                            if (!completedSectionsObject[value.id]) {
                                activeSubject = value.subjectId;
                                break;
                            }
                        }
                        return activeSubject; // subjectId
                    });
                });
            };

            workoutsDiagnosticFlowObjApi.isDiagnosticCompleted = function () {
                return workoutsDiagnosticFlowObjApi.getDiagnostic().then(function (diagnostic) {
                    return !!diagnostic.isComplete;
                });
            };

            return workoutsDiagnosticFlowObjApi;
        }];
    }]);

})(angular);


angular.module('znk.infra-web-app.diagnosticExercise').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/diagnosticExercise/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/svg/flag-icon.svg",
    "<svg x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-145 277 60 60\"\n" +
    "	 class=\"flag-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .flag-svg .st0 {\n" +
    "            fill: #ffffff;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "            width:25px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g id=\"kUxrE9.tif\">\n" +
    "	<g>\n" +
    "		<path class=\"st0\" id=\"XMLID_93_\" d=\"M-140.1,287c0.6-1.1,1.7-1.7,2.9-1.4c1.3,0.3,2,1.1,2.3,2.3c1.1,4,2.1,8,3.2,12c2.4,9.3,4.9,18.5,7.3,27.8\n" +
    "			c0.1,0.3,0.2,0.6,0.2,0.9c0.3,1.7-0.6,3-2.1,3.3c-1.4,0.3-2.8-0.5-3.3-2.1c-1-3.6-2-7.3-2.9-10.9c-2.5-9.5-5-19-7.6-28.6\n" +
    "			C-140.1,290-140.8,288.3-140.1,287z\"/>\n" +
    "		<path class=\"st0\" id=\"XMLID_92_\" d=\"M-89.6,289.1c-1,6.8-2.9,13-10,16c-3.2,1.4-6.5,1.6-9.9,0.9c-2-0.4-4-0.7-6-0.6c-4.2,0.3-7.1,2.7-9,6.4\n" +
    "			c-0.3,0.5-0.5,1.1-0.9,2c-0.3-1-0.5-1.7-0.8-2.5c-2-7-3.9-14.1-5.9-21.2c-0.3-1-0.1-1.7,0.5-2.4c4.5-6,11-7.4,17.5-3.6\n" +
    "			c3.4,2,6.7,4.2,10.2,6.1c1.9,1,3.9,1.9,5.9,2.4c3.2,0.9,5.9,0,7.9-2.6C-90,289.7-89.8,289.4-89.6,289.1z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnostic.template.html",
    "<div class=\"app-workouts-diagnostic\">\n" +
    "    <ui-view class=\"exercise-container base-border-radius base-box-shadow\"></ui-view>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnosticExercise.template.html",
    "<znk-exercise-header\n" +
    "    subject-id=\"vm.subjectId\"\n" +
    "    side-text=\".DIAGNOSTIC_TEXT\"\n" +
    "    options=\"{ showQuit: true, showNumSlide: true }\"\n" +
    "    on-clicked-quit=\"vm.onClickedQuit()\"\n" +
    "    ng-model=\"vm.numSlide\"\n" +
    "    total-slide-num=\"{{vm.questionsPerSubject}}\"></znk-exercise-header>\n" +
    "<znk-exercise\n" +
    "    questions=\"vm.questions\"\n" +
    "    ng-model=\"vm.resultsData.questionResults\"\n" +
    "    settings=\"vm.settings\"\n" +
    "    actions=\"vm.actions\">\n" +
    "</znk-exercise>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnosticIntro.template.html",
    "<znk-exercise-header\n" +
    "    subject-id=\"vm.params.subjectId\"\n" +
    "    side-text=\".DIAGNOSTIC_TEXT\"\n" +
    "    options=\"{ showQuit: true }\"\n" +
    "    on-clicked-quit=\"vm.onClickedQuit()\">\n" +
    "</znk-exercise-header>\n" +
    "<diagnostic-intro show-instructions=\"true\"></diagnostic-intro>\n" +
    "<div class=\"btn-wrap\">\n" +
    "    <button autofocus tabindex=\"1\" class=\"md-button znk md-primary\" ng-click=\"vm.goToExercise()\" translate=\"{{::vm.buttonTitle}}\" aria-label=\"{{::vm.buttonTitle}}\">\n" +
    "        <svg-icon name=\"diagnostic-dropdown-arrow-icon\"></svg-icon>\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnosticPreSummary.template.html",
    "<div class=\"diagnostic-loading-wrapper\" translate-namespace=\"WORKOUTS_DIAGNOSTIC_PRE_SUMMARY\">\n" +
    "    <p class=\"loading-title\" translate=\".READY\"></p>\n" +
    "    <div class=\"video-wrapper\">\n" +
    "        <video loop autoplay\n" +
    "               preload=\"auto\"\n" +
    "               poster=\"/assets/images/poster/diagnostic-pre-summary.png\">\n" +
    "            <source src=\"/assets/videos/hoping-raccoon.mp4\" type=\"video/mp4\">\n" +
    "        </video>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnosticSummary.template.html",
    "<div class=\"diagnostic-summary-wrapper\" translate-namespace=\"WORKOUTS_DIAGNOSTIC_SUMMARY\">\n" +
    "    <div class=\"title\">\n" +
    "        <div translate=\".YOUR_INITIAL_SCORE_ESTIMATE\"></div>\n" +
    "        <span translate=\".COMPOSITE_SCORE\"></span>\n" +
    "        <span> {{::vm.compositeScore}}</span>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"doughnuts-container\">\n" +
    "        <div class=\"all-doughnuts-wrapper\" ng-repeat=\"doughnut in vm.doughnutArray track by $index\">\n" +
    "            <div class=\"doughnut-wrapper\">\n" +
    "                <p class=\"subject-name\" translate=\"{{doughnut.subjectName}}\"></p>\n" +
    "                <div class=\"znk-doughnut\">\n" +
    "                    <div class=\"white-bg-doughnut-score\">\n" +
    "                        {{doughnut.score === 0 ? '-' : doughnut.score }}\n" +
    "                    </div>\n" +
    "                    <div class=\"goal-point\"\n" +
    "                         ng-style=\"::{top:doughnut.goalPoint.y + 'px', left:doughnut.goalPoint.x + 'px'}\">\n" +
    "                        <div class=\"goal-point-bg\">\n" +
    "                            <div ng-style=\"::{'background': ''+ doughnut.colors[0]}\"\n" +
    "                                 class=\"goal-point-subject-color\"></div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <canvas id=\"doughnut\"\n" +
    "                            class=\"chart chart-doughnut\"\n" +
    "                            chart-colours=\"doughnut.colors\"\n" +
    "                            chart-data=\"doughnut.data\"\n" +
    "                            chart-labels=\"doughnut.labels\"\n" +
    "                            chart-options=\"doughnut.options\"\n" +
    "                            chart-legend=\"false\">\n" +
    "                    </canvas>\n" +
    "                    <md-tooltip\n" +
    "                        ng-if=\"doughnut.scoreGoal > doughnut.score\"\n" +
    "                        class=\"tooltip-for-diagnostic-summary md-whiteframe-2dp\"\n" +
    "                        md-direction=\"top\">\n" +
    "                        <span\n" +
    "                            translate=\".GOAL_TOOLTIP\"\n" +
    "                            translate-values=\"{ ptsToGoal: {{doughnut.scoreGoal - doughnut.score}} }\">\n" +
    "                        </span>\n" +
    "                    </md-tooltip>\n" +
    "                </div>\n" +
    "                <div class=\"your-goal-wrapper\">\n" +
    "                    <span class=\"score-goal\" translate=\".YOUR_GOAL\"></span>\n" +
    "                    <span class=\"score-value\">\n" +
    "                        {{::doughnut.scoreGoal}}\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"footer-text\" translate=\"{{vm.footerTranslatedText}}\"></div>\n" +
    "    <button autofocus tabindex=\"1\"\n" +
    "            class=\"start-button md-button znk md-primary\"\n" +
    "            ui-sref=\"app.workoutsRoadmap.diagnostic\"\n" +
    "            translate=\".DONE\">DONE\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticIntro', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.config',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'diagnostic-intro-check-mark': 'components/diagnosticIntro/svg/check-mark-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').directive('diagnosticIntro',
    ["DiagnosticIntroSrv", "$translatePartialLoader", "$log", function (DiagnosticIntroSrv, $translatePartialLoader, $log) {
        'ngInject';

        var directive = {
            restrict: 'E',
            scope: {
                showInstructions: '=?'
            },
            templateUrl: 'components/diagnosticIntro/diagnosticIntro.template.html',
            link: function link(scope) {

                $translatePartialLoader.addPart('diagnosticIntro');

                scope.d = {};

                DiagnosticIntroSrv.getActiveData().then(function (activeId) {
                    scope.d.activeId = activeId;
                    return DiagnosticIntroSrv.getConfigMap();
                }).then(function (mapData) {
                    if (!angular.isArray(mapData.subjects)) {
                        $log.error('DiagnosticIntroDirective: configMap must have subjects array!');
                    }
                    var currMapData;
                    var currMapIndex;

                    scope.d.subjects = mapData.subjects.map(function (subject, index) {
                        subject.mapId = index + 1;
                        return subject;
                    });

                    switch (scope.d.activeId) {
                        case 'none':
                            currMapIndex = -1;
                            currMapData = mapData.none;
                            break;
                        case 'all':
                            currMapIndex = Infinity;
                            currMapData = mapData.all;
                            break;
                        default:
                            currMapData = scope.d.subjects.filter(function (subject) {
                                return subject.id === scope.d.activeId;
                            })[0];
                            currMapIndex = currMapData.mapId;
                    }

                    scope.d.currMapData = currMapData;
                    scope.d.currMapIndex = currMapIndex;
                }).catch(function (err) {
                    $log.error('DiagnosticIntroDirective: Error catch' + err);
                });
            }
        };

        return directive;
    }]);

'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').provider('DiagnosticIntroSrv', [
    function DiagnosticIntroSrv() {

        var _activeData;

        var _configMap;

        this.setActiveSubjectGetter = function(activeData) {
            _activeData = activeData;
        };

        this.setConfigGetter = function(configMap) {
            _configMap = configMap;
        };

        this.$get = ['$injector', '$log', '$q', function($injector, $log, $q) {
            return {
                getActiveData: function() {
                    if (!_activeData) {
                        var errorMsg = 'DiagnosticIntroSrv: no activeData!'; 
                        $log.error(errorMsg);
                        return $q.reject(errorMsg);
                    }
                    return $q.when($injector.invoke(_activeData));
                },
                getConfigMap: function() {
                    if (!_configMap) {
                        var errorMsg = 'DiagnosticIntroSrv: no configMap!';
                        $log.error(errorMsg);
                        return $q.reject(errorMsg);
                    }
                    return $q.when($injector.invoke(_configMap));
                }
            };
        }];
}]);

angular.module('znk.infra-web-app.diagnosticIntro').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/diagnosticIntro/diagnosticIntro.template.html",
    "<div class=\"diagnostic-intro-drv\" translate-namespace=\"DIAGNOSTIC_INTRO\">\n" +
    "    <div class=\"description\">\n" +
    "        <div class=\"diagnostic-text\"\n" +
    "             translate=\".DIAG_DESCRIPTION_{{d.currMapData.subjectNameAlias | uppercase}}\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"icons-section\" ng-class=\"{pristine: d.currMapIndex === -1}\">\n" +
    "        <div ng-repeat=\"subject in d.subjects\"\n" +
    "             class=\"icon-circle {{subject.subjectNameAlias}}-color\"\n" +
    "             ng-class=\"{\n" +
    "                    active: subject.mapId === d.currMapIndex,\n" +
    "                    done: subject.mapId < d.currMapIndex\n" +
    "            }\">\n" +
    "            <div class=\"icon-wrapper\">\n" +
    "                <svg-icon class=\"subject-icon\" name=\"{{subject.subjectIconName}}\"></svg-icon>\n" +
    "                <svg-icon class=\"section-complete\" name=\"diagnostic-intro-check-mark\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"raccoon-img-container\">\n" +
    "        <div class=\"raccoon-img-wrapper\">\n" +
    "            <div class=\"diagnostic-raccoon\" ng-class=\"'diagnostic-raccoon-'+d.currMapData.subjectNameAlias\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"section-question\" ng-if=\"!d.currMapData.hideSectionQuestion\">\n" +
    "            <div>\n" +
    "                <span translate=\".DIAG_SUBJECT_TEXT_{{d.currMapData.subjectNameAlias | uppercase}}\" ng-cloak></span>\n" +
    "                <span\n" +
    "                    class=\"{{d.currMapData.subjectNameAlias}}\"\n" +
    "                    translate=\".DIAG_SUBJECT_NAME_{{d.currMapData.subjectNameAlias | uppercase}}\">\n" +
    "                </span>\n" +
    "                <span translate=\".QUESTIONS\"></span>\n" +
    "                <div class=\"diagnostic-instructions\" ng-if=\"showInstructions\">\n" +
    "                    <span class=\"diagnostic-instructions-title\" translate=\".INSTRUCTIONS_TITLE\"></span>\n" +
    "                    <span class=\"diagnostic-instructions-text\" translate=\".DIAG_INSTRUCTIONS_{{d.currMapData.subjectNameAlias | uppercase}}\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticIntro/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);

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
                'estimated-score-widget-close-popup': 'components/estimatedScoreWidget/svg/close-popup.svg'
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
        ["EstimatedScoreSrv", "$q", "SubjectEnum", "UserGoalsService", "EstimatedScoreWidgetSrv", "$translatePartialLoader", "userGoalsSelectionService", "$timeout", "ScoringService", "DiagnosticSrv", function (EstimatedScoreSrv, $q, SubjectEnum, UserGoalsService, EstimatedScoreWidgetSrv, $translatePartialLoader, userGoalsSelectionService, $timeout, ScoringService, DiagnosticSrv) {
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
                            for(var i = 0; i<scope.d.widgetItems.length; i++) {
                                if(angular.isDefined(scope.d.widgetItems[i].estimatedScore)) {
                                    scoresArr.push(scope.d.widgetItems[i].estimatedScore);
                                }
                            }

                            scope.d.estimatedCompositeScore = examScoresFn(scoresArr);

                            function filterSubjects (widgetItem) {
                                return !!('showScore' in widgetItem &&  (widgetItem.showScore) !== false);
                            }

                            scope.d.widgetItems = scope.d.widgetItems.filter(filterSubjects);

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
                        var scoringLimits = ScoringService.getScoringLimits();
                        var maxEstimatedScore = typeof scoringLimits.subjects[Object.getOwnPropertyNames(scoringLimits.subjects)] !== 'undefined' ? scoringLimits.subjects[Object.getOwnPropertyNames(scoringLimits.subjects)].max: scoringLimits.subjects.max;
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
        }]
    );
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
  $templateCache.put("components/estimatedScoreWidget/svg/close-popup.svg",
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
    "    <div class=\"title\" translate=\".TITLE\"></div>\n" +
    "    <div class=\"unfinished-diagnostic-title\" ng-if=\"!d.isDiagnosticComplete\" translate=\".UNFINISHED_DIAGNOSTIC_TITLE\"></div>\n" +
    "    <div class=\"subjects-wrap\">\n" +
    "        <div ng-repeat=\"widgetItem in d.subjectsScores\"\n" +
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
    "                                  <div ng-switch=\"widgetItem.estimatedScore >= widgetItem.userGoal\" class=\"bottom-text\">\n" +
    "                                      <span ng-switch-when=\"true\" translate=\".GOAL_REACHED\"></span>\n" +
    "                                      <span ng-switch-default translate=\".PTS_TO_GO\" translate-values=\"{ pts: {{widgetItem.pointsLeftToMeetUserGoal}} }\"></span>\n" +
    "                                  </div>\n" +
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

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.iapMsg',[
        'ngSanitize',
        'znk.infra.svgIcon',
        'ngAnimate'
    ])
        .config(["SvgIconSrvProvider", function(SvgIconSrvProvider){
            'ngInject'; 

            var svgMap = {
                'iap-msg-close-msg': 'components/iapMsg/svg/close-msg.svg',
                'iap-msg-hint-bubble': 'components/iapMsg/svg/hint-bubble.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.iapMsg').service('IapMsgSrv',
        ["raccoonIapMsgSrv", function (raccoonIapMsgSrv) {
            'ngInject';

            this.raccoonTypes = raccoonIapMsgSrv.raccoonTypes;

            this.showRaccoonIapMsg = function(msg,type){
                raccoonIapMsgSrv.showRaccoonIapMsg (msg,type);
                return raccoonIapMsgSrv.closeRaccoonIapMsg;
            };
        }]
    );
})(angular);

(function () {
    'use strict';
    
    var templateCacheName = 'raccoonIapMsg.template';

    angular.module('znk.infra-web-app.iapMsg')
        .run(["$templateCache", function($templateCache){
            'ngInject';

            var template =
                '<div class="raccoon-in-app show-hide-animation" ng-class="raccoonTypeClass">' +
                    '<div class="svg-wrap">' +
                        '<svg-icon name="iap-msg-close-msg" ng-click="close()"></svg-icon>' +
                    '</div>' +
                    '<div class="bubble-wrap">' +
                        '<div class="msg-wrap">' +
                            '<div class="msg" ng-bind-html="message"></div>' +
                            '<svg-icon name="iap-msg-hint-bubble" class="hint-bubble-svg"></svg-icon>' +
                        '</div>' +
                    '</div>' +
                    '<div class="raccoon">' +
                        '<div></div>' +
                    '</div>' +
                '</div>';
            $templateCache.put(templateCacheName,template);
        }]
    )
    .service('raccoonIapMsgSrv',
        ["$compile", "$rootScope", "$animate", "$document", "$timeout", "$templateCache", "$sce", function ($compile, $rootScope, $animate, $document, $timeout, $templateCache, $sce) {
            'ngInject';

            var self = this;

            var raccoonTypes = {
                HINT_RACCOON: 'HINT',
                PRACTICE_RACCOON: 'PRACTICE_HINT'
            };
            this.raccoonTypes = raccoonTypes;

            var racccoonTypeToClassMap = {};
            racccoonTypeToClassMap[this.raccoonTypes.HINT_RACCOON] = 'hint-raccoon';
            racccoonTypeToClassMap[this.raccoonTypes.PRACTICE_RACCOON] = 'hint-raccoon-for-practice';

            function addPlaceHolderElement() {
                var wrapper = angular.element('<div class="raccoon-wrap"></div>');
                $document.find('body').append(wrapper);
                return wrapper;
            }

            var raccoonParentElm = addPlaceHolderElement();

            function _closeOnClickGlobalHandler() {
                $timeout(function () {
                    self.closeRaccoonIapMsg();
                });
            }

            function _addCloseOnGlobalClickHandler() {
                $document[0].body.addEventListener('click', _closeOnClickGlobalHandler);
            }

            function _removeCloseOnGlobalClickHandler() {
                $document[0].body.removeEventListener('click', _closeOnClickGlobalHandler);
            }

            function _getRaccoonClass(raccoonType) {
                return racccoonTypeToClassMap[raccoonType];
            }

            var scope;
            /**** DO NOT USE THIS SERVICE, use IapMsgSrv instead!!!!!! ****/
            this.closeRaccoonIapMsg = function () {
                _removeCloseOnGlobalClickHandler();

                $animate.leave(raccoonParentElm.children());

                if (scope) {
                    scope.$destroy();
                    scope = null;
                }
            };
            /**** DO NOT USE THIS SERVICE, use IapMsgSrv instead!!!!!! ****/
            this.showRaccoonIapMsg = function (message, raccoonType) {
                if (scope) {
                    self.closeRaccoonIapMsg();
                }

                scope = $rootScope.$new(true);
                scope.close = this.closeRaccoonIapMsg;
                $sce.trustAsHtml(message);
                scope.message = message;
                scope.raccoonTypeClass = _getRaccoonClass(raccoonType);

                var template = $templateCache.get(templateCacheName);
                var raccoonElm = angular.element(template);
                raccoonParentElm.append(raccoonElm);
                $animate.enter(raccoonElm, raccoonParentElm, null).then(function(){
                    _addCloseOnGlobalClickHandler();
                });
                $compile(raccoonElm)(scope);
            };
        }]);
})(angular);

angular.module('znk.infra-web-app.iapMsg').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/iapMsg/svg/close-msg.svg",
    "<svg class=\"iap-msg-close-msg-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-596.6 492.3 133.2 133.5\">\n" +
    "    <style>\n" +
    "        .iap-msg-close-msg-svg{\n" +
    "            width: 12px;\n" +
    "        }\n" +
    "\n" +
    "        .iap-msg-close-msg-svg line {\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 10px;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/iapMsg/svg/hint-bubble.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 2006.4 737.2\"\n" +
    "     class=\"iap-msg-hint-bubble-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .iap-msg-hint-bubble-svg{\n" +
    "            width: 400px;\n" +
    "        }\n" +
    "\n" +
    "        .iap-msg-hint-bubble-svg .st0 {\n" +
    "            fill: #FFFFFF;\n" +
    "            stroke: #8A8484;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <path class=\"st0\" d=\"M2003.9,348.5c0-191.1-448-346-1000.7-346S2.5,157.4,2.5,348.5s448,346,1000.7,346\n" +
    "	c163.9,0,318.6-13.6,455.2-37.8c26.1,18.2,69.5,38.4,153,61.7c83.6,23.3,154.7,14.8,154.7,14.8s-87.6-50.2-134.5-115.4\n" +
    "	C1858.7,554.4,2003.9,457.3,2003.9,348.5z\"/>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise', [
        'znk.infra.znkExercise',
        'znk.infra.analytics',
        'znk.infra.general'
    ]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').config(
        ["$provide", function ($provide) {
            'ngInject';

            $provide.decorator('questionBuilderDirective',
                ["$delegate", "ZnkExerciseUtilitySrv", function ($delegate, ZnkExerciseUtilitySrv) {
                    'ngInject';// jshint ignore:line

                    var directive = $delegate[0];

                    directive.link.pre = function(scope, element, attrs, ctrls){
                        var questionBuilderCtrl = ctrls[0];
                        var znkExerciseCtrl = ctrls[1];

                        var functionsToBind = ['getViewMode','addQuestionChangeResolver','removeQuestionChangeResolver', 'getCurrentIndex'];
                        ZnkExerciseUtilitySrv.bindFunctions(questionBuilderCtrl, znkExerciseCtrl,functionsToBind);

                        element.append('<answer-explanation></answer-explanation>');
                    };

                    return $delegate;
                }]
            );
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'answer-explanation-lamp-icon': 'components/infraWebAppZnkExercise/svg/lamp-icon.svg',
                'answer-explanation-close': 'components/infraWebAppZnkExercise/svg/close.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }])
        .directive('answerExplanation',
            ["$translatePartialLoader", "ZnkExerciseViewModeEnum", "$compile", "$filter", "$sce", "ENV", "znkAnalyticsSrv", function ($translatePartialLoader, ZnkExerciseViewModeEnum, $compile, $filter, $sce, ENV, znkAnalyticsSrv) {
                'ngInject';

                var directive = {
                    scope: {},
                    require: ['^questionBuilder', '^ngModel'],
                    templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanation.template.html',
                    link: function link(scope, element, attrs, ctrls) {
                        $translatePartialLoader.addPart('infraWebAppZnkExercise');

                        var questionBuilderCtrl = ctrls[0];
                        var ngModelCtrl = ctrls[1];
                        var domElem = element[0];
                        var viewMode = questionBuilderCtrl.getViewMode();
                        var question = questionBuilderCtrl.question;

                        domElem.style.display = 'none';

                        scope.d = {};

                        var init = (function () {
                            var wasInit;

                            return function () {
                                if (wasInit) {
                                    return;
                                }

                                domElem.style.display = 'block';
                                
                                var analyticsProps = {
                                    subjectType: question.subjectId,
                                    questionId: question.id
                                };

                                scope.$watch('d.showWrittenSln', function (isVisible) {
                                    if (isVisible || isVisible === false) {
                                        if (isVisible) {
                                            znkAnalyticsSrv.eventTrack({
                                                eventName: 'writtenSolutionClicked',
                                                props: analyticsProps
                                            });
                                            znkAnalyticsSrv.timeTrack({eventName: 'writtenSolutionClosed'});
                                        } else {
                                            znkAnalyticsSrv.eventTrack({
                                                eventName: 'writtenSolutionClosed',
                                                props: analyticsProps
                                            });
                                        }
                                    }
                                });

                                wasInit = true;
                            };
                        })();

                        function viewChangeListener() {
                            if (ngModelCtrl.$viewValue) {           // user already answered
                                init();
                            } else {
                                ngModelCtrl.$viewChangeListeners.push(function () {
                                    init();
                                });
                            }
                        }

                        switch (viewMode) {
                            case ZnkExerciseViewModeEnum.REVIEW.enum:
                                init();
                                break;
                            case ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum:
                                viewChangeListener();
                                break;
                            default:
                                domElem.style.display = 'none';
                        }
                    }
                };
                return directive;
            }]
        );
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').directive('answerExplanationContent',
        ["ENV", "$sce", "znkAnalyticsSrv", function (ENV, $sce, znkAnalyticsSrv) {
            'ngInject';

            return {
                templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanationContent.template.html',
                require: '^questionBuilder',
                restrict: 'E',
                scope: {
                    onClose: '&'
                },
                link: function (scope, element, attrs, questionBuilderCtrl) {
                    var question = questionBuilderCtrl.question;
                    var isPlayFlag = false;
                    var analyticsProps = {
                        subjectType: question.subjectId,
                        questionId: question.id
                    };

                    scope.d = {};

                    var writtenSlnContent = questionBuilderCtrl.question.writtenSln &&
                        questionBuilderCtrl.question.writtenSln.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                    scope.d.writtenSlnContent = writtenSlnContent;

                    scope.d.videoSrc = $sce.trustAsResourceUrl(ENV.mediaEndPoint + ENV.firebaseAppScopeName + '/videos/questions' + '/' + question.id + '.mp4');

                    scope.d.quid = question.quid || question.id;

                    scope.d.onVideoEnded = function () {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'videoClosed',
                            props: analyticsProps
                        });
                    };

                    scope.d.onVideoPlay = function () {
                        if (!isPlayFlag) {
                            isPlayFlag = true;
                            znkAnalyticsSrv.eventTrack({
                                eventName: 'videoClicked',
                                props: analyticsProps
                            });
                            znkAnalyticsSrv.timeTrack({eventName: 'videoClosed'});
                        }
                    };

                    scope.d.close = function () {
                        scope.onClose();
                    };
                }
            };
        }]
    );
})(angular);


angular.module('znk.infra-web-app.infraWebAppZnkExercise').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanation.template.html",
    "<div class=\"answer-explanation-wrapper\" translate-namespace=\"ANSWER_EXPLANATION\">\n" +
    "    <div class=\"answer-explanation-content-wrapper\"\n" +
    "         ng-if=\"d.showWrittenSln\">\n" +
    "        <answer-explanation-content class=\"znk-scrollbar\"\n" +
    "                                    on-close=\"d.showWrittenSln = false\">\n" +
    "        </answer-explanation-content>\n" +
    "    </div>\n" +
    "    <div class=\"answer-explanation-header\" ng-click=\"d.showWrittenSln = !d.showWrittenSln\">\n" +
    "        <div class=\"answer-explanation-btn\">\n" +
    "            <div class=\"main-content-wrapper\">\n" +
    "                <svg-icon class=\"lamp-icon\" name=\"answer-explanation-lamp-icon\"></svg-icon>\n" +
    "                <span class=\"text\" translate=\".ANSWER_EXPLANATION\"></span>\n" +
    "            </div>\n" +
    "            <div class=\"right-corner corner\"></div>\n" +
    "            <div class=\"left-corner corner\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanationContent.template.html",
    "<div class=\"title\">\n" +
    "    <div translate=\"ANSWER_EXPLANATION.TITLE\"></div>\n" +
    "    <div class=\"answer-explanation-close\">\n" +
    "        <svg-icon name=\"answer-explanation-close\"\n" +
    "                  ng-click=\"d.close()\">\n" +
    "        </svg-icon>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"flex-wrap\">\n" +
    "    <div class=\"video-wrap\">\n" +
    "        <video controls\n" +
    "               video-ctrl-drv\n" +
    "               on-play=\"d.onVideoPlay()\"\n" +
    "               on-ended=\"d.onVideoEnded()\"\n" +
    "               video-error-poster=\"assets/images/video-is-not-available-img.png\">\n" +
    "            <source ng-src=\"{{::d.videoSrc}}\" type=\"video/mp4\">\n" +
    "        </video>\n" +
    "        <div class=\"question-quid-text\">{{::d.quid}}</div>\n" +
    "    </div>\n" +
    "    <div class=\"written-solution-wrapper\"\n" +
    "         ng-bind-html=\"d.writtenSlnContent\">\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/svg/close.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-596.6 492.3 133.2 133.5\"\n" +
    "     class=\"answer-explanation-close\">\n" +
    "    <style>\n" +
    "        svg.answer-explanation-close {\n" +
    "            width: 14px;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-close line {\n" +
    "            stroke: #161616;\n" +
    "            fill: none;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/svg/lamp-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 51.7 54.3\"\n" +
    "     class=\"answer-explanation-lamp-icon-svg\">\n" +
    "    <style>\n" +
    "        svg.answer-explanation-lamp-icon-svg{\n" +
    "            width: 18px;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-lamp-icon-svg path{\n" +
    "            stroke: white;\n" +
    "            fill: white;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-lamp-icon-svg path.st0{\n" +
    "            fill: transparent;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M19.6,44.7c-0.9-0.1-2.1-0.1-2.1-1.3c0.1-4.5-2.5-8.1-3.9-12.1c-2.5-6.8,0.5-14.5,6.7-17.4\n" +
    "		c5-2.3,9.7-1.7,13.8,1.9c4.5,3.9,5.8,9.1,4.1,14.7c-0.9,3-2.4,5.9-3.4,8.8c-0.4,1-0.5,2.2-0.5,3.3c0,1.5-0.7,2.2-2.2,2.2\n" +
    "		C27.7,44.7,24.1,44.7,19.6,44.7z\"/>\n" +
    "        <path class=\"st1\" d=\"M44.5,44.9c-0.4,1.3-1.4,1.2-2.1,0.5c-1.5-1.4-2.9-2.9-4.3-4.3c-0.4-0.4-0.6-0.9-0.2-1.5\n" +
    "		c0.4-0.5,0.9-0.8,1.4-0.4c1.8,1.6,3.6,3.2,5,5.1C44.5,44.4,44.5,44.7,44.5,44.9z\"/>\n" +
    "        <path class=\"st2\" d=\"M8,7.8c1,0,5.9,4.7,5.9,5.5c0,0.5-0.3,0.8-0.7,1.1c-0.5,0.4-0.9,0.1-1.2-0.2c-1.5-1.5-3.1-3-4.6-4.5\n" +
    "		C7.1,9.3,7,8.8,7.3,8.2C7.5,8,7.9,7.9,8,7.8z\"/>\n" +
    "        <path class=\"st3\"\n" +
    "              d=\"M43.6,8c1.1,0.1,1.3,1.1,0.7,1.7c-1.4,1.7-3,3.3-4.7,4.7c-0.8,0.7-1.6,0.3-1.9-0.7C37.5,13,42.5,8,43.6,8z\"/>\n" +
    "        <path class=\"st4\" d=\"M12.7,38.9c0.5,0,0.9,0.2,1.1,0.7c0.3,0.5,0,0.9-0.3,1.2c-1.5,1.5-3,3-4.5,4.5c-0.4,0.4-0.8,0.4-1.3,0.2\n" +
    "		c-0.5-0.2-0.6-0.7-0.6-1.1C7.2,43.6,11.9,38.9,12.7,38.9z\"/>\n" +
    "        <path class=\"st5\" d=\"M4.5,27.2c-1,0-2.1,0-3.1,0c-0.7,0-1.4-0.1-1.4-1c0-1,0.6-1.3,1.4-1.3c2,0,3.9,0,5.9,0c0.8,0,1.2,0.5,1.3,1.2\n" +
    "		c0,0.8-0.5,1.1-1.3,1.1C6.4,27.2,5.4,27.2,4.5,27.2z\"/>\n" +
    "        <path class=\"st6\" d=\"M47.1,27.2c-0.8,0-1.7,0-2.5,0c-0.8,0-1.6-0.1-1.5-1.2c0-0.7,0.5-1.2,1.3-1.1c2,0,3.9,0,5.9,0\n" +
    "		c0.9,0,1.5,0.4,1.4,1.4c-0.1,0.9-0.8,0.9-1.5,0.9C49.2,27.2,48.1,27.2,47.1,27.2z\"/>\n" +
    "        <path class=\"st7\" d=\"M26.9,4.2c0,1,0,2,0,3.1c0,0.7-0.3,1.3-1.1,1.3c-0.8,0-1.1-0.6-1.1-1.3c0-1.9,0-3.9,0-5.8c0-0.7,0.2-1.3,1-1.4\n" +
    "		c1-0.1,1.3,0.6,1.2,1.4C26.9,2.4,27,3.3,26.9,4.2z\"/>\n" +
    "        <path class=\"st8\" d=\"M17.4,26.3c0-3.2,1.2-5.3,2.9-7.2c0.6-0.6,1.2-1.3,2.1-0.6c1,0.8,0.3,1.4-0.3,2.1c-3.1,3.4-2.9,7-0.9,10.8\n" +
    "		c0.5,0.9,1.5,2.1,0,2.8c-1.3,0.6-1.6-0.9-2.1-1.7C18,30.4,17.2,28.2,17.4,26.3z\"/>\n" +
    "        <path class=\"st9\" d=\"M32,48.8H19.3c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1H32c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C33.1,48.3,32.6,48.8,32,48.8z\"/>\n" +
    "        <path class=\"st9\" d=\"M31,51.6H20.6c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1H31c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C32.1,51.1,31.6,51.6,31,51.6z\"/>\n" +
    "        <path class=\"st9\" d=\"M27.3,54.3H24c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1h3.2c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C28.4,53.8,27.9,54.3,27.3,54.3z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation',
        ['ngMaterial',
        'znk.infra.svgIcon',
        'znk.infra.popUp',
        'pascalprecht.translate',
        'znk.infra-web-app.purchase',
        'znk.infra.user'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'invitation-teacher-icon': 'components/invitation/svg/teacher-icon.svg',
                    'invitation-close-popup': 'components/invitation/svg/close-popup.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').controller('invitationApproveModalCtrl',

        ["locals", "$mdDialog", "InvitationHelperService", "$filter", "PopUpSrv", function (locals, $mdDialog, InvitationHelperService, $filter, PopUpSrv) {
            'ngInject';

            var self = this;
            self.translate = $filter('translate');
            self.invitation = locals.invitation;
            self.requestMessage = false;
            self.btnDisable = false;

            this.approve = function () {
                self.btnDisable = true;
                self.approveStartLoader = true;
                InvitationHelperService.approve(self.invitation).then(function (response) {
                    self.requestMessage = true;
                    self.approveFillLoader = true;
                    if (response.data && response.data.success) {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_CONNECT') + self.invitation.senderName;
                    } else {
                        self.closeModal();
                        PopUpSrv.error('', self.translate('INVITATION_MANAGER_DIRECTIVE.APPROVE_INVITE_ERROR'));
                    }
                }, function () {
                    self.closeModal();
                    PopUpSrv.error('', self.translate('INVITATION_MANAGER_DIRECTIVE.APPROVE_INVITE_ERROR'));
                });
            };

            this.decline = function () {
                self.btnDisable = true;
                self.cancelStartLoader = true;
                InvitationHelperService.decline(self.invitation).then(function (response) {
                    self.requestMessage = true;
                    self.cancelFillLoader = true;
                    if (response.data && response.data.success) {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_DECLINE');
                    } else {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.CANCEL_INVITE_ERROR');
                    }
                }, function () {
                    self.requestMessage = true;
                    self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.CANCEL_INVITE_ERROR');
                });
            };

            this.closeModal = function () {
                $mdDialog.cancel();
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').directive('invitationManager',

        ["InvitationService", "$filter", "InvitationHelperService", "ENV", "PopUpSrv", "$translatePartialLoader", function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv, $translatePartialLoader) {
            'ngInject';

           return {
                templateUrl: 'components/invitation/directives/invitation-manager.template.html',
                restrict: 'E',
                scope: {},
                link: function linkFn(scope) {
                    // if (!ENV.dashboardFeatureEnabled) {
                    //    element.remove();
                    //    return;
                    // }

                    scope.translate = $filter('translate');
                    $translatePartialLoader.addPart('invitation');


                    scope.pendingTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.PENDING_INVITATIONS');
                    scope.pendingConformationsTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.PENDING_CONFORMATIONS');
                    scope.declinedTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.DECLINED_INVITATIONS');

                    InvitationService.getReceived().then(function (invitations) {
                        scope.invitations = invitations;
                        scope.pendingTitle += ' (' + (scope.getItemsCount(scope.invitations) || 0) + ')';
                    });

                    InvitationService.getPendingConformations().then(function (conformations) {
                        angular.forEach(conformations, function (conformation, key) {
                            conformation.invitationId = key;
                        });
                        scope.conformations = conformations;
                        scope.pendingConformationsTitle += ' (' + (scope.getItemsCount(scope.conformations) || 0) + ')';
                    });

                    InvitationService.getDeclinedInvitations().then(function (declinedInvitations) {
                        scope.declinedInvitations = declinedInvitations;
                    });

                    InvitationService.getMyTeacher().then(function (teacherObj) {
                        scope.myTeachers = teacherObj;
                    });

                    scope.hasItems = function (obj) {
                        return !!scope.getItemsCount(obj);
                    };

                    scope.getItemsCount = function (obj) {
                        return Object.keys(obj).length;
                    };

                    scope.approve = function (invitation) {
                        InvitationHelperService.approve(invitation);
                    };

                    scope.decline = function (invitation) {
                        InvitationHelperService.decline(invitation);
                    };

                    scope.deletePendingConformations = function (invitation) {
                        var _title = scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_INVITATION');
                        var _content = scope.translate('INVITATION_MANAGER_DIRECTIVE.ARE_U_SURE');
                        var _yes = scope.translate('INVITATION_MANAGER_DIRECTIVE.YES');
                        var _no = scope.translate('INVITATION_MANAGER_DIRECTIVE.NO');

                        PopUpSrv.ErrorConfirmation(_title, _content, _yes, _no).promise.then(function (result) {
                            if (result === 'Yes') {
                                InvitationService.deletePendingConformations(invitation).then(function (response) {
                                    if (response.data && response.data.success) {
                                        PopUpSrv.success(scope.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS'), scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_SUCCESS'));
                                    } else {
                                        PopUpSrv.error('', scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_ERROR'));
                                    }
                                });
                            }
                        });
                    };

                    scope.deleteTeacher = function (teacher) {
                        InvitationHelperService.deleteTeacher(teacher);
                    };

                    scope.openInviteModal = function () {
                        InvitationService.openInviteTeacherModal();
                    };

                    var watcherDestroy = scope.$on('$destroy', function () {
                        InvitationService.removeListeners();
                        watcherDestroy();
                    });
                }
            };
        }]
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').controller('inviteTeacherModalController',

        ["$mdDialog", "InvitationService", "PopUpSrv", "$filter", "$timeout", function ($mdDialog, InvitationService, PopUpSrv, $filter, $timeout) {
            'ngInject';
            var self = this;
            self.translate = $filter('translate');

            this.sendInvitation = function () {
                self.startLoader = true;
                InvitationService.inviteTeacher(self.teacherEmail, self.teacherName).then(function (response) {
                    self.fillLoader = true;
                    if (response.data && response.data.success) {
                        $timeout(function () {
                            self.showSuccess = true;
                        }, 100);
                    } else {
                        $timeout(function () {
                            self.closeModal();
                            PopUpSrv.error('', self.translate('INVITE_TEACHER_MODAL.GENERAL_ERROR'));
                        }, 100);
                    }
                });
            };

            this.closeModal = function () {
                $mdDialog.hide();
            };
        }]
    );
})(angular);

'use strict';

angular.module('znk.infra-web-app.invitation').service('InvitationListenerService',
    ["ENV", "InfraConfigSrv", "AuthService", "$timeout", "$q", function (ENV, InfraConfigSrv, AuthService, $timeout, $q) {
        'ngInject';

        var studentStorageProm = InfraConfigSrv.getStudentStorage();

        var NEW_INVITATION_PATH, SENT_INVITATION_PATH, MY_TEACHER_PATH;

        var self = this;
        self.receivedInvitations = {};
        self.pendingConformations = {};
        self.declinedInvitations = {};
        self.myTeacher = {};


        var pathsProm = $q.when(studentStorageProm).then(function (studentStorage) {
            var STUDENT_INVITATION_PATH = studentStorage.variables.appUserSpacePath + '/invitations';
            NEW_INVITATION_PATH = STUDENT_INVITATION_PATH + '/received';
            SENT_INVITATION_PATH = STUDENT_INVITATION_PATH + '/sent';
            MY_TEACHER_PATH = STUDENT_INVITATION_PATH + '/approved/';
           return $q.when();
        });

        this.removeListeners = function () {
            $q.when(pathsProm).then(function(){
                var receivedInvitationRef = firebaseListenerRef(NEW_INVITATION_PATH);
                receivedInvitationRef.off('child_added', receivedInvitationsChildAdded);
                receivedInvitationRef.off('child_removed', receivedInvitationsChildRemoved);

                var myTeacherRef = firebaseListenerRef(MY_TEACHER_PATH);
                myTeacherRef.off('child_added', myTeacherChildAdded);
                myTeacherRef.off('child_removed', myTeacherChildRemoved);

                var sentInvitationRef = firebaseListenerRef(SENT_INVITATION_PATH);
                sentInvitationRef.off('child_added', sentInvitationsChildAdded);
                sentInvitationRef.off('child_removed', sentInvitationsChildRemoved);
            });
        };


        self.addListeners = function () {
            $q.when(pathsProm).then(function(){
                _childAddedOrRemovedListener(NEW_INVITATION_PATH, receivedInvitationsChildAdded, receivedInvitationsChildRemoved);
                _childAddedOrRemovedListener(MY_TEACHER_PATH, myTeacherChildAdded, myTeacherChildRemoved);
                _childAddedOrRemovedListener(SENT_INVITATION_PATH, sentInvitationsChildAdded, sentInvitationsChildRemoved);
            });
        };

        function _childAddedOrRemovedListener(path, childAddedHandler, childRemovedHandler){
            var ref = firebaseListenerRef(path);
            ref.on('child_added', childAddedHandler);
            ref.on('child_removed', childRemovedHandler);
        }


        function receivedInvitationsChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.receivedInvitations[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function receivedInvitationsChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.receivedInvitations[dataSnapshot.key()];
                }
            });
        }

        function myTeacherChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.myTeacher[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function myTeacherChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.myTeacher[dataSnapshot.key()];
                }
            });
        }

        function sentInvitationsChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.pendingConformations[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function sentInvitationsChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.pendingConformations[dataSnapshot.key()];
                }
            });
        }

        function firebaseListenerRef(userPath) {
            //var authData = AuthService.getAuth();
            var authData = 'sadssad';
            var fullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + userPath;
            var userFullPath = fullPath.replace('$$uid', authData.uid);
            return new Firebase(userFullPath);
        }

    }]
);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationService',

        ["$mdDialog", "ENV", "AuthService", "$q", "$http", "PopUpSrv", "$filter", "UserProfileService", "InvitationListenerService", function ($mdDialog, ENV, AuthService, $q, $http, PopUpSrv, $filter, UserProfileService, InvitationListenerService) {
            'ngInject';

            var invitationEndpoint = ENV.backendEndpoint + 'invitation';
            var translate = $filter('translate');
            var httpConfig = {
                headers: 'application/json',
                timeout: ENV.promiseTimeOut
            };

            this.invitationStatus = {
                pending: 0,
                approved: 1,
                receiverDeclined: 2,
                senderDelete: 3,
                resent: 4,
                connectToUser: 5,
                receiverDelete: 6
            };

            this.getMyTeacher = function () {
                return $q.when(InvitationListenerService.myTeacher);
            };

            this.getReceived = function () {
                return $q.when(InvitationListenerService.receivedInvitations);
            };

            this.getPendingConformations = function () {
                return $q.when(InvitationListenerService.pendingConformations);
            };

            this.getDeclinedInvitations = function () {
                return $q.when(InvitationListenerService.declinedInvitations);
            };

            this.showInvitationConfirm = function (invitationId) {
                if (!ENV.dashboardFeatureEnabled) {
                    return false;
                }
                var invitation = {
                    status: this.invitationStatus.connectToUser,
                    invitationId: invitationId,
                    receiverAppName: ENV.firebaseAppScopeName,
                    senderAppName: ENV.firebaseDashboardAppScopeName
                };
                return this.updateInvitationStatus(invitation).then(function (response) {
                    if (response.data.success) {
                        return $mdDialog.show({
                            locals: {
                                invitation: response.data.data
                            },
                            controller: 'InvitationApproveModalController',
                            controllerAs: 'vm',
                            templateUrl: 'app/components/invitation/approveModal/invitationApproveModal.template.html',
                            clickOutsideToClose: true,
                            escapeToClose: true
                        });
                    }

                    var errorTitle = translate('INVITE_APPROVE_MODAL.INVITE_ERROR_TITLE');
                    var errorMsg = translate('INVITE_APPROVE_MODAL.INVITE_ERROR_MSG');
                    return PopUpSrv.error(errorTitle, errorMsg);
                });
            };

            this.updateInvitationStatus = function (invitation) {
                var authData = AuthService.getAuth();
                invitation.uid = authData.uid;
                invitation.senderAppName = ENV.firebaseDashboardAppScopeName;
                invitation.senderEmail = authData.password.email;
                return updateStatus(invitation);
            };

            this.openInviteTeacherModal = function () {
                return $mdDialog.show({
                    controller: 'inviteTeacherModalController',
                    controllerAs: 'vm',
                    templateUrl: 'components/invitation/inviteTeacherModal/inviteTeacherTemplateModal.template.html',
                    clickOutsideToClose: true,
                    escapeToClose: true
                });
            };

            this.inviteTeacher = function (receiverEmail, receiverName) {
                return UserProfileService.getProfile().then(function (profile) {
                    var authData = AuthService.getAuth();
                    var newInvitiation = [{
                       receiverAppName: ENV.firebaseDashboardAppScopeName,
                       receiverEmail: receiverEmail,
                       receiverName: receiverName || receiverEmail,
                       senderAppName: ENV.firebaseAppScopeName,
                       senderEmail: profile.email,
                       senderName: profile.nickname || profile.email,
                       senderUid: authData.uid
                    }];
                    return $http.post(invitationEndpoint, newInvitiation, httpConfig).then(function (response) {
                       return {
                           data: response.data[0]
                       };
                    }, function (error) {
                       return {
                           data: error.data
                       };
                    });
                });
            };

            this.deletePendingConformations = function (invitation) {
                var authData = AuthService.getAuth();
                invitation.uid = authData.uid;
                invitation.status = this.invitationStatus.senderDelete;
                invitation.receiverAppName = ENV.firebaseDashboardAppScopeName;
                invitation.senderAppName = ENV.firebaseAppScopeName;
                invitation.senderEmail = authData.password.email;
                return updateStatus(invitation);
            };

            this.removeListeners = function () {
                InvitationListenerService.removeListeners();
            };

            function updateStatus(invitation) {
                var updateUrl = invitationEndpoint + '/' + invitation.invitationId;
                return $http.put(updateUrl, invitation, httpConfig).then(
                    function (response) {
                        return {
                            data: response.data
                        };
                    },
                    function (error) {
                        return {
                            data: error.data
                        };
                    });
            }

            InvitationListenerService.addListeners();
        }]
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationHelperService',

        ["InvitationService", "$filter", "PopUpSrv", "UserProfileService", function (InvitationService, $filter, PopUpSrv, UserProfileService) {
            'ngInject';

            var self = this;
            self.translate = $filter('translate');
            self.translatedTitles = {
                successDisconnect: self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_DISCONNECT'),
                errorDisconnect: self.translate('INVITATION_MANAGER_DIRECTIVE.DISCONNECT_ERROR')
            };

            this.approve = function (invitation) {
                return UserProfileService.getProfile().then(function (profile) {
                    invitation.status = InvitationService.invitationStatus.approved;
                    invitation.originalReceiverName = profile.nickname || profile.email;
                    invitation.originalReceiverEmail = profile.email;
                    invitation.invitationReceiverName = invitation.receiverName;
                    invitation.invitationReceiverEmail = invitation.receiverEmail;

                    return updateStatus(invitation);
                });
            };

            this.decline = function (invitation) {
                invitation.status = InvitationService.invitationStatus.receiverDeclined;
                return updateStatus(invitation);
            };

            this.deleteTeacher = function (invitation) {
                invitation.status = InvitationService.invitationStatus.receiverDelete;
                updateStatus(invitation).then(function (response) {
                    if (response.data && response.data.success) {
                        PopUpSrv.success(self.translatedTitles.success, self.translatedTitles.successDisconnect);
                    } else {
                        PopUpSrv.error('', self.translatedTitles.errorDisconnect);
                    }
                }, function () {
                    PopUpSrv.error('', self.translatedTitles.errorDisconnect);
                });
            };

            function updateStatus(invitation) {
                return InvitationService.updateInvitationStatus(invitation);
            }
        }]
    );
})(angular);

angular.module('znk.infra-web-app.invitation').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/invitation/approveModal/invitationApproveModal.template.html",
    "<md-dialog ng-cloak class=\"invitation-confirm-modal\" translate-namespace=\"INVITE_APPROVE_MODAL\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content ng-switch=\"vm.requestMessage\">\n" +
    "        <section ng-switch-when=\"false\">\n" +
    "            <div class=\"main-title md-subheader\" translate=\".YOU_HAVE_INVITE\"></div>\n" +
    "            <div class=\"teacher\">\n" +
    "                <span>{{::vm.invitation.senderName}}</span>\n" +
    "                <span class=\"want-to-connect\" translate=\".WANT_TO_CONNECT\"></span>\n" +
    "            </div>\n" +
    "            <div class=\"btn-wrap\">\n" +
    "                <button class=\"md-button md-sm outline-blue\"\n" +
    "                        ng-disabled=\"vm.btnDisable === true\"\n" +
    "                        ng-click=\"vm.decline()\"\n" +
    "                        element-loader\n" +
    "                        fill-loader=\"vm.cancelFillLoader\"\n" +
    "                        show-loader=\"vm.cancelStartLoader\"\n" +
    "                        bg-loader=\"'#acacac'\"\n" +
    "                        precentage=\"50\"\n" +
    "                        font-color=\"'#0a9bad'\"\n" +
    "                        bg=\"'#FFFFFF'\">\n" +
    "                    <span translate=\".DECLINE\"></span>\n" +
    "                </button>\n" +
    "                <button class=\"md-button md-sm primary\"\n" +
    "                        ng-disabled=\"vm.btnDisable === true\"\n" +
    "                        ng-click=\"vm.approve()\"\n" +
    "                        element-loader\n" +
    "                        fill-loader=\"vm.approveFillLoader\"\n" +
    "                        show-loader=\"vm.approveStartLoader\"\n" +
    "                        bg-loader=\"'#07434A'\"\n" +
    "                        precentage=\"50\"\n" +
    "                        font-color=\"'#FFFFFF'\"\n" +
    "                        bg=\"'#0a9bad'\">\n" +
    "                    <span translate=\".ACCEPT\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </section>\n" +
    "\n" +
    "        <div class=\"big-success-msg switch-animation\" ng-switch-when=\"true\">\n" +
    "            <svg-icon class=\"completed-v-icon-wrap\" name=\"completed-v-icon\"></svg-icon>\n" +
    "            <div ng-bind-html=\"vm.responseMessage\"></div>\n" +
    "            <div class=\"done-btn-wrap\">\n" +
    "                <md-button aria-label=\"{{'INVITE_APPROVE_MODAL.DONE' | translate}}\"\n" +
    "                           class=\"success lg drop-shadow\" ng-click=\"vm.closeModal()\">\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"exclamation-mark-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/invitation/directives/invitation-manager.template.html",
    "<div translate-namespace=\"INVITATION_MANAGER_DIRECTIVE\">\n" +
    "<md-menu md-offset=\"-225 51\"  class=\"invitation-manager\">\n" +
    "    <div ng-click=\"$mdOpenMenu($event);\" class=\"md-icon-button invite-icon-btn\" aria-label=\"Open Invite menu\" ng-switch=\"hasItems(myTeachers)\">\n" +
    "        <div class=\"num-of-receive\" ng-if=\"hasItems(invitations)\">{{getItemsCount(invitations)}}</div>\n" +
    "        <section ng-switch-when=\"false\" class=\"circle-invite-wrap teacher-icon-wrap\">\n" +
    "            <svg-icon name=\"invitation-teacher-icon\"></svg-icon>\n" +
    "        </section>\n" +
    "        <section ng-switch-when=\"true\" class=\"circle-invite-wrap teacher-active-icon-wrap\">\n" +
    "            <svg-icon name=\"teacher-active-icon\"></svg-icon>\n" +
    "        </section>\n" +
    "    </div>\n" +
    "    <md-menu-content class=\"md-menu-content-invitation-manager\" ng-switch=\"(hasItems(invitations) || hasItems(myTeachers) || hasItems(declinedInvitations) || hasItems(conformations))\">\n" +
    "        <div class=\"empty-invite\" ng-switch-when=\"false\">\n" +
    "            <div class=\"empty-msg\" translate=\".EMPTY_INVITE\"></div>\n" +
    "            <div class=\"invite-action\">\n" +
    "                <div class=\"md-button outline-blue invite-btn\" ng-click=\"openInviteModal()\">\n" +
    "                    <div translate=\".INVITE_STUDENTS\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"hasItems(myTeachers)\" class=\"my-teacher-wrap\" ng-repeat=\"teacher in myTeachers\">\n" +
    "            <div class=\"title\" translate=\".MY_TEACHER\"></div>\n" +
    "            <div class=\"teacher-name\">{{::teacher.senderName}}</div>\n" +
    "            <div class=\"teacher-email\">{{::teacher.senderEmail}}</div>\n" +
    "            <svg-icon name=\"close-popup\" class=\"delete-teacher\" ng-click=\"deleteTeacher(teacher)\"></svg-icon>\n" +
    "        </div>\n" +
    "        <md-list ng-if=\"hasItems(declinedInvitations)\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::declinedTitle}}</md-subheader>\n" +
    "            <md-list-item class=\"declined-invitation-list\" ng-repeat=\"declinedInvitation in declinedInvitations\">\n" +
    "                <div class=\"declined-teacher-wrap\">\n" +
    "                    <div class=\"teacher-name\">{{::declinedInvitation.teacherName}} </div>\n" +
    "                    <span class=\"declined-your-invitation-text\" translate=\".DECLINED_YOR_INVITATION\"></span>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "        <md-list ng-if=\"hasItems(invitations)\" ng-switch-when=\"true\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::pendingTitle}}</md-subheader>\n" +
    "            <md-list-item ng-repeat=\"invite in invitations\">\n" +
    "                <svg-icon name=\"received-invitations-icon\" class=\"received-invitations\"></svg-icon>\n" +
    "                <div class=\"teacher-wrap\">\n" +
    "                    <div class=\"teacher-name\">{{::invite.senderName}}</div>\n" +
    "                    <div class=\"creation-time\">{{::invite.creationTime | date : 'd MMM, h:mm a'}}</div>\n" +
    "                </div>\n" +
    "                <div class=\"decline-invite\">\n" +
    "                    <svg-icon name=\"close-popup\" class=\"decline-invite-btn\" ng-click=\"decline(invite)\"></svg-icon>\n" +
    "                </div>\n" +
    "                <div class=\"approve-invite\">\n" +
    "                    <svg-icon name=\"v-icon\" class=\"v-icon-btn\" ng-click=\"approve(invite)\"></svg-icon>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "        <md-list ng-if=\"hasItems(conformations)\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::pendingConformationsTitle}}</md-subheader>\n" +
    "            <md-list-item ng-repeat=\"conformation in conformations\">\n" +
    "                <svg-icon name=\"sent-invitations-icon\" class=\"sent-invitations\"></svg-icon>\n" +
    "                <div class=\"teacher-wrap\">\n" +
    "                    <div class=\"teacher-email\">{{::conformation.receiverName}}</div>\n" +
    "                </div>\n" +
    "                <div class=\"decline-conformation\">\n" +
    "                    <svg-icon name=\"close-popup\" class=\"decline-conformation-btn\" ng-click=\"deletePendingConformations(conformation)\"></svg-icon>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "    </md-menu-content>\n" +
    "</md-menu>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/invitation/inviteTeacherModal/inviteTeacherTemplateModal.template.html",
    "<md-dialog class=\"invite-teacher-modal-wrap\" ng-cloak translate-namespace=\"INVITE_TEACHER_MODAL\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"invitation-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content class=\"modal-content invite-teacher-content\" ng-switch=\"!!vm.showSuccess\">\n" +
    "        <div class=\"modal-main-title\" translate=\".INVITE_TEACHER\"></div>\n" +
    "        <form ng-switch-when=\"false\" class=\"invite-teacher-form\" novalidate name=\"inviteTeacherForm\"\n" +
    "              ng-submit=\"inviteTeacherForm.$valid && vm.sendInvitation()\">\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.teacherEmail && inviteTeacherForm.$submitted}\">\n" +
    "                <input type=\"email\" autocomplete=\"off\"\n" +
    "                       placeholder=\"{{::'INVITE_TEACHER_MODAL.TEACHER_EMAIL' | translate}}\" name=\"teacherEmail\"\n" +
    "                       ng-minlength=\"6\" ng-maxlength=\"25\" ng-required=\"true\" ng-model=\"vm.teacherEmail\">\n" +
    "                <div class=\"error-msg\" translate=\".REQUIRED\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"znk-input-group\">\n" +
    "                <input type=\"text\" autocomplete=\"off\"\n" +
    "                       placeholder=\"{{::'INVITE_TEACHER_MODAL.TEACHER_NAME' | translate}}\" name=\"teacherName\"\n" +
    "                       ng-model=\"vm.teacherName\">\n" +
    "            </div>\n" +
    "            <div class=\"btn-wrap\">\n" +
    "                <div translate=\".INVITE_MSG\" class=\"invite-msg\"></div>\n" +
    "               <!-- <button type=\"submit\" class=\"md-button success lg drop-shadow\" translate=\".INVITE\"></button>-->\n" +
    "                <button type=\"submit\" class=\"md-button lg success drop-shadow\"\n" +
    "                    element-loader\n" +
    "                    fill-loader=\"vm.fillLoader\"\n" +
    "                    show-loader=\"vm.startLoader\"\n" +
    "                    bg-loader=\"'#72ab40'\"\n" +
    "                    precentage=\"50\"\n" +
    "                    font-color=\"'#FFFFFF'\"\n" +
    "                    bg=\"'#87ca4d'\">\n" +
    "                    <span translate=\".INVITE\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "        <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "            <svg-icon class=\"completed-v-icon-wrap\" name=\"completed-v-icon\"></svg-icon>\n" +
    "            <div translate=\".SUCCESS_INVITE\"></div>\n" +
    "            <div class=\"done-btn-wrap\">\n" +
    "                <md-button class=\"success lg drop-shadow\" ng-click=\"vm.closeModal()\">\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <div class=\"invite-teacher-icon\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/invitation/svg/close-popup.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\"\n" +
    "    class=\"invitation-close-popup\">\n" +
    "    <style>\n" +
    "\n" +
    "        .invitation-close-popup .st0{fill:none;}\n" +
    "        .invitation-close-popup .st1{fill:none;stroke: #ffffff;;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/invitation/svg/teacher-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 196.7 145.2\" class=\"teacher-icon\">\n" +
    "<path d=\"M76.7,114.2H16c-3.3,0-6-2.7-6-6V6c0-3.3,2.7-6,6-6h134c3.3,0,6,2.7,6,6l0,45.9c0,1.7-1.3,3-3,3c0,0,0,0,0,0\n" +
    "	c-1.7,0-3-1.3-3-3L150,6L16,6v102.2h60.7c1.7,0,3,1.3,3,3S78.4,114.2,76.7,114.2z\"/>\n" +
    "<path d=\"M129,24.2H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h61c1.7,0,3,1.3,3,3S130.7,24.2,129,24.2z\"/>\n" +
    "<path d=\"M129,44.3H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h61c1.7,0,3,1.3,3,3S130.7,44.3,129,44.3z\"/>\n" +
    "<path d=\"M114,64.5H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h46c1.7,0,3,1.3,3,3S115.7,64.5,114,64.5z\"/>\n" +
    "<path d=\"M153,108.8c-1.6,0-2.9-1.2-3-2.8c-0.1-1.7,1.1-3.1,2.8-3.2c11-0.8,19.6-10.1,19.6-21.1c0-11-8.6-20.3-19.6-21.1\n" +
    "	c-1.7-0.1-2.9-1.6-2.8-3.2c0.1-1.7,1.6-2.9,3.2-2.8c14.1,1.1,25.1,13,25.1,27.1c0,14.1-11,26-25.1,27.1\n" +
    "	C153.1,108.8,153.1,108.8,153,108.8z\"/>\n" +
    "<path d=\"M151.2,108.8c-15,0-27.2-12.2-27.2-27.2s12.2-27.2,27.2-27.2c0.7,0,1.4,0,2.1,0.1c1.7,0.1,2.9,1.6,2.8,3.2s-1.5,2.9-3.2,2.8\n" +
    "	c-0.5,0-1.1-0.1-1.6-0.1c-11.7,0-21.2,9.5-21.2,21.2c0,12.2,10.4,22,22.8,21.1c1.7-0.1,3.1,1.1,3.2,2.8c0.1,1.7-1.1,3.1-2.8,3.2\n" +
    "	C152.5,108.8,151.8,108.8,151.2,108.8z\"/>\n" +
    "<path d=\"M115.6,113.8c-1.1,0-2.1-0.6-2.7-1.6c-0.8-1.5-0.2-3.3,1.3-4.1l20.1-10.6c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1\n" +
    "	L117,113.5C116.5,113.7,116.1,113.8,115.6,113.8z\"/>\n" +
    "<path d=\"M115,114.2c-1.1,0-2.1-0.6-2.7-1.6c-0.8-1.5-0.2-3.3,1.3-4.1l0.6-0.3c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1\n" +
    "	l-0.6,0.3C115.9,114.1,115.4,114.2,115,114.2z\"/>\n" +
    "<path d=\"M193.7,145.2H107c-1,0-1.9-0.5-2.4-1.2c-0.6-0.8-0.7-1.8-0.4-2.7l1.5-4.8l-3.7,1.2c-1.6,0.5-3.3,0.6-4.8,0.3\n" +
    "	c-3.2-0.7-7.9-2.9-12.6-9.7c-5.2-7.6-13.9-20.9-17.4-26.2c-1-1.6-2.1-4.3-2.1-6.6c-0.1-3.5,1.4-6.7,3.9-8.6c2.6-2,6-2.5,9.6-1.4\n" +
    "	c2.5,0.7,5.4,3,6.7,5.3l14.1,24.7c0.2,0.3,0.6,0.4,0.9,0.3l13.3-7c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1l-13.3,7\n" +
    "	c-3.2,1.7-7.1,0.5-8.9-2.6L80,93.5c-0.5-1-2.1-2.2-3.2-2.5c-1.3-0.4-3-0.6-4.3,0.4c-1,0.8-1.6,2.2-1.6,3.8c0,0.9,0.6,2.6,1.1,3.4\n" +
    "	c3.5,5.4,12.2,18.6,17.3,26.1c3.8,5.5,7.2,6.9,8.9,7.3c0.6,0.1,1.2,0.1,1.7-0.1l9.2-3c1.1-0.3,2.2-0.1,3,0.7s1.1,2,0.7,3l-2.1,6.4\n" +
    "	h79.5c-1.3-24.4-26.2-33.4-27.3-33.8c-1.6-0.5-2.4-2.3-1.8-3.8c0.5-1.6,2.3-2.4,3.8-1.8c0.3,0.1,32.1,11.6,31.3,42.6\n" +
    "	C196.6,143.9,195.3,145.2,193.7,145.2z\"/>\n" +
    "<path d=\"M70.7,92.2c-0.9,0-1.8-0.4-2.4-1.2L41.3,53.7c-1-1.3-0.7-3.2,0.7-4.2c1.3-1,3.2-0.7,4.2,0.7l26.9,37.2\n" +
    "	c1,1.3,0.7,3.2-0.7,4.2C71.9,92,71.3,92.2,70.7,92.2z\"/>\n" +
    "<path d=\"M83,134.2H3c-1.7,0-3-1.3-3-3s1.3-3,3-3h80c1.7,0,3,1.3,3,3S84.7,134.2,83,134.2z\"/>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm', [
        'pascalprecht.translate',
        'znk.infra.svgIcon'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'login-form-envelope': 'components/loginForm/svg/login-form-envelope.svg',
                'login-form-lock': 'components/loginForm/svg/login-form-lock.svg'
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

    angular.module('znk.infra-web-app.loginForm').directive('loginForm', [
        '$translatePartialLoader', 'LoginFormSrv',
        function ($translatePartialLoader, LoginFormSrv) {
            return {
                templateUrl: 'components/loginForm/templates/loginForm.directive.html',
                restrict: 'E',
                link: function (scope) {
                    $translatePartialLoader.addPart('loginForm');

                    scope.vm = {};

                    scope.vm.submit = function(){
                        LoginFormSrv.login(scope.vm.formData).catch(function(err){
                            console.error(err);
                            window.alert(err);
                        });
                    };
                }
            };
        }
    ]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginForm').service('LoginFormSrv', [
        'ENV', '$http', '$window',
        function (ENV, $http, $window) {
            this.login = function(loginData){
                var ref = new Firebase(ENV.fbGlobalEndPoint, ENV.firebaseAppScopeName);
                return ref.authWithPassword(loginData).then(function(authData){
                    var postUrl = ENV.backendEndpoint + 'firebase/token';
                    var postData = {
                        email: authData.password ? authData.password.email : '',
                        uid: authData.uid,
                        fbDataEndPoint: ENV.fbDataEndPoint,
                        fbEndpoint: ENV.fbGlobalEndPoint,
                        auth: ENV.dataAuthSecret,
                        token: authData.token
                    };

                    return $http.post(postUrl, postData).then(function (token) {
                        var refDataDB = new Firebase(ENV.fbDataEndPoint, ENV.firebaseAppScopeName);
                        refDataDB.authWithCustomToken(token.data).then(function(){
                            var appUrl = ENV.redirectLogin;
                            $window.location.replace(appUrl);
                        });
                    });
                });
            };
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.loginForm').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/loginForm/svg/login-form-envelope.svg",
    "<svg\n" +
    "    class=\"login-form-envelope-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 190.2 143.7\">\n" +
    "    <style>\n" +
    "        .login-form-envelope-svg{\n" +
    "            width: 20px;\n" +
    "            stroke: #CACACA;\n" +
    "            fill: none;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M174.7,141.2H15.4c-7.1,0-12.9-5.8-12.9-12.9V15.4c0-7.1,5.8-12.9,12.9-12.9h159.3c7.1,0,12.9,5.8,12.9,12.9\n" +
    "		v112.8C187.7,135.3,181.9,141.2,174.7,141.2z\"/>\n" +
    "	<path class=\"st0\" d=\"M4.1,7.3l77.3,75.1c7.6,7.4,19.8,7.4,27.4,0l77.3-75.1\"/>\n" +
    "	<line class=\"st0\" x1=\"77\" y1=\"78\" x2=\"7.7\" y2=\"135.5\"/>\n" +
    "	<line class=\"st0\" x1=\"112.8\" y1=\"78\" x2=\"182.1\" y2=\"135.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginForm/svg/login-form-lock.svg",
    "<svg class=\"locked-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .locked-svg{\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginForm/templates/loginForm.directive.html",
    "<form novalidate class=\"login-form-container\" translate-namespace=\"LOGIN_FORM\" ng-submit=\"vm.submit()\">\n" +
    "    <div class=\"title\"\n" +
    "         translate=\".LOGIN\">\n" +
    "    </div>\n" +
    "    <div class=\"inputs-container\">\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"login-form-envelope\"></svg-icon>\n" +
    "            <input type=\"text\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                   name=\"email\"\n" +
    "                   ng-model=\"vm.formData.email\">\n" +
    "        </div>\n" +
    "        <div class=\"input-wrapper\">\n" +
    "            <svg-icon name=\"login-form-lock\"></svg-icon>\n" +
    "            <input type=\"password\"\n" +
    "                   placeholder=\"{{'LOGIN_FORM.PASSWORD' | translate}}\"\n" +
    "                   name=\"password\"\n" +
    "                   ng-model=\"vm.formData.password\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"submit-btn-wrapper\">\n" +
    "        <button type=\"submit\" translate=\".LOGIN_IN\"></button>\n" +
    "    </div>\n" +
    "    <div class=\"forgot-pwd-wrapper\">\n" +
    "        <span translate=\".FORGOT_PWD\"></span>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth-title\" translate=\".CONNECT_WITH\"></div>\n" +
    "    </div>\n" +
    "</form>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'znk.infra.config',
        'znk.infra.analytics',
        'znk.infra.storage',
        'znk.infra.user',
        'ui.router',
        'ngMaterial',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.diagnosticIntro'
    ]).config([
        'SvgIconSrvProvider', '$stateProvider',
        function (SvgIconSrvProvider, $stateProvider) {
            var svgMap = {
                'on-boarding-heart': 'components/onBoarding/svg/onboarding-heart-icon.svg',
                'on-boarding-target': 'components/onBoarding/svg/onboarding-target-icon.svg',
                'on-boarding-hat': 'components/onBoarding/svg/onboarding-hat-icon.svg',
                'on-boarding-dropdown-arrow-icon': 'components/onBoarding/svg/dropdown-arrow.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);

            $stateProvider
                .state('app.onBoarding', {
                    url: '/onBoarding',
                    templateUrl: 'components/onBoarding/templates/onBoarding.template.html',
                    controller: 'OnBoardingController',
                    controllerAs: 'vm',
                    resolve: {
                        onBoardingStep: ['OnBoardingService', function (OnBoardingService) {
                            return OnBoardingService.getOnBoardingStep();
                        }]
                    }
                })
                .state('app.onBoarding.welcome', {
                    templateUrl: 'components/onBoarding/templates/onBoardingWelcome.template.html',
                    controller: 'OnBoardingWelcomesController',
                    controllerAs: 'vm',
                    resolve: {
                        userProfile: ['UserProfileService', function (UserProfileService) {
                            return UserProfileService.getProfile();
                        }]
                    }
                })
                .state('app.onBoarding.schools', {
                    templateUrl: 'components/onBoarding/templates/onBoardingSchools.template.html',
                    controller: 'OnBoardingSchoolsController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.goals', {
                    templateUrl: 'components/onBoarding/templates/onBoardingGoals.template.html',
                    controller: 'OnBoardingGoalsController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.diagnostic', {
                    templateUrl: 'components/onBoarding/templates/onBoardingDiagnostic.template.html',
                    controller: 'OnBoardingDiagnosticController',
                    controllerAs: 'vm'
                });
        }
    ]);

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', ['$state', 'onBoardingStep', '$translatePartialLoader', function($state, onBoardingStep, $translatePartialLoader) {
        $translatePartialLoader.addPart('onBoarding');
        $state.go(onBoardingStep.url);
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingDiagnosticController', ['OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(OnBoardingService, $state, znkAnalyticsSrv) {
        this.setOnboardingCompleted = function (nextState, eventText) {
            znkAnalyticsSrv.eventTrack({
                eventName: 'onBoardingDiagnosticStep',
                props: {
                    clicked: eventText
                }
            });
            OnBoardingService.setOnBoardingStep(OnBoardingService.steps.ROADMAP).then(function () {
                $state.go(nextState);
            });
        };
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingGoalsController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv',
        function($state, OnBoardingService, znkAnalyticsSrv) {
            this.userGoalsSetting = {
                recommendedGoalsTitle: true,
                saveBtn: {
                    title: '.SAVE_AND_CONTINUE',
                    showSaveIcon: true
                }
            };

            this.saveGoals = function () {
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingGoalsStep' });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                $state.go('app.onBoarding.diagnostic');
            };
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingSchoolsController', ['$state', 'OnBoardingService', 'userGoalsSelectionService', 'znkAnalyticsSrv', '$timeout',
        function($state, OnBoardingService, userGoalsSelectionService, znkAnalyticsSrv, $timeout) {

            function _addEvent(clicked) {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'onBoardingSchoolsStep',
                    props: {
                        clicked: clicked
                    }
                });
            }

            function _goToGoalsState(newUserSchools, evtName) {
                _addEvent(evtName);
                userGoalsSelectionService.setDreamSchools(newUserSchools, true).then(function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.GOALS).then(function () {
                        $timeout(function () {
                            $state.go('app.onBoarding.goals');
                        });
                    });
                });
            }

            this.schoolSelectEvents = {
                onSave: function save(newUserSchools) {
                    _goToGoalsState(newUserSchools, 'Save and Continue');
                }
            };

            this.skipSelection = function () {
                _goToGoalsState([], 'I don\'t know yet');
            };
    }]);
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingWelcomesController', ['userProfile', 'OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(userProfile, OnBoardingService, $state, znkAnalyticsSrv) {

            var onBoardingSettings = OnBoardingService.getOnBoardingSettings();
            this.username = userProfile.nickname || '';

            this.nextStep = function () {
                var nextStep;
                var nextState;
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingWelcomeStep' });
                if (onBoardingSettings.showSchoolStep) {
                    nextStep = OnBoardingService.steps.SCHOOLS;
                    nextState = 'app.onBoarding.schools';
                } else {
                    nextStep = OnBoardingService.steps.GOALS;
                    nextState = 'app.onBoarding.goals';
                }
                OnBoardingService.setOnBoardingStep(nextStep);
                $state.go(nextState);
            };
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('onBoardingBar', function OnBoardingBarDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/onBoarding/templates/onBoardingBar.template.html',
            scope: {
                step: '@'
            }
        };

        return directive;
    });

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding').run(["$rootScope", "OnBoardingService", "$state", function ($rootScope, OnBoardingService, $state) {
        'ngInject';
        var isOnBoardingCompleted = false;
        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState) {//eslint-disable-line
            if (isOnBoardingCompleted) {
                return;
            }

            var APP_WORKOUTS_STATE = 'app.workoutsRoadmap';
            var isGoingToWorkoutsState = toState.name.indexOf(APP_WORKOUTS_STATE) !== -1;

            if (isGoingToWorkoutsState) {
                evt.preventDefault();

                OnBoardingService.isOnBoardingCompleted().then(function (_isOnBoardingCompleted) {
                    isOnBoardingCompleted = _isOnBoardingCompleted;

                    if (!isOnBoardingCompleted) {
                        var ON_BOARDING_STATE_NAME = 'app.onBoarding';
                        var isNotFromOnBoardingState = fromState.name.indexOf(ON_BOARDING_STATE_NAME) === -1;
                        if (isNotFromOnBoardingState) {
                            $state.go(ON_BOARDING_STATE_NAME);
                        }
                    } else {
                        $state.go(toState, toParams, {
                            reload: true
                        });
                    }
                });
            }
        });
    }]);

})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').provider('OnBoardingService', [function() {
        this.$get = ['InfraConfigSrv', 'StorageSrv', function(InfraConfigSrv, StorageSrv) {
            var self = this;
            var ONBOARDING_PATH = StorageSrv.variables.appUserSpacePath + '/' + 'onBoardingProgress';
            var onBoardingServiceObj = {};

            var onBoardingStates = {
                1: 'app.onBoarding.welcome',
                2: 'app.onBoarding.schools',
                3: 'app.onBoarding.goals',
                4: 'app.onBoarding.diagnostic',
                5: 'app.workoutsRoadmap'
            };

            onBoardingServiceObj.steps = {
                WELCOME: 1,
                SCHOOLS: 2,
                GOALS: 3,
                DIAGNOSTIC: 4,
                ROADMAP: 5
            };

            onBoardingServiceObj.getOnBoardingStep = function () {
                return getProgress().then(function (progress) {
                    return {
                        url: onBoardingStates[progress.step]
                    };
                });
            };

            onBoardingServiceObj.setOnBoardingStep = function (stepNum) {
                return getProgress().then(function (progress) {
                    progress.step = stepNum;
                    return setProgress(progress);
                });
            };

            function getProgress() {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.get(ONBOARDING_PATH).then(function (progress) {
                        if (!progress.step) {
                            progress.step = 1;
                        }
                        return progress;
                    });
                });
            }

            function setProgress(progress) {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.set(ONBOARDING_PATH, progress);
                });
            }

            onBoardingServiceObj.isOnBoardingCompleted = function () {
                return getProgress().then(function (onBoardingProgress) {
                    return onBoardingProgress.step === onBoardingServiceObj.steps.ROADMAP;
                });
            };

            onBoardingServiceObj.getOnBoardingSettings = function() {
                return self.settings;
            };

            return onBoardingServiceObj;
        }];
    }]);
})(angular);

angular.module('znk.infra-web-app.onBoarding').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/onBoarding/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-hat-icon.svg",
    "<svg class=\"on-boarding-hat-svg\"\n" +
    "     version=\"1.1\" id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-366 104.4 57.2 34.6\"\n" +
    "     style=\"enable-background:new -366 104.4 57.2 34.6;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.on-boarding-hat-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "        width: 47px;\n" +
    "    }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M-339.5,139.1c-9.8,0-15.9-5.6-16-5.7c-0.2-0.2-0.3-0.5-0.3-0.7v-11.2c0-0.6,0.4-1,1-1s1,0.4,1,1v10.7\n" +
    "		c2.1,1.7,13.5,10.2,30-0.1v-10.6c0-0.6,0.4-1,1-1s1,0.4,1,1v11.2c0,0.3-0.2,0.7-0.5,0.8C-328.7,137.7-334.6,139.1-339.5,139.1z\"/>\n" +
    "	<path class=\"st0\" d=\"M-338.7,128.5c-0.1,0-0.3,0-0.4-0.1l-26.1-10.5c-0.4-0.2-0.7-0.6-0.7-1.1c0-0.5,0.3-0.9,0.7-1.1l26.5-11.2\n" +
    "		c0.3-0.1,0.6-0.1,0.9,0l26.6,11.2c0.4,0.2,0.7,0.6,0.7,1.1c0,0.5-0.3,0.9-0.7,1.1l-27,10.5C-338.4,128.4-338.6,128.5-338.7,128.5z\n" +
    "		 M-361.7,116.8l23,9.3l23.9-9.3l-23.5-9.9L-361.7,116.8z\"/>\n" +
    "	<path class=\"st0\" d=\"M-312.8,126.5c-0.6,0-1-0.4-1-1v-8c0-0.6,0.4-1,1-1s1,0.4,1,1v8C-311.8,126.1-312.2,126.5-312.8,126.5z\"/>\n" +
    "	<path class=\"st0\" d=\"M-312,130.5c-1.7,0-3.1-1.4-3.1-3.1c0-1.7,1.4-3.1,3.1-3.1s3.1,1.4,3.1,3.1\n" +
    "		C-308.9,129.1-310.3,130.5-312,130.5z M-312,126.7c-0.4,0-0.7,0.3-0.7,0.7s0.3,0.7,0.7,0.7s0.7-0.3,0.7-0.7S-311.6,126.7-312,126.7\n" +
    "		z\"/>\n" +
    "	<path class=\"st0\" d=\"M-315,132.7l1.5-2.7c0.6-1.1,2.2-1.1,2.9,0l1.5,2.7c0.6,1.1-0.2,2.5-1.4,2.5h-3.1\n" +
    "		C-314.8,135.2-315.6,133.8-315,132.7z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-heart-icon.svg",
    "<svg class=\"on-boarding-heart-svg\"\n" +
    "     version=\"1.1\"\n" +
    "     id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-377 106.7 35.9 31.3\"\n" +
    "     style=\"enable-background:new -377 106.7 35.9 31.3;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.on-boarding-heart-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "    }\n" +
    "    </style>\n" +
    "\n" +
    "<path class=\"st0\" d=\"M-359,138c-0.2,0-0.4-0.1-0.6-0.2c-0.1,0-0.1-0.1-0.2-0.1l-0.2-0.2c-4.3-4-8.8-7.9-13.2-11.6\n" +
    "	c-3.1-2.7-4.4-6.5-3.6-10.4c0.9-4,4-7.5,7.7-8.6c3.4-1,6.9,0,10,2.9c3.1-2.9,6.7-3.9,10.1-2.9c3.7,1.1,6.7,4.4,7.6,8.5\n" +
    "	c0.9,3.9-0.4,7.8-3.6,10.5c-6.5,5.5-11.4,10-13,11.5l-0.3,0.2C-358.5,137.9-358.7,138-359,138z M-366.6,108.2\n" +
    "	c-0.7,0-1.4,0.1-2.1,0.3c-3.2,0.9-5.8,3.9-6.6,7.4c-0.4,2-0.6,5.8,3.1,8.9c4.4,3.7,8.8,7.6,13.2,11.6l0,0c1.6-1.5,6.6-6,13-11.6\n" +
    "	c2.7-2.3,3.8-5.6,3.1-9c-0.8-3.5-3.4-6.4-6.5-7.3c-3.1-0.9-6.3,0.2-9.1,3c-0.1,0.1-0.3,0.2-0.5,0.2c0,0,0,0,0,0\n" +
    "	c-0.2,0-0.4-0.1-0.5-0.2C-361.8,109.3-364.2,108.2-366.6,108.2z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-target-icon.svg",
    "<svg class=\"on-boarding-target-svg\"\n" +
    "     version=\"1.1\"\n" +
    "     id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-378 104 35 35\"\n" +
    "     style=\"enable-background:new -378 104 35 35;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.on-boarding-target-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M-361,134.6c-7.5,0-13.5-6.1-13.5-13.5s6.1-13.5,13.5-13.5c7.5,0,13.5,6.1,13.5,13.5S-353.5,134.6-361,134.6z\n" +
    "		 M-361,108.8c-6.8,0-12.3,5.5-12.3,12.3c0,6.8,5.5,12.3,12.3,12.3s12.3-5.5,12.3-12.3C-348.7,114.3-354.2,108.8-361,108.8z\"/>\n" +
    "	<path class=\"st0\" d=\"M-361,129c-4.4,0-7.9-3.6-7.9-7.9c0-4.4,3.6-7.9,7.9-7.9c4.4,0,7.9,3.6,7.9,7.9\n" +
    "		C-353.1,125.5-356.6,129-361,129z M-361,114.4c-3.7,0-6.7,3-6.7,6.7c0,3.7,3,6.7,6.7,6.7s6.7-3,6.7-6.7\n" +
    "		C-354.3,117.4-357.3,114.4-361,114.4z\"/>\n" +
    "	<path class=\"st0\" d=\"M-361,139c-0.6,0-1-0.4-1-1v-33c0-0.6,0.4-1,1-1s1,0.4,1,1v33C-360,138.6-360.4,139-361,139z\"/>\n" +
    "	<path class=\"st0\" d=\"M-344,122h-33c-0.6,0-1-0.4-1-1s0.4-1,1-1h33c0.6,0,1,0.4,1,1S-343.4,122-344,122z\"/>\n" +
    "	<circle class=\"st0\" cx=\"-360.9\" cy=\"121.3\" r=\"1.9\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoarding.template.html",
    "<div class=\"on-board\">\n" +
    "    <div class=\"container base-border-radius base-box-shadow\" ui-view></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingBar.template.html",
    "<div class=\"on-board-pager-wrap\">\n" +
    "    <div class=\"on-board-pager\">\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'heart-circle-selected': step === 'welcome'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-heart\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'target-circle-selected': step === 'goals'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-target\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'hat-circle-selected': step === 'diagnostic'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-hat\"></svg-icon>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingDiagnostic.template.html",
    "<section class=\"step diagnostic\" translate-namespace=\"ON_BOARDING.DIAGNOSTIC\">\n" +
    "    <div class=\"diagnostic-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "    <diagnostic-intro></diagnostic-intro>\n" +
    "    <div class=\"btn-wrap\">\n" +
    "        <md-button tabindex=\"2\" class=\"default sm\" ng-click=\"vm.setOnboardingCompleted('app.workoutsRoadmap', 'Take It Later')\">\n" +
    "            <span translate=\".TAKE_IT_LATER\"></span>\n" +
    "        </md-button>\n" +
    "        <md-button autofocus tabindex=\"1\" class=\"md-sm znk md-primary\" ng-click=\"vm.setOnboardingCompleted('app.workoutsRoadmap.diagnostic', 'Start Test')\">\n" +
    "            <span translate=\".START_TEST\"></span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"diagnostic\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingGoals.template.html",
    "<section class=\"step\" translate-namespace=\"ON_BOARDING.GOALS\">\n" +
    "    <div class=\"goals\">\n" +
    "        <div class=\"main-title\" translate=\".SET_SCORE_GOALS\"></div>\n" +
    "        <user-goals on-save=\"vm.saveGoals()\" setting=\"vm.userGoalsSetting\"></user-goals>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"goals\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingSchools.template.html",
    "<section class=\"step\" translate-namespace=\"ON_BOARDING.GOALS\">\n" +
    "    <div class=\"goals\">\n" +
    "        <div class=\"main-title\" translate=\".SET_SCORE_GOALS\"></div>\n" +
    "        <div class=\"sub-title\" translate=\".WHATS_YOUR_DREAM_SCHOOL\"></div>\n" +
    "        <div class=\"select-schools-title\" translate=\".SELECT_3_DREAM_SCHOOLS\"></div>\n" +
    "        <school-select user-schools=\"vm.userSchools\"\n" +
    "                       events=\"vm.schoolSelectEvents\">\n" +
    "        </school-select>\n" +
    "        <div class=\"light-title\" ng-click=\"vm.skipSelection()\" translate=\".I_DONT_KNOW\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"bg-wrap\">\n" +
    "        <div class=\"thinking-raccoon\"></div>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"goals\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingWelcome.template.html",
    "<section class=\"step make-padding\" translate-namespace=\"ON_BOARDING.WELCOME\">\n" +
    "    <div class=\"welcome\">\n" +
    "        <div class=\"main-title\">\n" +
    "            <span translate=\".WELCOME\"></span>,\n" +
    "            <span class=\"user-name\">{{vm.username}}!</span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\">\n" +
    "            <div translate=\".THANK_YOU_MESSAGE\"></div>\n" +
    "            <span translate=\".ZINKERZ_APP_WELCOME_TEXT\"></span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\" translate=\".WE_ARE_HERE_TO_HELP\"></div>\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <md-button autofocus tabindex=\"1\" class=\"md-primary znk inline-block\"\n" +
    "                       ng-click=\"vm.nextStep()\" ng-cloak>\n" +
    "                <span translate=\".CONTINUE\" class=\"continue-title\"></span>\n" +
    "                <svg-icon name=\"on-boarding-dropdown-arrow-icon\"\n" +
    "                          class=\"dropdown-arrow-icon inline-block\">\n" +
    "                </svg-icon>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"smile-raccoon\"></div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"welcome\"></on-boarding-bar>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase',
        ['ngAnimate',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum',
            'znk.infra.config',
            'znk.infra.storage',
            'znk.infra.auth',
            'znk.infra.analytics'
        ])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'purchase-check-mark': 'components/purchase/svg/check-mark-icon.svg',
                    'purchase-close-popup': 'components/purchase/svg/close-popup.svg',
                    'purchase-popup-bullet-1-icon': 'components/purchase/svg/purchase-popup-bullet-1-icon.svg',
                    'purchase-popup-bullet-2-icon': 'components/purchase/svg/purchase-popup-bullet-2-icon.svg',
                    'purchase-popup-bullet-3-icon': 'components/purchase/svg/purchase-popup-bullet-3-icon.svg',
                    'purchase-popup-bullet-4-icon': 'components/purchase/svg/purchase-popup-bullet-4-icon.svg',
                    'purchase-popup-bullet-5-icon': 'components/purchase/svg/purchase-popup-bullet-5-icon.svg',
                    'purchase-raccoon-logo-icon': 'components/purchase/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').controller('PurchaseDialogController',['$mdDialog', 'purchaseService','PurchaseStateEnum',
        function($mdDialog, purchaseService, PurchaseStateEnum) {

            var self = this;

            self.purchaseStateEnum = PurchaseStateEnum;

            function _checkIfHasProVersion() {
                purchaseService.hasProVersion().then(function (hasProVersion) {
                    self.purchaseState = hasProVersion ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                });
            }

            var pendingPurchaseProm = purchaseService.getPendingPurchase();
            if (pendingPurchaseProm) {
                self.purchaseState = PurchaseStateEnum.PENDING.enum;
                pendingPurchaseProm.then(function () {
                    _checkIfHasProVersion();
                });
            } else {
                _checkIfHasProVersion();
            }



            purchaseService.getProduct().then(function (prodObj) {
                self.productPrice = +prodObj.price;
                self.productPreviousPrice = +prodObj.previousPrice;
                self.productDiscountPercentage = Math.floor(100 - ((self.productPrice / self.productPreviousPrice) * 100)) + '%';
            });

            this.close = function () {
                $mdDialog.hide();
            };
        }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').directive('purchaseBtn',
        ["ENV", "$q", "$sce", "AuthService", "UserProfileService", "$location", "purchaseService", "$filter", "PurchaseStateEnum", "$log", "$translatePartialLoader", "znkAnalyticsSrv", function (ENV, $q, $sce, AuthService, UserProfileService, $location, purchaseService, $filter, PurchaseStateEnum, $log, $translatePartialLoader, znkAnalyticsSrv) {
            'ngInject';

            return {
                templateUrl:  'components/purchase/templates/purchaseBtn.template.html',
                restrict: 'E',
                scope: {
                    purchaseState: '='
                },
                link: function (scope) {
                    $translatePartialLoader.addPart('purchase');

                    scope.vm = {};

                    scope.vm.translate = $filter('translate');

                    scope.vm.saveAnalytics = function () {
                        znkAnalyticsSrv.eventTrack({ eventName: 'purchaseOrderStarted' });
                    };

                    scope.$watch('purchaseState', function (newPurchaseState) {
                        if (angular.isUndefined(newPurchaseState)) {
                            return;
                        }

                        if (newPurchaseState === PurchaseStateEnum.NONE.enum) {
                            buildForm();
                        }

                        if (newPurchaseState === PurchaseStateEnum.PRO.enum) {
                            purchaseService.getUpgradeData().then(function (resp) {
                                /**
                                 * TODO: currently the createdTime doesn't exist in this object, need to add to firebase
                                 */
                                scope.vm.upgradeDate = $filter('date')(resp.creationTime, 'mediumDate');
                            });
                        }
                    });

                    function buildForm() {
                        $q.all([UserProfileService.getProfile(), purchaseService.getProduct()]).then(function (results) {
                            var userEmail = results[0].email;
                            //var userId = AuthService.getAuth().uid;
                            var userId;
                            var productId = results[1].id;

                            if (userEmail && userId) {
                                scope.vm.userEmail = userEmail;
                                scope.vm.hostedButtonId = ENV.purchasePaypalParams.hostedButtonId;
                                scope.vm.custom = userId + '#' + productId + '#' + ENV.fbDataEndPoint + '#' + ENV.firebaseAppScopeName;  // userId#productId#dataEndPoint#appName
                                scope.vm.returnUrlSuccess = buildReturnUrl('purchaseSuccess', '1');
                                scope.vm.returnUrlFailed = buildReturnUrl('purchaseSuccess', '0');
                                scope.vm.formAction = trustSrc(ENV.purchasePaypalParams.formAction);
                                scope.vm.btnImgSrc = trustSrc(ENV.purchasePaypalParams.btnImgSrc);
                                scope.vm.pixelGifSrc = trustSrc(ENV.purchasePaypalParams.pixelGifSrc);
                                scope.vm.showForm = true;
                            } else {
                                /**
                                 * if case of failure
                                 * TODO: Add atatus notification
                                 */
                                $log.error('Invalid user attributes: userId or userEmail are not defined, cannot build purchase form');
                                scope.vm.showPurchaseError = function () {
                                    purchaseService.hidePurchaseDialog().then(function () {
                                        purchaseService.showPurchaseError();
                                    });
                                };
                            }
                        });
                    }

                    function buildReturnUrl(param, val) {
                        return $location.absUrl().split('?')[0] + addUrlParam($location.search(), param, val);
                    }

                    // http://stackoverflow.com/questions/21292114/external-resource-not-being-loaded-by-angularjs
                    // in order to use src and action attributes that link to external url's,
                    // you should whitelist them
                    function trustSrc(src) {
                        return $sce.trustAsResourceUrl(src);
                    }

                    function addUrlParam(searchObj, key, val) {
                        var search = '';
                        if (!angular.equals(searchObj, {})) {
                            search = '?';
                            // parse the search attribute as a string
                            angular.forEach(searchObj, function (v, k) {
                                search += k + '=' + v;
                            });
                        }

                        var newParam = key + '=' + val,
                            urlParams = '?' + newParam;
                        if (search) {
                            urlParams = search.replace(new RegExp('[\?&]' + key + '[^&]*'), '$1' + newParam);
                            if (urlParams === search) {
                                urlParams += '&' + newParam;
                            }
                        }
                        return urlParams;
                    }
                }

            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('PurchaseStateEnum',['EnumSrv',
        function(EnumSrv) {

            var PurchaseStateEnum = new EnumSrv.BaseEnum([
                ['PENDING', 'pending', 'pending'],
                ['PRO', 'pro', 'pro'],
                ['NONE', 'none', 'none']
            ]);

            return PurchaseStateEnum;
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('purchaseService',
        ["$q", "$mdDialog", "$filter", "InfraConfigSrv", "ENV", "$log", "$mdToast", "$window", "PopUpSrv", "znkAnalyticsSrv", function ($q, $mdDialog, $filter, InfraConfigSrv, ENV, $log, $mdToast, $window, PopUpSrv, znkAnalyticsSrv) {
            'ngInject';

            var self = this;

            var studentStorageProm = InfraConfigSrv.getStudentStorage();

            var pendingPurchaseDefer;

            var purchaseData = null;

            self.getProduct = function () {
                var productDataPath = 'iap/desktop/allContent';
                return $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    return StudentStorageSrv.get(productDataPath);
                });
            };

            self.getUpgradeData = function () {
                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var PURCHASE_PATH = StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                    return StudentStorageSrv.get(PURCHASE_PATH);
                });
            };

            self.hasProVersion = function () {
                var hasProVersion = !!purchaseData;
                return $q.when(hasProVersion);
            };

            self.purchaseDataExists = function () {
                //var isPurchased;
                //var authData = AuthService.getAuth();
                //if (authData) {
                //    var currentUID = authData.uid;
                //    var purchaseFullPath = StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                //    purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
                //    return StudentStorageSrv.get(purchaseFullPath).then(function (purchaseObj) {
                //        isPurchased = (angular.equals(purchaseObj, {})) ? false : true;
                //        return isPurchased;
                //    });
                //}
                //return $q.reject();
            };

            self.checkPendingStatus = function () {
                var isPending;
                return $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;

                    return StudentStorageSrv.get(pendingPurchasesPath).then(function (pendingObj) {
                        isPending = (angular.equals(pendingObj, {})) ? false : true;
                        if (isPending) {
                            pendingPurchaseDefer = $q.defer();
                        }
                        return isPending;
                    });
                });
            };

            self.setPendingPurchase = function () {
                pendingPurchaseDefer = $q.defer();
                return $q.all([self.getProduct(), self.purchaseDataExists(), studentStorageProm]).then(function (res) {
                    var product = res[0];
                    var isPurchased = res[1];
                    var StudentStorageSrv = res[2];
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;

                    if (!isPurchased) {
                        var pendingPurchaseVal = {
                            id: product.id,
                            purchaseTime: StudentStorageSrv.variables.currTimeStamp
                        };
                        StudentStorageSrv.set(pendingPurchasesPath, pendingPurchaseVal);
                    } else {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'purchaseOrderCompleted', props: product
                        });
                        if ($window.fbq) {
                            $window.fbq('track', 'Purchase', {
                                value: product.price,
                                currency: 'USD'
                            });
                        }
                    }
                }).catch(function (err) {
                    $log.error('setPendingPurchase promise failed', err);
                    pendingPurchaseDefer.reject(err);
                });
            };

            self.removePendingPurchase = function () {
                if (pendingPurchaseDefer) {
                    pendingPurchaseDefer.resolve();
                }
                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    var pendingPurchasesPath = 'pendingPurchases/' + StudentStorageSrv.variables.uid;
                    return StudentStorageSrv.set(pendingPurchasesPath, null);
                });
            };
            //
            //self.listenToPurchaseStatus = function () {
            //    var authData = AuthService.getAuth();
            //    if (authData) {
            //        var currentUID = authData.uid;
            //        var purchaseFullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + StudentStorageSrv.variables.appUserSpacePath + '/' + 'purchase';
            //        purchaseFullPath = purchaseFullPath.replace('$$uid', '' + currentUID);
            //        var ref = new Firebase(purchaseFullPath);
            //        ref.on('value', function (dataSnapshot) {
            //            var dataSnapshotVal = dataSnapshot.val();
            //
            //            //if (angular.isDefined(dataSnapshotVal)) {
            //            //    if ($state.current.name && $state.current.name !== '') {
            //            //        $state.reload();
            //            //    }
            //            //}
            //
            //            purchaseData = dataSnapshotVal;
            //
            //            StudentStorageSrv.cleanPathCache(PURCHASE_PATH);
            //            if (purchaseData) {
            //                self.removePendingPurchase();
            //            }
            //        });
            //    }
            //};

            self.showPurchaseDialog = function () {
                //a.eventTrack({
                //    eventName: 'purchaseModalOpened'
                //});
                return $mdDialog.show({
                    controller: 'PurchaseDialogController',
                    templateUrl: 'components/purchase/templates/purchasePopup.template.html',
                    disableParentScroll: false,
                    clickOutsideToClose: true,
                    fullscreen: false,
                    controllerAs: 'vm'
                });
            };

            self.hidePurchaseDialog = function () {
                return $mdDialog.hide();
            };

            self.showPurchaseError = function () {
                var popUpTitle = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_TITLE');
                var popUpContent = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_CONTENT');
                PopUpSrv.error(popUpTitle, popUpContent);
            };

            self.getPendingPurchase = function () {
                return pendingPurchaseDefer && pendingPurchaseDefer.promise;
            };

            self.setProductDataOnce = function () {
                var path = 'iap/desktop/allContent';
                var productData = {
                    alias: 'allContent',
                    id: 'com.zinkerz.act.allcontent',
                    type: 'non consumable',
                    price: '39.99',
                    previousPrice: '44.99'
                };

                $q.when(studentStorageProm).then(function (StudentStorageSrv) {
                    StudentStorageSrv.set(path, productData).then(function (resp) {
                        $log.info(resp);
                    }).catch(function (err) {
                        $log.info(err);
                    });
                });
            };

            /**
             * @param mode:
             *  1 - completed first workout
             *  2 - completed all free content
             */
            self.openPurchaseNudge = function (mode, num) {
                var toastTemplate =
                    '<md-toast class="purchase-nudge" ng-class="{first: vm.mode === 1, all: vm.mode === 2}" translate-namespace="PURCHASE_POPUP">' +
                    '<div class="md-toast-text" flex>' +
                    '<div class="close-toast cursor-pointer" ng-click="vm.closeToast()"><svg-icon name="close-popup"></svg-icon></div>' +
                    '<span translate="{{vm.nudgeMessage}}" translate-values="{num: {{vm.num}} }"></span> ' +
                    '<span class="open-dialog" ng-click="vm.showPurchaseDialog()"><span translate="{{vm.nudgeAction}}"></span></span>' +
                    '</div>' +
                    '</md-toast>';

                $mdToast.show({
                    template: toastTemplate,
                    position: 'top',
                    hideDelay: false,
                    controller: function () {
                        self.closeToast = function () {
                            $mdToast.hide();
                        };

                        self.showPurchaseDialog = function () {
                            self.showPurchaseDialog();
                        };

                        if (mode === 1) { // completed first workout
                            self.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_FIRST_WORKOUT';
                            self.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_FIRST_WORKOUT';
                        } else if (mode === 2) { // completed all free content
                            self.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_ALL_FREE_CONTENT';
                            self.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_ALL_FREE_CONTENT';
                        }
                        self.mode = mode;
                        self.num = num;
                    },
                    controllerAs: 'vm'
                });
            };
        }]
    );
})(angular);


angular.module('znk.infra-web-app.purchase').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/purchase/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/close-popup.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\"\n" +
    "    class=\"close-popup\">\n" +
    "    <style>\n" +
    "\n" +
    "        .close-popup .st0{fill:none;}\n" +
    "        .close-popup .st1{fill:none;stroke:$bgColor3;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/previous-icon.svg",
    "<svg class=\"previous-icon\" x=\"0px\" y=\"0px\" viewBox=\"-406.9 425.5 190.9 175.7\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <circle cx=\"-402.8\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"513\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"479.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"479.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"462.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"463.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"446.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"479.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"547\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"446.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"429.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"463.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"496.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"479.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"530.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"563.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"546.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"597.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"529.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"512.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"513.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-1-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 117.5 141\"\n" +
    "    class=\"purchase-popup-bullet-1-icon\">\n" +
    "    <style>\n" +
    "        .purchase-popup-bullet-1-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<path class=\"st0\" d=\"M107.2,139h-97c-4.5,0-8.3-3.7-8.3-8.3V10.3C2,5.7,5.7,2,10.3,2h97c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "	C115.5,135.3,111.8,139,107.2,139z\"/>\n" +
    "<line class=\"st0\" x1=\"19\" y1=\"26.5\" x2=\"96\" y2=\"26.5\"/>\n" +
    "<line class=\"st0\" x1=\"19\" y1=\"44.7\" x2=\"70.5\" y2=\"44.7\"/>\n" +
    "<line class=\"st0\" x1=\"48.5\" y1=\"62.9\" x2=\"96\" y2=\"62.9\"/>\n" +
    "<line class=\"st0\" x1=\"22.5\" y1=\"81.1\" x2=\"96\" y2=\"81.1\"/>\n" +
    "<line class=\"st0\" x1=\"22.5\" y1=\"99.3\" x2=\"59.2\" y2=\"99.3\"/>\n" +
    "<line class=\"st0\" x1=\"72.2\" y1=\"99.3\" x2=\"94.2\" y2=\"99.3\"/>\n" +
    "<line class=\"st0\" x1=\"22\" y1=\"117.5\" x2=\"95.5\" y2=\"117.5\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-2-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 124 141\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"purchase-popup-bullet-2-icon\">\n" +
    "    <style>\n" +
    "        .purchase-popup-bullet-2-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-2-icon .st1{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-2-icon .st2{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M77.7,139H16.8c-4.5,0-8.3-3.7-8.3-8.3V10.3c0-4.5,3.7-8.3,8.3-8.3h60.9c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "		C85.9,135.3,82.2,139,77.7,139z\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"21.2\" x2=\"17\" y2=\"21.2\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"40.9\" x2=\"17\" y2=\"40.9\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"60.6\" x2=\"17\" y2=\"60.6\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"80.4\" x2=\"17\" y2=\"80.4\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"100.1\" x2=\"17\" y2=\"100.1\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"119.8\" x2=\"17\" y2=\"119.8\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st2\" d=\"M122,2v116l-7.3,21l-8.7-20.1V24.5V7.2c0,0,1-5.2,6.6-5.2S122,2,122,2z\"/>\n" +
    "		<line class=\"st2\" x1=\"106\" y1=\"21.7\" x2=\"122\" y2=\"21.7\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-3-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 117.5 141\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"purchase-popup-bullet-3-icon\">\n" +
    "    <style>\n" +
    "\n" +
    "        .purchase-popup-bullet-3-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-3-icon .st1{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-3-icon .st2{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M107.2,139h-97c-4.5,0-8.3-3.7-8.3-8.3V10.3C2,5.7,5.7,2,10.3,2h97c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "		C115.5,135.3,111.8,139,107.2,139z\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st1\" d=\"M39.6,54.6c4.4-5.7,11.7-9.2,19.7-8.2c9.7,1.2,17.4,9.1,18.4,18.7c1.2,11-5.9,20.6-15.9,23.1\n" +
    "			c-3.1,0.8-5.3,3.7-5.3,6.9v8.6\"/>\n" +
    "		<circle cx=\"56.5\" cy=\"116.7\" r=\"2.8\"/>\n" +
    "	</g>\n" +
    "	<line class=\"st2\" x1=\"32.7\" y1=\"34.2\" x2=\"25.7\" y2=\"21.6\"/>\n" +
    "	<line class=\"st2\" x1=\"84.8\" y1=\"34.2\" x2=\"91.8\" y2=\"21.6\"/>\n" +
    "	<line class=\"st2\" x1=\"59.3\" y1=\"29.5\" x2=\"59.3\" y2=\"18.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-4-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 208.1 203\" class=\"purchase-popup-bullet-4-icon\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .purchase-popup-bullet-4-icon .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .purchase-popup-bullet-4-icon .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .purchase-popup-bullet-4-icon .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M104.2,3h74c0,0-8.8,65.7-14.7,82.9c-5.3,15.6-13,32.6-36.7,43.2c-12.3,5.5-10.3,21.7-10.3,31.5\n" +
    "		c0,11.2,5.4,16.7,13.3,20.4c3.7,1.7,8.3,3.2,14.3,4v15h-40\"/>\n" +
    "        <path class=\"st0\" d=\"M104.2,3h-74c0,0,8.8,65.7,14.7,82.9c5.3,15.6,13,32.6,36.7,43.2c12.3,5.5,10.3,21.7,10.3,31.5\n" +
    "		c0,11.2-5.4,16.7-13.3,20.4c-3.7,1.7-8.3,3.2-14.3,4v15h40\"/>\n" +
    "    </g>\n" +
    "    <path class=\"st1\" d=\"M176.8,20.4c0,0,71.3-1.5-12.2,67.5\"/>\n" +
    "    <path class=\"st1\" d=\"M31.3,20.4c0,0-71.3-1.5,12.2,67.5\"/>\n" +
    "    <polygon class=\"st1\" points=\"102.6,22 113.1,43.4 136.6,46.8 119.6,63.4 123.6,86.9 102.6,75.8 81.5,86.9 85.5,63.4 68.5,46.8\n" +
    "	92,43.4 \"/>\n" +
    "    <line class=\"st2\" x1=\"66.6\" y1=\"193.9\" x2=\"143.6\" y2=\"193.9\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-5-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 148.7 174.7\"\n" +
    "    style=\"enable-background:new 0 0 148.7 174.7;\"\n" +
    "    class=\"purchase-popup-bullet-5-icon\">\n" +
    "    <style>\n" +
    "\n" +
    "        .purchase-popup-bullet-5-icon .st0{fill:none;stroke:#231F20;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-5-icon .st1{fill:none;stroke:#231F20;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M93.4,171.7H12.6c-5.3,0-9.6-4.3-9.6-9.6V81.3c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,167.4,98.7,171.7,93.4,171.7z\"/>\n" +
    "	<path class=\"st0\" d=\"M78.7,71.7V39.9C78.7,19.6,93.8,3,112.2,3h0c18.4,0,33.5,16.6,33.5,36.9v31.9\"/>\n" +
    "	<path class=\"st1\" d=\"M53.2,101c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,106.1,47.1,101,53.2,101\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/raccoon-logo.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 237 158\"\n" +
    "    class=\"raccoon-logo-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .raccoon-logo-svg .circle{fill:#000001;}\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"circle\" cx=\"175\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M118.5,155.9c10.2,0,18.5-8.3,18.5-18.5c0-10.2-8.3-18.5-18.5-18.5c-10.2,0-18.5,8.3-18.5,18.5\n" +
    "		C100,147.6,108.3,155.9,118.5,155.9z\"/>\n" +
    "        <path class=\"circle\" d=\"M172.4,67.5c-15.8-9.7-34.3-15.3-53.9-15.3c-19.6,0-38.2,5.5-53.9,15.3\n" +
    "		c13,1.3,23.1,12.3,23.1,25.6c0,1.8-0.2,3.5-0.5,5.1c9.3-5.2,20-8.1,31.3-8.1c11.3,0,22,2.9,31.4,8.1c-0.3-1.7-0.5-3.4-0.5-5.1\n" +
    "		C149.3,79.8,159.5,68.8,172.4,67.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M36.3,93.5c-8,10.8-14,23.4-17.4,37.2c-1.2,4.9-0.4,10,2.3,14.3c2.6,4.3,6.8,7.3,11.7,8.5\n" +
    "		c1.5,0.4,3,0.5,4.5,0.5c8.8,0,16.3-6,18.4-14.5c1.8-7.7,5-14.7,9.2-20.9c-1,0.1-2,0.2-3,0.2C47.9,118.8,36.5,107.5,36.3,93.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M232.2,92.5c0.6-6.7,6.5-78-4.5-88.4c-9.5-9.1-60.3,16-77.5,24.9\n" +
    "		C185.3,37.8,215,60.9,232.2,92.5z\"/>\n" +
    "        <circle class=\"circle\" cx=\"62\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M204.1,153.6c10.2-2.4,16.4-12.7,14-22.8c-3.3-13.8-9.3-26.4-17.4-37.2\n" +
    "		c-0.2,14-11.6,25.3-25.7,25.3c-1,0-2-0.1-3-0.2c4.2,6.2,7.4,13.3,9.2,21c2,8.6,9.6,14.5,18.4,14.5\n" +
    "		C201.1,154.1,202.6,153.9,204.1,153.6\"/>\n" +
    "        <path class=\"circle\" d=\"M86.7,29C69.5,20.1,18.8-5,9.2,4.1c-11,10.4-5.1,81.5-4.5,88.4C22,60.8,51.7,37.8,86.7,29z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/templates/purchaseBtn.template.html",
    "<ng-switch on=\"purchaseState\" translate-namespace=\"PURCHASE_POPUP\">\n" +
    "\n" +
    "    <div ng-switch-when=\"pending\">\n" +
    "\n" +
    "        <div class=\"upgraded flex-container\" >\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"pending\">\n" +
    "                    <md-progress-circular md-mode=\"indeterminate\" md-diameter=\"45\"></md-progress-circular>\n" +
    "                    <span class=\"text\" translate=\".UPGRADE_PENDING\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"pro\">\n" +
    "\n" +
    "        <div class=\"upgraded flex-container\">\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"icon-wrapper completed\">\n" +
    "                    <svg-icon name=\"purchase-check-mark\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span class=\"text\" translate=\".UPGRADED_ON\" translate-values=\"{upgradeDate: vm.upgradeDate}\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div ng-switch-when=\"none\">\n" +
    "\n" +
    "        <ng-switch on=\"vm.showForm\">\n" +
    "            <div ng-switch-when=\"true\">\n" +
    "                <form\n" +
    "                    action=\"{{::vm.formAction}}\"\n" +
    "                    method=\"post\"\n" +
    "                    target=\"_top\">\n" +
    "                    <input type=\"hidden\" name=\"cmd\" value=\"_s-xclick\">\n" +
    "                    <input type=\"hidden\" name=\"hosted_button_id\" ng-value=\"::vm.hostedButtonId\">\n" +
    "                    <input type=\"hidden\" name=\"custom\" ng-value=\"::vm.custom\">\n" +
    "                    <input type=\"hidden\" name=\"return\" ng-value=\"::vm.returnUrlSuccess\">\n" +
    "                    <input type=\"hidden\" name=\"cancel_return\" ng-value=\"::vm.returnUrlFailed\">\n" +
    "                    <input type=\"hidden\" name=\"landing_page\" value=\"billing\">\n" +
    "                    <input type=\"hidden\" name=\"email\" ng-value=\"::vm.userEmail\">\n" +
    "                    <div class=\"upgrade-btn-wrapper\">\n" +
    "                        <button class=\"md-button success drop-shadow inline-block\"\n" +
    "                                ng-click=\"vm.saveAnalytics()\"\n" +
    "                                translate=\".UPGRADE_NOW\"\n" +
    "                                name=\"submit\">\n" +
    "                        </button>\n" +
    "                    </div>\n" +
    "                    <input type=\"image\" src=\"{{vm.btnImgSrc}}\" border=\"0\" name=\"submit\" alt=\"PayPal - The safer, easier way to pay online!\">\n" +
    "                    <img border=\"0\" ng-src=\"{{::vm.pixelGifSrc}}\" width=\"1\" height=\"1\" alt=\"{{vm.translate('PURCHASE_POPUP.PAYPAL_IMG_ALT')}}\" >\n" +
    "                </form>\n" +
    "            </div>\n" +
    "            <div ng-switch-default>\n" +
    "                <button ng-click=\"vm.showPurchaseError()\"\n" +
    "                        class=\"md-button success drop-shadow\"\n" +
    "                        translate=\".UPGRADE_NOW\"\n" +
    "                        name=\"submit\">\n" +
    "                </button>\n" +
    "            </div>\n" +
    "\n" +
    "        </ng-switch>\n" +
    "\n" +
    "    </div>\n" +
    "</ng-switch>\n" +
    "");
  $templateCache.put("components/purchase/templates/purchasePopup.template.html",
    "<md-dialog class=\"purchase-popup base-border-radius\" aria-label=\"Get Zinkerz\" translate-namespace=\"PURCHASE_POPUP\">\n" +
    "    <div class=\"purchase-popup-container\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <div class=\"raccoon\">\n" +
    "                <svg-icon name=\"purchase-raccoon-logo-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <div class=\"close-popup-wrap\">\n" +
    "                <svg-icon name=\"purchase-close-popup\" ng-click=\"vm.close()\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <h2>\n" +
    "                    <span translate=\".GET_ZINKERZ\"></span>\n" +
    "                    <span class=\"pill pro\" translate=\".PRO\"></span>\n" +
    "                </h2>\n" +
    "                <p translate=\".DESCRIPTION\"></p>\n" +
    "                <div class=\"features-box base-border-radius\">\n" +
    "                    <ul>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-1-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET1\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-2-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET2\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-3-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET3\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-4-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET4\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-5-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET5\"></span>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "                <div class=\"price ng-hide\" ng-show=\"vm.purchaseState === vm.purchaseStateEnum.NONE.enum\">\n" +
    "                    <del>{{'$' + vm.productPreviousPrice}}</del>\n" +
    "                    <b>{{'$' + vm.productPrice}}</b>\n" +
    "                    <span translate=\".SAVE\" translate-values='{ percent: vm.productDiscountPercentage}'></span>\n" +
    "                </div>\n" +
    "                <div class=\"action\">\n" +
    "                    <purchase-btn purchase-state=\"vm.purchaseState\"></purchase-btn>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.socialSharing', [
        'znk.infra.config' 
    ]);
})(angular);

(function (angular) {
    'use strict';
    
    angular.module('znk.infra-web-app.socialSharing')
        .service('SocialSharingSrv',
            ["StorageSrv", "InfraConfigSrv", "$q", function (StorageSrv, InfraConfigSrv, $q) {
                'ngInject';

                var SOCIAL_SHARING_PATH = StorageSrv.variables.appUserSpacePath + '/socialSharing';

                function _getSocialSharing() {
                    return InfraConfigSrv.getStudentStorage().then(function(StudentStorageSrv){
                        return StudentStorageSrv.get(SOCIAL_SHARING_PATH);
                    });
                }

                this.getSocialSharingData = _getSocialSharing;

                this.setSocialSharingNetwork = function (key, value) {
                    return $q.all([
                        _getSocialSharing(),
                        InfraConfigSrv.getStudentStorage()
                    ]).then(function (res) {
                        var socialSharing = res[0];
                        var studentStorage= res[1];

                        socialSharing[key] = value;
                        return studentStorage.set(SOCIAL_SHARING_PATH, socialSharing);
                    });
                };
            }]
        );
})(angular);

angular.module('znk.infra-web-app.socialSharing').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.uiTheme', [
        'ngMaterial'
    ]);
})(angular);

angular.module('znk.infra-web-app.uiTheme').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoals', [
        'znk.infra.scoring',
        'znk.infra.utility'
    ]);
})(angular);


'use strict';

angular.module('znk.infra-web-app.userGoals').provider('UserGoalsService', [function() {

        var _calcScoreFn;

        this.setCalcScoreFn = function(calcScoreFn) {
            _calcScoreFn = calcScoreFn;
        };

        this.$get = ['InfraConfigSrv', 'StorageSrv', '$q', 'ScoringService', '$injector', function (InfraConfigSrv, StorageSrv, $q, ScoringService, $injector) {
            var self = this;
            var goalsPath = StorageSrv.variables.appUserSpacePath + '/goals';
            var scoringLimits = ScoringService.getScoringLimits();
            var defaultSubjectScore = self.settings.defaultSubjectScore;
            var subjects = self.settings.subjects;

            var userGoalsServiceObj = {};

            userGoalsServiceObj.getGoals = function () {
                return InfraConfigSrv.getGlobalStorage().then(function(globalStorage) {
                    return globalStorage.get(goalsPath).then(function (userGoals) {
                        if (angular.equals(userGoals, {})) {
                            userGoals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.setGoals = function (newGoals) {
                return InfraConfigSrv.getGlobalStorage().then(function(globalStorage) {
                    if (arguments.length && angular.isDefined(newGoals)) {
                        return globalStorage.set(goalsPath, newGoals);
                    }
                    return globalStorage.get(goalsPath).then(function (userGoals) {
                        if (!userGoals.goals) {
                            userGoals.goals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.getCalcScoreFn = function() {
                return $q.when($injector.invoke(_calcScoreFn, self));
            };

            userGoalsServiceObj.getGoalsSettings = function() {
                 return self.settings;
            };

            function _defaultUserGoals() {
                var defaultUserGoals = {
                    isCompleted: false,
                    totalScore: scoringLimits.exam.max
                };
                angular.forEach(subjects, function(subject) {
                    defaultUserGoals[subject.name] = defaultSubjectScore;
                });
                return defaultUserGoals;
            }

            function averageSubjectsGoal(goalsObj) {
                var goalsSum = 0;
                var goalsLength = 0;
                angular.forEach(goalsObj, function(goal) {
                    if (angular.isNumber(goal)) {
                        goalsSum += goal;
                        goalsLength += 1;
                    }
                });
                return Math.round(goalsSum / goalsLength);
            }

            userGoalsServiceObj.averageSubjectsGoal = averageSubjectsGoal;

            return userGoalsServiceObj;
        }];
}]);

angular.module('znk.infra-web-app.userGoals').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoalsSelection', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'znk.infra.general',
        'ngMaterial',
        'ngTagsInput',
        'znk.infra-web-app.userGoals'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'user-goals-plus-icon': 'components/userGoalsSelection/svg/plus-icon.svg',
                'user-goals-dropdown-arrow-icon': 'components/userGoalsSelection/svg/dropdown-arrow.svg',
                'user-goals-arrow-icon': 'components/userGoalsSelection/svg/arrow-icon.svg',
                'user-goals-info-icon': 'components/userGoalsSelection/svg/info-icon.svg',
                'user-goals-v-icon': 'components/userGoalsSelection/svg/v-icon.svg',
                'user-goals-search-icon': 'components/userGoalsSelection/svg/search-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoalsSelection').controller('EditGoalsController',
        ["$scope", "$filter", "$mdDialog", function ($scope, $filter, $mdDialog) {
            'ngInject';
            var translateFilter = $filter('translate');
            $scope.userGoalsSetting = {
                recommendedGoalsTitle: false,
                saveBtn: {
                    title: translateFilter('USER_GOALS.SAVE'),
                    afterSaveTitle: translateFilter('USER_GOALS.SAVED'),
                    wrapperClassName: 'btn-sm'
                }
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('goalSelect', function GoalSelectDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/userGoalsSelection/templates/goalSelect.template.html',
            require: 'ngModel',
            scope: {
                minScore: '=',
                maxScore: '=',
                updateGoalNum: '='
            },
            link: function link(scope, element, attrs, ngModelCtrl) {
                scope.updateGoal = function (isPlus) {
                    scope.target += (isPlus) ? scope.updateGoalNum : -Math.abs(scope.updateGoalNum);
                    if (scope.target < scope.minScore) {
                        scope.target = scope.minScore;
                    } else if (scope.target > scope.maxScore) {
                        scope.target = scope.maxScore;
                    }

                    if (angular.isFunction(scope.onChange)) {
                        scope.onChange();
                    }
                    ngModelCtrl.$setViewValue(scope.target);
                };

                ngModelCtrl.$render = function () {
                    scope.target = ngModelCtrl.$viewValue;
                };
            }
        };

        return directive;
    });

})(angular);

/**
 *  attrs:
 *      events:
 *          onSave
 * */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('schoolSelect',
        ["userGoalsSelectionService", "$translate", "UtilitySrv", "$timeout", "$q", "$translatePartialLoader", function SchoolSelectDirective(userGoalsSelectionService, $translate, UtilitySrv, $timeout, $q, $translatePartialLoader) {
            'ngInject';

            var schoolList = [];

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoalsSelection/templates/schoolSelect.template.html',
                scope: {
                    events: '=?',
                    getSelectedSchools: '&?'
                },
                link: function link(scope, element, attrs) {
                    $translatePartialLoader.addPart('userGoalsSelection');

                    var MIN_LENGTH_AUTO_COMPLETE = 3;
                    var MAX_SCHOOLS_SELECT = 3;
                    var userSchools;

                    function disableSearchOption() {
                        if (scope.d.userSchools.length >= MAX_SCHOOLS_SELECT) {
                            element.find('input').attr('disabled', true);
                        } else {
                            element.find('input').removeAttr('disabled');
                        }
                    }

                    function _getTagsInputModelCtrl() {
                        var tagsInputElement = element.find('tags-input');
                        if (tagsInputElement) {
                            var tagsInputElementData = tagsInputElement.data();
                            if (tagsInputElementData.$ngModelController) {
                                scope.d.tagsInputNgModelCtrl = tagsInputElementData.$ngModelController;
                            }
                        }
                    }

                    scope.d = {
                        minLengthAutoComplete: MIN_LENGTH_AUTO_COMPLETE,
                        loadOnEmpty: false,
                        actions: {}
                    };

                    if (!scope.events) {
                        scope.events = {};
                    }
                    var eventsDefault = {
                        onSave: angular.noop
                    };
                    UtilitySrv.object.extendWithoutOverride(scope.events, eventsDefault);

                    //  added in order to provide custom selected schools
                    var getSelectedSchoolsProm;
                    if (attrs.getSelectedSchools) {
                        getSelectedSchoolsProm = $q.when(scope.getSelectedSchools());
                    } else {
                        getSelectedSchoolsProm = userGoalsSelectionService.getDreamSchools();
                    }
                    getSelectedSchoolsProm.then(function (_userSchools) {
                        userSchools = _userSchools;
                        scope.d.userSchools = angular.copy(userSchools);
                        $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                            scope.d.placeholder = scope.d.userSchools.length ? ' ' : val;
                        });
                        disableSearchOption();
                    });

                    userGoalsSelectionService.getAppSchoolsList().then(function (schools) {
                        schoolList = schools.data;
                    });

                    scope.d.onTagAdding = function ($tag) {
                        if (!$tag.id) {
                            return false;
                        }
                        $tag.text = $tag.text.replace(/([-])/g, ' ');
                        scope.d.placeholder = ' ';
                        return scope.d.userSchools.length < MAX_SCHOOLS_SELECT;
                    };

                    scope.d.onTagAdded = function () {
                        disableSearchOption();
                        return true;
                    };

                    scope.d.onTagRemoved = function () {
                        if (!scope.d.userSchools.length) {
                            $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                                scope.d.placeholder =  val;
                            });
                        }
                        disableSearchOption();
                        return true;
                    };

                    scope.d.querySchools = function ($query) {
                        if ($query.length < 3) {
                            return $q.when([]);
                        }
                        var resultsArr = schoolList.filter(function (school) {
                            return school.text.toLowerCase().indexOf($query.toLowerCase()) > -1;
                        });
                        if (!resultsArr.length) {
                            resultsArr = $translate('SCHOOL_SELECT.NO_RESULTS').then(function(val) {
                                return [{
                                    text: val
                                }];
                            });

                        }
                        return $q.when(resultsArr);
                    };

                    scope.d.save = function () {
                        if (!scope.d.tagsInputNgModelCtrl) {
                            _getTagsInputModelCtrl();
                        }
                        scope.d.tagsInputNgModelCtrl.$setPristine();

                        scope.events.onSave(scope.d.userSchools);
                    };

                    $timeout(function () {
                        _getTagsInputModelCtrl();
                    });
                }
            };

            return directive;
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('userGoals',['UserGoalsService', '$timeout', 'userGoalsSelectionService', '$q', '$translatePartialLoader', 'ScoringService',
        function UserGoalsDirective(UserGoalsService, $timeout, userGoalsSelectionService, $q, $translatePartialLoader, ScoringService) {
            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoalsSelection/templates/userGoals.template.html',
                scope: {
                    onSave: '&?',
                    setting: '='
                },
                link: function link(scope) {
                    $translatePartialLoader.addPart('userGoalsSelection');
                    var userGoalRef;
                    scope.scoringLimits = ScoringService.getScoringLimits();
                    scope.goalsSettings = UserGoalsService.getGoalsSettings();

                    var defaultTitle = scope.saveTitle = scope.setting.saveBtn.title || '.SAVE';

                    var initTotalScore = 0;
                    angular.forEach(scope.goalsSettings.subjects, function() {
                        initTotalScore += scope.goalsSettings.defaultSubjectScore;
                    });
                    scope.totalScore = initTotalScore;

                    UserGoalsService.getGoals().then(function (userGoals) {
                        userGoalRef = userGoals;
                        scope.userGoals = angular.copy(userGoals);
                    });

                    var getDreamSchoolsProm = userGoalsSelectionService.getDreamSchools().then(function (userSchools) {
                        scope.userSchools = angular.copy(userSchools);
                    });
                    scope.getSelectedSchools = function () {
                        return getDreamSchoolsProm.then(function () {
                            return scope.userSchools;
                        });
                    };

                    scope.showSchools = function () {
                        scope.showSchoolEdit = !scope.showSchoolEdit;
                    };

                    scope.calcTotal = function () {
                        var goals = scope.userGoals;
                        var newTotalScore = 0;
                        angular.forEach(goals, function(goal, key) {
                            if (angular.isNumber(goal) && key !== 'totalScore') {
                                newTotalScore += goal;
                            }
                        });
                        goals.totalScore = scope.totalScore = newTotalScore;
                        return goals.totalScore;
                    };

                    scope.saveChanges = function () {
                        var saveUserSchoolsProm = userGoalsSelectionService.setDreamSchools(scope.userSchools);

                        angular.extend(userGoalRef, scope.userGoals);
                        var saveUserGoalsProm = UserGoalsService.setGoals(userGoalRef);

                        $q.all([
                            saveUserSchoolsProm,
                            saveUserGoalsProm
                        ]).then(function () {
                            if (angular.isFunction(scope.onSave)) {
                                scope.onSave();
                            }

                            if (scope.setting.saveBtn.afterSaveTitle) {
                                scope.saveTitle = scope.setting.saveBtn.afterSaveTitle;
                                scope.showVIcon = true;
                                $timeout(function () {
                                    scope.saveTitle = defaultTitle;
                                    scope.showVIcon = false;
                                }, 3000);
                            }
                        });
                    };

                    scope.schoolSelectEvents = {
                        onSave: function (newUserDreamSchools) {
                            scope.showSchoolEdit = false;
                            scope.userSchools = newUserDreamSchools;

                            var calcScoreFn = UserGoalsService.getCalcScoreFn();
                            calcScoreFn(newUserDreamSchools).then(function(newUserGoals) {
                                scope.userGoals = newUserGoals;
                            });
                        }
                    };
                }
            };

            return directive;
        }]);
})(angular);

'use strict';

angular.module('znk.infra-web-app.userGoalsSelection').service('userGoalsSelectionService', ['InfraConfigSrv', 'StorageSrv', 'ENV', '$http', 'UserGoalsService', '$q', '$mdDialog',
    function(InfraConfigSrv, StorageSrv, ENV, $http, UserGoalsService, $q, $mdDialog) {
        var schoolsPath = StorageSrv.variables.appUserSpacePath + '/dreamSchools';

        this.getAppSchoolsList = function () {
            return $http.get(ENV.dreamSchoolJsonUrl, {
                timeout: ENV.promiseTimeOut,
                cache: true
            });
        };

        function _getUserSchoolsData() {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                var defaultValues = {
                    selectedSchools: []
                };
                return studentStorage.get(schoolsPath, defaultValues);
            });
        }

        function _setUserSchoolsData(userSchools) {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                 return studentStorage.set(schoolsPath, userSchools);
            });
        }

        this.getDreamSchools = function () {
            return _getUserSchoolsData().then(function (userSchools) {
                return userSchools.selectedSchools;
            });
        };

        this.openEditGoalsDialog = function (options) {
            options = angular.extend({}, {
                clickOutsideToCloseFlag: false
            }, options);
            $mdDialog.show({
                controller: 'EditGoalsController',
                controllerAs: 'vm',
                templateUrl: 'components/userGoalsSelection/templates/editGoals.template.html',
                clickOutsideToClose: options.clickOutsideToCloseFlag
            });
        };

        this.setDreamSchools = function (newSchools, updateUserGoals) {
            return _getUserSchoolsData().then(function (userSchools) {
                if (!angular.isArray(newSchools) || !newSchools.length) {
                    newSchools = [];
                }

                if (userSchools.selectedSchools !== newSchools) {
                    userSchools.selectedSchools.splice(0);
                    angular.extend(userSchools.selectedSchools, newSchools);
                }

                var saveUserGoalProm = $q.when();
                if (updateUserGoals) {
                    saveUserGoalProm = UserGoalsService.getCalcScoreFn();
                }

                return $q.all([
                    _setUserSchoolsData(userSchools),
                    saveUserGoalProm
                ]).then(function (res) {
                    var saveUserGoalFn = res[1];
                    if (angular.isFunction(saveUserGoalFn)) {
                        saveUserGoalFn(newSchools, true);
                    }
                    return res[0];
                });
            });
        };
}]);


angular.module('znk.infra-web-app.userGoalsSelection').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/userGoalsSelection/svg/arrow-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-468.2 482.4 96 89.8\" class=\"arrow-icon-wrapper\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .arrow-icon-wrapper .st0{fill:#109BAC;}\n" +
    "        .arrow-icon-wrapper .st1{fill:none;stroke:#fff;stroke-width:5.1237;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "    <path class=\"st0\" d=\"M-417.2,572.2h-6.2c-24.7,0-44.9-20.2-44.9-44.9v0c0-24.7,20.2-44.9,44.9-44.9h6.2c24.7,0,44.9,20.2,44.9,44.9\n" +
    "    v0C-372.2,552-392.5,572.2-417.2,572.2z\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-442.8\" y1=\"527.3\" x2=\"-401.4\" y2=\"527.3\"/>\n" +
    "        <line class=\"st1\" x1=\"-401.4\" y1=\"527.3\" x2=\"-414.3\" y2=\"514.4\"/>\n" +
    "        <line class=\"st1\" x1=\"-401.4\" y1=\"527.3\" x2=\"-414.3\" y2=\"540.2\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10; width:25px;}\n" +
    "    </style>\n" +
    "    <polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/info-icon.svg",
    "<svg\n" +
    "    version=\"1.1\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-497 499 28 28\"\n" +
    "    class=\"info-icon\">\n" +
    "<style type=\"text/css\">\n" +
    "	.info-icon .st0{fill:none;stroke:#0A9BAD; stroke-width:2;}\n" +
    "	.info-icon .st2{fill:#0A9BAD;}\n" +
    "</style>\n" +
    "<g>\n" +
    "	<circle class=\"st0\" cx=\"-483\" cy=\"513\" r=\"13.5\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st2\" d=\"M-485.9,509.2h3.9v8.1h3v1.2h-7.6v-1.2h3v-6.9h-2.4V509.2z M-483.5,505.6h1.5v1.9h-1.5V505.6z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/plus-icon.svg",
    "<svg class=\"plus-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 16 16\"\n" +
    "    style=\"enable-background:new 0 0 16 16;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.plus-svg .st0, .plus-svg .st1 {\n" +
    "        fill: none;\n" +
    "        stroke: #0a9bad;\n" +
    "        stroke-width: 2;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<line class=\"st0\" x1=\"8\" y1=\"1\" x2=\"8\" y2=\"15\"/>\n" +
    "<line class=\"st1\" x1=\"1\" y1=\"8\" x2=\"15\" y2=\"8\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/search-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-314.8 416.5 97.5 99.1\" class=\"search-icon-wrapper\">\n" +
    "<style type=\"text/css\">\n" +
    "	.search-icon-wrapper .st0{fill:none;stroke:#231F20;stroke-width:5;stroke-miterlimit:10;}\n" +
    "	.search-icon-wrapper .st1{fill:none;stroke:#231F20;stroke-width:5;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<circle class=\"st0\" cx=\"-279.1\" cy=\"452.3\" r=\"33.2\"/>\n" +
    "<line class=\"st1\" x1=\"-255.3\" y1=\"477.6\" x2=\"-219.8\" y2=\"513.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/v-icon.svg",
    "<svg class=\"v-icon-wrapper\" x=\"0px\" y=\"0px\" viewBox=\"0 0 334.5 228.7\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .v-icon-wrapper .st0{\n" +
    "            fill:#ffffff;\n" +
    "            stroke:#ffffff;\n" +
    "            stroke-width:26;\n" +
    "            stroke-linecap:round;\n" +
    "            stroke-linejoin:round;\n" +
    "            stroke-miterlimit:10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"13\" y1=\"109.9\" x2=\"118.8\" y2=\"215.7\"/>\n" +
    "	<line class=\"st0\" x1=\"118.8\" y1=\"215.7\" x2=\"321.5\" y2=\"13\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/templates/editGoals.template.html",
    "<md-dialog class=\"setting-edit-goals base-border-radius\" translate-namespace=\"SETTING.EDIT_GOALS\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"cancel()\">\n" +
    "            <svg-icon name=\"estimated-score-widget-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content>\n" +
    "        <div class=\"main-title md-subheader\" translate=\".MY_GOALS\"></div>\n" +
    "        <user-goals setting=\"userGoalsSetting\"></user-goals>\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"estimated-score-widget-goals\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/templates/goalSelect.template.html",
    "<div class=\"action-btn minus\" ng-click=\"updateGoal(false)\" ng-show=\"target > minScore\">\n" +
    "    <svg-icon name=\"user-goals-plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "<div class=\"goal\">{{target}}</div>\n" +
    "<div class=\"action-btn plus\" ng-click=\"updateGoal(true)\" ng-show=\"target < maxScore\">\n" +
    "    <svg-icon name=\"user-goals-plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/templates/schoolSelect.template.html",
    "<div class=\"school-selector\" translate-namespace=\"SCHOOL_SELECT\">\n" +
    "    <div class=\"selector\">\n" +
    "        <div class=\"tag-input-wrap\">\n" +
    "            <div class=\"search-icon-container\">\n" +
    "                <svg-icon name=\"user-goals-search-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <tags-input ng-model=\"d.userSchools\"\n" +
    "                        text=\"d.text\"\n" +
    "                        key-property=\"id\"\n" +
    "                        placeholder=\"{{d.placeholder}}\"\n" +
    "                        allow-leftover-text=\"true\"\n" +
    "                        add-from-autocomplete-only=\"true\"\n" +
    "                        on-tag-adding=\"d.onTagAdding($tag)\"\n" +
    "                        on-tag-added=\"d.onTagAdded()\"\n" +
    "                        on-tag-removed=\"d.onTagRemoved()\"\n" +
    "                        max-tags=\"3\"\n" +
    "                        template=\"tag-input-template\">\n" +
    "                <auto-complete source=\"d.querySchools($query)\"\n" +
    "                               debounce-delay=\"100\"\n" +
    "                               display-property=\"text\"\n" +
    "                               max-results-to-show=\"9999\"\n" +
    "                               highlight-matched-text=\"true\"\n" +
    "                               min-length=\"{{d.minLengthAutoComplete}}\"\n" +
    "                               load-on-focus=\"true\"\n" +
    "                               template=\"auto-complete-template\">\n" +
    "                </auto-complete>\n" +
    "            </tags-input>\n" +
    "            <button class=\"select-btn go-btn\"\n" +
    "                    ng-click=\"d.save()\"\n" +
    "                    title=\"{{::'SCHOOL_SELECT.SELECT_TO_CONTINUE' | translate}}\"\n" +
    "                    ng-disabled=\"d.tagsInputNgModelCtrl.$pristine\">\n" +
    "                <svg-icon name=\"user-goals-arrow-icon\"\n" +
    "                          class=\"arrow-icon\">\n" +
    "                </svg-icon>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<script type=\"text/ng-template\" id=\"auto-complete-template\">\n" +
    "    <div ng-show=\"$index==0\" class=\"list-title\">\n" +
    "        <div class=\"list-left-panel\" translate=\".SCHOOLS\"></div>\n" +
    "        <div class=\"list-right-panel\" translate=\".REQUIRED_SCORE\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"left-panel\">\n" +
    "        {{::data.text}}\n" +
    "        <span class=\"location\">{{::data.city}}, {{::data.state}}</span>\n" +
    "    </div>\n" +
    "    <div class=\"right-panel\">\n" +
    "        {{::data.total25th}}{{data.total75th == 'N/A' ? '' : '-' + data.total75th}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "<script type=\"text/ng-template\" id=\"tag-input-template\">\n" +
    "    <div class=\"tag-wrap\">\n" +
    "        <span title=\"{{data.text}}\">{{data.text | cutString: 15}}</span>\n" +
    "        <a class=\"remove-button\" ng-click=\"$removeTag()\">&#10006;</a>\n" +
    "    </div>\n" +
    "</script>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/templates/userGoals.template.html",
    "<section translate-namespace=\"USER_GOALS\">\n" +
    "    <div class=\"goals-schools-wrapper\" ng-if=\"setting.showSchools || goalsSettings.showSchools\">\n" +
    "        <div class=\"title-wrap\">\n" +
    "            <div class=\"edit-title\" translate=\".DREAM_SCHOOLS\"></div>\n" +
    "            <div class=\"edit-link\" ng-click=\"showSchools()\" ng-class=\"{'active' : showSchoolEdit}\">\n" +
    "                <span translate=\".EDIT\" class=\"edit\"></span>\n" +
    "                <span translate=\".CANCEL\" class=\"cancel\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"selected-schools-container\" ng-switch=\"userSchools.length\">\n" +
    "            <div ng-switch-when=\"0\"\n" +
    "                 class=\"no-school-selected\"\n" +
    "                 translate=\".I_DONT_KNOW\"></div>\n" +
    "            <div ng-switch-default class=\"selected-schools\">\n" +
    "                <div ng-repeat=\"school in userSchools\" class=\"school\">{{school.text}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"subject-wrap\">\n" +
    "        <div class=\"blur-wrap\"></div>\n" +
    "        <div class=\"goals-title\" ng-show=\"setting.recommendedGoalsTitle\">\n" +
    "            <div class=\"recommended-title\" translate=\".RECOMMENDED_GOALS\"></div>\n" +
    "            <div class=\"info-wrap\">\n" +
    "                <md-tooltip md-visible=\"vm.showTooltip\" md-direction=\"top\" class=\"goals-info md-whiteframe-2dp\">\n" +
    "                    <div translate=\".GOALS_INFO\" class=\"top-text\"></div>\n" +
    "                </md-tooltip>\n" +
    "                <svg-icon class=\"info-icon\" name=\"user-goals-info-icon\" ng-mouseover=\"vm.showTooltip=true\" ng-mouseleave=\"vm.showTooltip=false\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"subject-goal-wrap\">\n" +
    "            <div class=\"subjects-goal noselect\">\n" +
    "                <div class=\"subject\" ng-repeat=\"subject in goalsSettings.subjects\">\n" +
    "                    <div class=\"icon-wrapper svg-wrapper\" ng-class=\"subject.name+'-bg'\">\n" +
    "                        <svg-icon name=\"{{subject.svgIcon}}\"></svg-icon>\n" +
    "                    </div>\n" +
    "                    <span class=\"subject-title\" translate=\".{{subject.name | uppercase}}\"></span>\n" +
    "                    <goal-select\n" +
    "                        min-score=\"scoringLimits.subjects.min || scoringLimits.subjects[subject.id].min\"\n" +
    "                        max-score=\"scoringLimits.subjects.max || scoringLimits.subjects[subject.id].max\"\n" +
    "                        update-goal-num=\"goalsSettings.updateGoalNum\"\n" +
    "                        ng-model=\"userGoals[subject.name]\"\n" +
    "                        ng-change=\"calcTotal()\">\n" +
    "                    </goal-select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"composite-wrap\">\n" +
    "            <div class=\"composite-score\">\n" +
    "                <div class=\"score-title\" translate=\".TOTAL_SCORE\"></div>\n" +
    "                <div class=\"score\">{{totalScore}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"save-btn-wrap\">\n" +
    "        <md-button autofocus tabindex=\"1\"\n" +
    "                   class=\"md-primary znk inline-block\"\n" +
    "                   ng-click=\"saveChanges()\"\n" +
    "                   ng-class=\"setting.saveBtn.wrapperClassName\">\n" +
    "            <svg-icon name=\"user-goals-v-icon\" class=\"v-icon\" ng-show=\"showVIcon\"></svg-icon>\n" +
    "            <span translate=\"{{saveTitle}}\"></span>\n" +
    "            <svg-icon name=\"user-goals-dropdown-arrow-icon\" class=\"dropdown-arrow-icon\" ng-show=\"setting.saveBtn.showSaveIcon\"></svg-icon>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "    <div class=\"school-selector-wrap animate-if\"\n" +
    "         ng-if=\"showSchoolEdit\">\n" +
    "        <school-select events=\"schoolSelectEvents\"\n" +
    "                       get-selected-schools=\"getSelectedSchools()\">\n" +
    "        </school-select>\n" +
    "    </div>\n" +
    "</section>\n" +
    "\n" +
    "\n" +
    "");
}]);

/**
 * usage instructions:
 *      1) workout progress:
 *          - define <%= subjectName %>-bg class for all subjects(background color and  for workouts-progress item) for example
 *              .reading-bg{
 *                  background: red;
 *              }
 *          - define <%= subjectName %>-bg:after style for border color for example
 *              workouts-progress .items-container .item-container .item.selected.reading-bg:after {
 *                   border-color: red;
 *              }
 *
 *      2) WorkoutsRoadmapSrv:
 *          setNewWorkoutGeneratorGetter: provide a function which return a new workout generator function. subjectsToIgnore
 *              will be passed as parameter.
 *              i.e:
 *                  function(WorkoutPersonalization){
 *                      'ngInject';
 *
 *                      return function(subjectToIgnore){
 *                          return WorkoutPersonalizationService.getExercisesByTimeForNewWorkout(subjectToIgnoreForNextDaily);
 *                      }
 *                  }
 *              the return value should be a map of exercise time to exercise meta data i.e:
 *              {
 *                 "5" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 150,
 *                   "exerciseTypeId" : 1,
 *                   "subjectId" : 0
 *                 },
 *                 "10" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 109,
 *                   "exerciseTypeId" : 3,
 *                   "subjectId" : 0
 *                 },
 *                 "15" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 221,
 *                   "exerciseTypeId" : 3,
 *                   "subjectId" : 0
 *                 }
 *               }
 *
 *
 *      3) workoutsRoadmap.diagnostic.summary
 *          this state must set i.e
 *              $stateProvider.state('app.workoutsRoadmap.diagnostic.summary', {
 *                   template: '<div>Diagnostic </div>',
 *                   controller: 'WorkoutsRoadMapBaseSummaryController',
 *                   controllerAs: 'vm'
 *               })
 *      4) workoutsRoadmap.workout.inProgress
 *          this state must set i.e
 *              $stateProvider.state('app.workoutsRoadmap.workout.inProgress', {
 *                  template: '<div>Workout in progress</div>',
 *                  controller: function(){}
 *             })
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'znk.infra.scroll',
        'znk.infra.general',
        'znk.infra.exerciseDataGetters',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra-web-app.socialSharing',
        'znk.infra.znkExercise',
        'znk.infra.estimatedScore',
        'znk.infra.scoring',
        'znk.infra-web-app.userGoals',
        'znk.infra.exerciseDataGetters',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.estimatedScoreWidget'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.workoutsRoadmap', {
                    url: '/workoutsRoadmap',
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmap.template.html',
                    resolve: {
                        data: ["ExerciseStatusEnum", "WorkoutsSrv", "DiagnosticSrv", "$q", function data(ExerciseStatusEnum, WorkoutsSrv, DiagnosticSrv, $q) {
                            'ngInject';

                            var isDiagnosticCompletedProm = DiagnosticSrv.getDiagnosticStatus();
                            var workoutsProgressProm = WorkoutsSrv.getAllWorkouts();

                            return $q.all([
                                isDiagnosticCompletedProm,
                                workoutsProgressProm
                            ]).then(function (res) {
                                var isDiagnosticCompleted = res[0] === ExerciseStatusEnum.COMPLETED.enum;
                                var workoutsProgress = res[1];

                                return {
                                    diagnostic: {
                                        status: isDiagnosticCompleted ? ExerciseStatusEnum.COMPLETED.enum : ExerciseStatusEnum.ACTIVE.enum,
                                        workoutOrder: 0
                                    },
                                    workoutsProgress: workoutsProgress
                                };
                            });
                        }]
                    },
                    controller: 'WorkoutsRoadMapController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.diagnostic', {
                    url: '/diagnostic',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.diagnostic.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticIntroController',
                    controllerAs: 'vm',
                    resolve: {
                        isDiagnosticStarted: ["DiagnosticSrv", "ExerciseStatusEnum", function (DiagnosticSrv, ExerciseStatusEnum) {
                            'ngInject';

                            return DiagnosticSrv.getDiagnosticStatus().then(function (status) {
                                return status === ExerciseStatusEnum.ACTIVE.enum;
                            });
                        }]
                    }
                })
                .state('app.workoutsRoadmap.diagnostic.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.workout', {
                    url: '/workout?workout',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapWorkoutController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.workout.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutIntro.template.html',
                    controller: 'WorkoutsRoadMapWorkoutIntroController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.workout.inProgress', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutInProgress.template.html',
                    controller: 'WorkoutsRoadMapWorkoutInProgressController',
                    controllerAs: 'vm'
                })
                .state('app.workoutsRoadmap.workout.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                });
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';
            
            var svgMap = {
                'workouts-roadmap-checkmark': 'components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg',
                'workouts-roadmap-change-subject': 'components/workoutsRoadmap/svg/change-subject-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);
})(angular);

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapController',
        ["data", "$state", "$scope", "ExerciseStatusEnum", "$location", "$translatePartialLoader", function (data, $state, $scope, ExerciseStatusEnum, $location, $translatePartialLoader) {
            'ngInject';

            $translatePartialLoader.addPart('workoutsRoadmap');

            var vm = this;

            vm.workoutsProgress = data.workoutsProgress;
            vm.diagnostic = data.diagnostic;

            var search = $location.search();
            var DIAGNOSTIC_STATE = 'app.workoutsRoadmap.diagnostic';
            var WORKOUT_STATE = 'app.workoutsRoadmap.workout';

            function getActiveWorkout() {
                var i = 0;
                for (; i < vm.workoutsProgress.length; i++) {
                    if (vm.workoutsProgress[i].status !== ExerciseStatusEnum.COMPLETED.enum) {
                        if (angular.isDefined(vm.workoutsProgress[i].subjectId)) {
                            return vm.workoutsProgress[i];
                        }
                        return data.diagnostic;
                    }
                }
                return vm.workoutsProgress[i - 1];
            }

            function _isFirstWorkoutStarted() {
                var firstWorkout = vm.workoutsProgress[0];
                return angular.isDefined(firstWorkout.subjectId);
            }

            //set selected item
            switch ($state.current.name) {
                case DIAGNOSTIC_STATE:
                    vm.selectedItem = vm.diagnostic;
                    break;
                case WORKOUT_STATE:
                    var workoutOrder = +search.workout;
                    if (isNaN(workoutOrder) || workoutOrder < 0 || workoutOrder > vm.workoutsProgress.length) {
                        vm.selectedItem = getActiveWorkout();
                    } else {
                        vm.selectedItem = vm.workoutsProgress[workoutOrder - 1];
                    }
                    break;
                default:
                    if (_isFirstWorkoutStarted()) {
                        vm.selectedItem = getActiveWorkout();
                    } else {
                        vm.selectedItem = vm.diagnostic;
                    }
            }

            data.exercise = vm.selectedItem;

            data.roadmapCtrlActions = {};
            data.roadmapCtrlActions.setCurrWorkout = function (_workoutOrder) {
                if (!_workoutOrder) {
                    vm.selectedItem = vm.diagnostic;
                } else {
                    vm.selectedItem = vm.workoutsProgress[_workoutOrder - 1];
                }
            };
            data.roadmapCtrlActions.freezeWorkoutProgressComponent = function (freeze) {
                vm.freezeWorkoutProgressComponent = freeze;
            };

            var LEFT_ANIMATION = 'left-animation';
            var RIGHT_ANIMATION = 'right-animation';
            $scope.$watch('vm.selectedItem', function (newItem, oldItem) {
                if (angular.isUndefined(newItem)) {
                    return;
                }

                if (newItem !== oldItem) {
                    if (newItem.workoutOrder > oldItem.workoutOrder) {
                        vm.workoutSwitchAnimation = LEFT_ANIMATION;
                    } else {
                        vm.workoutSwitchAnimation = RIGHT_ANIMATION;
                    }
                }

                data.exercise = newItem;

                var currentStateName = $state.current.name;
                if (newItem.workoutOrder === 0) {
                    if (currentStateName !== DIAGNOSTIC_STATE) {
                        $state.go(DIAGNOSTIC_STATE);
                    }
                } else {
                    search = $location.search();
                    // the current state can be "app.workouts.roadmap.workout.intro"
                    // while the direct link is "app.workouts.roadmap.workout?workout=20"  so no need to navigate...
                    if (currentStateName.indexOf(WORKOUT_STATE) === -1 || +search.workout !== +newItem.workoutOrder) {
                        $state.go('app.workoutsRoadmap.workout', {
                            workout: newItem.workoutOrder
                        });
                    }
                }
            });
        }]
    );
})();

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapBasePreSummaryController',
        ["$timeout", "WorkoutsSrv", "SubjectEnum", "data", "ExerciseStatusEnum", "$filter", "WorkoutsRoadmapSrv", "purchaseService", function ($timeout, WorkoutsSrv, SubjectEnum, data, ExerciseStatusEnum, $filter,
                  WorkoutsRoadmapSrv, purchaseService) {
            'ngInject';

            var DIAGNOSTIC_ORDER = 0;

            var TIMOUT_BEFORE_GOING_TO_NEXT = 1500;

            var translateFilter = $filter('translate');
            var vm = this;

            function _getToNextWorkout() {
                data.roadmapCtrlActions.freezeWorkoutProgressComponent(true);

                var currentWorkout = data.exercise;

                var subjectToIgnoreForNextDaily;
                if (currentWorkout.workoutOrder !== DIAGNOSTIC_ORDER) {
                    subjectToIgnoreForNextDaily = currentWorkout.subjectId;
                    currentWorkout.status = ExerciseStatusEnum.COMPLETED.enum;
                    WorkoutsSrv.setWorkout(currentWorkout.workoutOrder, currentWorkout);
                }

                var nextWorkoutOrder = currentWorkout.workoutOrder + 1;
                var nextWorkout = data.workoutsProgress[nextWorkoutOrder - 1];
                nextWorkout.status = ExerciseStatusEnum.ACTIVE.enum;

                if (!nextWorkout.isAvail) {
                    purchaseService.openPurchaseNudge(1, currentWorkout.workoutOrder);
                }

                data.personalizedWorkoutTimesProm =
                    WorkoutsRoadmapSrv.generateNewExercise(subjectToIgnoreForNextDaily, nextWorkout.workoutOrder);

                $timeout(function () {
                    data.roadmapCtrlActions.freezeWorkoutProgressComponent(false);
                    data.roadmapCtrlActions.setCurrWorkout(nextWorkout.workoutOrder);
                }, TIMOUT_BEFORE_GOING_TO_NEXT);
            }

            function diagnosticPreSummary() {
                vm.text = translateFilter('ROADMAP_BASE_PRE_SUMMARY.DIAGNOSTIC_TEST');
                _getToNextWorkout();
            }

            function workoutPreSummary() {
                vm.text = translateFilter('ROADMAP_BASE_PRE_SUMMARY.WORKOUT') + ' ';
                vm.text += +data.exercise.workoutOrder;
                _getToNextWorkout();
            }

            if (data.exercise.workoutOrder === DIAGNOSTIC_ORDER) {
                diagnosticPreSummary();
            } else {
                workoutPreSummary();
            }
        }]
    );
})();

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticController',
        ["$state", "ExerciseStatusEnum", "data", "$timeout", function ($state, ExerciseStatusEnum, data, $timeout) {
            'ngInject';
            //  fixing page not rendered in the first app entrance issue
            $timeout(function () {
                switch (data.diagnostic.status) {
                    case ExerciseStatusEnum.COMPLETED.enum:
                        var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
                        if (isFirstWorkoutStarted) {
                            $state.go('.summary');
                        } else {
                            $state.go('.preSummary');
                        }
                        break;
                    default:
                        $state.go('.intro');
                }
            });
        }]);
})();

(function (angular) {
    'use strict';
    
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        ["isDiagnosticStarted", function (isDiagnosticStarted) {
            'ngInject';

            var vm = this;

            vm.buttonTitle = isDiagnosticStarted ? 'CONTINUE' : 'START' ;
        }]);
})(angular);

'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutController',
        ["$state", "data", "ExerciseStatusEnum", "ExerciseResultSrv", function ($state, data, ExerciseStatusEnum, ExerciseResultSrv) {
            'ngInject';

            function _setExerciseResultOnDataObject() {
                return ExerciseResultSrv.getExerciseResult(data.exercise.exerciseTypeId, data.exercise.exerciseId).then(function (exerciseResult) {
                    data.exerciseResult = exerciseResult;
                    return exerciseResult;
                });
            }

            function _goToState(stateName) {
                var EXPECTED_CURR_STATE = 'app.workoutsRoadmap.workout';
                if ($state.current.name === EXPECTED_CURR_STATE) {
                    $state.go(stateName);
                }
            }

            switch (data.exercise.status) {
                case ExerciseStatusEnum.ACTIVE.enum:
                    if (angular.isUndefined(data.exercise.exerciseId) || angular.isUndefined(data.exercise.exerciseTypeId)) {
                        _goToState('.intro');
                    } else {
                        _setExerciseResultOnDataObject().then(function (result) {
                            if (result.isComplete) {
                                _goToState('.preSummary');
                            } else {
                                _goToState('.inProgress');
                            }
                        });
                    }
                    break;
                case ExerciseStatusEnum.COMPLETED.enum:
                    _setExerciseResultOnDataObject().then(function () {
                        _goToState('.summary');
                    });
                    break;
                default:
                    _goToState('.intro');
            }
        }]
    );
})();

(function (angular) {
    'use strict';
    
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutInProgressController',
        ["data", "ExerciseResultSrv", function (data, ExerciseResultSrv) {
            'ngInject';

            var vm = this;

            vm.workout = data.exercise;

            ExerciseResultSrv.getExerciseResult(vm.workout.exerciseTypeId, vm.workout.exerciseId, null, null, true).then(function(exerciseResult){
                vm.exerciseResult = exerciseResult;
                exerciseResult.totalQuestionNum = exerciseResult.totalQuestionNum || 0;
                exerciseResult.totalAnsweredNum = exerciseResult.totalAnsweredNum || 0;
            });
        }]
    );
})(angular);

'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutIntroController',
        ["data", "$state", "WorkoutsRoadmapSrv", "$q", "$scope", "ExerciseStatusEnum", "ExerciseTypeEnum", "SubjectEnum", "$timeout", function (data, $state, WorkoutsRoadmapSrv, $q, $scope, ExerciseStatusEnum, ExerciseTypeEnum, SubjectEnum, $timeout) {
            'ngInject';

            var FIRST_WORKOUT_ORDER = 1;

            var vm = this;

            vm.workoutsProgress = data.workoutsProgress;

            var currWorkout = data.exercise;
            var currWorkoutOrder = currWorkout && +currWorkout.workoutOrder;
            if (isNaN(currWorkoutOrder)) {
                $state.go('appWorkouts.roadmap', {}, {
                    reload: true
                });
            }
            vm.workoutOrder = currWorkoutOrder;

            WorkoutsRoadmapSrv.getWorkoutAvailTimes().then(function (workoutAvailTimes) {
                vm.workoutAvailTimes = workoutAvailTimes;
            });

            function setTimesWorkouts(getPersonalizedWorkoutsByTimeProm) {
                getPersonalizedWorkoutsByTimeProm.then(function (workoutsByTime) {
                    vm.workoutsByTime = workoutsByTime;
                    WorkoutsRoadmapSrv.getWorkoutAvailTimes().then(function (workoutAvailTimes) {
                        for (var i in workoutAvailTimes) {
                            var time = workoutAvailTimes[i];
                            if (workoutsByTime[time]) {
                                vm.selectedTime = time;
                                break;
                            }
                        }
                    });
                });
            }

            var prevWorkoutOrder = currWorkout.workoutOrder - 1;
            var prevWorkout = prevWorkoutOrder >= FIRST_WORKOUT_ORDER ? data.workoutsProgress && data.workoutsProgress[prevWorkoutOrder - 1] : data.diagnostic;

            //set times workouts
            (function () {
                var getPersonalizedWorkoutsByTimeProm;
                var subjectsToIgnore;

                if (prevWorkout.status === ExerciseStatusEnum.COMPLETED.enum) {
                    if (!currWorkout.personalizedTimes) {
                        if (currWorkout.workoutOrder !== FIRST_WORKOUT_ORDER) {
                            subjectsToIgnore = prevWorkout.subjectId;
                        }
                        getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(subjectsToIgnore, currWorkout.workoutOrder);
                    } else {
                        getPersonalizedWorkoutsByTimeProm = $q.when(currWorkout.personalizedTimes);
                    }

                    setTimesWorkouts(getPersonalizedWorkoutsByTimeProm);
                }
            })();


            vm.getWorkoutIcon = function (workoutLength) {
                if (vm.workoutsByTime) {
                    var exerciseTypeId = vm.workoutsByTime[workoutLength] && vm.workoutsByTime[workoutLength].exerciseTypeId;
                    var exerciseTypeEnumVal = ExerciseTypeEnum.getValByEnum(exerciseTypeId);
                    return exerciseTypeEnumVal ? 'workouts-progress-' + exerciseTypeEnumVal.toLowerCase() + '-icon' : '';
                }
                return '';
            };

            vm.changeSubject = (function () {
                var usedSubjects = [];
                var subjectNum = SubjectEnum.getEnumArr().length;

                return function () {
                    usedSubjects.push(currWorkout.subjectId);
                    if (usedSubjects.length === subjectNum) {
                        usedSubjects = [];
                    }

                    delete currWorkout.personalizedTimes;
                    delete vm.selectedTime;

                    $timeout(function(){
                        var getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(usedSubjects, currWorkout.workoutOrder);
                        setTimesWorkouts(getPersonalizedWorkoutsByTimeProm);
                        getPersonalizedWorkoutsByTimeProm.then(function () {
                            vm.rotate = false;
                        }, function () {
                            vm.rotate = false;
                        });
                    });
                };

            })();

            $scope.$watch('vm.selectedTime', function (newSelectedTime) {
                if (angular.isUndefined(newSelectedTime)) {
                    return;
                }

                if (vm.workoutsByTime) {
                    vm.selectedWorkout = vm.workoutsByTime[newSelectedTime];
                    currWorkout.subjectId = vm.selectedWorkout.subjectId;
                }
            });
        }]
    );
})();

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'workouts-intro-lock-dotted-arrow': 'components/workoutsRoadmap/svg/dotted-arrow.svg',
                'workouts-intro-lock-lock': 'components/workoutsRoadmap/svg/lock-icon.svg',
                'workouts-intro-lock-share-arrow': 'components/workoutsRoadmap/svg/share-arrow-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }])
        .directive('workoutIntroLock',
            ["DiagnosticSrv", "ExerciseStatusEnum", "$stateParams", "$q", "SocialSharingSrv", function (DiagnosticSrv, ExerciseStatusEnum, $stateParams, $q, SocialSharingSrv) {
                'ngInject';

                return {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutIntroLock/workoutIntroLockDirective.template.html',
                    restrict: 'E',
                    transclude: true,
                    scope: {
                        workoutsProgressGetter: '&workoutsProgress'
                    },
                    link: function (scope, element) {
                        var currWorkoutOrder = +$stateParams.workout;
                        var workoutsProgress = scope.workoutsProgressGetter();
                        var currWorkout = workoutsProgress[currWorkoutOrder - 1];

                        scope.vm = {};

                        var LOCK_STATES = {
                            NO_LOCK: -1,
                            DIAGNOSTIC_NOT_COMPLETED: 1,
                            PREV_NOT_COMPLETED: 2,
                            NO_PRO_SOCIAL_SHARING: 3,
                            BUY_PRO: 4
                        };

                        var setLockStateFlowControlProm = DiagnosticSrv.getDiagnosticStatus().then(function (status) {
                            if (status !== ExerciseStatusEnum.COMPLETED.enum) {
                                scope.vm.lockState = LOCK_STATES.DIAGNOSTIC_NOT_COMPLETED;
                                element.addClass('lock');
                                return $q.reject(null);
                            }
                        });

                        setLockStateFlowControlProm = setLockStateFlowControlProm.then(function () {
                            var FIRST_WORKOUT_ORDER = 1;
                            if (currWorkoutOrder > FIRST_WORKOUT_ORDER) {
                                var prevWorkoutIndex = currWorkoutOrder - 2;
                                var prevWorkout = workoutsProgress[prevWorkoutIndex];
                                if (prevWorkout.status !== ExerciseStatusEnum.COMPLETED.enum) {
                                    element.addClass('lock');
                                    scope.vm.lockState = LOCK_STATES.PREV_NOT_COMPLETED;
                                    return $q.reject(null);
                                }
                            }
                        });

                        setLockStateFlowControlProm = setLockStateFlowControlProm.then(function () {
                            if(!currWorkout.isAvail){
                                return SocialSharingSrv.getSocialSharingData().then(function(socialSharingData){
                                    element.addClass('lock');
                                    scope.vm.lockState = LOCK_STATES.NO_PRO_SOCIAL_SHARING;

                                    angular.forEach(socialSharingData,function(wasShared){
                                        if(wasShared){
                                            scope.vm.lockState = LOCK_STATES.BUY_PRO;
                                        }
                                    });

                                    return $q.reject(null);
                                });
                            }
                        });

                        setLockStateFlowControlProm.then(function(){
                            scope.vm.lockState = LOCK_STATES.NO_LOCK;
                        });
                    }
                };
            }]
        );
})(angular);


(function () {
    'use strict';
    
    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg',
                    'workouts-progress-check-mark-icon': 'components/workoutsRoadmap/svg/check-mark-icon.svg',
                    'workouts-progress-tutorial-icon': 'components/workoutsRoadmap/svg/tutorial-icon.svg',
                    'workouts-progress-practice-icon': 'components/workoutsRoadmap/svg/practice-icon.svg',
                    'workouts-progress-game-icon': 'components/workoutsRoadmap/svg/game-icon.svg',
                    'workouts-progress-drill-icon': 'components/workoutsRoadmap/svg/drill-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ])
        .directive('workoutsProgress',
            ["$timeout", "ExerciseStatusEnum", "$log", function workoutsProgressDirective($timeout, ExerciseStatusEnum, $log) {
                'ngInject';

                var config = {
                    focusAnimateDuration: 500,
                    focuseAnimationTimingFunction: 'ease-in-out',
                    mouseLeaveBeforeFocusDelay: 2000
                };

                var directive = {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html',
                    restrict: 'E',
                    require: 'ngModel',
                    scope: {
                        workoutsGetter: '&workouts',
                        diagnosticGetter: '&diagnostic',
                        activeWorkoutOrder: '@activeWorkoutOrder'
                    },
                    compile: function compile() {
                        return {
                            pre: function pre(scope) {
                                scope.vm = {};

                                var workouts = scope.workoutsGetter() || [];

                                scope.vm.workouts = workouts;
                                scope.vm.diagnostic = angular.copy(scope.diagnosticGetter());
                                //  added in order to treat the diagnostic as a workout what simplifies the code
                                scope.vm.diagnostic.workoutOrder = 0;
                            },
                            post: function post(scope, element, attrs, ngModelCtrl) {
                                var domElement = element[0];
                                var focusOnSelectedWorkoutTimeoutProm;

                                function mouseEnterEventListener() {
                                    if (focusOnSelectedWorkoutTimeoutProm) {
                                        $timeout.cancel(focusOnSelectedWorkoutTimeoutProm);
                                        focusOnSelectedWorkoutTimeoutProm = null;
                                    }
                                }

                                domElement.addEventListener('mouseenter', mouseEnterEventListener);

                                function mouseLeaveEventListener() {
                                    focusOnSelectedWorkoutTimeoutProm = $timeout(function () {
                                        scope.vm.focusOnSelectedWorkout();
                                    }, config.mouseLeaveBeforeFocusDelay, false);
                                }

                                domElement.addEventListener('mouseleave', mouseLeaveEventListener);

                                function _setProgressLineWidth(activeWorkoutOrder) {
                                    var itemsContainerDomeElement = domElement.querySelectorAll('.item-container');
                                    if (itemsContainerDomeElement.length) {
                                        var activeWorkoutDomElement = itemsContainerDomeElement[activeWorkoutOrder];
                                        if (activeWorkoutDomElement) {
                                            var LEFT_OFFSET = 40;
                                            var progressLineDomElement = domElement.querySelector('.dotted-line.progress');
                                            progressLineDomElement.style.width = LEFT_OFFSET + activeWorkoutDomElement.offsetLeft + 'px';
                                        }
                                    }
                                }

                                scope.vm.focusOnSelectedWorkout = function () {
                                    var parentElement = element.parent();
                                    var parentDomElement = parentElement[0];
                                    if (!parentDomElement) {
                                        return;
                                    }
                                    var containerWidth = parentDomElement.offsetWidth;
                                    var containerCenter = containerWidth / 2;

                                    var selectedWorkoutDomElement = domElement.querySelectorAll('.item-container')[scope.vm.selectedWorkout];
                                    if (!selectedWorkoutDomElement) {
                                        return;
                                    }
                                    var toCenterAlignment = selectedWorkoutDomElement.offsetWidth / 2;
                                    var scrollLeft = selectedWorkoutDomElement.offsetLeft + toCenterAlignment;// align to center
                                    var offset = containerCenter - scrollLeft;
                                    scope.vm.scrollActions.animate(offset, config.focusAnimateDuration, config.focuseAnimationTimingFunction);
                                };

                                function _selectWorkout(itemOrder, skipSetViewValue) {
                                    itemOrder = +itemOrder;
                                    if (isNaN(itemOrder)) {
                                        $log.error('workoutsProgress.directive:vm.selectWorkout: itemOrder is not a number');
                                        return;
                                    }
                                    var items = [scope.vm.diagnostic].concat(scope.vm.workouts);
                                    scope.vm.selectedWorkout = itemOrder;
                                    scope.vm.focusOnSelectedWorkout();
                                    var selectedItem = items[itemOrder];
                                    if (!skipSetViewValue) {
                                        ngModelCtrl.$setViewValue(selectedItem);
                                    }
                                }

                                scope.vm.workoutClick = function (itemOrder) {
                                    if (attrs.disabled) {
                                        return;
                                    }
                                    _selectWorkout(itemOrder);
                                };

                                ngModelCtrl.$render = function () {
                                    if (ngModelCtrl.$viewValue && angular.isDefined(ngModelCtrl.$viewValue.workoutOrder)) {
                                        $timeout(function () {
                                            _selectWorkout(ngModelCtrl.$viewValue.workoutOrder, true);
                                            _setProgressLineWidth(scope.activeWorkoutOrder);
                                        }, 0, false);
                                    }
                                };

                                scope.$on('$destroy', function () {
                                    domElement.removeEventListener('mouseleave', mouseLeaveEventListener);
                                    domElement.removeEventListener('mouseenter', mouseEnterEventListener);
                                });

                                // attrs.$observe('activeWorkoutOrder', function (newActiveWorkoutOrder) {
                                //     if (angular.isDefined(newActiveWorkoutOrder)) {
                                //         _setProgressLineWidth(newActiveWorkoutOrder);
                                //     }
                                // });
                            }
                        };
                    }
                };

                return directive;
            }]
        );
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv', [
        function () {
            var _newWorkoutGeneratorGetter;
            this.setNewWorkoutGeneratorGetter = function(newWorkoutGeneratorGetter){
                _newWorkoutGeneratorGetter = newWorkoutGeneratorGetter;
            };


            var _workoutAvailTimesGetter;
            this.setWorkoutAvailTimes = function(workoutAvailTimesGetter){
                _workoutAvailTimesGetter = workoutAvailTimesGetter;
            };

            this.$get = ["$injector", "$log", "$q", function($injector, $log, $q){
                'ngInject';

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function(subjectToIgnoreForNextDaily, workoutOrder){
                    if(!_newWorkoutGeneratorGetter){
                        var errMsg = 'WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    var newExerciseGenerator = $injector.invoke(_newWorkoutGeneratorGetter);
                    return $q.when(newExerciseGenerator(subjectToIgnoreForNextDaily,workoutOrder));
                };

                WorkoutsRoadmapSrv.getWorkoutAvailTimes = function(){
                    if(!_workoutAvailTimesGetter){
                        var errMsg = 'WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    var workoutAvailTimes;
                    if(angular.isFunction(_workoutAvailTimesGetter)){
                        workoutAvailTimes = $injector.invoke(_workoutAvailTimesGetter);
                    }else{
                        workoutAvailTimes = _workoutAvailTimesGetter;
                    }

                    return $q.when(workoutAvailTimes);
                };

                return WorkoutsRoadmapSrv;
            }];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.workoutsRoadmap').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/workoutsRoadmap/directives/workoutIntroLock/workoutIntroLockDirective.template.html",
    "<div ng-transclude class=\"main-container\"></div>\n" +
    "<div translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_INTRO_LOCK\"\n" +
    "    class=\"lock-overlay-container\">\n" +
    "    <ng-switch on=\"vm.lockState\">\n" +
    "        <div class=\"diagnostic-not-completed\"\n" +
    "             ng-switch-when=\"1\">\n" +
    "            <div class=\"description\"\n" +
    "                 translate=\".DIAGNOSTIC_NOT_COMPLETED\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"2\" class=\"prev-not-completed\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-dotted-arrow\"></svg-icon>\n" +
    "            <div class=\"description\"\n" +
    "                 translate=\".PREV_NOT_COMPLETED\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"3\" class=\"no-pro-social-sharing\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-lock\"></svg-icon>\n" +
    "            <div class=\"text1\"\n" +
    "                 translate=\".MORE_WORKOUTS\">\n" +
    "            </div>\n" +
    "            <div class=\"text2\"\n" +
    "                 translate=\".TELL_FRIENDS\">\n" +
    "            </div>\n" +
    "            <md-button class=\"share-btn md-primary znk\"\n" +
    "                       md-no-ink>\n" +
    "                <svg-icon name=\"workouts-intro-lock-share-arrow\"></svg-icon>\n" +
    "                <span translate=\".SHARE\"></span>\n" +
    "            </md-button>\n" +
    "            <div class=\"text3 get-zinkerz-pro-text\"\n" +
    "                 translate=\".GET_ZINKERZ_PRO\">\n" +
    "            </div>\n" +
    "            <md-button class=\"upgrade-btn znk outline\">\n" +
    "                <span translate=\".UPGRADE\"></span>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"4\" class=\"no-pro\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-lock\"></svg-icon>\n" +
    "            <div class=\"description\" translate=\".MORE_PRACTICE\"></div>\n" +
    "            <div class=\"get-zinkerz-pro-text\" translate=\".GET_ZINKERZ_PRO\"></div>\n" +
    "            <md-button class=\"upgrade-btn znk md-primary\">\n" +
    "                <span translate=\".UPGRADE\"></span>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html",
    "<znk-scroll actions=\"vm.scrollActions\" scroll-on-mouse-wheel=\"true\">\n" +
    "    <div class=\"items-container\">\n" +
    "        <div class=\"dotted-lines-container\">\n" +
    "            <div class=\"dotted-line progress\"></div>\n" +
    "            <div class=\"dotted-line future\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container diagnostic\">\n" +
    "            <div class=\"item\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === vm.diagnostic.workoutOrder\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(vm.diagnostic.workoutOrder)\">\n" +
    "                <ng-switch on=\"vm.diagnostic.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\"\n" +
    "                              name=\"workouts-progress-check-mark-icon\"\n" +
    "                              ng-switch-when=\"2\">\n" +
    "                    </svg-icon>\n" +
    "                    <svg-icon class=\"flag-icon\"\n" +
    "                              name=\"workouts-progress-flag\"\n" +
    "                              ng-switch-default>\n" +
    "                    </svg-icon>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container\"\n" +
    "             ng-repeat=\"workout in vm.workouts\">\n" +
    "            <div class=\"item\"\n" +
    "                 subject-id-to-attr-drv=\"workout.subjectId\"\n" +
    "                 suffix=\"bg\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === workout.workoutOrder,\n" +
    "                    pristine: workout.subjectId === undefined\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(workout.workoutOrder)\">\n" +
    "                <ng-switch on=\"workout.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\" name=\"workouts-progress-check-mark-icon\" ng-switch-when=\"2\"></svg-icon>\n" +
    "                    <span ng-switch-default>\n" +
    "                        {{::workout.workoutOrder}}\n" +
    "                    </span>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "    </div>\n" +
    "</znk-scroll>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/change-subject-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 86.4 71.6\"\n" +
    "     class=\"workouts-roadmap-change-subject-svg\">\n" +
    "\n" +
    "<style type=\"text/css\">\n" +
    "    .workouts-roadmap-change-subject-svg{\n" +
    "        width: 10px;\n" +
    "    }\n" +
    "\n" +
    "    .workouts-roadmap-change-subject-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 1.6864;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "</style>\n" +
    "\n" +
    "<g>\n" +
    "	<path id=\"XMLID_70_\" class=\"st0\" d=\"M8.5,29.4C11.7,13.1,26,0.8,43.2,0.8c17.5,0,32,12.7,34.8,29.5\"/>\n" +
    "	<polyline id=\"XMLID_69_\" class=\"st0\" points=\"65.7,24 78.3,30.3 85.7,18.7 	\"/>\n" +
    "</g>\n" +
    "<g>\n" +
    "	<path id=\"XMLID_68_\" class=\"st0\" d=\"M77.9,42.2c-3.2,16.3-17.5,28.6-34.7,28.6c-17.5,0-32-12.7-34.8-29.5\"/>\n" +
    "	<polyline id=\"XMLID_67_\" class=\"st0\" points=\"20.7,47.6 8.1,41.3 0.7,52.9 	\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg{\n" +
    "            width: 30px;\n" +
    "        }\n" +
    "\n" +
    "        .check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg",
    "<svg\n" +
    "	class=\"complete-v-icon-svg\"\n" +
    "	xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "	xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "    x=\"0px\"\n" +
    "	y=\"0px\"\n" +
    "	viewBox=\"-1040 834.9 220.4 220.4\"\n" +
    "	style=\"enable-background:new -1040 834.9 220.4 220.4;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "    .complete-v-icon-svg{\n" +
    "        width: 110px;\n" +
    "    }\n" +
    "\n" +
    "	.complete-v-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st1 {\n" +
    "        fill: #CACBCC;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st2 {\n" +
    "        display: none;\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st3 {\n" +
    "        fill: #D1D2D2;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st4 {\n" +
    "        fill: none;\n" +
    "        stroke: #FFFFFF;\n" +
    "        stroke-width: 11.9321;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M-401,402.7\"/>\n" +
    "<circle class=\"st1\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<circle class=\"st2\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<path class=\"st3\" d=\"M-860.2,895.8l40,38.1c-5.6-55.6-52.6-99-109.6-99c-60.9,0-110.2,49.3-110.2,110.2\n" +
    "	c0,60.9,49.3,110.2,110.2,110.2c11.6,0,22.8-1.8,33.3-5.1l-61.2-58.3L-860.2,895.8z\"/>\n" +
    "<polyline class=\"st4\" points=\"-996.3,944.8 -951.8,989.3 -863.3,900.8 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/dotted-arrow.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     class=\"workouts-intro-lock-dotted-arrow-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-406.9 425.5 190.9 175.7\">\n" +
    "    <style>\n" +
    "        .workouts-intro-lock-dotted-arrow-svg{\n" +
    "            width: 53px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-intro-lock-dotted-arrow-svg circle{\n" +
    "            stroke: #161616;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <circle cx=\"-402.8\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"513\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"479.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"479.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"462.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"463.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"446.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"479.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"547\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"446.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"429.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"463.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"496.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"479.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"530.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"563.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"546.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"597.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"529.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"512.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"513.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/drill-icon.svg",
    "<svg xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 199 87\"\n" +
    "     class=\"workouts-progress-drill-svg\">\n" +
    "    <style>\n" +
    "        .workouts-progress-drill-svg {\n" +
    "            width: 20px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 16;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st3 {\n" +
    "            clip-path: url(#SVGID_2_);\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 11;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st4 {\n" +
    "            clip-path: url(#SVGID_4_);\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 11;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <line class=\"st0\" x1=\"64\" y1=\"45\" x2=\"138\" y2=\"45\"/>\n" +
    "        <g>\n" +
    "            <line class=\"st1\" x1=\"47\" y1=\"8\" x2=\"47\" y2=\"79\"/>\n" +
    "            <line class=\"st2\" x1=\"29\" y1=\"22\" x2=\"29\" y2=\"65\"/>\n" +
    "            <g>\n" +
    "                <defs>\n" +
    "                    <rect id=\"SVGID_1_\" y=\"38\" width=\"17\" height=\"17\"/>\n" +
    "                </defs>\n" +
    "                <clipPath id=\"SVGID_2_\">\n" +
    "                    <use xlink:href=\"#SVGID_1_\" style=\"overflow:visible;\"/>\n" +
    "                </clipPath>\n" +
    "                <line class=\"st3\" x1=\"18\" y1=\"45.5\" x2=\"24\" y2=\"45.5\"/>\n" +
    "            </g>\n" +
    "        </g>\n" +
    "        <g>\n" +
    "            <line class=\"st1\" x1=\"154\" y1=\"8\" x2=\"154\" y2=\"79\"/>\n" +
    "            <line class=\"st2\" x1=\"172\" y1=\"22\" x2=\"172\" y2=\"65\"/>\n" +
    "            <g>\n" +
    "                <defs>\n" +
    "                    <rect id=\"SVGID_3_\" x=\"182\" y=\"38\" width=\"17\" height=\"17\"/>\n" +
    "                </defs>\n" +
    "                <clipPath id=\"SVGID_4_\">\n" +
    "                    <use xlink:href=\"#SVGID_3_\" style=\"overflow:visible;\"/>\n" +
    "                </clipPath>\n" +
    "                <line class=\"st4\" x1=\"183\" y1=\"45.5\" x2=\"177\" y2=\"45.5\"/>\n" +
    "            </g>\n" +
    "        </g>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/flag-icon.svg",
    "<svg x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-145 277 60 60\"\n" +
    "	 class=\"flag-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .flag-svg{\n" +
    "            width: 23px;\n" +
    "        }\n" +
    "\n" +
    "        .flag-svg .st0 {\n" +
    "            fill: #ffffff;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g id=\"kUxrE9.tif\">\n" +
    "	<g>\n" +
    "		<path class=\"st0\" id=\"XMLID_93_\" d=\"M-140.1,287c0.6-1.1,1.7-1.7,2.9-1.4c1.3,0.3,2,1.1,2.3,2.3c1.1,4,2.1,8,3.2,12c2.4,9.3,4.9,18.5,7.3,27.8\n" +
    "			c0.1,0.3,0.2,0.6,0.2,0.9c0.3,1.7-0.6,3-2.1,3.3c-1.4,0.3-2.8-0.5-3.3-2.1c-1-3.6-2-7.3-2.9-10.9c-2.5-9.5-5-19-7.6-28.6\n" +
    "			C-140.1,290-140.8,288.3-140.1,287z\"/>\n" +
    "		<path class=\"st0\" id=\"XMLID_92_\" d=\"M-89.6,289.1c-1,6.8-2.9,13-10,16c-3.2,1.4-6.5,1.6-9.9,0.9c-2-0.4-4-0.7-6-0.6c-4.2,0.3-7.1,2.7-9,6.4\n" +
    "			c-0.3,0.5-0.5,1.1-0.9,2c-0.3-1-0.5-1.7-0.8-2.5c-2-7-3.9-14.1-5.9-21.2c-0.3-1-0.1-1.7,0.5-2.4c4.5-6,11-7.4,17.5-3.6\n" +
    "			c3.4,2,6.7,4.2,10.2,6.1c1.9,1,3.9,1.9,5.9,2.4c3.2,0.9,5.9,0,7.9-2.6C-90,289.7-89.8,289.4-89.6,289.1z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/game-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 127 147.8\"\n" +
    "     class=\"workouts-progress-game-svg\">\n" +
    "    <style>\n" +
    "        .workouts-progress-game-svg {\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st0 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st1 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-miterlimit: 10;\n" +
    "            fill: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st2 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            fill: #acacac;\n" +
    "            stroke: #acacac;\n" +
    "        }\n" +
    "\n" +
    "\n" +
    "        /*.workouts-progress-game-svg circle {*/\n" +
    "            /*stroke: #acacac;*/\n" +
    "            /*fill: none;*/\n" +
    "        /*}*/\n" +
    "\n" +
    "        /*.workouts-progress-game-svg circle.st1 {*/\n" +
    "            /*fill: #acacac;*/\n" +
    "        /*}*/\n" +
    "\n" +
    "        /*.workouts-progress-game-svg path {*/\n" +
    "            /*fill: #acacac;*/\n" +
    "        /*}*/\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"st0\" cx=\"63.5\" cy=\"84.2\" r=\"60.5\"/>\n" +
    "        <circle class=\"st1\" cx=\"63.7\" cy=\"84.2\" r=\"6.2\"/>\n" +
    "        <path class=\"st1\" d=\"M65.2,73.8h-2.5c-0.7,0-1.2-0.3-1.2-0.7V41.5c0-0.4,0.5-0.7,1.2-0.7h2.5c0.7,0,1.2,0.3,1.2,0.7V73\n" +
    "		C66.4,73.4,65.9,73.8,65.2,73.8z\"/>\n" +
    "        <path class=\"st2\" d=\"M73.7,80.9l-1.6-2.7c-0.3-0.6-0.3-1.2,0.1-1.4l11.6-6.9c0.4-0.2,1,0,1.3,0.6l1.6,2.7c0.3,0.6,0.3,1.2-0.1,1.4\n" +
    "		L75,81.5C74.6,81.7,74,81.5,73.7,80.9z\"/>\n" +
    "        <path class=\"st1\" d=\"M58,9.5v4.6c0,2.9,2.4,5.3,5.3,5.3c2.9,0,5.3-2.4,5.3-5.3V9.5H58z\"/>\n" +
    "        <path class=\"st1\" d=\"M79.2,3.1c0,1.7-1.4,3.1-3.1,3.1H51.6c-1.7,0-3.1-1.4-3.1-3.1l0,0c0-1.7,1.4-3.1,3.1-3.1h24.5\n" +
    "		C77.8,0,79.2,1.4,79.2,3.1L79.2,3.1z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/lock-icon.svg",
    "<svg class=\"workouts-intro-lock-lock-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        svg.workouts-intro-lock-lock-svg {\n" +
    "            width: 37px;\n" +
    "        }\n" +
    "\n" +
    "        svg.workouts-intro-lock-lock-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #161616;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        svg.workouts-intro-lock-lock-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #161616;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/practice-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 255.2 169\"\n" +
    "     class=\"practice-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "    .practice-icon-svg{\n" +
    "        width: 20px;\n" +
    "    }\n" +
    "\n" +
    "    .practice-icon-svg .st0{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "        stroke-linejoin:round;\n" +
    "    }\n" +
    "\n" +
    "    .practice-icon-svg .st1{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "    }\n" +
    "\n" +
    "	.practice-icon-svg .st2{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "        stroke-linejoin:round;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<polyline class=\"st0\"\n" +
    "              points=\"142,41 3,41 3,166 59,166\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"75\"\n" +
    "          x2=\"93\"\n" +
    "          y2=\"75\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"102\"\n" +
    "          x2=\"77\"\n" +
    "          y2=\"102\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"129\"\n" +
    "          x2=\"79\"\n" +
    "          y2=\"129\"/>\n" +
    "	<polygon class=\"st0\"\n" +
    "             points=\"216.8,3 111.2,106.8 93,161.8 146.8,146 252.2,41\"/>\n" +
    "	<line class=\"st2\"\n" +
    "          x1=\"193.2\"\n" +
    "          y1=\"31.7\"\n" +
    "          x2=\"224\"\n" +
    "          y2=\"64.8\"/>\n" +
    "	<polygon points=\"102.5,139.7 114.5,153.8 97.2,157.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/share-arrow-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 149.8 116.7\"\n" +
    "     class=\"share-icon-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .share-icon-svg {\n" +
    "            width: 16px;\n" +
    "        }\n" +
    "\n" +
    "        .share-icon-svg path{\n" +
    "            fill: white;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path d=\"M74.7,33.6c0-11.1,0-21.7,0-33.6c25.4,19.7,49.9,38.8,75.1,58.4c-25,19.5-49.6,38.6-74.9,58.3c0-11.5,0-22,0-32.5\n" +
    "		c-21.6-5.7-49.4,6.1-74.5,31.2c-2.4-12.2,5.4-38.4,21-55C35.9,45,53.7,36.3,74.7,33.6z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/tutorial-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 143.2 207.8\"\n" +
    "    class=\"tips-n-tricks-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .tips-n-tricks-svg {\n" +
    "            width: 11px;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg path {\n" +
    "            fill: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-linecap: round;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "        }\n" +
    "\n" +
    "\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M70.5,2.8\"/>\n" +
    "        <path class=\"st1\" d=\"M110,157.5c0,0-5.1-21,8.7-38.8c10.5-13.5,19.5-28.7,19.5-47.1C138.2,34.8,108.4,5,71.6,5S5,34.8,5,71.6\n" +
    "		c0,18.4,9.1,33.6,19.5,47.1c13.8,17.8,8.7,38.8,8.7,38.8\"/>\n" +
    "        <line class=\"st2\" x1=\"41.8\" y1=\"166.5\" x2=\"101.8\" y2=\"166.5\"/>\n" +
    "        <line class=\"st2\" x1=\"39.8\" y1=\"178.5\" x2=\"103.8\" y2=\"178.5\"/>\n" +
    "        <line class=\"st2\" x1=\"45.8\" y1=\"190.5\" x2=\"95.8\" y2=\"190.5\"/>\n" +
    "        <path d=\"M87.5,198.5c-1.2,6.2-7.3,9.3-16.4,9.3s-14.4-3.3-16.4-9.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmap.template.html",
    "<div class=\"workouts-roadmap-container\">\n" +
    "    <div class=\"workouts-roadmap-wrapper base-border-radius base-box-shadow\">\n" +
    "        <workouts-progress workouts=\"vm.workoutsProgress\"\n" +
    "                           ng-disabled=\"vm.freezeWorkoutProgressComponent\"\n" +
    "                           diagnostic=\"vm.diagnostic\"\n" +
    "                           active-workout-order=\"{{vm.activeWorkoutOrder}}\"\n" +
    "                           ng-model=\"vm.selectedItem\">\n" +
    "        </workouts-progress>\n" +
    "        <div class=\"workouts-container\"\n" +
    "             ng-class=\"vm.workoutSwitchAnimation\">\n" +
    "            <ui-view class=\"workouts-ui-view\"></ui-view>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <estimated-score-widget is-nav-menu=\"false\" ng-model=\"currentSubjectId\"></estimated-score-widget>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html",
    "<div class=\"workouts-roadmap-base-pre-summary base-workouts-wrapper\"\n" +
    "     translate-namespace=\"ROADMAP_BASE_PRE_SUMMARY\">\n" +
    "    <div>\n" +
    "        <div class=\"diagnostic-workout-title\">{{::vm.text}}</div>\n" +
    "        <svg-icon class=\"checkmark-icon\"\n" +
    "                  name=\"workouts-roadmap-checkmark\">\n" +
    "        </svg-icon>\n" +
    "        <div class=\"complete-text\"\n" +
    "             translate=\".COMPLETE\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html",
    "<div translate-namespace=\"WORKOUTS_ROADMAP_DIAGNOSTIC_INTRO\"\n" +
    "     class=\"workouts-roadmap-diagnostic-intro base-workouts-wrapper\">\n" +
    "    <div>\n" +
    "        <div class=\"diagnostic-workout-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "        <diagnostic-intro></diagnostic-intro>\n" +
    "        <md-button  class=\"md-primary znk\"\n" +
    "                    autofocus\n" +
    "                    tabindex=\"1\"\n" +
    "                    ui-sref=\"app.diagnostic({ skipIntro: true })\"\n" +
    "                    aria-label=\"{{::vm.buttonTitle}}\"\n" +
    "                    md-no-ink>{{::vm.buttonTitle | translate}}\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapWorkoutInProgress.template.html",
    "<div class=\"workouts-roadmap-workout-in-progress base-workouts-wrapper\"\n" +
    "     translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_IN_PROGRESS\">\n" +
    "    <div class=\"workouts-roadmap-workout-in-progress-wrapper\">\n" +
    "        <div class=\"title-wrapper\">\n" +
    "            <div translate=\".TITLE\"\n" +
    "                 translate-values=\"{workoutOrder: vm.workout.workoutOrder}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <svg-icon class=\"subject-icon\"\n" +
    "                  subject-id-to-attr-drv=\"vm.workout.subjectId\"\n" +
    "                  context-attr=\"name\"\n" +
    "                  suffix=\"icon\">\n" +
    "        </svg-icon>\n" +
    "        <div class=\"subject-title\"\n" +
    "             translate=\"SUBJECTS.{{vm.workout.subjectId}}\">\n" +
    "        </div>\n" +
    "        <div class=\"keep-going-text\" translate=\".KEEP_GOING\"></div>\n" +
    "        <div class=\"answered-text\"\n" +
    "             translate=\".ANSWERED\"\n" +
    "             translate-values=\"{\n" +
    "                answered: vm.exerciseResult.totalAnsweredNum,\n" +
    "                total: vm.exerciseResult.totalQuestionNum\n" +
    "             }\">\n" +
    "        </div>\n" +
    "        <md-button class=\"znk md-primary continue-btn\">\n" +
    "            <span translate=\".CONTINUE\"></span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapWorkoutIntro.template.html",
    "<div class=\"workouts-roadmap-workout-intro base-workouts-wrapper\"\n" +
    "     translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_INTRO\">\n" +
    "    <div class=\"workouts-roadmap-intro-wrapper\">\n" +
    "        <div class=\"title-wrapper\">\n" +
    "            <div translate=\".TITLE\"\n" +
    "                 translate-values=\"{workoutOrder: vm.workoutOrder}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <workout-intro-lock workouts-progress=\"vm.workoutsProgress\">\n" +
    "            <svg-icon class=\"subject-icon\"\n" +
    "                      subject-id-to-attr-drv=\"vm.selectedWorkout.subjectId\"\n" +
    "                      context-attr=\"name\"\n" +
    "                      suffix=\"icon\">\n" +
    "            </svg-icon>\n" +
    "            <div class=\"subject-title\"\n" +
    "                 translate=\"SUBJECTS.{{vm.selectedWorkout.subjectId}}\">\n" +
    "            </div>\n" +
    "            <div class=\"change-subject-container\"\n" +
    "                 ng-class=\"{\n" +
    "                'rotate': vm.rotate\n" +
    "             }\"\n" +
    "                 ng-click=\"vm.rotate = !vm.rotate; vm.changeSubject()\">\n" +
    "                <svg-icon name=\"workouts-roadmap-change-subject\"></svg-icon>\n" +
    "            <span class=\"change-subject-title\"\n" +
    "                  translate=\".CHANGE_SUBJECT\">\n" +
    "            </span>\n" +
    "            </div>\n" +
    "            <div class=\"how-much-time-title\"\n" +
    "                 translate=\".HOW_MUCH_TIME\">\n" +
    "            </div>\n" +
    "            <div class=\"workout-time-selection-container\">\n" +
    "                <div class=\"avail-time-item-wrapper\"\n" +
    "                     ng-repeat=\"workoutAvailTime in vm.workoutAvailTimes\">\n" +
    "                    <div class=\"avail-time-item\"\n" +
    "                         ng-class=\"{\n" +
    "                        active: vm.selectedTime === workoutAvailTime\n" +
    "                     }\"\n" +
    "                         ng-click=\"vm.selectedTime = workoutAvailTime;\">\n" +
    "                        <svg-icon class=\"workout-icon\"\n" +
    "                                  name=\"{{vm.getWorkoutIcon(workoutAvailTime);}}\">\n" +
    "\n" +
    "                        </svg-icon>\n" +
    "                        <span class=\"avail-time-text\">{{workoutAvailTime}}</span>\n" +
    "                    <span class=\"minutes-text\"\n" +
    "                          translate=\".MINUTES\">\n" +
    "                    </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"start-btn-wrapper\">\n" +
    "                <md-button class=\"md-primary znk\"\n" +
    "                           md-no-ink>\n" +
    "                    <span translate=\".START\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </workout-intro-lock>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkExerciseHeader', [
        'pascalprecht.translate',
        'ngMaterial',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.general'
    ]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkExerciseHeader').directive('znkExerciseHeader',
        ["$timeout", "SubjectEnum", "$translatePartialLoader", function($timeout, SubjectEnum, $translatePartialLoader){
        'ngInject';

        return {
            scope: {
                options: '=?',
                onClickedQuit: '&?',
                timerData: '=?',
                subjectId: '=',
                categoryId: '&',
                sideText: '@',
                totalSlideNum: '@',
                exerciseNum: '@',
                iconName: '@',
                iconClickHandler: '&',
                showNoCalcIcon: '&',
                showNoCalcTooltip: '&'
            },
            restrict: 'E',
            require: '?ngModel',
            templateUrl: 'components/znkExerciseHeader/templates/exerciseHeader.template.html',
            controller: function () {
                $translatePartialLoader.addPart('znkExerciseHeader');
                // required: subjectId
                if (angular.isUndefined(this.subjectId)) {
                    throw new Error('Error: exerciseHeaderController: subjectId is required!');
                }
                this.subjectId = +this.subjectId;
                this.categoryId = this.categoryId();
                var categoryId = angular.isDefined(this.categoryId) ? this.categoryId : this.subjectId;
                this.subjectName = SubjectEnum.getValByEnum(categoryId);
            },
            bindToController: true,
            controllerAs: 'vm',
            link: function (scope, element, attrs, ngModel) {
                if (ngModel) {
                    ngModel.$render = function () {
                        scope.vm.currentSlideNum = ngModel.$viewValue;
                    };
                }

                if (scope.vm.showNoCalcIcon()) {
                    $timeout(function () {    // timeout fixing md-tooltip visibility issues
                        scope.vm.showToolTip = scope.vm.showNoCalcTooltip();
                    });
                }
            }
        };
    }]);
})(angular);

angular.module('znk.infra-web-app.znkExerciseHeader').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkExerciseHeader/templates/exerciseHeader.template.html",
    "<div class=\"exercise-header subject-repeat\" subject-id-to-attr-drv=\"vm.subjectId\"\n" +
    "     context-attr=\"class\" suffix=\"bg\" translate-namespace=\"CONTAINER_HEADER\">\n" +
    "   <div class=\"pattern\" subject-id-to-attr-drv=\"vm.subjectId\" context-attr=\"class\" prefix=\"subject-background\"></div>\n" +
    "\n" +
    "    <div class=\"left-area\">\n" +
    "        <div class=\"side-text\" translate=\"{{vm.sideText | cutString: 40}}\" translate-values=\"{subjectName: vm.subjectName, exerciseNum: vm.exerciseNum}\"></div>\n" +
    "\n" +
    "        <div ng-if=\"vm.showNoCalcIcon()\" class=\"no-math-icon-wrapper\">\n" +
    "            <div class=\"math-no-calc\"></div>\n" +
    "            <svg-icon name=\"math-icon\" class=\"icon-wrapper\"></svg-icon>\n" +
    "\n" +
    "            <md-tooltip md-visible=\"vm.showToolTip\" ng-if=\"vm.showToolTip\" md-direction=\"bottom\" class=\"no-calc-tooltip md-whiteframe-3dp\">\n" +
    "                <div class=\"arrow-up\"></div>\n" +
    "                <div translate=\".NO_CALC_TOOLTIP\" class=\"top-text\"></div>\n" +
    "                <div translate=\".GOT_IT\" class=\"md-button primary got-it-btn\" ng-click=\"vm.showToolTip = false\"></div>\n" +
    "            </md-tooltip>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"center-num-slide\" ng-if=\"vm.options.showNumSlide\">{{vm.currentSlideNum}}/{{::vm.totalSlideNum}}</div>\n" +
    "    <div class=\"review-mode\" ng-if=\"vm.options.reviewMode\" ui-sref=\"^.summary\">\n" +
    "        <div class=\"background-opacity\"></div>\n" +
    "        <div class=\"summary-text\" translate=\".SUMMARY\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"right-area\">\n" +
    "        <svg-icon class=\"header-icon\" ng-if=\"vm.iconName\" name=\"{{vm.iconName}}\" ng-click=\"vm.iconClickHandler(); vm.showToolTip = false\"></svg-icon>\n" +
    "\n" +
    "        <div class=\"date-box\" ng-if=\"vm.options.showDate\">\n" +
    "            <timer type=\"1\" ng-model=\"vm.timerData.timeLeft\" play=\"true\" config=\"vm.timerData.config\"></timer>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"quit-back-button\" translate=\".QUIT_BTN_TEXT\" ng-if=\"vm.options.showQuit\" ng-click=\"vm.onClickedQuit()\"></div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader',
        ['ngAnimate',
            'ngMaterial',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'ui.router',
            'znk.infra-web-app.purchase',
            'znk.infra-web-app.onBoarding',
            'znk.infra-web-app.userGoalsSelection',
            'znk.infra.user',
            'znk.infra.general',
            'znk.infra-web-app.invitation'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'znkHeader-raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
        ["$scope", "$translatePartialLoader", "$window", "purchaseService", "znkHeaderSrv", "OnBoardingService", "UserProfileService", "$injector", "PurchaseStateEnum", "userGoalsSelectionService", "AuthService", "ENV", function ($scope, $translatePartialLoader, $window, purchaseService, znkHeaderSrv, OnBoardingService,
                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV) {
            'ngInject';
            $translatePartialLoader.addPart('znkHeader');

            var self = this;
            self.expandIcon = 'expand_more';
            self.additionalItems = znkHeaderSrv.getAdditionalItems();

            OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                self.isOnBoardingCompleted = isCompleted;
            });

            self.invokeOnClickHandler = function(onClickHandler){
                $injector.invoke(onClickHandler);
            };

            this.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
            };

            this.showGoalsEdit = function () {
                userGoalsSelectionService.openEditGoalsDialog({
                    clickOutsideToCloseFlag: true
                });
            };

            UserProfileService.getProfile().then(function (profile) {
                self.userProfile = {
                    username: profile.nickname,
                    email: profile.email
                };
            });

            this.znkOpenModal = function () {
                self.expandIcon = 'expand_less';
            };

            this.logout = function () {
                AuthService.logout();
                $window.location.replace(ENV.redirectLogout);
            };

            function _checkIfHasProVersion() {
                purchaseService.hasProVersion().then(function (hasProVersion) {
                    self.purchaseState = (hasProVersion) ? PurchaseStateEnum.PRO.enum : PurchaseStateEnum.NONE.enum;
                    self.subscriptionStatus = (hasProVersion) ? '.PROFILE_STATUS_PRO' : '.PROFILE_STATUS_BASIC';
                });
            }

            var pendingPurchaseProm = purchaseService.getPendingPurchase();
            if (pendingPurchaseProm) {
                self.purchaseState = PurchaseStateEnum.PENDING.enum;
                self.subscriptionStatus = '.PROFILE_STATUS_PENDING';
                pendingPurchaseProm.then(function () {
                    _checkIfHasProVersion();
                });
            } else {
                _checkIfHasProVersion();
            }

            $scope.$on('$mdMenuClose', function () {
                self.expandIcon = 'expand_more';
            });

        }]);
})(angular);



(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').directive('znkHeader', [

        function () {
            return {
                    scope: {},
                    restrict: 'E',
                    templateUrl: 'components/znkHeader/templates/znkHeader.template.html',
                    controller: 'znkHeaderCtrl',
                    controllerAs: 'vm'
            };
        }
    ]);
})(angular);


/**
 *
 *   api:
 *     addAdditionalItems function - set items that will be clickable in the header. need to supply object (or array of
 *                                    objects) with the properties: text and onClickHandler
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkHeader').provider('znkHeaderSrv',

        function () {
            var additionalNavMenuItems = [];

            this.addAdditionalNavMenuItems = function (additionalItems) {
                if (!angular.isArray(additionalItems)) {
                    additionalNavMenuItems.push(additionalItems);
                } else {
                    additionalNavMenuItems = additionalItems;
                }
            };

            this.$get = ['$state', function ($state) {
                var navItemsArray = [];

                function addDefaultNavItem(_text, _onClickHandler){
                    var navItem = {
                        text: _text,
                        onClickHandler: _onClickHandler
                    };
                    navItemsArray.push(navItem);
                }

                function _onClickHandler(stateAsString, stateParams, options){
                    if(angular.isDefined(stateParams) || angular.isDefined(options)){
                        $state.go(stateAsString, stateParams, options);
                    }
                    else {
                        $state.go(stateAsString);
                    }
                }

                addDefaultNavItem('ZNK_HEADER.WORKOUTS', _onClickHandler.bind(null, 'app.workoutsRoadmap', {}, {reload:true}));
                addDefaultNavItem('ZNK_HEADER.TESTS', _onClickHandler.bind(null, 'app.tests.roadmap'));
                addDefaultNavItem('ZNK_HEADER.TUTORIALS', _onClickHandler.bind(null, 'app.tutorials.roadmap'));
                addDefaultNavItem('ZNK_HEADER.PERFORMANCE', _onClickHandler.bind(null, 'app.performance'));

                return {
                    getAdditionalItems: function () {
                        return navItemsArray.concat(additionalNavMenuItems);  // return array of default nav items with additional nav items
                    }
                };
            }];

        }
    );
})(angular);


angular.module('znk.infra-web-app.znkHeader').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkHeader/svg/raccoon-logo.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 237 158\"\n" +
    "    class=\"raccoon-logo-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .raccoon-logo-svg .circle{fill:#000001;}\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"circle\" cx=\"175\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M118.5,155.9c10.2,0,18.5-8.3,18.5-18.5c0-10.2-8.3-18.5-18.5-18.5c-10.2,0-18.5,8.3-18.5,18.5\n" +
    "		C100,147.6,108.3,155.9,118.5,155.9z\"/>\n" +
    "        <path class=\"circle\" d=\"M172.4,67.5c-15.8-9.7-34.3-15.3-53.9-15.3c-19.6,0-38.2,5.5-53.9,15.3\n" +
    "		c13,1.3,23.1,12.3,23.1,25.6c0,1.8-0.2,3.5-0.5,5.1c9.3-5.2,20-8.1,31.3-8.1c11.3,0,22,2.9,31.4,8.1c-0.3-1.7-0.5-3.4-0.5-5.1\n" +
    "		C149.3,79.8,159.5,68.8,172.4,67.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M36.3,93.5c-8,10.8-14,23.4-17.4,37.2c-1.2,4.9-0.4,10,2.3,14.3c2.6,4.3,6.8,7.3,11.7,8.5\n" +
    "		c1.5,0.4,3,0.5,4.5,0.5c8.8,0,16.3-6,18.4-14.5c1.8-7.7,5-14.7,9.2-20.9c-1,0.1-2,0.2-3,0.2C47.9,118.8,36.5,107.5,36.3,93.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M232.2,92.5c0.6-6.7,6.5-78-4.5-88.4c-9.5-9.1-60.3,16-77.5,24.9\n" +
    "		C185.3,37.8,215,60.9,232.2,92.5z\"/>\n" +
    "        <circle class=\"circle\" cx=\"62\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M204.1,153.6c10.2-2.4,16.4-12.7,14-22.8c-3.3-13.8-9.3-26.4-17.4-37.2\n" +
    "		c-0.2,14-11.6,25.3-25.7,25.3c-1,0-2-0.1-3-0.2c4.2,6.2,7.4,13.3,9.2,21c2,8.6,9.6,14.5,18.4,14.5\n" +
    "		C201.1,154.1,202.6,153.9,204.1,153.6\"/>\n" +
    "        <path class=\"circle\" d=\"M86.7,29C69.5,20.1,18.8-5,9.2,4.1c-11,10.4-5.1,81.5-4.5,88.4C22,60.8,51.7,37.8,86.7,29z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkHeader/templates/znkHeader.template.html",
    "<div class=\"app-header\" translate-namespace=\"ZNK_HEADER\">\n" +
    "    <div class=\"main-content-header\" layout=\"row\" layout-align=\"start start\">\n" +
    "        <svg-icon class=\"raccoon-logo-icon\"\n" +
    "                  name=\"znkHeader-raccoon-logo-icon\"\n" +
    "                  ui-sref=\"app.workoutsRoadmap\"\n" +
    "                  ui-sref-opts=\"{reload: true}\">\n" +
    "        </svg-icon>\n" +
    "\n" +
    "        <div class=\"app-states-list\">\n" +
    "            <md-list flex=\"grow\" layout=\"row\" layout-align=\"start center\">\n" +
    "                <div ng-repeat=\"headerItem in vm.additionalItems\" ng-click=\"vm.invokeOnClickHandler(headerItem.onClickHandler)\">\n" +
    "                    <md-list-item md-ink-ripple ui-sref-active=\"active\">\n" +
    "                        <span class=\"title\" translate=\"{{headerItem.text}}\"></span>\n" +
    "                    </md-list-item>\n" +
    "                </div>\n" +
    "            </md-list>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"app-user-area\" layout=\"row\" layout-align=\"center center\">\n" +
    "            <invitation-manager></invitation-manager>\n" +
    "            <div class=\"profile-status\" ng-click=\"vm.showPurchaseDialog()\">\n" +
    "                <div class=\"pending-purchase-icon-wrapper\" ng-if=\"vm.purchaseState === 'pending'\">\n" +
    "                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "            </div>\n" +
    "            <md-menu md-offset=\"-61 68\">\n" +
    "                <md-button ng-click=\"$mdOpenMenu($event); vm.znkOpenModal();\"\n" +
    "                           class=\"md-icon-button profile-open-modal-btn\"\n" +
    "                           aria-label=\"Open sample menu\">\n" +
    "                    <div>{{::vm.userProfile.username}}</div>\n" +
    "                    <md-icon class=\"material-icons\">{{vm.expandIcon}}</md-icon>\n" +
    "                </md-button>\n" +
    "                <md-menu-content class=\"md-menu-content-znk-header\">\n" +
    "                    <md-list>\n" +
    "                        <md-list-item class=\"header-modal-item header-modal-item-profile\">\n" +
    "                            <span class=\"username\">{{::vm.userProfile.username}}</span>\n" +
    "                            <span class=\"email\">{{::vm.userProfile.email}}</span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple class=\"header-modal-item header-modal-item-uppercase links purchase-status\">\n" +
    "                            <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "                            <span class=\"link-full-item\" ng-click=\"vm.showPurchaseDialog()\"></span>\n" +
    "                            <ng-switch on=\"vm.purchaseState\">\n" +
    "                                <div ng-switch-when=\"pending\" class=\"pending-purchase-icon-wrapper\">\n" +
    "                                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                                </div>\n" +
    "                                <div ng-switch-when=\"pro\" class=\"check-mark-wrapper\">\n" +
    "                                    <svg-icon name=\"check-mark\"></svg-icon>\n" +
    "                                </div>\n" +
    "                            </ng-switch>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <span ng-disabled=\"!vm.isOnBoardingCompleted\"\n" +
    "                                  disable-click-drv\n" +
    "                                  ng-click=\"vm.showGoalsEdit()\"\n" +
    "                                  translate=\".PROFILE_GOALS\"></span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <span ng-click=\"vm.showChangePassword()\" translate=\".PROFILE_CHANGE_PASSWORD\"></span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <a ui-sref=\"app.faq\">\n" +
    "                                <span translate=\".WHAT_IS_THE_ACT_TEST\"></span>\n" +
    "                            </a>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase links\">\n" +
    "                            <a ng-href=\"http://zinkerz.com/contact/\" target=\"_blank\">\n" +
    "                                <span translate=\".PROFILE_SUPPORT\"></span>\n" +
    "                            </a>\n" +
    "                        </md-list-item>\n" +
    "                        <div class=\"divider\"></div>\n" +
    "                        <md-list-item\n" +
    "                            md-ink-ripple\n" +
    "                            class=\"header-modal-item header-modal-item-uppercase logout\">\n" +
    "                            <span ng-click=\"vm.logout()\" translate=\".PROFILE_LOGOUT\"></span>\n" +
    "                        </md-list-item>\n" +
    "                    </md-list>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
