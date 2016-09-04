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
                  $log, znkAnalyticsSrv, ZnkExerciseSrv, exerciseEventsConst, StatsEventsHandlerSrv, $rootScope, $location, ENV) {
            'ngInject';

            var exerciseContent = settings.exerciseContent;
            var exerciseResult = settings.exerciseResult;
            var exerciseTypeId = exerciseResult.exerciseTypeId;

            var isNotLecture = exerciseTypeId !== ExerciseTypeEnum.LECTURE.enum;

            var $ctrl = this;

            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
            var initSlideIndex;

            function _setExerciseResult() {
                var isQuestionsArrEmpty = !angular.isArray(exerciseResult.questionResults) || !exerciseResult.questionResults.length;
                if (isNotLecture && isQuestionsArrEmpty) {
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
                if(isNotLecture){
                    exerciseContent.questions = exerciseContent.questions.sort(function (a, b) {
                        return a.order - b.order;
                    });

                    ZnkExerciseUtilitySrv.setQuestionsGroupData(
                        exerciseContent.questions,
                        exerciseContent.questionsGroupData
                    );
                }else{
                    exerciseContent.content.sort(function(item1, item2){
                        return item1.order - item2.order;
                    });
                    for (var i = 0; i < exerciseContent.content.length; i++) {
                        exerciseContent.content[i].exerciseTypeId = exerciseTypeId;
                        exerciseContent.content[i].id = exerciseTypeId + '_' + exerciseContent.id + '_' + exerciseContent.content[i].order;// mandatory for drawing tool
                    }
                    exerciseContent.questions = exerciseContent.content;  // lecture question type has content property instead of questions.
                }
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

                function _getAllowedTimeForExercise() {
                    if(!isNotLecture){
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

                    if(isNotLecture){
                        initSlideIndex = exerciseResult.questionResults.findIndex(function (question) {
                            return !question.userAnswer;
                        });

                        if (initSlideIndex === -1) {
                            initSlideIndex = 0;
                        }
                    }else{
                        initSlideIndex = 0;
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
                        viewMode: viewMode,
                        initSlideIndex: initSlideIndex || 0,
                        allowedTimeForExercise: _getAllowedTimeForExercise(),
                        toolBox:{
                            drawing:{
                                exerciseDrawingPathPrefix: exerciseResult.uid,
                                toucheColorId: ENV.appContext === 'student' ? 1 : 2
                            }
                        }
                    };

                    $ctrl.settings = angular.extend(defExerciseSettings, settings.znkExerciseSettings || {});
                };
            })();

            function _init() {
                _setExerciseResult();

                _setExerciseContentQuestions();

                _setZnkExerciseSettings();

                $ctrl.exerciseContent = exerciseContent;
                $ctrl.exerciseResult = exerciseResult;
                $ctrl._finishExercise = _finishExercise;
            }

            _init();
        }
    );
})(angular);
