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
        function (settings, ExerciseTypeEnum, ZnkExerciseUtilitySrv, ZnkExerciseViewModeEnum, $q, $translate, PopUpSrv, $log, znkAnalyticsSrv, ZnkExerciseSrv, exerciseEventsConst, StatsEventsHandlerSrv, $rootScope, $location) {
            'ngInject';

            var exerciseContent = settings.exerciseContent;
            var exerciseResult = settings.exerciseResult;
            var exerciseTypeId = exerciseResult.exerciseTypeId;

            var $ctrl = this;

            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
            var initSlideIndex;

            function _getAllowedTimeForExercise() {
                if (exerciseTypeId === ExerciseTypeEnum.SECTION.enum) {
                    return exerciseContent.time;
                }

                var allowedTimeForQuestion = ZnkExerciseSrv.getAllowedTimeForQuestion(exerciseTypeId);
                return allowedTimeForQuestion * exerciseContent.questions.length;
            }

            function _setExerciseResult() {
                if (!angular.isArray(exerciseResult.questionResults) || exerciseResult.questionResults.length === 0) {
                    exerciseResult.questionResults = exerciseContent.questions.map(function (question) {
                        return {
                            questionId: question.id,
                            categoryId: question.categoryId
                        };
                    });
                }

                if (angular.isUndefined(exerciseResult.startedTime)) {
                    exerciseResult.startedTime = Date.now();
                }
            }

            function _setExerciseContentQuestions() {
                exerciseContent.questions = exerciseContent.questions.sort(function (a, b) {
                    return a.order - b.order;
                });

                ZnkExerciseUtilitySrv.setQuestionsGroupData(
                    exerciseContent.questions,
                    exerciseContent.questionsGroupData
                );
            }

            var _setZnkExerciseSettings = (function () {
                function getNumOfUnansweredQuestions(questionsResults) {
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

                function _finishExercise() {
                    exerciseResult.isComplete = true;
                    exerciseResult.endedTime = Date.now();
                    exerciseResult.$save();

                    //  stats exercise data
                    StatsEventsHandlerSrv.addNewExerciseResult(exerciseTypeId, exerciseContent, exerciseResult).then(function () {
                        $ctrl.settings.viewMode = ZnkExerciseViewModeEnum.REVIEW.enum;

                        var exerciseTypeValue = ExerciseTypeEnum.getValByEnum(exerciseTypeId).toLowerCase();
                        var broadcastEventName = exerciseEventsConst[exerciseTypeValue].FINISH;
                        $rootScope.$broadcast(broadcastEventName, exerciseContent, exerciseResult);

                        settings.actions.done();
                    });
                }

                return function () {
                    var viewMode;

                    if (exerciseResult.isComplete) {
                        viewMode = ZnkExerciseViewModeEnum.REVIEW.enum;
                        initSlideIndex = 0;
                    } else {
                        viewMode = isSection ? ZnkExerciseViewModeEnum.ONLY_ANSWER.enum : ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum;
                        initSlideIndex = exerciseResult.questionResults.findIndex(function (question) {
                            return !question.userAnswer;
                        });

                        if (initSlideIndex === -1) {
                            initSlideIndex = 0;
                        }
                    }

                    var defExerciseSettings = {
                        onDone: function onDone() {
                            var numOfUnansweredQuestions = getNumOfUnansweredQuestions(exerciseResult.questionResults);

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
                                _finishExercise(exerciseResult);
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
                        viewMode: viewMode,
                        initSlideIndex: initSlideIndex || 0,
                        allowedTimeForExercise: _getAllowedTimeForExercise()
                    };

                    $ctrl.settings = defExerciseSettings;
                };
            })();

            function _init() {
                _setExerciseResult();

                _setExerciseContentQuestions();

                _setZnkExerciseSettings();

                $ctrl.exerciseContent = exerciseContent;
                $ctrl.exerciseResult = exerciseResult;
            }

            _init();
            // if (angular.isUndefined(exerciseResult.startedTime)) {
            //     exerciseResult.startedTime = Date.now();
            // }
            //
            // exerciseData.exercise.questions = exerciseData.exercise.questions.sort(function (a, b) {
            //     return a.order - b.order;
            // });
            //
            // if (!angular.isArray(exerciseResult.questionResults) || exerciseResult.questionResults.length === 0) {
            //     exerciseResult.questionResults = exercise.questions.map(function (question) {
            //         return {
            //             questionId: question.id,
            //             categoryId: question.categoryId
            //         };
            //     });
            // }
            //
            // ZnkExerciseUtilitySrv.setQuestionsGroupData(exercise.questions, exercise.questionsGroupData);
            //
            // $scope.baseZnkExerciseCtrl.exercise = exercise;
            // $scope.baseZnkExerciseCtrl.resultsData = exerciseResult;
            // $scope.baseZnkExerciseCtrl.numberOfQuestions = $scope.baseZnkExerciseCtrl.exercise.questions.length;
            //
            // var viewMode;
            // if (exerciseResult.isComplete) {
            //     viewMode = ZnkExerciseViewModeEnum.REVIEW.enum;
            //     initSlideIndex = 0;
            // } else {
            //     viewMode = isSection ? ZnkExerciseViewModeEnum.ONLY_ANSWER.enum : ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum;
            //     initSlideIndex = exerciseResult.questionResults.findIndex(function (question) {
            //         return !question.userAnswer;
            //     });
            //
            //     if (initSlideIndex === -1) {
            //         initSlideIndex = 0;
            //     }
            // }
            //
            // var defExerciseSettings = {
            //     onDone: function onDone() {
            //         var numOfUnansweredQuestions = getNumOfUnansweredQuestions(exerciseResult.questionResults);
            //
            //         var areAllQuestionsAnsweredProm = $q.when(true);
            //         if (numOfUnansweredQuestions) {
            //             var contentProm = $translate('ZNK_EXERCISE.SOME_ANSWER_LEFT_CONTENT');
            //             var titleProm = $translate('ZNK_EXERCISE.FINISH_TITLE');
            //             var buttonGoToProm = $translate('ZNK_EXERCISE.GO_TO_SUMMARY_BTN');
            //             var buttonStayProm = $translate('ZNK_EXERCISE.STAY_BTN');
            //
            //             areAllQuestionsAnsweredProm = $q.all([contentProm, titleProm, buttonGoToProm, buttonStayProm]).then(function (results) {
            //                 var content = results[0];
            //                 var title = results[1];
            //                 var buttonGoTo = results[2];
            //                 var buttonStay = results[3];
            //                 return PopUpSrv.warning(title, content, buttonGoTo, buttonStay).promise;
            //             }, function (err) {
            //                 $log.error(err);
            //             });
            //         }
            //         areAllQuestionsAnsweredProm.then(function () {
            //             _finishExercise(exerciseResult);
            //         });
            //     },
            //     onQuestionAnswered: function onQuestionAnswered() {
            //         exerciseResult.$save();
            //     },
            //     onSlideChange: function (currQuestion, currentIndex) {
            //         var indexPlusOne = currentIndex + 1;
            //         znkAnalyticsSrv.pageTrack({
            //             props: {
            //                 url: $location.url() + '/index/' + indexPlusOne + '/questionId/' + (currQuestion.id || '')
            //             }
            //         });
            //         $scope.baseZnkExerciseCtrl.currentIndex = indexPlusOne;
            //     },
            //     viewMode: viewMode,
            //     initSlideIndex: initSlideIndex || 0,
            //     allowedTimeForExercise: _getAllowedTimeForExercise()
            // };
            //


            // $scope.baseZnkExerciseCtrl.settings = angular.extend(defExerciseSettings, exerciseSettings);
            // $scope.baseZnkExerciseCtrl.settings.onExerciseReady = function () {
            //     if (exerciseSettings.onExerciseReady) {
            //         exerciseSettings.onExerciseReady();
            //     }
            // };
            //
            // $scope.baseZnkExerciseCtrl.startTime = exerciseResult.duration || 0;
            // $scope.baseZnkExerciseCtrl.maxTime = exercise.time;
            //
            // $scope.baseZnkExerciseCtrl.timerData = {
            //     timeLeft: exercise.time - (exerciseResult.duration || 0),
            //     config: {
            //         countDown: true
            //     }
            // };
            //
            // $scope.baseZnkExerciseCtrl.onFinishTime = function () {
            //     var contentProm = $translate('ZNK_EXERCISE.TIME_UP_CONTENT');
            //     var titleProm = $translate('ZNK_EXERCISE.TIME_UP_TITLE');
            //     var buttonFinishProm = $translate('ZNK_EXERCISE.STOP');
            //     var buttonContinueProm = $translate('ZNK_EXERCISE.CONTINUE_BTN');
            //
            //     $q.all([contentProm, titleProm, buttonFinishProm, buttonContinueProm]).then(function (results) {
            //         var content = results[0];
            //         var title = results[1];
            //         var buttonFinish = results[2];
            //         var buttonContinue = results[3];
            //         var timeOverPopupPromise = PopUpSrv.ErrorConfirmation(title, content, buttonFinish, buttonContinue).promise;
            //
            //         timeOverPopupPromise.then(function () {
            //             _finishExercise(exerciseResult);
            //         });
            //     });
            // };
            //
            // $scope.baseZnkExerciseCtrl.onChangeTime = function (passedTime) {
            //     exerciseResult.duration = passedTime;
            // };
        }
    );
})(angular);
