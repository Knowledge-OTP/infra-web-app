/* eslint object-shorthand: 0 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticExerciseController',
        function(ZnkExerciseSlideDirectionEnum, ZnkExerciseViewModeEnum, exerciseData, WorkoutsDiagnosticFlow, $location,
                  WORKOUTS_DIAGNOSTIC_FLOW, $log, $state, ExerciseResultSrv, ExerciseTypeEnum, $q, $timeout, ZnkExerciseUtilitySrv,
                  $rootScope, ExamTypeEnum, exerciseEventsConst, $filter, SubjectEnum, znkAnalyticsSrv, StatsEventsHandlerSrv) {
        'ngInject';
            var self = this;
            this.subjectId = exerciseData.questionsData.subjectId;
            // current section data
            var questions = exerciseData.questionsData.questions;
            var resultsData = exerciseData.resultsData;
            var numQuestionCounter = _getInitNumQuestion(exerciseData.resultsData.questionResults);
            var translateFilter = $filter('translate');
            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
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
            var nextQuestion;

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
                    var question = questions.filter(function (element) { return currentValue.questionId === element.id; })[0];
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
                    znkAnalyticsSrv.pageTrack({ props: { url: $location.url() + '/index/' + numQuestionCounter + '/questionId/' + (value.id || '') } });
                },
                onQuestionAnswered: function () {
                    $log.debug('WorkoutsDiagnosticExerciseController onQuestionAnswered: initial func');
                    self.actions.setSlideDirection(ZnkExerciseSlideDirectionEnum.LEFT.enum);
                    exerciseData.resultsData.$save();
                    if (!_isLastQuestion()) {
                        var isAnswerCorrectly = _isAnswerCorrect();
                        var currentIndex = _getCurrentIndex();
                        var newDifficulty = WorkoutsDiagnosticFlow.getDifficulty(currentDifficulty, isAnswerCorrectly,
                            self.resultsData.questionResults[currentIndex].timeSpent);
                        currentDifficulty = newDifficulty;
                        WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, self.resultsData.questionResults, newDifficulty, numQuestionCounter + 1, function (newQuestion) {
                            _handleNewSlide(newQuestion);
                        });
                    } else {
                        self.actions.forceDoneBtnDisplay(true);
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

            function _isLastSubject() {
                var isLastSubject = false;
                var sectionResultsKeys = Object.keys(exerciseData.examResult.sectionResults);
                if (sectionResultsKeys.length === exerciseData.exam.sections.length) {
                    var sectionsByOrder = exerciseData.exam.sections.sort(function (a, b) {
                        return a.order > b.order;
                    });
                    var lastSection = sectionsByOrder[sectionsByOrder.length - 1];
                    var lastIdStr = lastSection.id.toString();
                    var isMatchingLastSectionToResults = sectionResultsKeys.findIndex(function (element) { return element === lastIdStr; }) !== -1;
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
                } else {
                    return $q.when(false);
                }
            }

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

            function pushSlide(newQuestion) {
                self.resultsData.questionResults.push(newQuestion.result);
                self.resultsData.questionResults = angular.copy(self.resultsData.questionResults);
                self.questions.push(newQuestion.question);
                $log.debug('WorkoutsDiagnosticExerciseController pushSlide: push data', self.questionResults, self.questions);
            }

            function popSlide() {
                self.resultsData.questionResults.pop();
                self.resultsData.questionResults = angular.copy(self.resultsData.questionResults);
                self.questions.pop();
                $log.debug('WorkoutsDiagnosticExerciseController popSlide: pop data', self.questionResults, self.questions);
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

            this.onClickedQuit = function () {
                $log.debug('WorkoutsDiagnosticExerciseController: click on quit');
                $state.go('app.workouts.roadmap');
            };
    });
})(angular);

