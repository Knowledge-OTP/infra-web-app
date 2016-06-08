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
    ]).config(function(SvgIconSrvProvider) {
        var svgMap = {
            'diagnostic-dropdown-arrow-icon': 'components/diagnosticExercise/svg/dropdown-arrow.svg',
            'diagnostic-check-mark': 'components/diagnosticExercise/svg/check-mark-icon.svg',
            'diagnostic-flag-icon': 'components/diagnosticExercise/svg/flag-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.diagnostic', {
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
                            'ngInject';
                            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                            var examId = WorkoutsDiagnosticFlow.getDiagnosticSettings().diagnosticId;
                            var sectionId = WorkoutsDiagnosticFlow.getCurrentState().params.id;
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
                .state('app.diagnostic.preSummary', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticPreSummary.template.html',
                    controller: ['$timeout', '$state', function ($timeout, $state) {
                        var VIDEO_DURATION = 6000;
                        $timeout(function () {
                            $state.go('diagnostic.summary');
                        }, VIDEO_DURATION);
                    }],
                    controllerAs: 'vm'
                })
                .state('app.diagnostic.summary', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticSummary.template.html',
                    controller: 'WorkoutsDiagnosticSummaryController',
                    controllerAs: 'vm',
                    resolve: {
                        diagnosticSummaryData: ['EstimatedScoreSrv', 'UserGoalsService', '$q', 'WorkoutsDiagnosticFlow', 'ScoringService', '$log',
                            function (EstimatedScoreSrv, UserGoalsService, $q, WorkoutsDiagnosticFlow, ScoringService, $log) {
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

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticController', function($state, currentState, $translatePartialLoader) {
        'ngInject';

        var EXAM_STATE = 'app.diagnostic';

        $translatePartialLoader.addPart('diagnosticExercise');

        $state.go(EXAM_STATE + currentState.state, currentState.params);
    });
})(angular);


/* eslint object-shorthand: 0 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticExerciseController',
        function (ZnkExerciseSlideDirectionEnum, ZnkExerciseViewModeEnum, exerciseData, WorkoutsDiagnosticFlow, $location,
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
                    if (isUndefinedUserAnswer.length === 0) {
                        num = questionResults.length;
                    } else {
                        num = questionResults.length - 1;
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

            function _isLastQuestion() {
                return numQuestionCounter === diagnosticSettings.questionsPerSubject;
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

            this.onClickedQuit = function () {
                $log.debug('WorkoutsDiagnosticExerciseController: click on quit');
                $state.go('app.workoutsRoadmap');
            };
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticIntroController',
        function(WORKOUTS_DIAGNOSTIC_FLOW, $log, $state, WorkoutsDiagnosticFlow, znkAnalyticsSrv) {
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
                        sectionId: vm.params.id,
                        order: vm.params.order,
                        subjectId: vm.params.subjectId
                    }
                });
                znkAnalyticsSrv.timeTrack({ eventName: 'diagnosticSectionCompleted' });
                $state.go('app.diagnostic.exercise', { id: vm.diagnosticId, sectionId: vm.params.id });
            };
    });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticSummaryController',
        function(diagnosticSummaryData, SubjectEnum, SubjectEnumConst, WorkoutsDiagnosticFlow) {
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
    });
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.diagnosticExercise').service('diagnosticSrv', [function () {

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

        this.$get = ['WORKOUTS_DIAGNOSTIC_FLOW', '$log', 'ExerciseTypeEnum', '$q', 'ExamSrv', 'ExerciseResultSrv', 'znkAnalyticsSrv',
            function (WORKOUTS_DIAGNOSTIC_FLOW, $log, ExerciseTypeEnum, $q, ExamSrv, ExerciseResultSrv, znkAnalyticsSrv) {
            var workoutsDiagnosticFlowObjApi = {};
            var currentSectionData = {};
            var countDifficultySafeCheckErrors = 0;
            var countQuestionsByDifficultyAndOrderErrors = 0;
            var currentState;

            workoutsDiagnosticFlowObjApi.getDiagnosticSettings = function() {
                return angular.extend(_diagnosticSettings, WORKOUTS_DIAGNOSTIC_FLOW);
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
                    currentQuestionResults,
                    currentSection
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
                            currentState.params = { id: currentSection.id, subjectId: currentSection.subjectId, order: currentSection.order };
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
    "    total-slide-num=\"4\"></znk-exercise-header>\n" +
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
    "    <button autofocus tabindex=\"1\" class=\"md-button md primary\" ng-click=\"vm.goToExercise()\" translate=\"{{::vm.buttonTitle}}\" aria-label=\"{{::vm.buttonTitle}}\">\n" +
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
    "               poster=\"diagnosticExercise/assets/images/poster/diagnostic-pre-summary.png\">\n" +
    "            <source src=\"diagnosticExercise/assets/videos/hoping-raccoon.mp4\" type=\"video/mp4\">\n" +
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
    "                    <div class=\"white-bg-doughnut-score\">{{doughnut.score}}</div>\n" +
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
    "            class=\"start-button md-button primary md\"\n" +
    "            ui-sref=\"app.workoutsRoadmap.diagnostic\"\n" +
    "            translate=\".DONE\">DONE\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
}]);
