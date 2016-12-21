(function (angular) {
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
     *   loadingAnimation: (optional) override the default loading animation, or to turn off the loading animation.
     *                      in order to override - must have showLoading and hideLoading functions.
     *                      in order to turn off - set as false;
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
            controller: function ($log, ExerciseResultSrv, ExerciseTypeEnum, $q, BaseExerciseGetterSrv, CompleteExerciseSrv,
                                  ExerciseParentEnum, $timeout, ScreenSharingSrv, UserScreenSharingStateEnum, ZnkModuleService,
                                  EventManagerSrv, LoadingSrv) {
                'ngInject';

                var $ctrl = this;

                var VIEW_STATES = CompleteExerciseSrv.VIEW_STATES;
                var SH_MODE_STATES = CompleteExerciseSrv.MODE_STATES;

                var loadingAnimation = LoadingSrv;

                if( $ctrl.settings.loadingAnimation){
                    loadingAnimation = $ctrl.settings.loadingAnimation;
                }

                var currUserShState = UserScreenSharingStateEnum.NONE.enum,
                    shMode,
                    exerciseRebuildProm = $q.when(),
                    syncUpdatesProm = $q.when(),
                    isSharerMode = false,
                    isViewerMode = false,
                    isDataReady = false,
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
                        .then(function () {
                            var promMap = {
                                exerciseRebuildProm: exerciseRebuildProm,
                                activeShData: ScreenSharingSrv.getActiveScreenSharingData()
                            };
                            return $q.all(promMap).then(function (data) {
                                var activeShData = data.activeShData;

                                activeShData.activeExercise = {};
                                var propsToCopyFromCurrExerciseDetails = [
                                    'exerciseId',
                                    'exerciseTypeId',
                                    'exerciseParentId',
                                    'exerciseParentTypeId'
                                ];
                                angular.forEach(propsToCopyFromCurrExerciseDetails, function (propName) {
                                    activeShData.activeExercise[propName] = $ctrl.exerciseDetails[propName];
                                });

                                activeShData.activeExercise.resultGuid = $ctrl.exerciseData.exerciseResult.guid;
                                activeShData.activeExercise.activeScreen = $ctrl.currViewState;
                                shDataEventManager.updateValue(activeShData);
                                var saveExerciseResultProm = isSharerMode ? $q.when() : $ctrl.exerciseData.exerciseResult.$save();
                                return saveExerciseResultProm.then(function () {
                                    return activeShData.$save();
                                });
                            });
                        })
                        .catch(function (err) {
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

                    exerciseRebuildProm = $timeout(function () {
                        var isExam = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.EXAM.enum;
                        var isModule = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.MODULE.enum;
                        var settings = $ctrl.settings;

                        var exerciseParentContentProm = _getExerciseParentContentProm(exerciseDetails, settings, isExam, isModule);

                        return exerciseParentContentProm.then(function (exerciseParentContent) {
                            if (isExam) {
                                exerciseDetails.examSectionsNum = exerciseParentContent && angular.isArray(exerciseParentContent.sections) ? exerciseParentContent.sections.length : 0;
                            }
                            var getDataPromMap = {
                                exerciseResult: CompleteExerciseSrv.getExerciseResult(exerciseDetails, shMode),
                                exerciseContent: BaseExerciseGetterSrv.getExerciseByTypeAndId(exerciseDetails.exerciseTypeId, exerciseDetails.exerciseId),
                                exerciseParentContent: exerciseParentContent
                            };
                            return $q.all(getDataPromMap).then(function (data) {
                                $ctrl.exerciseData = data;
                                isDataReady = true;
                                var newViewState;

                                var exerciseTypeId = data.exerciseResult.exerciseTypeId;
                                var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
                                var isTutorial = exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum;
                                var isParentModule = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.MODULE.enum;
                                // skip intro
                                if (isParentModule) {
                                    data.exerciseResult.seenIntro = true;
                                }

                                if (!data.exerciseResult.isComplete && (isSection || isTutorial) && !data.exerciseResult.seenIntro) {
                                    newViewState = VIEW_STATES.INTRO;
                                } else {
                                    newViewState = VIEW_STATES.EXERCISE;
                                }

                                $ctrl.changeViewState(newViewState, true);

                                if (isSharerMode) {
                                    $ctrl.exerciseData.exerciseResult.$save().then(function () {
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
                    propArray.forEach(function (propName) {
                        var getterFnName = _getGetterFnName(propName);
                        $ctrl[getterFnName] = function () {
                            return $ctrl[contextObjectName][propName];
                        };
                    });
                }

                function _updateActiveShDataActiveScreen(newViewState) {
                    syncUpdatesProm = syncUpdatesProm.then(function () {
                        return ScreenSharingSrv.getActiveScreenSharingData().then(function (activeShData) {
                            var activeExercise = activeShData.activeExercise;

                            if (!activeExercise) {
                                return;
                            }

                            activeShData.activeExercise.activeScreen = newViewState;
                            shDataEventManager.updateValue(activeShData);
                            return activeShData.$save();
                        });
                    }).catch(function (err) {
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

                var _activeShDataChangeHandler = (function () {
                    var firstTrigger = true;
                    return function (newShData) {
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
                            if (isDiffActiveScreen && isDataReady) {
                                var newViewState = activeExercise.activeScreen || VIEW_STATES.NONE;

                                //active screen should never be none if in sharer mode
                                if (newViewState === VIEW_STATES.NONE && isSharerMode) {
                                    newViewState = VIEW_STATES.EXERCISE;
                                }

                                $ctrl.changeViewState(newViewState, true);
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

                this.changeViewState = function (newViewState, skipActiveScreenUpdate) {
                    if ($ctrl.currViewState === newViewState) {
                        return;
                    }

                    if ($ctrl.settings.loadingAnimation !== false) {
                        if (!newViewState || newViewState === VIEW_STATES.NONE) {
                            loadingAnimation.showLoading();
                        } else {
                            loadingAnimation.hideLoading(true);
                        }
                    }

                    if (shMode && !skipActiveScreenUpdate) {
                        _updateActiveShDataActiveScreen(newViewState);
                    } else {
                        $ctrl.currViewState = newViewState;
                    }
                };

                this.$onInit = function () {
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

                this.$onChanges = function (changesObj) {

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

                this.$onDestroy = function () {
                    _unregisterFromUserShEvents();
                    _unregisterFromActiveShDataEvents();

                    if (isSharerMode) {
                        ScreenSharingSrv.getActiveScreenSharingData().then(function (activeShData) {
                            if (!activeShData) {
                                return;
                            }

                            activeShData.activeExercise = null;
                            activeShData.$save();
                        });
                    }
                };
            }
        });
})(angular);
