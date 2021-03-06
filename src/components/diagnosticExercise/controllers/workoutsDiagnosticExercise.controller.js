/* eslint object-shorthand: 0 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticExerciseController',
        function (ZnkExerciseSlideDirectionEnum, ZnkExerciseViewModeEnum, exerciseData, WorkoutsDiagnosticFlow, $location,
                  $log, $state, ExerciseResultSrv, ExerciseTypeEnum, $q, $timeout, ZnkExerciseUtilitySrv,
                  $rootScope, ExamTypeEnum, exerciseEventsConst, $filter, SubjectEnum, StatsEventsHandlerSrv,
                  $translate, ExerciseReviewStatusEnum, CategoryService, MarketingStatusEnum) {
            'ngInject';
            var self = this;
            this.subjectId = (typeof exerciseData.questionsData.subjectId === 'undefined' || exerciseData.questionsData.subjectId === null) ?
                CategoryService.getCategoryLevel1ParentSync([exerciseData.questionsData.categoryId, exerciseData.questionsData.categoryId2])
                : exerciseData.questionsData.subjectId;
            // current section data
            var questions = exerciseData.questionsData.questions;
            var resultsData = exerciseData.resultsData;
            self.resultsForAudioManager = resultsData;
            var translateFilter = $filter('translate');
            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
            var nextQuestion;
            var shouldBroadCastExerciseProm = ZnkExerciseUtilitySrv.shouldBroadCastExercisePromFnGetter();

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
                exerciseData.resultsData.isReviewed = ExerciseReviewStatusEnum.YES.enum;
                exerciseData.resultsData.isComplete = true;
                exerciseData.resultsData.endedTime = Date.now();
                exerciseData.resultsData.subjectId = self.subjectId;
                exerciseData.resultsData.exerciseDescription = exerciseData.exam.name;
                exerciseData.resultsData.exerciseName = translateFilter('ZNK_EXERCISE.SECTION');
                var savePromise = exerciseData.resultsData.$save();
                exerciseData.exam.typeId = ExamTypeEnum.DIAGNOSTIC.enum;//  todo(igor): current diagnostic type is incorrect
                shouldBroadCastExerciseProm.then(function (shouldBroadcastFn) {
                    var shouldBroadcast = shouldBroadcastFn({
                        exercise: exerciseData.questionsData,
                        exerciseResult: exerciseData.resultsData,
                        exerciseParent: exerciseData.exam
                    });
                    if (shouldBroadcast) {
                        $rootScope.$broadcast(exerciseEventsConst.section.FINISH, exerciseData.questionsData, exerciseData.resultsData, exerciseData.exam);
                    }
                });
                StatsEventsHandlerSrv.addNewExerciseResult(ExerciseTypeEnum.SECTION.enum, exerciseData.questionsData, exerciseData.resultsData);
                return savePromise;
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
                return numQuestionCounter >= _getNumberOfQuestions();
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

            function _setHeaderTitle() {
                var subjectTranslateKey = 'SUBJECTS.' + 'DIAGNOSTIC_TITLE.' + self.subjectId;
                $translate(subjectTranslateKey).then(function (subjectTranslation) {
                    var translateFilter = $filter('translate');
                    self.headerTitle = translateFilter('WORKOUTS_DIAGNOSTIC_EXERCISE.HEADER_TITLE', {
                        subject: $filter('capitalize')(subjectTranslation)
                    });
                }, function (err) {
                    $log.error('WorkoutsDiagnosticIntroController: ' + err);
                });
            }

            _setNumSlideForNgModel(numQuestionCounter);

            if (SubjectEnum.READING) {
                if (self.subjectId === SubjectEnum.READING.enum) {     // adding passage title to reading questions
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
            }

            //  current slide data (should be initialize in every slide)
            var currentDifficulty = diagnosticSettings.levels.medium.num;
            var initSlideIndex;
            var mediumLevelNum = diagnosticSettings.levels.medium.num;

            ZnkExerciseUtilitySrv.setQuestionsGroupData(questions, exerciseData.questionsData.questionsGroupData, exerciseData.resultsData.playedAudioArticles);

            // init question and questionResults for znk-exercise
            if (!diagnosticSettings.isFixed) {
                WorkoutsDiagnosticFlow.initQuestionsByDifficultyAndOrder(exerciseData.questionsData.questions);

                if (resultsData.questionResults.length === 0) {
                    WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, mediumLevelNum, numQuestionCounter + 1, function (diagnosticFlowResults) {
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
                        WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, mediumLevelNum, numQuestionCounter + 1, function (diagnosticFlowResults) {
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
                    nextQuestion = void (0);
                    if (!_isLastQuestion()) {
                        numQuestionCounter = numQuestionCounter + 1;
                        _setNumSlideForNgModel(numQuestionCounter);
                        // znkAnalyticsSrv.pageTrack({props: {url: $location.url() + '/index/' + numQuestionCounter + '/questionId/' + (value.id || '')}});
                    } else {
                        self.actions.forceDoneBtnDisplay(true);
                    }
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
                        WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(exerciseData.questionsData.questions, newDifficulty, numQuestionCounter + 1, function (newQuestion) {
                            _handleNewSlide(newQuestion);
                        });
                    }
                },
                onDone: function () {
                    WorkoutsDiagnosticFlow.markSectionAsDoneToggle(true);
                    _onDoneSaveResultsData().then(function () {
                        _isLastSubject().then(function (isLastSubject) {
                            WorkoutsDiagnosticFlow.getMarketingToefl().then(function (marketingObj) {
                                if (marketingObj && marketingObj.status) {
                                    WorkoutsDiagnosticFlow.sendEvent('diagnostic', `done-questionId(${exerciseData.questionsData.id})-subjectId(${self.subjectId})-order(${exerciseData.questionsData.order})-isLastSubject(${isLastSubject})`, 'click', false);
                                }
                                // znkAnalyticsSrv.eventTrack({
                                //     eventName: 'diagnosticSectionCompleted',
                                //     questionsArr: exerciseData.resultsData.questionResults,
                                //     props: {
                                //         sectionId: exerciseData.questionsData.id,
                                //         order: exerciseData.questionsData.order,
                                //         subjectId: self.subjectId
                                //     }
                                // });
                                if (isLastSubject) {
                                    WorkoutsDiagnosticFlow.setDiagnosticComplete().then(()=>{
                                        if (marketingObj && marketingObj.status && marketingObj.status === MarketingStatusEnum.DIAGNOSTIC.enum) {
                                            WorkoutsDiagnosticFlow.sendEvent('diagnostic', `Diagnostic_End`, 'click', true);
                                            WorkoutsDiagnosticFlow.getGlobalVariables().then(function (globalVariable) {
                                                let selectedNum;
                                                let selectedStatus;
                                                if (globalVariable && globalVariable.abTesting) {
                                                    const abTestingNum = parseFloat(globalVariable.abTesting);
                                                    selectedNum = (abTestingNum < Math.random()) ? 1 : 0;
                                                } else { // in case the globalVariable or the abTesting is missing
                                                    selectedNum = 1;
                                                }
                                                selectedStatus = selectedNum ? MarketingStatusEnum.GET_EMAIL.enum : MarketingStatusEnum.PRE_PURCHASE.enum;
                                                var statusMsg = selectedNum ? 'Email_Path' : 'No_Email_Path';
                                                WorkoutsDiagnosticFlow.sendEvent('diagnostic', statusMsg, 'click', true);
                                                WorkoutsDiagnosticFlow.setMarketingToeflStatusAndAbTest(selectedNum, selectedStatus).then(function () {
                                                    $log.debug('WorkoutsDiagnosticExerciseController setMarketingToeflAbTestAndStatus: done');
                                                    _goToCurrentState(true);
                                                });
                                            });
                                        } else {
                                            _goToCurrentState(true);
                                        }
                                    });
                                    //
                                } else {
                                    if (marketingObj && marketingObj.status) {
                                        WorkoutsDiagnosticFlow.sendEvent('diagnostic', `Diagnostic_Section_End`, 'click', true);
                                    }
                                    _goToCurrentState();
                                }
                            });
                        });
                    });
                },
                initForceDoneBtnDisplay: false,
                initSlideIndex: initSlideIndex || 0,
                allowedTimeForExercise: 12 * 60 * 1000,
                toolBox: {
                    drawing: {
                        toucheColorId: 1,
                        exerciseDrawingPathPrefix: function () {
                            return exerciseData.resultsData.uid;
                        }
                    }
                }
            };

            self.questionsPerSubject = _getNumberOfQuestions();

            _setHeaderTitle();

            $rootScope.$on('$translateChangeSuccess', function () {
                _setHeaderTitle();
            });

            this.onClickedQuit = function () {
                $log.debug('WorkoutsDiagnosticExerciseController: click on quit');
                $state.go('app.workouts.roadmap');
            };
        });
})(angular);

