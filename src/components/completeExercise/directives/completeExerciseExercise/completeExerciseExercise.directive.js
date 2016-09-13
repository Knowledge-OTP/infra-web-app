(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseExercise/completeExerciseExerciseDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: function ($controller, CompleteExerciseSrv, $q, $translate, PopUpSrv, InfraConfigSrv, $scope, UserProfileService, ScreenSharingSrv, ExerciseTypeEnum,
                                  StatsEventsHandlerSrv, exerciseEventsConst, $rootScope, ZnkExerciseViewModeEnum) {
                'ngInject';

                var $ctrl = this;

                var exerciseViewBinding = {},
                    exerciseViewBindWatchDestroyer = angular.noop,
                    lastShDataReceived;

                $ctrl.znkExerciseViewModeEnum = ZnkExerciseViewModeEnum;

                function _initTimersVitalData() {
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();

                    if (!exerciseContent.time || exerciseResult.isComplete) {
                        return;
                    }

                    $ctrl.timeEnabled = true;

                    if (angular.isUndefined(exerciseResult.duration)) {
                        exerciseResult.duration = 0;
                    }

                    $ctrl.timerConfig = {
                        countDown: true,
                        max: exerciseContent.time
                    };
                }

                function _invokeExerciseCtrl() {
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                    var exerciseTypeId = $ctrl.completeExerciseCtrl.getExerciseTypeId();
                    var exerciseParentContent = $ctrl.completeExerciseCtrl.getExerciseParentContent();

                    var settings = {
                        exerciseContent: exerciseContent,
                        exerciseResult: exerciseResult,
                        exerciseParentContent: exerciseParentContent,
                        actions: {
                            done: function () {
                                //  stats exercise data
                                var promMap = {};

                                promMap.statsAndEstimatedScore = StatsEventsHandlerSrv.addNewExerciseResult(exerciseTypeId, exerciseContent, exerciseResult).then(function () {
                                    var exerciseTypeValue = ExerciseTypeEnum.getValByEnum(exerciseTypeId).toLowerCase();
                                    var broadcastEventName = exerciseEventsConst[exerciseTypeValue].FINISH;
                                    $rootScope.$broadcast(broadcastEventName, exerciseContent, exerciseResult, exerciseParentContent);
                                });

                                promMap.exerciseSave = exerciseResult.$save();

                                $q.all(promMap).then(function(){
                                    $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.SUMMARY);
                                });
                            }
                        }
                    };

                    var defaultZnkExerciseSettings = {
                        onExerciseReady: function () {
                            $ctrl.znkExercise.actions.bindExerciseViewTo(exerciseViewBinding);
                        }
                    };
                    var providedZnkExerciseSettings = $ctrl.completeExerciseCtrl.settings.znkExerciseSettings || {};
                    var znkExerciseSettings = angular.extend(defaultZnkExerciseSettings, providedZnkExerciseSettings);
                    settings.znkExerciseSettings = znkExerciseSettings;

                    $ctrl.znkExercise = $controller('CompleteExerciseBaseZnkExerciseCtrl', {
                        settings: settings
                    });
                }

                function _resultChangeHandler(newResult) {
                    if (!newResult || !newResult.questionResults) {
                        return;
                    }

                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                    var updatedQuestionsResults = exerciseResult.questionResults;
                    var newQuestionsResults = newResult.questionResults;
                    var isNotLecture = exerciseResult.exerciseTypeId !== ExerciseTypeEnum.LECTURE.enum;

                    angular.extend(exerciseResult, newResult);

                    if (isNotLecture) {
                        angular.forEach(updatedQuestionsResults, function (questionResult, index) {
                            var newQuestionResult = newQuestionsResults[index];
                            angular.extend(questionResult, newQuestionResult);
                        });
                        exerciseResult.questionResults = updatedQuestionsResults;
                    }

                }

                function _registerToResultChanges() {
                    InfraConfigSrv.getStudentStorage().then(function (storage) {
                        var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                        storage.onEvent('value', exerciseResult.$$path, _resultChangeHandler);
                    });
                }

                function _unregisterFromResultChanges() {
                    InfraConfigSrv.getStudentStorage().then(function (storage) {
                        var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                        storage.offEvent('value', exerciseResult.$$path, _resultChangeHandler);
                    });
                }

                function _shDataChangeHandler(newScreenSharingData) {
                    lastShDataReceived = newScreenSharingData;

                    if (!newScreenSharingData) {
                        return;
                    }

                    UserProfileService.getCurrUserId().then(function (currUid) {
                        if (newScreenSharingData.updatedBy !== currUid) {
                            angular.extend(exerciseViewBinding, newScreenSharingData.activeExercise);
                        }
                    });
                }

                function _registerToShDataChanges() {
                    $ctrl.completeExerciseCtrl.shDataEventManager.registerCb(_shDataChangeHandler);
                }

                function _unregisterFromShDataChanges() {
                    $ctrl.completeExerciseCtrl.shDataEventManager.unregisterCb(_shDataChangeHandler);
                }

                function _bindExerciseToShData() {
                    _registerToResultChanges();
                    _registerToShDataChanges();
                    exerciseViewBindWatchDestroyer = $scope.$watch(function () {
                        return exerciseViewBinding;
                    }, (function () {
                        var syncProm = $q.when();

                        return function (newExerciseView) {
                            if (!lastShDataReceived || angular.equals(exerciseViewBinding, lastShDataReceived.activeExercise)) {
                                return null;
                            }
                            syncProm = syncProm.then(function () {
                                return ScreenSharingSrv.getActiveScreenSharingData().then(function (screenSharingData) {
                                    if (screenSharingData.activeExercise) {
                                        angular.extend(screenSharingData.activeExercise, newExerciseView);
                                        return screenSharingData.$save();
                                    }
                                });
                            });
                        };
                    })(), true);
                }

                function _unbindExerciseFromShData() {
                    _unregisterFromResultChanges();
                    _unregisterFromShDataChanges();
                    exerciseViewBindWatchDestroyer();
                }

                function _shModeChangedHandler(shMode) {
                    if (shMode) {
                        _bindExerciseToShData();
                    } else {
                        _unbindExerciseFromShData();
                    }
                }

                function _registerToShModeChanges() {
                    $ctrl.completeExerciseCtrl.shModeEventManager.registerCb(_shModeChangedHandler);
                }

                function _unregisterFromShModeChanges() {
                    $ctrl.completeExerciseCtrl.shModeEventManager.unregisterCb(_shModeChangedHandler);

                }

                this.$onInit = function () {
                    _initTimersVitalData();

                    _invokeExerciseCtrl();

                    _registerToShModeChanges();

                    this.durationChanged = function () {
                        var exerciseResult = this.completeExerciseCtrl.getExerciseResult();
                        var exerciseContent = this.completeExerciseCtrl.getExerciseContent();

                        if (exerciseResult.duration >= exerciseContent.time) {
                            var contentProm = $translate('COMPLETE_EXERCISE.TIME_UP_CONTENT');
                            var titleProm = $translate('COMPLETE_EXERCISE.TIME_UP_TITLE');
                            var buttonFinishProm = $translate('COMPLETE_EXERCISE.STOP');
                            var buttonContinueProm = $translate('COMPLETE_EXERCISE.CONTINUE_BTN');

                            $q.all([contentProm, titleProm, buttonFinishProm, buttonContinueProm]).then(function (results) {
                                var content = results[0];
                                var title = results[1];
                                var buttonFinish = results[2];
                                var buttonContinue = results[3];
                                var timeOverPopupPromise = PopUpSrv.ErrorConfirmation(title, content, buttonFinish, buttonContinue).promise;

                                timeOverPopupPromise.then(function () {
                                    $ctrl.znkExercise._finishExercise();
                                });
                            });
                        }
                    };

                    this.goToSummary = function () {
                        $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.SUMMARY);
                    };
                };

                this.$onDestroy = function () {
                    _unregisterFromShModeChanges();
                    _unbindExerciseFromShData();
                };
            }
        });
})(angular);
