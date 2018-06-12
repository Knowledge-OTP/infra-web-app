(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').provider('WorkoutsDiagnosticFlow', [function () {

        var _diagnosticSettings;

        this.setDiagnosticSettings = function (diagnosticSettings) {
            _diagnosticSettings = diagnosticSettings;
        };
        this.$get = function (WORKOUTS_DIAGNOSTIC_FLOW, $log, ExerciseTypeEnum, $q, ExamSrv, ExerciseResultSrv,
                              znkAnalyticsSrv, $injector, CategoryService, ENV, $http, StorageSrv, InfraConfigSrv) {
            'ngInject';

            const reminderApi = `${ENV.znkBackendBaseUrl}/reminder`;
            var workoutsDiagnosticFlowObjApi = {};
            var currentSectionData = {};
            var questionsByOrderAndDifficultyArr = null;
            var currentState;

            workoutsDiagnosticFlowObjApi.getDiagnosticSettings = function () {
                var diagnosticData = $injector.invoke(_diagnosticSettings);
                return angular.extend(WORKOUTS_DIAGNOSTIC_FLOW, diagnosticData);
            };

            workoutsDiagnosticFlowObjApi.setCurrentQuestion = function (questionId, index) {
                currentSectionData.currentQuestion = {id: questionId, index: index};
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

            function _tryGetDifficulty(questionsByOrder) {
                var sortedDiagnosticKeys = Object.keys(diagnosticSettings.levels).sort(function (a, b) {
                    return diagnosticSettings.levels[a].num < diagnosticSettings.levels[b].num;
                });
                var selectedDifficulty = null;
                for (var i = 0; i < sortedDiagnosticKeys.length; i++) {
                    var key = sortedDiagnosticKeys[i];
                    var difficultyKey = diagnosticSettings.levels[key].num;
                    if (angular.isObject(questionsByOrder[difficultyKey])) {
                        selectedDifficulty = difficultyKey;
                        break;
                    }
                }
                return selectedDifficulty;
            }

            workoutsDiagnosticFlowObjApi.getDiagnosticFlowCurrentState = function (flagForPreSummery, skipIntroBool, forceSkipIntro) {
                $log.debug('WorkoutsDiagnosticFlow getDiagnosticFlowCurrentState: initial func', arguments);
                currentState = {state: '', params: '', subjectId: ''};
                var getDataProm = _getDataProm();
                return $q.all(getDataProm).then(function (results) {
                    if (!results[0]) {
                        $log.error('WorkoutsDiagnosticFlow getDiagnosticFlowCurrentState: crucial data is missing! getExamProm (results[0]): ' + results[0]);
                    }
                    var exam = results[0];
                    var examResults = results[1];

                    if (examResults.isComplete) {
                        if (flagForPreSummery) {
                            znkAnalyticsSrv.eventTrack({eventName: 'diagnosticEnd'});
                        }
                        currentState.state = flagForPreSummery ? '.preSummary' : '.summary';
                        return currentState;
                    }

                    if (!examResults.isStarted) {
                        znkAnalyticsSrv.eventTrack({eventName: 'diagnosticStart'});
                        znkAnalyticsSrv.timeTrack({eventName: 'diagnosticEnd'});
                        examResults.isStarted = true;
                        skipIntroBool = false;
                        examResults.$save();
                    }

                    skipIntroBool = forceSkipIntro ? forceSkipIntro : false;

                    var exerciseResultPromises = _getExerciseResultProms(examResults.sectionResults, exam.id);

                    return $q.all(exerciseResultPromises).then(function (exerciseResult) {
                        var stateResults = _getStateDataByExamAndExerciseResult(exam, exerciseResult);
                        var currentQuestionResults = stateResults.currentQuestionResults;
                        var currentSection = stateResults.currentSection;
                        currentState.subjectId = (typeof currentSection.subjectId === 'undefined' || currentSection.subjectId === null) ?
                            CategoryService.getCategoryLevel1ParentByIdSync(currentSection.categoryId) : currentSection.subjectId;

                        if (angular.isUndefined(currentQuestionResults) && !skipIntroBool) {
                            currentState.state = '.intro';
                            currentState.params = {
                                id: exam.id,
                                subjectId: currentState.subjectId,
                                sectionId: currentSection.id,
                                order: currentSection.order
                            };
                        } else {
                            currentState.state = '.exercise';
                            currentState.params = {id: exam.id, sectionId: currentSection.id};
                        }
                        return currentState;
                    });
                });
            };


            /**
             * get Question By Difficulty And Order
             * @function
             * @param difficulty
             * @param order
             * @param cb
             */
            workoutsDiagnosticFlowObjApi.getQuestionsByDifficultyAndOrder = function (questions, difficulty, order, cb) {
                $log.debug('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: initial func', arguments);
                var diagnosticFlowResults = {};

                //in case initQuestionsByDifficultyAndOrder function was not called.
                if (!questionsByOrderAndDifficultyArr) {
                    $log.debug('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: questionsByOrderAndDifficultyArr is null, calling initQuestionsByDifficultyAndOrder function');
                    workoutsDiagnosticFlowObjApi.initQuestionsByDifficultyAndOrder(questions);
                }
                if (!questionsByOrderAndDifficultyArr || (angular.isArray(questionsByOrderAndDifficultyArr) && questionsByOrderAndDifficultyArr.length === 0)) {
                    $log.error('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: questionsByOrderAndDifficultyArr is empty or not initialized.');
                    return;
                }
                var question = null;
                if (questionsByOrderAndDifficultyArr[order]) {
                    if (questionsByOrderAndDifficultyArr[order][difficulty]) {
                        question = questionsByOrderAndDifficultyArr[order][difficulty];
                    }
                    //could not find question by difficulty
                    else {
                        $log.error('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: questionsByOrderAndDifficultyArr has no difficulty key:' + difficulty);
                        //try find new difficulty
                        var newDifficulty = _tryGetDifficulty(questionsByOrderAndDifficultyArr[order]);
                        if (newDifficulty !== null) {
                            question = questionsByOrderAndDifficultyArr[order][newDifficulty];
                        }
                        //did not find a new difficulty, return
                        else {
                            $log.error('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: _getDifficultySafeCheck could not find new difficulty.');
                            return;
                        }
                    }
                }
                //could not find question by order, return
                else {
                    $log.error('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: questionsByOrderAndDifficultyArr has no order key:' + order);
                    return;
                }
                diagnosticFlowResults.question = question;
                diagnosticFlowResults.result = {
                    questionId: question.id,
                    categoryId: question.categoryId,
                    categoryId2: question.categoryId2,
                    difficulty: question.difficulty
                };
                if (cb && angular.isFunction(cb)) {
                    cb(diagnosticFlowResults);
                }
                else {
                    $log.error('WorkoutsDiagnosticFlow getQuestionsByDifficultyAndOrder: no callback function passed as argument');
                }
            };
            /**
             * init Question map object By Difficulty And Order
             * @function
             * @param questions
             */
            workoutsDiagnosticFlowObjApi.initQuestionsByDifficultyAndOrder = function (questions) {
                if (!angular.isArray(questions) || questions.length === 0) {
                    $log.error('WorkoutsDiagnosticFlow initQuestionsByDifficultyAndOrder: questions array is empty or not defined');
                    return;
                }
                questionsByOrderAndDifficultyArr = [];
                angular.forEach(questions, function (question) {
                    questionsByOrderAndDifficultyArr[question.order] = questionsByOrderAndDifficultyArr[question.order] || {};

                    var questionByOrderObj = questionsByOrderAndDifficultyArr[question.order];

                    questionByOrderObj[question.difficulty] = questionByOrderObj[question.difficulty] || {};
                    questionByOrderObj[question.difficulty] = question;

                    if (!questionByOrderObj.maxDifficultyQuestion || questionByOrderObj.maxDifficultyQuestion.difficulty < question.difficulty) {
                        questionByOrderObj.maxDifficultyQuestion = question;
                    }

                    return questionsByOrderAndDifficultyArr;
                });
                angular.forEach(questionsByOrderAndDifficultyArr, function (questionByOrder) {
                    Object.keys(diagnosticSettings.levels).forEach(function (key) {
                        var difficulty = diagnosticSettings.levels[key].num;
                        if (!questionByOrder[difficulty]) {
                            questionByOrder[difficulty] = questionByOrder.maxDifficultyQuestion;
                        }
                    });
                });
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
            workoutsDiagnosticFlowObjApi.getMarketingToeflByStatus = function (marketingStatus) {
                return workoutsDiagnosticFlowObjApi.getMarketingToefl().then(function (marketingObj) {
                    return !!marketingObj && !!marketingObj.status && marketingObj.status === marketingStatus;
                });
            };
            workoutsDiagnosticFlowObjApi.getMarketingToefl = function () {
                var marketingPath = StorageSrv.variables.appUserSpacePath + `/marketing`;
                return InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    return studentStorage.get(marketingPath).then(function (marketing) {
                        return marketing;
                    });
                });
            };
            workoutsDiagnosticFlowObjApi.setMarketingToeflStatusAndAbTest = function (abTest, status) {
                var marketingPath = StorageSrv.variables.appUserSpacePath + `/marketing`;
                var data = {
                    [marketingPath + '/abTesting']: abTest,
                    [marketingPath + '/status']: status
                };
                return InfraConfigSrv.getStudentStorage().then(function (studentStorage) {
                    return studentStorage.update(data).then(function (status) {
                        return status;
                    });
                });
            };

            workoutsDiagnosticFlowObjApi.getGlobalVariables = function () {
                var globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
                return $http.get(`${globalBackendUrl}`, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(globalVariables => globalVariables.data)
                    .catch((err) => $log.error('getGlobalVariables: Failed to get global variables. Error: ', err));
            };
            workoutsDiagnosticFlowObjApi.setReminder = (serviceId, uid, userTimeout, email) => {
                const setReminderApi = `${reminderApi}/setReminder`;
                return $http.post(setReminderApi, {serviceId, uid, userTimeout, email})
                    .then(reminder => reminder.data)
                    .catch((err) => $log.error('workoutsDiagnosticFlowObjApi.setReminder: Failed to setReminder. Error: ', err));
            };

            return workoutsDiagnosticFlowObjApi;
        };
    }]);

})(angular);

