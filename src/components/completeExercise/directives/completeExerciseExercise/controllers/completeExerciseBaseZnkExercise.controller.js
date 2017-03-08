(function (angular) {
    'use strict';

    /**
     *   settings:
     *      exerciseContent:
     *      exerciseResult:
     *      actions:{
     *          done: invoked once user finished the exercise
     *      }
     *
     *
     *  return controller with following prop:
     *      exerciseContent
     *      exerciseResult
     *
     * */
    angular.module('znk.infra-web-app.completeExercise').controller('CompleteExerciseBaseZnkExerciseCtrl',
        function (settings, ExerciseTypeEnum, ZnkExerciseUtilitySrv, ZnkExerciseViewModeEnum, $q, $translate, PopUpSrv,
            $log, znkAnalyticsSrv, ZnkExerciseSrv, exerciseEventsConst, StatsEventsHandlerSrv, $rootScope, $location, ENV,
            UtilitySrv, ExerciseCycleSrv, ExerciseReviewStatusEnum, znkSessionDataSrv, CategoryService) {
            'ngInject';

            var exerciseContent = settings.exerciseContent;
            var exerciseResult = settings.exerciseResult;
            var exerciseParentContent = settings.exerciseParentContent;
            var exerciseTypeId = exerciseResult.exerciseTypeId;
            var exerciseParentTypeId = settings.exerciseParentTypeId;

            var isNotLecture = exerciseTypeId !== ExerciseTypeEnum.LECTURE.enum;

            var shouldBroadCastExerciseProm = ZnkExerciseUtilitySrv.shouldBroadCastExercisePromFnGetter();

            var $ctrl = this;

            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
            var initSlideIndex;

            $ctrl.exeriseSubjectId = exerciseResult.subjectId;

            function _setExerciseResult() {
                var isQuestionsArrEmpty = !angular.isArray(exerciseResult.questionResults) || !exerciseResult.questionResults.length;
                if (isNotLecture && isQuestionsArrEmpty) {
                    exerciseResult.questionResults = exerciseContent.questions.map(function (question) {
                        var questionCategoriesForSubject = [question.categoryId, question.categoryId2];
                        return {
                            questionId: question.id,
                            categoryId: question.categoryId,
                            categoryId2: question.categoryId2,
                            manualEvaluation: question.manualEvaluation || false,
                            order: question.index,
                            answerTypeId: question.answerTypeId,
                            difficulty: question.difficulty,
                            correctAnswerId: question.correctAnswerId,
                            questionFormatId: question.questionFormatId,
                            subjectId: $ctrl.exeriseSubjectId ? $ctrl.exeriseSubjectId : CategoryService.getCategoryLevel1ParentSync(questionCategoriesForSubject)
                        };
                    });
                }

                exerciseResult.exerciseName = exerciseContent.name;
                exerciseResult.totalQuestionNum = (exerciseTypeId === ExerciseTypeEnum.LECTURE.enum ? 0 : exerciseContent.questions.length);
                exerciseResult.calculator = exerciseContent.calculator;
                exerciseResult.timePreference = exerciseContent.timePreference;
                exerciseResult.categoryId = exerciseContent.categoryId;
                exerciseResult.testScoreId = exerciseContent.testScoreId;
                exerciseResult.moduleId = !exerciseResult.moduleId ? exerciseContent.moduleId : exerciseResult.moduleId;
                exerciseResult.time = exerciseContent.time;
                exerciseResult.exerciseOrder = settings.exerciseDetails.exerciseOrder;

                if (exerciseParentTypeId) {
                    exerciseResult.parentTypeId = exerciseParentTypeId;
                }
                if (exerciseParentContent) {
                    exerciseResult.parentName = exerciseParentContent.name;
                }

                if (angular.isUndefined(exerciseResult.startedTime)) {
                    exerciseResult.startedTime = Date.now();
                }

                if(exerciseContent.categoryId2) {
                    exerciseResult.categoryId2 = exerciseContent.categoryId2;
                }
            }

            function _setExerciseContentQuestions() {
                if (isNotLecture) {
                    exerciseContent.questions = exerciseContent.questions.sort(function (a, b) {
                        return a.order - b.order;
                    });

                    if (exerciseContent.moduleId) {
                        var questionsOrderMap = {};
                        var questions = exerciseContent.questions;
                        for (var k = 0; k < questions.length; k++) {
                            if (angular.isUndefined(questionsOrderMap[questions[k].order])) {
                                questionsOrderMap[questions[k].order] = questions[k];
                            } else {
                                if (questionsOrderMap[questions[k].order].difficulty < questions[k].difficulty) {
                                    questionsOrderMap[questions[k].order] = questions[k];
                                }
                            }
                        }

                        var sortedQuestionsByDifficulty = UtilitySrv.object.convertToArray(questionsOrderMap);
                        sortedQuestionsByDifficulty = sortedQuestionsByDifficulty.sort(function (a, b) {
                            return a.order - b.order;
                        });

                        exerciseContent.questions = sortedQuestionsByDifficulty;
                    }

                    ZnkExerciseUtilitySrv.setQuestionsGroupData(
                        exerciseContent.questions,
                        exerciseContent.questionsGroupData
                    );
                } else {
                    exerciseContent.content.sort(function (item1, item2) {
                        return item1.order - item2.order;
                    });
                    for (var i = 0; i < exerciseContent.content.length; i++) {
                        exerciseContent.content[i].exerciseTypeId = exerciseTypeId;
                        exerciseContent.content[i].id = exerciseTypeId + '_' + exerciseContent.id + '_' + exerciseContent.content[i].order; // mandatory for drawing tool
                    }
                    exerciseContent.questions = exerciseContent.content; // lecture question type has content property instead of questions.
                }
            }

            function _finishExercise() {
                znkSessionDataSrv.isActiveLiveSession().then(function (liveSessionData) {
                    if (exerciseResult.exerciseTypeId !== ExerciseTypeEnum.LECTURE.enum) {
                        var liveSessionOn = !angular.equals(liveSessionData, {});
                        if (ENV.testToTakeExamId && ENV.testToTakeExamId !==  null) {
                            exerciseResult.isReviewed = ExerciseReviewStatusEnum.YES.enum;
                        } else if (angular.isUndefined(exerciseResult.isReviewed) && liveSessionOn) {
                            exerciseResult.isReviewed = ExerciseReviewStatusEnum.DONE_TOGETHER.enum;
                        } else {
                            exerciseResult.isReviewed = ExerciseReviewStatusEnum.NO.enum;
                        }

                        //  stats exercise data
                        StatsEventsHandlerSrv.addNewExerciseResult(exerciseTypeId, exerciseContent, exerciseResult).then(function () {
                            $ctrl.settings.viewMode = ZnkExerciseViewModeEnum.REVIEW.enum;
                            var exerciseParentIsSectionOnly = isSection ? exerciseParentContent : undefined;

                            shouldBroadCastExerciseProm.then(function (shouldBroadcastFn) {
                                var shouldBroadcast = shouldBroadcastFn({
                                    exercise: exerciseContent,
                                    exerciseResult: exerciseResult,
                                    exerciseParent: exerciseParentIsSectionOnly
                                });

                                if (shouldBroadcast) {
                                    var exerciseTypeValue = ExerciseTypeEnum.getValByEnum(exerciseTypeId).toLowerCase();
                                    var broadcastEventName = exerciseEventsConst[exerciseTypeValue].FINISH;
                                    $rootScope.$broadcast(broadcastEventName, exerciseContent, exerciseResult, exerciseParentIsSectionOnly);
                                    ExerciseCycleSrv.invoke('afterBroadcastFinishExercise', settings);
                                }
                            });

                            settings.actions.done();
                        });
                    } else {
                        exerciseResult.isReviewed = ExerciseReviewStatusEnum.YES.enum;
                    }
                    exerciseResult.isComplete = true;
                    exerciseResult.endedTime = Date.now();
                    exerciseResult.$save();
                });
            }

            function _getNumOfUnansweredQuestions(questionsResults) {
                if (!questionsResults) {
                    return false;
                }
                var numOfUnansweredQuestions = questionsResults.length;
                var keysArr = Object.keys(questionsResults);
                angular.forEach(keysArr, function (i) {
                    var questionAnswer = questionsResults[i];
                    if (angular.isDefined(questionAnswer.userAnswer)) {
                        numOfUnansweredQuestions--;
                    }
                });
                return numOfUnansweredQuestions;
            }

            var _setZnkExerciseSettings = (function () {
                function _getAllowedTimeForExercise() {
                    if (!isNotLecture) {
                        return null;
                    }

                    if (isSection) {
                        return exerciseContent.time;
                    }

                    var allowedTimeForQuestion = ZnkExerciseSrv.getAllowedTimeForQuestion(exerciseTypeId);
                    return allowedTimeForQuestion * exerciseContent.questions.length;
                }

                return function () {
                    var viewMode;

                    if (exerciseResult.isComplete) {
                        viewMode = ZnkExerciseViewModeEnum.REVIEW.enum;
                        initSlideIndex = 0;
                    } else {
                        viewMode = isSection ? ZnkExerciseViewModeEnum.ONLY_ANSWER.enum : ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum;
                    }

                    if (isNotLecture) {
                        var questionResultsMap = UtilitySrv.array.convertToMap(exerciseResult.questionResults, 'questionId');
                        initSlideIndex = exerciseContent.questions.findIndex(function (question) {
                            var questionResult = questionResultsMap[question.id];
                            return !questionResult || angular.isUndefined(questionResult.userAnswer);
                        });

                        if (initSlideIndex === -1) {
                            initSlideIndex = 0;
                        }
                    } else {
                        initSlideIndex = 0;
                    }

                    var defExerciseSettings = {
                        onDone: function onDone() {
                            if (!isNotLecture) {
                                settings.actions.exitAction();
                                return;
                            }
                            var numOfUnansweredQuestions = _getNumOfUnansweredQuestions(exerciseResult.questionResults);

                            var areAllQuestionsAnsweredProm = $q.when(true);
                            if (numOfUnansweredQuestions) {
                                var contentProm = $translate('COMPLETE_EXERCISE.SOME_ANSWER_LEFT_CONTENT');
                                var titleProm = $translate('COMPLETE_EXERCISE.FINISH_TITLE');
                                var buttonGoToProm = $translate('COMPLETE_EXERCISE.GO_TO_SUMMARY_BTN');
                                var buttonStayProm = $translate('COMPLETE_EXERCISE.STAY_BTN');

                                areAllQuestionsAnsweredProm = $q.all([contentProm, titleProm, buttonGoToProm, buttonStayProm]).then(function (results) {
                                    var content = results[0];
                                    var title = results[1];
                                    var buttonGoTo = results[2];
                                    var buttonStay = results[3];
                                    return PopUpSrv.warning(title, content, buttonGoTo, buttonStay).promise;
                                }, function (err) {
                                    $log.error(err);
                                });
                            }
                            areAllQuestionsAnsweredProm.then(function () {
                                _finishExercise();
                            });
                        },
                        onQuestionAnswered: function onQuestionAnswered() {
                            exerciseResult.$save();
                        },
                        onSlideChange: function (currQuestion, currentIndex) {
                            var indexPlusOne = currentIndex + 1;
                            znkAnalyticsSrv.pageTrack({
                                props: {
                                    url: $location.url() + '/index/' + indexPlusOne + '/questionId/' + (currQuestion.id || '')
                                }
                            });
                        },
                        onExit: function () {
                            if (viewMode !== ZnkExerciseViewModeEnum.REVIEW.enum) {

                                exerciseResult.$save();
                            }
                        },
                        viewMode: viewMode,
                        initSlideIndex: initSlideIndex || 0,
                        allowedTimeForExercise: _getAllowedTimeForExercise(),
                        toolBox: {
                            drawing: {
                                exerciseDrawingPathPrefix: exerciseResult.uid,
                                toucheColorId: ENV.appContext === 'student' ? 1 : 2
                            }
                        },
                        onReview: function onReview () {
                            exerciseResult.isReviewed = ExerciseReviewStatusEnum.YES.enum;
                            var saveProm=exerciseResult.$save();
                            saveProm.then(function(){
                                if (angular.isFunction(settings.actions.reviewAction)){
                                    settings.actions.reviewAction();
                                }
                            })
                            .catch(function (err){
                                $log.error('CompleteExerciseBaseZnkExerciseCtrl: failed to save results,' + err);
                            });
                        }
                    };

                    $ctrl.settings = angular.extend(defExerciseSettings, settings.znkExerciseSettings || {});
                };
            })();

            function _init() {
                _setExerciseContentQuestions();

                _setExerciseResult();

                _setZnkExerciseSettings();

                $ctrl.exerciseContent = exerciseContent;
                $ctrl.exerciseResult = exerciseResult;
                $ctrl._finishExercise = _finishExercise;
                $ctrl._getNumOfUnansweredQuestions = _getNumOfUnansweredQuestions;
            }

            _init();
        }
    );
})(angular);
