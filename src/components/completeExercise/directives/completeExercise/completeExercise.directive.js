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
     *   }
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
                                  $translatePartialLoader, ExerciseParentEnum, $timeout, ScreenSharingSrv, UserScreenSharingStateEnum,
                                  EventManagerSrv) {
                'ngInject';

                $translatePartialLoader.addPart('completeExercise');

                var $ctrl = this;

                var VIEW_STATES = CompleteExerciseSrv.VIEW_STATES;
                var SH_MODE_STATES = CompleteExerciseSrv.MODE_STATES;

                var currUserShState = UserScreenSharingStateEnum.NONE.enum,
                    shMode,
                    isSharerMode = false,
                    isViewerMode = false,
                    shModeEventManager = new EventManagerSrv(),
                    shDataEventManager = new EventManagerSrv();

                function _clearState() {
                    $ctrl.exerciseDetails = null;

                    $ctrl.changeViewState(VIEW_STATES.NONE, true);
                }

                function _rebuildExercise(exerciseDetails) {
                    var isExerciseParentTypeIdNotProvided = angular.isUndefined(exerciseDetails.exerciseParentTypeId);
                    var isExerciseTypeIdNotProvided = angular.isUndefined(exerciseDetails.exerciseTypeId);
                    var isExerciseIdNotProvided = angular.isUndefined(exerciseDetails.exerciseId);
                    if (isExerciseParentTypeIdNotProvided || isExerciseTypeIdNotProvided || isExerciseIdNotProvided) {
                        $log.error('completeExercise: new exerciseDetails is missing data');
                        return;
                    }

                    _clearState();

                    $ctrl.exerciseDetails = exerciseDetails;

                    $timeout(function () {
                        var isExam = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.EXAM.enum;
                        var exerciseParentContent = isExam ? BaseExerciseGetterSrv.getExerciseByNameAndId('exam', exerciseDetails.exerciseParentId) : null;

                        var getDataPromMap = {
                            exerciseResult: CompleteExerciseSrv.getExerciseResult(exerciseDetails, shMode),
                            exerciseContent: BaseExerciseGetterSrv.getExerciseByTypeAndId(exerciseDetails.exerciseTypeId, exerciseDetails.exerciseId),
                            exerciseParentContent: exerciseParentContent
                        };
                        $q.all(getDataPromMap).then(function (data) {
                            $ctrl.exerciseData = data;
                            var newViewState;

                            var exerciseTypeId = data.exerciseResult.exerciseTypeId;
                            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
                            var isTutorial = exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum;
                            var isExerciseCompleted = data.exerciseResult.isComplete;
                            if ((isSection || isTutorial) && !data.exerciseResult.seenIntro) {
                                newViewState = VIEW_STATES.INTRO;
                            }else if (!isExerciseCompleted) {
                                newViewState = VIEW_STATES.EXERCISE;
                            } else {
                                newViewState = VIEW_STATES.SUMMARY;
                            }

                            $ctrl.changeViewState(newViewState, true);
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

                function _setShDataToCurrentExercise() {
                    ScreenSharingSrv.getActiveScreenSharingData().then(function (activeShData) {
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

                        activeShData.$save();
                    });
                }

                function _updateActiveShDataActiveScreen() {
                    ScreenSharingSrv.getActiveScreenSharingData().then(function (activeShData) {
                        if (activeShData.activeExercise.activeScreen === $ctrl.currViewState) {
                            return;
                        }

                        activeShData.activeExercise.activeScreen = $ctrl.currViewState;
                        activeShData.$save();
                    });
                }

                function _updateMode() {
                    var settingsMode = ($ctrl.settings && $ctrl.settings.mode) || SH_MODE_STATES.SHARER;

                    isSharerMode = settingsMode === SH_MODE_STATES.SHARER && currUserShState === UserScreenSharingStateEnum.SHARER.enum;
                    isViewerMode = settingsMode === SH_MODE_STATES.VIEWER && currUserShState === UserScreenSharingStateEnum.VIEWER.enum;
                    if (isSharerMode) {
                        shMode = SH_MODE_STATES.SHARER;
                    }else if(isViewerMode){
                        shMode = SH_MODE_STATES.VIEWER;
                    }else{
                        shMode = null;
                    }

                    shModeEventManager.updateValue(shMode);
                }

                function _activeShDataChangeHandler(newShData) {
                    shDataEventManager.updateValue(newShData);

                    var activeExercise = newShData.activeExercise || {};

                    if (isSharerMode && !activeExercise.activeScreen) {
                        _setShDataToCurrentExercise();
                        return;
                    }

                    if (!activeExercise) {
                        _clearState();
                        return;
                    }

                    var isSameExerciseId = $ctrl.exerciseDetails && activeExercise.exerciseId === $ctrl.exerciseDetails.exerciseId;
                    var isSameExerciseType = $ctrl.exerciseDetails && activeExercise.exerciseTypeId === $ctrl.exerciseDetails.exerciseTypeId;
                    if (isSameExerciseId && isSameExerciseType) {
                        //active screen should never be empty if in sharer mode
                        if(shMode === SH_MODE_STATES.SHARER && !activeExercise.activeScreen){
                            return;
                        }
                        $ctrl.changeViewState(activeExercise.activeScreen || VIEW_STATES.NONE);
                    } else {
                        if (isSharerMode) {
                            _setShDataToCurrentExercise();
                        } else {
                            _rebuildExercise(newShData.activeExercise);
                        }
                    }
                }

                function _registerToActiveShDataEvents() {
                    ScreenSharingSrv.registerToActiveScreenSharingDataChanges(_activeShDataChangeHandler);
                }

                function _unregisterFromActiveShDataEvents() {
                    ScreenSharingSrv.unregisterFromActiveScreenSharingDataChanges(_activeShDataChangeHandler);
                }

                function _userShStateChangeHandler(newUserShState) {
                    currUserShState = newUserShState;

                    _updateMode();

                    if (newUserShState === UserScreenSharingStateEnum.NONE.enum) {
                        _unregisterFromActiveShDataEvents();
                        return;
                    }

                    if (shMode) {
                        _registerToActiveShDataEvents();
                    }
                }

                function _registerToUserShEvents() {
                    ScreenSharingSrv.registerToCurrUserScreenSharingStateChanges(_userShStateChangeHandler);
                }

                function _unregisterFromUserShEvents() {
                    ScreenSharingSrv.unregisterFromCurrUserScreenSharingStateChanges(_userShStateChangeHandler);
                }

                this.changeViewState = function (newViewState, skipActiveScreenUpdate) {
                    $ctrl.currViewState = newViewState;

                    if (shMode && !skipActiveScreenUpdate) {
                        _updateActiveShDataActiveScreen();
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
                    if (!changesObj.exerciseDetails.currentValue) {
                        $ctrl.changeViewState(VIEW_STATES.NONE);
                        return;
                    }

                    var newExerciseDetails = changesObj.exerciseDetails.currentValue;

                    _rebuildExercise(newExerciseDetails);
                };

                this.$onDestroy = function () {
                    _unregisterFromUserShEvents();
                    _unregisterFromActiveShDataEvents();
                };
            }
        });
})(angular);
