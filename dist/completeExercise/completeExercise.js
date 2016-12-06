(function(){
    'use strict';

    angular.module('znk.infra-web-app.completeExercise',[
        'ngAnimate',
        'pascalprecht.translate',
        'ngMaterial',
        'znk.infra.exerciseUtility',
        'znk.infra.contentGetters',
        'znk.infra.userContext',
        'znk.infra.user',
        'znk.infra.znkModule',
        'znk.infra.general',
        'znk.infra.filters',
        'znk.infra.znkExercise',
        'znk.infra.stats',
        'znk.infra.popUp',
        'znk.infra.screenSharing',
        'znk.infra.eventManager',
        'znk.infra.stats',
        'znk.infra.estimatedScore'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'book-icon': 'components/completeExercise/assets/svg/book-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})();

(function(angular) {
    'use strict';

    /**
     * exerciseDetails:
     *   exerciseTypeId
     *   exerciseId
     *   exerciseParentTypeId
     *   exerciseParentId
     *
     * ########
     * settings:
     *   exitAction
     *   mode:{
     *      1: default, sensitive to sharer screen sharing state
     *      2: sensitive to viewer screen sharing state
     *   },
     *   znkExerciseSettings: znk exercise settings
     *
     * ########
     *   translations:
     *      SECTION_INSTRUCTION:{
     *          subjectId: instructions for subject
     *      }
     * */
    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExercise/completeExerciseDirective.template.html',
            bindings: {
                exerciseDetails: '<',
                settings: '<'
            },
            controller: ["$log", "ExerciseResultSrv", "ExerciseTypeEnum", "$q", "BaseExerciseGetterSrv", "CompleteExerciseSrv", "ExerciseParentEnum", "$timeout", "ScreenSharingSrv", "UserScreenSharingStateEnum", "ZnkModuleService", "EventManagerSrv", function($log, ExerciseResultSrv, ExerciseTypeEnum, $q, BaseExerciseGetterSrv, CompleteExerciseSrv,
                ExerciseParentEnum, $timeout, ScreenSharingSrv, UserScreenSharingStateEnum, ZnkModuleService,
                EventManagerSrv) {
                'ngInject';

                var $ctrl = this;

                var VIEW_STATES = CompleteExerciseSrv.VIEW_STATES;
                var SH_MODE_STATES = CompleteExerciseSrv.MODE_STATES;

                var currUserShState = UserScreenSharingStateEnum.NONE.enum,
                    shMode,
                    exerciseRebuildProm = $q.when(),
                    syncUpdatesProm = $q.when(),
                    isSharerMode = false,
                    isViewerMode = false,
                    shModeEventManager = new EventManagerSrv(),
                    shDataEventManager = new EventManagerSrv();

                function _clearState() {
                    $ctrl.exerciseDetails = null;

                    $ctrl.changeViewState(VIEW_STATES.NONE, true);
                }

                function _getExerciseParentContentProm(exerciseDetails, settings, isExam, isModule) {
                     var exerciseParentContentProm = $q.when(null);
                    
                     if (isExam) {
                         exerciseParentContentProm = BaseExerciseGetterSrv.getExerciseByNameAndId('exam', exerciseDetails.exerciseParentId);
                     } else if (settings && settings.exerciseParentContent) {
                         exerciseParentContentProm = settings.exerciseParentContent;
                     } else if (isModule) {
                        exerciseParentContentProm = ZnkModuleService.getModuleById(exerciseDetails.exerciseParentId).then(function (moduleContent) {
                            return {
                                name: moduleContent.name
                            };
                        });
                     }
                    
                     return exerciseParentContentProm;
                }

                function _setShDataToCurrentExercise() {
                    syncUpdatesProm = syncUpdatesProm
                        .then(function() {
                            var promMap = {
                                exerciseRebuildProm: exerciseRebuildProm,
                                activeShData: ScreenSharingSrv.getActiveScreenSharingData()
                            };
                            return $q.all(promMap).then(function(data) {
                                var activeShData = data.activeShData;

                                activeShData.activeExercise = {};
                                var propsToCopyFromCurrExerciseDetails = [
                                    'exerciseId',
                                    'exerciseTypeId',
                                    'exerciseParentId',
                                    'exerciseParentTypeId'
                                ];
                                angular.forEach(propsToCopyFromCurrExerciseDetails, function(propName) {
                                    activeShData.activeExercise[propName] = $ctrl.exerciseDetails[propName];
                                });

                                activeShData.activeExercise.resultGuid = $ctrl.exerciseData.exerciseResult.guid;
                                activeShData.activeExercise.activeScreen = $ctrl.currViewState;
                                shDataEventManager.updateValue(activeShData);
                                var saveExerciseResultProm = isSharerMode ? $q.when() : $ctrl.exerciseData.exerciseResult.$save();
                                return saveExerciseResultProm.then(function() {
                                    return activeShData.$save();
                                });
                            });
                        })
                        .catch(function(err) {
                            $log.error(err);
                        });
                }

                function _rebuildExercise(exerciseDetails) {
                    if (!exerciseDetails) {
                        return;
                    }

                    var isExerciseParentTypeIdNotProvided = angular.isUndefined(exerciseDetails.exerciseParentTypeId);
                    var isExerciseTypeIdNotProvided = angular.isUndefined(exerciseDetails.exerciseTypeId);
                    var isExerciseIdNotProvided = angular.isUndefined(exerciseDetails.exerciseId);
                    if (isExerciseParentTypeIdNotProvided || isExerciseTypeIdNotProvided || isExerciseIdNotProvided) {
                        $log.error('completeExercise: new exerciseDetails is missing data');
                        return;
                    }

                    _clearState();

                    $ctrl.exerciseDetails = exerciseDetails;

                    exerciseRebuildProm = $timeout(function() {
                        var isExam = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.EXAM.enum;
                        var isModule = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.MODULE.enum;
                        var settings = $ctrl.settings;

                        var exerciseParentContentProm = _getExerciseParentContentProm(exerciseDetails, settings, isExam, isModule);

                        return exerciseParentContentProm.then(function(exerciseParentContent) {
                            if (isExam) {
                                exerciseDetails.examSectionsNum = exerciseParentContent && angular.isArray(exerciseParentContent.sections) ? exerciseParentContent.sections.length : 0;
                            }
                            var getDataPromMap = {
                                exerciseResult: CompleteExerciseSrv.getExerciseResult(exerciseDetails, shMode),
                                exerciseContent: BaseExerciseGetterSrv.getExerciseByTypeAndId(exerciseDetails.exerciseTypeId, exerciseDetails.exerciseId),
                                exerciseParentContent: exerciseParentContent
                            };
                            return $q.all(getDataPromMap).then(function(data) {
                                $ctrl.exerciseData = data;
                                var newViewState;

                                var exerciseTypeId = data.exerciseResult.exerciseTypeId;
                                var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
                                var isTutorial = exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum;
                                var isParentTutorial = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.TUTORIAL.enum;
                                var isParentModule = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.MODULE.enum;
                                // skip intro
                                if (isParentTutorial || isParentModule){
                                    data.exerciseResult.seenIntro = true;
                                }

                                if (!data.exerciseResult.isComplete && (isSection || isTutorial) && !data.exerciseResult.seenIntro) {
                                    newViewState = VIEW_STATES.INTRO;
                                } else {
                                    newViewState = VIEW_STATES.EXERCISE;
                                }

                                $ctrl.changeViewState(newViewState, true);

                                if (isSharerMode) {
                                    $ctrl.exerciseData.exerciseResult.$save().then(function() {
                                        _setShDataToCurrentExercise();
                                    });
                                }
                            });

                        });
                    });
                }

                function _getGetterFnName(propName) {
                    return 'get' + propName[0].toUpperCase() + propName.substr(1);
                }

                function _createPropGetters(propArray, contextObjectName) {
                    propArray.forEach(function(propName) {
                        var getterFnName = _getGetterFnName(propName);
                        $ctrl[getterFnName] = function() {
                            return $ctrl[contextObjectName][propName];
                        };
                    });
                }

                function _updateActiveShDataActiveScreen(newViewState) {
                    syncUpdatesProm = syncUpdatesProm.then(function() {
                        return ScreenSharingSrv.getActiveScreenSharingData().then(function(activeShData) {
                            var activeExercise = activeShData.activeExercise;

                            if (!activeExercise) {
                                return;
                            }

                            activeShData.activeExercise.activeScreen = newViewState;
                            shDataEventManager.updateValue(activeShData);
                            return activeShData.$save();
                        });
                    }).catch(function(err) {
                        $log.error(err);
                    });
                    return syncUpdatesProm;
                }

                function _updateMode() {
                    var settingsMode = ($ctrl.settings && $ctrl.settings.mode) || SH_MODE_STATES.SHARER;

                    isSharerMode = settingsMode === SH_MODE_STATES.SHARER && currUserShState === UserScreenSharingStateEnum.SHARER.enum;
                    isViewerMode = settingsMode === SH_MODE_STATES.VIEWER && currUserShState === UserScreenSharingStateEnum.VIEWER.enum;
                    if (isSharerMode) {
                        shMode = SH_MODE_STATES.SHARER;
                    } else if (isViewerMode) {
                        shMode = SH_MODE_STATES.VIEWER;
                    } else {
                        shMode = null;
                    }

                    shModeEventManager.updateValue(shMode);
                }

                var _activeShDataChangeHandler = (function() {
                    var firstTrigger = true;
                    return function(newShData) {
                        shDataEventManager.updateValue(newShData);

                        if (firstTrigger) {
                            firstTrigger = false;
                            if (isSharerMode) {
                                return;
                            }
                        }


                        var activeExercise = newShData.activeExercise;

                        if (!activeExercise) {
                            if (isViewerMode) {
                                _clearState();
                            }
                            return;
                        }

                        var isSameExerciseId = $ctrl.exerciseDetails && activeExercise.exerciseId === $ctrl.exerciseDetails.exerciseId;
                        var isSameExerciseType = $ctrl.exerciseDetails && activeExercise.exerciseTypeId === $ctrl.exerciseDetails.exerciseTypeId;
                        var isDiffActiveScreen = $ctrl.currViewState !== activeExercise.activeScreen;
                        if (isSameExerciseId && isSameExerciseType) {
                            if (isDiffActiveScreen) {
                                var newViewState = activeExercise.activeScreen || VIEW_STATES.NONE;
                                //active screen should never be none if in sharer mode
                                if (newViewState === VIEW_STATES.NONE && isSharerMode) {
                                    $ctrl.changeViewState(newViewState, true);
                                }
                            }
                        } else {
                            if (isViewerMode) {
                                _rebuildExercise(activeExercise);
                            }
                        }
                    };
                })();

                function _registerToActiveShDataEvents() {
                    ScreenSharingSrv.registerToActiveScreenSharingDataChanges(_activeShDataChangeHandler);
                }

                function _unregisterFromActiveShDataEvents() {
                    ScreenSharingSrv.unregisterFromActiveScreenSharingDataChanges(_activeShDataChangeHandler);
                }

                function _userShStateChangeHandler(newUserShState) {
                    currUserShState = newUserShState;

                    _updateMode();

                    if (shMode) {
                        _registerToActiveShDataEvents();
                    } else {
                        _unregisterFromActiveShDataEvents();
                    }

                    if (isSharerMode) {
                        _setShDataToCurrentExercise();
                    }
                }

                function _registerToUserShEvents() {
                    ScreenSharingSrv.registerToCurrUserScreenSharingStateChanges(_userShStateChangeHandler);
                }

                function _unregisterFromUserShEvents() {
                    ScreenSharingSrv.unregisterFromCurrUserScreenSharingStateChanges(_userShStateChangeHandler);
                }

                this.changeViewState = function(newViewState, skipActiveScreenUpdate) {
                    if ($ctrl.currViewState === newViewState) {
                        return;
                    }

                    if (shMode && !skipActiveScreenUpdate) {
                        _updateActiveShDataActiveScreen(newViewState);
                    } else {
                        $ctrl.currViewState = newViewState;
                    }
                };

                this.$onInit = function() {
                    var exerciseDetailsPropsToCreateGetters = [
                        'exerciseParentTypeId',
                        'exerciseParentId',
                        'exerciseTypeId'
                    ];
                    _createPropGetters(exerciseDetailsPropsToCreateGetters, 'exerciseDetails');

                    var exerciseDataPropsToCreateGetters = [
                        'exerciseContent',
                        'exerciseParentContent',
                        'exerciseResult'
                    ];
                    _createPropGetters(exerciseDataPropsToCreateGetters, 'exerciseData');

                    _registerToUserShEvents();

                    this.shModeEventManager = shModeEventManager;

                    this.shDataEventManager = shDataEventManager;
                };

                this.$onChanges = function(changesObj) {
                    if (isViewerMode) {
                        return;
                    }

                    if (!changesObj.exerciseDetails.currentValue) {
                        $ctrl.changeViewState(VIEW_STATES.NONE, !isSharerMode);
                        return;
                    }

                    var newExerciseDetails = changesObj.exerciseDetails.currentValue;

                    _rebuildExercise(newExerciseDetails);
                };

                this.$onDestroy = function() {
                    _unregisterFromUserShEvents();
                    _unregisterFromActiveShDataEvents();

                    if (isSharerMode) {
                        ScreenSharingSrv.getActiveScreenSharingData().then(function(activeShData) {
                            if (!activeShData) {
                                return;
                            }

                            activeShData.activeExercise = null;
                            activeShData.$save();
                        });
                    }
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseExercise/completeExerciseExerciseDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: ["$controller", "CompleteExerciseSrv", "$q", "$translate", "PopUpSrv", "InfraConfigSrv", "$scope", "UserProfileService", "ScreenSharingSrv", "ExerciseTypeEnum", "StatsEventsHandlerSrv", "exerciseEventsConst", "$rootScope", "ZnkExerciseViewModeEnum", function ($controller, CompleteExerciseSrv, $q, $translate, PopUpSrv, InfraConfigSrv, $scope, UserProfileService, ScreenSharingSrv, ExerciseTypeEnum,
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

                    if (!exerciseContent.time || exerciseResult.isComplete || exerciseResult.exerciseTypeId !== ExerciseTypeEnum.SECTION.enum) {
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
                    var exerciseParentContent = $ctrl.completeExerciseCtrl.getExerciseParentContent();

                    var settings = {
                        exerciseContent: exerciseContent,
                        exerciseResult: exerciseResult,
                        exerciseParentContent: exerciseParentContent,
                        actions: {
                            done: function () {
                                $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.SUMMARY);
                                $ctrl.znkExercise.actions.unbindExerciseView();
                            },
                            exitAction: $ctrl.completeExerciseCtrl.settings.exitAction
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
                    settings.exerciseDetails = $ctrl.completeExerciseCtrl.exerciseDetails;

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

                function _finishExerciseWhenAllQuestionsAnswered() {
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                    var numOfUnansweredQuestions = $ctrl.znkExercise._getNumOfUnansweredQuestions(exerciseResult.questionResults);
                    var isViewModeAnswerWithResult = $ctrl.znkExercise.settings.viewMode === ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum ;
                    var isNotLecture = exerciseResult.exerciseTypeId !== ExerciseTypeEnum.LECTURE.enum;

                    if (!numOfUnansweredQuestions && isViewModeAnswerWithResult && !exerciseResult.isComplete && isNotLecture) {
                        $ctrl.znkExercise._finishExercise();
                    }
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

                    this.openIntro = function() {
                        $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.INTRO);
                    };

                    this.goToSummary = function () {
                        $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.SUMMARY);
                        $ctrl.znkExercise.actions.unbindExerciseView();
                    };
                };

                this.$onDestroy = function () {
                    _unregisterFromShModeChanges();
                    _unbindExerciseFromShData();
                    _finishExerciseWhenAllQuestionsAnswered();
                };
            }]
        });
})(angular);

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
        ["settings", "ExerciseTypeEnum", "ZnkExerciseUtilitySrv", "ZnkExerciseViewModeEnum", "$q", "$translate", "PopUpSrv", "$log", "znkAnalyticsSrv", "ZnkExerciseSrv", "exerciseEventsConst", "StatsEventsHandlerSrv", "$rootScope", "$location", "ENV", "UtilitySrv", "ExerciseCycleSrv", function (settings, ExerciseTypeEnum, ZnkExerciseUtilitySrv, ZnkExerciseViewModeEnum, $q, $translate, PopUpSrv, 
                  $log, znkAnalyticsSrv, ZnkExerciseSrv, exerciseEventsConst, StatsEventsHandlerSrv, $rootScope, $location, ENV,
                  UtilitySrv, ExerciseCycleSrv) {
            'ngInject';

            var exerciseContent = settings.exerciseContent;
            var exerciseResult = settings.exerciseResult;
            var exerciseParentContent = settings.exerciseParentContent;
            var exerciseTypeId = exerciseResult.exerciseTypeId;

            var isNotLecture = exerciseTypeId !== ExerciseTypeEnum.LECTURE.enum;

            var shouldBroadCastExerciseProm = ZnkExerciseUtilitySrv.shouldBroadCastExercisePromFnGetter();

            var $ctrl = this;

            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
            var initSlideIndex;

            function _setExerciseResult() {
                var isQuestionsArrEmpty = !angular.isArray(exerciseResult.questionResults) || !exerciseResult.questionResults.length;
                if (isNotLecture && isQuestionsArrEmpty) {
                    exerciseResult.questionResults = exerciseContent.questions.map(function (question) {
                 return {
                            questionId: question.id,
                            categoryId: question.categoryId,
                            manualEvaluation: question.manualEvaluation || false,
                            subjectId: question.subjectId,
                            order: question.index,
                            answerTypeId: question.answerTypeId,
                            difficulty: question.difficulty,
                            correctAnswerId: question.correctAnswerId,
                            questionFormatId: question.questionFormatId,
                        };
                    });
                }

                exerciseResult.subjectId = exerciseContent.subjectId;
                exerciseResult.exerciseName = exerciseContent.name;
                exerciseResult.totalQuestionNum = (exerciseTypeId === ExerciseTypeEnum.LECTURE.enum ? 0 : exerciseContent.questions.length);
                exerciseResult.calculator = exerciseContent.calculator;
                exerciseResult.timePreference = exerciseContent.timePreference;
                exerciseResult.categoryId = exerciseContent.categoryId;
                exerciseResult.testScoreId = exerciseContent.testScoreId;
                exerciseResult.moduleId = exerciseContent.moduleId;
                exerciseResult.time = exerciseContent.time;
                exerciseResult.exerciseOrder = settings.exerciseDetails.exerciseOrder;

                if (angular.isUndefined(exerciseResult.startedTime)) {
                    exerciseResult.startedTime = Date.now();
                }
            }

            function _setExerciseContentQuestions() {
                if (isNotLecture) {
                    exerciseContent.questions = exerciseContent.questions.sort(function (a, b) {
                        return a.order - b.order;
                    });

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
                    var exerciseParentIsSectionOnly = isSection ? exerciseParentContent : undefined;

                    shouldBroadCastExerciseProm.then(function(shouldBroadcastFn) {
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
                            if(!isNotLecture){
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
                        onExit: function() {
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
                $ctrl._getNumOfUnansweredQuestions = _getNumOfUnansweredQuestions;
            }

            _init();
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseHeader', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseHeader/completeExerciseHeaderDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            transclude:{
                'centerPart': '?centerPart',
                'preRightPart': '?preRightPart'
            },
            controller: ["$translate", "$q", function ($translate, $q) {
                'ngInject';

                var $ctrl = this;

                function _setLeftTitle(){
                    var exerciseParentTypeId = $ctrl.completeExerciseCtrl.getExerciseParentTypeId();
                    var titlePrefixTranslateKey = 'COMPLETE_EXERCISE.EXERCISE_PARENT.TYPE_' + exerciseParentTypeId ;
                    var translateData = {
                        exerciseParentId: $ctrl.completeExerciseCtrl.getExerciseParentId(),
                        exerciseContent: $ctrl.completeExerciseCtrl.getExerciseContent(),
                        exerciseParentContent: $ctrl.completeExerciseCtrl.getExerciseParentContent()
                    };
                    var translatePromMap = {
                        leftTitle: $translate(titlePrefixTranslateKey, translateData)
                    };
                    $q.all(translatePromMap).then(function(translationMap){
                        $ctrl.leftTitle = translationMap.leftTitle;
                    });
                }

                this.$onInit = function(){
                    _setLeftTitle();

                    $ctrl.exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntro', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntro/completeExerciseIntroDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: ["CompleteExerciseSrv", function (CompleteExerciseSrv) {
                'ngInject';

                var $ctrl = this;

                this.$onInit = function () {
                    var fnToCopyFromCompleteExerciseCtrl = [
                        'getExerciseContent',
                        'getExerciseParentContent'
                    ];
                    fnToCopyFromCompleteExerciseCtrl.forEach(function (fnName) {
                        $ctrl[fnName] = $ctrl.completeExerciseCtrl[fnName].bind($ctrl.completeExerciseCtrl);
                    });

                    this.exerciseTypeId = this.completeExerciseCtrl.exerciseDetails.exerciseTypeId;

                    this.goToQuestions = function () {
                        var exerciseResult = this.completeExerciseCtrl.getExerciseResult();
                        exerciseResult.seenIntro = true;
                        exerciseResult.$save();
                        $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.EXERCISE);
                    };
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntroSection', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntroSection/completeExerciseIntroSectionDirective.template.html',
            require: {
                completeExerciseIntroCtrl: '^completeExerciseIntro'
            },
            controller: ["$filter", function ($filter) {
                'ngInject';

                this.$onInit = function(){
                    var exerciseParentContent = this.completeExerciseIntroCtrl.getExerciseParentContent();
                    var exerciseContent = this.completeExerciseIntroCtrl.getExerciseContent();

                    this.exerciseContent = exerciseContent;
                    this.exerciseParentContent = exerciseParentContent;

                    var translateFilter = $filter('translate');
                    this.subjectNameTranslateKey = translateFilter('COMPLETE_EXERCISE.SUBJECTS.' + exerciseContent.subjectId);
                    this.instructionsTranslateKey = translateFilter('COMPLETE_EXERCISE.SECTION_INSTRUCTION.' + exerciseContent.subjectId);

                    var timeDurationFilter = $filter('formatTimeDuration');
                    this.timeTranslateValue = {
                        min: timeDurationFilter(exerciseContent.time, 'mm'),
                        sec: timeDurationFilter(exerciseContent.time, 'rss')
                    };

                    this.start = function(){
                        this.completeExerciseIntroCtrl.goToQuestions();
                    };
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntroTutorial', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntroTutorial/completeExerciseIntroTutorialDirective.template.html',
            require: {
                completeExerciseIntroCtrl: '^completeExerciseIntro'
            },
            controller: ["ENV", "ExerciseTypeEnum", "$sce", function (ENV, ExerciseTypeEnum, $sce) {
                'ngInject';

                this.$onInit = function () {
                    var exerciseContent = this.completeExerciseIntroCtrl.getExerciseContent();

                    this.exerciseContent = exerciseContent;

                    this.videoSrc = $sce.trustAsResourceUrl(ENV.videosEndPoint + 'videos/' + 'tutorials' + '/' + exerciseContent.id + '.mp4');

                    this.trustAsHtml = function (html) {
                        return $sce.trustAsHtml(html);
                    };

                    this.goToQuestions = function(){
                        this.completeExerciseIntroCtrl.goToQuestions();
                    };
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .directive('completeExerciseProgressBar',
            ["$animate", "$timeout", function ($animate, $timeout) {
                'ngInject';

                var directive = {
                    restrict: 'E',
                    templateUrl: 'components/completeExercise/directives/completeExerciseProgressBar/completeExerciseProgressBarDirective.template.html',
                    scope: {
                        totalTime: '@',
                        duration: '<'
                    },
                    link: function (scope, element) {
                        var isAnimationSet, prevCls;
                        var BAR_CLASSES = {
                            'GREEN': 'green-state',
                            'YELLOW': 'yellow-state',
                            'RED': 'red-state',

                        };

                        function _getTotalTime() {
                            return +scope.totalTime;
                        }

                        function _getDuration() {
                            return scope.duration || 0;
                        }

                        function _getDurationPercentage() {
                            var totalTime = _getTotalTime();
                            var duration = _getDuration();
                            return parseInt(duration / totalTime * 100, 10);
                        }

                        function _setAnimation() {
                            var domElement = element[0];
                            var progressBarDomElement = domElement.querySelector('.progress-bar');

                            var durationPercentage = _getDurationPercentage();
                            var parentWidth = domElement.offsetWidth;
                            var translateX = (parseInt(parentWidth * (durationPercentage / 100), 10) - parentWidth) + 'px';
                            progressBarDomElement.style.transform = 'translateX(' + translateX + ')';

                            var fromCss = {};
                            var totalTime = _getTotalTime();
                            var duration = _getDuration();
                            var timeLeft = totalTime - duration;
                            fromCss.transition = 'transform linear ' + timeLeft + 'ms';

                            var toCss = {
                                transform: 'translateX(0)'
                            };
                            $timeout(function(){
                                $animate.animate(progressBarDomElement, fromCss, toCss);
                            });
                        }

                        function _getBarColorClass(durationPercentage) {
                            if (durationPercentage > 70) {
                                return BAR_CLASSES.RED;
                            }

                            if (durationPercentage > 40) {
                                return BAR_CLASSES.YELLOW;
                            }

                            return BAR_CLASSES.GREEN;
                        }

                        scope.$watch('duration', function (newDuration) {
                            if (angular.isUndefined(newDuration)) {
                                return;
                            }

                            if (!isAnimationSet) {
                                _setAnimation();
                                isAnimationSet = true;
                            }

                            var durationPercentage = _getDurationPercentage();
                            var clsToAdd = _getBarColorClass(durationPercentage);

                            if (prevCls === clsToAdd) {
                                return;
                            }

                            element.addClass(clsToAdd);
                            element.removeClass(prevCls);
                            prevCls = clsToAdd;
                        });
                    }
                };

                return directive;
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .directive('completeExerciseTimerParser', function completeExerciseTimer(){
            var directive = {
                restrict: 'A',
                require: 'ngModel',
                link: {
                    pre: function(scope, element, attrs, ngModelCtrl){
                        ngModelCtrl.$parsers.push(function(timeLeft){
                            var config = scope.$eval(attrs.config);
                            var maxTime = config.max;
                            return maxTime - timeLeft;
                        });

                        ngModelCtrl.$formatters.push(function(duration){
                            var config = scope.$eval(attrs.config);
                            var maxTime = config.max;
                            return maxTime - duration;
                        });
                    }
                }
            };
            return directive;
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').service('CompleteExerciseSrv',
        ["ENV", "UserProfileService", "TeacherContextSrv", "ExerciseTypeEnum", "ExerciseResultSrv", "$log", "$q", "ExerciseParentEnum", function (ENV, UserProfileService, TeacherContextSrv, ExerciseTypeEnum, ExerciseResultSrv, $log, $q, ExerciseParentEnum) {
            'ngInject';

            this.VIEW_STATES = {
                NONE: 0,
                INTRO: 1,
                EXERCISE: 2,
                SUMMARY: 3
            };

            this.MODE_STATES = {
                SHARER: 1,
                VIEWER: 2
            };

            this.getContextUid = function () {
                var isStudentApp = ENV.appContext === 'student';
                if (isStudentApp) {
                    return UserProfileService.getCurrUserId();
                } else {
                    return $q.when(TeacherContextSrv.getCurrUid());
                }
            };

            this.getExerciseResult = function (exerciseDetails, shMode) {
                var isLecture = exerciseDetails.exerciseTypeId === ExerciseTypeEnum.LECTURE.enum;

                if(shMode === this.MODE_STATES.VIEWER){
                    if(!exerciseDetails.resultGuid){
                        var errMsg = 'completeExerciseSrv: exercise details is missing guid property';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return ExerciseResultSrv.getExerciseResultByGuid(exerciseDetails.resultGuid);
                }

                switch (exerciseDetails.exerciseParentTypeId) {
                    case ExerciseParentEnum.MODULE.enum:
                        if(isLecture){
                            return ExerciseResultSrv.getExerciseResult(
                                exerciseDetails.exerciseTypeId,
                                exerciseDetails.exerciseId,
                                exerciseDetails.exerciseParentId
                            );
                        }

                        return this.getContextUid().then(function (uid) {
                            return ExerciseResultSrv.getModuleExerciseResult(
                                uid,
                                exerciseDetails.exerciseParentId,
                                exerciseDetails.exerciseTypeId,
                                exerciseDetails.exerciseId
                            );
                        });
                    default:
                        return ExerciseResultSrv.getExerciseResult(
                            exerciseDetails.exerciseTypeId,
                            exerciseDetails.exerciseId,
                            exerciseDetails.exerciseParentId,
                            exerciseDetails.examSectionsNum
                        );
                }
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise').provider('ExerciseCycleSrv',
        function () {
            var hooksObj = {};

            this.setInvokeFunctions = function (_hooksObj) {
                hooksObj = _hooksObj;
            };

            this.$get = ["$log", "$injector", function ($log, $injector) {
                'ngInject';
                var exerciseCycleSrv = {};

                exerciseCycleSrv.invoke = function (methodName, data) {                    
                    var hook = hooksObj[methodName];
                    var fn;

                    if (angular.isDefined(hook)) {                      
                        try {
                            fn = $injector.invoke(hook);         
                        } catch(e) {
                            $log.error('exerciseCycleSrv invoke: faild to invoke hook! methodName: ' + methodName + 'e: '+ e);
                            return;
                        }

                        data = angular.isArray(data) ? data : [data];
                        
                        return fn.apply(null, data);
                    } 
                };

                return exerciseCycleSrv;
            }];
        }
    );
})(angular);

angular.module('znk.infra-web-app.completeExercise').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/completeExercise/assets/svg/book-icon.svg",
    "<svg\n" +
    "    version=\"1.1\"\n" +
    "    x=\"0px\" y=\"0px\"\n" +
    "    viewBox=\"-246.4 90.8 76.2 73.6\"\n" +
    "    class=\"book-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "    .book-icon-svg .st0{\n" +
    "        fill:none;\n" +
    "        stroke:#231F20;\n" +
    "        stroke-width:1.6393;\n" +
    "        stroke-miterlimit:10;\n" +
    "    }\n" +
    "    .tutorial-icon .st1{\n" +
    "        fill:none;\n" +
    "        stroke:#231F20;\n" +
    "        stroke-width:1.8504;\n" +
    "        stroke-linecap:round;\n" +
    "        stroke-miterlimit:10;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<g>\n" +
    "		<path class=\"st0\" d=\"M-245.5,91.6v62h26.5c0,0,10.4-0.8,10.7,9c0.3,9.8,0-63.7,0-63.7s-1.1-7.4-9.3-7.4\n" +
    "			C-225.9,91.6-245.5,91.6-245.5,91.6z\"/>\n" +
    "		<path class=\"st0\" d=\"M-171,91.6v62h-26.5c0,0-10.4-0.8-10.7,9c-0.3,9.8,0-63.7,0-63.7s1.1-7.4,9.3-7.4\n" +
    "			C-190.7,91.6-171,91.6-171,91.6z\"/>\n" +
    "	</g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-238.2\" y1=\"105.9\" x2=\"-216.7\" y2=\"105.9\"/>\n" +
    "		<line class=\"st1\" x1=\"-238.2\" y1=\"117.7\" x2=\"-216.7\" y2=\"117.7\"/>\n" +
    "		<line class=\"st1\" x1=\"-238.2\" y1=\"129.5\" x2=\"-216.7\" y2=\"129.5\"/>\n" +
    "		<line class=\"st1\" x1=\"-238.2\" y1=\"141.4\" x2=\"-216.7\" y2=\"141.4\"/>\n" +
    "	</g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-199.9\" y1=\"105.9\" x2=\"-178.3\" y2=\"105.9\"/>\n" +
    "		<line class=\"st1\" x1=\"-199.9\" y1=\"117.7\" x2=\"-178.3\" y2=\"117.7\"/>\n" +
    "		<line class=\"st1\" x1=\"-199.9\" y1=\"129.5\" x2=\"-178.3\" y2=\"129.5\"/>\n" +
    "		<line class=\"st1\" x1=\"-199.9\" y1=\"141.4\" x2=\"-178.3\" y2=\"141.4\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExercise/completeExerciseDirective.template.html",
    "<div translate-namespace=\"COMPLETE_EXERCISE\">\n" +
    "    <ng-switch on=\"$ctrl.currViewState\"\n" +
    "               class=\"main-container\">\n" +
    "        <div ng-switch-when=\"1\" class=\"animate-view-state\">\n" +
    "            <complete-exercise-intro></complete-exercise-intro>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"2\" class=\"animate-view-state\">\n" +
    "            <complete-exercise-exercise></complete-exercise-exercise>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"3\" class=\"animate-view-state\">\n" +
    "            <complete-exercise-summary></complete-exercise-summary>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseExercise/completeExerciseExerciseDirective.template.html",
    "<div class=\"base-complete-exercise-container\">\n" +
    "    <complete-exercise-header>\n" +
    "        <center-part>{{$ctrl.znkExercise.actions.getCurrentIndex() + 1}}/{{::$ctrl.znkExercise.exerciseContent.questions.length}}</center-part>\n" +
    "        <pre-right-part>\n" +
    "            <timer ng-if=\"$ctrl.timeEnabled &&\n" +
    "                   $ctrl.znkExercise.settings.viewMode !== $ctrl.znkExerciseViewModeEnum.REVIEW.enum\"\n" +
    "                   ng-model=\"$ctrl.znkExercise.exerciseResult.duration\"\n" +
    "                   complete-exercise-timer-parser\n" +
    "                   type=\"1\"\n" +
    "                   play=\"true\"\n" +
    "                   config=\"$ctrl.timerConfig\"\n" +
    "                   ng-change=\"$ctrl.durationChanged()\">\n" +
    "            </timer>\n" +
    "            <div class=\"tutorial-icon-wrapper\" ng-if=\"$ctrl.completeExerciseCtrl.exerciseDetails.exerciseTypeId === 1\">\n" +
    "                <svg-icon ng-click=\"$ctrl.openIntro()\" name=\"book-icon\" class=\"book-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <div class=\"summary\"\n" +
    "                 ng-click=\"$ctrl.goToSummary()\"\n" +
    "                 ng-if=\"$ctrl.znkExercise.exerciseResult.isComplete\">\n" +
    "                <span translate=\".SUMMARY\" class=\"summary-text\"></span>\n" +
    "                <div class=\"background-opacity\"></div>\n" +
    "            </div>\n" +
    "        </pre-right-part>\n" +
    "    </complete-exercise-header>\n" +
    "    <complete-exercise-progress-bar ng-if=\"$ctrl.timeEnabled &&\n" +
    "                                    $ctrl.znkExercise.settings.viewMode !== $ctrl.znkExerciseViewModeEnum.REVIEW.enum\"\n" +
    "                                    total-time=\"{{$ctrl.znkExercise.exerciseContent.time}}\"\n" +
    "                                    duration=\"$ctrl.znkExercise.exerciseResult.duration\">\n" +
    "    </complete-exercise-progress-bar>\n" +
    "    <znk-exercise questions=\"$ctrl.znkExercise.exerciseContent.questions\"\n" +
    "                  ng-model=\"$ctrl.znkExercise.exerciseResult.questionResults\"\n" +
    "                  settings=\"$ctrl.znkExercise.settings\"\n" +
    "                  actions=\"$ctrl.znkExercise.actions\">\n" +
    "    </znk-exercise>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseHeader/completeExerciseHeaderDirective.template.html",
    "<div class=\"header-container\"\n" +
    "     translate-namespace=\"COMPLETE_EXERCISE\"\n" +
    "     subject-id-to-attr-drv=\"$ctrl.exerciseContent.subjectId\"\n" +
    "     context-attr=\"class,class\"\n" +
    "     suffix=\"bg,subject-pattern\">\n" +
    "    <div class=\"left-part\">\n" +
    "        <div class=\"left-title\" ng-bind-html=\"$ctrl.leftTitle\" title=\"{{$ctrl.leftTitle}}\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"center-part\">\n" +
    "        <div ng-transclude=\"centerPart\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"right-part\">\n" +
    "        <div ng-transclude=\"preRightPart\"></div>\n" +
    "        <div class=\"exit\"\n" +
    "             translate=\".EXIT\"\n" +
    "             ng-click=\"$ctrl.completeExerciseCtrl.settings.exitAction()\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseIntro/completeExerciseIntroDirective.template.html",
    "<div class=\"base-complete-exercise-container\">\n" +
    "    <complete-exercise-header></complete-exercise-header>\n" +
    "    <ng-switch on=\"$ctrl.exerciseTypeId\" class=\"intro-container\">\n" +
    "        <complete-exercise-intro-tutorial ng-switch-when=\"1\">\n" +
    "        </complete-exercise-intro-tutorial>\n" +
    "        <complete-exercise-intro-section ng-switch-when=\"4\">\n" +
    "        </complete-exercise-intro-section>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseIntroSection/completeExerciseIntroSectionDirective.template.html",
    "<div class=\"intro-container\"\n" +
    "     translate-namespace=\"COMPLETE_EXERCISE\">\n" +
    "    <div class=\"title\" ng-bind=\"$ctrl.exerciseParentContent.name\"></div>\n" +
    "    <svg-icon subject-id-to-attr-drv=\"$ctrl.exerciseContent.subjectId\"\n" +
    "              context-attr=\"name\"\n" +
    "              suffix=\"icon\"\n" +
    "              class=\"subject-icon\">\n" +
    "    </svg-icon>\n" +
    "   <div class=\"subject-text\" translate=\"{{$ctrl.subjectNameTranslateKey}}\"></div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"section-data\">\n" +
    "        <span translate=\".QUESTIONS\"\n" +
    "              translate-values=\"{num: $ctrl.exerciseContent.questions.length}\">\n" +
    "        </span>\n" +
    "        <span translate=\".TIME\"\n" +
    "              translate-values=\"$ctrl.timeTranslateValue\">\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <div class=\"instructions-title\"\n" +
    "         translate=\".INSTRUCTIONS\">\n" +
    "    </div>\n" +
    "    <p class=\"instructions-text\"\n" +
    "       translate=\"{{$ctrl.instructionsTranslateKey}}\">\n" +
    "    </p>\n" +
    "\n" +
    "    <div class=\"btn-section\">\n" +
    "        <md-button class=\"md-primary znk\"\n" +
    "                   aria-label=\"{{'COMPLETE_EXERCISE.START' | translate}}\"\n" +
    "                   md-no-ink\n" +
    "                   translate=\".START\"\n" +
    "                   ng-click=\"$ctrl.start()\">\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseIntroTutorial/completeExerciseIntroTutorialDirective.template.html",
    "<div class=\"intro-container\">\n" +
    "    <div class=\"upper-wrapper\">\n" +
    "        <div class=\"video-wrapper\">\n" +
    "            <video controls\n" +
    "                   video-ctrl-drv\n" +
    "                   on-play=\"vm.onVideoPlay()\"\n" +
    "                   on-ended=\"vm.onVideoEnded()\"\n" +
    "                   video-error-poster=\"assets/images/raccoon/video-is-not-available-img.png\">\n" +
    "                <source ng-src=\"{{::$ctrl.videoSrc}}\" type=\"video/mp4\">\n" +
    "            </video>\n" +
    "        </div>\n" +
    "        <div class=\"content-wrapper\">\n" +
    "            <div ng-repeat=\"content in $ctrl.exerciseContent.content\">\n" +
    "                <div ng-bind-html=\"::$ctrl.trustAsHtml(content.title)\"></div>\n" +
    "                <div ng-bind-html=\"::$ctrl.trustAsHtml(content.body)\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"btn-section\">\n" +
    "        <md-button class=\"md-primary znk go-to-questions-btn\"\n" +
    "                   aria-label=\"{{'COMPLETE_EXERCISE.GO_QST' | translate}}\"\n" +
    "                   md-no-ink\n" +
    "                   translate=\".GO_QST\"\n" +
    "                   ng-click=\"$ctrl.goToQuestions()\">\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseProgressBar/completeExerciseProgressBarDirective.template.html",
    "<div class=\"progress-bar\"></div>\n" +
    "\n" +
    "");
}]);
