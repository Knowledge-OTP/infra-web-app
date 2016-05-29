(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic').service('WorkoutsDiagnosticFlow',
        function (WORKOUTS_DIAGNOSTIC_FLOW, $log, ExerciseTypeEnum, $q, ExamSrv, ExerciseResultSrv, znkAnalyticsSrv) {
        'ngInject';

        var currentSectionData = {};
        var countDifficultySafeCheckErrors = 0;
        var countQuestionsByDifficultyAndOrderErrors = 0;
        this.setCurrentQuestion = (questionId, index) => { currentSectionData.currentQuestion = { id: questionId, index: index }; };
        this.markSectionAsDoneToggle = (isDone) => { currentSectionData.done = isDone; };
        this.getCurrentSection = () => { return currentSectionData; };

        function _getDataProm() {
            var examId = WORKOUTS_DIAGNOSTIC_FLOW.diagnosticId;
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
            var veryEasyNumLevel = WORKOUTS_DIAGNOSTIC_FLOW.levels.very_easy.num;
            var veryHardNumLevel = WORKOUTS_DIAGNOSTIC_FLOW.levels.very_hard.num;
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

        this.getDiagnosticFlowCurrentState = function (flagForPreSummery, skipIntroBool) {
            $log.debug('WorkoutsDiagnosticFlow getDiagnosticFlowCurrentState: initial func', arguments);
            var currentState = { state: '', params: '', subjectId: '' };
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

        this.getQuestionsByDifficultyAndOrder = (questions, results, difficulty, order, cb, difficultyType = 'increment') => {
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
                _getDifficultySafeCheck(difficulty, difficultyType, (difficultySafe, type) => {
                    countQuestionsByDifficultyAndOrderErrors += 1;
                    if (countQuestionsByDifficultyAndOrderErrors < 10) {
                        this.getQuestionsByDifficultyAndOrder(questions, results, difficultySafe, order, cb, type);
                    }
                });
            } else {
                cb(diagnosticFlowResults);
            }
        };

        this.getDifficulty = function (currentDifficulty, isAnswerCorrectly, startedTime) {
            var newDifficulty;
            $log.debug('WorkoutsDiagnosticFlow getDifficulty: initial func', arguments);
            if (startedTime > WORKOUTS_DIAGNOSTIC_FLOW.timeLimit) {
                newDifficulty = currentDifficulty;
            } else if (isAnswerCorrectly) {
                newDifficulty = _getNextDifficulty(currentDifficulty, 'increment');
            } else {
                newDifficulty = _getNextDifficulty(currentDifficulty, 'decrement');
            }
            $log.debug('WorkoutsDiagnosticFlow getDifficulty: newDifficulty returned value', newDifficulty);
            return newDifficulty;
        };

        this.getLevels = function () {
            return WORKOUTS_DIAGNOSTIC_FLOW.levels;
        };

        this.getDiagnostic = function () {
            return ExerciseResultSrv.getExamResult(WORKOUTS_DIAGNOSTIC_FLOW.diagnosticId);
        };

        this.getDiagnosticExam = function () {
            return ExamSrv.getExam(WORKOUTS_DIAGNOSTIC_FLOW.diagnosticId);
        };

        this.getActiveSubject = () => {
            var activeSubject;
            var COMPLETED = 'all';
            var NO_ACTIVE_SUBJECT = 'none';

            var diagnosticProms = [this.getDiagnosticExam(), this.getDiagnostic()];
            return $q.all(diagnosticProms).then(function (diagnostic) {
                var diagnosticExam = diagnostic[0];
                var diagnosticResults = diagnostic[1];

                if (diagnosticResults.isComplete) return COMPLETED;

                var exerciseResultPromises = _getExerciseResultProms(diagnosticResults.sectionResults, WORKOUTS_DIAGNOSTIC_FLOW.diagnosticId);
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

        this.isDiagnosticCompleted = function () {
            return this.getDiagnostic().then(function (diagnostic) {
                return !!diagnostic.isComplete;
            });
        };
    });

})(angular);

