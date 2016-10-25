(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app', [
        "znk.infra-web-app.angularMaterialOverride",
"znk.infra-web-app.completeExercise",
"znk.infra-web-app.config",
"znk.infra-web-app.diagnostic",
"znk.infra-web-app.diagnosticExercise",
"znk.infra-web-app.diagnosticIntro",
"znk.infra-web-app.estimatedScoreWidget",
"znk.infra-web-app.evaluator",
"znk.infra-web-app.faq",
"znk.infra-web-app.feedback",
"znk.infra-web-app.iapMsg",
"znk.infra-web-app.imageZoomer",
"znk.infra-web-app.infraWebAppZnkExercise",
"znk.infra-web-app.invitation",
"znk.infra-web-app.liveLessons",
"znk.infra-web-app.loginApp",
"znk.infra-web-app.onBoarding",
"znk.infra-web-app.promoCode",
"znk.infra-web-app.purchase",
"znk.infra-web-app.settings",
"znk.infra-web-app.socialSharing",
"znk.infra-web-app.tests",
"znk.infra-web-app.uiTheme",
"znk.infra-web-app.userGoals",
"znk.infra-web-app.userGoalsSelection",
"znk.infra-web-app.webAppScreenSharing",
"znk.infra-web-app.workoutsRoadmap",
"znk.infra-web-app.znkExerciseStatesUtility",
"znk.infra-web-app.znkHeader",
"znk.infra-web-app.znkSummary",
"znk.infra-web-app.znkTimelineWebWrapper"
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.angularMaterialOverride', [
        'ngMaterial'
    ]);
})(angular);

angular.module('znk.infra-web-app.angularMaterialOverride').run(['$templateCache', function($templateCache) {

}]);

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
        'znk.infra.general',
        'znk.infra.filters',
        'znk.infra.znkExercise',
        'znk.infra.stats',
        'znk.infra.popUp',
        'znk.infra.screenSharing',
        'znk.infra.eventManager',
        'znk.infra.stats',
        'znk.infra.estimatedScore'
    ]);
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "COMPLETE_EXERCISE": {
                            "EXERCISE_PARENT": {
                                "TYPE_1": "Workout {{exerciseParentId}}: {{exerciseContent.name}}",
                                "TYPE_2": "Tips & Tricks: {{exerciseContent.name}}",
                                "TYPE_3": "Exam {{exerciseParentContent.name}}: {{exerciseContent.name}}",
                                "TYPE_4": "{{exerciseContent.name}}"
                            },
                            "SECTION_INSTRUCTION":{
                                "0":"Solve the following problems.",
                                "1":"Answer the following questions based on the information in the text.",
                                "2":"Evaluate the following essay.",
                                "3":"You should listen to each conversation or lecture only once. After each conversation or lecture, you will answer a series of questions. Some questions requires listening again to a part of the audio. You may take notes while you listen.",
                                "4":"The following questions requires recording of your response. You will have time to prepare your response and to speak. Further instructions appear on each question.",
                                "5":"Following is a passage with 15 questions. Some portions of text are highlighted to indicate a grammatical or stylistic error. Select the best choice from the four possible options.",
                                "6":"Answer the following questions based on the information presented in the passages.",
                                "7":"",
                                "8":"After reading the persuasive essay, assess the essay by answering the following questions."
                            },
                            "SUBJECTS":{
                                "0":"Mathematics",
                                "1":"Reading",
                                "2":"Writing",
                                "3":"Listening",
                                "4":"Speaking",
                                "5":"English",
                                "6":"Science",
                                "7":"Verbal",
                                "8":"Essay"
                            },
                            "EXIT": "Exit",
                            "GO_QST": "Go To Questions",
                            "QUESTIONS": "Questions: {{num}}",
                            "TIME": "Time: {{min}} min {{sec}} sec",
                            "INSTRUCTIONS": "Instructions",
                            "START": "START",
                            "SOME_ANSWER_LEFT_CONTENT": "You’ve left some questions unanswered…",
                            "FINISH_TITLE": "Finished?",
                            "GO_TO_SUMMARY_BTN": "GO TO SUMMARY",
                            "STAY_BTN": "STAY",
                            "TIME_UP_CONTENT": "To best simulate the conditions of a real exam, we recommend you stop taking this practice test now. However, if you prefer to continue and complete all remaining questions, you may do so.",
                            "TIME_UP_TITLE": "Time’s Up",
                            "STOP": "STOP",
                            "CONTINUE_BTN": "CONTINUE",
                            "SUMMARY": "Summary"
                        }
                    }
                );
            }]);
})(angular);

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
            controller: ["$log", "ExerciseResultSrv", "ExerciseTypeEnum", "$q", "BaseExerciseGetterSrv", "CompleteExerciseSrv", "ExerciseParentEnum", "$timeout", "ScreenSharingSrv", "UserScreenSharingStateEnum", "EventManagerSrv", function ($log, ExerciseResultSrv, ExerciseTypeEnum, $q, BaseExerciseGetterSrv, CompleteExerciseSrv,
                                  ExerciseParentEnum, $timeout, ScreenSharingSrv, UserScreenSharingStateEnum,
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
                        var exerciseParentContent = isExam ? BaseExerciseGetterSrv.getExerciseByNameAndId('exam', exerciseDetails.exerciseParentId) : null;

                        var getDataPromMap = {
                            exerciseResult: CompleteExerciseSrv.getExerciseResult(exerciseDetails, shMode),
                            exerciseContent: BaseExerciseGetterSrv.getExerciseByTypeAndId(exerciseDetails.exerciseTypeId, exerciseDetails.exerciseId),
                            exerciseParentContent: exerciseParentContent
                        };
                        return $q.all(getDataPromMap).then(function (data) {
                            $ctrl.exerciseData = data;
                            var newViewState;

                            var exerciseTypeId = data.exerciseResult.exerciseTypeId;
                            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
                            var isTutorial = exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum;
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

                            if(!activeExercise){
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

                var _activeShDataChangeHandler = (function(){
                    var firstTrigger = true;
                    return function (newShData) {
                        shDataEventManager.updateValue(newShData);

                        if(firstTrigger){
                            firstTrigger = false;
                            if(isSharerMode){
                                return;
                            }
                        }


                        var activeExercise = newShData.activeExercise;

                        if (!activeExercise) {
                            if(isViewerMode){
                                _clearState();
                            }
                            return;
                        }

                        var isSameExerciseId = $ctrl.exerciseDetails && activeExercise.exerciseId === $ctrl.exerciseDetails.exerciseId;
                        var isSameExerciseType = $ctrl.exerciseDetails && activeExercise.exerciseTypeId === $ctrl.exerciseDetails.exerciseTypeId;
                        var isDiffActiveScreen = $ctrl.currViewState !== activeExercise.activeScreen;
                        if (isSameExerciseId && isSameExerciseType) {
                            if(isDiffActiveScreen){
                                var newViewState = activeExercise.activeScreen || VIEW_STATES.NONE;
                                //active screen should never be none if in sharer mode
                                if(!(newViewState === VIEW_STATES.NONE && isSharerMode)){
                                    $ctrl.changeViewState(newViewState, true);
                                }
                            }
                        } else {
                            if(isViewerMode){
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

                    if(shMode && !skipActiveScreenUpdate ){
                        _updateActiveShDataActiveScreen(newViewState);
                    }else{
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
                    if(isViewerMode){
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

                    if(isSharerMode){
                        ScreenSharingSrv.getActiveScreenSharingData().then(function (activeShData) {
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
        ["settings", "ExerciseTypeEnum", "ZnkExerciseUtilitySrv", "ZnkExerciseViewModeEnum", "$q", "$translate", "PopUpSrv", "$log", "znkAnalyticsSrv", "ZnkExerciseSrv", "exerciseEventsConst", "StatsEventsHandlerSrv", "$rootScope", "$location", "ENV", "UtilitySrv", function (settings, ExerciseTypeEnum, ZnkExerciseUtilitySrv, ZnkExerciseViewModeEnum, $q, $translate, PopUpSrv,
                  $log, znkAnalyticsSrv, ZnkExerciseSrv, exerciseEventsConst, StatsEventsHandlerSrv, $rootScope, $location, ENV,
                  UtilitySrv) {
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
                            manualEvaluation: question.manualEvaluation || false
                        };
                    });
                }

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
                        }
                    });

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
                            exerciseDetails.exerciseParentId
                        );
                }
            };
        }]
    );
})(angular);

angular.module('znk.infra-web-app.completeExercise').run(['$templateCache', function($templateCache) {
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
    "        <div class=\"left-title\" ng-bind=\"$ctrl.leftTitle\" title=\"{{$ctrl.leftTitle}}\"></div>\n" +
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
    "                   md-no-ink\n" +
    "                   translate=\".START\"\n" +
    "                   ng-click=\"$ctrl.start()\">\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/completeExercise/directives/completeExerciseIntroTutorial/completeExerciseIntroTutorialDirective.template.html",
    "<div class=\"intro-container\">\n" +
    "    <div class=\"video-wrapper\">\n" +
    "        <video controls\n" +
    "               video-ctrl-drv\n" +
    "               on-play=\"vm.onVideoPlay()\"\n" +
    "               on-ended=\"vm.onVideoEnded()\"\n" +
    "               video-error-poster=\"assets/images/raccoon/video-is-not-available-img.png\">\n" +
    "            <source ng-src=\"{{::$ctrl.videoSrc}}\" type=\"video/mp4\">\n" +
    "        </video>\n" +
    "    </div>\n" +
    "    <div class=\"content-wrapper\">\n" +
    "        <div ng-repeat=\"content in $ctrl.exerciseContent.content\">\n" +
    "            <div ng-bind-html=\"::$ctrl.trustAsHtml(content.title)\"></div>\n" +
    "            <div ng-bind-html=\"::$ctrl.trustAsHtml(content.body)\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"btn-section\">\n" +
    "        <md-button class=\"md-primary znk go-to-questions-btn\"\n" +
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

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config', []).config([
        function(){}
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.config').provider('WebAppInfraConfigSrv', [
        function () {
            this.$get = [
                function () {
                    var webAppInfraConfigSrv = {};
                    return webAppInfraConfigSrv;
                }
            ];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.config').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnostic', [
        'znk.infra.exerciseResult',
        'znk.infra.exerciseUtility'
        
    ]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.diagnostic').provider('DiagnosticSrv', function () {
        var _diagnosticExamIdGetter;
        this.setDiagnosticExamIdGetter = function(diagnosticExamIdGetter){
            _diagnosticExamIdGetter = diagnosticExamIdGetter;
        };

        this.$get = ["$log", "$q", "ExerciseResultSrv", "ExerciseStatusEnum", "$injector", function($log, $q, ExerciseResultSrv, ExerciseStatusEnum, $injector){
            'ngInject';

            var DiagnosticSrv = {};

            DiagnosticSrv.getDiagnosticExamId = function(){
                if(!_diagnosticExamIdGetter){
                    var errMsg = 'DiagnosticSrv: diagnostic exam id was not set';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                var diagnosticExamId;
                if(angular.isFunction(_diagnosticExamIdGetter)){
                    diagnosticExamId = $injector.invoke(_diagnosticExamIdGetter);
                }else{
                    diagnosticExamId = _diagnosticExamIdGetter;
                }
                return $q.when(diagnosticExamId);
            };

            DiagnosticSrv.getDiagnosticExamResult = function(){
                return DiagnosticSrv.getDiagnosticExamId().then(function(diagnosticExamId) {
                    return ExerciseResultSrv.getExamResult(diagnosticExamId, true);
                });
            };

            DiagnosticSrv.getDiagnosticStatus = function(){
                return DiagnosticSrv.getDiagnosticExamResult().then(function(diagnosticExamResult){
                    if(diagnosticExamResult === null){
                        return ExerciseStatusEnum.NEW.enum;
                    }

                    if(diagnosticExamResult.isComplete){
                        return ExerciseStatusEnum.COMPLETED.enum;
                    }

                    var startedSectionsNum= Object.keys(diagnosticExamResult.sectionResults);
                    return startedSectionsNum ? ExerciseStatusEnum.ACTIVE.enum : ExerciseStatusEnum.NEW.enum;
                });
            };

            DiagnosticSrv.isDiagnosticCompleted = function(){
                return DiagnosticSrv.getDiagnosticStatus().then(function(diagnosticStatus){
                    return diagnosticStatus === ExerciseStatusEnum.COMPLETED.enum;
                });
            };

            return DiagnosticSrv;
        }];
    });
})(angular);

angular.module('znk.infra-web-app.diagnostic').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise', [
        'pascalprecht.translate',
        'ngMaterial',
        'chart.js',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.analytics',
        'znk.infra.exams',
        'znk.infra.estimatedScore',
        'znk.infra.exerciseUtility',
        'znk.infra.exerciseResult',
        'znk.infra.znkExercise',
        'znk.infra.scroll',
        'znk.infra.stats',
        'znk.infra.scoring',
        'znk.infra.general',
        'znk.infra.filters',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra-web-app.infraWebAppZnkExercise',
        'znk.infra-web-app.workoutsRoadmap'
    ]).config(["SvgIconSrvProvider", function(SvgIconSrvProvider) {
        'ngInject';
        var svgMap = {
            'diagnostic-dropdown-arrow-icon': 'components/diagnosticExercise/svg/dropdown-arrow.svg',
            'diagnostic-check-mark': 'components/diagnosticExercise/svg/diagnostic-check-mark-icon.svg',
            'diagnostic-flag-icon': 'components/diagnosticExercise/svg/flag-icon.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "WORKOUTS_DIAGNOSTIC_INTRO":{
                            "HEADER_TITLE": "Diagnostic Test: {{subject}}"
                        },
                        "WORKOUTS_DIAGNOSTIC_EXERCISE":{
                            "HEADER_TITLE": "Diagnostic Test: {{subject}}"
                        },
                        "WORKOUTS_DIAGNOSTIC_SUMMARY": {
                            "YOUR_INITIAL_SCORE_ESTIMATE": "YOUR INITIAL ESTIMATED SCORE",
                            "ESTIMATED_SCORE": "ESTIMATED SCORE",
                            "YOUR_GOAL": "Your Goal:",
                            "VERBAL": "VERBAL",
                            "MATH": "MATH",
                            "DONE": "DONE",
                            "EVALUATE_START": "We've just designed a personalized training roadmap to help you improve in all four subjects.",
                            "GREAT_START": "That’s a great start! You're on the path to an excellent score!",
                            "GOOD_START": "Good work! We’ve personalized your roadmap to make you an expert in no time.",
                            "BAD_START": "Nice start! We've just designed a special roadmap to help you improve in all four subjects.",
                            "GOAL_TOOLTIP": "{{ptsToGoal}} pts to go!"
                        },
                        "WORKOUTS_DIAGNOSTIC_PRE_SUMMARY": {
                            "READY": "Ready to see your scores?"
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').config(
        ["$stateProvider", function ($stateProvider) {
            'ngInject';

            $stateProvider
                .state('app.diagnostic', {
                    url: '/diagnostic?skipIntro',
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnostic.template.html',
                    resolve: {
                        currentState: ["WorkoutsDiagnosticFlow", "$stateParams", function currentState(WorkoutsDiagnosticFlow, $stateParams) {
                            'ngInject';// jshint ignore:line
                            return WorkoutsDiagnosticFlow.getDiagnosticFlowCurrentState(null, $stateParams.skipIntro);
                        }]
                    },
                    controller: 'WorkoutsDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('app.diagnostic.intro', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticIntro.template.html',
                    controller: 'WorkoutsDiagnosticIntroController',
                    controllerAs: 'vm'
                })
                .state('app.diagnostic.exercise', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticExercise.template.html',
                    controller: 'WorkoutsDiagnosticExerciseController',
                    controllerAs: 'vm',
                    resolve: {
                        exerciseData: ["$q", "ExamSrv", "ExerciseTypeEnum", "ExerciseResultSrv", "WorkoutsDiagnosticFlow", function exerciseData($q, ExamSrv, ExerciseTypeEnum, ExerciseResultSrv, WorkoutsDiagnosticFlow) {
                            'ngInject';// jshint ignore:line
                            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                            var examId = WorkoutsDiagnosticFlow.getDiagnosticSettings().diagnosticId;
                            var sectionId = WorkoutsDiagnosticFlow.getCurrentState().params.sectionId;
                            var getExamProm = ExamSrv.getExam(examId);
                            var getSectionProm = ExamSrv.getExamSection(sectionId);
                            var getExamResultProm = ExerciseResultSrv.getExamResult(examId);
                            return $q.all([getExamProm, getSectionProm, getExamResultProm]).then(function (resArr) {
                                var examObj = resArr[0];
                                var section = resArr[1];
                                var examResultObj = resArr[2];
                                var getSectionResultProm = ExerciseResultSrv.getExerciseResult(ExerciseTypeEnum.SECTION.enum, sectionId, examId, examObj.sections.length);
                                return getSectionResultProm.then(function (sectionResult) {

                                    if (!sectionResult.questionResults.length) {
                                        sectionResult.questionResults = diagnosticSettings.isFixed ? section.questions.map(function (question) {
                                            return {questionId: question.id};
                                        }) : [];
                                        sectionResult.duration = 0;
                                    }

                                    sectionResult.$save();

                                    return {
                                        exerciseTypeId: sectionResult.exerciseTypeId,
                                        questionsData: section,
                                        resultsData: sectionResult,
                                        exam: examObj,
                                        examResult: examResultObj
                                    };
                                });
                            });
                        }]
                    },
                    onExit: ["exerciseData", "WorkoutsDiagnosticFlow", function (exerciseData, WorkoutsDiagnosticFlow) {
                        'ngInject'; // jshint ignore:line
                        var currentSection = WorkoutsDiagnosticFlow.getCurrentSection();

                        if (currentSection.done) {
                            WorkoutsDiagnosticFlow.markSectionAsDoneToggle(false);
                            return;
                        }

                        var questionResults = exerciseData.resultsData.questionResults;
                        var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                        var lastQuestion = questionResults[questionResults.length - 1];

                        var isCurrentQuestion = function(question) {
                            return question.questionId === currentSection.currentQuestion.id;
                        };
                        var isLastQuestion = function() {
                            return isCurrentQuestion(lastQuestion);
                        };

                        if (currentSection.currentQuestion) {
                            if(!diagnosticSettings.isFixed) {
                                if(isLastQuestion()) {
                                    delete lastQuestion.userAnswer;
                                } else {
                                    questionResults.pop();
                                    delete lastQuestion.userAnswer;
                                }
                            } else {
                                var answersArr = questionResults.filter(isCurrentQuestion);
                                if(answersArr.length > 0) {
                                    delete answersArr[0].userAnswer;
                                }
                            }
                            exerciseData.resultsData.$save();
                        }
                    }]
                })
                .state('app.diagnostic.preSummary', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticPreSummary.template.html',
                    controller: ['$timeout', '$state', function ($timeout, $state) {
                        var VIDEO_DURATION = 6000;
                        $timeout(function () {
                            $state.go('app.diagnostic.summary');
                        }, VIDEO_DURATION);
                    }],
                    controllerAs: 'vm'
                })
                .state('app.diagnostic.summary', {
                    templateUrl: 'components/diagnosticExercise/templates/workoutsDiagnosticSummary.template.html',
                    controller: 'WorkoutsDiagnosticSummaryController',
                    controllerAs: 'vm',
                    resolve: {
                        diagnosticSummaryData: ["EstimatedScoreSrv", "UserGoalsService", "$q", "WorkoutsDiagnosticFlow", "ScoringService", "$log", function (EstimatedScoreSrv, UserGoalsService, $q, WorkoutsDiagnosticFlow, ScoringService, $log) {
                            'ngInject';// jshint ignore:line
                            var userStatsProm = EstimatedScoreSrv.getLatestEstimatedScore().then(function (latestScores) {
                                var estimatedScores = {};
                                angular.forEach(latestScores, function (estimatedScore, subjectId) {
                                    estimatedScores[subjectId] = estimatedScore.score ? Math.round(estimatedScore.score) : null;
                                });
                                return estimatedScores;
                            });
                            var userGoalsProm = UserGoalsService.getGoals();
                            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
                            var diagnosticResult = WorkoutsDiagnosticFlow.getDiagnostic();
                            var scoringLimits = ScoringService.getScoringLimits();
                            return $q.all([userGoalsProm, userStatsProm, diagnosticResult]).then(function (results) {
                                var diagnosticScoresObjToArr = [];
                                var userStats = results[1];
                                angular.forEach(diagnosticSettings.summary.subjects, function (subject) {
                                    var curStat = userStats[subject.id];
                                    if (curStat) {
                                        diagnosticScoresObjToArr.push(curStat);
                                    }
                                });
                                var getExamScoreFnProm = ScoringService.getExamScoreFn(diagnosticScoresObjToArr);
                                return getExamScoreFnProm.then(function (examScoreFn) {
                                    var totalScore = examScoreFn(diagnosticScoresObjToArr);
                                    if (!totalScore) {
                                        $log.error('diagnosticSummaryData resolve of route diagnostic.summary: totalScore is empty! result:', totalScore);
                                    }
                                    return {
                                        userGoals: results[0],
                                        userStats: userStats,
                                        diagnosticResult: results[2],
                                        compositeScore: totalScore,
                                        scoringLimits: scoringLimits
                                    };
                                });
                            });
                        }]
                    }
                });
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise')
        .controller('WorkoutsDiagnosticController', ["$state", "currentState", function($state, currentState) {
        'ngInject';

        var EXAM_STATE = 'app.diagnostic';


        $state.go(EXAM_STATE + currentState.state, currentState.params);
    }]);
})(angular);


/* eslint object-shorthand: 0 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticExerciseController',
        ["ZnkExerciseSlideDirectionEnum", "ZnkExerciseViewModeEnum", "exerciseData", "WorkoutsDiagnosticFlow", "$location", "$log", "$state", "ExerciseResultSrv", "ExerciseTypeEnum", "$q", "$timeout", "ZnkExerciseUtilitySrv", "$rootScope", "ExamTypeEnum", "exerciseEventsConst", "$filter", "SubjectEnum", "znkAnalyticsSrv", "StatsEventsHandlerSrv", "$translate", function (ZnkExerciseSlideDirectionEnum, ZnkExerciseViewModeEnum, exerciseData, WorkoutsDiagnosticFlow, $location,
                  $log, $state, ExerciseResultSrv, ExerciseTypeEnum, $q, $timeout, ZnkExerciseUtilitySrv,
                  $rootScope, ExamTypeEnum, exerciseEventsConst, $filter, SubjectEnum, znkAnalyticsSrv, StatsEventsHandlerSrv,
                  $translate) {
            'ngInject';
            var self = this;
            this.subjectId = exerciseData.questionsData.subjectId;
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
                exerciseData.resultsData.isComplete = true;
                exerciseData.resultsData.endedTime = Date.now();
                exerciseData.resultsData.subjectId = exerciseData.questionsData.subjectId;
                exerciseData.resultsData.exerciseDescription = exerciseData.exam.name;
                exerciseData.resultsData.exerciseName = translateFilter('ZNK_EXERCISE.SECTION');
                exerciseData.resultsData.$save();
                exerciseData.exam.typeId = ExamTypeEnum.DIAGNOSTIC.enum;//  todo(igor): current diagnostic type is incorrect
                shouldBroadCastExerciseProm.then(function(shouldBroadcastFn) {
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
                return numQuestionCounter === _getNumberOfQuestions();
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

            function _setHeaderTitle(){
                var subjectTranslateKey = 'SUBJECTS.' + exerciseData.questionsData.subjectId;
                $translate(subjectTranslateKey).then(function(subjectTranslation){
                    var translateFilter = $filter('translate');
                    self.headerTitle = translateFilter('WORKOUTS_DIAGNOSTIC_EXERCISE.HEADER_TITLE',{
                        subject: $filter('capitalize')(subjectTranslation)
                    });
                },function(err){
                    $log.error('WorkoutsDiagnosticIntroController: ' + err);
                });
            }

            _setNumSlideForNgModel(numQuestionCounter);

            if (exerciseData.questionsData.subjectId === SubjectEnum.READING.enum) {     // adding passage title to reading questions
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

            //  current slide data (should be initialize in every slide)
            var currentDifficulty = diagnosticSettings.levels.medium.num;

            var initSlideIndex;
            var mediumLevelNum = diagnosticSettings.levels.medium.num;

            ZnkExerciseUtilitySrv.setQuestionsGroupData(exerciseData.questionsData.questions, exerciseData.questionsData.questionsGroupData, exerciseData.resultsData.playedAudioArticles);

            // init question and questionResults for znk-exercise
            if (!diagnosticSettings.isFixed) {
                if (resultsData.questionResults.length === 0) {
                    WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, resultsData.questionResults, mediumLevelNum, numQuestionCounter + 1, function (diagnosticFlowResults) {
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
                        WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, resultsData.questionResults, mediumLevelNum, numQuestionCounter + 1, function (diagnosticFlowResults) {
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
                    nextQuestion = void(0);
                    numQuestionCounter = numQuestionCounter + 1;
                    _setNumSlideForNgModel(numQuestionCounter);
                    znkAnalyticsSrv.pageTrack({props: {url: $location.url() + '/index/' + numQuestionCounter + '/questionId/' + (value.id || '')}});
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
                        WorkoutsDiagnosticFlow.getQuestionsByDifficultyAndOrder(questions, self.resultsData.questionResults, newDifficulty, numQuestionCounter + 1, function (newQuestion) {
                            _handleNewSlide(newQuestion);
                        });
                    }
                },
                onDone: function () {
                    WorkoutsDiagnosticFlow.markSectionAsDoneToggle(true);
                    _onDoneSaveResultsData();
                    _isLastSubject().then(function (isLastSubject) {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'diagnosticSectionCompleted',
                            questionsArr: exerciseData.resultsData.questionResults,
                            props: {
                                sectionId: exerciseData.questionsData.id,
                                order: exerciseData.questionsData.order,
                                subjectId: exerciseData.questionsData.subjectId
                            }
                        });
                        if (isLastSubject) {
                            _goToCurrentState(true);
                        } else {
                            _goToCurrentState();
                        }
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
        }]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticIntroController',
        ["WORKOUTS_DIAGNOSTIC_FLOW", "$log", "$state", "WorkoutsDiagnosticFlow", "znkAnalyticsSrv", "$translate", "$filter", "$rootScope", function(WORKOUTS_DIAGNOSTIC_FLOW, $log, $state, WorkoutsDiagnosticFlow, znkAnalyticsSrv, $translate, $filter, $rootScope) {
        'ngInject';
            var vm = this;

            vm.params = WorkoutsDiagnosticFlow.getCurrentState().params;
            vm.diagnosticId = WorkoutsDiagnosticFlow.getDiagnosticSettings().diagnosticId;

            function _setHeaderTitle(){
                var subjectTranslateKey = 'SUBJECTS.' + vm.params.subjectId;
                $translate(subjectTranslateKey).then(function(subjectTranslation){
                    var translateFilter = $filter('translate');
                    vm.headerTitle = translateFilter('WORKOUTS_DIAGNOSTIC_INTRO.HEADER_TITLE',{
                        subject: $filter('capitalize')(subjectTranslation)
                    });
                },function(err){
                    $log.error('WorkoutsDiagnosticIntroController: ' + err);
                });
            }

            _setHeaderTitle();

            WorkoutsDiagnosticFlow.getDiagnostic().then(function (results) {
                vm.buttonTitle = (angular.equals(results.sectionResults, {})) ? 'START' : 'CONTINUE';
            });

            this.onClickedQuit = function () {
                $log.debug('WorkoutsDiagnosticIntroController: click on quit, go to roadmap');
                $state.go('app.workouts.roadmap');
            };

            this.goToExercise = function () {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'diagnosticSectionStarted',
                    props: {
                        sectionId: vm.params.sectionId,
                        order: vm.params.order,
                        subjectId: vm.params.subjectId
                    }
                });
                znkAnalyticsSrv.timeTrack({ eventName: 'diagnosticSectionCompleted' });
                $state.go('app.diagnostic.exercise');
            };

            $rootScope.$on('$translateChangeSuccess', function () {
                _setHeaderTitle();
            });
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').controller('WorkoutsDiagnosticSummaryController',
        ["diagnosticSummaryData", "SubjectEnum", "SubjectEnumConst", "WorkoutsDiagnosticFlow", function(diagnosticSummaryData, SubjectEnum, SubjectEnumConst, WorkoutsDiagnosticFlow) {
        'ngInject';

            var self = this;

            var diagnosticScoresObj = diagnosticSummaryData.userStats;
            var goalScoreObj = diagnosticSummaryData.userGoals;
            var diagnosticResultObj = diagnosticSummaryData.diagnosticResult;
            var diagnosticCompositeScore = diagnosticSummaryData.compositeScore;
            var diagnosticSettings = WorkoutsDiagnosticFlow.getDiagnosticSettings();
            var scoringLimits = diagnosticSummaryData.scoringLimits;
            var enumArrayMap = {};
            angular.forEach(SubjectEnum, function (enumObj) {
                enumArrayMap[enumObj.enum] = enumObj;
            });

            function getMaxScore(subjectId) {
                if(scoringLimits.subjects && scoringLimits.subjects.max) {
                    return scoringLimits.subjects.max;
                }
                return scoringLimits.subjects[subjectId] && scoringLimits.subjects[subjectId].max;
            }

            var GOAL = 'Goal';
            var MAX = 'Max';

            if (!diagnosticResultObj.userStats) {
                diagnosticResultObj.userStats = diagnosticScoresObj;
                diagnosticResultObj.compositeScore = diagnosticCompositeScore;
                diagnosticResultObj.$save();
            }

            self.isSubjectsWaitToBeEvaluated = false;

            for (var i in diagnosticScoresObj) {
                if (diagnosticScoresObj.hasOwnProperty(i)) {
                    if (diagnosticScoresObj[i] === null) {
                        self.isSubjectsWaitToBeEvaluated = true;
                        break;
                    }
                }
            }

            if(self.isSubjectsWaitToBeEvaluated) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.EVALUATE_START';
            } else if (diagnosticResultObj.compositeScore > diagnosticSettings.summary.greatStart) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.GREAT_START';
            } else if (diagnosticResultObj.compositeScore > diagnosticSettings.summary.goodStart) {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.GOOD_START';
            } else {
                self.footerTranslatedText = 'WORKOUTS_DIAGNOSTIC_SUMMARY.BAD_START';
            }

            this.compositeScore = diagnosticResultObj.compositeScore;

            var doughnutValues = {};
            for (var subjectId in diagnosticResultObj.userStats) {
                if (diagnosticResultObj.userStats.hasOwnProperty(subjectId)) {
                    var subjectName = enumArrayMap[subjectId].val;
                    doughnutValues[subjectName] = diagnosticResultObj.userStats[subjectId];
                    doughnutValues[subjectName + GOAL] = goalScoreObj[subjectName] > diagnosticResultObj.userStats[subjectId] ? (goalScoreObj[subjectName] - diagnosticResultObj.userStats[subjectId]) : 0;
                    doughnutValues[subjectName + MAX] = getMaxScore(subjectId) - (doughnutValues[subjectName + GOAL] + diagnosticResultObj.userStats[subjectId]);
                }
            }

            function GaugeConfig(_subjectName, _subjectId, colorsArray) {
                this.labels = ['Correct', 'Wrong', 'Unanswered'];
                this.options = {
                    scaleLineWidth: 40,
                    percentageInnerCutout: 92,
                    segmentShowStroke: false,
                    animationSteps: 100,
                    animationEasing: 'easeOutQuint',
                    showTooltips: false
                };
                this.goalPoint = getGoalPoint(goalScoreObj[_subjectName], _subjectId);
                this.data = [doughnutValues[_subjectName], doughnutValues[_subjectName + GOAL], doughnutValues[_subjectName + MAX]];
                this.colors = colorsArray;
                this.subjectName  =  'WORKOUTS_DIAGNOSTIC_SUMMARY.' + angular.uppercase(_subjectName);
                this.score = diagnosticResultObj.userStats[_subjectId];
                this.scoreGoal = goalScoreObj[_subjectName];
            }

            function getGoalPoint(scoreGoal, subjectId) {
                var degree = (scoreGoal / getMaxScore(subjectId)) * 360 - 90;    // 90 - degree offset
                var radius = 52.5;
                var x = Math.cos((degree * (Math.PI / 180))) * radius;
                var y = Math.sin((degree * (Math.PI / 180))) * radius;
                x += 105;
                y += 49;
                return {
                    x: x,
                    y: y
                };
            }
            var dataArray = [];
            angular.forEach(diagnosticSettings.summary.subjects, function(subject) {
                dataArray.push(new GaugeConfig(subject.name, subject.id, subject.colors));
            });

            this.doughnutArray = dataArray;
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').constant('WORKOUTS_DIAGNOSTIC_FLOW', {
        isFixed: false,
        timeLimit: 3 * 60 * 1000,
        questionsPerSubject: 4,
        levels: {
            very_easy: {
                num: 1
            },
            easy: {
                num: 2
            },
            medium: {
                num: 3
            },
            hard: {
                num: 4
            },
            very_hard: {
                num: 5
            }
        }
    });

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticExercise').provider('WorkoutsDiagnosticFlow',[function () {

        var _diagnosticSettings;

        this.setDiagnosticSettings = function(diagnosticSettings) {
            _diagnosticSettings = diagnosticSettings;
        };

        this.$get = ['WORKOUTS_DIAGNOSTIC_FLOW', '$log', 'ExerciseTypeEnum', '$q', 'ExamSrv', 'ExerciseResultSrv', 'znkAnalyticsSrv', '$injector',
            function (WORKOUTS_DIAGNOSTIC_FLOW, $log, ExerciseTypeEnum, $q, ExamSrv, ExerciseResultSrv, znkAnalyticsSrv, $injector) {
            var workoutsDiagnosticFlowObjApi = {};
            var currentSectionData = {};
            var countDifficultySafeCheckErrors = 0;
            var countQuestionsByDifficultyAndOrderErrors = 0;
            var currentState;

            workoutsDiagnosticFlowObjApi.getDiagnosticSettings = function() {
                var diagnosticData = $injector.invoke(_diagnosticSettings);
                return angular.extend(WORKOUTS_DIAGNOSTIC_FLOW, diagnosticData);
            };

            workoutsDiagnosticFlowObjApi.setCurrentQuestion = function (questionId, index)  {
                currentSectionData.currentQuestion = { id: questionId, index: index };
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

           workoutsDiagnosticFlowObjApi.getDiagnosticFlowCurrentState = function (flagForPreSummery, skipIntroBool) {
                $log.debug('WorkoutsDiagnosticFlow getDiagnosticFlowCurrentState: initial func', arguments);
                currentState = { state: '', params: '', subjectId: '' };
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
                            currentState.params = { id: exam.id, sectionId: currentSection.id, subjectId: currentSection.subjectId, order: currentSection.order };
                        } else {
                            currentState.state = '.exercise';
                            currentState.subjectId = currentSection.subjectId;
                            currentState.params = { id: exam.id, sectionId: currentSection.id };
                        }
                        return currentState;
                    });
                });
            };

            workoutsDiagnosticFlowObjApi.getQuestionsByDifficultyAndOrder = function (questions, results, difficulty, order, cb, difficultyType) {
                difficultyType = difficultyType || 'increment';
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
                    _getDifficultySafeCheck(difficulty, difficultyType, function (difficultySafe, type) {
                        countQuestionsByDifficultyAndOrderErrors += 1;
                        if (countQuestionsByDifficultyAndOrderErrors < 10) {
                            workoutsDiagnosticFlowObjApi.getQuestionsByDifficultyAndOrder(questions, results, difficultySafe, order, cb, type);
                        }
                    });
                } else {
                    cb(diagnosticFlowResults);
                }
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

            return workoutsDiagnosticFlowObjApi;
        }];
    }]);

})(angular);


angular.module('znk.infra-web-app.diagnosticExercise').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/diagnosticExercise/svg/diagnostic-check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"diagnostic-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .diagnostic-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/svg/flag-icon.svg",
    "<svg x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-145 277 60 60\"\n" +
    "	 class=\"flag-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .flag-svg .st0 {\n" +
    "            fill: #ffffff;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "            width:25px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g id=\"kUxrE9.tif\">\n" +
    "	<g>\n" +
    "		<path class=\"st0\" id=\"XMLID_93_\" d=\"M-140.1,287c0.6-1.1,1.7-1.7,2.9-1.4c1.3,0.3,2,1.1,2.3,2.3c1.1,4,2.1,8,3.2,12c2.4,9.3,4.9,18.5,7.3,27.8\n" +
    "			c0.1,0.3,0.2,0.6,0.2,0.9c0.3,1.7-0.6,3-2.1,3.3c-1.4,0.3-2.8-0.5-3.3-2.1c-1-3.6-2-7.3-2.9-10.9c-2.5-9.5-5-19-7.6-28.6\n" +
    "			C-140.1,290-140.8,288.3-140.1,287z\"/>\n" +
    "		<path class=\"st0\" id=\"XMLID_92_\" d=\"M-89.6,289.1c-1,6.8-2.9,13-10,16c-3.2,1.4-6.5,1.6-9.9,0.9c-2-0.4-4-0.7-6-0.6c-4.2,0.3-7.1,2.7-9,6.4\n" +
    "			c-0.3,0.5-0.5,1.1-0.9,2c-0.3-1-0.5-1.7-0.8-2.5c-2-7-3.9-14.1-5.9-21.2c-0.3-1-0.1-1.7,0.5-2.4c4.5-6,11-7.4,17.5-3.6\n" +
    "			c3.4,2,6.7,4.2,10.2,6.1c1.9,1,3.9,1.9,5.9,2.4c3.2,0.9,5.9,0,7.9-2.6C-90,289.7-89.8,289.4-89.6,289.1z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnostic.template.html",
    "<div class=\"app-workouts-diagnostic\">\n" +
    "    <ui-view class=\"exercise-container base-border-radius base-box-shadow\"></ui-view>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnosticExercise.template.html",
    "<znk-exercise-header\n" +
    "    subject-id=\"vm.subjectId\"\n" +
    "    side-text=\"vm.headerTitle\"\n" +
    "    options=\"{ showQuit: true, showNumSlide: true }\"\n" +
    "    on-clicked-quit=\"vm.onClickedQuit()\"\n" +
    "    ng-model=\"vm.numSlide\"\n" +
    "    total-slide-num=\"{{vm.questionsPerSubject}}\"></znk-exercise-header>\n" +
    "<znk-exercise\n" +
    "    questions=\"vm.questions\"\n" +
    "    ng-model=\"vm.resultsData.questionResults\"\n" +
    "    settings=\"vm.settings\"\n" +
    "    actions=\"vm.actions\"\n" +
    "    audio-manager=\"vm.resultsForAudioManager\">\n" +
    "</znk-exercise>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnosticIntro.template.html",
    "<znk-exercise-header\n" +
    "    subject-id=\"vm.params.subjectId\"\n" +
    "    side-text=\"vm.headerTitle\"\n" +
    "    options=\"{ showQuit: true }\"\n" +
    "    on-clicked-quit=\"vm.onClickedQuit()\">\n" +
    "</znk-exercise-header>\n" +
    "<diagnostic-intro show-instructions=\"true\"></diagnostic-intro>\n" +
    "<div class=\"btn-wrap\">\n" +
    "    <button autofocus tabindex=\"1\" class=\"md-button znk md-primary\" ng-click=\"vm.goToExercise()\" translate=\"{{::vm.buttonTitle}}\" aria-label=\"{{::vm.buttonTitle}}\">\n" +
    "        <svg-icon name=\"diagnostic-dropdown-arrow-icon\"></svg-icon>\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnosticPreSummary.template.html",
    "<div class=\"diagnostic-loading-wrapper\" translate-namespace=\"WORKOUTS_DIAGNOSTIC_PRE_SUMMARY\">\n" +
    "    <p class=\"loading-title\" translate=\".READY\"></p>\n" +
    "    <div class=\"video-wrapper\">\n" +
    "        <video loop autoplay\n" +
    "               preload=\"auto\"\n" +
    "               poster=\"/assets/images/poster/diagnostic-pre-summary.png\">\n" +
    "            <source src=\"/assets/videos/hoping-raccoon.mp4\" type=\"video/mp4\">\n" +
    "        </video>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticExercise/templates/workoutsDiagnosticSummary.template.html",
    "<div class=\"diagnostic-summary-wrapper\" translate-namespace=\"WORKOUTS_DIAGNOSTIC_SUMMARY\">\n" +
    "    <div class=\"title\" ng-switch on=\"vm.isSubjectsWaitToBeEvaluated\">\n" +
    "        <div ng-switch-when=\"false\">\n" +
    "            <div translate=\".YOUR_INITIAL_SCORE_ESTIMATE\"></div>\n" +
    "            <span translate=\".COMPOSITE_SCORE\"></span>\n" +
    "            <span> {{::vm.compositeScore}}</span>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"true\">\n" +
    "            <span translate=\".ESTIMATED_SCORE\"></span>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"doughnuts-container\">\n" +
    "        <div class=\"all-doughnuts-wrapper\" ng-repeat=\"doughnut in vm.doughnutArray track by $index\">\n" +
    "            <div class=\"doughnut-wrapper\">\n" +
    "                <p class=\"subject-name\" translate=\"{{doughnut.subjectName}}\"></p>\n" +
    "                <div class=\"znk-doughnut\">\n" +
    "                    <div class=\"white-bg-doughnut-score\">\n" +
    "                        {{!doughnut.score ? '-' : doughnut.score }}\n" +
    "                    </div>\n" +
    "                    <div class=\"goal-point\"\n" +
    "                         ng-style=\"::{top:doughnut.goalPoint.y + 'px', left:doughnut.goalPoint.x + 'px'}\">\n" +
    "                        <div class=\"goal-point-bg\">\n" +
    "                            <div ng-style=\"::{'background': ''+ doughnut.colors[0]}\"\n" +
    "                                 class=\"goal-point-subject-color\"></div>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <canvas id=\"doughnut\"\n" +
    "                            class=\"chart chart-doughnut\"\n" +
    "                            chart-colours=\"doughnut.colors\"\n" +
    "                            chart-data=\"doughnut.data\"\n" +
    "                            chart-labels=\"doughnut.labels\"\n" +
    "                            chart-options=\"doughnut.options\"\n" +
    "                            chart-legend=\"false\">\n" +
    "                    </canvas>\n" +
    "                    <md-tooltip\n" +
    "                        ng-if=\"doughnut.scoreGoal > doughnut.score\"\n" +
    "                        class=\"tooltip-for-diagnostic-summary md-whiteframe-2dp\"\n" +
    "                        md-direction=\"top\">\n" +
    "                        <span\n" +
    "                            translate=\".GOAL_TOOLTIP\"\n" +
    "                            translate-values=\"{ ptsToGoal: {{doughnut.scoreGoal - doughnut.score}} }\">\n" +
    "                        </span>\n" +
    "                    </md-tooltip>\n" +
    "                </div>\n" +
    "                <div class=\"your-goal-wrapper\">\n" +
    "                    <span class=\"score-goal\" translate=\".YOUR_GOAL\"></span>\n" +
    "                    <span class=\"score-value\">\n" +
    "                        {{::doughnut.scoreGoal}}\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"footer-text\" translate=\"{{vm.footerTranslatedText}}\"></div>\n" +
    "    <button autofocus tabindex=\"1\"\n" +
    "            class=\"start-button md-button znk md-primary\"\n" +
    "            ui-sref=\"app.workouts.roadmap.diagnostic\"\n" +
    "            translate=\".DONE\">DONE\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticIntro', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.config',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'diagnostic-intro-check-mark': 'components/diagnosticIntro/svg/diagnostic-intro-check-mark-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticIntro')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "DIAGNOSTIC_INTRO": {
                            "QUESTIONS": "questions",
                            "INSTRUCTIONS_TITLE": "Instructions:"
                        }
                    }
                );
            }]);
})(angular);

'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').directive('diagnosticIntro',
    ["DiagnosticIntroSrv", "$log", function (DiagnosticIntroSrv, $log) {
        'ngInject';

        var directive = {
            restrict: 'E',
            scope: {
                showInstructions: '=?'
            },
            templateUrl: 'components/diagnosticIntro/diagnosticIntro.template.html',
            link: function link(scope) {
                scope.d = {};

                var translateMap = {
                    diagDesc: '.DIAG_DESCRIPTION_',
                    diagSubjectText: '.DIAG_SUBJECT_TEXT_',
                    diagSubjectName: '.DIAG_SUBJECT_NAME_',
                    diagIns: '.DIAG_INSTRUCTIONS_'
                };

                DiagnosticIntroSrv.getActiveData().then(function (activeId) {
                    scope.d.activeId = activeId;
                    return DiagnosticIntroSrv.getConfigMap();
                }).then(function (mapData) {
                    if (!angular.isArray(mapData.subjects)) {
                        $log.error('DiagnosticIntroDirective: configMap must have subjects array!');
                    }
                    var currMapData;
                    var currMapIndex;

                    scope.d.subjects = mapData.subjects.map(function (subject, index) {
                        subject.mapId = index + 1;
                        return subject;
                    });

                    switch (scope.d.activeId) {
                        case 'none':
                            currMapIndex = -1;
                            currMapData = mapData.none;
                            break;
                        case 'all':
                            currMapIndex = Infinity;
                            currMapData = mapData.all;
                            break;
                        default:
                            currMapData = scope.d.subjects.filter(function (subject) {
                                return subject.id === scope.d.activeId;
                            })[0];
                            currMapIndex = currMapData.mapId;
                    }

                    scope.d.currMapData = currMapData;

                    angular.forEach(translateMap, function(val, key) {
                        scope.d.currMapData[key] = val + angular.uppercase(currMapData.subjectNameAlias);
                    });

                    scope.d.currMapIndex = currMapIndex;
                }).catch(function (err) {
                    $log.error('DiagnosticIntroDirective: Error catch' + err);
                });
            }
        };

        return directive;
    }]);

'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').provider('DiagnosticIntroSrv', [
    function DiagnosticIntroSrv() {

        var _activeData;

        var _configMap;

        this.setActiveSubjectGetter = function(activeData) {
            _activeData = activeData;
        };

        this.setConfigGetter = function(configMap) {
            _configMap = configMap;
        };

        this.$get = ['$injector', '$log', '$q', function($injector, $log, $q) {
            return {
                getActiveData: function() {
                    if (!_activeData) {
                        var errorMsg = 'DiagnosticIntroSrv: no activeData!'; 
                        $log.error(errorMsg);
                        return $q.reject(errorMsg);
                    }
                    return $q.when($injector.invoke(_activeData));
                },
                getConfigMap: function() {
                    if (!_configMap) {
                        var errorMsg = 'DiagnosticIntroSrv: no configMap!';
                        $log.error(errorMsg);
                        return $q.reject(errorMsg);
                    }
                    return $q.when($injector.invoke(_configMap));
                }
            };
        }];
}]);

angular.module('znk.infra-web-app.diagnosticIntro').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/diagnosticIntro/diagnosticIntro.template.html",
    "<div class=\"diagnostic-intro-drv\" translate-namespace=\"DIAGNOSTIC_INTRO\">\n" +
    "    <div class=\"description\">\n" +
    "        <div class=\"diagnostic-text\"\n" +
    "             translate=\"{{d.currMapData.diagDesc}}\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"icons-section\">\n" +
    "        <div ng-repeat=\"subject in d.subjects\"\n" +
    "             class=\"icon-circle {{subject.subjectNameAlias}}-color\"\n" +
    "             ng-class=\"{\n" +
    "                    active: subject.mapId === d.currMapIndex,\n" +
    "                    done: subject.mapId < d.currMapIndex,\n" +
    "                    pristine: d.currMapIndex === -1\n" +
    "            }\">\n" +
    "            <div class=\"icon-wrapper\">\n" +
    "                <svg-icon class=\"subject-icon\" name=\"{{subject.subjectIconName}}\"></svg-icon>\n" +
    "                <svg-icon class=\"section-complete\" name=\"diagnostic-intro-check-mark\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"raccoon-img-container\">\n" +
    "        <div class=\"raccoon-img-wrapper\">\n" +
    "            <div class=\"diagnostic-raccoon\" ng-class=\"'diagnostic-raccoon-'+d.currMapData.subjectNameAlias\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"section-question\" ng-if=\"d.currMapData && !d.currMapData.hideSectionQuestion\">\n" +
    "            <div>\n" +
    "                <span translate=\"{{d.currMapData.diagSubjectText}}\" ng-cloak></span>\n" +
    "                <span\n" +
    "                    class=\"{{d.currMapData.subjectNameAlias}}\"\n" +
    "                    translate=\"{{d.currMapData.diagSubjectName}}\">\n" +
    "                </span>\n" +
    "                <span translate=\".QUESTIONS\"></span>\n" +
    "                <div class=\"diagnostic-instructions\" ng-if=\"showInstructions\">\n" +
    "                    <span class=\"diagnostic-instructions-title\" translate=\".INSTRUCTIONS_TITLE\"></span>\n" +
    "                    <span class=\"diagnostic-instructions-text\" translate=\"{{d.currMapData.diagIns}}\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticIntro/svg/diagnostic-intro-check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"diagnostic-intro-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .diagnostic-intro-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.enum',
        'znk.infra.config',
        'znk.infra.storage',
        'znk.infra.general',
        'znk.infra.exerciseResult',
        'znk.infra.utility',
        'znk.infra.contentAvail',
        'znk.infra.content',
        'znk.infra.znkExercise',
        'znk.infra.scroll',
        'znk.infra.autofocus',
        'znk.infra.exerciseUtility',
        'znk.infra.estimatedScore',
        'znk.infra.scoring',
        'znk.infra.svgIcon',
        'znk.infra.analytics',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.diagnostic'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'estimated-score-widget-goals': 'components/estimatedScoreWidget/svg/goals-top-icon.svg',
                'estimated-score-widget-close-popup': 'components/estimatedScoreWidget/svg/estimated-score-widget-close-popup.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ESTIMATED_SCORE_WIDGET_DIRECTIVE": {
                            "PTS_TO_GO": "You are {{pts}}pt away",
                            "YOUR_GOAL": "Your Goal: {{goal}}",
                            "GOAL_REACHED": "you've reached your goal!",
                            "COMPOSITE_SCORE": "Total Score:",
                            "GOAL_SCORE": "Goal Score:",
                            "EDIT_MY_GOALS": "Edit my goals",
                            "0": "Math",
                            "1": "English",
                            "7": "Verbal",
                            "8": "Essay",
                            "UNFINISHED_DIAGNOSTIC_TITLE": "Set your initial score by completing the diagnostic test."
                        },
                        "SETTING.EDIT_GOALS": {
                            "MY_GOALS": "My Goals"
                        }
                    }
                );
            }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').directive('estimatedScoreWidget',
        ["EstimatedScoreSrv", "$q", "SubjectEnum", "UserGoalsService", "EstimatedScoreWidgetSrv", "userGoalsSelectionService", "$timeout", "ScoringService", "DiagnosticSrv", function (EstimatedScoreSrv, $q, SubjectEnum, UserGoalsService, EstimatedScoreWidgetSrv, userGoalsSelectionService, $timeout, ScoringService, DiagnosticSrv) {
            'ngInject';
            var previousValues;

            return {
                templateUrl: 'components/estimatedScoreWidget/templates/estimatedScoreWidget.template.html',
                require: '?ngModel',
                restrict: 'E',
                scope: {
                    isNavMenu: '@',
                    widgetTitle: '@'
                },
                link: function (scope, element, attrs, ngModelCtrl) {
                    scope.d = {};

                    var isNavMenuFlag = (scope.isNavMenu === 'true');
                    var scores;

                    var getLatestEstimatedScoreProm = EstimatedScoreSrv.getEstimatedScoresData();
                    var getSubjectOrderProm = EstimatedScoreWidgetSrv.getSubjectOrder();
                    var getExamScoreProm = ScoringService.getExamScoreFn();
                    var isDiagnosticCompletedProm = DiagnosticSrv.getDiagnosticStatus();
                    var subjectEnumToValMap = SubjectEnum.getEnumMap();

                    if (isNavMenuFlag) {
                        angular.element.addClass(element[0], 'is-nav-menu');
                    }

                    function adjustWidgetData(userGoals) {
                        $q.all([
                            getLatestEstimatedScoreProm,
                            isDiagnosticCompletedProm,
                            $q.when(false),
                            getSubjectOrderProm,
                            getExamScoreProm
                        ]).then(function (res) {
                            var estimatedScore = res[0];
                            var isDiagnosticCompleted = res[1];
                            var subjectOrder = res[3];
                            var examScoresFn = res[4];

                            scope.d.isDiagnosticComplete = isDiagnosticCompleted === 2;

                            scope.d.userCompositeGoal = (userGoals) ? userGoals.totalScore : '-';
                            scope.d.widgetItems = subjectOrder.map(function (subjectId) {
                                var userGoalForSubject = (userGoals) ? userGoals[subjectEnumToValMap[subjectId]] : 0;
                                var estimatedScoreForSubjectArr = estimatedScore[subjectId];
                                var estimatedScoreForSubject = estimatedScoreForSubjectArr[estimatedScoreForSubjectArr.length - 1];
                                var isSubjectExist = estimatedScoreForSubject && estimatedScoreForSubject.score;
                                return {
                                    subjectId: subjectId,
                                    estimatedScore: (scope.d.isDiagnosticComplete && (isSubjectExist && typeof (estimatedScoreForSubject.score) === 'number')) ? estimatedScoreForSubject.score : '-',
                                    estimatedScorePercentage: (scope.d.isDiagnosticComplete && isSubjectExist) ? calcPercentage(estimatedScoreForSubject.score) : 0,
                                    userGoal: userGoalForSubject,
                                    userGoalPercentage: calcPercentage(userGoalForSubject),
                                    pointsLeftToMeetUserGoal: (scope.d.isDiagnosticComplete && isSubjectExist) ? (userGoalForSubject - estimatedScoreForSubject.score) : 0,
                                    showScore: (typeof userGoals[subjectEnumToValMap[subjectId]] !== 'undefined')
                                };
                            });

                            scores = createAndCountScoresArray(scope.d.widgetItems);

                            scope.d.estimatedCompositeScore = scores.scoresArr.length === scores.subjectsToShow ? examScoresFn(scores.scoresArr): '-';

                            function filterSubjects(widgetItem) {
                                return !!('showScore' in widgetItem && (widgetItem.showScore) !== false);
                            }

                            scope.d.widgetItems = scope.d.widgetItems.filter(filterSubjects);

                            if (isNavMenuFlag) {
                                if (angular.isUndefined(scope.d.currentSubject)) {
                                    scope.d.onSubjectClick(scope.d.widgetItems[0].subjectId);
                                }
                            }

                            if (previousValues) {
                                scope.d.subjectsScores = previousValues;
                            }

                            $timeout(function () {
                                scope.d.enableEstimatedScoreChangeAnimation = true;
                                $timeout(function () {
                                    scope.d.subjectsScores = scope.d.widgetItems;
                                }, 1200);
                            });
                            previousValues = scope.d.widgetItems;
                        });
                    }

                    function createAndCountScoresArray(subjectsArr) {
                        var scoresArr = [];
                        var subjectsToShow = 0;
                        for (var i = 0; i < subjectsArr.length; i++) {
                            if (typeof (subjectsArr[i].estimatedScore) === 'number') {
                                scoresArr.push(subjectsArr[i].estimatedScore);
                            }
                            if (subjectsArr[i].showScore) {
                                subjectsToShow++;
                            }
                        }
                        var scores = {
                            scoresArr: scoresArr,
                            subjectsToShow: subjectsToShow
                        };
                        return scores;
                    }

                    function calcPercentage(correct) {
                        var scoringLimits = ScoringService.getScoringLimits();
                        var maxEstimatedScore = typeof scoringLimits.subjects[Object.getOwnPropertyNames(scoringLimits.subjects)] !== 'undefined' ? scoringLimits.subjects[Object.getOwnPropertyNames(scoringLimits.subjects)].max : scoringLimits.subjects.max;
                        return (correct / maxEstimatedScore) * 100;
                    }

                    scope.d.showGoalsEdit = function () {
                        userGoalsSelectionService.openEditGoalsDialog();
                    };

                    if (isNavMenuFlag) {
                        scope.d.onSubjectClick = function (subjectId) {
                            ngModelCtrl.$setViewValue(+subjectId);
                            scope.d.currentSubject = subjectId;
                        };

                        ngModelCtrl.$render = function () {
                            scope.d.currentSubject = ngModelCtrl.$viewValue;
                        };
                    }

                    UserGoalsService.getGoals().then(function (userGoals) {
                        scope.$watchCollection(function () {
                            return userGoals;
                        }, function (newVal) {
                            adjustWidgetData(newVal);
                        });
                    });
                }
            };
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.estimatedScoreWidget').provider('EstimatedScoreWidgetSrv', [
        function () {
            var _subjectOrderGetter;
            this.setSubjectOrder = function(subjectOrderGetter){
                _subjectOrderGetter = subjectOrderGetter;
            };

            this.$get = ["$log", "$injector", "$q", function ($log, $injector, $q) {
                'ngInject';

                var EstimatedScoreWidgetSrv = {};

                EstimatedScoreWidgetSrv.getSubjectOrder = function(){
                    if(!_subjectOrderGetter){
                        var errMsg = 'EstimatedScoreWidgetSrv: subjectOrderGetter was not set';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return $q.when($injector.invoke(_subjectOrderGetter));
                };

                return EstimatedScoreWidgetSrv;
            }];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.estimatedScoreWidget').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/estimatedScoreWidget/svg/estimated-score-widget-close-popup.svg",
    "<svg\n" +
    "    class=\"estimated-score-widget-close-popup-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .estimated-score-widget-close-popup-svg .st1{\n" +
    "            fill:none;\n" +
    "            stroke: white;\n" +
    "            stroke-width: 6px;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/estimatedScoreWidget/svg/goals-top-icon.svg",
    "<svg class=\"estimated-score-widget-goals-svg\" x=\"0px\" y=\"0px\" viewBox=\"-632.7 361.9 200 200\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .estimated-score-widget-goals-svg .st0{fill:none;}\n" +
    "        .estimated-score-widget-goals-svg .st1{fill: white;}\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<path class=\"st1\" d=\"M-632.7,473.9c7.1,0.1,14.2,0.4,21.4,0.4c3,0,4.1,0.9,4.9,4c7.8,30.3,26.9,49.5,57.3,57.3c3.2,0.8,4,2,3.9,4.9\n" +
    "		c-0.3,7.1-0.3,14.3-0.4,21.4c-1.3,0-5.4-0.8-6.2-1c-36.3-7.9-61.4-29.2-75.2-63.6C-629.5,491.3-632.7,475.5-632.7,473.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-519.7,561.9c-0.1-7.6-0.4-15.2-0.3-22.9c0-1.1,1.7-2.7,2.8-3c31.2-7.9,50.7-27.4,58.6-58.6c0.3-1.3,2.6-2.8,4-2.9\n" +
    "		c7.3-0.4,14.6-0.4,21.9-0.6c0,1.7-0.8,6.4-1,7.2c-8,36.5-29.4,61.7-64.1,75.4C-503.6,558.7-518.3,561.9-519.7,561.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-545.7,361.9c0.1,7.5,0.4,15,0.3,22.4c0,1.2-1.7,3.1-2.9,3.4c-31.1,7.9-50.5,27.3-58.4,58.5c-0.3,1.2-1.9,2.9-3,2.9\n" +
    "		c-7.6,0.1-15.3-0.1-22.9-0.3c0-1.3,0.8-5.4,1-6.2c7.7-35.8,28.5-60.7,62.2-74.7C-563.1,365.4-547,361.9-545.7,361.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-432.7,448.9c-7.6,0.1-15.3,0.4-22.9,0.2c-1.1,0-2.8-2.3-3.2-3.8c-7.3-27.7-24.3-46.4-51.5-55.6\n" +
    "		c-9.8-3.3-9.9-3.1-9.8-13.4c0-4.8,0.3-9.6,0.4-14.4c1.3,0,5.4,0.8,6.2,1c36.6,7.9,61.7,29.4,75.4,64.1\n" +
    "		C-435.8,432.7-432.7,447.5-432.7,448.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-581.2,474.6c12,0,23.6,0,35.5,0c0,12,0,23.7,0,35.4C-560.5,508.7-577.8,491.6-581.2,474.6z\"/>\n" +
    "	<path class=\"st1\" d=\"M-519.8,474.6c12,0,23.7,0,35.4,0c-2.3,16-19.5,33.2-35.4,35.5C-519.8,498.4-519.8,486.7-519.8,474.6z\"/>\n" +
    "	<path class=\"st1\" d=\"M-545.9,448.9c-11.9,0-23.5,0-35.7,0c5.6-18.4,17.2-30,35.7-35.9C-545.9,425.2-545.9,436.9-545.9,448.9z\"/>\n" +
    "	<path class=\"st1\" d=\"M-519.8,413.5c16.2,2.7,32.7,19.2,35.5,35.4c-11.8,0-23.5,0-35.5,0C-519.8,437.1-519.8,425.5-519.8,413.5z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/estimatedScoreWidget/templates/estimatedScoreWidget.template.html",
    "<div class=\"score-estimate-container base-border-radius base-box-shadow\"\n" +
    "     ng-class=\"{'estimated-score-animation': d.enableEstimatedScoreChangeAnimation}\"\n" +
    "     translate-namespace=\"ESTIMATED_SCORE_WIDGET_DIRECTIVE\">\n" +
    "    <div class=\"title\" translate=\"{{::widgetTitle}}\"></div>\n" +
    "    <div class=\"unfinished-diagnostic-title\" ng-if=\"!d.isDiagnosticComplete\" translate=\".UNFINISHED_DIAGNOSTIC_TITLE\"></div>\n" +
    "    <div class=\"subjects-wrap\">\n" +
    "        <div ng-repeat=\"widgetItem in d.subjectsScores track by widgetItem.subjectId\"\n" +
    "             ng-click=\"d.onSubjectClick(widgetItem.subjectId)\"\n" +
    "             ng-class=\"{ 'selected': (d.currentSubject === widgetItem.subjectId) }\"\n" +
    "             class=\"subject\"\n" +
    "             subject-id-to-attr-drv=\"{{widgetItem.subjectId}}\"\n" +
    "             context-attr=\"class\"\n" +
    "             tabindex=\"{{isNavMenu ? 0 : -1}}\">\n" +
    "            <div class=\"subject-title\">\n" +
    "                <span class=\"capitalize\" translate=\"SUBJECTS.{{widgetItem.subjectId}}\"></span>\n" +
    "                <span class=\"to-go\" ng-if=\"widgetItem.pointsLeftToMeetUserGoal > 0\"\n" +
    "                      translate=\".PTS_TO_GO\"\n" +
    "                      translate-values=\"{pts: {{widgetItem.pointsLeftToMeetUserGoal}} }\"></span>\n" +
    "            </div>\n" +
    "            <div class=\"score\" ng-if=\"widgetItem.showScore\">\n" +
    "                <hr class=\"bar\">\n" +
    "                <hr class=\"user-goal-fill\"\n" +
    "                    subject-id-to-attr-drv=\"{{widgetItem.subjectId}}\"\n" +
    "                    context-attr=\"class\"\n" +
    "                    ng-style=\"{ width: widgetItem.userGoalPercentage + '%' }\"\n" +
    "                    ng-class=\"{\n" +
    "                        'user-goal-met' : (widgetItem.estimatedScore >= widgetItem.userGoal),\n" +
    "                        'bar-full'    : (widgetItem.userGoalPercentage >= 100)\n" +
    "                    }\">\n" +
    "                <hr class=\"current-estimated-score-fill\"\n" +
    "                    subject-id-to-attr-drv=\"{{widgetItem.subjectId}}\"\n" +
    "                    context-attr=\"class\"\n" +
    "                    suffix=\"bg\"\n" +
    "                    ng-style=\"{ width: widgetItem.estimatedScorePercentage + '%' }\">\n" +
    "                <div class=\"current-estimated-score\">\n" +
    "                        <span subject-id-to-attr-drv=\"{{widgetItem.subjectId}}\"\n" +
    "                              context-attr=\"class\"\n" +
    "                              suffix=\"bc\"\n" +
    "                              ng-style=\"{ left: widgetItem.estimatedScorePercentage + '%' }\">\n" +
    "                              <md-tooltip md-visible=\"\"\n" +
    "                                          md-direction=\"top\"\n" +
    "                                          class=\"tooltip-for-estimated-score-widget md-whiteframe-2dp\">\n" +
    "                                  <div translate=\".YOUR_GOAL\" translate-values=\"{ goal: {{widgetItem.userGoal}} }\" class=\"top-text\"></div>\n" +
    "                                      <span class=\"bottom-text\" ng-if=\"widgetItem.estimatedScore >= widgetItem.userGoal\" translate=\".GOAL_REACHED\"></span>\n" +
    "                                      <span class=\"bottom-text\" ng-if=\"widgetItem.estimatedScore\" translate=\".PTS_TO_GO\" translate-values=\"{ pts: {{widgetItem.pointsLeftToMeetUserGoal}} }\"></span>\n" +
    "                              </md-tooltip>\n" +
    "                            {{widgetItem.estimatedScore === 0 ? '?' : widgetItem.estimatedScore}}\n" +
    "                        </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"divider\"></div>\n" +
    "\n" +
    "    <div class=\"inner\">\n" +
    "        <table class=\"score-summary\">\n" +
    "            <tr class=\"composite\">\n" +
    "                <td translate=\".COMPOSITE_SCORE\"></td>\n" +
    "                <td class=\"num\">{{d.estimatedCompositeScore}}</td>\n" +
    "            </tr>\n" +
    "            <tr class=\"goal\">\n" +
    "                <td translate=\".GOAL_SCORE\"></td>\n" +
    "                <td class=\"num\">{{d.userCompositeGoal}}</td>\n" +
    "            </tr>\n" +
    "        </table>\n" +
    "        <span class=\"edit-my-goals\"\n" +
    "              ng-click=\"d.showGoalsEdit()\"\n" +
    "              translate=\".EDIT_MY_GOALS\"></span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator', [
        'pascalprecht.translate',
        'znk.infra.evaluator',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'znk.infra-web-app.purchase'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').config([
        'ZnkEvaluatorSrvProvider',
        function (ZnkEvaluatorSrvProvider) {

            ZnkEvaluatorSrvProvider.shouldEvaluateQuestionFnGetter(["purchaseService", function (purchaseService) {
                'ngInject';
                return function(question) {
                    return purchaseService.hasProVersion().then(function(isPro) {
                        return isPro &&
                            question.manualEvaluation &&
                            question.__questionStatus.userAnswer &&
                            question.__questionStatus.userAnswer !== true;
                    });
                };
            }]);

            ZnkEvaluatorSrvProvider.isEvaluateQuestionTypeFnGetter(function () {
                'ngInject';
                return function(question, skipCheckingUserAnswer) {
                   return question.manualEvaluation && (
                           skipCheckingUserAnswer ? true : question.__questionStatus.userAnswer &&
                           question.__questionStatus.userAnswer !== true
                       );
                };
            });

            ZnkEvaluatorSrvProvider.isEvaluateExerciseTypeFnGetter(["ZnkEvaluatorSrv", function (ZnkEvaluatorSrv) {
                'ngInject';
                var evaluateQuestionTypeFn = ZnkEvaluatorSrv.isEvaluateQuestionTypeFn();
                return function(questions) {
                    var isExerciseEvaluateType = false;
                    // if even one question is evaluation type then return true
                    for (var i = 0, ii = questions.length; i < ii; i++) {
                        if (evaluateQuestionTypeFn(questions[i], true)) {
                            isExerciseEvaluateType = true;
                            break;
                        }
                    }
                    return isExerciseEvaluateType;
                };
            }]);

            ZnkEvaluatorSrvProvider.getEvaluateStatusFnGetter(["EvaluatorStatesEnum", "purchaseService", function (EvaluatorStatesEnum, purchaseService) {
                'ngInject';
                return function(evaluatorData) {
                    return purchaseService.hasProVersion().then(function(isPro) {
                        if (!isPro) {
                            return EvaluatorStatesEnum.NOT_PURCHASE.enum;
                        } else if (evaluatorData && evaluatorData.points) {
                            return EvaluatorStatesEnum.EVALUATED.enum;
                        } else {
                            return EvaluatorStatesEnum.PENDING.enum;
                        }
                    });
                };
            }]);
        }
    ]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "EVALUATE_RESULT_DRV": {
                            "WEAK": "Weak",
                            "LIMITED": "Limited",
                            "FAIR": "Fair",
                            "GOOD": "Good",
                            "POINTS": "({{pts}} pts)"
                        },
                        "EVALUATE_REVIEW_STATES_DRV": {
                            "UPGRADE_BTN": "Upgrade to Pro",
                            "PENDING_TITLE": "Your answer is pending evaluation.",
                            "PENDING_DESC": "This may take a few days. We will notify you when the evaluation is ready.",
                            "EVALUATED_ANSWER_TITLE": "Answer evaluation:"
                        },
                        "EVALUATE_QUESTION_RESULT_DRV": {
                            "COMPLETED": "Completed",
                            "SKIPPED": "Skipped"
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'evaluator-star': 'components/evaluator/svg/star.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

/**
 * evaluateQuestionResult
 *   questionResultGetter - get question result
 *   exerciseTypeGetter - exercise type
 *   evaluatorDataGetter - evaluator data (optional)
 *   like: {
 *        questionResultGetter: {
 *           index: 1,
 *           userAnswer: 'text'
 *        },
 *        evaluatorDataGetter: {
 *           score: 2.5
 *        },
 *        exerciseTypeGetter: 2
 *   }
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').component('evaluateQuestionResult', {
            bindings: {
                questionResultGetter: '&questionResult',
                exerciseTypeGetter: '&exerciseType',
                evaluatorDataGetter: '&?evaluatorData'
            },
            templateUrl: 'components/evaluator/templates/evaluateQuestionResult.template.html',
            controllerAs: 'vm',
            controller: ["ZnkEvaluateResultSrv", function (ZnkEvaluateResultSrv) {
                'ngInject';

                var vm = this;

                var questionResult = vm.questionResultGetter();
                var exerciseType = vm.exerciseTypeGetter();
                var evaluatorData = vm.evaluatorDataGetter ? vm.evaluatorDataGetter() : {};

                var evaluateQuestionResultStates = {
                    completed: 1,
                    skipped: 2,
                    evaluated: 3
                };

                vm.evaluateQuestionResultStates = evaluateQuestionResultStates;
                vm.index = questionResult.index;

                vm.type = exerciseType;

                ZnkEvaluateResultSrv.getEvaluateTypes().then(function (types) {
                    vm.aliasName = types[exerciseType].aliasName;
                });

                // set state of component
                if (evaluatorData.score) {
                    vm.activeState = evaluateQuestionResultStates.evaluated;
                    vm.points = evaluatorData.score;
                } else if (questionResult.userAnswer && questionResult.userAnswer !== true) {
                    vm.activeState = evaluateQuestionResultStates.completed;
                } else {
                    vm.activeState = evaluateQuestionResultStates.skipped;
                }
            }]
        }
    );
})(angular);

/**
 * evaluateQuestionReviewStates
 *  ng-model: gets an object with typeId
 *  and for evaluated state add points prop for evaluate-result drv like:
 *  {
        points: 2.5,
        typeId: 2,
    }
 */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').component('evaluateQuestionReviewStates', {
            require: {
                parent: '?^ngModel'
            },
            templateUrl: 'components/evaluator/templates/evaluateQuestionReviewStates.template.html',
            controllerAs: 'vm',
            controller: ["ZnkEvaluatorSrv", "ZnkEvaluateResultSrv", function (ZnkEvaluatorSrv, ZnkEvaluateResultSrv) {
                var vm = this;

                function _changeEvaluateStatus(stateData) {
                    var evaluateStatusFnProm = ZnkEvaluatorSrv.getEvaluateStatusFn();
                    evaluateStatusFnProm(stateData).then(function(state) {
                        vm.evaluateStatus = state;
                    });
                }

                vm.$onInit = function() {
                    var ngModelCtrl = vm.parent;

                    if (ngModelCtrl) {

                        ngModelCtrl.$render = function() {
                            vm.stateData = ngModelCtrl.$modelValue;
                            _changeEvaluateStatus(vm.stateData);
                        };

                        ZnkEvaluateResultSrv.getEvaluateTypes().then(function (types) {
                             vm.evaluateTypes = types;
                        });
                    }
                };

            }]
        }
    );
})(angular);

/**
 * evaluateResult
 *   pointsGetter - get user current points
 *   typeGetter - can be a subjectId or other type of id
 */
(function (angular) {
    'use strict';

        angular.module('znk.infra-web-app.evaluator').component('evaluateResult', {
            bindings: {
                pointsGetter: '&points',
                typeGetter: '&type' // can be a subjectId or other type of id
            },
            templateUrl: 'components/evaluator/templates/evaluateResult.template.html',
            controllerAs: 'vm',
            controller: ["ZnkEvaluateResultSrv", function (ZnkEvaluateResultSrv) {
                'ngInject';

                var vm = this;

                var starStatusMap = {
                    empty: 1,
                    half: 2,
                    full: 3
                };

                var points = vm.points = vm.pointsGetter();

                var type =  vm.typeGetter();

                vm.starStatusMap = starStatusMap;

                vm.stars = [];

                function _getStarStatus(curPoints, prevPoints) {
                    var starStatus = starStatusMap.empty;
                    if (points >= curPoints) {
                        starStatus = starStatusMap.full;
                    } else if(
                        curPoints > points &&
                        points > prevPoints) {
                        starStatus = starStatusMap.half;
                    }
                    return starStatus;
                }

                function addStars(evaluateResultByType) {
                    var starsNum = evaluateResultByType.starsNum;
                    var pointsPerStar = evaluateResultByType.pointsPerStar;
                    var curPoints = 0;
                    for (var i = 0, ii = starsNum; i < ii; i++) {
                        curPoints += pointsPerStar;
                        var starStatus = {
                            status: _getStarStatus(curPoints, curPoints - pointsPerStar)
                        };
                        vm.stars.push(starStatus);
                    }
                }

                function addEvaluateText(evaluateResultByType) {
                    var evaluatePointsArr = evaluateResultByType.evaluatePointsArr;
                    var curEvaluatePoint;
                    for (var i = 0, ii = evaluatePointsArr.length; i < ii; i++) {
                        curEvaluatePoint = evaluatePointsArr[i];
                        if (curEvaluatePoint.maxPoints >= points) {
                            vm.evaluateText = curEvaluatePoint.evaluateText;
                            break;
                        }
                    }
                }

                function addStarsAndText(evaluateResultType) {
                    var evaluateResultByType = evaluateResultType[type];
                    addStars(evaluateResultByType);
                    addEvaluateText(evaluateResultByType);
                }

                ZnkEvaluateResultSrv.getEvaluateResultByType().then(function(evaluateResultType) {
                    addStarsAndText(evaluateResultType);
                });
            }]
        }
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.evaluator').service('EvaluatorStatesEnum', ['EnumSrv',
        function(EnumSrv) {

            var EvaluatorStatesEnum = new EnumSrv.BaseEnum([
                ['NOT_PURCHASE', 1, 'not purchase'],
                ['PENDING', 2, 'pending'],
                ['EVALUATED', 3, 'evaluated']
            ]);

            return EvaluatorStatesEnum;
        }]);
})(angular);

/**
 * EvaluateSrv
 *
 *  setEvaluateResultByType: get an fn function that returns object of types(like subjects) with configuration
 *  like:  {
 *           0: {
                starsNum: 4, // number of stars to display
                pointsPerStar: 1, // points that should calc per star,
                evaluatePointsArr: [ // array of evaluate statuses and each max points
                    {
                        evaluateText: "WEAK",
                        maxPoints: 1
                    },
                    {
                        evaluateText: "LIMITED",
                        maxPoints: 2
                    },
                    {
                        evaluateText: "FAIR",
                        maxPoints: 3
                    },
                    {
                        evaluateText: "GOOD",
                        maxPoints: 4
                    }
                ]
            }
            1: {
               ...
            }
         }
 *
 * setEvaluateTypes: get types meta data like aliasName
 * like: 0: {
 *       aliasName: 'speaking', for class name and etc
 *   },
 *   1: {
 *     ...
 *   }
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.evaluator').provider('ZnkEvaluateResultSrv',
        function() {

        var _evaluateResultByType;
        var _evaluateTypes;

        this.setEvaluateResultByType = function(evaluateResultByType) {
            _evaluateResultByType = evaluateResultByType;
        };

        this.setEvaluateTypes = function(evaluateTypes) {
            _evaluateTypes = evaluateTypes;
        };

        this.$get = ["$q", "$injector", "$log", function($q, $injector, $log) {
            'ngInject';

            var evaluateSrvApi = {};

            function invokeEvaluateFn(evaluateFn, evaluateFnName) {
                if(!evaluateFn) {
                    var errMsg = 'ZnkEvaluateResultSrv: '+ evaluateFnName +' was not set';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                return $q.when($injector.invoke(evaluateFn));
            }

            evaluateSrvApi.getEvaluateResultByType = invokeEvaluateFn.bind(null, _evaluateResultByType, 'evaluateResultByType');

            evaluateSrvApi.getEvaluateTypes = invokeEvaluateFn.bind(null, _evaluateTypes, 'evaluateTypes');

            return evaluateSrvApi;

        }];
    });
})(angular);

angular.module('znk.infra-web-app.evaluator').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/evaluator/svg/star.svg",
    "<svg xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-328 58.7 133.4 127.3\"\n" +
    "     xml:space=\"preserve\"\n" +
    "     class=\"evaluate-star-svg\">\n" +
    ">\n" +
    "<style type=\"text/css\">\n" +
    "	.evaluate-star-svg .st0{fill:#231F20;}\n" +
    "</style>\n" +
    "<path class=\"firstPath st0\" d=\"M-261.3,58.7c-1.3,0-2.6,0.7-3.3,2l-17.8,36.1c-0.5,1.1-1.5,1.8-2.7,2l-39.8,5.8c-3,0.4-4.2,4.1-2,6.2l28.8,28\n" +
    "	c0.8,0.8,1.2,2,1,3.2l-6.8,39.6c-0.5,2.9,2.6,5.2,5.3,3.8l35.6-18.7c0.5-0.3,1.1-0.5,1.7-0.5V58.7z\"/>\n" +
    "<path class=\"secondPath st0\" d=\"M-261.3,58.7c1.3,0,2.6,0.7,3.3,2l17.8,36.1c0.5,1.1,1.5,1.8,2.7,2l39.8,5.8c3,0.4,4.2,4.1,2,6.2l-28.8,28\n" +
    "	c-0.8,0.8-1.2,2-1,3.2l6.8,39.6c0.5,2.9-2.6,5.2-5.3,3.8l-35.6-18.7c-0.5-0.3-1.1-0.5-1.7-0.5V58.7z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/evaluator/templates/evaluateQuestionResult.template.html",
    "<div class=\"evaluate-question-result-wrapper\"\n" +
    "     ng-class=\"{\n" +
    "         'completed': vm.evaluateQuestionResultStates.completed === vm.activeState,\n" +
    "         'skipped': vm.evaluateQuestionResultStates.skipped === vm.activeState,\n" +
    "         'evaluated': vm.evaluateQuestionResultStates.evaluated === vm.activeState\n" +
    "     }\"\n" +
    "     translate-namespace=\"EVALUATE_QUESTION_RESULT_DRV\">\n" +
    "    <div class=\"question-index\"\n" +
    "         ng-class=\"vm.aliasName\">\n" +
    "        {{::vm.index}}\n" +
    "    </div>\n" +
    "     <div class=\"evaluate-question-result-states-switch\"\n" +
    "          ng-switch=\"vm.activeState\">\n" +
    "          <div class=\"evaluate-question-result-text\"\n" +
    "               ng-switch-when=\"1\">\n" +
    "              <div class=\"completed\"\n" +
    "                   translate=\".COMPLETED\">\n" +
    "              </div>\n" +
    "          </div>\n" +
    "          <div class=\"evaluate-question-result-text\"\n" +
    "              ng-switch-when=\"2\">\n" +
    "              <div class=\"skipped\"\n" +
    "                   translate=\".SKIPPED\">\n" +
    "              </div>\n" +
    "          </div>\n" +
    "          <div class=\"evaluate-question-result-evaluated\"\n" +
    "              ng-switch-when=\"3\">\n" +
    "              <evaluate-result\n" +
    "                  points=\"vm.points\"\n" +
    "                  type=\"vm.type\">\n" +
    "              </evaluate-result>\n" +
    "          </div>\n" +
    "     </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/evaluator/templates/evaluateQuestionReviewStates.template.html",
    "<div class=\"evaluate-review-states-wrapper\"\n" +
    "     ng-class=\"vm.evaluateTypes[vm.stateData.typeId].aliasName\"\n" +
    "     translate-namespace=\"EVALUATE_REVIEW_STATES_DRV\">\n" +
    "     <div class=\"evaluate-review-states-switch\"\n" +
    "          ng-switch=\"vm.evaluateStatus\">\n" +
    "          <div class=\"evaluate-review-not-purchase\"\n" +
    "               ng-switch-when=\"1\">\n" +
    "              <div class=\"upgrade-text\"\n" +
    "                   translate=\".UPGRADE_TEXT_{{vm.evaluateTypes[vm.stateData.typeId].aliasName | uppercase}}\">\n" +
    "              </div>\n" +
    "              <button class=\"upgrade-btn\"\n" +
    "                      open-purchase-dialog-on-click\n" +
    "                      translate=\".UPGRADE_BTN\">\n" +
    "              </button>\n" +
    "          </div>\n" +
    "          <div class=\"evaluate-review-pending\"\n" +
    "              ng-switch-when=\"2\">\n" +
    "              <div class=\"pending-title\"\n" +
    "                   translate=\".PENDING_TITLE\">\n" +
    "              </div>\n" +
    "              <div class=\"pending-desc\"\n" +
    "                   translate=\".PENDING_DESC\">\n" +
    "              </div>\n" +
    "          </div>\n" +
    "          <div class=\"evaluate-review-evaluated\"\n" +
    "              ng-switch-when=\"3\">\n" +
    "              <div class=\"evaluated-answer-title\"\n" +
    "                   translate=\".EVALUATED_ANSWER_TITLE\">\n" +
    "              </div>\n" +
    "              <evaluate-result\n" +
    "                  points=\"vm.stateData.points\"\n" +
    "                  type=\"vm.stateData.typeId\">\n" +
    "              </evaluate-result>\n" +
    "          </div>\n" +
    "     </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/evaluator/templates/evaluateResult.template.html",
    "<div class=\"evaluate-result-wrapper\"\n" +
    "     translate-namespace=\"EVALUATE_RESULT_DRV\">\n" +
    "    <div class=\"evaluate-status-wrapper\">\n" +
    "        <div class=\"evaluate-text\"\n" +
    "             translate=\".{{vm.evaluateText}}\">\n" +
    "        </div>\n" +
    "        <div\n" +
    "            class=\"evaluate-points\"\n" +
    "            translate=\".POINTS\"\n" +
    "            translate-values=\"{ pts: '{{vm.points}}' }\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"evaluate-stars-wrapper\">\n" +
    "        <svg-icon\n" +
    "            ng-repeat=\"star in vm.stars\"\n" +
    "            ng-class=\"{\n" +
    "              'starEmpty': star.status === vm.starStatusMap.empty,\n" +
    "              'starHalf': star.status === vm.starStatusMap.half,\n" +
    "              'starFull': star.status === vm.starStatusMap.full\n" +
    "            }\"\n" +
    "            name=\"evaluator-star\">\n" +
    "        </svg-icon>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq', [
        'vAccordion',
        'znk.infra.svgIcon'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').config(
        ["$stateProvider", function ($stateProvider) {
            'ngInject';
            $stateProvider
                .state('app.faq', {
                    url: '/faq',
                    templateUrl: 'components/faq/templates/faq.template.html',
                    controller: 'FaqController',
                    controllerAs: 'vm'
            });
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'faq-circle-arrow-icon': 'components/faq/svg/circle-arrow.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

/**
 * FaqController
 *   set in locale ie:
 *     "FAQ": {
 *         "MAIN_TITLE": "What Is The ACT® Test?",
 *         "QUESTION_1": "What is the ACT?",
           "ANSWER_1": "?? ??",
           ...
 *     }
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').controller('FaqController', ["$filter", "FaqSrv", function($filter, FaqSrv) {
        'ngInject';
        this.questionsAndAnswers = [];
        var lengthQuestion = FaqSrv.getLengthQuestion();
        for (var i = 1; i < lengthQuestion; i++) {
            this.questionsAndAnswers.push(
                {
                    'question': $filter('translate')('FAQ.QUESTION_AND_ANSWERS.QUESTION_' + i),
                    'answer': $filter('translate')('FAQ.QUESTION_AND_ANSWERS.ANSWER_' + i)
                }
            );
        }
    }]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').provider('FaqSrv', function() {
        'ngInject';

        var lengthQuestion = 11;

        this.setLengthQuestion = function(_lengthQuestion) {
            lengthQuestion = _lengthQuestion;
        };

        this.$get = function() {
            var faqSrvApi = {};

            faqSrvApi.getLengthQuestion = function() {
                return lengthQuestion;
            };

            return faqSrvApi;
        };
    });
})(angular);

angular.module('znk.infra-web-app.faq').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/faq/svg/circle-arrow.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     class=\"circle-arrow-icon\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 39 39\">\n" +
    "    <style type=\"text/css\">\n" +
    "        svg.circle-arrow-icon {\n" +
    "            width: 100%;\n" +
    "            height: auto;\n" +
    "        }\n" +
    "        svg.circle-arrow-icon .st0 {\n" +
    "            fill: #88C54F;\n" +
    "        }\n" +
    "        svg.circle-arrow-icon .st1 {\n" +
    "            fill: #ffffff;\n" +
    "        }\n" +
    "    </style>\n" +
    "<circle class=\"st0\" cx=\"19.5\" cy=\"19.5\" r=\"19.5\"/>\n" +
    "<path class=\"st1\" d=\"M19.7,27.2c-0.2,0-0.4-0.1-0.6-0.2L8.1,18c-0.4-0.3-0.5-1-0.1-1.4c0.3-0.4,1-0.5,1.4-0.1l10.4,8.4l10-8.4\n" +
    "	c0.4-0.4,1-0.3,1.4,0.1c0.4,0.4,0.3,1-0.1,1.4l-10.6,9C20.2,27.1,20,27.2,19.7,27.2z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/faq/templates/faq.template.html",
    "<div class=\"app-workouts\" layout=\"row\" flex=\"grow\">\n" +
    "    <div id=\"faq-container\" class=\"workouts-container base-border-radius\" translate-namespace=\"FAQ\">\n" +
    "\n" +
    "        <h1 class=\"main-title\" translate=\".MAIN_TITLE\"></h1>\n" +
    "\n" +
    "        <div id=\"faq-inner\">\n" +
    "            <v-accordion class=\"vAccordion--default\">\n" +
    "\n" +
    "                <v-pane ng-repeat=\"faqitem in ::vm.questionsAndAnswers\" expanded=\"$first\">\n" +
    "                    <v-pane-header>\n" +
    "                        <svg-icon class=\"faq-icon\" name=\"faq-circle-arrow-icon\"></svg-icon> <span ng-bind-html=\"::faqitem.question\"></span>\n" +
    "                    </v-pane-header>\n" +
    "\n" +
    "                    <v-pane-content>\n" +
    "                        <div ng-bind-html=\"::faqitem.answer\"></div>\n" +
    "                    </v-pane-content>\n" +
    "                </v-pane>\n" +
    "\n" +
    "            </v-accordion>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback',
        [
            'ngMaterial',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra.auth',
            'znk.infra.analytics',
            'znk.infra.general',
            'znk.infra.user',
            'znk.infra.svgIcon'
        ])
        .config(
            ["SvgIconSrvProvider", "$translateProvider", function (SvgIconSrvProvider, $translateProvider) {
                'ngInject';
                var svgMap = {
                    'feedback-close-popup': 'components/feedback/svg/feedback-close-popup.svg',
                    'feedback-icon': 'components/feedback/svg/feedback-icon.svg',
                    'completed-v-feedback-icon': 'components/feedback/svg/completed-v-feedback.svg',
                    'feedback-btn-icon': 'components/feedback/svg/feedback-btn-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);

                $translateProvider.translations('en', {
                    "FEEDBACK_POPUP": {
                        "FEEDBACK"       : "Feedback",
                        "REQUIRED_FIELD" : "This field is required.",
                        "CORRECT_EMAIL"  : "Please enter a valid email address",
                        "EMAIL"          : "Your email address",
                        "MESSAGE"        : "Send us your comments or suggestions...",
                        "SEND"           : "Send",
                        "THINK"          : "Let us know what you think!",
                        "THANKS"         : "Thank you!",
                        "OPINION"        : "Your feedback is important to us.",
                        "DONE"           : "Done",
                        "USER_EMAIL"     : "email: {{userEmail}}",
                        "USER_ID"        : "uid: {{userId}}"
                    }
                });
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                    "FEEDBACK_POPUP": {
                        "FEEDBACK"       : "Feedback",
                        "REQUIRED_FIELD" : "This field is required.",
                        "CORRECT_EMAIL"  : "Please enter a valid email address",
                        "EMAIL"          : "Your email address",
                        "MESSAGE"        : "Send us your comments or suggestions...",
                        "SEND"           : "Send",
                        "THINK"          : "Let us know what you think!",
                        "THANKS"         : "Thank you!",
                        "OPINION"        : "Your feedback is important to us.",
                        "DONE"           : "Done",
                        "USER_EMAIL"     : "email: {{userEmail}}",
                        "USER_ID"        : "uid: {{userId}}"
                    }
                });
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback').controller('feedbackCtrl',
        ["$log", "$mdDialog", "$timeout", "$http", "ENV", "UserProfileService", "AuthService", function($log, $mdDialog, $timeout, $http, ENV, UserProfileService, AuthService) {
            'ngInject';

            var self = this;
            var DOORBELLSTATUSOK = 201;
            var ENTER_KEY = String.fromCharCode(13);
            self.success = false;

            UserProfileService.getProfile().then(function (res) {
                var userEmail = res.email;
                self.feedbackData = {
                    email: userEmail
                };
                var userAuth = AuthService.getAuth();
                self.userId = userAuth.auth.uid;
                self.userEmail = userEmail;
            });

            this.sendFrom = function () {
                if (self.feedbackForm.$valid) {
                    self.startLoader = true;
                    var authData = AuthService.getAuth();
                    var postData = angular.copy(self.feedbackData);

                    postData.tags = ENV.firebaseAppScopeName;
                    postData.message += (ENTER_KEY + ENTER_KEY);
                    postData.message += ' APP-NAME: ' + ENV.firebaseAppScopeName + ', UID: ' + (authData ? authData.uid : 'N/A');

                    $http.post(ENV.doorBellSubmitURL, (postData)).then(function (data) {
                        self.fillLoader = true;
                        $timeout(function () {
                            self.startLoader = self.fillLoader = false;
                        }, 100);

                        if (data.status === DOORBELLSTATUSOK) {
                            self.success = true;
                        }
                    }, function (message) {
                        $log.error(message);

                        self.fillLoader = true;
                        $timeout(function () {
                            self.startLoader = self.fillLoader = false;
                        }, 100);
                    });
                }
            };
            this.cancel = function () {
                $mdDialog.cancel();
            };
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.feedback').directive('feedback',
        ["feedbackSrv", function(feedbackSrv) {
            'ngInject';

            var directive = {
                restrict: 'E',
                template: '<button class="feedback-btn" ng-click="showDialog()"><svg-icon name="feedback-btn-icon"></svg-icon></button>',
                scope: {},
                link: function link(scope) {
                    scope.showDialog = function () {
                        feedbackSrv.showFeedbackDialog();
                    };
                }
            };
            return directive;
        }]);
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.feedback').service('feedbackSrv',

        ["$mdDialog", function($mdDialog) {
            'ngInject';

            this.showFeedbackDialog = function () {
                $mdDialog.show({
                    controller: 'feedbackCtrl',
                    controllerAs: 'vm',
                    templateUrl: 'components/feedback/templates/feedback.template.html',
                    clickOutsideToClose: true
                });
            };
        }]
    );
})(angular);


angular.module('znk.infra-web-app.feedback').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/feedback/svg/completed-v-feedback.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-1040 834.9 220.4 220.4\" xml:space=\"preserve\" class=\"completed-v-feedback-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.completed-v-feedback-svg {width: 100%; height: auto;}\n" +
    "	.completed-v-feedback-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.completed-v-feedback-svg .st1{fill:#CACBCC;}\n" +
    "	.completed-v-feedback-svg .st2{display:none;fill:none;}\n" +
    "	.completed-v-feedback-svg .st3{fill:#D1D2D2;}\n" +
    "	.completed-v-feedback-svg .st4{fill:none;stroke:#FFFFFF;stroke-width:11.9321;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M-401,402.7\"/>\n" +
    "<circle class=\"st1\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<circle class=\"st2\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<path class=\"st3\" d=\"M-860.2,895.8l40,38.1c-5.6-55.6-52.6-99-109.6-99c-60.9,0-110.2,49.3-110.2,110.2\n" +
    "	c0,60.9,49.3,110.2,110.2,110.2c11.6,0,22.8-1.8,33.3-5.1l-61.2-58.3L-860.2,895.8z\"/>\n" +
    "<polyline class=\"st4\" points=\"-996.3,944.8 -951.8,989.3 -863.3,900.8 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/feedback/svg/feedback-btn-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "     class=\"act-feedback-btn-icon\"\n" +
    "     viewBox=\"0 0 200 178.1\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .act-feedback-btn-icon{\n" +
    "        width:25px;\n" +
    "        height:25px;\n" +
    "        .st0{fill:none;stroke:#231F20;stroke-width:7;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path  class=\"st0\" d=\"M7.3,61v46.2c0,0,54.1-4.9,72.1,6V55.8C79.4,55.8,66.6,64.1,7.3,61z\"/>\n" +
    "        <path  class=\"st0\" d=\"M89.9,50.9c0,0,70.2-12,98.8-45.1v157.7c0,0-50.3-43.9-98.8-46.2V50.9z\"/>\n" +
    "        <polyline class=\"st0\" points=\"25.7,109.1 25.7,160.9 56.8,173 56.8,109.1 	\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/feedback/svg/feedback-close-popup.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\" class=\"close-pop-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.close-pop-svg {width: 100%; height: auto;}\n" +
    "	.close-pop-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.close-pop-svg .st1{fill:none;stroke:#ffffff;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/feedback/svg/feedback-icon.svg",
    "<svg version=\"1.1\"\n" +
    "	 xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 116.4 115.7\"\n" +
    "	 xml:space=\"preserve\" class=\"feedback-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.feedback-icon-svg {width: 100%; height: auto;}\n" +
    "</style>\n" +
    "<g>\n" +
    "	<path d=\"M116.4,92.8C97.8,76.9,76.5,69.3,51.6,71.4c0-16.4,0-33,0-51C75.3,20.6,97.4,15,116.4,0C116.4,30.9,116.4,61.9,116.4,92.8z\n" +
    "		\"/>\n" +
    "	<path d=\"M0,32.7C5.4,22.9,13.6,19,24.7,20.2c5.7,0.6,11.4,0.1,17.9,0.1c0,16.7,0,33.1,0,50.4C27.8,68.7,11,77.1,0,60\n" +
    "		C0,50.9,0,41.8,0,32.7z\"/>\n" +
    "	<path d=\"M23.3,115.7c-9.8-8.4-6.8-19.7-6.8-30.3c0-1,19.8-3.1,26.1-1.3c3,0.8,1.2,24.5,0.6,31.6C36.6,115.7,30,115.7,23.3,115.7z\"\n" +
    "		/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/feedback/templates/feedback.template.html",
    "<div class=\"feedback-dialog\">\n" +
    "    <md-dialog class=\"base base-border-radius feedback-container\" translate-namespace=\"FEEDBACK_POPUP\">\n" +
    "        <div class=\"top-icon-wrap\">\n" +
    "            <div class=\"top-icon\">\n" +
    "                <div class=\"round-icon-wrap\">\n" +
    "                    <svg-icon name=\"feedback-icon\"></svg-icon>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"popup-header\">\n" +
    "            <div class=\"close-popup-wrap\" ng-click=\"vm.cancel();\">\n" +
    "                <svg-icon name=\"feedback-close-popup\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"feedback-inner\">\n" +
    "                <div class=\"main-title\" translate=\".FEEDBACK\"></div>\n" +
    "                <ng-switch on=\"vm.success\">\n" +
    "                    <section ng-switch-when=\"false\">\n" +
    "                        <div class=\"sub-title\" translate=\".THINK\"></div>\n" +
    "                        <form novalidate name=\"vm.feedbackForm\" class=\"base-form\" ng-submit=\"vm.sendFrom();\">\n" +
    "\n" +
    "							<textarea\n" +
    "                                    required\n" +
    "                                    name=\"messageFeedback\"\n" +
    "                                    ng-model=\"vm.feedbackData.message\"\n" +
    "                                    placeholder=\"{{'FEEDBACK_POPUP.MESSAGE' | translate}}\">\n" +
    "                            </textarea>\n" +
    "\n" +
    "                            <label\n" +
    "                                    ng-class=\"{'hidden': !(vm.feedbackForm.messageFeedback.$invalid && vm.feedbackForm.$submitted) }\"\n" +
    "                                    translate=\".REQUIRED_FIELD\">\n" +
    "                            </label>\n" +
    "\n" +
    "                            <input\n" +
    "                                    required\n" +
    "                                    type=\"email\"\n" +
    "                                    name=\"emailFeedback\"\n" +
    "                                    placeholder=\"{{'FEEDBACK_POPUP.EMAIL' | translate}}\"\n" +
    "                                    ng-model=\"vm.feedbackData.email\"\n" +
    "                                    ng-minlength=\"5\"\n" +
    "                                    ng-maxlength=\"254\">\n" +
    "\n" +
    "                            <label\n" +
    "                                    ng-class=\"{'hidden': !(vm.feedbackForm.emailFeedback.$invalid && vm.feedbackForm.$submitted) }\"\n" +
    "                                    translate=\".CORRECT_EMAIL\">\n" +
    "                            </label>\n" +
    "\n" +
    "                            <button\n" +
    "                                    class=\"md-button success success-green drop-shadow\"\n" +
    "                                    element-loader\n" +
    "                                    fill-loader=\"vm.fillLoader\"\n" +
    "                                    show-loader=\"vm.startLoader\"\n" +
    "                                    bg-loader=\"'#72ab40'\"\n" +
    "                                    precentage=\"50\"\n" +
    "                                    font-color=\"'#FFFFFF'\"\n" +
    "                                    bg=\"'#87ca4d'\">\n" +
    "                                <span translate=\".SEND\"></span>\n" +
    "                            </button>\n" +
    "                            <div class=\"user-details-border\"></div>\n" +
    "                            <div class=\"user-email\" ng-if=\"vm.userEmail\" translate=\".USER_EMAIL\"\n" +
    "                                 translate-values=\"{userEmail: vm.userEmail}\"></div>\n" +
    "                            <div class=\"user-id\" ng-if=\"vm.userId\" translate=\".USER_ID\"\n" +
    "                                 translate-values=\"{userId: vm.userId}\"></div>\n" +
    "                        </form>\n" +
    "                    </section>\n" +
    "                    <section ng-switch-default class=\"success-feedback\">\n" +
    "                        <svg-icon name=\"completed-v-feedback-icon\"></svg-icon>\n" +
    "                        <div class=\"success-msg\">\n" +
    "                            <div translate=\".THANKS\"></div>\n" +
    "                            <div translate=\".OPINION\"></div>\n" +
    "                        </div>\n" +
    "                        <md-button\n" +
    "                                class=\"success success-green drop-shadow\"\n" +
    "                                ng-click=\"vm.cancel();\">\n" +
    "                            <span translate=\".DONE\"></span>\n" +
    "                        </md-button>\n" +
    "                    </section>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </md-dialog>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.iapMsg',[
        'ngSanitize',
        'znk.infra.svgIcon',
        'ngAnimate'
    ])
        .config(["SvgIconSrvProvider", function(SvgIconSrvProvider){
            'ngInject'; 

            var svgMap = {
                'iap-msg-close-msg': 'components/iapMsg/svg/close-msg.svg',
                'iap-msg-hint-bubble': 'components/iapMsg/svg/hint-bubble.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.iapMsg').service('IapMsgSrv',
        ["raccoonIapMsgSrv", function (raccoonIapMsgSrv) {
            'ngInject';

            this.raccoonTypes = raccoonIapMsgSrv.raccoonTypes;

            this.showRaccoonIapMsg = function(msg,type){
                raccoonIapMsgSrv.showRaccoonIapMsg (msg,type);
                return raccoonIapMsgSrv.closeRaccoonIapMsg;
            };
        }]
    );
})(angular);

(function () {
    'use strict';
    
    var templateCacheName = 'raccoonIapMsg.template';

    angular.module('znk.infra-web-app.iapMsg')
        .run(["$templateCache", function($templateCache){
            'ngInject';

            var template =
                '<div class="raccoon-in-app show-hide-animation" ng-class="raccoonTypeClass">' +
                    '<div class="svg-wrap">' +
                        '<svg-icon name="iap-msg-close-msg" ng-click="close()"></svg-icon>' +
                    '</div>' +
                    '<div class="bubble-wrap">' +
                        '<div class="msg-wrap">' +
                            '<div class="msg" ng-bind-html="message"></div>' +
                            '<svg-icon name="iap-msg-hint-bubble" class="hint-bubble-svg"></svg-icon>' +
                        '</div>' +
                    '</div>' +
                    '<div class="raccoon">' +
                        '<div></div>' +
                    '</div>' +
                '</div>';
            $templateCache.put(templateCacheName,template);
        }]
    )
    .service('raccoonIapMsgSrv',
        ["$compile", "$rootScope", "$animate", "$document", "$timeout", "$templateCache", "$sce", function ($compile, $rootScope, $animate, $document, $timeout, $templateCache, $sce) {
            'ngInject';

            var self = this;

            var raccoonTypes = {
                HINT_RACCOON: 'HINT',
                PRACTICE_RACCOON: 'PRACTICE_HINT'
            };
            this.raccoonTypes = raccoonTypes;

            var racccoonTypeToClassMap = {};
            racccoonTypeToClassMap[this.raccoonTypes.HINT_RACCOON] = 'hint-raccoon';
            racccoonTypeToClassMap[this.raccoonTypes.PRACTICE_RACCOON] = 'hint-raccoon-for-practice';

            function addPlaceHolderElement() {
                var wrapper = angular.element('<div class="raccoon-wrap"></div>');
                $document.find('body').append(wrapper);
                return wrapper;
            }

            var raccoonParentElm = addPlaceHolderElement();

            function _closeOnClickGlobalHandler() {
                $timeout(function () {
                    self.closeRaccoonIapMsg();
                });
            }

            function _addCloseOnGlobalClickHandler() {
                $document[0].body.addEventListener('click', _closeOnClickGlobalHandler);
            }

            function _removeCloseOnGlobalClickHandler() {
                $document[0].body.removeEventListener('click', _closeOnClickGlobalHandler);
            }

            function _getRaccoonClass(raccoonType) {
                return racccoonTypeToClassMap[raccoonType];
            }

            var scope;
            /**** DO NOT USE THIS SERVICE, use IapMsgSrv instead!!!!!! ****/
            this.closeRaccoonIapMsg = function () {
                _removeCloseOnGlobalClickHandler();

                $animate.leave(raccoonParentElm.children());

                if (scope) {
                    scope.$destroy();
                    scope = null;
                }
            };
            /**** DO NOT USE THIS SERVICE, use IapMsgSrv instead!!!!!! ****/
            this.showRaccoonIapMsg = function (message, raccoonType) {
                if (scope) {
                    self.closeRaccoonIapMsg();
                }

                scope = $rootScope.$new(true);
                scope.close = this.closeRaccoonIapMsg;
                $sce.trustAsHtml(message);
                scope.message = message;
                scope.raccoonTypeClass = _getRaccoonClass(raccoonType);

                var template = $templateCache.get(templateCacheName);
                var raccoonElm = angular.element(template);
                raccoonParentElm.append(raccoonElm);
                $animate.enter(raccoonElm, raccoonParentElm, null).then(function(){
                    _addCloseOnGlobalClickHandler();
                });
                $compile(raccoonElm)(scope);
            };
        }]);
})(angular);

angular.module('znk.infra-web-app.iapMsg').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/iapMsg/svg/close-msg.svg",
    "<svg class=\"iap-msg-close-msg-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-596.6 492.3 133.2 133.5\">\n" +
    "    <style>\n" +
    "        .iap-msg-close-msg-svg{\n" +
    "            width: 12px;\n" +
    "        }\n" +
    "\n" +
    "        .iap-msg-close-msg-svg line {\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 10px;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/iapMsg/svg/hint-bubble.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 2006.4 737.2\"\n" +
    "     class=\"iap-msg-hint-bubble-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .iap-msg-hint-bubble-svg{\n" +
    "            width: 400px;\n" +
    "        }\n" +
    "\n" +
    "        .iap-msg-hint-bubble-svg .st0 {\n" +
    "            fill: #FFFFFF;\n" +
    "            stroke: #8A8484;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <path class=\"st0\" d=\"M2003.9,348.5c0-191.1-448-346-1000.7-346S2.5,157.4,2.5,348.5s448,346,1000.7,346\n" +
    "	c163.9,0,318.6-13.6,455.2-37.8c26.1,18.2,69.5,38.4,153,61.7c83.6,23.3,154.7,14.8,154.7,14.8s-87.6-50.2-134.5-115.4\n" +
    "	C1858.7,554.4,2003.9,457.3,2003.9,348.5z\"/>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.imageZoomer', [
        'znk.infra.svgIcon',
        'ngMaterial'
    ]).config(["SvgIconSrvProvider", function(SvgIconSrvProvider){
        'ngInject';
        var svgMap = {
            'image-zoomer-full-screen-icon': 'components/imageZoomer/svg/full-screen-icon.svg',
            'image-zoomer-close-popup': 'components/imageZoomer/svg/image-zoomer-close-popup.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.imageZoomer').directive('imageZoomer', ["$timeout", "$mdDialog", "$document", "$compile", function($timeout, $mdDialog, $document, $compile) {
       'ngInject';

        function compileFn() {
            function preFn(scope, element) {
                DialogController.$inject = ["$scope"];
                var MAX_WIDTH = 400;
                var MAX_HEIGHT = 500;
                var MIN_SIZE_TO_ZOOM = 100;
                var zoomableImgElemArr = [];

                $timeout(function () {
                    var imageElements = element[0].querySelectorAll('img');

                    angular.forEach(imageElements, function (imgElement) {
                        var clickableIconElement = addIconToImage(imgElement);
                        var clickableImageElement = imgElement;
                        addImageHandler(clickableIconElement, imgElement);  // clickable icon
                        addImageHandler(clickableImageElement, imgElement); // clickable image
                    });
                });


                function addImageHandler(imgElement, image) {
                    if (_shouldImageBeZoomed(image)) {
                        return;
                    }
                    if (_getImageWidth(image) > 400) {
                        image.style.width = MAX_WIDTH + 'px';
                        image.style.height = 'auto';
                    }
                    image.className = 'img-to-zoom';
                    angular.element(imgElement).on('click', function () {
                        zoomImage(image);
                    });
                    zoomableImgElemArr.push(imgElement);
                }

                function DialogController($scope) {
                    $scope.closeDialog = function () {
                        $mdDialog.hide();
                    };
                }

                function zoomImage(image) {
                    var parentEl = angular.element($document.body);
                    $mdDialog.show({
                        clickOutsideToClose: true,
                        parent: parentEl,
                        template: '<div class="zoom-image-modal">' +
                        '<svg-icon ng-click="closeDialog()" name="image-zoomer-close-popup"></svg-icon>' +
                        '<md-dialog ng-click="closeDialog()">' +
                        '<md-dialog-content>' +
                        '<img src="' + image.src + '" style="width:' + image.width * 2 + 'px; ' + 'height:' + image.height * 2 + 'px">' +
                        '</md-dialog-content>' +
                        '</md-dialog>' +
                        '</div>',
                        controller: DialogController
                    });

                }

                function addIconToImage(image) {
                    if (_shouldImageBeZoomed(image)) {
                        return image;
                    }

                    if (_getImageWidth(image) > MAX_WIDTH) {
                        image.style.width = MAX_WIDTH + 'px';
                        image.style.height = 'auto';
                    }
                    var imageParent = angular.element(image.parentNode);
                    var imageNewParent = angular.element('<div class="zoomable-image-with-icon"></div>');   // wrap img and icon with one div element
                    imageNewParent.css('position', 'relative');
                    imageNewParent.css('margin', '0 auto');
                    imageNewParent.css('textAlign', 'center');
                    imageNewParent.css('width', image.style.width);
                    imageNewParent.css('height', image.style.height);
                    imageParent.append(imageNewParent);
                    imageParent[0].replaceChild(imageNewParent[0], image);
                    imageNewParent.append(image);
                    
                    var svgIconTemplate = '<div class="zoom-icon-wrapper">' +
                        '<svg-icon name="image-zoomer-full-screen-icon"></svg-icon>' +
                        '</div>';

                    imageNewParent.append(svgIconTemplate);
                    var iconElement = imageNewParent[0].querySelector('.zoom-icon-wrapper');
                    $compile(iconElement)(scope);
                    return iconElement;
                }

                function _shouldImageBeZoomed(image) {
                    return image.style.width === null || _getImageWidth(image) < MIN_SIZE_TO_ZOOM || _getImageHeight(image) < MIN_SIZE_TO_ZOOM || _getImageHeight(image) > MAX_HEIGHT;
                }

                function _getImageWidth(image) {
                    return + image.style.width.replace('px', '');
                }

                function _getImageHeight(image) {
                    var width = _getImageWidth(image);
                    var height = +image.style.height.replace('px', '');
                    return width > MAX_WIDTH ? (height * MAX_WIDTH) / width : height;
                }

                scope.$on('$destroy', function () {
                    for (var i = 0; i < zoomableImgElemArr.length; i++) {
                        angular.element(zoomableImgElemArr[i]).off('click');
                    }
                    zoomableImgElemArr = [];
                });
            }

            return {
                post: preFn
            };
        }

        var directive = {
            priority: -1000,
            restrict: 'A',
            scope: {},
            compile: compileFn
        };

        return directive;
    }]);

})(angular);


angular.module('znk.infra-web-app.imageZoomer').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/imageZoomer/svg/full-screen-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-645.7 420.9 200.9 199\"\n" +
    "     class=\"full-screen-icon\">\n" +
    "<path class=\"st0\"/>\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .full-screen-icon {\n" +
    "            width: 100%;\n" +
    "			height: auto;\n" +
    "			fill:none;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-580.6\" y1=\"486.4\" x2=\"-641.7\" y2=\"425.4\"/>\n" +
    "		<polyline class=\"st1\" points=\"-642.7,462.5 -642.7,423.9 -605.1,423.9 \"/>\n" +
    "	</g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-509.8\" y1=\"486.4\" x2=\"-448.7\" y2=\"425.4\"/>\n" +
    "		<polyline class=\"st1\" points=\"-447.7,462.5 -447.7,423.9 -485.4,423.9 \"/>\n" +
    "	</g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-580.6\" y1=\"554.3\" x2=\"-641.7\" y2=\"615.3\"/>\n" +
    "		<polyline class=\"st1\" points=\"-642.7,578.2 -642.7,616.8 -605.1,616.8 \"/>\n" +
    "	</g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-509.8\" y1=\"554.3\" x2=\"-448.7\" y2=\"615.3\"/>\n" +
    "		<polyline class=\"st1\" points=\"-447.7,578.2 -447.7,616.8 -485.4,616.8 \"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/imageZoomer/svg/image-zoomer-close-popup.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\" class=\"image-zoomer-close-popup\">\n" +
    "    <style>\n" +
    "        .image-zoomer-close-popup{\n" +
    "        width:15px;\n" +
    "        height:15px;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise', [
        'znk.infra.znkExercise',
        'znk.infra.analytics',
        'znk.infra.general',
        'pascalprecht.translate',
        'ngMaterial',
        'ngAnimate',
        'znk.infra.svgIcon'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ANSWER_EXPLANATION":{
                            "ANSWER_EXPLANATION": "Answer explanation",
                            "TITLE": "Why is this right?"
                        },
                        "CONTAINER_HEADER": {
                            "QUIT_BTN_TEXT": "Exit",
                            "SUMMARY": "Summary",
                            "DIAGNOSTIC_TEXT": "Diagnostic Test: {{subjectName}}",
                            "FULL_TEST_TEXT": "Full Test {{exerciseNum}}: {{subjectName}}",
                            "MINI_TEST_TEXT": "Mini Test {{exerciseNum}}: {{subjectName}}",
                            "NO_CALC_TOOLTIP": "This workout do not permit the use of a calculator.",
                            "GOT_IT": "Got it"
                        }
                    }
                );
            }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').config(
        ["$provide", function ($provide) {
            'ngInject';

            $provide.decorator('questionBuilderDirective',
                ["$delegate", "ZnkExerciseUtilitySrv", function ($delegate, ZnkExerciseUtilitySrv) {
                    'ngInject';// jshint ignore:line

                    var directive = $delegate[0];

                    directive.link.pre = function(scope, element, attrs, ctrls){
                        var questionBuilderCtrl = ctrls[0];
                        var znkExerciseCtrl = ctrls[1];

                        var functionsToBind = ['getViewMode','addQuestionChangeResolver','removeQuestionChangeResolver', 'getCurrentIndex'];
                        ZnkExerciseUtilitySrv.bindFunctions(questionBuilderCtrl, znkExerciseCtrl,functionsToBind);

                        element.append('<answer-explanation></answer-explanation>');
                    };

                    return $delegate;
                }]
            );
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'answer-explanation-lamp-icon': 'components/infraWebAppZnkExercise/svg/lamp-icon.svg',
                'answer-explanation-close': 'components/infraWebAppZnkExercise/svg/answer-explanation-close.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }])
        .directive('answerExplanation',
            ["ZnkExerciseViewModeEnum", "znkAnalyticsSrv", "$timeout", function (ZnkExerciseViewModeEnum, znkAnalyticsSrv, $timeout) {
                'ngInject';

                var directive = {
                    scope: {},
                    require: ['^questionBuilder', '^ngModel'],
                    templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanation.template.html',
                    link: function link(scope, element, attrs, ctrls) {

                        var questionBuilderCtrl = ctrls[0];
                        var ngModelCtrl = ctrls[1];
                        var viewMode = questionBuilderCtrl.getViewMode();
                        var question = questionBuilderCtrl.question;

                        scope.d = {};

                        var init = (function () {
                            var wasInit;

                            return function () {
                                if (wasInit) {
                                    return;
                                }

                                // add timeout to prevent showing visible answer explanation for a
                                // second before it's hidden on slide that is not the current slide
                                // (because the slider shifts from first slide to current)
                                $timeout(function () {
                                    element.addClass('answer-explanation-visible');
                                }, 0, false);

                                var analyticsProps = {
                                    subjectType: question.subjectId,
                                    questionId: question.id
                                };

                                scope.$watch('d.showWrittenSln', function (isVisible) {
                                    if (isVisible || isVisible === false) {
                                        if (isVisible) {
                                            znkAnalyticsSrv.eventTrack({
                                                eventName: 'writtenSolutionClicked',
                                                props: analyticsProps
                                            });
                                            znkAnalyticsSrv.timeTrack({eventName: 'writtenSolutionClosed'});
                                        } else {
                                            znkAnalyticsSrv.eventTrack({
                                                eventName: 'writtenSolutionClosed',
                                                props: analyticsProps
                                            });
                                        }
                                    }
                                });

                                wasInit = true;
                            };
                        })();

                        function viewChangeListener() {
                            if (ngModelCtrl.$viewValue) {           // user already answered
                                init();
                            } else {
                                ngModelCtrl.$viewChangeListeners.push(function () {
                                    init();
                                });
                            }
                        }

                        switch (viewMode) {
                            case ZnkExerciseViewModeEnum.REVIEW.enum:
                                init();
                                break;
                            case ZnkExerciseViewModeEnum.ANSWER_WITH_RESULT.enum:
                                viewChangeListener();
                                break;
                        }
                    }
                };
                return directive;
            }]
        );
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.infraWebAppZnkExercise').directive('answerExplanationContent',
        ["ENV", "$sce", "znkAnalyticsSrv", function (ENV, $sce, znkAnalyticsSrv) {
            'ngInject';

            return {
                templateUrl: 'components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanationContent.template.html',
                require: '^questionBuilder',
                restrict: 'E',
                scope: {
                    onClose: '&'
                },
                link: function (scope, element, attrs, questionBuilderCtrl) {
                    var question = questionBuilderCtrl.question;
                    var isPlayFlag = false;
                    var analyticsProps = {
                        subjectType: question.subjectId,
                        questionId: question.id
                    };

                    scope.d = {};

                    var writtenSlnContent = questionBuilderCtrl.question.writtenSln &&
                        questionBuilderCtrl.question.writtenSln.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                    scope.d.writtenSlnContent = writtenSlnContent;

                    scope.d.videoSrc = $sce.trustAsResourceUrl(ENV.mediaEndPoint + ENV.firebaseAppScopeName + '/videos/questions' + '/' + question.id + '.mp4');

                    scope.d.quid = question.quid || question.id;

                    scope.d.onVideoEnded = function () {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'videoClosed',
                            props: analyticsProps
                        });
                    };

                    scope.d.onVideoPlay = function () {
                        if (!isPlayFlag) {
                            isPlayFlag = true;
                            znkAnalyticsSrv.eventTrack({
                                eventName: 'videoClicked',
                                props: analyticsProps
                            });
                            znkAnalyticsSrv.timeTrack({eventName: 'videoClosed'});
                        }
                    };

                    scope.d.close = function () {
                        scope.onClose();
                    };
                }
            };
        }]
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.infraWebAppZnkExercise').directive('znkExerciseHeader',
        ["$timeout", "SubjectEnum", function($timeout, SubjectEnum){
        'ngInject';

        return {
            scope: {
                options: '=?',
                onClickedQuit: '&?',
                timerData: '=?',
                subjectId: '=',
                categoryId: '&',
                sideText: '=',
                totalSlideNum: '@',
                exerciseNum: '@',
                iconName: '@',
                iconClickHandler: '&',
                showNoCalcIcon: '&',
                showNoCalcTooltip: '&'
            },
            restrict: 'E',
            require: '?ngModel',
            templateUrl: 'components/infraWebAppZnkExercise/directives/znkExerciseHeader/exerciseHeader.template.html',
            controller: function () {
                // required: subjectId
                if (angular.isUndefined(this.subjectId)) {
                    throw new Error('Error: exerciseHeaderController: subjectId is required!');
                }
                this.subjectId = +this.subjectId;
                this.categoryId = this.categoryId();
                var categoryId = angular.isDefined(this.categoryId) ? this.categoryId : this.subjectId;
                this.subjectName = SubjectEnum.getValByEnum(categoryId);
            },
            bindToController: true,
            controllerAs: 'vm',
            link: function (scope, element, attrs, ngModel) {
                if (ngModel) {
                    ngModel.$render = function () {
                        scope.vm.currentSlideNum = ngModel.$viewValue;
                    };
                }

                if (scope.vm.showNoCalcIcon()) {
                    $timeout(function () {    // timeout fixing md-tooltip visibility issues
                        scope.vm.showToolTip = scope.vm.showNoCalcTooltip();
                    });
                }
            }
        };
    }]);
})(angular);

angular.module('znk.infra-web-app.infraWebAppZnkExercise').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanation.template.html",
    "<div class=\"answer-explanation-wrapper\" translate-namespace=\"ANSWER_EXPLANATION\">\n" +
    "    <div class=\"answer-explanation-content-wrapper\"\n" +
    "         ng-if=\"d.showWrittenSln\">\n" +
    "        <answer-explanation-content class=\"znk-scrollbar\"\n" +
    "                                    on-close=\"d.showWrittenSln = false\">\n" +
    "        </answer-explanation-content>\n" +
    "    </div>\n" +
    "    <div class=\"answer-explanation-header\" ng-click=\"d.showWrittenSln = !d.showWrittenSln\">\n" +
    "        <div class=\"answer-explanation-btn\">\n" +
    "            <div class=\"main-content-wrapper\">\n" +
    "                <svg-icon class=\"lamp-icon\" name=\"answer-explanation-lamp-icon\"></svg-icon>\n" +
    "                <span class=\"text\" translate=\".ANSWER_EXPLANATION\"></span>\n" +
    "            </div>\n" +
    "            <div class=\"right-corner corner\"></div>\n" +
    "            <div class=\"left-corner corner\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/directives/answerExplanation/answerExplanationContent.template.html",
    "<div class=\"title\">\n" +
    "    <div translate=\"ANSWER_EXPLANATION.TITLE\"></div>\n" +
    "    <div class=\"answer-explanation-close\">\n" +
    "        <svg-icon name=\"answer-explanation-close\"\n" +
    "                  ng-click=\"d.close()\">\n" +
    "        </svg-icon>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"flex-wrap\">\n" +
    "    <div class=\"video-wrap\">\n" +
    "        <video controls\n" +
    "               video-ctrl-drv\n" +
    "               on-play=\"d.onVideoPlay()\"\n" +
    "               on-ended=\"d.onVideoEnded()\"\n" +
    "               video-error-poster=\"assets/images/raccoon/video-is-not-available-img.png\">\n" +
    "            <source ng-src=\"{{::d.videoSrc}}\" type=\"video/mp4\">\n" +
    "        </video>\n" +
    "        <div class=\"question-quid-text\">{{::d.quid}}</div>\n" +
    "    </div>\n" +
    "    <div class=\"written-solution-wrapper\"\n" +
    "         ng-bind-html=\"d.writtenSlnContent\">\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/directives/znkExerciseHeader/exerciseHeader.template.html",
    "<div class=\"exercise-header subject-repeat\" subject-id-to-attr-drv=\"vm.subjectId\"\n" +
    "     context-attr=\"class\" suffix=\"bg\" translate-namespace=\"CONTAINER_HEADER\">\n" +
    "   <div class=\"pattern\" subject-id-to-attr-drv=\"vm.subjectId\" context-attr=\"class\" prefix=\"subject-background\"></div>\n" +
    "\n" +
    "    <div class=\"left-area\">\n" +
    "        <div class=\"side-text\">\n" +
    "            {{vm.sideText | cutString: 40}}\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "    <div class=\"center-num-slide\"\n" +
    "         ng-if=\"vm.options.showNumSlide\">\n" +
    "        {{vm.currentSlideNum}}/{{::vm.totalSlideNum}}\n" +
    "    </div>\n" +
    "    <div class=\"review-mode\" ng-if=\"vm.options.reviewMode\" ui-sref=\"^.summary\">\n" +
    "        <div class=\"background-opacity\"></div>\n" +
    "        <div class=\"summary-text\" translate=\".SUMMARY\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"right-area\">\n" +
    "        <svg-icon class=\"header-icon\" ng-if=\"vm.iconName\" name=\"{{vm.iconName}}\" ng-click=\"vm.iconClickHandler(); vm.showToolTip = false\"></svg-icon>\n" +
    "\n" +
    "        <div class=\"date-box\" ng-if=\"vm.options.showDate\">\n" +
    "            <timer type=\"1\" ng-model=\"vm.timerData.timeLeft\" play=\"true\" config=\"vm.timerData.config\"></timer>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"quit-back-button\" translate=\".QUIT_BTN_TEXT\" ng-if=\"vm.options.showQuit\" ng-click=\"vm.onClickedQuit()\"></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/svg/answer-explanation-close.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-596.6 492.3 133.2 133.5\"\n" +
    "     class=\"answer-explanation-close\">\n" +
    "    <style>\n" +
    "        svg.answer-explanation-close {\n" +
    "            width: 14px;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-close line {\n" +
    "            stroke: #161616;\n" +
    "            fill: none;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/infraWebAppZnkExercise/svg/lamp-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 51.7 54.3\"\n" +
    "     class=\"answer-explanation-lamp-icon-svg\">\n" +
    "    <style>\n" +
    "        svg.answer-explanation-lamp-icon-svg{\n" +
    "            width: 18px;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-lamp-icon-svg path{\n" +
    "            stroke: white;\n" +
    "            fill: white;\n" +
    "        }\n" +
    "\n" +
    "        svg.answer-explanation-lamp-icon-svg path.st0{\n" +
    "            fill: transparent;\n" +
    "        }\n" +
    "    </style>\n" +
    "\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M19.6,44.7c-0.9-0.1-2.1-0.1-2.1-1.3c0.1-4.5-2.5-8.1-3.9-12.1c-2.5-6.8,0.5-14.5,6.7-17.4\n" +
    "		c5-2.3,9.7-1.7,13.8,1.9c4.5,3.9,5.8,9.1,4.1,14.7c-0.9,3-2.4,5.9-3.4,8.8c-0.4,1-0.5,2.2-0.5,3.3c0,1.5-0.7,2.2-2.2,2.2\n" +
    "		C27.7,44.7,24.1,44.7,19.6,44.7z\"/>\n" +
    "        <path class=\"st1\" d=\"M44.5,44.9c-0.4,1.3-1.4,1.2-2.1,0.5c-1.5-1.4-2.9-2.9-4.3-4.3c-0.4-0.4-0.6-0.9-0.2-1.5\n" +
    "		c0.4-0.5,0.9-0.8,1.4-0.4c1.8,1.6,3.6,3.2,5,5.1C44.5,44.4,44.5,44.7,44.5,44.9z\"/>\n" +
    "        <path class=\"st2\" d=\"M8,7.8c1,0,5.9,4.7,5.9,5.5c0,0.5-0.3,0.8-0.7,1.1c-0.5,0.4-0.9,0.1-1.2-0.2c-1.5-1.5-3.1-3-4.6-4.5\n" +
    "		C7.1,9.3,7,8.8,7.3,8.2C7.5,8,7.9,7.9,8,7.8z\"/>\n" +
    "        <path class=\"st3\"\n" +
    "              d=\"M43.6,8c1.1,0.1,1.3,1.1,0.7,1.7c-1.4,1.7-3,3.3-4.7,4.7c-0.8,0.7-1.6,0.3-1.9-0.7C37.5,13,42.5,8,43.6,8z\"/>\n" +
    "        <path class=\"st4\" d=\"M12.7,38.9c0.5,0,0.9,0.2,1.1,0.7c0.3,0.5,0,0.9-0.3,1.2c-1.5,1.5-3,3-4.5,4.5c-0.4,0.4-0.8,0.4-1.3,0.2\n" +
    "		c-0.5-0.2-0.6-0.7-0.6-1.1C7.2,43.6,11.9,38.9,12.7,38.9z\"/>\n" +
    "        <path class=\"st5\" d=\"M4.5,27.2c-1,0-2.1,0-3.1,0c-0.7,0-1.4-0.1-1.4-1c0-1,0.6-1.3,1.4-1.3c2,0,3.9,0,5.9,0c0.8,0,1.2,0.5,1.3,1.2\n" +
    "		c0,0.8-0.5,1.1-1.3,1.1C6.4,27.2,5.4,27.2,4.5,27.2z\"/>\n" +
    "        <path class=\"st6\" d=\"M47.1,27.2c-0.8,0-1.7,0-2.5,0c-0.8,0-1.6-0.1-1.5-1.2c0-0.7,0.5-1.2,1.3-1.1c2,0,3.9,0,5.9,0\n" +
    "		c0.9,0,1.5,0.4,1.4,1.4c-0.1,0.9-0.8,0.9-1.5,0.9C49.2,27.2,48.1,27.2,47.1,27.2z\"/>\n" +
    "        <path class=\"st7\" d=\"M26.9,4.2c0,1,0,2,0,3.1c0,0.7-0.3,1.3-1.1,1.3c-0.8,0-1.1-0.6-1.1-1.3c0-1.9,0-3.9,0-5.8c0-0.7,0.2-1.3,1-1.4\n" +
    "		c1-0.1,1.3,0.6,1.2,1.4C26.9,2.4,27,3.3,26.9,4.2z\"/>\n" +
    "        <path class=\"st8\" d=\"M17.4,26.3c0-3.2,1.2-5.3,2.9-7.2c0.6-0.6,1.2-1.3,2.1-0.6c1,0.8,0.3,1.4-0.3,2.1c-3.1,3.4-2.9,7-0.9,10.8\n" +
    "		c0.5,0.9,1.5,2.1,0,2.8c-1.3,0.6-1.6-0.9-2.1-1.7C18,30.4,17.2,28.2,17.4,26.3z\"/>\n" +
    "        <path class=\"st9\" d=\"M32,48.8H19.3c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1H32c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C33.1,48.3,32.6,48.8,32,48.8z\"/>\n" +
    "        <path class=\"st9\" d=\"M31,51.6H20.6c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1H31c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C32.1,51.1,31.6,51.6,31,51.6z\"/>\n" +
    "        <path class=\"st9\" d=\"M27.3,54.3H24c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1h3.2c0.6,0,1.1,0.5,1.1,1.1l0,0\n" +
    "		C28.4,53.8,27.9,54.3,27.3,54.3z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation',
        ['ngMaterial',
        'znk.infra.popUp',
        'znk.infra.svgIcon',
        'pascalprecht.translate',
        'znk.infra-web-app.purchase',
        'znk.infra.user'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'invitation-teacher-icon': 'components/invitation/svg/teacher-icon.svg',
                    'invitation-close-popup': 'components/invitation/svg/invitation-close-popup.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);

})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').controller('invitationApproveModalCtrl',

        ["locals", "$mdDialog", "InvitationHelperService", "$filter", "PopUpSrv", function (locals, $mdDialog, InvitationHelperService, $filter, PopUpSrv) {
            'ngInject';

            var self = this;
            self.translate = $filter('translate');
            self.invitation = locals.invitation;
            self.requestMessage = false;
            self.btnDisable = false;

            this.approve = function () {
                self.btnDisable = true;
                self.approveStartLoader = true;
                InvitationHelperService.approve(self.invitation).then(function (response) {
                    self.requestMessage = true;
                    self.approveFillLoader = true;
                    if (response.data && response.data.success) {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_CONNECT') + self.invitation.senderName;
                    } else {
                        self.closeModal();
                        PopUpSrv.error('', self.translate('INVITATION_MANAGER_DIRECTIVE.APPROVE_INVITE_ERROR'));
                    }
                }, function () {
                    self.closeModal();
                    PopUpSrv.error('', self.translate('INVITATION_MANAGER_DIRECTIVE.APPROVE_INVITE_ERROR'));
                });
            };

            this.decline = function () {
                self.btnDisable = true;
                self.cancelStartLoader = true;
                InvitationHelperService.decline(self.invitation).then(function (response) {
                    self.requestMessage = true;
                    self.cancelFillLoader = true;
                    if (response.data && response.data.success) {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_DECLINE');
                    } else {
                        self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.CANCEL_INVITE_ERROR');
                    }
                }, function () {
                    self.requestMessage = true;
                    self.responseMessage = self.translate('INVITATION_MANAGER_DIRECTIVE.CANCEL_INVITE_ERROR');
                });
            };

            this.closeModal = function () {
                $mdDialog.cancel();
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "INVITE_APPROVE_MODAL":{
                            "YOU_HAVE_INVITE": "You have an invitation",
                            "WANT_TO_CONNECT": "would like to track your progress and view your completed work",
                            "DECLINE": "DECLINE",
                            "ACCEPT": "ACCEPT",
                            "SUCCESS_SEND_MSG": "You’ve successfully connected with your teacher.",
                            "DONE": "Done",
                            "INVITE_ERROR_TITLE": "Invalid Invitation",
                            "INVITE_ERROR_MSG": "The invitation you are trying to use is either invalid or expired. Please contact your educator to get a new invitation"
                        },

                        "INVITATION_MANAGER_DIRECTIVE": {
                            "EMPTY_INVITE":"Invite a teacher to track<br>your progress",
                            "INVITE_STUDENTS": "Invite a Teacher",
                            "PENDING_INVITATIONS": "Pending Invitations",
                            "PENDING_CONFORMATIONS": "Pending conformations",
                            "APPROVE_INVITE_ERROR":"We couldn't approve this invitation, please try again later.<br>If this persists please contact support@zinkerz.com",
                            "CANCEL_INVITE_ERROR": "The invitation couldn't be declined, please try again later.<br>If this persists please contact support@zinkerz.com",
                            "SUCCESS": "Success",
                            "SUCCESS_CONNECT": "You've successfully connected<br>with ",
                            "SUCCESS_DECLINE": "The invitation was declined",
                            "SUCCESS_DISCONNECT": "You've successfully disconnected from your teacher",
                            "DISCONNECT_ERROR": "We couldn't disconnected you from your teacher, please try again later.<br>If this persists please contact support@zinkerz.com",
                            "MY_TEACHER":"My Teacher",
                            "DECLINED_INVITATIONS": "DECLINED",
                            "DECLINED_YOR_INVITATION": "declined your invitation",
                            "DELETE_INVITATION": "Delete Invitation",
                            "ARE_U_SURE": "Are you sure?",
                            "YES": "Yes",
                            "NO": "No",
                            "DELETE_SUCCESS": "The invitation was successfully deleted",
                            "DELETE_ERROR": "We couldn't delete this invitation, please try again later.<br>If this persists please contact support@zinkerz.com"
                        },

                        "INVITE_TEACHER_MODAL": {
                            "INVITE_TEACHER": "Invite a Teacher",
                            "TEACHER_EMAIL": "Your teacher's email",
                            "TEACHER_NAME": "Your teacher's name",
                            "REQUIRED": "This field is required",
                            "INVITE": "Invite",
                            "INVITE_MSG": "Your teacher will receive an email invitation.",
                            "SUCCESS_INVITE": "You've successfully invited your teacher.",
                            "DONE": "Done",
                            "GENERAL_ERROR" : "An error has occurred, Please try again later"
                        }
                    }

                );
            }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').directive('invitationManager',

        ["InvitationService", "$filter", "InvitationHelperService", "ENV", "PopUpSrv", function (InvitationService, $filter, InvitationHelperService, ENV, PopUpSrv) {
            'ngInject';

           return {
                templateUrl: 'components/invitation/directives/invitation-manager.template.html',
                restrict: 'E',
                scope: {},
                link: function linkFn(scope) {
                    // if (!ENV.dashboardFeatureEnabled) {
                    //    element.remove();
                    //    return;
                    // }

                    scope.translate = $filter('translate');

                    scope.pendingTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.PENDING_INVITATIONS');
                    scope.pendingConformationsTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.PENDING_CONFORMATIONS');
                    scope.declinedTitle = scope.translate('INVITATION_MANAGER_DIRECTIVE.DECLINED_INVITATIONS');

                    InvitationService.getReceived().then(function (invitations) {
                        scope.invitations = invitations;
                        scope.pendingTitle += ' (' + (scope.getItemsCount(scope.invitations) || 0) + ')';
                    });

                    InvitationService.getPendingConformations().then(function (conformations) {
                        angular.forEach(conformations, function (conformation, key) {
                            conformation.invitationId = key;
                        });
                        scope.conformations = conformations;
                        scope.pendingConformationsTitle += ' (' + (scope.getItemsCount(scope.conformations) || 0) + ')';
                    });

                    InvitationService.getDeclinedInvitations().then(function (declinedInvitations) {
                        scope.declinedInvitations = declinedInvitations;
                    });

                    InvitationService.getMyTeacher().then(function (teacherObj) {
                        scope.myTeachers = teacherObj;
                    });

                    scope.hasItems = function (obj) {
                        return !!scope.getItemsCount(obj);
                    };

                    scope.getItemsCount = function (obj) {
                        return Object.keys(obj).length;
                    };

                    scope.approve = function (invitation) {
                        InvitationHelperService.approve(invitation);
                    };

                    scope.decline = function (invitation) {
                        InvitationHelperService.decline(invitation);
                    };

                    scope.deletePendingConformations = function (invitation) {
                        var _title = scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_INVITATION');
                        var _content = scope.translate('INVITATION_MANAGER_DIRECTIVE.ARE_U_SURE');
                        var _yes = scope.translate('INVITATION_MANAGER_DIRECTIVE.YES');
                        var _no = scope.translate('INVITATION_MANAGER_DIRECTIVE.NO');

                        PopUpSrv.ErrorConfirmation(_title, _content, _yes, _no).promise.then(function (result) {
                            if (result === 'Yes') {
                                InvitationService.deletePendingConformations(invitation).then(function (response) {
                                    if (response.data && response.data.success) {
                                        PopUpSrv.success(scope.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS'), scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_SUCCESS'));
                                    } else {
                                        PopUpSrv.error('', scope.translate('INVITATION_MANAGER_DIRECTIVE.DELETE_ERROR'));
                                    }
                                });
                            }
                        });
                    };

                    scope.deleteTeacher = function (teacher) {
                        InvitationHelperService.deleteTeacher(teacher);
                    };

                    scope.openInviteModal = function () {
                        InvitationService.openInviteTeacherModal();
                    };

                    var watcherDestroy = scope.$on('$destroy', function () {
                        InvitationService.removeListeners();
                        watcherDestroy();
                    });
                }
            };
        }]
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').controller('inviteTeacherModalController',

        ["$mdDialog", "InvitationService", "PopUpSrv", "$filter", "$timeout", function ($mdDialog, InvitationService, PopUpSrv, $filter, $timeout) {
            'ngInject';
            var self = this;
            self.translate = $filter('translate');

            this.sendInvitation = function () {
                self.startLoader = true;
                InvitationService.inviteTeacher(self.teacherEmail, self.teacherName).then(function (response) {
                    self.fillLoader = true;
                    if (response.data && response.data.success) {
                        $timeout(function () {
                            self.showSuccess = true;
                        }, 100);
                    } else {
                        $timeout(function () {
                            self.closeModal();
                            PopUpSrv.error('', self.translate('INVITE_TEACHER_MODAL.GENERAL_ERROR'));
                        }, 100);
                    }
                });
            };

            this.closeModal = function () {
                $mdDialog.hide();
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.invitation')
        .run(["$location", "InvitationService", function($location, InvitationService){
            'ngInject';
            var search = $location.search();

            if (angular.isDefined(search.iid)) {
                InvitationService.showInvitationConfirm(search.iid);
                delete search.iid;
                $location.search(search);
            }
        }]);

})(angular);

'use strict';

angular.module('znk.infra-web-app.invitation').service('InvitationListenerService',
    ["ENV", "InfraConfigSrv", "AuthService", "$timeout", "$q", "StorageSrv", function (ENV, InfraConfigSrv, AuthService, $timeout, $q, StorageSrv) {
        'ngInject';

        var NEW_INVITATION_PATH, SENT_INVITATION_PATH, MY_TEACHER_PATH;

        var self = this;
        self.receivedInvitations = {};
        self.pendingConformations = {};
        self.declinedInvitations = {};
        self.myTeacher = {};


        var pathsProm = $q.when().then(function () {
            var STUDENT_INVITATION_PATH = StorageSrv.variables.appUserSpacePath + '/invitations';
            NEW_INVITATION_PATH = STUDENT_INVITATION_PATH + '/received';
            SENT_INVITATION_PATH = STUDENT_INVITATION_PATH + '/sent';
            MY_TEACHER_PATH = STUDENT_INVITATION_PATH + '/approved/';
           return $q.when();
        });

        this.removeListeners = function () {
            $q.when(pathsProm).then(function(){
                var receivedInvitationRef = firebaseListenerRef(NEW_INVITATION_PATH);
                receivedInvitationRef.off('child_added', receivedInvitationsChildAdded);
                receivedInvitationRef.off('child_removed', receivedInvitationsChildRemoved);

                var myTeacherRef = firebaseListenerRef(MY_TEACHER_PATH);
                myTeacherRef.off('child_added', myTeacherChildAdded);
                myTeacherRef.off('child_removed', myTeacherChildRemoved);

                var sentInvitationRef = firebaseListenerRef(SENT_INVITATION_PATH);
                sentInvitationRef.off('child_added', sentInvitationsChildAdded);
                sentInvitationRef.off('child_removed', sentInvitationsChildRemoved);
            });
        };


        self.addListeners = function () {
            $q.when(pathsProm).then(function(){
                _childAddedOrRemovedListener(NEW_INVITATION_PATH, receivedInvitationsChildAdded, receivedInvitationsChildRemoved);
                _childAddedOrRemovedListener(MY_TEACHER_PATH, myTeacherChildAdded, myTeacherChildRemoved);
                _childAddedOrRemovedListener(SENT_INVITATION_PATH, sentInvitationsChildAdded, sentInvitationsChildRemoved);
            });
        };

        function _childAddedOrRemovedListener(path, childAddedHandler, childRemovedHandler){
            var ref = firebaseListenerRef(path);
            ref.on('child_added', childAddedHandler);
            ref.on('child_removed', childRemovedHandler);
        }


        function receivedInvitationsChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.receivedInvitations[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function receivedInvitationsChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.receivedInvitations[dataSnapshot.key()];
                }
            });
        }

        function myTeacherChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.myTeacher[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function myTeacherChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.myTeacher[dataSnapshot.key()];
                }
            });
        }

        function sentInvitationsChildAdded(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    self.pendingConformations[dataSnapshot.key()] = dataSnapshot.val();
                }
            });
        }

        function sentInvitationsChildRemoved(dataSnapshot) {
            $timeout(function () {
                if (dataSnapshot) {
                    delete self.pendingConformations[dataSnapshot.key()];
                }
            });
        }

        function firebaseListenerRef(userPath) {
            var authData = AuthService.getAuth();
            var fullPath = ENV.fbDataEndPoint + ENV.firebaseAppScopeName + '/' + userPath;
            var userFullPath = fullPath.replace('$$uid', authData.uid);
            return new Firebase(userFullPath);
        }

    }]
);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationService',

        ["$mdDialog", "ENV", "AuthService", "$q", "$http", "PopUpSrv", "$filter", "UserProfileService", "InvitationListenerService", function ($mdDialog, ENV, AuthService, $q, $http, PopUpSrv, $filter, UserProfileService, InvitationListenerService) {
            'ngInject';

            var invitationEndpoint = ENV.backendEndpoint + 'invitation';
            var translate = $filter('translate');
            var httpConfig = {
                headers: 'application/json',
                timeout: ENV.promiseTimeOut
            };

            this.invitationStatus = {
                pending: 0,
                approved: 1,
                receiverDeclined: 2,
                senderDelete: 3,
                resent: 4,
                connectToUser: 5,
                receiverDelete: 6
            };

            this.getMyTeacher = function () {
                return $q.when(InvitationListenerService.myTeacher);
            };

            this.getReceived = function () {
                return $q.when(InvitationListenerService.receivedInvitations);
            };

            this.getPendingConformations = function () {
                return $q.when(InvitationListenerService.pendingConformations);
            };

            this.getDeclinedInvitations = function () {
                return $q.when(InvitationListenerService.declinedInvitations);
            };

            this.showInvitationConfirm = function (invitationId) {
                if (!ENV.dashboardFeatureEnabled) {
                    return false;
                }
                var invitation = {
                    status: this.invitationStatus.connectToUser,
                    invitationId: invitationId,
                    receiverAppName: ENV.firebaseAppScopeName,
                    senderAppName: ENV.firebaseDashboardAppScopeName
                };
                return this.updateInvitationStatus(invitation).then(function (response) {
                    if (response.data.success) {
                        return $mdDialog.show({
                            locals: {
                                invitation: response.data.data
                            },
                            controller: 'invitationApproveModalCtrl',
                            controllerAs: 'vm',
                            templateUrl: 'components/invitation/approveModal/invitationApproveModal.template.html',
                            clickOutsideToClose: true,
                            escapeToClose: true
                        });
                    }

                    var errorTitle = translate('INVITE_APPROVE_MODAL.INVITE_ERROR_TITLE');
                    var errorMsg = translate('INVITE_APPROVE_MODAL.INVITE_ERROR_MSG');
                    return PopUpSrv.error(errorTitle, errorMsg);
                });
            };

            this.updateInvitationStatus = function (invitation) {
                var authData = AuthService.getAuth();
                invitation.uid = authData.uid;
                invitation.senderAppName = ENV.firebaseDashboardAppScopeName;
                invitation.senderEmail = authData.password.email;
                return updateStatus(invitation);
            };

            this.openInviteTeacherModal = function () {
                return $mdDialog.show({
                    controller: 'inviteTeacherModalController',
                    controllerAs: 'vm',
                    templateUrl: 'components/invitation/inviteTeacherModal/inviteTeacherTemplateModal.template.html',
                    clickOutsideToClose: true,
                    escapeToClose: true
                });
            };

            this.inviteTeacher = function (receiverEmail, receiverName) {
                return UserProfileService.getProfile().then(function (profile) {
                    var authData = AuthService.getAuth();
                    var newInvitiation = [{
                       receiverAppName: ENV.firebaseDashboardAppScopeName,
                       receiverEmail: receiverEmail,
                       receiverName: receiverName || receiverEmail,
                       senderAppName: ENV.firebaseAppScopeName,
                       senderEmail: profile.email,
                       senderName: profile.nickname || profile.email,
                       senderUid: authData.uid
                    }];
                    return $http.post(invitationEndpoint, newInvitiation, httpConfig).then(function (response) {
                       return {
                           data: response.data[0]
                       };
                    }, function (error) {
                       return {
                           data: error.data
                       };
                    });
                });
            };

            this.deletePendingConformations = function (invitation) {
                var authData = AuthService.getAuth();
                invitation.uid = authData.uid;
                invitation.status = this.invitationStatus.senderDelete;
                invitation.receiverAppName = ENV.firebaseDashboardAppScopeName;
                invitation.senderAppName = ENV.firebaseAppScopeName;
                invitation.senderEmail = authData.password.email;
                return updateStatus(invitation);
            };

            this.removeListeners = function () {
                InvitationListenerService.removeListeners();
            };

            function updateStatus(invitation) {
                var updateUrl = invitationEndpoint + '/' + invitation.invitationId;
                return $http.put(updateUrl, invitation, httpConfig).then(
                    function (response) {
                        return {
                            data: response.data
                        };
                    },
                    function (error) {
                        return {
                            data: error.data
                        };
                    });
            }

            InvitationListenerService.addListeners();
        }]
    );
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.invitation').service('InvitationHelperService',

        ["InvitationService", "$filter", "PopUpSrv", "UserProfileService", function (InvitationService, $filter, PopUpSrv, UserProfileService) {
            'ngInject';

            var self = this;
            self.translate = $filter('translate');
            self.translatedTitles = {
                successDisconnect: self.translate('INVITATION_MANAGER_DIRECTIVE.SUCCESS_DISCONNECT'),
                errorDisconnect: self.translate('INVITATION_MANAGER_DIRECTIVE.DISCONNECT_ERROR')
            };

            this.approve = function (invitation) {
                return UserProfileService.getProfile().then(function (profile) {
                    invitation.status = InvitationService.invitationStatus.approved;
                    invitation.originalReceiverName = profile.nickname || profile.email;
                    invitation.originalReceiverEmail = profile.email;
                    invitation.invitationReceiverName = invitation.receiverName;
                    invitation.invitationReceiverEmail = invitation.receiverEmail;

                    return updateStatus(invitation);
                });
            };

            this.decline = function (invitation) {
                invitation.status = InvitationService.invitationStatus.receiverDeclined;
                return updateStatus(invitation);
            };

            this.deleteTeacher = function (invitation) {
                invitation.status = InvitationService.invitationStatus.receiverDelete;
                updateStatus(invitation).then(function (response) {
                    if (response.data && response.data.success) {
                        PopUpSrv.success(self.translatedTitles.success, self.translatedTitles.successDisconnect);
                    } else {
                        PopUpSrv.error('', self.translatedTitles.errorDisconnect);
                    }
                }, function () {
                    PopUpSrv.error('', self.translatedTitles.errorDisconnect);
                });
            };

            function updateStatus(invitation) {
                return InvitationService.updateInvitationStatus(invitation);
            }
        }]
    );
})(angular);

angular.module('znk.infra-web-app.invitation').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/invitation/approveModal/invitationApproveModal.template.html",
    "<md-dialog ng-cloak class=\"invitation-confirm-modal\" translate-namespace=\"INVITE_APPROVE_MODAL\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"invitation-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content ng-switch=\"vm.requestMessage\">\n" +
    "        <section ng-switch-when=\"false\">\n" +
    "            <div class=\"main-title md-subheader\" translate=\".YOU_HAVE_INVITE\"></div>\n" +
    "            <div class=\"teacher\">\n" +
    "                <span>{{::vm.invitation.senderName}}</span>\n" +
    "                <span class=\"want-to-connect\" translate=\".WANT_TO_CONNECT\"></span>\n" +
    "            </div>\n" +
    "            <div class=\"btn-wrap\">\n" +
    "                <button class=\"md-button md-sm outline-blue\"\n" +
    "                        ng-disabled=\"vm.btnDisable === true\"\n" +
    "                        ng-click=\"vm.decline()\"\n" +
    "                        element-loader\n" +
    "                        fill-loader=\"vm.cancelFillLoader\"\n" +
    "                        show-loader=\"vm.cancelStartLoader\"\n" +
    "                        bg-loader=\"'#acacac'\"\n" +
    "                        precentage=\"50\"\n" +
    "                        font-color=\"'#0a9bad'\"\n" +
    "                        bg=\"'#FFFFFF'\">\n" +
    "                    <span translate=\".DECLINE\"></span>\n" +
    "                </button>\n" +
    "                <button class=\"md-button md-sm primary\"\n" +
    "                        ng-disabled=\"vm.btnDisable === true\"\n" +
    "                        ng-click=\"vm.approve()\"\n" +
    "                        element-loader\n" +
    "                        fill-loader=\"vm.approveFillLoader\"\n" +
    "                        show-loader=\"vm.approveStartLoader\"\n" +
    "                        bg-loader=\"'#07434A'\"\n" +
    "                        precentage=\"50\"\n" +
    "                        font-color=\"'#FFFFFF'\"\n" +
    "                        bg=\"'#0a9bad'\">\n" +
    "                    <span translate=\".ACCEPT\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </section>\n" +
    "\n" +
    "        <div class=\"big-success-msg switch-animation\" ng-switch-when=\"true\">\n" +
    "            <svg-icon class=\"completed-v-icon-wrap\" name=\"completed-v-icon\"></svg-icon>\n" +
    "            <div ng-bind-html=\"vm.responseMessage\"></div>\n" +
    "            <div class=\"done-btn-wrap\">\n" +
    "                <md-button aria-label=\"{{'INVITE_APPROVE_MODAL.DONE' | translate}}\"\n" +
    "                           class=\"success lg drop-shadow\" ng-click=\"vm.closeModal()\">\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"exclamation-mark-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/invitation/directives/invitation-manager.template.html",
    "<div translate-namespace=\"INVITATION_MANAGER_DIRECTIVE\">\n" +
    "<md-menu md-offset=\"-225 51\"  class=\"invitation-manager\">\n" +
    "    <div ng-click=\"$mdOpenMenu($event);\" class=\"md-icon-button invite-icon-btn\" aria-label=\"Open Invite menu\" ng-switch=\"hasItems(myTeachers)\">\n" +
    "        <div class=\"num-of-receive\" ng-if=\"hasItems(invitations)\">{{getItemsCount(invitations)}}</div>\n" +
    "        <section ng-switch-when=\"false\" class=\"circle-invite-wrap teacher-icon-wrap\">\n" +
    "            <svg-icon name=\"invitation-teacher-icon\"></svg-icon>\n" +
    "        </section>\n" +
    "        <section ng-switch-when=\"true\" class=\"circle-invite-wrap teacher-active-icon-wrap\">\n" +
    "            <svg-icon name=\"teacher-active-icon\"></svg-icon>\n" +
    "        </section>\n" +
    "    </div>\n" +
    "    <md-menu-content class=\"md-menu-content-invitation-manager\" ng-switch=\"(hasItems(invitations) || hasItems(myTeachers) || hasItems(declinedInvitations) || hasItems(conformations))\">\n" +
    "        <div class=\"empty-invite\" ng-switch-when=\"false\">\n" +
    "            <div class=\"empty-msg\" translate=\".EMPTY_INVITE\"></div>\n" +
    "            <div class=\"invite-action\">\n" +
    "                <div class=\"md-button outline-blue invite-btn\" ng-click=\"openInviteModal()\">\n" +
    "                    <div translate=\".INVITE_STUDENTS\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-if=\"hasItems(myTeachers)\" class=\"my-teacher-wrap\" ng-repeat=\"teacher in myTeachers\">\n" +
    "            <div class=\"title\" translate=\".MY_TEACHER\"></div>\n" +
    "            <div class=\"teacher-name\">{{::teacher.senderName}}</div>\n" +
    "            <div class=\"teacher-email\">{{::teacher.senderEmail}}</div>\n" +
    "            <svg-icon name=\"invitation-close-popup\" class=\"delete-teacher\" ng-click=\"deleteTeacher(teacher)\"></svg-icon>\n" +
    "        </div>\n" +
    "        <md-list ng-if=\"hasItems(declinedInvitations)\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::declinedTitle}}</md-subheader>\n" +
    "            <md-list-item class=\"declined-invitation-list\" ng-repeat=\"declinedInvitation in declinedInvitations\">\n" +
    "                <div class=\"declined-teacher-wrap\">\n" +
    "                    <div class=\"teacher-name\">{{::declinedInvitation.teacherName}} </div>\n" +
    "                    <span class=\"declined-your-invitation-text\" translate=\".DECLINED_YOR_INVITATION\"></span>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "        <md-list ng-if=\"hasItems(invitations)\" ng-switch-when=\"true\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::pendingTitle}}</md-subheader>\n" +
    "            <md-list-item ng-repeat=\"invite in invitations\">\n" +
    "                <svg-icon name=\"received-invitations-icon\" class=\"received-invitations\"></svg-icon>\n" +
    "                <div class=\"teacher-wrap\">\n" +
    "                    <div class=\"teacher-name\">{{::invite.senderName}}</div>\n" +
    "                    <div class=\"creation-time\">{{::invite.creationTime | date : 'd MMM, h:mm a'}}</div>\n" +
    "                </div>\n" +
    "                <div class=\"decline-invite\">\n" +
    "                    <svg-icon name=\"invitation-close-popup\" class=\"decline-invite-btn\" ng-click=\"decline(invite)\"></svg-icon>\n" +
    "                </div>\n" +
    "                <div class=\"approve-invite\">\n" +
    "                    <svg-icon name=\"v-icon\" class=\"v-icon-btn\" ng-click=\"approve(invite)\"></svg-icon>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "        <md-list ng-if=\"hasItems(conformations)\">\n" +
    "            <md-subheader class=\"invite-sub-title\">{{::pendingConformationsTitle}}</md-subheader>\n" +
    "            <md-list-item ng-repeat=\"conformation in conformations\">\n" +
    "                <svg-icon name=\"sent-invitations-icon\" class=\"sent-invitations\"></svg-icon>\n" +
    "                <div class=\"teacher-wrap\">\n" +
    "                    <div class=\"teacher-email\">{{::conformation.receiverName}}</div>\n" +
    "                </div>\n" +
    "                <div class=\"decline-conformation\">\n" +
    "                    <svg-icon name=\"invitation-close-popup\" class=\"decline-conformation-btn\" ng-click=\"deletePendingConformations(conformation)\"></svg-icon>\n" +
    "                </div>\n" +
    "            </md-list-item>\n" +
    "        </md-list>\n" +
    "    </md-menu-content>\n" +
    "</md-menu>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/invitation/inviteTeacherModal/inviteTeacherTemplateModal.template.html",
    "<md-dialog class=\"invite-teacher-modal-wrap\" ng-cloak translate-namespace=\"INVITE_TEACHER_MODAL\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"invitation-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content class=\"modal-content invite-teacher-content\" ng-switch=\"!!vm.showSuccess\">\n" +
    "        <div class=\"modal-main-title\" translate=\".INVITE_TEACHER\"></div>\n" +
    "        <form ng-switch-when=\"false\" class=\"invite-teacher-form\" novalidate name=\"inviteTeacherForm\"\n" +
    "              ng-submit=\"inviteTeacherForm.$valid && vm.sendInvitation()\">\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.teacherEmail && inviteTeacherForm.$submitted}\">\n" +
    "                <input type=\"email\" autocomplete=\"off\"\n" +
    "                       placeholder=\"{{::'INVITE_TEACHER_MODAL.TEACHER_EMAIL' | translate}}\" name=\"teacherEmail\"\n" +
    "                       ng-minlength=\"6\" ng-maxlength=\"25\" ng-required=\"true\" ng-model=\"vm.teacherEmail\">\n" +
    "                <div class=\"error-msg\" translate=\".REQUIRED\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"znk-input-group\">\n" +
    "                <input type=\"text\" autocomplete=\"off\"\n" +
    "                       placeholder=\"{{::'INVITE_TEACHER_MODAL.TEACHER_NAME' | translate}}\" name=\"teacherName\"\n" +
    "                       ng-model=\"vm.teacherName\">\n" +
    "            </div>\n" +
    "            <div class=\"btn-wrap\">\n" +
    "                <div translate=\".INVITE_MSG\" class=\"invite-msg\"></div>\n" +
    "               <!-- <button type=\"submit\" class=\"md-button success lg drop-shadow\" translate=\".INVITE\"></button>-->\n" +
    "                <button type=\"submit\" class=\"md-button lg success drop-shadow\"\n" +
    "                    element-loader\n" +
    "                    fill-loader=\"vm.fillLoader\"\n" +
    "                    show-loader=\"vm.startLoader\"\n" +
    "                    bg-loader=\"'#72ab40'\"\n" +
    "                    precentage=\"50\"\n" +
    "                    font-color=\"'#FFFFFF'\"\n" +
    "                    bg=\"'#87ca4d'\">\n" +
    "                    <span translate=\".INVITE\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "        <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "            <svg-icon class=\"completed-v-icon-wrap\" name=\"completed-v-icon\"></svg-icon>\n" +
    "            <div translate=\".SUCCESS_INVITE\"></div>\n" +
    "            <div class=\"done-btn-wrap\">\n" +
    "                <md-button class=\"success lg drop-shadow\" ng-click=\"vm.closeModal()\">\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <div class=\"invite-teacher-icon\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/invitation/svg/invitation-close-popup.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\"\n" +
    "    class=\"invitation-close-popup\">\n" +
    "    <style>\n" +
    "        .invitation-close-popup .st0{fill:none;}\n" +
    "        .invitation-close-popup .st1{fill:none;stroke:\n" +
    "        #ffffff;;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/invitation/svg/teacher-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 196.7 145.2\" class=\"teacher-icon\">\n" +
    "<path d=\"M76.7,114.2H16c-3.3,0-6-2.7-6-6V6c0-3.3,2.7-6,6-6h134c3.3,0,6,2.7,6,6l0,45.9c0,1.7-1.3,3-3,3c0,0,0,0,0,0\n" +
    "	c-1.7,0-3-1.3-3-3L150,6L16,6v102.2h60.7c1.7,0,3,1.3,3,3S78.4,114.2,76.7,114.2z\"/>\n" +
    "<path d=\"M129,24.2H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h61c1.7,0,3,1.3,3,3S130.7,24.2,129,24.2z\"/>\n" +
    "<path d=\"M129,44.3H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h61c1.7,0,3,1.3,3,3S130.7,44.3,129,44.3z\"/>\n" +
    "<path d=\"M114,64.5H68c-1.7,0-3-1.3-3-3s1.3-3,3-3h46c1.7,0,3,1.3,3,3S115.7,64.5,114,64.5z\"/>\n" +
    "<path d=\"M153,108.8c-1.6,0-2.9-1.2-3-2.8c-0.1-1.7,1.1-3.1,2.8-3.2c11-0.8,19.6-10.1,19.6-21.1c0-11-8.6-20.3-19.6-21.1\n" +
    "	c-1.7-0.1-2.9-1.6-2.8-3.2c0.1-1.7,1.6-2.9,3.2-2.8c14.1,1.1,25.1,13,25.1,27.1c0,14.1-11,26-25.1,27.1\n" +
    "	C153.1,108.8,153.1,108.8,153,108.8z\"/>\n" +
    "<path d=\"M151.2,108.8c-15,0-27.2-12.2-27.2-27.2s12.2-27.2,27.2-27.2c0.7,0,1.4,0,2.1,0.1c1.7,0.1,2.9,1.6,2.8,3.2s-1.5,2.9-3.2,2.8\n" +
    "	c-0.5,0-1.1-0.1-1.6-0.1c-11.7,0-21.2,9.5-21.2,21.2c0,12.2,10.4,22,22.8,21.1c1.7-0.1,3.1,1.1,3.2,2.8c0.1,1.7-1.1,3.1-2.8,3.2\n" +
    "	C152.5,108.8,151.8,108.8,151.2,108.8z\"/>\n" +
    "<path d=\"M115.6,113.8c-1.1,0-2.1-0.6-2.7-1.6c-0.8-1.5-0.2-3.3,1.3-4.1l20.1-10.6c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1\n" +
    "	L117,113.5C116.5,113.7,116.1,113.8,115.6,113.8z\"/>\n" +
    "<path d=\"M115,114.2c-1.1,0-2.1-0.6-2.7-1.6c-0.8-1.5-0.2-3.3,1.3-4.1l0.6-0.3c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1\n" +
    "	l-0.6,0.3C115.9,114.1,115.4,114.2,115,114.2z\"/>\n" +
    "<path d=\"M193.7,145.2H107c-1,0-1.9-0.5-2.4-1.2c-0.6-0.8-0.7-1.8-0.4-2.7l1.5-4.8l-3.7,1.2c-1.6,0.5-3.3,0.6-4.8,0.3\n" +
    "	c-3.2-0.7-7.9-2.9-12.6-9.7c-5.2-7.6-13.9-20.9-17.4-26.2c-1-1.6-2.1-4.3-2.1-6.6c-0.1-3.5,1.4-6.7,3.9-8.6c2.6-2,6-2.5,9.6-1.4\n" +
    "	c2.5,0.7,5.4,3,6.7,5.3l14.1,24.7c0.2,0.3,0.6,0.4,0.9,0.3l13.3-7c1.5-0.8,3.3-0.2,4.1,1.3c0.8,1.5,0.2,3.3-1.3,4.1l-13.3,7\n" +
    "	c-3.2,1.7-7.1,0.5-8.9-2.6L80,93.5c-0.5-1-2.1-2.2-3.2-2.5c-1.3-0.4-3-0.6-4.3,0.4c-1,0.8-1.6,2.2-1.6,3.8c0,0.9,0.6,2.6,1.1,3.4\n" +
    "	c3.5,5.4,12.2,18.6,17.3,26.1c3.8,5.5,7.2,6.9,8.9,7.3c0.6,0.1,1.2,0.1,1.7-0.1l9.2-3c1.1-0.3,2.2-0.1,3,0.7s1.1,2,0.7,3l-2.1,6.4\n" +
    "	h79.5c-1.3-24.4-26.2-33.4-27.3-33.8c-1.6-0.5-2.4-2.3-1.8-3.8c0.5-1.6,2.3-2.4,3.8-1.8c0.3,0.1,32.1,11.6,31.3,42.6\n" +
    "	C196.6,143.9,195.3,145.2,193.7,145.2z\"/>\n" +
    "<path d=\"M70.7,92.2c-0.9,0-1.8-0.4-2.4-1.2L41.3,53.7c-1-1.3-0.7-3.2,0.7-4.2c1.3-1,3.2-0.7,4.2,0.7l26.9,37.2\n" +
    "	c1,1.3,0.7,3.2-0.7,4.2C71.9,92,71.3,92.2,70.7,92.2z\"/>\n" +
    "<path d=\"M83,134.2H3c-1.7,0-3-1.3-3-3s1.3-3,3-3h80c1.7,0,3,1.3,3,3S84.7,134.2,83,134.2z\"/>\n" +
    "</svg>\n" +
    "");
}]);

(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.user',
        'znk.infra.mailSender',
        'znk.infra.storage',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'close-popup': 'components/liveLessons/svg/close-popup.svg',
                'reschedule-icon': 'components/liveLessons/svg/reschedule-icon.svg',
                'calendar-icon': 'components/liveLessons/svg/calendar-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ])
        .run(["$mdToast", "MyLiveLessons", function ($mdToast, MyLiveLessons) {
            'ngInject';
            MyLiveLessons.getClosestLiveLesson().then(function (closestLiveLessonObj) {
                if (angular.isUndefined(closestLiveLessonObj.startTime)) {
                    return;
                }

                var optionsOrPreset = {
                    templateUrl: 'components/liveLessons/templates/upcomingLessonToast.template.html',
                    hideDelay: false,
                    controller: 'UpcomingLessonToasterController',
                    controllerAs: 'vm',
                    locals: {
                        closestLiveLesson: closestLiveLessonObj
                    }
                };

                $mdToast.cancel().then(function () {
                    $mdToast.show(optionsOrPreset);
                });
            });
        }]);
})(window, angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "MY_LIVE_LESSONS_POPUP":{
                            "LIVE_LESSONS_SCHEDULE": "Live Lessons Schedule",
                            "UPCOMING_LESSON": "UPCOMING LESSON",
                            "OK": "OK",
                            "NO_LIVE_LESSONS": "You didn't schedule any live lessons yet...",
                            "CURRENT_TIME": "Current Time - {{currentTime}}",
                            "RESCHEDULE_LESSON": "Reschedule Lesson"
                        },

                        "RESCHEDULE_LESSON_MODAL": {
                            "RESCHEDULE_LESSON": "Reschedule Lesson",
                            "RESCHEDULE_REQUEST": "Reschedule Request",
                            "NOTE": "NOTE:",
                            "RESCHEDULING_FEE_PART1": "This lesson is scheduled to be held within th next",
                            "RESCHEDULING_FEE_PART2": "rescheduling it will incur rescheduling fee.",
                            "HOURS": "48 HOURS,",
                            "HELLO": "Hello,",
                            "THANKS": "Thanks,",
                            "WE_WILL_CONTACT_YOU": "We will contact you shortly to reschedule the lesson at your convenience",
                            "CANCEL": "CANCEL",
                            "SEND": "SEND",
                            "SUCCESS_SHARED": "Successfully sent",
                            "DONE": "Done",
                            "MESSAGE": "Hello,\r\n\r\nI would like to reschedule my lesson with {{teacherName}}\r\nschedules for {{lessonDate}}\r\n\r\nThanks,\r\n{{studentName}}."
                        },

                        "UPCOMING_LESSON_TOAST":{
                            "YOUR_UPCOMING_LESSON_WITH": "Your upcoming lesson with",
                            "MY_LIVE_LESSONS_SCHEDULE": "My Live Lessons Schedule",
                            "RESCHEDULE": "Reschedule"
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').controller('RescheduleLessonController',
        ["$mdDialog", "lessonData", "studentData", "$filter", "ENV", "$translate", "MailSenderService", "MyLiveLessons", function ($mdDialog, lessonData, studentData, $filter, ENV, $translate, MailSenderService, MyLiveLessons) {
            'ngInject';

            var self = this;
            self.closeDialog = $mdDialog.cancel;

            var currentTimeStamp = new Date().getTime();
            var FORTY_EIGHT_HOURS = 172800000;
            var MAIL_TO_SEND = 'zoe@zinkerz.com';
            var TEMPLATE_KEY = 'reschedule';

            if (currentTimeStamp + FORTY_EIGHT_HOURS > lessonData.startTime) {
                self.islessonInNextFortyEightHours = true;
            }

            var localTimeZone = MyLiveLessons.getLocalTimeZone();
            var studentName = studentData.studentProfile.nickname;
            var localStartTimeLesson = $filter('date')(lessonData.startTime, 'MMMM d, h:mma') + localTimeZone;
            var emailBodyMessageVars = {
                teacherName: lessonData.educatorName,
                lessonDate: localStartTimeLesson,
                studentName: studentName
            };

            $translate('RESCHEDULE_LESSON_MODAL.MESSAGE', emailBodyMessageVars).then(function (message) {
                self.message = message;
            });

            var rescheduleRequest = '';
            $translate('RESCHEDULE_LESSON_MODAL.RESCHEDULE_REQUEST', emailBodyMessageVars).then(function (rescheduleRequestText) {
                rescheduleRequest = rescheduleRequestText;
            });

            // add to message body student email, uid and original lesson time
            var originStartTime = lessonData.originStartTime;
            var originTimeZone = MyLiveLessons.getCdtOrCst();
            var ADD_TO_MESSAGE = '\r\n\r\n' + 'email: ' + studentData.studentProfile.email + ' | ';
            ADD_TO_MESSAGE += '\r\n' + 'uid: ' + studentData.userId + ' | ';
            ADD_TO_MESSAGE += '\r\n' + 'original time: ' + originStartTime;
            ADD_TO_MESSAGE += ' ' + originTimeZone;

            self.send = function () {
                // subject format: Resquedule Request- [Student Name] | [Teacher Name] | [Lesson Time]
                var emailSubject = rescheduleRequest;
                emailSubject += ' - ' + studentName;
                emailSubject += ' | ' + lessonData.educatorName;
                emailSubject += ' | ' + localStartTimeLesson;

                var message = self.message + ADD_TO_MESSAGE;

                var dataToSend = {
                    emails: [MAIL_TO_SEND],
                    message: message,
                    subject: emailSubject,
                    appName: ENV.firebaseAppScopeName,
                    templateKey: TEMPLATE_KEY
                };

                MailSenderService.postMailRequest(dataToSend).then(function () {
                    self.requestWasSent = true;
                });
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').controller('UpcomingLessonToasterController',
        ["$mdToast", "MyLiveLessons", "closestLiveLesson", "$timeout", function ($mdToast, MyLiveLessons, closestLiveLesson, $timeout) {
        'ngInject';

            var self = this;

            $timeout(function () {
                self.animateToast = true;
            });

            self.closeToast = function () {
                $mdToast.hide();
            };

            self.closestLiveLesson = closestLiveLesson;

            self.openMyLessonsPopup = function () {
                $mdToast.hide();
                MyLiveLessons.liveLessonsScheduleModal();
            };

            self.openRescheduleModal = function (lessonObj) {
                $mdToast.hide();
                MyLiveLessons.rescheduleModal(lessonObj);
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').service('MyLiveLessons',
        ["$mdDialog", "UserProfileService", "$http", "$q", "$log", "ENV", "$filter", function ($mdDialog, UserProfileService, $http, $q, $log, ENV, $filter) {
            'ngInject';

            var self = this;
            var dataAsString;
            var teachworksIdUrl = ENV.backendEndpoint + ENV.teachworksDataUrl;
            var teachworksId;
            var userId;

            function getLiveLessonsSchedule() {
                var liveLessonsArr = [];
                return $q.all([_getTeachworksData(), UserProfileService.getCurrUserId()]).then(function (res) {
                    dataAsString = res[0];
                    userId = res[1];
                    return UserProfileService.getUserTeachWorksId(userId).then(function (teachworksIdObj) {
                        teachworksId = angular.isDefined(teachworksIdObj) ? teachworksIdObj.id : undefined;
                        // teachworksId = 'Samantha Puterman';
                        if (teachworksId && dataAsString) {
                            teachworksId = teachworksId.replace(/\s/g, '').toLowerCase();
                            var allRecordsData = dataAsString.match(/.*DTSTART(.|[\r\n])*?UID/g);
                            for (var i = 0; i < allRecordsData.length; i++) {
                                if (isTeachworksIdMatch(allRecordsData[i])) {
                                    var liveLessonObject = _buildLiveLessonObj(allRecordsData[i]);
                                    if (angular.isDefined(liveLessonObject.educatorName) && angular.isDefined(liveLessonObject.startTime)) {
                                        liveLessonsArr.push(liveLessonObject);
                                    }
                                }
                            }
                        }
                        return liveLessonsArr;
                    });
                });
            }

            function _getTeachworksData() {
                return $http({
                    method: 'GET',
                    url: teachworksIdUrl,
                    cache: true
                }).then(function successCallback(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug('myLiveLessons:' + response);
                });
            }

            self.getRelevantLiveLessons = function () {
                return getLiveLessonsSchedule().then(function (liveLessonsArr) {
                    var currentTimestamp = new Date().getTime();
                    var relevantLiveLessonsArr = [];

                    angular.forEach(liveLessonsArr, function (value) {
                        if ((angular.isDefined(value.endTime) && value.endTime > currentTimestamp) || value.startTime > currentTimestamp) {
                            relevantLiveLessonsArr.push(value);
                        }
                    });
                    return relevantLiveLessonsArr;
                });
            };

            self.getClosestLiveLesson = function () {
                return self.getRelevantLiveLessons().then(function (liveLessonsArr) {
                    var closestLiveLessonObj = {};

                    angular.forEach(liveLessonsArr, function (value) {
                        if (value.startTime < closestLiveLessonObj.startTime || angular.isUndefined(closestLiveLessonObj.startTime)) {
                            closestLiveLessonObj = value;
                        }
                    });
                    return closestLiveLessonObj;
                });
            };

            self.liveLessonsScheduleModal = function () {
                return self.getRelevantLiveLessons().then(function (liveLessonsArr) {
                    function ctrl() {
                        /*jshint validthis: true */
                        this.liveLessonsArr = liveLessonsArr;
                        this.closeDialog = $mdDialog.cancel;
                        var currDate = new Date();
                        this.currentTime = $filter('date')(currDate, 'fullDate') + ' ' + currDate.toTimeString();
                        this.openRescheduleModal = function (lessonObj) {
                            self.rescheduleModal(lessonObj);
                        };
                    }

                    return $mdDialog.show({
                        templateUrl: 'components/liveLessons/templates/myLiveLessonsModal.template.html',
                        disableParentScroll: false,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        controller: ctrl,
                        controllerAs: 'vm'
                    });
                });
            };

            self.rescheduleModal = function (lessonObj) {
                UserProfileService.getProfile().then(function (studentProfile) {
                    $mdDialog.show({
                        templateUrl: 'components/liveLessons/templates/rescheduleLessonModal.template.html',
                        disableParentScroll: false,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        controller: 'RescheduleLessonController',
                        controllerAs: 'vm',
                        locals: {
                            lessonData: lessonObj,
                            studentData: {
                                studentProfile: studentProfile,
                                userId: userId
                            }
                        }
                    });
                });
            };

            // -------------------------------------parsing data------------------------------- //

            function isTeachworksIdMatch(recordString) {
                var rawId = recordString.match(/SUMMARY.*/);
                if (rawId !== null) {
                    rawId = rawId[0].replace(/SUMMARY:|END/g, '');
                    var id = rawId.replace(/\s/g, '').toLowerCase();
                    return teachworksId === id;
                }
                return false;
            }

            function _buildLiveLessonObj(recordString) {
                var liveLessonObj = {};
                liveLessonObj.startTime = _getStartTime(recordString);
                liveLessonObj.originStartTime = _getOriginalDate(recordString);
                liveLessonObj.endTime = _getEndTime(recordString);
                liveLessonObj.educatorName = _getTeacherName(recordString);
                return liveLessonObj;
            }

            function _getStartTime(recordString) {
                var startTime = recordString.match(/DTSTART.*?\d+T\d+/);
                startTime = startTime[0].match(/\d+T\d+/);
                if (startTime !== null) {
                    return _convertDateToMilliseconds(startTime[0]);
                }
            }

            function _getOriginalDate(recordString) {
                var startTime = recordString.match(/DTSTART.*?\d+T\d+/);
                startTime = startTime[0].match(/\d+T\d+/);
                return _parseDate(startTime[0]);
            }

            function _getEndTime(recordString) {
                var endTime = recordString.match(/DTEND.*?\d+T\d+/);
                endTime = endTime !== null ? endTime[0].match(/\d+T\d+/)[0] : undefined;
                return endTime;
            }

            function _getTeacherName(recordString) {
                var teacherName = recordString.match(/DESCRIPTION:Employee.*/);
                if (teacherName !== null && teacherName[0]) {
                    teacherName = teacherName[0].match(/-.*/);
                    teacherName = teacherName[0].replace(/-/g, '');
                    teacherName = teacherName.match(/\w+\s*\w+/, '');
                    return teacherName !== null ? teacherName[0] : null;
                }
            }

            function _convertDateToMilliseconds(startTimeString) {
                var timeZone = self.getCdtOrCst();
                var originalDate = _parseDate(startTimeString) + ' ' + timeZone;
                var localFullDate = new Date(originalDate).toString();  // convert CST/CDT timezone to local timezone.
                return new Date(localFullDate).getTime();
            }

            function _parseDate(startTimeString) { // convert 20160720T160030 to 07/20/2016 16:00:30 and return as milliseconds.
                var YEAR = 4, MONTH = 6, DAY = 8, T = 9, HOUR = 11, MINUTE = 13, SECOND = 15;
                var day = startTimeString.slice(MONTH, DAY),
                    month = startTimeString.slice(YEAR, MONTH),
                    year = startTimeString.slice(0, YEAR),
                    hour = startTimeString.slice(T, HOUR),
                    minute = startTimeString.slice(HOUR, MINUTE),
                    second = startTimeString.slice(MINUTE, SECOND);

                var originalDate = month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ':' + second;
                return originalDate;
            }

            self.getCdtOrCst = function () {
                var today = new Date();
                var date = $filter('date')(today, 'medium', 'CST'); // calculate by cst time zone.
                var yr = new Date(date).getFullYear();

                var cdtStart = new Date('March 13, ' + yr + ' 02:00:00'); // 2nd Sunday in March can't occur after the 14th
                var cdtEnd = new Date('November 07, ' + yr + ' 02:00:00'); // 1st Sunday in November can't occur after the 7th

                var day;
                day = cdtStart.getDay(); // day of week of 14th
                cdtStart.setDate(14 - day); // Calculate 2nd Sunday in March of this year
                day = cdtEnd.getDay(); // day of the week of 7th
                cdtEnd.setDate(7 - day); // Calculate first Sunday in November of this year
                if (today.getTime() >= cdtStart.getTime() && today.getTime() < cdtEnd.getTime()) {
                    return 'CDT';
                }
                return 'CST';
            };

            self.getLocalTimeZone = function () {
                var date = new Date();
                var localTimeString = date.toTimeString();
                var localTimeZone = localTimeString.replace(/([^\s]+)/, '');
                if (angular.isUndefined(date) || date === null) {
                    return '';
                }
                return localTimeZone;
            };

            // -------------------------------------parsing data------------------------------- //
        }]
    );
})(angular);

angular.module('znk.infra-web-app.liveLessons').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/liveLessons/svg/calendar-icon.svg",
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" class=\"calendar-icon\"\n" +
    "     viewBox=\"0 0 176.3 200\">\n" +
    "    <style>\n" +
    "        .calendar-icon{\n" +
    "        enable-background:new 0 0 176.3 200;\n" +
    "        width:35px;\n" +
    "        height: auto;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g id=\"XMLID_40_\">\n" +
    "        <path id=\"XMLID_138_\" d=\"M164.1,200c-50.7,0-101.3,0-152,0C3.1,196-0.1,189.1,0,179.3c0.3-36.5,0.1-73,0.1-109.5c0-1.9,0-3.8,0-5.6\n" +
    "		c59,0,117.3,0,176,0c0,2,0,3.8,0,5.6c0,36.5-0.2,73,0.1,109.5C176.4,189.1,173.2,196,164.1,200z M163.9,156.3\n" +
    "		c-10.8,0-21.1,0-31.4,0c0,10.7,0,21.1,0,31.4c10.6,0,20.9,0,31.4,0C163.9,177.2,163.9,166.9,163.9,156.3z M123.9,156.2\n" +
    "		c-10.8,0-21.1,0-31.5,0c0,10.6,0,21,0,31.4c10.7,0,21.1,0,31.5,0C123.9,177,123.9,166.7,123.9,156.2z M52.4,187.7\n" +
    "		c10.8,0,21.1,0,31.5,0c0-10.6,0-21,0-31.4c-10.7,0-21.1,0-31.5,0C52.4,166.9,52.4,177.2,52.4,187.7z M12.5,156.2\n" +
    "		c0,10.7,0,21.1,0,31.4c10.7,0,21.1,0,31.4,0c0-10.6,0-20.9,0-31.4C33.4,156.2,23.1,156.2,12.5,156.2z M163.8,147.7\n" +
    "		c0-10.8,0-21.1,0-31.4c-10.7,0-21.1,0-31.4,0c0,10.7,0,20.9,0,31.4C142.9,147.7,153.2,147.7,163.8,147.7z M123.9,147.7\n" +
    "		c0-10.8,0-21.1,0-31.5c-10.6,0-21,0-31.4,0c0,10.7,0,21.1,0,31.5C103.1,147.7,113.4,147.7,123.9,147.7z M52.4,147.6\n" +
    "		c10.8,0,21.2,0,31.4,0c0-10.7,0-21.1,0-31.4c-10.7,0-20.9,0-31.4,0C52.4,126.7,52.4,137,52.4,147.6z M43.9,116.3\n" +
    "		c-10.7,0-21.1,0-31.4,0c0,10.7,0,21.1,0,31.4c10.6,0,20.9,0,31.4,0C43.9,137.2,43.9,127,43.9,116.3z M132.5,76.1\n" +
    "		c0,10.9,0,21.3,0,31.5c10.7,0,20.9,0,31.3,0c0-10.6,0-21,0-31.5C153.3,76.1,143,76.1,132.5,76.1z M92.5,76.2c0,10.8,0,21.1,0,31.4\n" +
    "		c10.7,0,21.1,0,31.4,0c0-10.7,0-20.9,0-31.4C113.4,76.2,103.1,76.2,92.5,76.2z M83.9,76.3c-10.8,0-21.1,0-31.4,0\n" +
    "		c0,10.7,0,21.1,0,31.4c10.6,0,20.9,0,31.4,0C83.9,97.2,83.9,86.9,83.9,76.3z M43.9,76.3c-10.8,0-21.2,0-31.4,0\n" +
    "		c0,10.7,0,21.1,0,31.4c10.7,0,20.9,0,31.4,0C43.9,97.1,43.9,86.9,43.9,76.3z\"/>\n" +
    "        <path id=\"XMLID_119_\" d=\"M176.1,55.8c-58.9,0-117.1,0-175.7,0c0-6.4-0.6-12.7,0.2-18.9c1-7.6,7.6-12.7,15.5-12.9\n" +
    "		c4.3-0.1,8.7,0,13,0c4.1,0,8.3,0,13,0c0-5.8-0.1-11.2,0-16.6c0.1-4.7,2.5-7.7,6.2-7.3c4.3,0.4,5.8,3.2,5.8,7.3\n" +
    "		c-0.1,5.3,0,10.6,0,16.3c22.6,0,45,0,68,0c0-5.4,0.1-10.8,0-16.3c-0.1-4.1,1.4-6.9,5.8-7.3c3.7-0.4,6.2,2.6,6.2,7.3\n" +
    "		c0.1,5.3,0,10.6,0,16.6c7.8,0,15.4,0,23,0c12.9,0,19,6.1,19,18.9C176.1,47,176.1,51.1,176.1,55.8z M122.2,29.9\n" +
    "		c-5.7,4.3-7.2,9.1-5.1,14.4c2,5.2,7.3,8.3,12.7,7.6c5.2-0.7,9.5-4.9,10.3-10.1c0.8-4.9-1.5-9.2-5.9-11.2c0,3.1,0.1,6.1,0,9\n" +
    "		c-0.1,3.7-2.1,6.1-5.8,6.2c-4,0.1-6-2.4-6.1-6.3C122.1,36.6,122.2,33.6,122.2,29.9z M42.2,29.9c-5.7,4.3-7.2,9-5.2,14.3\n" +
    "		c2,5.2,7.2,8.3,12.7,7.6c5.2-0.7,9.5-4.9,10.4-10.1c0.8-4.8-1.4-9.2-5.9-11.2c0,3.3,0.2,6.4,0,9.5c-0.2,3.4-2.3,5.6-5.7,5.7\n" +
    "		c-3.7,0.1-5.9-2.1-6.1-5.8C42,36.9,42.2,33.8,42.2,29.9z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveLessons/svg/close-popup.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\" class=\"close-popup\">\n" +
    "    <style>\n" +
    "        .close-popup{\n" +
    "        width:15px;\n" +
    "        height:15px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveLessons/svg/reschedule-icon.svg",
    "<svg version=\"1.1\" id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 172 188\"\n" +
    "     style=\"enable-background:new 0 0 172 188;\"\n" +
    "     class=\"reschedule-icon\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "    svg.reschedule-icon{\n" +
    "        width:12px;\n" +
    "    	.st0{fill:none;stroke:#000000;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    }\n" +
    "</style>\n" +
    "<path id=\"XMLID_65_\" d=\"M12,63.7c49.6,0,98.6,0,147.9,0c0-9,0.3-17.8-0.1-26.6c-0.2-5.4-4.5-8.8-10.1-9.2c-2.8-0.2-6,0.7-8.4-0.3\n" +
    "	c-2.2-0.9-4.7-3.5-5-5.6c-0.2-1.8,2.4-5.5,4-5.7c6.7-0.7,13.7-1.5,20,2.1c7.3,4.2,11.6,10.5,11.6,19.1c0.1,42.8,0.1,85.6,0,128.5\n" +
    "	c0,12.3-9.6,21.8-21.9,21.8c-42.7,0.1-85.3,0.1-128,0c-12.5,0-22-9.6-22-22.2c0-42.5,0-85,0-127.5c0-12.6,9.5-22.1,22-22.2\n" +
    "	c2.5,0,5,0,7.5,0c4,0.1,6.4,2.1,6.4,6.1c-0.1,4-2.6,5.9-6.6,5.9c-2.5,0-5-0.1-7.5,0.1c-5.6,0.5-9.5,4-9.7,9.5\n" +
    "	C11.8,46.2,12,54.8,12,63.7z M12,76.2c0,29.4,0,58.2,0,87c0,9.4,3.5,12.8,13.1,12.8c40.7,0,81.3,0,122,0c9.5,0,13-3.5,13-13\n" +
    "	c0-27.3,0-54.6,0-82c0-1.6-0.1-3.2-0.2-4.9C110.4,76.2,61.5,76.2,12,76.2z\"/>\n" +
    "<path id=\"XMLID_58_\" d=\"M86,27.9c-7.7,0-15.3,0-23,0c-4.7,0-7.6-2.5-7.3-6.2c0.4-4.3,3.1-5.8,7.2-5.8C78.3,16,93.6,16,109,16\n" +
    "	c4.1,0,6.9,1.7,6.9,6c0,4.3-2.8,6-6.9,6C101.3,27.9,93.7,27.9,86,27.9z\"/>\n" +
    "<path id=\"XMLID_4_\" d=\"M46.7,58.8C38,58.8,31,51.8,31,43.1S38,27.3,46.7,27.3s15.8,7.1,15.8,15.8S55.4,58.8,46.7,58.8z M46.7,34.3\n" +
    "	c-4.8,0-8.8,3.9-8.8,8.8s3.9,8.8,8.8,8.8s8.8-3.9,8.8-8.8S51.6,34.3,46.7,34.3z\"/>\n" +
    "<path id=\"XMLID_5_\" d=\"M46.7,34.3c-1.9,0-3.5-1.6-3.5-3.5V4.4c0-1.9,1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5v26.4\n" +
    "	C50.2,32.8,48.7,34.3,46.7,34.3z\"/>\n" +
    "<path id=\"XMLID_6_\" d=\"M127.2,57.9c-8.7,0-15.8-7.1-15.8-15.8s7.1-15.8,15.8-15.8s15.7,7.1,15.7,15.8S135.8,57.9,127.2,57.9z\n" +
    "	 M127.2,33.4c-4.8,0-8.8,3.9-8.8,8.8s3.9,8.8,8.8,8.8c4.8,0,8.7-3.9,8.7-8.8S132,33.4,127.2,33.4z\"/>\n" +
    "<path id=\"XMLID_7_\" d=\"M127.2,33.4c-1.9,0-3.5-1.6-3.5-3.5V3.5c0-1.9,1.6-3.5,3.5-3.5c1.9,0,3.5,1.6,3.5,3.5v26.4\n" +
    "	C130.7,31.8,129.1,33.4,127.2,33.4z\"/>\n" +
    "<path id=\"XMLID_26_\" d=\"M56.4,130.4c-1.9,0-3.5-1.5-3.5-3.4c0-1.5,0.1-3,0.2-4.6c2.2-18.5,19-31.7,37.5-29.5\n" +
    "	c13.3,1.6,24.4,10.9,28.3,23.7c0.6,1.8-0.5,3.8-2.3,4.4c-1.8,0.6-3.8-0.5-4.4-2.3c-3.1-10.2-11.9-17.5-22.5-18.8\n" +
    "	c-14.7-1.7-28,8.8-29.7,23.4c-0.1,1.2-0.2,2.4-0.2,3.6C59.9,128.7,58.4,130.3,56.4,130.4C56.4,130.4,56.4,130.4,56.4,130.4z\"/>\n" +
    "<polygon id=\"XMLID_13_\" points=\"122.2,106.1 118.8,121.6 118.7,122.9 102.7,115.2 \"/>\n" +
    "<path id=\"XMLID_27_\" d=\"M89.1,163c-13.6,0-25.8-8.1-31.1-20.6c-0.8-1.8,0.1-3.8,1.9-4.6c1.8-0.8,3.8,0.1,4.6,1.9\n" +
    "	c4.2,9.9,13.9,16.3,24.7,16.3c13.9,0,25.3-10.4,26.6-24.2c0.2-1.9,1.9-3.3,3.8-3.2c1.9,0.2,3.3,1.9,3.2,3.8\n" +
    "	C121,149.8,106.6,163,89.1,163z\"/>\n" +
    "<polygon id=\"XMLID_3_\" points=\"54.6,150.1 55.4,134.9 55.4,133.5 72.2,139.3 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveLessons/templates/myLiveLessonsModal.template.html",
    "<md-dialog ng-cloak class=\"my-lessons-schedule-wrapper base\" translate-namespace=\"MY_LIVE_LESSONS_POPUP\">\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"calendar-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"close-popup-wrap\">\n" +
    "        <svg-icon name=\"close-popup\" ng-click=\"vm.closeDialog()\"></svg-icon>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-dialog-content>\n" +
    "        <div class=\"md-dialog-content\">\n" +
    "            <div class=\"live-lessons-title\" translate=\".LIVE_LESSONS_SCHEDULE\"></div>\n" +
    "            <div class=\"upcoming-lesson-title\" translate=\".UPCOMING_LESSON\"></div>\n" +
    "\n" +
    "            <div class=\"live-lessons-wrapper znk-scrollbar\">\n" +
    "                <div class=\"live-lesson-repeater\" ng-repeat=\"lesson in vm.liveLessonsArr | orderBy: 'startTime'\">\n" +
    "                    <div class=\"live-lesson\" >\n" +
    "                        <div class=\"date\">{{lesson.startTime | date:'d MMM' | uppercase}}</div>\n" +
    "                        <div class=\"hour\">{{lesson.startTime | date:'h:mm a'}}</div>\n" +
    "                        <div class=\"educator-name\">{{lesson.educatorName}}</div>\n" +
    "                    </div>\n" +
    "                    <div class=\"reschedule-wrapper\">\n" +
    "                        <md-tooltip md-direction=\"top\" class=\"reschedule-tooltip\">\n" +
    "                            <div translate=\".RESCHEDULE_LESSON\"></div>\n" +
    "                        </md-tooltip>\n" +
    "                        <svg-icon name=\"reschedule-icon\" ng-click=\"vm.openRescheduleModal(lesson)\"></svg-icon>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"no-live-lessons-text\" translate=\".NO_LIVE_LESSONS\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"current-time\" translate=\".CURRENT_TIME\"\n" +
    "                 translate-values=\"{ currentTime: {{'vm.currentTime'}} }\"></div>\n" +
    "            <div class=\"btn-wrapper\">\n" +
    "                <md-button class=\"ok-button success drop-shadow\" ng-click=\"vm.closeDialog()\">\n" +
    "                    <span translate=\".OK\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/liveLessons/templates/rescheduleLessonModal.template.html",
    "<md-dialog ng-cloak class=\"my-lessons-schedule-wrapper base\" translate-namespace=\"RESCHEDULE_LESSON_MODAL\">\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"reschedule-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"close-popup-wrap\">\n" +
    "        <svg-icon name=\"close-popup\" ng-click=\"vm.closeDialog()\"></svg-icon>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-dialog-content>\n" +
    "        <div ng-switch=\"!!vm.requestWasSent\">\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div class=\"reschedule-lesson-title\" translate=\".RESCHEDULE_LESSON\"></div>\n" +
    "\n" +
    "                <div class=\"email-container\" ng-switch-when=\"false\">\n" +
    "                    <div class=\"note-wrapper\" ng-if=\"vm.islessonInNextFortyEightHours\">\n" +
    "                        <span class=\"red-color-text\" translate=\".NOTE\"></span>\n" +
    "                        <span class=\"warning-text\" translate=\".RESCHEDULING_FEE_PART1\"></span>\n" +
    "                        <span class=\"red-color-text\" translate=\".HOURS\"></span>\n" +
    "                        <div class=\"warning-text\" translate=\".RESCHEDULING_FEE_PART2\"></div>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <textarea class=\"reschedule-container\"\n" +
    "                              required\n" +
    "                              ng-model=\"vm.message\"\n" +
    "                              md-select-on-focus>\n" +
    "                </textarea>\n" +
    "                    <div class=\"bottom-lesson\" translate=\".WE_WILL_CONTACT_YOU\"></div>\n" +
    "                    <div class=\"buttons-wrapper\">\n" +
    "                        <md-button\n" +
    "                            class=\"md-button cancel-btn\"\n" +
    "                            translate=\".CANCEL\"\n" +
    "                            ng-click=\"vm.closeDialog()\">\n" +
    "\n" +
    "                        </md-button>\n" +
    "                        <md-button\n" +
    "                            class=\"md-button send-btn\"\n" +
    "                            translate=\".SEND\"\n" +
    "                            ng-click=\"vm.send()\">\n" +
    "                        </md-button>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "                    <svg-icon class=\"completed-v-icon-wrap\" name=\"completed-v-icon\"></svg-icon>\n" +
    "                    <div translate=\".SUCCESS_SHARED\"></div>\n" +
    "                    <div class=\"done-btn-wrap\">\n" +
    "                        <md-button class=\"success lg drop-shadow\"\n" +
    "                                   ng-click=\"vm.closeDialog()\">\n" +
    "                            <span translate=\".DONE\"></span>\n" +
    "                        </md-button>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/liveLessons/templates/upcomingLessonToast.template.html",
    "<div class=\"upcoming-lesson-toast-wrapper base-border-radius\" translate-namespace=\"UPCOMING_LESSON_TOAST\"\n" +
    "     ng-class=\"{'animate-toast': vm.animateToast}\">\n" +
    "    <svg-icon name=\"close-popup\" ng-click=\"vm.closeToast()\"></svg-icon>\n" +
    "\n" +
    "    <div class=\"left-side-container\" ng-click=\"vm.openMyLessonsPopup()\">\n" +
    "        <svg-icon name=\"calendar-icon\"></svg-icon>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"right-side-container\" >\n" +
    "        <div class=\"closest-lesson-details\" ng-click=\"vm.openMyLessonsPopup()\">\n" +
    "            <div class=\"top-title\" translate=\".YOUR_UPCOMING_LESSON_WITH\"></div>\n" +
    "            <div class=\"teacher-name\">{{vm.closestLiveLesson.educatorName}}</div>\n" +
    "            <div class=\"lesson-date\">{{vm.closestLiveLesson.startTime | date: 'EEEE, MMMM d'}}</div>\n" +
    "            <div class=\"lesson-hour\">{{vm.closestLiveLesson.startTime | date:'h:mm a'}}</div>\n" +
    "        </div>\n" +
    "        <div class=\"bottom-container\">\n" +
    "            <div class=\"bottom-clickable-text\" translate=\".MY_LIVE_LESSONS_SCHEDULE\" ng-click=\"vm.openMyLessonsPopup()\"></div>\n" +
    "            <div class=\"reschedule-wrapper\" ng-click=\"vm.openRescheduleModal(vm.closestLiveLesson)\">\n" +
    "                <svg-icon name=\"reschedule-icon\"></svg-icon>\n" +
    "                <div class=\"reschedule-text\" translate=\".RESCHEDULE\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp', [
        'pascalprecht.translate',
        'znk.infra.auth',
        'znk.infra.svgIcon',
        'ngMaterial',
        'satellizer',
        'znk.infra.general',
        'znk.infra.autofocus',
        'znk.infra-web-app.promoCode'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'form-envelope': 'components/loginApp/svg/form-envelope.svg',
                'form-lock': 'components/loginApp/svg/form-lock.svg',
                'facebook-icon': 'components/loginApp/svg/facebook-icon.svg',
                'google-icon': 'components/loginApp/svg/google-icon.svg',
                'login-username-icon': 'components/loginApp/svg/login-username-icon.svg',
                'dropdown-arrow': 'components/loginApp/svg/dropdown-arrow.svg',
                'v-icon': 'components/loginApp/svg/v-icon.svg',
                'loginApp-arrow-icon': 'components/loginApp/svg/arrow-icon.svg',
                'loginApp-close-icon': 'components/loginApp/svg/close-icon.svg',
                'loginApp-correct-icon': 'components/loginApp/svg/correct-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ])
        .run(["$location", "InvitationKeyService", function ($location, InvitationKeyService) {
            var search = $location.search();
            var iid = search.iid;
            if (angular.isDefined(iid) && iid !== null) {
                InvitationKeyService.saveInvitationKey(iid);
            }
            //     var authObj = AuthService.getAuth();
            //     if (authObj) {
            //         InvitationStorageSrv.getInvitationObject(iid).then(function (res) {
            //             var invitation = res;
            //             if (angular.equals(invitation, {})) {
            //                 $log.error('Invitation object is empty');
            //                 return;
            //             }
            //             var receiverEmail = invitation.receiverEmail;
            //             if (receiverEmail === authObj.auth.token.email.toLowerCase()) {
            //                 redirectToApp();
            //             } else {
            //                 logout();
            //             }
            //         });
            //     }
            // }
            // function redirectToApp() {
            //     InvitationKeyService.navigateWithInvitationKey();
            // }
            //
            // function logout() {
            //     AuthService.logout();
            // }
        }]);
})(window, angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "LOGIN_APP": {
                            "SAT_STUDENT_TAGLINE": "Welcome!<br/>Start prepping for the SAT® test with Zinkerz!",
                            "ACT_STUDENT_TAGLINE": "Welcome!<br/>Start prepping for the ACT® test with Zinkerz!",
                            "TOEFL_STUDENT_TAGLINE": "Welcome!<br/>Start prepping for the TOEFL® test with Zinkerz!",
                            "SAT_EDUCATOR_TAGLINE": "Welcome to the all-in-one<br/>SAT® desktop app for educators.",
                            "ACT_EDUCATOR_TAGLINE": "Welcome to the all-in-one<br/>ACT® desktop app for educators.",
                            "TOEFL_EDUCATOR_TAGLINE": "Welcome to the all-in-one<br/>TOEFL® desktop app for educators.",
                            "SIGN_UP_FOR_ZINKERZ_TEST_PREP": "Sign Up for Zinkerz Test Prep",
                            "CHECK_OUT_ZINKERZ_TOOLS_FOR_TEACHERS": "Check out Zinkerz tools for teachers",
                            "ARE_YOU_AN_EDUCATOR": "Are you an educator?",
                            "CHECK_OUT_OUR_APP_FOR_STUDENTS": "Check out our App for Students",
                            "FOR_EDUCATORS": "For Educators",
                            "EDUCATORS_CLICK_HERE": "Educators Click Here",
                            "SIGNUP_OR_LOGIN": "Please Sign Up or Log In to",
                            "ACCEPT_INVITATION": "Accept The Invitation",
                            "FORM_VALIDATION": {
                                "FIELD_IS_EMPTY": "Required field is empty",
                                "PASSWORD_TOO_SHORT": "Password is too short, must be between 6-25 characters",
                                "PASSWORD_TOO_LONG": "Password is too long, must be between 6-25 characters",
                                "EMAIL_TAKEN": "Email is already taken, please choose another"
                            }
                        },
                        "CHANGE_PASSOWRD_FORM": {
                            "BACK_TO_LOGIN": "Back to Login",
                            "RESET_PASSWORD": "Reset Password",
                            "SEND": "Send",
                            "NEW_PASSWORD_SENT": "A new password has been sent to your email address.",
                            "DONE": "Done",
                            "NO_SUCH_EMAIL": "We don’t recognize that email. Did you use another one to sign up?"
                        },
                        "LOGIN_FORM": {
                            "LOGIN": "Login",
                            "LOGIN_IN": "Log In",
                            "FORGOT_PWD": "Forgot password?",
                            "OR": "or",
                            "EMAIL": "Email",
                            "PASSWORD": "Password",
                            "STUDENT": {
                                "DONT_HAVE_AN_ACCOUNT": "Don't have a Zinkerz student account?",
                                "LOGIN": "Student Login"
                            },
                            "EDUCATOR": {
                                "DONT_HAVE_AN_ACCOUNT": "Don't have a Zinkerz educator account?",
                                "LOGIN": "Educator Login"
                            },
                            "ERROR_CODES": {
                                "INVALID_EMAIL": "The specified email is invalid.",
                                "INVALID_PASSWORD": "The specified password is incorrect.",
                                "INVALID_USER": "The specified user account does not exist.",
                                "DEFAULT_ERROR": "Error logging user in: "
                            }
                        },
                        "SIGNUP_FORM": {
                            "SIGNUP": "Signup",
                            "SIGN_UP": "Sign Up",
                            "OR": "or",
                            "NAME": "Name",
                            "EMAIL": "Email",
                            "PASSWORD": "Password",
                            "DISCLAIMER": "By signing up I agree to the <a href='{{termsOfUseHref}}' class='app-color'>Terms of Use</a> and <a href='{{privacyPolicyHref}}' class='app-color'>Privacy Policy</a>",
                            "STUDENT": {
                                "CREATE_ACCOUNT": "Create a Student Account",
                                "ALREADY_HAVE_ACCOUNT": "Already have a Zinkerz student account?"
                            },
                            "EDUCATOR": {
                                "CREATE_ACCOUNT": "Create an Educator Account",
                                "ALREADY_HAVE_ACCOUNT": "Already have a Zinkerz educator account?"
                            }
                        },
                        "OATH_SOCIAL": {
                            "CONNECT_WITH_FB": "Facebook",
                            "CONNECT_WITH_GOOGLE": "Google",
                            "ERROR_TITLE": "Connect With {{provider}} Failed",
                            "ERROR_CONTENT": "An error occurred while trying to connect with {{provider}}, please try again. If the problem persists please contact us at <a href='//www.zinkerz.com/contact/' target='_blank'>support@zinkerz.com</a>"
                        },
                        "PROMO_CODE":{
                            "GOT_A_PROMO_CODE":"Got a Promo Code?",
                            "GOT_A_ZINKERZ_EDUCATORS_PROMO_CODE": "Got a Zinkerz Educator Code?",
                            "ENTER_YOUR_CODE": "Enter your code...",
                            "ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED": "Zinkerz Educators Code Accepted",
                            "PROMO_CODE_ACCEPTED": "Promo code accepted",
                            "INVALID_CODE": "Invalid code, please contact support@zinkerz.com"
                        }
                    }
                );
            }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('resetPasswordForm',
        ["LoginAppSrv", "$timeout", function (LoginAppSrv, $timeout) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/resetPasswordForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<',
                    backToLogin: '&'
                },
                link: function (scope) {
                    scope.resetPasswordSucceeded = false;
                    scope.showSpinner = false;
                    scope.passwordSubmit = function (changePasswordForm) {
                        changePasswordForm.email.$setValidity("noSuchEmail", true);
                        scope.showSpinner = true;
                        if (changePasswordForm.$invalid) {
                            scope.showSpinner = false;
                            return;
                        }
                        LoginAppSrv.resetPassword(scope.appContext.id, changePasswordForm.email.$viewValue, scope.userContext).then(function (resetPasswordSate) {
                            $timeout(function () {
                                if (angular.isUndefined(resetPasswordSate)) {
                                    scope.showSpinner = false;
                                    scope.resetPasswordSucceeded = true;
                                } else {
                                    if (resetPasswordSate.code === 'INVALID_USER') {
                                        scope.showSpinner = false;
                                        scope.resetPasswordSucceeded = false;
                                        changePasswordForm.email.$setValidity("noSuchEmail", false);
                                    }
                                }
                            });
                        });
                    };
                }
            };
        }]
    );
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginApp',
        ["LoginAppSrv", "$location", "$timeout", "$document", "InvitationKeyService", function (LoginAppSrv, $location, $timeout, $document, InvitationKeyService) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/loginApp.directive.html',
                restrict: 'E',
                link: function (scope) {

                    scope.d = {
                        availableApps: LoginAppSrv.APPS,
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        userContext: LoginAppSrv.USER_CONTEXT.STUDENT,
                        changePassword: false
                    };

                    var socialProvidersArr = ['facebook', 'google'];
                    var invitationKey = InvitationKeyService.getInvitationKey();

                    LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);

                    scope.currentUserContext = 'student';
                    scope.currentForm = 'signup';


                    scope.selectApp = function (app) {
                        scope.d.appContext = app;
                        LoginAppSrv.setSocialProvidersConfig(socialProvidersArr, scope.d.appContext.id);
                    };

                    scope.changeCurrentForm = function (currentForm) {
                        scope.currentForm = currentForm;
                    };

                    scope.changeUserContext = function (context) {
                        scope.d.userContext = context;
                        if (scope.d.userContext === LoginAppSrv.USER_CONTEXT.STUDENT) {
                            scope.currentUserContext = 'student';
                        } else if (scope.d.userContext === LoginAppSrv.USER_CONTEXT.TEACHER) {
                            scope.currentUserContext = 'teacher';
                        }
                    };

                    // App select menu
                    var originatorEv;
                    scope.openMenu = function ($mdOpenMenu, ev) {
                        originatorEv = ev;
                        $mdOpenMenu(ev);
                    };

                    scope.changePasswordClick = function () {
                        scope.changeCurrentForm('changePassword');
                        scope.d.changePassword = !scope.d.changePassword;
                    };

                    var search = $location.search();
                    if (!!((!angular.equals(search, {}) || invitationKey) && (search.app || search.state || search.userType || invitationKey))) {
                        if (search.app) {
                            angular.forEach(LoginAppSrv.APPS, function (app, index) {
                                if (index.toLowerCase() === search.app.toLowerCase()) {
                                    scope.selectApp(app);
                                }
                            });
                        }

                        if (invitationKey && invitationKey !== null) {
                            scope.d.invitationId = invitationKey;
                        }

                        if (search.userType) {
                            if (search.userType === 'educator') {
                                scope.changeUserContext(scope.d.userContextObj.TEACHER);
                            } else {
                                scope.changeUserContext(scope.d.userContextObj.STUDENT);
                            }
                        }

                        if (search.state) {
                            scope.changeCurrentForm(search.state);
                        }

                    }

                    //catching $mdMenuOpen event emitted from angular-material.js
                    scope.$on('$mdMenuOpen', function () {
                        $timeout(function () {
                            //getting menu content container by tag id from html
                            var menuContentContainer = angular.element($document[0].getElementById('app-select-menu'));
                            // Using parent() method to get parent warper with .md-open-menu-container class and adding custom class.
                            menuContentContainer.parent().addClass('app-select-menu-open');
                        });
                    });
                }
            };
        }]
    );
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('loginForm',
        ["LoginAppSrv", "$timeout", "$translate", "$log", function (LoginAppSrv, $timeout, $translate, $log) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/loginForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<',
                    changePasswordClick: '&'
                },
                link: function (scope) {

                    scope.d = {
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        changePassword: false
                    };

                    scope.loginSubmit = function(loginForm) {
                        if (loginForm.$invalid) {
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.login(scope.appContext.id, scope.userContext, scope.d.loginFormData)
                            .then(function(authData){
                                $log.debug("Authenticated successfully with payload: ", authData);
                            })
                            .catch(function(err){
                                $log.error(err);
                                if (err) {
                                    var errorCodeStrings;
                                    var errorCodesPath = 'LOGIN_FORM.ERROR_CODES.';
                                    var errorCodesStringKeysArr = [
                                        errorCodesPath + 'INVALID_EMAIL',
                                        errorCodesPath + 'INVALID_PASSWORD',
                                        errorCodesPath + 'INVALID_USER',
                                        errorCodesPath + 'DEFAULT_ERROR'
                                    ];
                                    $translate(errorCodesStringKeysArr)
                                        .then(function(tranlations){
                                            var loginError;
                                            errorCodeStrings = tranlations;
                                            switch (err.code) {
                                                case "INVALID_EMAIL":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_EMAIL'];
                                                    break;
                                                case "INVALID_PASSWORD":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_PASSWORD'];
                                                    break;
                                                case "INVALID_USER":
                                                    loginError = errorCodeStrings[errorCodesPath + 'INVALID_USER'];
                                                    break;
                                                default:
                                                    loginError = errorCodeStrings[errorCodesPath + 'DEFAULT_ERROR'] + err.code;
                                            }
                                            $timeout(function(){
                                                hideSpinner();
                                                scope.d.disableBtn = false;
                                                scope.d.loginError = loginError;
                                            });
                                        })
                                        .catch(function(err){
                                            $log.error('Cannot fetch translation! ', err);
                                        });
                                }
                            });
                    };

                    scope.replaceToChangePassword = function () {
                        scope.d.changePassword = !scope.d.changePassword;
                    };

                    function showSpinner() {
                        scope.d.showSpinner = true;
                    }

                    function hideSpinner() {
                        scope.d.showSpinner = false;
                    }
                }
            };
        }]
    );
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('signupForm',
        ["LoginAppSrv", "$log", "$timeout", function (LoginAppSrv, $log, $timeout) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/signupForm.directive.html',
                restrict: 'E',
                scope: {
                    appContext: '<',
                    userContext: '<'
                },
                link: function (scope) {

                    scope.d = {
                        appContext: LoginAppSrv.APPS.SAT,
                        userContextObj: LoginAppSrv.USER_CONTEXT,
                        termsOfUseHref: '//www.zinkerz.com/terms-of-use/',
                        privacyPolicyHref: '//www.zinkerz.com/privacy-policy/'
                    };

                    scope.signupSubmit = function (signupForm) {
                        signupForm.email.$setValidity("emailTaken", true);
                        if (signupForm.$invalid) {
                            return;
                        }
                        showSpinner();
                        scope.d.disableBtn = true;
                        LoginAppSrv.signup(scope.appContext.id, scope.userContext, scope.d.signupFormData)
                            .then(function () {
                                hideSpinner();
                                scope.d.disableBtn = false;
                            })
                            .catch(function (err) {
                                $timeout(function () {
                                    if (err.code === 'EMAIL_TAKEN') {
                                        console.log(signupForm.email);
                                        signupForm.email.$setValidity("emailTaken", false);
                                    }
                                });
                                hideSpinner();
                                scope.d.disableBtn = false;
                                $log.error(err);
                            });
                    };

                    function showSpinner() {
                        scope.d.showSpinner = true;
                    }

                    function hideSpinner() {
                        scope.d.showSpinner = false;
                    }
                }
            };
        }]
    );
})(angular);


/* jshint ignore:start */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').controller('OathLoginDrvController',
        ["LoginAppSrv", "$window", "$log", "$auth", function(LoginAppSrv, $window, $log, $auth) {
            'ngInject';

            var vm = this;

            this.socialAuth = function (provider) {
                vm.loading = {};
                var loadingProvider = vm.loading[provider] = {};
                loadingProvider.showSpinner = true;
                $auth.authenticate(provider).then(function (response) {
                    return LoginAppSrv.userDataForAuthAndDataFb(response.data, vm.appContext.id, vm.userContext);
                }).then(function (results) {
                    var userDataAuth = results[0].auth;

                    LoginAppSrv.getUserProfile(vm.appContext.id, vm.userContext).then(function (userProfile) {
                        var updateProfile = false;

                        if (!userProfile.email && userDataAuth.email) {
                            userProfile.email = userDataAuth.email;
                            updateProfile = true;
                        }
                        if (!userProfile.nickname && (userDataAuth.nickname || userDataAuth.name)) {
                            userProfile.nickname = userDataAuth.nickname || userDataAuth.name;
                            updateProfile = true;
                        }
                        if (!userProfile.provider) {
                            userProfile.provider = provider;
                            updateProfile = true;
                        }

                        LoginAppSrv.addFirstRegistrationRecord(vm.appContext.id, vm.userContext);


                        loadingProvider.showSpinner = false;

                        if (updateProfile) {
                            LoginAppSrv.writeUserProfile(userProfile, vm.appContext.id, vm.userContext, true).then(function () {
                                LoginAppSrv.redirectToPage(vm.appContext.id, vm.userContext);
                            });
                        } else {
                            LoginAppSrv.redirectToPage(vm.appContext.id, vm.userContext);
                        }
                    });
                }).catch(function (error) {
                    $log.error('OathLoginDrvController socialAuth', error);
                    loadingProvider.showSpinner = false;
                });
            };

        }]);
})(angular);
/* jshint ignore:end */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').directive('oathLoginDrv', function() {
        'ngInject';
        return {
            scope: {
                providers: '=',
                appContext: '<',
                userContext: '<'
            },
            restrict: 'E',
            templateUrl: 'components/loginApp/oathLogin/oathLogin.template.html',
            controller: 'OathLoginDrvController',
            bindToController: true,
            controllerAs: 'vm'
        };
    });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.loginApp').service('InvitationKeyService',
        function () {
            'ngInject';
            var invitationKey;

            this.saveInvitationKey = function (_invitationKey) {
                invitationKey = _invitationKey;
            };

            this.getInvitationKey = function () {
                return invitationKey;
            };

          //   this.navigateWithInvitationKey = function () {
          //       // var appUrl = ENV.redirectSignup;
          //       var inviteId = this.getInvitationKey();
          //       if (angular.isDefined(inviteId)) {
          //           appUrl += '#?iid=' + inviteId;
          //       }
          //       $window.location.replace(appUrl);
          // };
        }
    );
})(angular);

(function (angular) {
    'use strict';

    var APPS = {
        SAT: {
            id: 'SAT',
            name: 'SAT',
            className: 'sat'
        },
        TOEFL: {
            id: 'TOEFL',
            name: 'TOEFL',
            className: 'toefl'
        },
        ACT: {
            id: 'ACT',
            name: 'ACT',
            className: 'act'
        }
    };

    var USER_CONTEXT = {
        TEACHER: 1,
        STUDENT: 2
    };

    angular.module('znk.infra-web-app.loginApp').provider('LoginAppSrv', function () {
        var env = 'dev';
        this.setEnv = function (newEnv) {
            env = newEnv;
        };

        this.getEnv = function () {
            return env;
        };

        this.$get = ["$q", "$http", "$log", "$window", "SatellizerConfig", "InvitationKeyService", "PromoCodeSrv", "AllEnvConfigSrv", function ($q, $http, $log, $window, SatellizerConfig, InvitationKeyService, PromoCodeSrv, AllEnvConfigSrv) {
            'ngInject';

            var LoginAppSrv = {};

            function _getAppEnvConfig(appContext) {
                return AllEnvConfigSrv[env][appContext];
            }

            function _getAppScopeName(userContext, appEnvConfig) {
                return (userContext === USER_CONTEXT.TEACHER) ? appEnvConfig.dashboardAppName : appEnvConfig.studentAppName;
            }

            function _getGlobalRef(appContext, userContext) {
                var appEnvConfig = _getAppEnvConfig(appContext);
                return new Firebase(appEnvConfig.fbGlobalEndPoint, _getAppScopeName(userContext, appEnvConfig));
            }

            function _getAppRef(appContext, userContext) {
                var appEnvConfig = _getAppEnvConfig(appContext);
                return new Firebase(appEnvConfig.fbDataEndPoint, _getAppScopeName(userContext, appEnvConfig));
            }

            function _getUserContextRef(appContext, userContext) {
                var appRef = _getAppRef(appContext, userContext);

                var appEnvConfig = _getAppEnvConfig(appContext);
                var prefix = userContext === USER_CONTEXT.STUDENT ? appEnvConfig.studentAppName : appEnvConfig.dashboardAppName;

                return appRef.child(prefix);
            }

            function _addFirstRegistrationRecord(appContext, userContext) {
                var userContextAppRef = _getUserContextRef(appContext, userContext);
                var auth = userContextAppRef.getAuth();
                var firstLoginRef = userContextAppRef.child('firstLogin/' + auth.uid);
                return firstLoginRef.set(Firebase.ServerValue.TIMESTAMP);
            }

            function _getUserProfile(appContext, userContext) {
                var appRef = _getAppRef(appContext, userContext);
                var auth = appRef.getAuth();
                var userProfileRef = appRef.child('users/' + auth.uid + '/profile');
                var deferred = $q.defer();
                userProfileRef.on('value', function (snapshot) {
                    var userProfile = snapshot.val() || {};
                    deferred.resolve(userProfile);
                }, function (err) {
                    $log.error('LoginAppSrv _getUserProfile: err=' + err);
                    deferred.reject(err);
                });
                return deferred.promise;
            }

            function _writeUserProfile(formData, appContext, userContext, customProfileFlag) {
                var appRef = _getAppRef(appContext, userContext);
                var auth = appRef.getAuth();
                var userProfileRef = appRef.child('users/' + auth.uid);
                var profile;
                if (customProfileFlag) {
                    profile = {profile: formData};
                } else {
                    profile = {
                        profile: {
                            email: formData.email,
                            nickname: formData.nickname
                        }
                    };
                }
                return userProfileRef.update(profile).catch(function (err) {
                    $log.error(err);
                });
            }

            function _redirectToPage(appContext, userContext) {
                if (!appContext) {
                    /**
                     * TODO: remove this check and write a new function appContextGetter that will do this check every time its called
                     */
                    $log.error('appContext is not defined!', appContext);
                    return;
                }
                var appConfig = _getAppEnvConfig(appContext);
                var appName = appConfig.firebaseAppScopeName.substr(0, appConfig.firebaseAppScopeName.indexOf('_'));
                if (userContext === USER_CONTEXT.TEACHER) {
                    appName = appName + '-educator';
                }

                var urlParams = '';

                var invitationKey = InvitationKeyService.getInvitationKey();
                if (angular.isDefined(invitationKey) && invitationKey !== null) {
                    urlParams = '?iid=' + invitationKey;
                }

                var promoCode = PromoCodeSrv.getPromoCodeToUpdate();
                if (angular.isDefined(promoCode) && promoCode !== null) {

                    urlParams = urlParams === '' ? '?pcid=' + promoCode : urlParams + '&pcid=' + promoCode;

                }
                $window.location.href = "//" + $window.location.host + '/' + appName + '/web-app' + urlParams;
            }

            LoginAppSrv.createAuthWithCustomToken = function (refDB, token) {
                return refDB.authWithCustomToken(token).catch(function (error) {
                    $log.error('LoginAppSrv createAuthWithCustomToken: error=' + error);
                });
            };

            LoginAppSrv.userDataForAuthAndDataFb = function (data, appContext, userContext) {
                var refAuthDB = _getGlobalRef(appContext, userContext);
                var refDataDB = _getAppRef(appContext, userContext);
                var proms = [
                    LoginAppSrv.createAuthWithCustomToken(refAuthDB, data.authToken),
                    LoginAppSrv.createAuthWithCustomToken(refDataDB, data.dataToken)
                ];
                return $q.all(proms);
            };

            LoginAppSrv.APPS = APPS;

            LoginAppSrv.USER_CONTEXT = USER_CONTEXT;

            LoginAppSrv.logout = function (appContext, userContext) {
                var globalRef = _getGlobalRef(appContext, userContext);
                var appRef = _getAppRef(appContext, userContext);
                globalRef.unauth();
                appRef.unauth();
            };

            LoginAppSrv.getUserProfile = _getUserProfile;
            LoginAppSrv.addFirstRegistrationRecord = _addFirstRegistrationRecord;
            LoginAppSrv.writeUserProfile = _writeUserProfile;
            LoginAppSrv.redirectToPage = _redirectToPage;

            LoginAppSrv.setSocialProvidersConfig = function (providers, appContent) {
                var env = _getAppEnvConfig(appContent);
                angular.forEach(providers, function (provider) {
                    var providerConfig = SatellizerConfig.providers && SatellizerConfig.providers[provider];
                    if (providerConfig) {
                        providerConfig.clientId = env[provider + 'AppId'];
                        providerConfig.url = env.backendEndpoint + provider + '/code';
                    }
                    if (provider === 'facebook') {
                        providerConfig.redirectUri = (env.redirectFacebook) ? $window.location.protocol + env.redirectFacebook : $window.location.origin + '/';
                    }
                });
            };

            LoginAppSrv.resetPassword = function (appId, email, userContext) {
                var globalRef = _getGlobalRef(appId, userContext);
                return globalRef.resetPassword({
                    email: email
                }, function (error) {
                    if (error === null) {
                        $log.debug('Reset email was sent');
                    } else {
                        $log.debug('Email was not sent', error);
                    }
                }).then(function (res) {
                    return res;
                }).catch(function (error) {
                    return error;
                });
            };

            /**
             * params:
             *  appContext: ACT/SAT etc (APPS constant)
             *  userContext: 1,2 (USER_CONTEXT constant)
             *  formData: email & password
             */
            LoginAppSrv.login = (function () {
                var isLoginInProgress;

                return function (appContext, userContext, formData) {
                    if (isLoginInProgress) {
                        var errMsg = 'login already in progress';
                        $log.debug(errMsg);
                        return $q.reject(errMsg);
                    }

                    LoginAppSrv.logout(appContext, userContext);

                    isLoginInProgress = true;

                    var globalRef = _getGlobalRef(appContext, userContext);
                    return globalRef.authWithPassword(formData).then(function (authData) {
                        var appEnvConfig = _getAppEnvConfig(appContext);
                        var postUrl = appEnvConfig.backendEndpoint + 'firebase/token';
                        var postData = {
                            email: authData.password ? authData.password.email : '',
                            uid: authData.uid,
                            fbDataEndPoint: appEnvConfig.fbDataEndPoint,
                            fbEndpoint: appEnvConfig.fbGlobalEndPoint,
                            auth: appEnvConfig.dataAuthSecret,
                            token: authData.token
                        };

                        return $http.post(postUrl, postData).then(function (token) {
                            var appRef = _getAppRef(appContext, userContext);
                            return appRef.authWithCustomToken(token.data).then(function (res) {
                                isLoginInProgress = false;
                                _redirectToPage(appContext, userContext);
                                return res;
                            });
                        });
                    }).catch(function (err) {
                        isLoginInProgress = false;
                        return $q.reject(err);
                    });
                };
            })();
            /**
             * params:
             *  appContext: ACT/SAT etc (APPS constant)
             *  userContext: 1,2 (USER_CONTEXT constant)
             *  formData: email & password
             */
            LoginAppSrv.signup = (function () {
                var isSignUpInProgress;

                return function (appContext, userContext, formData) {
                    if (isSignUpInProgress) {
                        var errMsg = 'sign up already in progress';
                        $log.debug(errMsg);
                        return $q.reject(errMsg);
                    }

                    var globalRef = _getGlobalRef(appContext, userContext);
                    return globalRef.createUser(formData).then(function () {
                        _addFirstRegistrationRecord(appContext, userContext);
                        return LoginAppSrv.login(appContext, userContext, formData).then(function () {
                            isSignUpInProgress = false;
                            _addFirstRegistrationRecord(appContext, userContext);
                            return _writeUserProfile(formData, appContext, userContext).then(function () {
                                _redirectToPage(appContext, userContext);
                            });
                        });
                    }).catch(function (err) {
                        isSignUpInProgress = false;
                        return $q.reject(err);
                    });
                };
            })();

            return LoginAppSrv;
        }];
    });
})(angular);

angular.module('znk.infra-web-app.loginApp').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/loginApp/oathLogin/oathLogin.template.html",
    "<div class=\"btn-wrap\" translate-namespace=\"OATH_SOCIAL\">\n" +
    "    <button class=\"social-btn facebook-btn\"\n" +
    "            ng-click=\"vm.socialAuth('facebook')\"\n" +
    "            ng-if=\"vm.providers.facebook\">\n" +
    "        <svg-icon name=\"facebook-icon\"></svg-icon>\n" +
    "        <span class=\"loader ng-hide\" ng-show=\"vm.loading.facebook.showSpinner\"></span>\n" +
    "        <span translate=\".CONNECT_WITH_FB\"></span>\n" +
    "    </button>\n" +
    "    <button class=\"social-btn gplus-btn\"\n" +
    "            ng-click=\"vm.socialAuth('google')\"\n" +
    "            ng-if=\"vm.providers.google\">\n" +
    "        <svg-icon name=\"google-icon\"></svg-icon>\n" +
    "        <span class=\"loader ng-hide\" ng-show=\"vm.loading.google.showSpinner\"></span>\n" +
    "        <span translate=\".CONNECT_WITH_GOOGLE\"></span>\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/facebook-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-203 228.4 22.4 48.3\">\n" +
    "<path d=\"M-180.6,244h-7.6v-5c0-1.9,1.2-2.3,2.1-2.3c0.9,0,5.4,0,5.4,0v-8.3l-7.4,0c-8.2,0-10.1,6.2-10.1,10.1v5.5h-4.8v8.5h4.8\n" +
    "	c0,10.9,0,24.1,0,24.1h10c0,0,0-13.3,0-24.1h6.8L-180.6,244z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/form-envelope.svg",
    "<svg\n" +
    "    class=\"login-form-envelope-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 190.2 143.7\">\n" +
    "    <style>\n" +
    "        .login-form-envelope-svg{\n" +
    "            width: 20px;\n" +
    "            stroke: #CACACA;\n" +
    "            fill: none;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M174.7,141.2H15.4c-7.1,0-12.9-5.8-12.9-12.9V15.4c0-7.1,5.8-12.9,12.9-12.9h159.3c7.1,0,12.9,5.8,12.9,12.9\n" +
    "		v112.8C187.7,135.3,181.9,141.2,174.7,141.2z\"/>\n" +
    "	<path class=\"st0\" d=\"M4.1,7.3l77.3,75.1c7.6,7.4,19.8,7.4,27.4,0l77.3-75.1\"/>\n" +
    "	<line class=\"st0\" x1=\"77\" y1=\"78\" x2=\"7.7\" y2=\"135.5\"/>\n" +
    "	<line class=\"st0\" x1=\"112.8\" y1=\"78\" x2=\"182.1\" y2=\"135.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/form-lock.svg",
    "<svg class=\"locked-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .locked-svg{\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .locked-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #CACACA;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/google-icon.svg",
    "<svg x=\"0px\" version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 604.35 604.35\"\n" +
    "     class=\"google-icon-wrapper\">\n" +
    "    <style>\n" +
    "        .google-icon-wrapper{\n" +
    "            fill: #fff;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g id=\"google-plus\">\n" +
    "		<path d=\"M516.375,255v-76.5h-51V255h-76.5v51h76.5v76.5h51V306h76.5v-51H516.375z M320.025,341.7l-28.051-20.4\n" +
    "			c-10.2-7.649-20.399-17.85-20.399-35.7s12.75-33.15,25.5-40.8c33.15-25.5,66.3-53.55,66.3-109.65c0-53.55-33.15-84.15-51-99.45\n" +
    "			h43.35l30.6-35.7h-158.1c-112.2,0-168.3,71.4-168.3,147.9c0,58.65,45.9,122.4,127.5,122.4h20.4c-2.55,7.65-10.2,20.4-10.2,33.15\n" +
    "			c0,25.5,10.2,35.7,22.95,51c-35.7,2.55-102,10.2-150.45,40.8c-45.9,28.05-58.65,66.3-58.65,94.35\n" +
    "			c0,58.65,53.55,114.75,168.3,114.75c137.7,0,204.001-76.5,204.001-150.449C383.775,400.35,355.725,372.3,320.025,341.7z\n" +
    "			 M126.225,109.65c0-56.1,33.15-81.6,68.85-81.6c66.3,0,102,89.25,102,140.25c0,66.3-53.55,79.05-73.95,79.05\n" +
    "			C159.375,247.35,126.225,168.3,126.225,109.65z M218.024,568.65c-84.15,0-137.7-38.25-137.7-94.351c0-56.1,51-73.95,66.3-81.6\n" +
    "			c33.15-10.2,76.5-12.75,84.15-12.75s12.75,0,17.85,0c61.2,43.35,86.7,61.2,86.7,102C335.324,530.4,286.875,568.65,218.024,568.65z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/login-username-icon.svg",
    "<svg\n" +
    "    class=\"login-username-icon-svg\"\n" +
    "    x=\"0px\" y=\"0px\"\n" +
    "    viewBox=\"0 0 155.5 155.1\"\n" +
    "    style=\"enable-background:new 0 0 155.5 155.1;\">\n" +
    "    <style>\n" +
    "        .login-username-icon-svg{\n" +
    "        width: 20px;\n" +
    "        stroke: #CACACA;\n" +
    "        fill: none;\n" +
    "        stroke-width: 10;\n" +
    "        stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"st0\" cx=\"77.7\" cy=\"40.3\" r=\"37.8\"/>\n" +
    "        <path class=\"st0\" d=\"M77.7,152.6h68.5c4,0,7.2-3.5,6.7-7.5c-0.7-6.2-2.3-14.2-3.7-18.2c-8.5-23.7-28.7-30.4-36.3-32.1\n" +
    "		c-1.8-0.4-3.6,0-5.1,0.9c-15.9,10.1-44.2,10.1-60,0c-1.5-1-3.4-1.3-5.1-0.9c-7.6,1.7-27.8,8.3-36.3,32.1c-1.5,4.1-3,12-3.7,18.2\n" +
    "		c-0.5,4,2.7,7.5,6.7,7.5H77.7z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/svg/v-icon.svg",
    "<svg class=\"v-icon-wrapper\" x=\"0px\" y=\"0px\" viewBox=\"0 0 334.5 228.7\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .v-icon-wrapper .st0{\n" +
    "            fill:#ffffff;\n" +
    "            stroke:#ffffff;\n" +
    "            stroke-width:26;\n" +
    "            stroke-linecap:round;\n" +
    "            stroke-linejoin:round;\n" +
    "            stroke-miterlimit:10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"13\" y1=\"109.9\" x2=\"118.8\" y2=\"215.7\"/>\n" +
    "	<line class=\"st0\" x1=\"118.8\" y1=\"215.7\" x2=\"321.5\" y2=\"13\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/loginApp/templates/loginApp.directive.html",
    "<div class=\"login-app\" ng-class=\"{\n" +
    "        student: d.userContext === d.userContextObj.STUDENT,\n" +
    "        educator: d.userContext === d.userContextObj.TEACHER,\n" +
    "        sat: d.appContext === d.availableApps.SAT,\n" +
    "        act: d.appContext === d.availableApps.ACT,\n" +
    "        toefl: d.appContext === d.availableApps.TOEFL,\n" +
    "    }\">\n" +
    "    <header>\n" +
    "        <div class=\"logo-wrapper\">\n" +
    "            <a class=\"logo\" href=\"https://www.zinkerz.com\"></a>\n" +
    "            <span ng-if=\"d.userContext===d.userContextObj.TEACHER\"\n" +
    "                  translate=\"LOGIN_APP.FOR_EDUCATORS\">\n" +
    "            </span>\n" +
    "        </div>\n" +
    "        <div class=\"app-select\" ng-cloak ng-class=\"{'no-dropdown': d.invitationId}\">\n" +
    "            <md-menu md-offset=\"-50 80\" md-no-ink ng-if=\"!d.invitationId\">\n" +
    "                <md-button aria-label=\"Open App Select Menu\"\n" +
    "                           class=\"md-icon-button\"\n" +
    "                           ng-click=\"openMenu($mdOpenMenu, $event)\">\n" +
    "                    <md-icon class=\"material-icons expand-menu\">expand_more</md-icon>\n" +
    "                    <div class=\"app-img-holder {{d.appContext.className}}\"></div>\n" +
    "                </md-button>\n" +
    "                <md-menu-content id=\"app-select-menu\">\n" +
    "                    <md-menu-item ng-repeat=\"app in d.availableApps track by app.id\"\n" +
    "                                  ng-click=\"selectApp(app)\">\n" +
    "                        <div class=\"app-img-holder {{app.className}}\"></div>\n" +
    "                    </md-menu-item>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "            <div class=\"app-img-holder {{d.appContext.className}}\" ng-if=\"d.invitationId\"></div>\n" +
    "        </div>\n" +
    "        <a ng-if=\"d.userContext===d.userContextObj.STUDENT && !d.invitationId && d.appContext.className !== 'toefl'\"\n" +
    "           class=\"for-educators app-color\"\n" +
    "           ng-click=\"changeUserContext(d.userContextObj.TEACHER)\"\n" +
    "           translate=\"LOGIN_APP.EDUCATORS_CLICK_HERE\">\n" +
    "        </a>\n" +
    "    </header>\n" +
    "    <div class=\"main\">\n" +
    "        <div ng-switch=\"d.userContext\" ng-if=\"!d.invitationId\">\n" +
    "            <img class=\"main-banner img-responsive\" ng-switch-when=\"1\"\n" +
    "                 src=\"assets/images/login-teacher-bg@2x.jpg\">\n" +
    "            <img class=\"main-banner img-responsive\" ng-switch-when=\"2\"\n" +
    "                 src=\"assets/images/login-student-bg@2x.jpg\">\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-if=\"d.invitationId\">\n" +
    "            <div ng-switch=\"d.userContext\">\n" +
    "                <img class=\"main-banner img-responsive\" ng-switch-when=\"1\"\n" +
    "                     src=\"assets/images/login-teacher-invitation-bg@2x.jpg\">\n" +
    "                <img class=\"main-banner img-responsive\" ng-switch-when=\"2\"\n" +
    "                     src=\"assets/images/login-student-invitation-bg@2x.jpg\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"main-inner\">\n" +
    "            <ng-switch on=\"currentForm\">\n" +
    "                <div class=\"login-container\" ng-switch-when=\"login\">\n" +
    "                    <login-form app-context=\"d.appContext\"\n" +
    "                                user-context=\"d.userContext\"\n" +
    "                                change-password-click=\"changePasswordClick()\">\n" +
    "                    </login-form>\n" +
    "                    <p class=\"go-to-signup\">\n" +
    "                        <span translate=\"LOGIN_FORM.STUDENT.DONT_HAVE_AN_ACCOUNT\"\n" +
    "                              ng-if=\"d.userContext===d.userContextObj.STUDENT\"></span>\n" +
    "                        <span translate=\"LOGIN_FORM.EDUCATOR.DONT_HAVE_AN_ACCOUNT\"\n" +
    "                              ng-if=\"d.userContext===d.userContextObj.TEACHER\"></span>\n" +
    "                        <a ng-click=\"changeCurrentForm('signup')\" translate=\"SIGNUP_FORM.SIGN_UP\"></a>\n" +
    "                    </p>\n" +
    "                </div>\n" +
    "                <div class=\"signup-container\" ng-switch-when=\"signup\">\n" +
    "                    <signup-form app-context=\"d.appContext\"\n" +
    "                                 user-context=\"d.userContext\">\n" +
    "                    </signup-form>\n" +
    "                    <p class=\"go-to-login\">\n" +
    "                        <span translate=\"SIGNUP_FORM.STUDENT.ALREADY_HAVE_ACCOUNT\"\n" +
    "                              ng-if=\"d.userContext===d.userContextObj.STUDENT\"></span>\n" +
    "                        <span translate=\"SIGNUP_FORM.EDUCATOR.ALREADY_HAVE_ACCOUNT\"\n" +
    "                              ng-if=\"d.userContext===d.userContextObj.TEACHER\"></span>\n" +
    "                        <a ng-click=\"changeCurrentForm('login')\" translate=\"LOGIN_FORM.LOGIN_IN\"></a>\n" +
    "                    </p>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"change-password-container\" ng-switch-when=\"changePassword\">\n" +
    "                    <reset-password-form app-context=\"d.appContext\" user-context=\"d.userContext\"\n" +
    "                                         back-to-login=\"changeCurrentForm('login')\">\n" +
    "\n" +
    "                    </reset-password-form>\n" +
    "                    <a class=\"back-to-login-btn\" ng-click=\"changeCurrentForm('login')\">\n" +
    "                        <svg-icon name=\"dropdown-arrow\" class=\"back-btn-icon\"></svg-icon>\n" +
    "                        <span class=\"back-btn-label\" translate=\"CHANGE_PASSOWRD_FORM.BACK_TO_LOGIN\"></span>\n" +
    "                    </a>\n" +
    "                </div>\n" +
    "            </ng-switch>\n" +
    "            <h2 class=\"banner-text\">\n" +
    "                <ng-switch on=\"currentUserContext\" ng-if=\"!d.invitationId\">\n" +
    "                    <div ng-switch-when=\"teacher\" class=\"switch-student-educator\">\n" +
    "                        <span translate=\"LOGIN_APP.SAT_EDUCATOR_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.SAT\"></span>\n" +
    "                        <span translate=\"LOGIN_APP.ACT_EDUCATOR_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.ACT\"></span>\n" +
    "                        <span translate=\"LOGIN_APP.TOEFL_EDUCATOR_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.TOEFL\"></span>\n" +
    "                    </div>\n" +
    "                    <div ng-switch-when=\"student\" class=\"switch-student-educator\">\n" +
    "                        <span translate=\"LOGIN_APP.SAT_STUDENT_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.SAT\"></span>\n" +
    "                        <span translate=\"LOGIN_APP.ACT_STUDENT_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.ACT\"></span>\n" +
    "                        <span translate=\"LOGIN_APP.TOEFL_STUDENT_TAGLINE\"\n" +
    "                              ng-if=\"d.appContext===d.availableApps.TOEFL\"></span>\n" +
    "                    </div>\n" +
    "                </ng-switch>\n" +
    "                <div class=\"invitation-title\" ng-if=\"d.invitationId\">\n" +
    "                    <div class=\"first-row\" translate=\"LOGIN_APP.SIGNUP_OR_LOGIN\"></div>\n" +
    "                    <div class=\"second-row\" translate=\"LOGIN_APP.ACCEPT_INVITATION\"></div>\n" +
    "                </div>\n" +
    "            </h2>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <footer>\n" +
    "        <ng-switch on=\"currentUserContext\" ng-if=\"!d.invitationId && d.appContext.className !== 'toefl'\">\n" +
    "            <div ng-switch-when=\"teacher\" class=\"switch-student-educator\">\n" +
    "                <h2 translate=\"LOGIN_APP.CHECK_OUT_OUR_APP_FOR_STUDENTS\"></h2>\n" +
    "                <a href=\"\" class=\"app-color\" ng-click=\"changeUserContext(d.userContextObj.STUDENT)\"\n" +
    "                   translate=\"LOGIN_APP.SIGN_UP_FOR_ZINKERZ_TEST_PREP\"></a>\n" +
    "            </div>\n" +
    "            <div ng-switch-when=\"student\" class=\"switch-student-educator\">\n" +
    "                <h2 translate=\"LOGIN_APP.ARE_YOU_AN_EDUCATOR\"></h2>\n" +
    "                <a href=\"\" class=\"app-color\" ng-click=\"changeUserContext(d.userContextObj.TEACHER)\"\n" +
    "                   translate=\"LOGIN_APP.CHECK_OUT_ZINKERZ_TOOLS_FOR_TEACHERS\"></a>\n" +
    "            </div>\n" +
    "        </ng-switch>\n" +
    "    </footer>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/loginForm.directive.html",
    "<div class=\"form-container login\" translate-namespace=\"LOGIN_FORM\">\n" +
    "    <div class=\"title\" translate=\"LOGIN_FORM.STUDENT.LOGIN\" ng-if=\"userContext===d.userContextObj.STUDENT\"></div>\n" +
    "    <div class=\"title\" translate=\"LOGIN_FORM.EDUCATOR.LOGIN\" ng-if=\"userContext===d.userContextObj.TEACHER\"></div>\n" +
    "\n" +
    "    <promo-code\n" +
    "        user-context-const=\"d.userContextObj\"\n" +
    "        user-context=\"userContext\"\n" +
    "        app-context=\"appContext\">\n" +
    "    </promo-code>\n" +
    "\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth\">\n" +
    "            <oath-login-drv\n" +
    "                app-context=\"appContext\"\n" +
    "                user-context=\"userContext\"\n" +
    "                providers=\"{facebook:true,google:true}\">\n" +
    "            </oath-login-drv>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <form novalidate\n" +
    "          name=\"loginform\"\n" +
    "          ng-submit=\"loginSubmit(loginform)\">\n" +
    "        <div class=\"inputs-container\">\n" +
    "            <div class=\"input-wrapper\"\n" +
    "                 ng-class=\"loginform.email.$invalid && loginform.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                <input type=\"email\"\n" +
    "                       placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                       name=\"email\"\n" +
    "                       ng-model=\"d.loginFormData.email\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"loginform.$submitted && loginform.email.$invalid && !loginform.email.$dirty\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"loginform.email.$error.required\"\n" +
    "                              translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\"\n" +
    "                 ng-class=\"loginform.password.$invalid && loginform.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"form-lock\"></svg-icon>\n" +
    "                <input type=\"password\"\n" +
    "                       placeholder=\"{{'LOGIN_FORM.PASSWORD' | translate}}\"\n" +
    "                       name=\"password\"\n" +
    "                       autocomplete=\"off\"\n" +
    "                       ng-minlength=\"6\"\n" +
    "                       ng-maxlength=\"25\"\n" +
    "                       ng-model=\"d.loginFormData.password\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"loginform.$submitted && loginform.password.$invalid && !loginform.password.$dirty\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"loginform.password.$error.required\"\n" +
    "                              translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"submit-btn-wrapper\">\n" +
    "            <button type=\"submit\"\n" +
    "                    ng-disabled=\"d.disableBtn\"\n" +
    "                    class=\"app-bg\"\n" +
    "                    autofocus>\n" +
    "                <span translate=\".LOGIN_IN\"></span>\n" +
    "                <span class=\"loader ng-hide\" ng-show=\"d.showSpinner\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "        <div class=\"forgot-pwd-wrapper\">\n" +
    "            <span class=\"app-color\" translate=\".FORGOT_PWD\" ng-click=\"changePasswordClick()\"></span>\n" +
    "        </div>\n" +
    "        <p class=\"general-error\">{{d.loginError}}</p>\n" +
    "    </form>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
  $templateCache.put("components/loginApp/templates/promoCode.template.html",
    "<div class=\"promo-code-wrapper\" translate-namespace=\"PROMO_CODE\">\n" +
    "    <div class=\"promo-code-title\"\n" +
    "         translate=\"{{(userContext === userContextConst.TEACHER ? '.GOT_A_ZINKERZ_EDUCATORS_PROMO_CODE' : '.GOT_A_PROMO_CODE') | translate}}\"\n" +
    "         ng-click=\"d.showPromoCodeOverlay = !d.showPromoCodeOverlay\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"promo-code-overlay\" ng-if=\"d.showPromoCodeOverlay\">\n" +
    "\n" +
    "        <div class=\"promo-code-input-wrapper\">\n" +
    "            <div class=\"input-wrapper\"\n" +
    "                 ng-class=\"{\n" +
    "             'promo-code-accepted': d.promoCodeStatus === d.promoCodeStatusConst.accepted,\n" +
    "             'promo-code-invalid': d.promoCodeStatus === d.promoCodeStatusConst.invalid\n" +
    "             }\">\n" +
    "                <md-progress-circular ng-if=\"d.showSpinner\"\n" +
    "                                      class=\"promo-code-spinner\"\n" +
    "                                      md-mode=\"indeterminate\"\n" +
    "                                      md-diameter=\"25\">\n" +
    "                </md-progress-circular>\n" +
    "                <input\n" +
    "                    type=\"text\"\n" +
    "                    ng-model=\"d.promoCode\"\n" +
    "                    ng-keydown=\"d.keyDownHandler($event, d.promoCode)\"\n" +
    "                    ng-autofocus =\"true\"\n" +
    "                    placeholder=\"{{'PROMO_CODE.ENTER_YOUR_CODE' | translate}}\">\n" +
    "                <div class=\"icon-wrapper\" >\n" +
    "                    <svg-icon class=\"arrow-icon\" name=\"promo-code-arrow-icon\" ng-click=\"d.sendPromoCode(d.promoCode)\"></svg-icon>\n" +
    "                    <svg-icon class=\"close-icon\" name=\"promo-code-close-icon\" ng-click=\"d.clearInput()\"></svg-icon>\n" +
    "                    <svg-icon class=\"correct-icon\" name=\"promo-code-correct-icon\"  ng-click=\"d.showPromoCodeOverlay = !d.showPromoCodeOverlay\"></svg-icon>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"promo-code-status-text\">\n" +
    "                    {{d.promoCodeStatusText}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/resetPasswordForm.directive.html",
    "<div class=\"form-container\" translate-namespace=\"CHANGE_PASSOWRD_FORM\">\n" +
    "    <ng-switch on=\"resetPasswordSucceeded\">\n" +
    "        <form novalidate\n" +
    "              name=\"changePasswordForm\"\n" +
    "              ng-submit=\"passwordSubmit(changePasswordForm)\"\n" +
    "              ng-switch-when=\"false\">\n" +
    "            <div class=\"inputs-container\">\n" +
    "                <div class=\"title\" translate=\".RESET_PASSWORD\"></div>\n" +
    "                <div class=\"input-wrapper\"\n" +
    "                     ng-class=\"changePasswordForm.email.$invalid && changePasswordForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                    <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                    <input type=\"email\"\n" +
    "                           placeholder=\"{{'LOGIN_FORM.EMAIL' | translate}}\"\n" +
    "                           name=\"email\"\n" +
    "                           ng-model=\"d.changePasswordForm.email\"\n" +
    "                           required>\n" +
    "                    <span\n" +
    "                        ng-if=\"(changePasswordForm.$submitted && changePasswordForm.email.$invalid && !changePasswordForm.email.$dirty) || (changePasswordForm.email.$error && changePasswordForm.$submitted)\"\n" +
    "                        role=\"alert\">\n" +
    "            <span class=\"validationBox\">\n" +
    "                <span ng-show=\"changePasswordForm.email.$error.required\"\n" +
    "                      translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                <span class=\"no-email-massage\" ng-show=\"changePasswordForm.email.$error.noSuchEmail\"\n" +
    "                      translate=\".NO_SUCH_EMAIL\"></span>\n" +
    "            </span>\n" +
    "        </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"submit-btn-wrapper\">\n" +
    "                <button type=\"submit\"\n" +
    "                        ng-disabled=\"d.disableBtn\"\n" +
    "                        class=\"app-bg\"\n" +
    "                        autofocus>\n" +
    "                    <span translate=\".SEND\"></span>\n" +
    "                    <span class=\"loader ng-hide\" ng-show=\"showSpinner\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "        <div ng-switch-when=\"true\" class=\"success-massage\">\n" +
    "            <div class=\"title\" translate=\".RESET_PASSWORD\"></div>\n" +
    "                <svg-icon name=\"v-icon\"></svg-icon>\n" +
    "            <div class=\"massage-text\" translate=\".NEW_PASSWORD_SENT\"></div>\n" +
    "            <div class=\"submit-btn-wrapper\">\n" +
    "                <button ng-disabled=\"d.disableBtn\"\n" +
    "                        class=\"app-bg\"\n" +
    "                        ng-click=\"backToLogin()\"\n" +
    "                        autofocus>\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/loginApp/templates/signupForm.directive.html",
    "<div class=\"form-container signup\" translate-namespace=\"SIGNUP_FORM\">\n" +
    "    <div class=\"title\" translate=\".STUDENT.CREATE_ACCOUNT\" ng-if=\"userContext===d.userContextObj.STUDENT\"></div>\n" +
    "    <div class=\"title\" translate=\".EDUCATOR.CREATE_ACCOUNT\" ng-if=\"userContext===d.userContextObj.TEACHER\"></div>\n" +
    "\n" +
    "    <promo-code\n" +
    "        user-context-const=\"d.userContextObj\"\n" +
    "        user-context=\"userContext\"\n" +
    "        app-context=\"appContext\">\n" +
    "    </promo-code>\n" +
    "\n" +
    "    <div class=\"social-auth-container\">\n" +
    "        <div class=\"social-auth\">\n" +
    "            <oath-login-drv\n" +
    "                app-context=\"appContext\"\n" +
    "                user-context=\"userContext\"\n" +
    "                providers=\"{facebook:true,google:true}\">\n" +
    "            </oath-login-drv>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"divider\">\n" +
    "        <div translate=\".OR\" class=\"text\"></div>\n" +
    "    </div>\n" +
    "    <form novalidate\n" +
    "          name=\"signupForm\"\n" +
    "          ng-submit=\"signupSubmit(signupForm)\">\n" +
    "        <div class=\"inputs-container\">\n" +
    "            <div class=\"input-wrapper\" ng-class=\"signupForm.nickname.$invalid && signupForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"login-username-icon\"></svg-icon>\n" +
    "                <input type=\"text\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.NAME' | translate}}\"\n" +
    "                       name=\"nickname\"\n" +
    "                       ng-model=\"d.signupFormData.nickname\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"signupForm.$submitted && signupForm.nickname.$invalid && !signupForm.nickname.$dirty\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"signupForm.nickname.$error.required\" translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\" ng-class=\"signupForm.email.$invalid && signupForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"form-envelope\"></svg-icon>\n" +
    "                <input type=\"email\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.EMAIL' | translate}}\"\n" +
    "                       name=\"email\"\n" +
    "                       ng-model=\"d.signupFormData.email\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"(signupForm.$submitted && signupForm.email.$invalid && !signupForm.email.$dirty) ||\n" +
    "                (signupForm.$submitted && signupForm.email.$error)\" role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"signupForm.email.$error.required\" translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                        <span class=\"email-exist-massage\" ng-show=\"signupForm.email.$error.emailTaken\" translate=\"LOGIN_APP.FORM_VALIDATION.EMAIL_TAKEN\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "            <div class=\"input-wrapper\" ng-class=\"signupForm.password.$invalid && signupForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                <svg-icon name=\"form-lock\"></svg-icon>\n" +
    "                <input type=\"password\"\n" +
    "                       placeholder=\"{{'SIGNUP_FORM.PASSWORD' | translate}}\"\n" +
    "                       name=\"password\"\n" +
    "                       ng-model=\"d.signupFormData.password\"\n" +
    "                       ng-minlength=\"6\"\n" +
    "                       ng-maxlength=\"25\"\n" +
    "                       autocomplete=\"off\"\n" +
    "                       required>\n" +
    "                <span ng-if=\"signupForm.$submitted && signupForm.password.$invalid\"\n" +
    "                      role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"signupForm.password.$error.minlength\" translate=\"LOGIN_APP.FORM_VALIDATION.PASSWORD_TOO_SHORT\"></span>\n" +
    "                        <span ng-show=\"signupForm.password.$error.maxlength\" translate=\"LOGIN_APP.FORM_VALIDATION.PASSWORD_TOO_LONG\"></span>\n" +
    "                        <span ng-show=\"signupForm.password.$error.required\" translate=\"LOGIN_APP.FORM_VALIDATION.FIELD_IS_EMPTY\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"submit-btn-wrapper\">\n" +
    "            <button type=\"submit\"\n" +
    "                    ng-disabled=\"d.disableBtn\"\n" +
    "                    class=\"app-bg\"\n" +
    "                    autofocus>\n" +
    "                <span translate=\".SIGN_UP\"></span>\n" +
    "                <div class=\"loader ng-hide\" ng-show=\"d.showSpinner\"></div>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "        <p class=\"signup-disclaimer\"\n" +
    "           translate-values=\"{termsOfUseHref: d.termsOfUseHref, privacyPolicyHref: d.privacyPolicyHref}\"\n" +
    "           translate=\".DISCLAIMER\"></p>\n" +
    "\n" +
    "        <p class=\"general-error\">{{d.signupError}}</p>\n" +
    "    </form>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'znk.infra.config',
        'znk.infra.analytics',
        'znk.infra.storage',
        'znk.infra.user',
        'ui.router',
        'ngMaterial',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.diagnosticIntro'
    ]).config([
        'SvgIconSrvProvider', '$stateProvider',
        function (SvgIconSrvProvider, $stateProvider) {
            var svgMap = {
                'on-boarding-heart': 'components/onBoarding/svg/onboarding-heart-icon.svg',
                'on-boarding-target': 'components/onBoarding/svg/onboarding-target-icon.svg',
                'on-boarding-hat': 'components/onBoarding/svg/onboarding-hat-icon.svg',
                'on-boarding-dropdown-arrow-icon': 'components/onBoarding/svg/dropdown-arrow.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);

            $stateProvider
                .state('app.onBoarding', {
                    url: '/onBoarding',
                    templateUrl: 'components/onBoarding/templates/onBoarding.template.html',
                    controller: 'OnBoardingController',
                    controllerAs: 'vm',
                    resolve: {
                        onBoardingStep: ['OnBoardingService', function (OnBoardingService) {
                            return OnBoardingService.getOnBoardingStep();
                        }]
                    }
                })
                .state('app.onBoarding.welcome', {
                    templateUrl: 'components/onBoarding/templates/onBoardingWelcome.template.html',
                    controller: 'OnBoardingWelcomesController',
                    controllerAs: 'vm',
                    resolve: {
                        userProfile: ['UserProfileService', function (UserProfileService) {
                            return UserProfileService.getProfile();
                        }]
                    }
                })
                .state('app.onBoarding.schools', {
                    templateUrl: 'components/onBoarding/templates/onBoardingSchools.template.html',
                    controller: 'OnBoardingSchoolsController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.goals', {
                    templateUrl: 'components/onBoarding/templates/onBoardingGoals.template.html',
                    controller: 'OnBoardingGoalsController',
                    controllerAs: 'vm'
                })
                .state('app.onBoarding.diagnostic', {
                    templateUrl: 'components/onBoarding/templates/onBoardingDiagnostic.template.html',
                    controller: 'OnBoardingDiagnosticController',
                    controllerAs: 'vm'
                });
        }
    ]);

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ON_BOARDING.WELCOME": {
                            "WELCOME": "Welcome ",
                            "THANK_YOU_MESSAGE": "Thank you for joining us at ",
                            "WE_ARE_HERE_TO_HELP": "We'll show you how to earn your highest possible score!",
                            "CONTINUE": "CONTINUE"
                        },
                        "ON_BOARDING.GOALS": {
                            "SET_SCORE_GOALS": "Set Your Score Goals",
                            "WHATS_YOUR_DREAM_SCHOOL": "What is your dream school?",
                            "I_DONT_KNOW": "I don't know yet",
                            "SELECT_3_DREAM_SCHOOLS": "Select up to 3 dream schools"
                        },
                        "ON_BOARDING.DIAGNOSTIC": {
                            "DIAGNOSTIC_TEST": "Diagnostic Test",
                            "TAKE_IT_LATER": "Take it later",
                            "START_TEST": "START TEST",
                            "LETS_LEARN": "Let's learn a little about your mastery level in each subject.",
                            "THIS_QUICK_TEST": "This quick test will determine your initial estimated score and your training roadmap."
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingController', ["$state", "onBoardingStep", function($state, onBoardingStep) {
        'ngInject';
        $state.go(onBoardingStep.url);
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingDiagnosticController', ['OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(OnBoardingService, $state, znkAnalyticsSrv) {
        this.setOnboardingCompleted = function (nextState, eventText) {
            znkAnalyticsSrv.eventTrack({
                eventName: 'onBoardingDiagnosticStep',
                props: {
                    clicked: eventText
                }
            });
            OnBoardingService.setOnBoardingStep(OnBoardingService.steps.ROADMAP).then(function () {
                $state.go(nextState);
            });
        };
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingGoalsController', ['$state', 'OnBoardingService', 'znkAnalyticsSrv',
        function($state, OnBoardingService, znkAnalyticsSrv) {
            this.userGoalsSetting = {
                recommendedGoalsTitle: true,
                saveBtn: {
                    title: '.SAVE_AND_CONTINUE',
                    showSaveIcon: true
                }
            };

            this.saveGoals = function () {
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingGoalsStep' });
                OnBoardingService.setOnBoardingStep(OnBoardingService.steps.DIAGNOSTIC);
                $state.go('app.onBoarding.diagnostic');
            };
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingSchoolsController', ['$state', 'OnBoardingService', 'userGoalsSelectionService', 'znkAnalyticsSrv', '$timeout',
        function($state, OnBoardingService, userGoalsSelectionService, znkAnalyticsSrv, $timeout) {

            function _addEvent(clicked) {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'onBoardingSchoolsStep',
                    props: {
                        clicked: clicked
                    }
                });
            }

            function _goToGoalsState(newUserSchools, evtName) {
                _addEvent(evtName);
                userGoalsSelectionService.setDreamSchools(newUserSchools, true).then(function () {
                    OnBoardingService.setOnBoardingStep(OnBoardingService.steps.GOALS).then(function () {
                        $timeout(function () {
                            $state.go('app.onBoarding.goals');
                        });
                    });
                });
            }

            this.schoolSelectEvents = {
                onSave: function save(newUserSchools) {
                    _goToGoalsState(newUserSchools, 'Save and Continue');
                }
            };

            this.skipSelection = function () {
                _goToGoalsState([], 'I don\'t know yet');
            };
    }]);
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').controller('OnBoardingWelcomesController', ['userProfile', 'OnBoardingService', '$state', 'znkAnalyticsSrv',
        function(userProfile, OnBoardingService, $state, znkAnalyticsSrv) {

            var onBoardingSettings = OnBoardingService.getOnBoardingSettings();
            this.username = userProfile.nickname || '';

            this.nextStep = function () {
                var nextStep;
                var nextState;
                znkAnalyticsSrv.eventTrack({ eventName: 'onBoardingWelcomeStep' });
                if (onBoardingSettings.showSchoolStep) {
                    nextStep = OnBoardingService.steps.SCHOOLS;
                    nextState = 'app.onBoarding.schools';
                } else {
                    nextStep = OnBoardingService.steps.GOALS;
                    nextState = 'app.onBoarding.goals';
                }
                OnBoardingService.setOnBoardingStep(nextStep);
                $state.go(nextState);
            };
    }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').directive('onBoardingBar', function OnBoardingBarDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/onBoarding/templates/onBoardingBar.template.html',
            scope: {
                step: '@'
            }
        };

        return directive;
    });

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.onBoarding').run(["$rootScope", "OnBoardingService", "$state", function ($rootScope, OnBoardingService, $state) {
        'ngInject';
        var isOnBoardingCompleted = false;
        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState) {//eslint-disable-line
            if (isOnBoardingCompleted) {
                return;
            }

            var APP_WORKOUTS_STATE = 'app.workouts.roadmap';
            var isGoingToWorkoutsState = toState.name.indexOf(APP_WORKOUTS_STATE) !== -1;

            if (isGoingToWorkoutsState) {
                evt.preventDefault();

                OnBoardingService.isOnBoardingCompleted().then(function (_isOnBoardingCompleted) {
                    isOnBoardingCompleted = _isOnBoardingCompleted;

                    if (!isOnBoardingCompleted) {
                        var ON_BOARDING_STATE_NAME = 'app.onBoarding';
                        var isNotFromOnBoardingState = fromState.name.indexOf(ON_BOARDING_STATE_NAME) === -1;
                        if (isNotFromOnBoardingState) {
                            $state.go(ON_BOARDING_STATE_NAME);
                        }
                    } else {
                        $state.go(toState, toParams, {
                            reload: true
                        });
                    }
                });
            }
        });
    }]);

})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.onBoarding').provider('OnBoardingService', [function() {
        this.$get = ['InfraConfigSrv', 'StorageSrv', function(InfraConfigSrv, StorageSrv) {
            var self = this;
            var ONBOARDING_PATH = StorageSrv.variables.appUserSpacePath + '/' + 'onBoardingProgress';
            var onBoardingServiceObj = {};

            var onBoardingStates = {
                1: 'app.onBoarding.welcome',
                2: 'app.onBoarding.schools',
                3: 'app.onBoarding.goals',
                4: 'app.onBoarding.diagnostic',
                5: 'app.workouts.roadmap'
            };

            onBoardingServiceObj.steps = {
                WELCOME: 1,
                SCHOOLS: 2,
                GOALS: 3,
                DIAGNOSTIC: 4,
                ROADMAP: 5
            };

            onBoardingServiceObj.getOnBoardingStep = function () {
                return getProgress().then(function (progress) {
                    return {
                        url: onBoardingStates[progress.step]
                    };
                });
            };

            onBoardingServiceObj.setOnBoardingStep = function (stepNum) {
                return getProgress().then(function (progress) {
                    progress.step = stepNum;
                    return setProgress(progress);
                });
            };

            function getProgress() {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.get(ONBOARDING_PATH).then(function (progress) {
                        if (!progress.step) {
                            progress.step = 1;
                        }
                        return progress;
                    });
                });
            }

            function setProgress(progress) {
                return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                    return studentStorage.set(ONBOARDING_PATH, progress);
                });
            }

            onBoardingServiceObj.isOnBoardingCompleted = function () {
                return getProgress().then(function (onBoardingProgress) {
                    return onBoardingProgress.step === onBoardingServiceObj.steps.ROADMAP;
                });
            };

            onBoardingServiceObj.getOnBoardingSettings = function() {
                return self.settings;
            };

            return onBoardingServiceObj;
        }];
    }]);
})(angular);

angular.module('znk.infra-web-app.onBoarding').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/onBoarding/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-hat-icon.svg",
    "<svg class=\"on-boarding-hat-svg\"\n" +
    "     version=\"1.1\" id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-366 104.4 57.2 34.6\"\n" +
    "     style=\"enable-background:new -366 104.4 57.2 34.6;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.on-boarding-hat-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "        width: 47px;\n" +
    "    }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M-339.5,139.1c-9.8,0-15.9-5.6-16-5.7c-0.2-0.2-0.3-0.5-0.3-0.7v-11.2c0-0.6,0.4-1,1-1s1,0.4,1,1v10.7\n" +
    "		c2.1,1.7,13.5,10.2,30-0.1v-10.6c0-0.6,0.4-1,1-1s1,0.4,1,1v11.2c0,0.3-0.2,0.7-0.5,0.8C-328.7,137.7-334.6,139.1-339.5,139.1z\"/>\n" +
    "	<path class=\"st0\" d=\"M-338.7,128.5c-0.1,0-0.3,0-0.4-0.1l-26.1-10.5c-0.4-0.2-0.7-0.6-0.7-1.1c0-0.5,0.3-0.9,0.7-1.1l26.5-11.2\n" +
    "		c0.3-0.1,0.6-0.1,0.9,0l26.6,11.2c0.4,0.2,0.7,0.6,0.7,1.1c0,0.5-0.3,0.9-0.7,1.1l-27,10.5C-338.4,128.4-338.6,128.5-338.7,128.5z\n" +
    "		 M-361.7,116.8l23,9.3l23.9-9.3l-23.5-9.9L-361.7,116.8z\"/>\n" +
    "	<path class=\"st0\" d=\"M-312.8,126.5c-0.6,0-1-0.4-1-1v-8c0-0.6,0.4-1,1-1s1,0.4,1,1v8C-311.8,126.1-312.2,126.5-312.8,126.5z\"/>\n" +
    "	<path class=\"st0\" d=\"M-312,130.5c-1.7,0-3.1-1.4-3.1-3.1c0-1.7,1.4-3.1,3.1-3.1s3.1,1.4,3.1,3.1\n" +
    "		C-308.9,129.1-310.3,130.5-312,130.5z M-312,126.7c-0.4,0-0.7,0.3-0.7,0.7s0.3,0.7,0.7,0.7s0.7-0.3,0.7-0.7S-311.6,126.7-312,126.7\n" +
    "		z\"/>\n" +
    "	<path class=\"st0\" d=\"M-315,132.7l1.5-2.7c0.6-1.1,2.2-1.1,2.9,0l1.5,2.7c0.6,1.1-0.2,2.5-1.4,2.5h-3.1\n" +
    "		C-314.8,135.2-315.6,133.8-315,132.7z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-heart-icon.svg",
    "<svg class=\"on-boarding-heart-svg\"\n" +
    "     version=\"1.1\"\n" +
    "     id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-377 106.7 35.9 31.3\"\n" +
    "     style=\"enable-background:new -377 106.7 35.9 31.3;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "	.on-boarding-heart-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "    }\n" +
    "    </style>\n" +
    "\n" +
    "<path class=\"st0\" d=\"M-359,138c-0.2,0-0.4-0.1-0.6-0.2c-0.1,0-0.1-0.1-0.2-0.1l-0.2-0.2c-4.3-4-8.8-7.9-13.2-11.6\n" +
    "	c-3.1-2.7-4.4-6.5-3.6-10.4c0.9-4,4-7.5,7.7-8.6c3.4-1,6.9,0,10,2.9c3.1-2.9,6.7-3.9,10.1-2.9c3.7,1.1,6.7,4.4,7.6,8.5\n" +
    "	c0.9,3.9-0.4,7.8-3.6,10.5c-6.5,5.5-11.4,10-13,11.5l-0.3,0.2C-358.5,137.9-358.7,138-359,138z M-366.6,108.2\n" +
    "	c-0.7,0-1.4,0.1-2.1,0.3c-3.2,0.9-5.8,3.9-6.6,7.4c-0.4,2-0.6,5.8,3.1,8.9c4.4,3.7,8.8,7.6,13.2,11.6l0,0c1.6-1.5,6.6-6,13-11.6\n" +
    "	c2.7-2.3,3.8-5.6,3.1-9c-0.8-3.5-3.4-6.4-6.5-7.3c-3.1-0.9-6.3,0.2-9.1,3c-0.1,0.1-0.3,0.2-0.5,0.2c0,0,0,0,0,0\n" +
    "	c-0.2,0-0.4-0.1-0.5-0.2C-361.8,109.3-364.2,108.2-366.6,108.2z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/svg/onboarding-target-icon.svg",
    "<svg class=\"on-boarding-target-svg\"\n" +
    "     version=\"1.1\"\n" +
    "     id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-378 104 35 35\"\n" +
    "     style=\"enable-background:new -378 104 35 35;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.on-boarding-target-svg .st0 {\n" +
    "        fill: #87CA4D;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M-361,134.6c-7.5,0-13.5-6.1-13.5-13.5s6.1-13.5,13.5-13.5c7.5,0,13.5,6.1,13.5,13.5S-353.5,134.6-361,134.6z\n" +
    "		 M-361,108.8c-6.8,0-12.3,5.5-12.3,12.3c0,6.8,5.5,12.3,12.3,12.3s12.3-5.5,12.3-12.3C-348.7,114.3-354.2,108.8-361,108.8z\"/>\n" +
    "	<path class=\"st0\" d=\"M-361,129c-4.4,0-7.9-3.6-7.9-7.9c0-4.4,3.6-7.9,7.9-7.9c4.4,0,7.9,3.6,7.9,7.9\n" +
    "		C-353.1,125.5-356.6,129-361,129z M-361,114.4c-3.7,0-6.7,3-6.7,6.7c0,3.7,3,6.7,6.7,6.7s6.7-3,6.7-6.7\n" +
    "		C-354.3,117.4-357.3,114.4-361,114.4z\"/>\n" +
    "	<path class=\"st0\" d=\"M-361,139c-0.6,0-1-0.4-1-1v-33c0-0.6,0.4-1,1-1s1,0.4,1,1v33C-360,138.6-360.4,139-361,139z\"/>\n" +
    "	<path class=\"st0\" d=\"M-344,122h-33c-0.6,0-1-0.4-1-1s0.4-1,1-1h33c0.6,0,1,0.4,1,1S-343.4,122-344,122z\"/>\n" +
    "	<circle class=\"st0\" cx=\"-360.9\" cy=\"121.3\" r=\"1.9\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoarding.template.html",
    "<div class=\"on-board\">\n" +
    "    <div class=\"container base-border-radius base-box-shadow\" ui-view></div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingBar.template.html",
    "<div class=\"on-board-pager-wrap\">\n" +
    "    <div class=\"on-board-pager\">\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'heart-circle-selected': step === 'welcome'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-heart\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'target-circle-selected': step === 'goals'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-target\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"icon-circle\" ng-class=\"{'hat-circle-selected': step === 'diagnostic'}\">\n" +
    "            <svg-icon class=\"icon\" name=\"on-boarding-hat\"></svg-icon>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingDiagnostic.template.html",
    "<section class=\"step diagnostic\" translate-namespace=\"ON_BOARDING.DIAGNOSTIC\">\n" +
    "    <div class=\"diagnostic-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "    <diagnostic-intro></diagnostic-intro>\n" +
    "    <div class=\"btn-wrap\">\n" +
    "        <md-button tabindex=\"2\" class=\"default sm\" ng-click=\"vm.setOnboardingCompleted('app.workouts.roadmap', 'Take It Later')\">\n" +
    "            <span translate=\".TAKE_IT_LATER\"></span>\n" +
    "        </md-button>\n" +
    "        <md-button autofocus tabindex=\"1\" class=\"md-sm znk md-primary\" ng-click=\"vm.setOnboardingCompleted('app.diagnostic', 'Start Test')\">\n" +
    "            <span translate=\".START_TEST\"></span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"diagnostic\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingGoals.template.html",
    "<section class=\"step\" translate-namespace=\"ON_BOARDING.GOALS\">\n" +
    "    <div class=\"goals\">\n" +
    "        <div class=\"main-title\" translate=\".SET_SCORE_GOALS\"></div>\n" +
    "        <user-goals on-save=\"vm.saveGoals()\" setting=\"vm.userGoalsSetting\"></user-goals>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"goals\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingSchools.template.html",
    "<section class=\"step\" translate-namespace=\"ON_BOARDING.GOALS\">\n" +
    "    <div class=\"goals\">\n" +
    "        <div class=\"main-title\" translate=\".SET_SCORE_GOALS\"></div>\n" +
    "        <div class=\"sub-title\" translate=\".WHATS_YOUR_DREAM_SCHOOL\"></div>\n" +
    "        <div class=\"select-schools-title\" translate=\".SELECT_3_DREAM_SCHOOLS\"></div>\n" +
    "        <school-select user-schools=\"vm.userSchools\"\n" +
    "                       events=\"vm.schoolSelectEvents\">\n" +
    "        </school-select>\n" +
    "        <div class=\"light-title\" ng-click=\"vm.skipSelection()\" translate=\".I_DONT_KNOW\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"bg-wrap\">\n" +
    "        <div class=\"thinking-raccoon\"></div>\n" +
    "    </div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"goals\"></on-boarding-bar>\n" +
    "");
  $templateCache.put("components/onBoarding/templates/onBoardingWelcome.template.html",
    "<section class=\"step make-padding\" translate-namespace=\"ON_BOARDING.WELCOME\">\n" +
    "    <div class=\"welcome\">\n" +
    "        <div class=\"main-title\">\n" +
    "            <span translate=\".WELCOME\"></span>,\n" +
    "            <span class=\"user-name\">{{vm.username}}!</span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\">\n" +
    "            <div translate=\".THANK_YOU_MESSAGE\"></div>\n" +
    "            <span translate=\".ZINKERZ_APP_WELCOME_TEXT\"></span>\n" +
    "        </div>\n" +
    "        <div class=\"sub-title\" translate=\".WE_ARE_HERE_TO_HELP\"></div>\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <md-button autofocus tabindex=\"1\" class=\"md-primary znk inline-block\"\n" +
    "                       ng-click=\"vm.nextStep()\" ng-cloak>\n" +
    "                <span translate=\".CONTINUE\" class=\"continue-title\"></span>\n" +
    "                <svg-icon name=\"on-boarding-dropdown-arrow-icon\"\n" +
    "                          class=\"dropdown-arrow-icon inline-block\">\n" +
    "                </svg-icon>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"smile-raccoon\"></div>\n" +
    "</section>\n" +
    "<on-boarding-bar step=\"welcome\"></on-boarding-bar>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode', [])
        .config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'promo-code-arrow-icon': 'components/promoCode/svg/arrow-icon.svg',
                'promo-code-close-icon': 'components/promoCode/svg/close-icon.svg',
                'promo-code-correct-icon': 'components/promoCode/svg/correct-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "PROMO_CODE": {
                            "GOT_A_PROMO_CODE": "Got a Promo Code?",
                            "GOT_A_ZINKERZ_EDUCATORS_PROMO_CODE": "Got a Zinkerz Educator Code",
                            "ENTER_YOUR_CODE": "Enter your code...",
                            "ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED": "Zinkerz Educators Code Accepted",
                            "PROMO_CODE_ACCEPTED": "Promo code accepted",
                            "INVALID_CODE": "Invalid code, please contact support@zinkerz.com"
                        }
                    }
                );
            }]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').directive('promoCode',
        ["PromoCodeSrv", "PROMO_CODE_STATUS", function (PromoCodeSrv, PROMO_CODE_STATUS) {
            'ngInject';
            return {
                templateUrl: 'components/loginApp/templates/promoCode.template.html',
                restrict: 'E',
                scope: {
                    userContext: '<',
                    userContextConst: "<",
                    appContext: '<',
                },
                link: function (scope) {
                    var ENTER_KEY_CODE = 13;
                    scope.d = {};
                    scope.d.promoCodeStatusConst = PROMO_CODE_STATUS;

                    scope.d.sendPromoCode = function (promoCode) {
                        if (promoCode) {
                            scope.d.showSpinner = true;
                            PromoCodeSrv.checkPromoCode(promoCode, scope.appContext.id).then(function (promoCodeResult) {
                                scope.d.promoCodeStatus = promoCodeResult.status;
                                scope.d.promoCodeStatusText = promoCodeResult.text;
                                scope.d.showSpinner = false;
                                if (scope.d.promoCodeStatus === scope.d.promoCodeStatusConst.accepted) {
                                    PromoCodeSrv.promoCodeToUpdate(promoCode);
                                } else {
                                    PromoCodeSrv.promoCodeToUpdate(undefined);
                                }
                            });
                        }
                    };
                    scope.d.clearInput = function () {
                        _cleanPromoCodeStatus();
                        scope.d.promoCode = '';
                    };

                    scope.d.keyDownHandler = function ($event, promoCode) {
                        if ($event.keyCode !== ENTER_KEY_CODE) {
                            _cleanPromoCodeStatus();
                            return;
                        }
                        scope.d.sendPromoCode(promoCode);
                    };

                    var promoCodeToUpdate = PromoCodeSrv.getPromoCodeToUpdate();  // restore promo code (if was entered) between login view and sign up view.
                    if (promoCodeToUpdate) {
                        scope.d.promoCode = promoCodeToUpdate;
                        scope.d.sendPromoCode(promoCodeToUpdate);
                    }

                    function _cleanPromoCodeStatus() {
                        scope.d.promoCodeStatus = -1;
                        scope.d.promoCodeStatusText = '';
                    }
                }
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').service('PromoCodeTypeEnum',['EnumSrv',
        function(EnumSrv) {

            var PromoCodeTypeEnum = new EnumSrv.BaseEnum([
                ['FREE_LICENSE', 1, 'free license'],
                ['ZINKERZ_EDUCATOR', 2, 'zinkerz educator'],
            ]);

            return PromoCodeTypeEnum;
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').constant('PROMO_CODE_STATUS', {
        accepted: 0,
        invalid: 1
    });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.promoCode').provider('PromoCodeSrv',
        function () {
            var backendData = {};

            this.setBackendData = function (_backendData) {
                backendData = _backendData;
            };

            this.$get = ["PROMO_CODE_STATUS", "$translate", "$http", "PromoCodeTypeEnum", function (PROMO_CODE_STATUS, $translate, $http, PromoCodeTypeEnum) {
                'ngInject';

               var promoCodeSrv = {};

                var promoCodeStatus;
                var INVALID = 'PROMO_CODE.INVALID_CODE';
                var promoCodeCheckBaseUrl = '%backendEndpoint%/promoCode/check';
                var promoCodeUpdateBaseUrl = '%backendEndpoint%/promoCode/update';
                var promoCodeToUpdate;

                var promoCodeStatusText = {};
                promoCodeStatusText[PromoCodeTypeEnum.FREE_LICENSE.enum] = 'PROMO_CODE.PROMO_CODE_ACCEPTED';
                promoCodeStatusText[PromoCodeTypeEnum.ZINKERZ_EDUCATOR.enum] = 'PROMO_CODE.ZINKERZ_EDUCATORS_PROMO_CODE_ACCEPTED';
                promoCodeStatusText[INVALID] = INVALID;

                promoCodeSrv.checkPromoCode = function (promoCode, appContext) {
                    var firebaseAppScopeName =  backendData[appContext].firebaseAppScopeName;
                    var backendEndpointUrl = backendData[appContext].backendEndpoint;

                    var promoCodeCheckUrl = promoCodeCheckBaseUrl;
                    promoCodeCheckUrl = promoCodeCheckUrl.replace('%backendEndpoint%', backendEndpointUrl);

                    var dataToSend = {
                        promoCode: promoCode,
                        appName: firebaseAppScopeName
                    };
                    return $http.post(promoCodeCheckUrl, dataToSend).then(_validPromoCode, _invalidPromoCode);
                };

                promoCodeSrv.promoCodeToUpdate = function (promoCode) {
                    promoCodeToUpdate = promoCode;
                };

                promoCodeSrv.getPromoCodeToUpdate = function () {
                    return promoCodeToUpdate;
                };

                promoCodeSrv.updatePromoCode = function (uid, promoCode, appContext) {
                    var firebaseAppScopeName =  backendData[appContext].firebaseAppScopeName;
                    var backendEndpointUrl = backendData[appContext].backendEndpoint;

                    var promoCodeUpdatekUrl = promoCodeUpdateBaseUrl;
                    promoCodeUpdatekUrl = promoCodeUpdatekUrl.replace('%backendEndpoint%', backendEndpointUrl);
                    var dataToSend = {
                        appName: firebaseAppScopeName,
                        uid: uid,
                        promoCode: promoCode
                    };
                    return $http.post(promoCodeUpdatekUrl, dataToSend);
                };

                function _validPromoCode(response) {
                    promoCodeStatus = {};
                    var promoCodeType = response.data;
                    if (response.data && promoCodeStatusText[promoCodeType]) {
                        promoCodeStatus.text = _getPromoCodeStatusText(response.data);
                        promoCodeStatus.status = PROMO_CODE_STATUS.accepted;
                    } else {
                        promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                        promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                    }
                    return promoCodeStatus;
                }

                function _invalidPromoCode() {
                    promoCodeStatus = {};
                    promoCodeStatus.text = _getPromoCodeStatusText(INVALID);
                    promoCodeStatus.status = PROMO_CODE_STATUS.invalid;
                    return promoCodeStatus;
                }

                function _getPromoCodeStatusText(translationKey) {
                    return $translate.instant(promoCodeStatusText[translationKey]);
                }

                return promoCodeSrv;
            }];
        }
    );
})(angular);

angular.module('znk.infra-web-app.promoCode').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/promoCode/svg/arrow-icon.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    version=\"1.1\" id=\"Capa_1\" x=\"0px\" y=\"0px\"\n" +
    "    viewBox=\"0 0 611.987 611.987\"\n" +
    "    xml:space=\"preserve\">\n" +
    "    <style>\n" +
    "        svg{\n" +
    "        width:30px;\n" +
    "        height:20px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g id=\"arrow-R\">\n" +
    "		<g>\n" +
    "			<path d=\"M604.652,287.018c-0.532-0.532-1.225-0.692-1.757-1.171L417.717,100.668c-10.329-10.329-27.074-10.329-37.377,0     c-10.328,10.329-10.328,27.074,0,37.376l141.334,141.333H26.622C11.926,279.377,0,291.304,0,306     c0,14.694,11.926,26.621,26.622,26.621h495.052L380.341,473.954c-10.329,10.329-10.329,27.074,0,37.376     c10.329,10.303,27.073,10.329,37.376,0l185.232-185.258c0.532-0.453,1.197-0.612,1.703-1.092c0.825-0.825,0.825-1.97,1.518-2.875     c2.263-2.796,3.86-5.856,4.818-9.158c0.346-1.277,0.586-2.396,0.719-3.7C612.799,301.34,610.749,293.087,604.652,287.018z\" fill=\"#FFFFFF\"/>\n" +
    "		</g>\n" +
    "	</g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/promoCode/svg/close-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\" class=\"close-pop-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.close-pop-svg {width: 100%; height: auto;}\n" +
    "	.close-pop-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.close-pop-svg .st1{fill:none;stroke:#ffffff;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/promoCode/svg/correct-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     class=\"correct-icon-svg\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 188.5 129\"\n" +
    "     style=\"enable-background:new 0 0 188.5 129;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.correct-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "        stroke: #231F20;\n" +
    "        stroke-width: 15;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"7.5\" y1=\"62\" x2=\"67\" y2=\"121.5\"/>\n" +
    "	<line class=\"st0\" x1=\"67\" y1=\"121.5\" x2=\"181\" y2=\"7.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase',
        [
            'ngAnimate',
            'ui.router',
            'ngMaterial',
            'pascalprecht.translate',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'znk.infra.enum',
            'znk.infra.config',
            'znk.infra.storage',
            'znk.infra.auth',
            'znk.infra.analytics'
        ]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .component('purchaseBtn', {
            bindings: {
                purchaseState: '='
            },
            templateUrl:  'components/purchase/components/purchaseBtn/purchaseBtn.template.html',
            controllerAs: 'vm',
            controller: ["$scope", "ENV", "$q", "$sce", "AuthService", "$location", "purchaseService", "$timeout", "$filter", "PurchaseStateEnum", "$log", "znkAnalyticsSrv", function ($scope, ENV, $q, $sce, AuthService, $location, purchaseService, $timeout,
                                  $filter, PurchaseStateEnum, $log, znkAnalyticsSrv) {
                'ngInject';

                var vm = this;

                vm.showForm = false;
                vm.translate = $filter('translate');

                vm.saveAnalytics = function () {
                    vm.purchaseState = PurchaseStateEnum.PENDING.enum;
                    znkAnalyticsSrv.eventTrack({ eventName: 'purchaseOrderStarted' });
                };

                $scope.$watch(function () {
                    return vm.purchaseState;
                }, function (newPurchaseState) {
                    if (angular.isUndefined(newPurchaseState)) {
                        return;
                    }

                    if (newPurchaseState === PurchaseStateEnum.NONE.enum) {
                        buildForm();
                    }

                    if (newPurchaseState === PurchaseStateEnum.PRO.enum) {
                        $q.when(purchaseService.getPurchaseData()).then(function (purchaseData) {
                            if (!angular.equals(purchaseData, {})){
                                vm.upgradeDate = $filter('date')(purchaseData.creationTime, 'mediumDate');
                            }
                        });
                    }
                });

                function buildForm() {
                    $q.all([AuthService.getAuth(), purchaseService.getProduct()]).then(function (results) {
                        var userEmail = results[0].auth.email;
                        var userId = results[0].auth.uid;
                        var productId = results[1].id;

                        if (!userEmail) {
                            $log.error('Invalid user attribute: userEmail is not defined, generating uid email');
                            userEmail = userId + '@zinkerz.com';
                        }

                        if (userEmail && userId) {
                            vm.userEmail = userEmail;
                            vm.hostedButtonId = ENV.purchasePaypalParams.hostedButtonId;
                            vm.custom = userId + '#' + productId + '#' + ENV.fbDataEndPoint + '#' + ENV.firebaseAppScopeName;  // userId#productId#dataEndPoint#appName
                            vm.returnUrlSuccess = buildReturnUrl('purchaseSuccess', '1');
                            vm.returnUrlFailed = buildReturnUrl('purchaseSuccess', '0');
                            vm.formAction = trustSrc(ENV.purchasePaypalParams.formAction);
                            vm.btnImgSrc = trustSrc(ENV.purchasePaypalParams.btnImgSrc);
                            vm.pixelGifSrc = trustSrc(ENV.purchasePaypalParams.pixelGifSrc);
                            vm.showForm = true;
                        } else {
                            /**
                             * if case of failure
                             * TODO: Add atatus notification
                             */
                            $log.error('Invalid user attributes: userId or userEmail are not defined, cannot build purchase form');
                        }
                    });
                }

                vm.showPurchaseError = function () {
                    purchaseService.hidePurchaseDialog().then(function () {
                        purchaseService.showPurchaseError();
                    });
                };

                function buildReturnUrl(param, val) {
                    return $location.absUrl().split('?')[0] + addUrlParam($location.search(), param, val);
                }

                // http://stackoverflow.com/questions/21292114/external-resource-not-being-loaded-by-angularjs
                // in order to use src and action attributes that link to external url's,
                // you should whitelist them
                function trustSrc(src) {
                    return $sce.trustAsResourceUrl(src);
                }

                function addUrlParam(searchObj, key, val) {
                    var search = '';
                    if (!angular.equals(searchObj, {})) {
                        search = '?';
                        // parse the search attribute as a string
                        angular.forEach(searchObj, function (v, k) {
                            search += k + '=' + v;
                        });
                    }

                    var newParam = key + '=' + val,
                        urlParams = '?' + newParam;
                    if (search) {
                        urlParams = search.replace(new RegExp('[\?&]' + key + '[^&]*'), '$1' + newParam);
                        if (urlParams === search) {
                            urlParams += '&' + newParam;
                        }
                    }
                    return urlParams;
                }
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "PURCHASE_POPUP": {
                            "GET_ZINKERZ": "Zinkerz ",
                            "PRO": "Pro",
                            "DESCRIPTION": "Get the most out of Zinkerz",
                            "BULLET1": "Full TOEFL® Practice Tests",
                            "BULLET2": "Personalized Workouts",
                            "BULLET3": "2000+ Practice Questions",
                            "BULLET4": "Estimated Score",
                            "BULLET5": "Unlimited lifetime access",
                            "SAVE": "(save {{percent}})",
                            "UPGRADE_NOW": "Upgrade Now",
                            "UPGRADED_ON": "Upgraded on {{upgradeDate}}",
                            "UPGRADE_PENDING": "Processing payment...",
                            "UPGRADE_ERROR_POPUP_TITLE": "Purchase Error",
                            "UPGRADE_ERROR_POPUP_CONTENT": "There has been a problem with the purchase process, please refresh the page and try again",
                            "PAYPAL_IMG_ALT": "PayPal - The safer, easier way to pay online!",
                            "PURCHASE_NUDGE_MESSAGE_ALL_FREE_CONTENT": "You've completed all free workouts. It's time to upgrade.",
                            "PURCHASE_NUDGE_MESSAGE_ACTION_ALL_FREE_CONTENT": "Lets do it!",
                            "PURCHASE_NUDGE_MESSAGE_FIRST_WORKOUT": "Workout {{num}} completed! Upgrade to Zinkerz PRO to get everything you need to ace the TOEFL text.",
                            "PURCHASE_NUDGE_MESSAGE_ACTION_FIRST_WORKOUT": "Lets do it!"
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .config(
            ["SvgIconSrvProvider", function (SvgIconSrvProvider) {
                'ngInject';
                var svgMap = {
                    'purchase-check-mark': 'components/purchase/svg/check-mark-icon.svg',
                    'purchase-close-popup': 'components/purchase/svg/purchase-close-popup.svg',
                    'purchase-popup-bullet-1-icon': 'components/purchase/svg/purchase-popup-bullet-1-icon.svg',
                    'purchase-popup-bullet-2-icon': 'components/purchase/svg/purchase-popup-bullet-2-icon.svg',
                    'purchase-popup-bullet-3-icon': 'components/purchase/svg/purchase-popup-bullet-3-icon.svg',
                    'purchase-popup-bullet-4-icon': 'components/purchase/svg/purchase-popup-bullet-4-icon.svg',
                    'purchase-popup-bullet-5-icon': 'components/purchase/svg/purchase-popup-bullet-5-icon.svg',
                    'purchase-raccoon-logo-icon': 'components/purchase/svg/raccoon-logo.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase')
        .controller('PurchaseDialogController',
            ["$mdDialog", "purchaseService", "PurchaseStateEnum", "ENV", "$scope", "$timeout", function($mdDialog, purchaseService, PurchaseStateEnum, ENV, $scope, $timeout) {
                'ngInject';

                var vm = this;
                var pendingPurchaseProm = purchaseService.getPendingPurchase();
                vm.purchaseData = {};
                vm.purchaseStateEnum = PurchaseStateEnum;
                vm.appName = ENV.firebaseAppScopeName.split('_')[0].toUpperCase();
                vm.purchaseState = pendingPurchaseProm ? PurchaseStateEnum.PENDING.enum : PurchaseStateEnum.NONE.enum;

                purchaseService.getPurchaseData().then(function (purchaseData) {
                    vm.purchaseData = purchaseData;
                });

                $scope.$watch('vm.purchaseData', function (newPurchaseState) {
                    $timeout(function () {
                        var hasProVersion = !(angular.equals(newPurchaseState, {}));
                        if (hasProVersion){
                            vm.purchaseState = PurchaseStateEnum.PRO.enum;
                        }
                    });
                }, true);

                purchaseService.getProduct().then(function (productPrice) {
                    vm.productPrice = +productPrice.price;
                    vm.productPreviousPrice = +productPrice.previousPrice;
                    vm.productDiscountPercentage = Math.floor(100 - ((vm.productPrice / vm.productPreviousPrice) * 100)) + '%';
                });


                vm.close = function () {
                    $mdDialog.cancel();
                };
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('PurchaseStateEnum',['EnumSrv',
        function(EnumSrv) {

            var PurchaseStateEnum = new EnumSrv.BaseEnum([
                ['PENDING', 'pending', 'pending'],
                ['PRO', 'pro', 'pro'],
                ['NONE', 'none', 'none']
            ]);

            return PurchaseStateEnum;
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.purchase').service('purchaseService',
        ["$rootScope", "$state", "$q", "$mdDialog", "$filter", "InfraConfigSrv", "ENV", "$log", "$mdToast", "$window", "PopUpSrv", "znkAnalyticsSrv", "StorageSrv", "AuthService", function ($rootScope, $state, $q, $mdDialog, $filter, InfraConfigSrv, ENV, $log, $mdToast, $window,
                  PopUpSrv, znkAnalyticsSrv, StorageSrv, AuthService) {
            'ngInject';

            function getPath(param) {
                if (!authData) {
                    $log.error('Invalid user');
                    return;
                }
                var path;
                switch (param) {
                    case 'purchase':
                        path = StorageSrv.variables.appUserSpacePath + '/' + 'purchase';
                        return path.replace('$$uid', '' + authData.uid);
                    case 'pending':
                        path = 'pendingPurchases/' + StorageSrv.variables.uid;
                        return path.replace('$$uid', '' + authData.uid);
                    default:
                        return;
                }

            }

            var self = this;

            var studentStorageProm = InfraConfigSrv.getStudentStorage();
            var pendingPurchaseDefer;
            var authData = AuthService.getAuth();
            var purchasePath = getPath('purchase');
            var pendingPurchasesPath = getPath('pending');

            self.checkUrlParams = function (params) {
                if (!angular.equals(params, {}) && params.purchaseSuccess) {
                    if (+params.purchaseSuccess === 1) {
                        self.setPendingPurchase();
                        znkAnalyticsSrv.eventTrack({eventName: 'purchaseOrderPending'});
                    } else {
                        znkAnalyticsSrv.eventTrack({eventName: 'purchaseOrderCancelled'});
                    }
                    self.showPurchaseDialog();
                } else {
                }
            };

            self.getProduct = function () {
                var productDataPath = 'iap/desktop/allContent';
                return studentStorageProm.then(function (studentStorage) {
                    return studentStorage.get(productDataPath);
                });
            };

            self.hasProVersion = function () {
                return self.getPurchaseData().then(function (purchaseData) {
                    return !angular.equals(purchaseData, {});
                });
            };

            self.getPurchaseData = function () {
                if (purchasePath) {
                    return studentStorageProm.then(function (studentStorage) {
                        return studentStorage.getAndBindToServer(purchasePath);
                    });
                } else {
                    return $q.reject();
                }
            };

            self.checkPendingStatus = function () {
                return studentStorageProm.then(function (studentStorage) {
                    return studentStorage.get(pendingPurchasesPath).then(function (pendingObj) {
                        var isPending = !angular.equals(pendingObj, {});
                        if (isPending) {
                            pendingPurchaseDefer = $q.defer();
                        }
                        return isPending;
                    });
                });
            };

            self.setPendingPurchase = function () {
                pendingPurchaseDefer = $q.defer();
                return $q.all([self.getProduct(), self.hasProVersion(), studentStorageProm]).then(function (res) {
                    var product = res[0];
                    var isPurchased = res[1];
                    var studentStorage = res[2];

                    if (!isPurchased) {
                        var pendingPurchaseVal = {
                            id: product.id,
                            purchaseTime: StorageSrv.variables.currTimeStamp
                        };
                        studentStorage.set(pendingPurchasesPath, pendingPurchaseVal);
                    } else {
                        znkAnalyticsSrv.eventTrack({
                            eventName: 'purchaseOrderCompleted', props: product
                        });
                        if ($window.fbq) {
                            $window.fbq('track', 'Purchase', {
                                value: product.price,
                                currency: 'USD'
                            });
                        }
                    }
                }).catch(function (err) {
                    $log.error('setPendingPurchase promise failed', err);
                    pendingPurchaseDefer.reject(err);
                });
            };

            self.removePendingPurchase = function () {
                if (pendingPurchaseDefer) {
                    pendingPurchaseDefer.resolve();
                }
                studentStorageProm.then(function (studentStorage) {
                    return studentStorage.set(pendingPurchasesPath, null);
                });
            };

            self.listenToPurchaseStatus = function () {
                self.hasProVersion().then(function (hasPro) {
                    if (hasPro) {
                        self.removePendingPurchase();
                    }
                });
            };

            self.showPurchaseDialog = function () {
                znkAnalyticsSrv.eventTrack({
                    eventName: 'purchaseModalOpened'
                });
                return $mdDialog.show({
                    controller: 'PurchaseDialogController',
                    templateUrl: 'components/purchase/templates/purchasePopup.template.html',
                    disableParentScroll: false,
                    clickOutsideToClose: true,
                    fullscreen: false,
                    controllerAs: 'vm'
                });
            };

            self.hidePurchaseDialog = function () {
                return $mdDialog.hide();
            };

            self.showPurchaseError = function () {
                var popUpTitle = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_TITLE');
                var popUpContent = $filter('translate')('PURCHASE_POPUP.UPGRADE_ERROR_POPUP_CONTENT');
                PopUpSrv.error(popUpTitle, popUpContent);
            };

            self.getPendingPurchase = function () {
                return pendingPurchaseDefer && pendingPurchaseDefer.promise;
            };

            self.setProductDataOnce = function () {
                var path = 'iap/desktop/allContent';
                var productData = {
                    alias: 'allContent',
                    id: 'com.zinkerz.act.allcontent',
                    type: 'non consumable',
                    price: '39.99',
                    previousPrice: '44.99'
                };

                studentStorageProm.then(function (studentStorage) {
                    studentStorage.set(path, productData).then(function (resp) {
                        $log.debug(resp);
                    }).catch(function (err) {
                        $log.debug(err);
                    });
                });
            };

            /**
             * @param mode:
             *  1 - completed first workout
             *  2 - completed all free content
             */
            self.openPurchaseNudge = function (mode, num) {
                if (true) {
                    return;  // todo - temporary removed because the style is broken
                } else {
                    var toastTemplate =
                        '<md-toast class="purchase-nudge" ng-class="{first: vm.mode === 1, all: vm.mode === 2}" translate-namespace="PURCHASE_POPUP">' +
                        '<div class="md-toast-text" flex>' +
                        '<div class="close-toast cursor-pointer" ng-click="vm.closeToast()"><svg-icon name="purchase-close-popup"></svg-icon></div>' +
                        '<span translate="{{vm.nudgeMessage}}" translate-values="{num: {{vm.num}} }"></span> ' +
                        '<span class="open-dialog" ng-click="vm.showPurchaseDialog()"><span translate="{{vm.nudgeAction}}"></span></span>' +
                        '</div>' +
                        '</md-toast>';

                    $mdToast.show({
                        template: toastTemplate,
                        position: 'top',
                        hideDelay: false,
                        controller: function () {
                            this.num = num;
                            this.node = mode;
                            this.closeToast = function () {
                                $mdToast.hide();
                            };

                            this.showPurchaseDialog = self.showPurchaseDialog; // todo - check if it's working

                            if (mode === 1) { // completed first workout
                                this.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_FIRST_WORKOUT';
                                this.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_FIRST_WORKOUT';
                            } else if (mode === 2) { // completed all free content
                                this.nudgeMessage = '.PURCHASE_NUDGE_MESSAGE_ALL_FREE_CONTENT';
                                this.nudgeAction = '.PURCHASE_NUDGE_MESSAGE_ACTION_ALL_FREE_CONTENT';
                            }
                            this.mode = mode;
                            this.num = num;
                        },
                        controllerAs: 'vm'
                    });
                }

            };
        }]
    );
})(angular);


angular.module('znk.infra-web-app.purchase').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/purchase/components/purchaseBtn/purchaseBtn.template.html",
    "<ng-switch on=\"vm.purchaseState\">\n" +
    "\n" +
    "    <div ng-switch-when=\"pending\">\n" +
    "        <div class=\"upgraded flex-container\">\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"pending\">\n" +
    "                    <md-progress-circular md-mode=\"indeterminate\" md-diameter=\"45\"></md-progress-circular>\n" +
    "                    <span class=\"text\" translate=\".UPGRADE_PENDING\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"pro\">\n" +
    "        <div class=\"upgraded flex-container\">\n" +
    "            <div class=\"flex-item\">\n" +
    "                <div class=\"icon-wrapper completed\">\n" +
    "                    <svg-icon name=\"purchase-check-mark\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span class=\"text\" translate=\".UPGRADED_ON\" translate-values=\"{upgradeDate: vm.upgradeDate}\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-switch-when=\"none\">\n" +
    "        <ng-switch on=\"vm.showForm\">\n" +
    "            <div ng-switch-when=\"true\">\n" +
    "                <form\n" +
    "                    action=\"{{::vm.formAction}}\"\n" +
    "                    method=\"post\"\n" +
    "                    target=\"_top\">\n" +
    "                    <input type=\"hidden\" name=\"cmd\" value=\"_s-xclick\">\n" +
    "                    <input type=\"hidden\" name=\"hosted_button_id\" ng-value=\"::vm.hostedButtonId\">\n" +
    "                    <input type=\"hidden\" name=\"custom\" ng-value=\"::vm.custom\">\n" +
    "                    <input type=\"hidden\" name=\"return\" ng-value=\"::vm.returnUrlSuccess\">\n" +
    "                    <input type=\"hidden\" name=\"cancel_return\" ng-value=\"::vm.returnUrlFailed\">\n" +
    "                    <input type=\"hidden\" name=\"landing_page\" value=\"billing\">\n" +
    "                    <input type=\"hidden\" name=\"email\" ng-value=\"::vm.userEmail\">\n" +
    "                    <div class=\"upgrade-btn-wrapper\">\n" +
    "                        <button class=\"md-button success drop-shadow inline-block\"\n" +
    "                                ng-click=\"vm.saveAnalytics()\"\n" +
    "                                translate=\".UPGRADE_NOW\"\n" +
    "                                name=\"submit\">\n" +
    "                        </button>\n" +
    "                    </div>\n" +
    "                    <!--<input type=\"image\" src=\"{{vm.btnImgSrc}}\" border=\"0\" name=\"submit\" alt=\"PayPal - The safer, easier way to pay online!\">-->\n" +
    "                    <img border=\"0\" ng-src=\"{{::vm.pixelGifSrc}}\" width=\"1\" height=\"1\" alt=\"{{vm.translate('PURCHASE_POPUP.PAYPAL_IMG_ALT')}}\" >\n" +
    "                </form>\n" +
    "            </div>\n" +
    "            <div class=\"upgrade-btn-wrapper\" ng-switch-default>\n" +
    "                <button class=\"md-button success drop-shadow\"\n" +
    "                        ng-click=\"vm.showPurchaseError()\"\n" +
    "                        translate=\".UPGRADE_NOW\"\n" +
    "                        name=\"submit\">\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </ng-switch>\n" +
    "    </div>\n" +
    "</ng-switch>\n" +
    "");
  $templateCache.put("components/purchase/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"purchase-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .purchase-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/previous-icon.svg",
    "<svg class=\"previous-icon\" x=\"0px\" y=\"0px\" viewBox=\"-406.9 425.5 190.9 175.7\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <circle cx=\"-402.8\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"513\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"479.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"479.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"462.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"463.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"446.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"479.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"547\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"446.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"429.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"463.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"496.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"479.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"530.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"563.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"546.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"597.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"529.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"512.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"513.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-close-popup.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\" class=\"close-pop-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.close-pop-svg {width: 100%; height: auto;}\n" +
    "	.close-pop-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.close-pop-svg .st1{fill:none;stroke:#ffffff;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-1-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 117.5 141\"\n" +
    "    class=\"purchase-popup-bullet-1-icon\">\n" +
    "    <style>\n" +
    "        .purchase-popup-bullet-1-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<path class=\"st0\" d=\"M107.2,139h-97c-4.5,0-8.3-3.7-8.3-8.3V10.3C2,5.7,5.7,2,10.3,2h97c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "	C115.5,135.3,111.8,139,107.2,139z\"/>\n" +
    "<line class=\"st0\" x1=\"19\" y1=\"26.5\" x2=\"96\" y2=\"26.5\"/>\n" +
    "<line class=\"st0\" x1=\"19\" y1=\"44.7\" x2=\"70.5\" y2=\"44.7\"/>\n" +
    "<line class=\"st0\" x1=\"48.5\" y1=\"62.9\" x2=\"96\" y2=\"62.9\"/>\n" +
    "<line class=\"st0\" x1=\"22.5\" y1=\"81.1\" x2=\"96\" y2=\"81.1\"/>\n" +
    "<line class=\"st0\" x1=\"22.5\" y1=\"99.3\" x2=\"59.2\" y2=\"99.3\"/>\n" +
    "<line class=\"st0\" x1=\"72.2\" y1=\"99.3\" x2=\"94.2\" y2=\"99.3\"/>\n" +
    "<line class=\"st0\" x1=\"22\" y1=\"117.5\" x2=\"95.5\" y2=\"117.5\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-2-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 124 141\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"purchase-popup-bullet-2-icon\">\n" +
    "    <style>\n" +
    "        .purchase-popup-bullet-2-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-2-icon .st1{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-2-icon .st2{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M77.7,139H16.8c-4.5,0-8.3-3.7-8.3-8.3V10.3c0-4.5,3.7-8.3,8.3-8.3h60.9c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "		C85.9,135.3,82.2,139,77.7,139z\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"21.2\" x2=\"17\" y2=\"21.2\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"40.9\" x2=\"17\" y2=\"40.9\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"60.6\" x2=\"17\" y2=\"60.6\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"80.4\" x2=\"17\" y2=\"80.4\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"100.1\" x2=\"17\" y2=\"100.1\"/>\n" +
    "	<line class=\"st1\" x1=\"2\" y1=\"119.8\" x2=\"17\" y2=\"119.8\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st2\" d=\"M122,2v116l-7.3,21l-8.7-20.1V24.5V7.2c0,0,1-5.2,6.6-5.2S122,2,122,2z\"/>\n" +
    "		<line class=\"st2\" x1=\"106\" y1=\"21.7\" x2=\"122\" y2=\"21.7\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-3-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 117.5 141\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    class=\"purchase-popup-bullet-3-icon\">\n" +
    "    <style>\n" +
    "\n" +
    "        .purchase-popup-bullet-3-icon .st0{fill:none;stroke:#000000;stroke-width:4;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-3-icon .st1{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-3-icon .st2{fill:none;stroke:#000000;stroke-width:4;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M107.2,139h-97c-4.5,0-8.3-3.7-8.3-8.3V10.3C2,5.7,5.7,2,10.3,2h97c4.5,0,8.3,3.7,8.3,8.3v120.5\n" +
    "		C115.5,135.3,111.8,139,107.2,139z\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st1\" d=\"M39.6,54.6c4.4-5.7,11.7-9.2,19.7-8.2c9.7,1.2,17.4,9.1,18.4,18.7c1.2,11-5.9,20.6-15.9,23.1\n" +
    "			c-3.1,0.8-5.3,3.7-5.3,6.9v8.6\"/>\n" +
    "		<circle cx=\"56.5\" cy=\"116.7\" r=\"2.8\"/>\n" +
    "	</g>\n" +
    "	<line class=\"st2\" x1=\"32.7\" y1=\"34.2\" x2=\"25.7\" y2=\"21.6\"/>\n" +
    "	<line class=\"st2\" x1=\"84.8\" y1=\"34.2\" x2=\"91.8\" y2=\"21.6\"/>\n" +
    "	<line class=\"st2\" x1=\"59.3\" y1=\"29.5\" x2=\"59.3\" y2=\"18.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-4-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 208.1 203\" class=\"purchase-popup-bullet-4-icon\">\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .purchase-popup-bullet-4-icon .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .purchase-popup-bullet-4-icon .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .purchase-popup-bullet-4-icon .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M104.2,3h74c0,0-8.8,65.7-14.7,82.9c-5.3,15.6-13,32.6-36.7,43.2c-12.3,5.5-10.3,21.7-10.3,31.5\n" +
    "		c0,11.2,5.4,16.7,13.3,20.4c3.7,1.7,8.3,3.2,14.3,4v15h-40\"/>\n" +
    "        <path class=\"st0\" d=\"M104.2,3h-74c0,0,8.8,65.7,14.7,82.9c5.3,15.6,13,32.6,36.7,43.2c12.3,5.5,10.3,21.7,10.3,31.5\n" +
    "		c0,11.2-5.4,16.7-13.3,20.4c-3.7,1.7-8.3,3.2-14.3,4v15h40\"/>\n" +
    "    </g>\n" +
    "    <path class=\"st1\" d=\"M176.8,20.4c0,0,71.3-1.5-12.2,67.5\"/>\n" +
    "    <path class=\"st1\" d=\"M31.3,20.4c0,0-71.3-1.5,12.2,67.5\"/>\n" +
    "    <polygon class=\"st1\" points=\"102.6,22 113.1,43.4 136.6,46.8 119.6,63.4 123.6,86.9 102.6,75.8 81.5,86.9 85.5,63.4 68.5,46.8\n" +
    "	92,43.4 \"/>\n" +
    "    <line class=\"st2\" x1=\"66.6\" y1=\"193.9\" x2=\"143.6\" y2=\"193.9\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/purchase-popup-bullet-5-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    viewBox=\"0 0 148.7 174.7\"\n" +
    "    style=\"enable-background:new 0 0 148.7 174.7;\"\n" +
    "    class=\"purchase-popup-bullet-5-icon\">\n" +
    "    <style>\n" +
    "\n" +
    "        .purchase-popup-bullet-5-icon .st0{fill:none;stroke:#231F20;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "        .purchase-popup-bullet-5-icon .st1{fill:none;stroke:#231F20;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M93.4,171.7H12.6c-5.3,0-9.6-4.3-9.6-9.6V81.3c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,167.4,98.7,171.7,93.4,171.7z\"/>\n" +
    "	<path class=\"st0\" d=\"M78.7,71.7V39.9C78.7,19.6,93.8,3,112.2,3h0c18.4,0,33.5,16.6,33.5,36.9v31.9\"/>\n" +
    "	<path class=\"st1\" d=\"M53.2,101c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,106.1,47.1,101,53.2,101\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/svg/raccoon-logo.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 237 158\"\n" +
    "    class=\"raccoon-logo-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .raccoon-logo-svg .circle{fill:#000001;}\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"circle\" cx=\"175\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M118.5,155.9c10.2,0,18.5-8.3,18.5-18.5c0-10.2-8.3-18.5-18.5-18.5c-10.2,0-18.5,8.3-18.5,18.5\n" +
    "		C100,147.6,108.3,155.9,118.5,155.9z\"/>\n" +
    "        <path class=\"circle\" d=\"M172.4,67.5c-15.8-9.7-34.3-15.3-53.9-15.3c-19.6,0-38.2,5.5-53.9,15.3\n" +
    "		c13,1.3,23.1,12.3,23.1,25.6c0,1.8-0.2,3.5-0.5,5.1c9.3-5.2,20-8.1,31.3-8.1c11.3,0,22,2.9,31.4,8.1c-0.3-1.7-0.5-3.4-0.5-5.1\n" +
    "		C149.3,79.8,159.5,68.8,172.4,67.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M36.3,93.5c-8,10.8-14,23.4-17.4,37.2c-1.2,4.9-0.4,10,2.3,14.3c2.6,4.3,6.8,7.3,11.7,8.5\n" +
    "		c1.5,0.4,3,0.5,4.5,0.5c8.8,0,16.3-6,18.4-14.5c1.8-7.7,5-14.7,9.2-20.9c-1,0.1-2,0.2-3,0.2C47.9,118.8,36.5,107.5,36.3,93.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M232.2,92.5c0.6-6.7,6.5-78-4.5-88.4c-9.5-9.1-60.3,16-77.5,24.9\n" +
    "		C185.3,37.8,215,60.9,232.2,92.5z\"/>\n" +
    "        <circle class=\"circle\" cx=\"62\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M204.1,153.6c10.2-2.4,16.4-12.7,14-22.8c-3.3-13.8-9.3-26.4-17.4-37.2\n" +
    "		c-0.2,14-11.6,25.3-25.7,25.3c-1,0-2-0.1-3-0.2c4.2,6.2,7.4,13.3,9.2,21c2,8.6,9.6,14.5,18.4,14.5\n" +
    "		C201.1,154.1,202.6,153.9,204.1,153.6\"/>\n" +
    "        <path class=\"circle\" d=\"M86.7,29C69.5,20.1,18.8-5,9.2,4.1c-11,10.4-5.1,81.5-4.5,88.4C22,60.8,51.7,37.8,86.7,29z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/purchase/templates/purchasePopup.template.html",
    "<md-dialog class=\"purchase-popup base-border-radius\" aria-label=\"Get Zinkerz\" translate-namespace=\"PURCHASE_POPUP\">\n" +
    "    <div class=\"purchase-popup-container\">\n" +
    "        <div class=\"popup-header\">\n" +
    "            <div class=\"raccoon\">\n" +
    "                <svg-icon name=\"purchase-raccoon-logo-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <div class=\"close-popup-wrap\">\n" +
    "                <svg-icon name=\"purchase-close-popup\" ng-click=\"vm.close()\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <h2>\n" +
    "                    <span translate=\".GET_ZINKERZ\"></span>\n" +
    "                    <span class=\"pill pro\" translate=\".PRO\"></span>\n" +
    "                </h2>\n" +
    "                <p translate=\".DESCRIPTION\"></p>\n" +
    "                <div class=\"features-box base-border-radius\">\n" +
    "                    <ul>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-1-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET1\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-2-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET2\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-3-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET3\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-4-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET4\"></span>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <div class=\"bullet\">\n" +
    "                                <svg-icon name=\"purchase-popup-bullet-5-icon\"></svg-icon>\n" +
    "                            </div>\n" +
    "                            <span translate=\".BULLET5\"></span>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </div>\n" +
    "                <div class=\"price\" ng-show=\"vm.purchaseState === vm.purchaseStateEnum.NONE.enum\">\n" +
    "                    <del>{{'$' + vm.productPreviousPrice}}</del>\n" +
    "                    <b>{{'$' + vm.productPrice}}</b>\n" +
    "                    <span translate=\".SAVE\" translate-values='{ percent: vm.productDiscountPercentage}'></span>\n" +
    "                </div>\n" +
    "                <div class=\"action\">\n" +
    "                    <purchase-btn purchase-state=\"vm.purchaseState\"></purchase-btn>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.auth',
        'znk.infra.svgIcon',
        'znk.infra.general'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "SETTING": {
                            "CHANGE_PASSWORD": "Change Password",
                            "SAVE": "Save",
                            "OLD_PASSWORD": "Old Password",
                            "NEW_PASSWORD": "New Password",
                            "CONFIRM_NEW_PASSWORD": "Confirm New Password",
                            "REQUIRED_FIELD":"This is required.",
                            "PASSWORD_LENGTH": "Password length must be between 6 to 25 characters.",
                            "PASSWORD_NOT_MATCH": "New Password doesn't match.",
                            "ERROR_OCCURRED": "An error has occurred, Please try again.",
                            "SAVE_SUCCESS": "Your new password has been successfully saved.",
                            "INCORRECT_PASSWORD":"Incorrect password.",
                            "NO_INTERNET_CONNECTION_ERR": "No internet connection. Please try again later.",
                            "DONE": "Done"
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'settings-change-password-icon': 'components/settings/svg/change-password-icon.svg',
                'settings-danger-red-icon': 'components/settings/svg/error-icon.svg',
                'settings-close-popup': 'components/settings/svg/setting-close-popup.svg',
                'settings-completed-v-icon': 'components/settings/svg/completed-v.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings').controller('SettingsChangePasswordController',
            ["AuthService", "$mdDialog", "$timeout", function (AuthService, $mdDialog, $timeout) {
                'ngInject';

                var self = this;
                this.saveTitle = 'SETTING.SAVE';
                this.oldPassError = 'SETTING.REQUIRED_FIELD';
                this.generalError = 'SETTING.ERROR_OCCURRED';
                this.changePasswordData = {};

                self.changePassword = function (authform) {
                    self.showError = self.showSuccess = false;

                    if (self.changePasswordData.newPassword !== self.changePasswordData.newPasswordConfirm) {
                        self.changePasswordData.newPasswordConfirm = undefined;
                        return;
                    }

                    if (!authform.$invalid) {
                        self.startLoader = true;
                        AuthService.changePassword(self.changePasswordData).then(function () {
                            self.fillLoader = true;
                            $timeout(function () {
                                self.startLoader = self.fillLoader = false;
                                self.showSuccess = true;
                                self.saveTitle = 'SETTING.DONE';
                            }, 100);
                        }, function (err) {
                            self.fillLoader = true;

                            $timeout(function () {
                                self.startLoader = self.fillLoader = false;
                                if (err.code === 'INVALID_PASSWORD') {
                                    self.changePasswordData.oldPassword = null;
                                    self.oldPassError = 'SETTING.INCORRECT_PASSWORD';
                                } else if (err.code === 'NETWORK_ERROR') {
                                    self.generalError = 'SETTING.NO_INTERNET_CONNECTION_ERR';
                                    self.showError = true;
                                } else {
                                    self.showError = true;
                                }
                            }, 100);
                        });
                    }
                };

                self.closeDialog = function () {
                    $mdDialog.cancel();
                };
            }]
        );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.settings')
        .service('SettingsSrv',
            ["$mdDialog", function ($mdDialog) {
                'ngInject';

                this.showChangePassword = function () {
                    $mdDialog.show({
                        controller: 'SettingsChangePasswordController',
                        controllerAs: 'vm',
                        templateUrl: 'components/settings/templates/settingsChangePassword.template.html',
                        clickOutsideToClose: true,
                        escapeToClose: true
                    });
                };
            }]
        );
})(angular);

angular.module('znk.infra-web-app.settings').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/settings/svg/change-password-icon.svg",
    "<svg class=\"change-password-icon-wrap\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 75 75\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .change-password-icon-wrap{\n" +
    "            width: 100%;\n" +
    "            height: auto;\n" +
    "        }\n" +
    "    </style>\n" +
    "<path d=\"M52.5,30c-4.1,0-7.5-3.4-7.5-7.5s3.4-7.5,7.5-7.5s7.5,3.4,7.5,7.5S56.6,30,52.5,30z M52.5,0C40.1,0,30,10.1,30,22.5V30L0,60\n" +
    "	v15h15v-7.5h7.5V60H30v-7.5h7.5V45h15C64.9,45,75,34.9,75,22.5S64.9,0,52.5,0z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/settings/svg/completed-v.svg",
    "<svg\n" +
    "	class=\"complete-v-icon-svg\"\n" +
    "	xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "	xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "    x=\"0px\"\n" +
    "	y=\"0px\"\n" +
    "	viewBox=\"-1040 834.9 220.4 220.4\"\n" +
    "	style=\"enable-background:new -1040 834.9 220.4 220.4; width: 100%; height: auto;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.complete-v-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st1 {\n" +
    "        fill: #CACBCC;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st2 {\n" +
    "        display: none;\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st3 {\n" +
    "        fill: #D1D2D2;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st4 {\n" +
    "        fill: none;\n" +
    "        stroke: #FFFFFF;\n" +
    "        stroke-width: 11.9321;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M-401,402.7\"/>\n" +
    "<circle class=\"st1\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<circle class=\"st2\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<path class=\"st3\" d=\"M-860.2,895.8l40,38.1c-5.6-55.6-52.6-99-109.6-99c-60.9,0-110.2,49.3-110.2,110.2\n" +
    "	c0,60.9,49.3,110.2,110.2,110.2c11.6,0,22.8-1.8,33.3-5.1l-61.2-58.3L-860.2,895.8z\"/>\n" +
    "<polyline class=\"st4\" points=\"-996.3,944.8 -951.8,989.3 -863.3,900.8 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/settings/svg/error-icon.svg",
    "<svg\n" +
    "    class=\"settings-error-icon\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 54.8 49.1\">\n" +
    "<path class=\"st0\" d=\"M54,39.8L32.8,3.1C30.4-1,24.4-1,22,3.1L0.8,39.8c-2.4,4.1,0.6,9.3,5.4,9.3h42.4C53.4,49.1,56.4,44,54,39.8z\n" +
    "	 M29.8,42.9c-0.7,0.6-1.5,0.9-2.4,0.9c-0.9,0-1.7-0.3-2.4-0.9s-1-1.4-1-2.5c0-0.9,0.3-1.7,1-2.4s1.5-1,2.4-1s1.8,0.3,2.4,1\n" +
    "	c0.7,0.7,1,1.5,1,2.4C30.8,41.4,30.5,42.2,29.8,42.9z M30.7,17.7l-1,11.2c-0.1,1.3-0.3,2.4-0.7,3.1c-0.3,0.7-0.9,1.1-1.7,1.1\n" +
    "	c-0.8,0-1.4-0.3-1.7-1c-0.3-0.7-0.5-1.7-0.7-3.1l-0.7-10.9C24,15.8,24,14.3,24,13.4c0-1.3,0.3-2.2,1-2.9s1.5-1.1,2.6-1.1\n" +
    "	c1.3,0,2.2,0.5,2.6,1.4c0.4,0.9,0.7,2.2,0.7,3.9C30.8,15.6,30.8,16.6,30.7,17.7z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/settings/svg/setting-close-popup.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\" class=\"settings-close-popup\">\n" +
    "    <style>\n" +
    "        .settings-close-popup{\n" +
    "        width:15px;\n" +
    "        height:15px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/settings/templates/settingsChangePassword.template.html",
    "<md-dialog ng-cloak class=\"setting-change-password\" translate-namespace=\"SETTING\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeDialog()\">\n" +
    "            <svg-icon name=\"settings-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content ng-switch=\"!!vm.showSuccess\">\n" +
    "        <div class=\"main-title md-subheader\" translate=\".CHANGE_PASSWORD\"></div>\n" +
    "        <form name=\"authform\" novalidate class=\"auth-form\" ng-submit=\"vm.changePassword(authform)\" ng-switch-when=\"false\">\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.changePasswordData.oldPassword && authform.$submitted}\">\n" +
    "                <input\n" +
    "                    type=\"password\"\n" +
    "                    autocomplete=\"off\"\n" +
    "                    placeholder=\"{{'SETTING.OLD_PASSWORD' | translate}}\"\n" +
    "                    name=\"oldPassword\"\n" +
    "                    ng-minlength=\"6\"\n" +
    "                    ng-maxlength=\"25\"\n" +
    "                    ng-required=\"true\"\n" +
    "                    ng-model=\"vm.changePasswordData.oldPassword\">\n" +
    "                <div class=\"error-msg\" translate=\"{{vm.oldPassError}}\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.changePasswordData.newPassword && authform.$submitted}\">\n" +
    "                <input\n" +
    "                    type=\"password\"\n" +
    "                    autocomplete=\"off\"\n" +
    "                    placeholder=\"{{'SETTING.NEW_PASSWORD' | translate}}\"\n" +
    "                    name=\"newPassword\"\n" +
    "                    ng-minlength=\"6\"\n" +
    "                    ng-maxlength=\"25\"\n" +
    "                    ng-required=\"true\"\n" +
    "                    ng-model=\"vm.changePasswordData.newPassword\">\n" +
    "                <div class=\"error-msg\" translate=\".PASSWORD_LENGTH\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"znk-input-group\" ng-class=\"{'invalid-input': !vm.changePasswordData.newPasswordConfirm && authform.$submitted}\">\n" +
    "                <input\n" +
    "                    type=\"password\"\n" +
    "                    autocomplete=\"off\"\n" +
    "                    placeholder=\"{{'SETTING.CONFIRM_NEW_PASSWORD' | translate}}\"\n" +
    "                    name=\"newPasswordConfirm\"\n" +
    "                    ng-minlength=\"6\"\n" +
    "                    ng-maxlength=\"25\"\n" +
    "                    ng-required=\"true\"\n" +
    "                    ng-model=\"vm.changePasswordData.newPasswordConfirm\">\n" +
    "                <div class=\"error-msg\" translate=\".PASSWORD_NOT_MATCH\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"btn-wrap\">\n" +
    "                <button\n" +
    "                    class=\"md-button md-primary green znk drop-shadow\"\n" +
    "                    element-loader\n" +
    "                    fill-loader=\"vm.fillLoader\"\n" +
    "                    show-loader=\"vm.startLoader\"\n" +
    "                    bg-loader=\"'#72ab40'\"\n" +
    "                    precentage=\"50\"\n" +
    "                    font-color=\"'#FFFFFF'\"\n" +
    "                    bg=\"'#87ca4d'\">\n" +
    "                   <span translate=\"{{vm.saveTitle}}\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </form>\n" +
    "        <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "            <svg-icon class=\"completed-v-icon-wrap\" name=\"settings-completed-v-icon\"></svg-icon>\n" +
    "            <div translate=\".SAVE_SUCCESS\"></div>\n" +
    "            <div class=\"done-btn-wrap\">\n" +
    "                <md-button class=\"success drop-shadow md-primary green znk\" ng-click=\"vm.closeDialog()\">\n" +
    "                    <span translate=\".DONE\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"msg-wrap\" ng-class=\"{'show-error': vm.showError}\">\n" +
    "            <div class=\"error-msg\">\n" +
    "                <svg-icon name=\"settings-danger-red-icon\" class=\"settings-danger-red-icon\"></svg-icon>\n" +
    "                <div translate=\"{{vm.generalError}}\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"settings-change-password-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.socialSharing', [
        'znk.infra.config' 
    ]);
})(angular);

(function (angular) {
    'use strict';
    
    angular.module('znk.infra-web-app.socialSharing')
        .service('SocialSharingSrv',
            ["StorageSrv", "InfraConfigSrv", "$q", function (StorageSrv, InfraConfigSrv, $q) {
                'ngInject';

                var SOCIAL_SHARING_PATH = StorageSrv.variables.appUserSpacePath + '/socialSharing';

                function _getSocialSharing() {
                    return InfraConfigSrv.getStudentStorage().then(function(StudentStorageSrv){
                        return StudentStorageSrv.get(SOCIAL_SHARING_PATH);
                    });
                }

                this.getSocialSharingData = _getSocialSharing;

                this.setSocialSharingNetwork = function (key, value) {
                    return $q.all([
                        _getSocialSharing(),
                        InfraConfigSrv.getStudentStorage()
                    ]).then(function (res) {
                        var socialSharing = res[0];
                        var studentStorage= res[1];

                        socialSharing[key] = value;
                        return studentStorage.set(SOCIAL_SHARING_PATH, socialSharing);
                    });
                };
            }]
        );
})(angular);

angular.module('znk.infra-web-app.socialSharing').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests', [
        'znk.infra.svgIcon',
        'pascalprecht.translate',
        'ngMaterial',
        'znk.infra.enum',
        'znk.infra.scoring',
        'znk.infra.exams',
        'znk.infra-web-app.diagnostic',
        'znk.infra.analytics',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.estimatedScoreWidget',
        'znk.infra.exerciseUtility',
        'ui.router'
    ]);  
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "NAVIGATION_PANE": {
                            "TEST": "Test {{testNumber}}",
                            "FULL_TEST_TITLE": "Full test",
                            "MINI_TEST_TITLE": "Mini test"
                        }
                    }
                );
            }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tests').directive('navigationPane',
        ["ExamTypeEnum", "ExamSrv", "ExerciseResultSrv", "$q", function (ExamTypeEnum, ExamSrv, ExerciseResultSrv, $q) {
            'ngInject';
            return {
                scope: {},
                restrict: 'E',
                templateUrl: 'components/tests/templates/navigationPane.template.html',
                require: '?ngModel',
                link: function (scope, element, attributes, ngModelCtrl) {

                    scope.vm = {};

                    scope.vm.ExamTypeEnum = ExamTypeEnum;
                    //init
                    ExamSrv.getAllExams().then(function(examArr){
                        var examsWithIsCompletedStatusArr = [];
                        var getExamResultPromArr = [];

                        angular.forEach(examArr, function (exam) {
                            var examCopy = angular.copy(exam);
                            examsWithIsCompletedStatusArr.push(examCopy);

                            var getExamResultProm = ExerciseResultSrv.getExamResult(exam.id, true).then(function(examResult){
                                examCopy.isCompleted = !!(examResult && examResult.isCompleted);
                            });

                            getExamResultPromArr.push(getExamResultProm);
                        });
                        //set active exam id
                        $q.all(getExamResultPromArr).then(function(){
                            var activeExamId;

                            for(var i=0; i<examsWithIsCompletedStatusArr.length; i++){
                                var exam = examsWithIsCompletedStatusArr[i];

                                if(exam.isCompleted){
                                    continue;
                                }

                                if(exam.typeId === ExamTypeEnum.MINI_TEST.enum){
                                    activeExamId = exam.id;
                                    break;
                                }
                                //active exam id is already set with higher order full test
                                if(angular.isDefined(activeExamId)){
                                    continue;
                                }

                                activeExamId = exam.id;
                            }
                            //all exams are completed
                            if(angular.isUndefined(activeExamId)){
                                activeExamId = examsWithIsCompletedStatusArr[0].id;
                            }

                            scope.vm.changeActive(activeExamId);
                        });

                        scope.vm.examArr = examsWithIsCompletedStatusArr;
                    });

                    scope.vm.changeActive = function(newActiveId){
                        scope.vm.activeId = newActiveId;
                        ngModelCtrl.$setViewValue(newActiveId);
                    };
                }
            };
        }]
    );
})(angular);


angular.module('znk.infra-web-app.tests').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/tests/templates/navigationPane.template.html",
    "<div class=\"app-tests-navigationPane\"\n" +
    "     translate-namespace=\"NAVIGATION_PANE\">\n" +
    "    <div class=\"tests-navigation-title-header\"\n" +
    "         translate=\".MINI_TEST_TITLE\"></div>\n" +
    "    <md-list flex=\"grow\" layout=\"column\" layout-align=\"start center\">\n" +
    "        <md-list-item ng-repeat=\"miniExam in vm.examArr | filter : {typeId: vm.ExamTypeEnum.MINI_TEST.enum}\"\n" +
    "                      ng-class=\"{\n" +
    "                        'done': miniExam.isCompleted,\n" +
    "                        'active': vm.activeId === miniExam.id\n" +
    "                      }\">\n" +
    "            <md-button md-no-ink\n" +
    "                       ng-click=\"vm.changeActive(miniExam.id)\">\n" +
    "                <span>{{miniExam.name}}</span>\n" +
    "                <div class=\"status-icon-wrapper\"\n" +
    "                     ng-if=\"miniExam.isCompleted\">\n" +
    "                    <i class=\"material-icons\">check</i>\n" +
    "                </div>\n" +
    "            </md-button>\n" +
    "        </md-list-item>\n" +
    "    </md-list>\n" +
    "    <div class=\"tests-navigation-title-header\"\n" +
    "         translate=\".FULL_TEST_TITLE\"></div>\n" +
    "    <md-list class=\"md-list-second-list\"\n" +
    "             flex=\"grow\"\n" +
    "             layout=\"column\"\n" +
    "             layout-align=\"start center\">\n" +
    "        <md-list-item ng-repeat=\"fullExam in vm.examArr | filter : {typeId: vm.ExamTypeEnum.FULL_TEST.enum}\"\n" +
    "                      ng-class=\"{\n" +
    "                        'done': fullExam.isCompleted,\n" +
    "                        'active': vm.activeId === fullExam.id\n" +
    "                      }\">\n" +
    "            <md-button md-no-ink\n" +
    "                       ng-click=\"vm.changeActive(fullExam.id)\">\n" +
    "                <span>{{fullExam.name}}</span>\n" +
    "                <div class=\"status-icon-wrapper\"\n" +
    "                     ng-if=\"fullExam.isCompleted\">\n" +
    "                    <i class=\"material-icons\">check</i>\n" +
    "                </div>\n" +
    "            </md-button>\n" +
    "        </md-list-item>\n" +
    "    </md-list>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.uiTheme', [
        'ngMaterial'
    ]);
})(angular);

angular.module('znk.infra-web-app.uiTheme').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoals', [
        'znk.infra.scoring',
        'znk.infra.utility'
    ]);
})(angular);


'use strict';

angular.module('znk.infra-web-app.userGoals').provider('UserGoalsService', [function() {

        var _calcScoreFn;

        this.setCalcScoreFn = function(calcScoreFn) {
            _calcScoreFn = calcScoreFn;
        };

        this.$get = ['InfraConfigSrv', 'StorageSrv', '$q', '$injector', function (InfraConfigSrv, StorageSrv, $q, $injector) {
            var self = this;
            var goalsPath = StorageSrv.variables.appUserSpacePath + '/goals';
            var defaultSubjectScore = self.settings.defaultSubjectScore;
            var subjects = self.settings.subjects;

            var userGoalsServiceObj = {};

            userGoalsServiceObj.getGoals = function () {
                return InfraConfigSrv.getGlobalStorage().then(function(globalStorage) {
                    return globalStorage.get(goalsPath).then(function (userGoals) {
                        if (angular.equals(userGoals, {})) {
                            userGoals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.setGoals = function (newGoals) {
                return InfraConfigSrv.getGlobalStorage().then(function(globalStorage) {
                    if (arguments.length && angular.isDefined(newGoals)) {
                        return globalStorage.set(goalsPath, newGoals);
                    }
                    return globalStorage.get(goalsPath).then(function (userGoals) {
                        if (!userGoals.goals) {
                            userGoals.goals = _defaultUserGoals();
                        }
                        return userGoals;
                    });
                });
            };

            userGoalsServiceObj.getCalcScoreFn = function() {
                return $q.when($injector.invoke(_calcScoreFn, self));
            };

            userGoalsServiceObj.getGoalsSettings = function() {
                 return self.settings;
            };

            function getInitTotalScore() {
                var initTotalScore = 0;
                angular.forEach(subjects, function() {
                    initTotalScore += defaultSubjectScore;
                });
                return initTotalScore;
            }

            function _defaultUserGoals() {
                var defaultUserGoals = {
                    isCompleted: false,
                    totalScore: getInitTotalScore()
                };
                angular.forEach(subjects, function(subject) {
                    defaultUserGoals[subject.name] = defaultSubjectScore;
                });
                return defaultUserGoals;
            }

            function averageSubjectsGoal(goalsObj) {
                var goalsSum = 0;
                var goalsLength = 0;
                angular.forEach(goalsObj, function(goal) {
                    if (angular.isNumber(goal)) {
                        goalsSum += goal;
                        goalsLength += 1;
                    }
                });
                return Math.round(goalsSum / goalsLength);
            }

            userGoalsServiceObj.averageSubjectsGoal = averageSubjectsGoal;

            return userGoalsServiceObj;
        }];
}]);

angular.module('znk.infra-web-app.userGoals').run(['$templateCache', function($templateCache) {

}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoalsSelection', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.utility',
        'znk.infra.general',
        'ngMaterial',
        'ngTagsInput',
        'znk.infra-web-app.userGoals'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'user-goals-plus-icon': 'components/userGoalsSelection/svg/plus-icon.svg',
                'user-goals-dropdown-arrow-icon': 'components/userGoalsSelection/svg/dropdown-arrow.svg',
                'user-goals-arrow-icon': 'components/userGoalsSelection/svg/arrow-icon.svg',
                'user-goals-info-icon': 'components/userGoalsSelection/svg/info-icon.svg',
                'user-goals-v-icon': 'components/userGoalsSelection/svg/v-icon.svg',
                'user-goals-search-icon': 'components/userGoalsSelection/svg/search-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoalsSelection')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "SCHOOL_SELECT": {
                            "SELECT_TO_CONTINUE": "Select up to 3 dream schools to continue",
                            "SCHOOLS": "Schools",
                            "REQUIRED_SCORE": "Required Score",
                            "SELECT_3_SCHOOLS": "Enter at least 3 letters to search for schools",
                            "NO_RESULTS": "No schools matched your search"
                        },
                        "USER_GOALS": {
                            "DREAM_SCHOOLS": "DREAM SCHOOLS",
                            "EDIT": "edit",
                            "CANCEL": "cancel",
                            "SAVE_AND_CONTINUE": "SAVE & CONTINUE",
                            "SAVE": "SAVE",
                            "SAVED": "SAVED",
                            "I_DONT_KNOW": "I don't know yet..."
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.userGoalsSelection').controller('EditGoalsController',
        ["$scope", "$filter", "$mdDialog", function ($scope, $filter, $mdDialog) {
            'ngInject';
            var translateFilter = $filter('translate');
            $scope.userGoalsSetting = {
                recommendedGoalsTitle: false,
                saveBtn: {
                    title: translateFilter('USER_GOALS.SAVE'),
                    afterSaveTitle: translateFilter('USER_GOALS.SAVED'),
                    wrapperClassName: 'btn-sm'
                }
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('goalSelect', function GoalSelectDirective() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/userGoalsSelection/templates/goalSelect.template.html',
            require: 'ngModel',
            scope: {
                minScore: '=',
                maxScore: '=',
                updateGoalNum: '='
            },
            link: function link(scope, element, attrs, ngModelCtrl) {
                scope.updateGoal = function (isPlus) {
                    scope.target += (isPlus) ? scope.updateGoalNum : -Math.abs(scope.updateGoalNum);
                    if (scope.target < scope.minScore) {
                        scope.target = scope.minScore;
                    } else if (scope.target > scope.maxScore) {
                        scope.target = scope.maxScore;
                    }

                    if (angular.isFunction(scope.onChange)) {
                        scope.onChange();
                    }
                    ngModelCtrl.$setViewValue(scope.target);
                };

                ngModelCtrl.$render = function () {
                    scope.target = ngModelCtrl.$viewValue;
                };
            }
        };

        return directive;
    });

})(angular);

/**
 *  attrs:
 *      events:
 *          onSave
 * */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('schoolSelect',
        ["userGoalsSelectionService", "$translate", "UtilitySrv", "$timeout", "$q", function SchoolSelectDirective(userGoalsSelectionService, $translate, UtilitySrv, $timeout, $q) {
            'ngInject';

            var schoolList = [];

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoalsSelection/templates/schoolSelect.template.html',
                scope: {
                    events: '=?',
                    getSelectedSchools: '&?'
                },
                link: function link(scope, element, attrs) {
                    var MIN_LENGTH_AUTO_COMPLETE = 3;
                    var MAX_SCHOOLS_SELECT = 3;
                    var userSchools;

                    function disableSearchOption() {
                        if (scope.d.userSchools.length >= MAX_SCHOOLS_SELECT) {
                            element.find('input').attr('disabled', true);
                        } else {
                            element.find('input').removeAttr('disabled');
                        }
                    }

                    function _getTagsInputModelCtrl() {
                        var tagsInputElement = element.find('tags-input');
                        if (tagsInputElement) {
                            var tagsInputElementData = tagsInputElement.data();
                            if (tagsInputElementData.$ngModelController) {
                                scope.d.tagsInputNgModelCtrl = tagsInputElementData.$ngModelController;
                            }
                        }
                    }

                    scope.d = {
                        minLengthAutoComplete: MIN_LENGTH_AUTO_COMPLETE,
                        loadOnEmpty: false,
                        actions: {}
                    };

                    if (!scope.events) {
                        scope.events = {};
                    }
                    var eventsDefault = {
                        onSave: angular.noop
                    };
                    UtilitySrv.object.extendWithoutOverride(scope.events, eventsDefault);

                    //  added in order to provide custom selected schools
                    var getSelectedSchoolsProm;
                    if (attrs.getSelectedSchools) {
                        getSelectedSchoolsProm = $q.when(scope.getSelectedSchools());
                    } else {
                        getSelectedSchoolsProm = userGoalsSelectionService.getDreamSchools();
                    }
                    getSelectedSchoolsProm.then(function (_userSchools) {
                        userSchools = _userSchools;
                        scope.d.userSchools = angular.copy(userSchools);
                        $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                            scope.d.placeholder = scope.d.userSchools.length ? ' ' : val;
                        });
                        disableSearchOption();
                    });

                    userGoalsSelectionService.getAppSchoolsList().then(function (schools) {
                        schoolList = schools.data;
                    });

                    scope.d.onTagAdding = function ($tag) {
                        if (!$tag.id) {
                            return false;
                        }
                        $tag.text = $tag.text.replace(/([-])/g, ' ');
                        scope.d.placeholder = ' ';
                        return scope.d.userSchools.length < MAX_SCHOOLS_SELECT;
                    };

                    scope.d.onTagAdded = function () {
                        disableSearchOption();
                        return true;
                    };

                    scope.d.onTagRemoved = function () {
                        if (!scope.d.userSchools.length) {
                            $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                                scope.d.placeholder =  val;
                            });
                        }
                        disableSearchOption();
                        return true;
                    };

                    scope.d.querySchools = function ($query) {
                        if ($query.length < 3) {
                            return $q.when([]);
                        }
                        var resultsArr = schoolList.filter(function (school) {
                            return school.text.toLowerCase().indexOf($query.toLowerCase()) > -1;
                        });
                        if (!resultsArr.length) {
                            resultsArr = $translate('SCHOOL_SELECT.NO_RESULTS').then(function(val) {
                                return [{
                                    text: val
                                }];
                            });

                        }
                        return $q.when(resultsArr);
                    };

                    scope.d.save = function () {
                        if (!scope.d.tagsInputNgModelCtrl) {
                            _getTagsInputModelCtrl();
                        }
                        scope.d.tagsInputNgModelCtrl.$setPristine();

                        scope.events.onSave(scope.d.userSchools);
                    };

                    $timeout(function () {
                        _getTagsInputModelCtrl();
                    });
                }
            };

            return directive;
        }]);
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('userGoals',
        ["UserGoalsService", "$timeout", "userGoalsSelectionService", "$q", "ScoringService", function UserGoalsDirective(UserGoalsService, $timeout, userGoalsSelectionService, $q, ScoringService) {
            'ngInject';
            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoalsSelection/templates/userGoals.template.html',
                scope: {
                    onSave: '&?',
                    setting: '='
                },
                link: function link(scope) {
                    var userGoalRef;
                    scope.scoringLimits = ScoringService.getScoringLimits();
                    scope.goalsSettings = UserGoalsService.getGoalsSettings();

                    var defaultTitle = scope.saveTitle = scope.setting.saveBtn.title || '.SAVE';

                    UserGoalsService.getGoals().then(function (userGoals) {
                        userGoalRef = userGoals;
                        scope.userGoals = angular.copy(userGoals);
                    });

                    var getDreamSchoolsProm = userGoalsSelectionService.getDreamSchools().then(function (userSchools) {
                        scope.userSchools = angular.copy(userSchools);
                    });
                    scope.getSelectedSchools = function () {
                        return getDreamSchoolsProm.then(function () {
                            return scope.userSchools;
                        });
                    };

                    scope.showSchools = function () {
                        scope.showSchoolEdit = !scope.showSchoolEdit;
                    };

                    scope.calcTotal = function () {
                        var goals = scope.userGoals;
                        var newTotalScore = 0;
                        angular.forEach(goals, function(goal, key) {
                            if (angular.isNumber(goal) && key !== 'totalScore') {
                                newTotalScore += goal;
                            }
                        });
                        goals.totalScore = scope.totalScore = newTotalScore;
                        return goals.totalScore;
                    };

                    scope.saveChanges = function () {
                        var saveUserSchoolsProm = userGoalsSelectionService.setDreamSchools(scope.userSchools);

                        angular.extend(userGoalRef, scope.userGoals);
                        var saveUserGoalsProm = UserGoalsService.setGoals(userGoalRef);

                        $q.all([
                            saveUserSchoolsProm,
                            saveUserGoalsProm
                        ]).then(function () {
                            if (angular.isFunction(scope.onSave)) {
                                scope.onSave();
                            }

                            if (scope.setting.saveBtn.afterSaveTitle) {
                                scope.saveTitle = scope.setting.saveBtn.afterSaveTitle;
                                scope.showVIcon = true;
                                $timeout(function () {
                                    scope.saveTitle = defaultTitle;
                                    scope.showVIcon = false;
                                }, 3000);
                            }
                        });
                    };

                    scope.schoolSelectEvents = {
                        onSave: function (newUserDreamSchools) {
                            scope.showSchoolEdit = false;
                            scope.userSchools = newUserDreamSchools;

                            var calcScoreFn = UserGoalsService.getCalcScoreFn();
                            calcScoreFn(newUserDreamSchools).then(function(newUserGoals) {
                                scope.userGoals = newUserGoals;
                            });
                        }
                    };
                }
            };

            return directive;
        }]);
})(angular);

'use strict';

angular.module('znk.infra-web-app.userGoalsSelection').service('userGoalsSelectionService', ['InfraConfigSrv', 'StorageSrv', 'ENV', '$http', 'UserGoalsService', '$q', '$mdDialog',
    function(InfraConfigSrv, StorageSrv, ENV, $http, UserGoalsService, $q, $mdDialog) {
        var schoolsPath = StorageSrv.variables.appUserSpacePath + '/dreamSchools';

        this.getAppSchoolsList = function () {
            return $http.get(ENV.dreamSchoolJsonUrl, {
                timeout: ENV.promiseTimeOut,
                cache: true
            });
        };

        function _getUserSchoolsData() {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                var defaultValues = {
                    selectedSchools: []
                };
                return studentStorage.get(schoolsPath, defaultValues);
            });
        }

        function _setUserSchoolsData(userSchools) {
            return InfraConfigSrv.getStudentStorage().then(function(studentStorage) {
                 return studentStorage.set(schoolsPath, userSchools);
            });
        }

        this.getDreamSchools = function () {
            return _getUserSchoolsData().then(function (userSchools) {
                return userSchools.selectedSchools;
            });
        };

        this.openEditGoalsDialog = function (options) {
            options = angular.extend({}, {
                clickOutsideToCloseFlag: false
            }, options);
            $mdDialog.show({
                controller: 'EditGoalsController',
                controllerAs: 'vm',
                templateUrl: 'components/userGoalsSelection/templates/editGoals.template.html',
                clickOutsideToClose: options.clickOutsideToCloseFlag
            });
        };

        this.setDreamSchools = function (newSchools, updateUserGoals) {
            return _getUserSchoolsData().then(function (userSchools) {
                if (!angular.isArray(newSchools) || !newSchools.length) {
                    newSchools = [];
                }

                if (userSchools.selectedSchools !== newSchools) {
                    userSchools.selectedSchools.splice(0);
                    angular.extend(userSchools.selectedSchools, newSchools);
                }

                var saveUserGoalProm = $q.when();
                if (updateUserGoals) {
                    saveUserGoalProm = UserGoalsService.getCalcScoreFn();
                }

                return $q.all([
                    _setUserSchoolsData(userSchools),
                    saveUserGoalProm
                ]).then(function (res) {
                    var saveUserGoalFn = res[1];
                    if (angular.isFunction(saveUserGoalFn)) {
                        saveUserGoalFn(newSchools, true);
                    }
                    return res[0];
                });
            });
        };
}]);


angular.module('znk.infra-web-app.userGoalsSelection').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/userGoalsSelection/svg/arrow-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-468.2 482.4 96 89.8\" class=\"arrow-icon-wrapper\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .arrow-icon-wrapper .st0{fill:#109BAC;}\n" +
    "        .arrow-icon-wrapper .st1{fill:none;stroke:#fff;stroke-width:5.1237;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    </style>\n" +
    "    <path class=\"st0\" d=\"M-417.2,572.2h-6.2c-24.7,0-44.9-20.2-44.9-44.9v0c0-24.7,20.2-44.9,44.9-44.9h6.2c24.7,0,44.9,20.2,44.9,44.9\n" +
    "    v0C-372.2,552-392.5,572.2-417.2,572.2z\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-442.8\" y1=\"527.3\" x2=\"-401.4\" y2=\"527.3\"/>\n" +
    "        <line class=\"st1\" x1=\"-401.4\" y1=\"527.3\" x2=\"-414.3\" y2=\"514.4\"/>\n" +
    "        <line class=\"st1\" x1=\"-401.4\" y1=\"527.3\" x2=\"-414.3\" y2=\"540.2\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/dropdown-arrow.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"0 0 242.8 117.4\" class=\"dropdown-arrow-icon-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .dropdown-arrow-icon-svg .st0{fill:none;stroke:#000000;stroke-width:18;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10; width:25px;}\n" +
    "    </style>\n" +
    "    <polyline class=\"st0\" points=\"9,9 122.4,108.4 233.8,11 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/info-icon.svg",
    "<svg\n" +
    "    version=\"1.1\"\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-497 499 28 28\"\n" +
    "    class=\"info-icon\">\n" +
    "<style type=\"text/css\">\n" +
    "	.info-icon .st0{fill:none;stroke:#0A9BAD; stroke-width:2;}\n" +
    "	.info-icon .st2{fill:#0A9BAD;}\n" +
    "</style>\n" +
    "<g>\n" +
    "	<circle class=\"st0\" cx=\"-483\" cy=\"513\" r=\"13.5\"/>\n" +
    "	<g>\n" +
    "		<path class=\"st2\" d=\"M-485.9,509.2h3.9v8.1h3v1.2h-7.6v-1.2h3v-6.9h-2.4V509.2z M-483.5,505.6h1.5v1.9h-1.5V505.6z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/plus-icon.svg",
    "<svg class=\"plus-svg\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 16 16\"\n" +
    "    style=\"enable-background:new 0 0 16 16;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.plus-svg .st0, .plus-svg .st1 {\n" +
    "        fill: none;\n" +
    "        stroke: #0a9bad;\n" +
    "        stroke-width: 2;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<line class=\"st0\" x1=\"8\" y1=\"1\" x2=\"8\" y2=\"15\"/>\n" +
    "<line class=\"st1\" x1=\"1\" y1=\"8\" x2=\"15\" y2=\"8\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/search-icon.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" viewBox=\"-314.8 416.5 97.5 99.1\" class=\"search-icon-wrapper\">\n" +
    "<style type=\"text/css\">\n" +
    "	.search-icon-wrapper .st0{fill:none;stroke:#231F20;stroke-width:5;stroke-miterlimit:10;}\n" +
    "	.search-icon-wrapper .st1{fill:none;stroke:#231F20;stroke-width:5;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<circle class=\"st0\" cx=\"-279.1\" cy=\"452.3\" r=\"33.2\"/>\n" +
    "<line class=\"st1\" x1=\"-255.3\" y1=\"477.6\" x2=\"-219.8\" y2=\"513.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/svg/v-icon.svg",
    "<svg class=\"v-icon-wrapper\" x=\"0px\" y=\"0px\" viewBox=\"0 0 334.5 228.7\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .v-icon-wrapper .st0{\n" +
    "            fill:#ffffff;\n" +
    "            stroke:#ffffff;\n" +
    "            stroke-width:26;\n" +
    "            stroke-linecap:round;\n" +
    "            stroke-linejoin:round;\n" +
    "            stroke-miterlimit:10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"13\" y1=\"109.9\" x2=\"118.8\" y2=\"215.7\"/>\n" +
    "	<line class=\"st0\" x1=\"118.8\" y1=\"215.7\" x2=\"321.5\" y2=\"13\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/templates/editGoals.template.html",
    "<md-dialog class=\"setting-edit-goals base-border-radius\" translate-namespace=\"SETTING.EDIT_GOALS\">\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"cancel()\">\n" +
    "            <svg-icon name=\"estimated-score-widget-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <md-dialog-content>\n" +
    "        <div class=\"main-title md-subheader\" translate=\".MY_GOALS\"></div>\n" +
    "        <user-goals setting=\"userGoalsSetting\"></user-goals>\n" +
    "    </md-dialog-content>\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"estimated-score-widget-goals\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/templates/goalSelect.template.html",
    "<div class=\"action-btn minus\" ng-click=\"updateGoal(false)\" ng-show=\"target > minScore\">\n" +
    "    <svg-icon name=\"user-goals-plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "<div class=\"goal\">{{target}}</div>\n" +
    "<div class=\"action-btn plus\" ng-click=\"updateGoal(true)\" ng-show=\"target < maxScore\">\n" +
    "    <svg-icon name=\"user-goals-plus-icon\"></svg-icon>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/templates/schoolSelect.template.html",
    "<div class=\"school-selector\" translate-namespace=\"SCHOOL_SELECT\">\n" +
    "    <div class=\"selector\">\n" +
    "        <div class=\"tag-input-wrap\">\n" +
    "            <div class=\"search-icon-container\">\n" +
    "                <svg-icon name=\"user-goals-search-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "            <tags-input ng-model=\"d.userSchools\"\n" +
    "                        text=\"d.text\"\n" +
    "                        key-property=\"id\"\n" +
    "                        placeholder=\"{{d.placeholder}}\"\n" +
    "                        allow-leftover-text=\"true\"\n" +
    "                        add-from-autocomplete-only=\"true\"\n" +
    "                        on-tag-adding=\"d.onTagAdding($tag)\"\n" +
    "                        on-tag-added=\"d.onTagAdded()\"\n" +
    "                        on-tag-removed=\"d.onTagRemoved()\"\n" +
    "                        max-tags=\"3\"\n" +
    "                        template=\"tag-input-template\">\n" +
    "                <auto-complete source=\"d.querySchools($query)\"\n" +
    "                               debounce-delay=\"100\"\n" +
    "                               display-property=\"text\"\n" +
    "                               max-results-to-show=\"9999\"\n" +
    "                               highlight-matched-text=\"true\"\n" +
    "                               min-length=\"{{d.minLengthAutoComplete}}\"\n" +
    "                               load-on-focus=\"true\"\n" +
    "                               template=\"auto-complete-template\">\n" +
    "                </auto-complete>\n" +
    "            </tags-input>\n" +
    "            <button class=\"select-btn go-btn\"\n" +
    "                    ng-click=\"d.save()\"\n" +
    "                    title=\"{{::'SCHOOL_SELECT.SELECT_TO_CONTINUE' | translate}}\"\n" +
    "                    ng-disabled=\"d.tagsInputNgModelCtrl.$pristine\">\n" +
    "                <svg-icon name=\"user-goals-arrow-icon\"\n" +
    "                          class=\"arrow-icon\">\n" +
    "                </svg-icon>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<script type=\"text/ng-template\" id=\"auto-complete-template\">\n" +
    "    <div ng-show=\"$index==0\" class=\"list-title\">\n" +
    "        <div class=\"list-left-panel\" translate=\".SCHOOLS\"></div>\n" +
    "        <div class=\"list-right-panel\" translate=\".REQUIRED_SCORE\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"left-panel\">\n" +
    "        {{::data.text}}\n" +
    "        <span class=\"location\">{{::data.city}}, {{::data.state}}</span>\n" +
    "    </div>\n" +
    "    <div class=\"right-panel\">\n" +
    "        {{::data.total25th}}{{data.total75th == 'N/A' ? '' : '-' + data.total75th}}\n" +
    "    </div>\n" +
    "</script>\n" +
    "<script type=\"text/ng-template\" id=\"tag-input-template\">\n" +
    "    <div class=\"tag-wrap\">\n" +
    "        <span title=\"{{data.text}}\">{{data.text | cutString: 15}}</span>\n" +
    "        <a class=\"remove-button\" ng-click=\"$removeTag()\">&#10006;</a>\n" +
    "    </div>\n" +
    "</script>\n" +
    "");
  $templateCache.put("components/userGoalsSelection/templates/userGoals.template.html",
    "<section translate-namespace=\"USER_GOALS\">\n" +
    "    <div class=\"goals-schools-wrapper\" ng-if=\"setting.showSchools || goalsSettings.showSchools\">\n" +
    "        <div class=\"title-wrap\">\n" +
    "            <div class=\"edit-title\" translate=\".DREAM_SCHOOLS\"></div>\n" +
    "            <div class=\"edit-link\" ng-click=\"showSchools()\" ng-class=\"{'active' : showSchoolEdit}\">\n" +
    "                <span translate=\".EDIT\" class=\"edit\"></span>\n" +
    "                <span translate=\".CANCEL\" class=\"cancel\"></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"selected-schools-container\" ng-switch=\"userSchools.length\">\n" +
    "            <div ng-switch-when=\"0\"\n" +
    "                 class=\"no-school-selected\"\n" +
    "                 translate=\".I_DONT_KNOW\"></div>\n" +
    "            <div ng-switch-default class=\"selected-schools\">\n" +
    "                <div ng-repeat=\"school in userSchools\" class=\"school\">{{school.text}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"subject-wrap\">\n" +
    "        <div class=\"blur-wrap\"></div>\n" +
    "        <div class=\"goals-title\" ng-show=\"setting.recommendedGoalsTitle\">\n" +
    "            <div class=\"recommended-title\" translate=\".RECOMMENDED_GOALS\"></div>\n" +
    "            <div class=\"info-wrap\">\n" +
    "                <md-tooltip md-visible=\"vm.showTooltip\" md-direction=\"top\" class=\"goals-info md-whiteframe-2dp\">\n" +
    "                    <div translate=\".GOALS_INFO\" class=\"top-text\"></div>\n" +
    "                </md-tooltip>\n" +
    "                <svg-icon class=\"info-icon\" name=\"user-goals-info-icon\" ng-mouseover=\"vm.showTooltip=true\" ng-mouseleave=\"vm.showTooltip=false\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"subject-goal-wrap\">\n" +
    "            <div class=\"subjects-goal noselect\">\n" +
    "                <div class=\"subject\" ng-repeat=\"subject in goalsSettings.subjects\">\n" +
    "                    <div class=\"icon-wrapper svg-wrapper\" ng-class=\"subject.name+'-bg'\">\n" +
    "                        <svg-icon name=\"{{subject.svgIcon}}\"></svg-icon>\n" +
    "                    </div>\n" +
    "                    <span class=\"subject-title\" translate=\".{{subject.name | uppercase}}\"></span>\n" +
    "                    <goal-select\n" +
    "                        min-score=\"scoringLimits.subjects.min || scoringLimits.subjects[subject.id].min\"\n" +
    "                        max-score=\"scoringLimits.subjects.max || scoringLimits.subjects[subject.id].max\"\n" +
    "                        update-goal-num=\"goalsSettings.updateGoalNum\"\n" +
    "                        ng-model=\"userGoals[subject.name]\"\n" +
    "                        ng-change=\"calcTotal()\">\n" +
    "                    </goal-select>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"composite-wrap\">\n" +
    "            <div class=\"composite-score\">\n" +
    "                <div class=\"score-title\" translate=\".TOTAL_SCORE\"></div>\n" +
    "                <div class=\"score\">{{userGoals.totalScore}}</div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"save-btn-wrap\">\n" +
    "        <md-button autofocus tabindex=\"1\"\n" +
    "                   class=\"md-primary znk inline-block\"\n" +
    "                   ng-click=\"saveChanges()\"\n" +
    "                   ng-class=\"setting.saveBtn.wrapperClassName\">\n" +
    "            <svg-icon name=\"user-goals-v-icon\" class=\"v-icon\" ng-show=\"showVIcon\"></svg-icon>\n" +
    "            <span translate=\"{{saveTitle}}\"></span>\n" +
    "            <svg-icon name=\"user-goals-dropdown-arrow-icon\" class=\"dropdown-arrow-icon\" ng-show=\"setting.saveBtn.showSaveIcon\"></svg-icon>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "    <div class=\"school-selector-wrap animate-if\"\n" +
    "         ng-if=\"showSchoolEdit\">\n" +
    "        <school-select events=\"schoolSelectEvents\"\n" +
    "                       get-selected-schools=\"getSelectedSchools()\">\n" +
    "        </school-select>\n" +
    "    </div>\n" +
    "</section>\n" +
    "\n" +
    "\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing', [
        'znk.infra.screenSharing',
        'znk.infra-web-app.completeExercise'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "SH_VIEWER": {
                            "STUDENT":{
                                "YOU_ARE_VIEWING": "Your are viewing your teacher's screen: ",
                                "NO_OPENED_EXERCISES": "Your teacher does not have any exercises open.",
                                "ONCE_OPEN": "Once your teacher opens an exercise, you will be able to view it here."
                            },
                            "DASHBOARD":{
                                "YOU_ARE_VIEWING": "Your are viewing your student's screen: ",
                                "NO_OPENED_EXERCISES": "Your student does not have any exercises open.",
                                "ONCE_OPEN": "Once your student opens an exercise, you will be able to view it here."
                            }
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing')
        .config(["ScreenSharingUiSrvProvider", function (ScreenSharingUiSrvProvider) {
            'ngInject';

            ScreenSharingUiSrvProvider.setScreenSharingViewerTemplate('<sh-viewer></sh-viewer>');
        }]);
})(angular);

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.webAppScreenSharing').component('shViewer', {
        templateUrl: 'components/webAppScreenSharing/directives/shViewer/shViewerDirective.template.html',
        controller: ["CompleteExerciseSrv", "ENV", "ScreenSharingSrv", function (CompleteExerciseSrv, ENV, ScreenSharingSrv) {
            'ngInject';

            var $ctrl= this;

            function _shDataChangeHandler(newShData){
                $ctrl.activeScreen = newShData.activeExercise && newShData.activeExercise.activeScreen;
            }

            function _registerToShDataChanges(){
                ScreenSharingSrv.registerToActiveScreenSharingDataChanges(_shDataChangeHandler);
            }

            function _unregisterFromShDataChanges(){
                ScreenSharingSrv.unregisterFromActiveScreenSharingDataChanges(_shDataChangeHandler);
            }

            this.$onInit = function(){
                _registerToShDataChanges();
                this.appContext = ENV.appContext.toUpperCase();

                this.ceSettings = {
                    mode: CompleteExerciseSrv.MODE_STATES.VIEWER
                };
            };

            this.$onDestroy = function(){
                _unregisterFromShDataChanges();
            };

        }]
    });
})(angular);


angular.module('znk.infra-web-app.webAppScreenSharing').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/webAppScreenSharing/directives/shViewer/shViewerDirective.template.html",
    "<div translate-namespace=\"SH_VIEWER.{{$ctrl.appContext}}\">\n" +
    "    <div class=\"header\">\n" +
    "            <span class=\"you-are-viewing-text\"\n" +
    "                  translate=\".YOU_ARE_VIEWING\">\n" +
    "            </span>\n" +
    "        <div class=\"user-connectivity-status\"></div>\n" +
    "        <span class=\"user-name\">{{$ctrl.sharerName}}</span>\n" +
    "    </div>\n" +
    "    <ng-switch on=\"!!$ctrl.activeScreen\" class=\"sh-viewer-main-container\">\n" +
    "        <div ng-switch-when=\"false\" class=\"none\">\n" +
    "            <div class=\"texts-container\">\n" +
    "                <div class=\"text1\"\n" +
    "                     translate=\".NO_OPENED_EXERCISES\">\n" +
    "                </div>\n" +
    "                <div class=\"text2\"\n" +
    "                     translate=\".ONCE_OPEN\">\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-default>\n" +
    "            <complete-exercise settings=\"$ctrl.ceSettings\">\n" +
    "            </complete-exercise>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
}]);

/**
 * usage instructions:
 *      1) workout progress:
 *          - define <%= subjectName %>-bg class for all subjects(background color and  for workouts-progress item) for example
 *              .reading-bg{
 *                  background: red;
 *              }
 *          - define <%= subjectName %>-bg:after style for border color for example
 *              workouts-progress .items-container .item-container .item.selected.reading-bg:after {
 *                   border-color: red;
 *              }
 *
 *      2) WorkoutsRoadmapSrv:
 *          setNewWorkoutGeneratorGetter: provide a function which return a new workout generator function. subjectsToIgnore
 *              will be passed as parameter.
 *              i.e:
 *                  function(WorkoutPersonalization){
 *                      'ngInject';
 *
 *                      return function(subjectToIgnore){
 *                          return WorkoutPersonalizationService.getExercisesByTimeForNewWorkout(subjectToIgnoreForNextDaily);
 *                      }
 *                  }
 *              the return value should be a map of exercise time to exercise meta data i.e:
 *              {
 *                 "5" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 150,
 *                   "exerciseTypeId" : 1,
 *                   "subjectId" : 0
 *                 },
 *                 "10" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 109,
 *                   "exerciseTypeId" : 3,
 *                   "subjectId" : 0
 *                 },
 *                 "15" : {
 *                   "categoryId" : 263,
 *                   "exerciseId" : 221,
 *                   "exerciseTypeId" : 3,
 *                   "subjectId" : 0
 *                 }
 *               }
 *
 *
 *      3) workoutsRoadmap.diagnostic.summary
 *          this state must set i.e
 *              $stateProvider.state('app.workouts.roadmap.diagnostic.summary', {
 *                   template: '<div>Diagnostic </div>',
 *                   controller: 'WorkoutsRoadMapBaseSummaryController',
 *                   controllerAs: 'vm'
 *               })
 *      4) workoutsRoadmap.workout.inProgress
 *          this state must set i.e
 *              $stateProvider.state('app.workouts.roadmap.workout.inProgress', {
 *                  template: '<div>Workout in progress</div>',
 *                  controller: function(){}
 *             })
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap', [
        'pascalprecht.translate',
        'ngMaterial',
        'ui.router',
        'ngAnimate',
        'znk.infra.svgIcon',
        'znk.infra.enum',
        'znk.infra.exerciseUtility',
        'znk.infra.scroll',
        'znk.infra.general',
        'znk.infra.contentGetters',
        'znk.infra-web-app.purchase',
        'znk.infra-web-app.diagnostic',
        'znk.infra-web-app.diagnosticIntro',
        'znk.infra-web-app.socialSharing',
        'znk.infra.znkExercise',
        'znk.infra.estimatedScore',
        'znk.infra.scoring',
        'znk.infra-web-app.userGoals',
        'znk.infra-web-app.userGoalsSelection',
        'znk.infra-web-app.estimatedScoreWidget'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "WORKOUTS_ROADMAP_DIAGNOSTIC_INTRO":{
                            "DIAGNOSTIC_TEST": "Diagnostic Test",
                            "START_TEST": "START TEST",
                            "CONTINUE_TEST": "CONTINUE TEST"
                        },
                        "WORKOUTS_ROADMAP_DIAGNOSTIC_SUMMERY": {
                            "DIAGNOSTIC_TEST": "Diagnostic Test",
                            "DIAG_RES_TEXT": "Your Results",
                            "DIAG_COMPOS_SCORE": "total score: {{total}}",
                            "LISTENING": "Listening",
                            "SPEAKING": "Speaking",
                            "READING": "Reading",
                            "WRITING": "Writing",
                            "MATH": "Math",
                            "VERBAL": "Verbal"
                        },
                        "ROADMAP_BASE_PRE_SUMMARY": {
                            "DIAGNOSTIC_TEST": "Diagnostic Test",
                            "COMPLETE": "Completed!",
                            "WORKOUT": "Workout"
                        },
                        "WORKOUTS_ROADMAP_WORKOUT_INTRO":{
                            "TITLE": "Workout {{workoutOrder}}",
                            "CHANGE_SUBJECT": "Change subject",
                            "HOW_MUCH_TIME": "How much time do you have?",
                            "WORKOUT_TIME": "WORKOUT_TIME",
                            "START": "START",
                            "MINUTES": "minutes"
                        },
                        "WORKOUTS_ROADMAP_WORKOUT_IN_PROGRESS":{
                            "TITLE": "Workout {{workoutOrder}}",
                            "KEEP_GOING": "Let's keep going!",
                            "ANSWERED": "Answered: {{answered}}/{{total}}",
                            "CONTINUE": "CONTINUE"
                        },
                        "WORKOUTS_ROADMAP_WORKOUT_INTRO_LOCK":{
                            "TITLE": "Workout {{workoutOrder}}",
                            "DIAGNOSTIC_NOT_COMPLETED": "This workout will be available after you have <br>completed the diagnostic test",
                            "PREV_NOT_COMPLETED": "Complete the previous workout to unlock this workout",
                            "MORE_WORKOUTS": "Want to get one more workout for free?",
                            "TELL_FRIENDS": "Tell friends about us!",
                            "SHARE": "SHARE",
                            "UPGRADE": "Upgrade",
                            "GET_ZINKERZ_PRO": "Get Zinkerz PRO to unlock all workouts.",
                            "MORE_PRACTICE": "Do you feel like you need more practice? Or do you <br>want to be 100% sure you’re ready for the test?"
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.workouts', {
                    template: '<ui-view></ui-view>',
                    abstract: true
                })
                .state('app.workouts.roadmap', {
                    url: '/workoutsRoadmap',
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmap.template.html',
                    resolve: {
                        data: ["ExerciseStatusEnum", "WorkoutsSrv", "DiagnosticSrv", "$q", function data(ExerciseStatusEnum, WorkoutsSrv, DiagnosticSrv, $q) {
                            'ngInject';

                            var isDiagnosticCompletedProm = DiagnosticSrv.getDiagnosticStatus();
                            var workoutsProgressProm = WorkoutsSrv.getAllWorkouts();

                            return $q.all([
                                isDiagnosticCompletedProm,
                                workoutsProgressProm
                            ]).then(function (res) {
                                var isDiagnosticCompleted = res[0] === ExerciseStatusEnum.COMPLETED.enum;
                                var workoutsProgress = res[1];

                                return {
                                    diagnostic: {
                                        status: isDiagnosticCompleted ? ExerciseStatusEnum.COMPLETED.enum : ExerciseStatusEnum.ACTIVE.enum,
                                        workoutOrder: 0
                                    },
                                    workoutsProgress: workoutsProgress
                                };
                            });
                        }]
                    },
                    controller: 'WorkoutsRoadMapController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.diagnostic', {
                    url: '/diagnostic',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapDiagnosticController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.diagnostic.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticIntroController',
                    controllerAs: 'vm',
                    resolve: {
                        isDiagnosticStarted: ["DiagnosticSrv", "ExerciseStatusEnum", function (DiagnosticSrv, ExerciseStatusEnum) {
                            'ngInject';

                            return DiagnosticSrv.getDiagnosticStatus().then(function (status) {
                                return status === ExerciseStatusEnum.ACTIVE.enum;
                            });
                        }]
                    }
                })
                .state('app.workouts.roadmap.diagnostic.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.workout', {
                    url: '/workout?workout',
                    template: '<ui-view></ui-view>',
                    controller: 'WorkoutsRoadMapWorkoutController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.workout.intro', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutIntro.template.html',
                    controller: 'WorkoutsRoadMapWorkoutIntroController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.workout.inProgress', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapWorkoutInProgress.template.html',
                    controller: 'WorkoutsRoadMapWorkoutInProgressController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.workout.preSummary', {
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html',
                    controller: 'WorkoutsRoadMapBasePreSummaryController',
                    controllerAs: 'vm'
                })
                .state('app.workouts.roadmap.diagnostic.summary', {
                    resolve: {
                        diagnosticData: ["DiagnosticSrv", "DiagnosticIntroSrv", function (DiagnosticSrv, DiagnosticIntroSrv) {
                            'ngInject';
                                return {
                                    diagnosticResultProm: DiagnosticSrv.getDiagnosticExamResult(),
                                    diagnosticIntroConfigMapProm: DiagnosticIntroSrv.getConfigMap()
                                };
                        }]
                    },
                    templateUrl: 'components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticSummary.template.html',
                    controller: 'WorkoutsRoadMapDiagnosticSummaryController',
                    controllerAs: 'vm'
                });
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';
            
            var svgMap = {
                'workouts-roadmap-checkmark': 'components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg',
                'workouts-roadmap-change-subject': 'components/workoutsRoadmap/svg/change-subject-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);
})(angular);

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapController',
        ["data", "$state", "$scope", "ExerciseStatusEnum", "$location", function (data, $state, $scope, ExerciseStatusEnum, $location) {
            'ngInject';

            var vm = this;

            vm.workoutsProgress = data.workoutsProgress;
            vm.diagnostic = data.diagnostic;

            var search = $location.search();
            var DIAGNOSTIC_STATE = 'app.workouts.roadmap.diagnostic';
            var WORKOUT_STATE = 'app.workouts.roadmap.workout';

            function getActiveWorkout() {
                var i = 0;
                for (; i < vm.workoutsProgress.length; i++) {
                    if (vm.workoutsProgress[i].status !== ExerciseStatusEnum.COMPLETED.enum) {
                        if (angular.isDefined(vm.workoutsProgress[i].subjectId)) {
                            return vm.workoutsProgress[i];
                        }
                        return data.diagnostic;
                    }
                }
                return vm.workoutsProgress[i - 1];
            }

            function _isFirstWorkoutStarted() {
                var firstWorkout = vm.workoutsProgress[0];
                return angular.isDefined(firstWorkout.subjectId);
            }

            //set selected item
            switch ($state.current.name) {
                case DIAGNOSTIC_STATE:
                    vm.selectedItem = vm.diagnostic;
                    break;
                case WORKOUT_STATE:
                    var workoutOrder = +search.workout;
                    if (isNaN(workoutOrder) || workoutOrder < 0 || workoutOrder > vm.workoutsProgress.length) {
                        vm.selectedItem = getActiveWorkout();
                    } else {
                        vm.selectedItem = vm.workoutsProgress[workoutOrder - 1];
                    }
                    break;
                default:
                    if (_isFirstWorkoutStarted()) {
                        vm.selectedItem = getActiveWorkout();
                    } else {
                        vm.selectedItem = vm.diagnostic;
                    }
            }

            data.exercise = vm.selectedItem;

            data.roadmapCtrlActions = {};
            data.roadmapCtrlActions.setCurrWorkout = function (_workoutOrder) {
                if (!_workoutOrder) {
                    vm.selectedItem = vm.diagnostic;
                } else {
                    vm.selectedItem = vm.workoutsProgress[_workoutOrder - 1];
                }
            };
            data.roadmapCtrlActions.freezeWorkoutProgressComponent = function (freeze) {
                vm.freezeWorkoutProgressComponent = freeze;
            };

            var LEFT_ANIMATION = 'left-animation';
            var RIGHT_ANIMATION = 'right-animation';
            $scope.$watch('vm.selectedItem', function (newItem, oldItem) {
                if (angular.isUndefined(newItem)) {
                    return;
                }

                if (newItem !== oldItem) {
                    if (newItem.workoutOrder > oldItem.workoutOrder) {
                        vm.workoutSwitchAnimation = LEFT_ANIMATION;
                    } else {
                        vm.workoutSwitchAnimation = RIGHT_ANIMATION;
                    }
                }

                data.exercise = newItem;

                var currentStateName = $state.current.name;
                if (newItem.workoutOrder === 0) {
                    if (currentStateName !== DIAGNOSTIC_STATE) {
                        $state.go(DIAGNOSTIC_STATE);
                    }
                } else {
                    search = $location.search();
                    // the current state can be "app.workouts.roadmap.workout.intro"
                    // while the direct link is "app.workouts.roadmap.workout?workout=20"  so no need to navigate...
                    if (currentStateName.indexOf(WORKOUT_STATE) === -1 || +search.workout !== +newItem.workoutOrder) {
                        $state.go('app.workouts.roadmap.workout', {
                            workout: newItem.workoutOrder
                        });
                    }
                }
            });
        }]
    );
})();

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapBasePreSummaryController',
        ["$timeout", "WorkoutsSrv", "SubjectEnum", "data", "ExerciseStatusEnum", "$filter", "WorkoutsRoadmapSrv", "purchaseService", function ($timeout, WorkoutsSrv, SubjectEnum, data, ExerciseStatusEnum, $filter,
                  WorkoutsRoadmapSrv, purchaseService) {
            'ngInject';

            var DIAGNOSTIC_ORDER = 0;

            var TIMOUT_BEFORE_GOING_TO_NEXT = 1500;

            var translateFilter = $filter('translate');
            var vm = this;

            function _getToNextWorkout() {
                data.roadmapCtrlActions.freezeWorkoutProgressComponent(true);

                var currentWorkout = data.exercise;

                var subjectToIgnoreForNextDaily;
                if (currentWorkout.workoutOrder !== DIAGNOSTIC_ORDER) {
                    subjectToIgnoreForNextDaily = currentWorkout.subjectId;
                    currentWorkout.status = ExerciseStatusEnum.COMPLETED.enum;
                    WorkoutsSrv.setWorkout(currentWorkout.workoutOrder, currentWorkout);
                }

                var nextWorkoutOrder = currentWorkout.workoutOrder + 1;
                var nextWorkout = data.workoutsProgress[nextWorkoutOrder - 1];
                nextWorkout.status = ExerciseStatusEnum.ACTIVE.enum;

                if (!nextWorkout.isAvail) {
                    purchaseService.openPurchaseNudge(1, currentWorkout.workoutOrder);
                }

                data.personalizedWorkoutTimesProm =
                    WorkoutsRoadmapSrv.generateNewExercise(subjectToIgnoreForNextDaily, nextWorkout.workoutOrder);

                $timeout(function () {
                    data.roadmapCtrlActions.freezeWorkoutProgressComponent(false);
                    data.roadmapCtrlActions.setCurrWorkout(nextWorkout.workoutOrder);
                }, TIMOUT_BEFORE_GOING_TO_NEXT);
            }

            function diagnosticPreSummary() {
                vm.text = translateFilter('ROADMAP_BASE_PRE_SUMMARY.DIAGNOSTIC_TEST');
                _getToNextWorkout();
            }

            function workoutPreSummary() {
                vm.text = translateFilter('ROADMAP_BASE_PRE_SUMMARY.WORKOUT') + ' ';
                vm.text += +data.exercise.workoutOrder;
                _getToNextWorkout();
            }

            if (data.exercise.workoutOrder === DIAGNOSTIC_ORDER) {
                diagnosticPreSummary();
            } else {
                workoutPreSummary();
            }
        }]
    );
})();

(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticController',
        ["$state", "ExerciseStatusEnum", "data", "$timeout", function ($state, ExerciseStatusEnum, data, $timeout) {
            'ngInject';
            //  fixing page not rendered in the first app entrance issue
            $timeout(function () {
                switch (data.diagnostic.status) {
                    case ExerciseStatusEnum.COMPLETED.enum:
                        var isFirstWorkoutStarted = angular.isDefined(data.workoutsProgress[0].subjectId);
                        if (isFirstWorkoutStarted) {
                            $state.go('.summary');
                        } else {
                            $state.go('.preSummary');
                        }
                        break;
                    default:
                        $state.go('.intro');
                }
            });
        }]);
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticIntroController',
        ["isDiagnosticStarted", function (isDiagnosticStarted) {
            'ngInject';

            var vm = this;

            vm.buttonTitle = isDiagnosticStarted ? '.CONTINUE_TEST' : '.START_TEST' ;
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapDiagnosticSummaryController',
        ["diagnosticData", function (diagnosticData) {
            'ngInject';

            var vm = this;
            var diagnosticSubjects;

            diagnosticData.diagnosticIntroConfigMapProm.then(function (diagnosticIntroConfigMap) {
                diagnosticSubjects = vm.diagnosticSubjects = diagnosticIntroConfigMap.subjects;
                return diagnosticData.diagnosticResultProm;
            }).then(function (diagnosticResult) {
                var diagnosticScoresObj = diagnosticResult.userStats;
                vm.isSubjectsWaitToBeEvaluated = false;

                for (var i=0, ii = diagnosticSubjects.length; i < ii; i++) {
                    var subjectId = diagnosticSubjects[i].id;

                    if (!diagnosticScoresObj[subjectId]) {
                        vm.isSubjectsWaitToBeEvaluated = true;
                        break;
                    }
                }

                vm.compositeScore = diagnosticResult.compositeScore;
                vm.userStats = diagnosticScoresObj;
            });

        }]);
})(angular);

'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutController',
        ["$state", "data", "ExerciseStatusEnum", "ExerciseResultSrv", function ($state, data, ExerciseStatusEnum, ExerciseResultSrv) {
            'ngInject';

            function _setExerciseResultOnDataObject() {
                return ExerciseResultSrv.getExerciseResult(data.exercise.exerciseTypeId, data.exercise.exerciseId).then(function (exerciseResult) {
                    data.exerciseResult = exerciseResult;
                    return exerciseResult;
                });
            }

            function _goToState(stateName) {
                var EXPECTED_CURR_STATE = 'app.workouts.roadmap.workout';
                if ($state.current.name === EXPECTED_CURR_STATE) {
                    $state.go(stateName);
                }
            }

            switch (data.exercise.status) {
                case ExerciseStatusEnum.ACTIVE.enum:
                    if (angular.isUndefined(data.exercise.exerciseId) || angular.isUndefined(data.exercise.exerciseTypeId)) {
                        _goToState('.intro');
                    } else {
                        _setExerciseResultOnDataObject().then(function (result) {
                            if (result.isComplete) {
                                _goToState('.preSummary');
                            } else {
                                _goToState('.inProgress');
                            }
                        });
                    }
                    break;
                case ExerciseStatusEnum.COMPLETED.enum:
                    _setExerciseResultOnDataObject().then(function () {
                        _goToState('.summary');
                    });
                    break;
                default:
                    _goToState('.intro');
            }
        }]
    );
})();

(function (angular) {
    'use strict';
    
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutInProgressController',
        ["data", "ExerciseResultSrv", function (data, ExerciseResultSrv) {
            'ngInject';

            var vm = this;

            vm.workout = data.exercise;

            ExerciseResultSrv.getExerciseResult(vm.workout.exerciseTypeId, vm.workout.exerciseId, null, null, true).then(function(exerciseResult){
                vm.exerciseResult = exerciseResult;
                exerciseResult.totalQuestionNum = exerciseResult.totalQuestionNum || 0;
                exerciseResult.totalAnsweredNum = exerciseResult.totalAnsweredNum || 0;
            });
        }]
    );
})(angular);

'use strict';

(function () {
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutIntroController',
        ["data", "$state", "WorkoutsRoadmapSrv", "$q", "$scope", "ExerciseStatusEnum", "ExerciseTypeEnum", "SubjectEnum", "$timeout", "WorkoutsSrv", function (data, $state, WorkoutsRoadmapSrv, $q, $scope, ExerciseStatusEnum, ExerciseTypeEnum, SubjectEnum, $timeout, WorkoutsSrv) {
            'ngInject';

            var FIRST_WORKOUT_ORDER = 1;

            var vm = this;

            vm.workoutsProgress = data.workoutsProgress;

            var currWorkout = data.exercise;
            var currWorkoutOrder = currWorkout && +currWorkout.workoutOrder;
            if (isNaN(currWorkoutOrder)) {
                $state.go('appWorkouts.roadmap', {}, {
                    reload: true
                });
            }
            vm.workoutOrder = currWorkoutOrder;

            WorkoutsRoadmapSrv.getWorkoutAvailTimes().then(function (workoutAvailTimes) {
                vm.workoutAvailTimes = workoutAvailTimes;
            });

            function setTimesWorkouts(getPersonalizedWorkoutsByTimeProm) {
                getPersonalizedWorkoutsByTimeProm.then(function (workoutsByTime) {
                    vm.workoutsByTime = workoutsByTime;
                    WorkoutsRoadmapSrv.getWorkoutAvailTimes().then(function (workoutAvailTimes) {
                        for (var i in workoutAvailTimes) {
                            var time = workoutAvailTimes[i];
                            if (workoutsByTime[time]) {
                                vm.selectedTime = time;
                                break;
                            }
                        }
                    });
                });
            }

            var prevWorkoutOrder = currWorkout.workoutOrder - 1;
            var prevWorkout = prevWorkoutOrder >= FIRST_WORKOUT_ORDER ? data.workoutsProgress && data.workoutsProgress[prevWorkoutOrder - 1] : data.diagnostic;

            //set times workouts
            function setWorkoutsTimes(){
                var getPersonalizedWorkoutsByTimeProm;
                var subjectsToIgnore;

                if (prevWorkout.status === ExerciseStatusEnum.COMPLETED.enum) {
                    if (!currWorkout.personalizedTimes) {
                        if (currWorkout.workoutOrder !== FIRST_WORKOUT_ORDER) {
                            subjectsToIgnore = prevWorkout.subjectId;
                        }
                        getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(subjectsToIgnore, currWorkout.workoutOrder);
                    } else {
                        getPersonalizedWorkoutsByTimeProm = $q.when(currWorkout.personalizedTimes);
                    }

                    setTimesWorkouts(getPersonalizedWorkoutsByTimeProm);
                }
            }
            setWorkoutsTimes();

            vm.getWorkoutIcon = function (workoutLength) {
                if (vm.workoutsByTime) {
                    var exerciseTypeId = vm.workoutsByTime[workoutLength] && vm.workoutsByTime[workoutLength].exerciseTypeId;
                    var exerciseTypeEnumVal = ExerciseTypeEnum.getValByEnum(exerciseTypeId);
                    return exerciseTypeEnumVal ? 'workouts-progress-' + exerciseTypeEnumVal.toLowerCase() + '-icon' : '';
                }
                return '';
            };

            vm.changeSubject = (function () {
                var usedSubjects = [];
                var subjectNum = SubjectEnum.getEnumArr().length;

                return function () {
                    usedSubjects.push(currWorkout.subjectId);
                    if (usedSubjects.length === subjectNum) {
                        usedSubjects = [];
                    }

                    delete currWorkout.personalizedTimes;
                    delete vm.selectedTime;

                    $timeout(function(){
                        var getPersonalizedWorkoutsByTimeProm = WorkoutsRoadmapSrv.generateNewExercise(usedSubjects, currWorkout.workoutOrder, true);
                        setTimesWorkouts(getPersonalizedWorkoutsByTimeProm);
                        getPersonalizedWorkoutsByTimeProm.then(function () {
                            vm.rotate = false;
                        }, function () {
                            vm.rotate = false;
                        });
                    });
                };

            })();

            vm.startExercise = function(){
                var selectedWorkout = angular.copy(vm.selectedWorkout);
                var isWorkoutGenerated = selectedWorkout &&
                    angular.isDefined(selectedWorkout.subjectId) &&
                    angular.isDefined(selectedWorkout.exerciseTypeId) &&
                    angular.isDefined(selectedWorkout.exerciseId);
                if (!isWorkoutGenerated) {
                    return;
                }
                var propTosCopy = ['subjectId', 'exerciseTypeId', 'exerciseId', 'categoryId'];
                angular.forEach(propTosCopy, function (prop) {
                    currWorkout[prop] = selectedWorkout[prop];
                });
                currWorkout.status = ExerciseStatusEnum.ACTIVE.enum;
                delete currWorkout.personalizedTimes;
                delete currWorkout.$$hashKey;
                delete currWorkout.isAvail;

                // znkAnalyticsSrv.eventTrack({
                //     eventName: 'workoutStarted',
                //     props: {
                //         timeBundle: self.userTimePreference,
                //         workoutOrderId: currWorkout.workoutOrder,
                //         exerciseType: currWorkout.exerciseTypeId,
                //         subjectType: currWorkout.subjectId,
                //         exerciseId: currWorkout.exerciseId
                //     }
                // });
                //
                // znkAnalyticsSrv.timeTrack({
                //     eventName: 'workoutCompleted'
                // });

                WorkoutsSrv.setWorkout(currWorkout.workoutOrder, currWorkout).then(function () {
                    $state.go('app.workouts.workout', {
                        workout: currWorkout.workoutOrder
                    });
                });
            };

            vm.selectTime = function(workoutTime){
                if(!vm.workoutsByTime[workoutTime]){
                    return;
                }

                vm.selectedTime = workoutTime;
            };

            $scope.$watch('vm.selectedTime', function (newSelectedTime) {
                if (angular.isUndefined(newSelectedTime)) {
                    return;
                }

                if (vm.workoutsByTime) {
                    vm.selectedWorkout = vm.workoutsByTime[newSelectedTime];
                    currWorkout.subjectId = vm.selectedWorkout.subjectId;
                }
            });
        }]
    );
})();

/**
 * attrs:
 */

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';

            var svgMap = {
                'workouts-intro-lock-dotted-arrow': 'components/workoutsRoadmap/svg/dotted-arrow.svg',
                'workouts-intro-lock-lock': 'components/workoutsRoadmap/svg/lock-icon.svg',
                'workouts-intro-lock-share-arrow': 'components/workoutsRoadmap/svg/share-arrow-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }])
        .directive('workoutIntroLock',
            ["DiagnosticSrv", "ExerciseStatusEnum", "$stateParams", "$q", "SocialSharingSrv", "purchaseService", function (DiagnosticSrv, ExerciseStatusEnum, $stateParams, $q, SocialSharingSrv, purchaseService) {
                'ngInject';

                return {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutIntroLock/workoutIntroLockDirective.template.html',
                    restrict: 'E',
                    transclude: true,
                    scope: {
                        workoutsProgressGetter: '&workoutsProgress'
                    },
                    link: function (scope, element) {
                        var currWorkoutOrder = +$stateParams.workout;
                        var workoutsProgress = scope.workoutsProgressGetter();
                        var currWorkout = workoutsProgress[currWorkoutOrder - 1];

                        scope.vm = {};

                        var LOCK_STATES = {
                            NO_LOCK: -1,
                            DIAGNOSTIC_NOT_COMPLETED: 1,
                            PREV_NOT_COMPLETED: 2,
                            NO_PRO_SOCIAL_SHARING: 3,
                            BUY_PRO: 4
                        };

                        var setLockStateFlowControlProm = DiagnosticSrv.getDiagnosticStatus().then(function (status) {
                            if (status !== ExerciseStatusEnum.COMPLETED.enum) {
                                scope.vm.lockState = LOCK_STATES.DIAGNOSTIC_NOT_COMPLETED;
                                element.addClass('lock');
                                return $q.reject(null);
                            }
                        });

                        setLockStateFlowControlProm = setLockStateFlowControlProm.then(function () {
                            var FIRST_WORKOUT_ORDER = 1;
                            if (currWorkoutOrder > FIRST_WORKOUT_ORDER) {
                                var prevWorkoutIndex = currWorkoutOrder - 2;
                                var prevWorkout = workoutsProgress[prevWorkoutIndex];
                                if (prevWorkout.status !== ExerciseStatusEnum.COMPLETED.enum) {
                                    element.addClass('lock');
                                    scope.vm.lockState = LOCK_STATES.PREV_NOT_COMPLETED;
                                    return $q.reject(null);
                                }
                            }
                        });

                        setLockStateFlowControlProm = setLockStateFlowControlProm.then(function () {
                            if(!currWorkout.isAvail){
                                return SocialSharingSrv.getSocialSharingData().then(function(socialSharingData){
                                    element.addClass('lock');
                                    scope.vm.lockState = LOCK_STATES.NO_PRO_SOCIAL_SHARING;

                                    angular.forEach(socialSharingData,function(wasShared){
                                        if(wasShared){
                                            scope.vm.lockState = LOCK_STATES.BUY_PRO;
                                        }
                                    });

                                    return $q.reject(null);
                                });
                            }
                        });

                        setLockStateFlowControlProm.then(function(){
                            scope.vm.lockState = LOCK_STATES.NO_LOCK;
                        });

                        scope.vm.openPurchaseModal = function () {
                            purchaseService.showPurchaseDialog();
                        };
                    }
                };
            }]
        );
})(angular);


(function () {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap')
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'workouts-progress-flag': 'components/workoutsRoadmap/svg/flag-icon.svg',
                    'workouts-progress-check-mark-icon': 'components/workoutsRoadmap/svg/workout-roadmap-check-mark-icon.svg',
                    'workouts-progress-tutorial-icon': 'components/workoutsRoadmap/svg/tutorial-icon.svg',
                    'workouts-progress-practice-icon': 'components/workoutsRoadmap/svg/practice-icon.svg',
                    'workouts-progress-game-icon': 'components/workoutsRoadmap/svg/game-icon.svg',
                    'workouts-progress-drill-icon': 'components/workoutsRoadmap/svg/drill-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ])
        .directive('workoutsProgress',
            ["$timeout", "ExerciseStatusEnum", "$log", function workoutsProgressDirective($timeout, ExerciseStatusEnum, $log) {
                'ngInject';

                var config = {
                    focusAnimateDuration: 500,
                    focuseAnimationTimingFunction: 'ease-in-out',
                    mouseLeaveBeforeFocusDelay: 2000
                };

                var directive = {
                    templateUrl: 'components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html',
                    restrict: 'E',
                    require: 'ngModel',
                    scope: {
                        workoutsGetter: '&workouts',
                        diagnosticGetter: '&diagnostic',
                        activeWorkoutOrder: '@activeWorkoutOrder'
                    },
                    compile: function compile() {
                        return {
                            pre: function pre(scope) {
                                scope.vm = {};

                                var workouts = scope.workoutsGetter() || [];

                                scope.vm.workouts = workouts;
                                scope.vm.diagnostic = angular.copy(scope.diagnosticGetter());
                                //  added in order to treat the diagnostic as a workout what simplifies the code
                                scope.vm.diagnostic.workoutOrder = 0;
                            },
                            post: function post(scope, element, attrs, ngModelCtrl) {
                                var domElement = element[0];
                                var focusOnSelectedWorkoutTimeoutProm;

                                function mouseEnterEventListener() {
                                    if (focusOnSelectedWorkoutTimeoutProm) {
                                        $timeout.cancel(focusOnSelectedWorkoutTimeoutProm);
                                        focusOnSelectedWorkoutTimeoutProm = null;
                                    }
                                }

                                domElement.addEventListener('mouseenter', mouseEnterEventListener);

                                function mouseLeaveEventListener() {
                                    focusOnSelectedWorkoutTimeoutProm = $timeout(function () {
                                        scope.vm.focusOnSelectedWorkout();
                                    }, config.mouseLeaveBeforeFocusDelay, false);
                                }

                                domElement.addEventListener('mouseleave', mouseLeaveEventListener);

                                function _setProgressLineWidth(activeWorkoutOrder) {
                                    var itemsContainerDomeElement = domElement.querySelectorAll('.item-container');
                                    if (itemsContainerDomeElement.length) {
                                        var activeWorkoutDomElement = itemsContainerDomeElement[activeWorkoutOrder];
                                        if (activeWorkoutDomElement) {
                                            var LEFT_OFFSET = 40;
                                            var progressLineDomElement = domElement.querySelector('.dotted-line.progress');
                                            progressLineDomElement.style.width = LEFT_OFFSET + activeWorkoutDomElement.offsetLeft + 'px';
                                        }
                                    }
                                }

                                scope.vm.focusOnSelectedWorkout = function () {
                                    var parentElement = element.parent();
                                    var parentDomElement = parentElement[0];
                                    if (!parentDomElement) {
                                        return;
                                    }
                                    var containerWidth = parentDomElement.offsetWidth;
                                    var containerCenter = containerWidth / 2;

                                    var selectedWorkoutDomElement = domElement.querySelectorAll('.item-container')[scope.vm.selectedWorkout];
                                    if (!selectedWorkoutDomElement) {
                                        return;
                                    }
                                    var toCenterAlignment = selectedWorkoutDomElement.offsetWidth / 2;
                                    var scrollLeft = selectedWorkoutDomElement.offsetLeft + toCenterAlignment;// align to center
                                    var offset = containerCenter - scrollLeft;
                                    scope.vm.scrollActions.animate(offset, config.focusAnimateDuration, config.focuseAnimationTimingFunction);
                                };

                                function _selectWorkout(itemOrder, skipSetViewValue) {
                                    itemOrder = +itemOrder;
                                    if (isNaN(itemOrder)) {
                                        $log.error('workoutsProgress.directive:vm.selectWorkout: itemOrder is not a number');
                                        return;
                                    }
                                    var items = [scope.vm.diagnostic].concat(scope.vm.workouts);
                                    scope.vm.selectedWorkout = itemOrder;
                                    scope.vm.focusOnSelectedWorkout();
                                    var selectedItem = items[itemOrder];
                                    if (!skipSetViewValue) {
                                        ngModelCtrl.$setViewValue(selectedItem);
                                    }
                                }

                                scope.vm.workoutClick = function (itemOrder) {
                                    if (attrs.disabled) {
                                        return;
                                    }
                                    _selectWorkout(itemOrder);
                                };

                                ngModelCtrl.$render = function () {
                                    if (ngModelCtrl.$viewValue && angular.isDefined(ngModelCtrl.$viewValue.workoutOrder)) {
                                        $timeout(function () {
                                            _selectWorkout(ngModelCtrl.$viewValue.workoutOrder, true);
                                            _setProgressLineWidth(scope.activeWorkoutOrder);
                                        }, 0, false);
                                    }
                                };

                                scope.$on('$destroy', function () {
                                    domElement.removeEventListener('mouseleave', mouseLeaveEventListener);
                                    domElement.removeEventListener('mouseenter', mouseEnterEventListener);
                                });

                                // attrs.$observe('activeWorkoutOrder', function (newActiveWorkoutOrder) {
                                //     if (angular.isDefined(newActiveWorkoutOrder)) {
                                //         _setProgressLineWidth(newActiveWorkoutOrder);
                                //     }
                                // });
                            }
                        };
                    }
                };

                return directive;
            }]
        );
})();

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv', [
        function () {
            var _newWorkoutGeneratorGetter;
            this.setNewWorkoutGeneratorGetter = function(newWorkoutGeneratorGetter){
                _newWorkoutGeneratorGetter = newWorkoutGeneratorGetter;
            };


            var _workoutAvailTimesGetter;
            this.setWorkoutAvailTimes = function(workoutAvailTimesGetter){
                _workoutAvailTimesGetter = workoutAvailTimesGetter;
            };

            this.$get = ["$injector", "$log", "$q", function($injector, $log, $q){
                'ngInject';

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function(subjectToIgnoreForNextDaily, workoutOrder, clickedOnChangeSubjectBtn){
                    if(!_newWorkoutGeneratorGetter){
                        var errMsg = 'WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    if(!angular.isArray(subjectToIgnoreForNextDaily)){
                        subjectToIgnoreForNextDaily = subjectToIgnoreForNextDaily ? [subjectToIgnoreForNextDaily] : [];
                    }

                    var newExerciseGenerator = $injector.invoke(_newWorkoutGeneratorGetter);
                    return $q.when(newExerciseGenerator(subjectToIgnoreForNextDaily,workoutOrder,clickedOnChangeSubjectBtn));
                };

                WorkoutsRoadmapSrv.getWorkoutAvailTimes = function(){
                    if(!_workoutAvailTimesGetter){
                        var errMsg = 'WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    var workoutAvailTimes;
                    if(angular.isFunction(_workoutAvailTimesGetter)){
                        workoutAvailTimes = $injector.invoke(_workoutAvailTimesGetter);
                    }else{
                        workoutAvailTimes = _workoutAvailTimesGetter;
                    }

                    return $q.when(workoutAvailTimes);
                };

                return WorkoutsRoadmapSrv;
            }];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.workoutsRoadmap').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/workoutsRoadmap/directives/workoutIntroLock/workoutIntroLockDirective.template.html",
    "<div ng-transclude class=\"main-container\"></div>\n" +
    "<div translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_INTRO_LOCK\"\n" +
    "    class=\"lock-overlay-container\">\n" +
    "    <ng-switch on=\"vm.lockState\">\n" +
    "        <div class=\"diagnostic-not-completed\"\n" +
    "             ng-switch-when=\"1\">\n" +
    "            <div class=\"description\"\n" +
    "                 translate=\".DIAGNOSTIC_NOT_COMPLETED\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"2\" class=\"prev-not-completed\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-dotted-arrow\"></svg-icon>\n" +
    "            <div class=\"description\"\n" +
    "                 translate=\".PREV_NOT_COMPLETED\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"3\" class=\"no-pro-social-sharing\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-lock\"></svg-icon>\n" +
    "            <div class=\"text1\"\n" +
    "                 translate=\".MORE_WORKOUTS\">\n" +
    "            </div>\n" +
    "            <div class=\"text2\"\n" +
    "                 translate=\".TELL_FRIENDS\">\n" +
    "            </div>\n" +
    "            <md-button class=\"share-btn md-primary znk\"\n" +
    "                       md-no-ink>\n" +
    "                <svg-icon name=\"workouts-intro-lock-share-arrow\"></svg-icon>\n" +
    "                <span translate=\".SHARE\"></span>\n" +
    "            </md-button>\n" +
    "            <div class=\"text3 get-zinkerz-pro-text\"\n" +
    "                 translate=\".GET_ZINKERZ_PRO\">\n" +
    "            </div>\n" +
    "            <md-button class=\"upgrade-btn znk outline\" ng-click=\"vm.openPurchaseModal()\">\n" +
    "                <span translate=\".UPGRADE\"></span>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "        <div ng-switch-when=\"4\" class=\"no-pro\">\n" +
    "            <svg-icon name=\"workouts-intro-lock-lock\"></svg-icon>\n" +
    "            <div class=\"description\" translate=\".MORE_PRACTICE\"></div>\n" +
    "            <div class=\"get-zinkerz-pro-text\" translate=\".GET_ZINKERZ_PRO\"></div>\n" +
    "            <md-button class=\"upgrade-btn znk md-primary\" ng-click=\"vm.openPurchaseModal()\">\n" +
    "                <span translate=\".UPGRADE\"></span>\n" +
    "            </md-button>\n" +
    "        </div>\n" +
    "    </ng-switch>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/directives/workoutsProgress/workoutsProgressDirective.template.html",
    "<znk-scroll actions=\"vm.scrollActions\" scroll-on-mouse-wheel=\"true\">\n" +
    "    <div class=\"items-container\">\n" +
    "        <div class=\"dotted-lines-container\">\n" +
    "            <div class=\"dotted-line progress\"></div>\n" +
    "            <div class=\"dotted-line future\"></div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container diagnostic\">\n" +
    "            <div class=\"item\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === vm.diagnostic.workoutOrder\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(vm.diagnostic.workoutOrder)\">\n" +
    "                <ng-switch on=\"vm.diagnostic.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\"\n" +
    "                              name=\"workouts-progress-check-mark-icon\"\n" +
    "                              ng-switch-when=\"2\">\n" +
    "                    </svg-icon>\n" +
    "                    <svg-icon class=\"flag-icon\"\n" +
    "                              name=\"workouts-progress-flag\"\n" +
    "                              ng-switch-default>\n" +
    "                    </svg-icon>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"item-container\"\n" +
    "             ng-repeat=\"workout in vm.workouts\">\n" +
    "            <div class=\"item\"\n" +
    "                 subject-id-to-attr-drv=\"workout.subjectId\"\n" +
    "                 suffix=\"bg\"\n" +
    "                 ng-class=\"{\n" +
    "                    selected: vm.selectedWorkout === workout.workoutOrder,\n" +
    "                    pristine: workout.subjectId === undefined\n" +
    "                 }\"\n" +
    "                 ng-click=\"vm.workoutClick(workout.workoutOrder)\">\n" +
    "                <ng-switch on=\"workout.status\">\n" +
    "                    <svg-icon class=\"check-mark-icon\" name=\"workouts-progress-check-mark-icon\" ng-switch-when=\"2\"></svg-icon>\n" +
    "                    <span ng-switch-default>\n" +
    "                        {{::workout.workoutOrder}}\n" +
    "                    </span>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "        <div class=\"future-item\"></div>\n" +
    "    </div>\n" +
    "</znk-scroll>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/change-subject-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 86.4 71.6\"\n" +
    "     class=\"workouts-roadmap-change-subject-svg\">\n" +
    "\n" +
    "<style type=\"text/css\">\n" +
    "    .workouts-roadmap-change-subject-svg{\n" +
    "        width: 10px;\n" +
    "    }\n" +
    "\n" +
    "    .workouts-roadmap-change-subject-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #231F20;\n" +
    "            stroke-width: 1.6864;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "</style>\n" +
    "\n" +
    "<g>\n" +
    "	<path id=\"XMLID_70_\" class=\"st0\" d=\"M8.5,29.4C11.7,13.1,26,0.8,43.2,0.8c17.5,0,32,12.7,34.8,29.5\"/>\n" +
    "	<polyline id=\"XMLID_69_\" class=\"st0\" points=\"65.7,24 78.3,30.3 85.7,18.7 	\"/>\n" +
    "</g>\n" +
    "<g>\n" +
    "	<path id=\"XMLID_68_\" class=\"st0\" d=\"M77.9,42.2c-3.2,16.3-17.5,28.6-34.7,28.6c-17.5,0-32-12.7-34.8-29.5\"/>\n" +
    "	<polyline id=\"XMLID_67_\" class=\"st0\" points=\"20.7,47.6 8.1,41.3 0.7,52.9 	\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/check-mark-inside-circle-icon.svg",
    "<svg\n" +
    "	class=\"complete-v-icon-svg\"\n" +
    "	xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "	xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "    x=\"0px\"\n" +
    "	y=\"0px\"\n" +
    "	viewBox=\"-1040 834.9 220.4 220.4\"\n" +
    "	style=\"enable-background:new -1040 834.9 220.4 220.4;\"\n" +
    "    xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "    .complete-v-icon-svg{\n" +
    "        width: 110px;\n" +
    "    }\n" +
    "\n" +
    "	.complete-v-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st1 {\n" +
    "        fill: #CACBCC;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st2 {\n" +
    "        display: none;\n" +
    "        fill: none;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st3 {\n" +
    "        fill: #D1D2D2;\n" +
    "    }\n" +
    "\n" +
    "    .complete-v-icon-svg .st4 {\n" +
    "        fill: none;\n" +
    "        stroke: #FFFFFF;\n" +
    "        stroke-width: 11.9321;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<path class=\"st0\" d=\"M-401,402.7\"/>\n" +
    "<circle class=\"st1\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<circle class=\"st2\" cx=\"-929.8\" cy=\"945.1\" r=\"110.2\"/>\n" +
    "<path class=\"st3\" d=\"M-860.2,895.8l40,38.1c-5.6-55.6-52.6-99-109.6-99c-60.9,0-110.2,49.3-110.2,110.2\n" +
    "	c0,60.9,49.3,110.2,110.2,110.2c11.6,0,22.8-1.8,33.3-5.1l-61.2-58.3L-860.2,895.8z\"/>\n" +
    "<polyline class=\"st4\" points=\"-996.3,944.8 -951.8,989.3 -863.3,900.8 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/dotted-arrow.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     class=\"workouts-intro-lock-dotted-arrow-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"-406.9 425.5 190.9 175.7\">\n" +
    "    <style>\n" +
    "        .workouts-intro-lock-dotted-arrow-svg{\n" +
    "            width: 53px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-intro-lock-dotted-arrow-svg circle{\n" +
    "            stroke: #161616;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <circle cx=\"-402.8\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"513\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-386.1\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"479.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-369.6\" cy=\"529.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"479.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"462.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-352.6\" cy=\"546.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"463.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"446.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"479.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"547\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-336.1\" cy=\"563.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"446.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"429.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"463.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"496.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"479.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"530.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"513.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"563.5\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"546.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"597.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-319.1\" cy=\"580.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-303\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"496.1\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"529.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-286\" cy=\"512.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"496.6\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-269.5\" cy=\"513.3\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"496.7\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"530.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-252.7\" cy=\"513.4\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-236.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"496.2\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"529.8\" r=\"4.1\"/>\n" +
    "    <circle cx=\"-220.1\" cy=\"512.9\" r=\"4.1\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/drill-icon.svg",
    "<svg xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 199 87\"\n" +
    "     class=\"workouts-progress-drill-svg\">\n" +
    "    <style>\n" +
    "        .workouts-progress-drill-svg {\n" +
    "            width: 20px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 16;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st3 {\n" +
    "            clip-path: url(#SVGID_2_);\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 11;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-drill-svg  .st4 {\n" +
    "            clip-path: url(#SVGID_4_);\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 11;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <line class=\"st0\" x1=\"64\" y1=\"45\" x2=\"138\" y2=\"45\"/>\n" +
    "        <g>\n" +
    "            <line class=\"st1\" x1=\"47\" y1=\"8\" x2=\"47\" y2=\"79\"/>\n" +
    "            <line class=\"st2\" x1=\"29\" y1=\"22\" x2=\"29\" y2=\"65\"/>\n" +
    "            <g>\n" +
    "                <defs>\n" +
    "                    <rect id=\"SVGID_1_\" y=\"38\" width=\"17\" height=\"17\"/>\n" +
    "                </defs>\n" +
    "                <clipPath id=\"SVGID_2_\">\n" +
    "                    <use xlink:href=\"#SVGID_1_\" style=\"overflow:visible;\"/>\n" +
    "                </clipPath>\n" +
    "                <line class=\"st3\" x1=\"18\" y1=\"45.5\" x2=\"24\" y2=\"45.5\"/>\n" +
    "            </g>\n" +
    "        </g>\n" +
    "        <g>\n" +
    "            <line class=\"st1\" x1=\"154\" y1=\"8\" x2=\"154\" y2=\"79\"/>\n" +
    "            <line class=\"st2\" x1=\"172\" y1=\"22\" x2=\"172\" y2=\"65\"/>\n" +
    "            <g>\n" +
    "                <defs>\n" +
    "                    <rect id=\"SVGID_3_\" x=\"182\" y=\"38\" width=\"17\" height=\"17\"/>\n" +
    "                </defs>\n" +
    "                <clipPath id=\"SVGID_4_\">\n" +
    "                    <use xlink:href=\"#SVGID_3_\" style=\"overflow:visible;\"/>\n" +
    "                </clipPath>\n" +
    "                <line class=\"st4\" x1=\"183\" y1=\"45.5\" x2=\"177\" y2=\"45.5\"/>\n" +
    "            </g>\n" +
    "        </g>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/flag-icon.svg",
    "<svg x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"-145 277 60 60\"\n" +
    "	 class=\"flag-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .flag-svg{\n" +
    "            width: 23px;\n" +
    "        }\n" +
    "\n" +
    "        .flag-svg .st0 {\n" +
    "            fill: #ffffff;\n" +
    "            stroke-width: 5;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "<g id=\"kUxrE9.tif\">\n" +
    "	<g>\n" +
    "		<path class=\"st0\" id=\"XMLID_93_\" d=\"M-140.1,287c0.6-1.1,1.7-1.7,2.9-1.4c1.3,0.3,2,1.1,2.3,2.3c1.1,4,2.1,8,3.2,12c2.4,9.3,4.9,18.5,7.3,27.8\n" +
    "			c0.1,0.3,0.2,0.6,0.2,0.9c0.3,1.7-0.6,3-2.1,3.3c-1.4,0.3-2.8-0.5-3.3-2.1c-1-3.6-2-7.3-2.9-10.9c-2.5-9.5-5-19-7.6-28.6\n" +
    "			C-140.1,290-140.8,288.3-140.1,287z\"/>\n" +
    "		<path class=\"st0\" id=\"XMLID_92_\" d=\"M-89.6,289.1c-1,6.8-2.9,13-10,16c-3.2,1.4-6.5,1.6-9.9,0.9c-2-0.4-4-0.7-6-0.6c-4.2,0.3-7.1,2.7-9,6.4\n" +
    "			c-0.3,0.5-0.5,1.1-0.9,2c-0.3-1-0.5-1.7-0.8-2.5c-2-7-3.9-14.1-5.9-21.2c-0.3-1-0.1-1.7,0.5-2.4c4.5-6,11-7.4,17.5-3.6\n" +
    "			c3.4,2,6.7,4.2,10.2,6.1c1.9,1,3.9,1.9,5.9,2.4c3.2,0.9,5.9,0,7.9-2.6C-90,289.7-89.8,289.4-89.6,289.1z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/game-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 127 147.8\"\n" +
    "     class=\"workouts-progress-game-svg\">\n" +
    "    <style>\n" +
    "        .workouts-progress-game-svg {\n" +
    "            width: 15px;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st0 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st1 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-miterlimit: 10;\n" +
    "            fill: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .workouts-progress-game-svg .st2 {\n" +
    "            fill-rule: evenodd;\n" +
    "            clip-rule: evenodd;\n" +
    "            fill: #acacac;\n" +
    "            stroke: #acacac;\n" +
    "        }\n" +
    "\n" +
    "\n" +
    "        /*.workouts-progress-game-svg circle {*/\n" +
    "            /*stroke: #acacac;*/\n" +
    "            /*fill: none;*/\n" +
    "        /*}*/\n" +
    "\n" +
    "        /*.workouts-progress-game-svg circle.st1 {*/\n" +
    "            /*fill: #acacac;*/\n" +
    "        /*}*/\n" +
    "\n" +
    "        /*.workouts-progress-game-svg path {*/\n" +
    "            /*fill: #acacac;*/\n" +
    "        /*}*/\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"st0\" cx=\"63.5\" cy=\"84.2\" r=\"60.5\"/>\n" +
    "        <circle class=\"st1\" cx=\"63.7\" cy=\"84.2\" r=\"6.2\"/>\n" +
    "        <path class=\"st1\" d=\"M65.2,73.8h-2.5c-0.7,0-1.2-0.3-1.2-0.7V41.5c0-0.4,0.5-0.7,1.2-0.7h2.5c0.7,0,1.2,0.3,1.2,0.7V73\n" +
    "		C66.4,73.4,65.9,73.8,65.2,73.8z\"/>\n" +
    "        <path class=\"st2\" d=\"M73.7,80.9l-1.6-2.7c-0.3-0.6-0.3-1.2,0.1-1.4l11.6-6.9c0.4-0.2,1,0,1.3,0.6l1.6,2.7c0.3,0.6,0.3,1.2-0.1,1.4\n" +
    "		L75,81.5C74.6,81.7,74,81.5,73.7,80.9z\"/>\n" +
    "        <path class=\"st1\" d=\"M58,9.5v4.6c0,2.9,2.4,5.3,5.3,5.3c2.9,0,5.3-2.4,5.3-5.3V9.5H58z\"/>\n" +
    "        <path class=\"st1\" d=\"M79.2,3.1c0,1.7-1.4,3.1-3.1,3.1H51.6c-1.7,0-3.1-1.4-3.1-3.1l0,0c0-1.7,1.4-3.1,3.1-3.1h24.5\n" +
    "		C77.8,0,79.2,1.4,79.2,3.1L79.2,3.1z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/lock-icon.svg",
    "<svg class=\"workouts-intro-lock-lock-svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 106 165.2\"\n" +
    "     version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        svg.workouts-intro-lock-lock-svg {\n" +
    "            width: 37px;\n" +
    "        }\n" +
    "\n" +
    "        svg.workouts-intro-lock-lock-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #161616;\n" +
    "            stroke-width: 6;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "\n" +
    "        svg.workouts-intro-lock-lock-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #161616;\n" +
    "            stroke-width: 4;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M93.4,162.2H12.6c-5.3,0-9.6-4.3-9.6-9.6V71.8c0-5.3,4.3-9.6,9.6-9.6h80.8c5.3,0,9.6,4.3,9.6,9.6v80.8\n" +
    "		C103,157.9,98.7,162.2,93.4,162.2z\"/>\n" +
    "        <path class=\"st0\" d=\"M23.2,59.4V33.2C23.2,16.6,36.6,3,53,3h0c16.4,0,29.8,13.6,29.8,30.2v26.1\"/>\n" +
    "        <path class=\"st1\" d=\"M53.2,91.5c6,0,10.9,5.1,10.9,11.3c0,2.6-3.1,6-4.2,7c-0.2,0.2-0.3,0.5-0.2,0.8l6.9,22.4H39.4l6.5-22.6\n" +
    "		c0-0.2,0-0.3-0.1-0.5c-0.8-0.9-3.9-4.4-3.9-7.1C41.9,96.6,47.1,91.5,53.2,91.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/practice-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 255.2 169\"\n" +
    "     class=\"practice-icon-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "    .practice-icon-svg{\n" +
    "        width: 20px;\n" +
    "    }\n" +
    "\n" +
    "    .practice-icon-svg .st0{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "        stroke-linejoin:round;\n" +
    "    }\n" +
    "\n" +
    "    .practice-icon-svg .st1{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "    }\n" +
    "\n" +
    "	.practice-icon-svg .st2{\n" +
    "        fill:none;\n" +
    "        stroke:#acacac;\n" +
    "        stroke-width:12;\n" +
    "        stroke-linecap:round;\n" +
    "        stroke-linejoin:round;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<polyline class=\"st0\"\n" +
    "              points=\"142,41 3,41 3,166 59,166\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"75\"\n" +
    "          x2=\"93\"\n" +
    "          y2=\"75\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"102\"\n" +
    "          x2=\"77\"\n" +
    "          y2=\"102\"/>\n" +
    "	<line class=\"st1\"\n" +
    "          x1=\"35\"\n" +
    "          y1=\"129\"\n" +
    "          x2=\"79\"\n" +
    "          y2=\"129\"/>\n" +
    "	<polygon class=\"st0\"\n" +
    "             points=\"216.8,3 111.2,106.8 93,161.8 146.8,146 252.2,41\"/>\n" +
    "	<line class=\"st2\"\n" +
    "          x1=\"193.2\"\n" +
    "          y1=\"31.7\"\n" +
    "          x2=\"224\"\n" +
    "          y2=\"64.8\"/>\n" +
    "	<polygon points=\"102.5,139.7 114.5,153.8 97.2,157.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/share-arrow-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "     viewBox=\"0 0 149.8 116.7\"\n" +
    "     class=\"share-icon-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .share-icon-svg {\n" +
    "            width: 16px;\n" +
    "        }\n" +
    "\n" +
    "        .share-icon-svg path{\n" +
    "            fill: white;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path d=\"M74.7,33.6c0-11.1,0-21.7,0-33.6c25.4,19.7,49.9,38.8,75.1,58.4c-25,19.5-49.6,38.6-74.9,58.3c0-11.5,0-22,0-32.5\n" +
    "		c-21.6-5.7-49.4,6.1-74.5,31.2c-2.4-12.2,5.4-38.4,21-55C35.9,45,53.7,36.3,74.7,33.6z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/tutorial-icon.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 143.2 207.8\"\n" +
    "    class=\"tips-n-tricks-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .tips-n-tricks-svg {\n" +
    "            width: 11px;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg path {\n" +
    "            fill: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st1 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 10;\n" +
    "            stroke-linecap: round;\n" +
    "        }\n" +
    "\n" +
    "        .tips-n-tricks-svg .st2 {\n" +
    "            fill: none;\n" +
    "            stroke: #acacac;\n" +
    "            stroke-width: 8;\n" +
    "            stroke-linecap: round;\n" +
    "        }\n" +
    "\n" +
    "\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <path class=\"st0\" d=\"M70.5,2.8\"/>\n" +
    "        <path class=\"st1\" d=\"M110,157.5c0,0-5.1-21,8.7-38.8c10.5-13.5,19.5-28.7,19.5-47.1C138.2,34.8,108.4,5,71.6,5S5,34.8,5,71.6\n" +
    "		c0,18.4,9.1,33.6,19.5,47.1c13.8,17.8,8.7,38.8,8.7,38.8\"/>\n" +
    "        <line class=\"st2\" x1=\"41.8\" y1=\"166.5\" x2=\"101.8\" y2=\"166.5\"/>\n" +
    "        <line class=\"st2\" x1=\"39.8\" y1=\"178.5\" x2=\"103.8\" y2=\"178.5\"/>\n" +
    "        <line class=\"st2\" x1=\"45.8\" y1=\"190.5\" x2=\"95.8\" y2=\"190.5\"/>\n" +
    "        <path d=\"M87.5,198.5c-1.2,6.2-7.3,9.3-16.4,9.3s-14.4-3.3-16.4-9.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/svg/workout-roadmap-check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"workout-roadmap-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .workout-roadmap-check-mark-svg{\n" +
    "            width: 30px;\n" +
    "        }\n" +
    "\n" +
    "        .workout-roadmap-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmap.template.html",
    "<div class=\"workouts-roadmap-container\">\n" +
    "    <div class=\"workouts-roadmap-wrapper base-border-radius base-box-shadow\">\n" +
    "        <workouts-progress workouts=\"vm.workoutsProgress\"\n" +
    "                           ng-disabled=\"vm.freezeWorkoutProgressComponent\"\n" +
    "                           diagnostic=\"vm.diagnostic\"\n" +
    "                           active-workout-order=\"{{vm.activeWorkoutOrder}}\"\n" +
    "                           ng-model=\"vm.selectedItem\">\n" +
    "        </workouts-progress>\n" +
    "        <div class=\"workouts-container\"\n" +
    "             ng-class=\"vm.workoutSwitchAnimation\">\n" +
    "            <ui-view class=\"workouts-ui-view\"></ui-view>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <estimated-score-widget is-nav-menu=\"false\" ng-model=\"currentSubjectId\"></estimated-score-widget>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapBasePreSummary.template.html",
    "<div class=\"workouts-roadmap-base-pre-summary base-workouts-wrapper\"\n" +
    "     translate-namespace=\"ROADMAP_BASE_PRE_SUMMARY\">\n" +
    "    <div>\n" +
    "        <div class=\"diagnostic-workout-title\">{{::vm.text}}</div>\n" +
    "        <svg-icon class=\"checkmark-icon\"\n" +
    "                  name=\"workouts-roadmap-checkmark\">\n" +
    "        </svg-icon>\n" +
    "        <div class=\"complete-text\"\n" +
    "             translate=\".COMPLETE\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticIntro.template.html",
    "<div translate-namespace=\"WORKOUTS_ROADMAP_DIAGNOSTIC_INTRO\"\n" +
    "     class=\"workouts-roadmap-diagnostic-intro base-workouts-wrapper\">\n" +
    "    <div>\n" +
    "        <div class=\"diagnostic-workout-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "        <diagnostic-intro></diagnostic-intro>\n" +
    "        <md-button  class=\"md-primary znk\"\n" +
    "                    autofocus\n" +
    "                    tabindex=\"1\"\n" +
    "                    ui-sref=\"app.diagnostic({ skipIntro: true })\"\n" +
    "                    aria-label=\"{{::vm.buttonTitle}}\"\n" +
    "                    translate=\"{{vm.buttonTitle}}\"\n" +
    "                    md-no-ink>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapDiagnosticSummary.template.html",
    "<div class=\"workouts-roadmap-diagnostic-summary base-workouts-wrapper\"\n" +
    "     translate-namespace=\"WORKOUTS_ROADMAP_DIAGNOSTIC_SUMMERY\">\n" +
    "    <div class=\"diagnostic-workout-title\" translate=\".DIAGNOSTIC_TEST\"></div>\n" +
    "    <div class=\"results-text\" translate=\".DIAG_RES_TEXT\"></div>\n" +
    "    <div class=\"total-score\"\n" +
    "         ng-if=\"!vm.isSubjectsWaitToBeEvaluated\"\n" +
    "         translate=\".DIAG_COMPOS_SCORE\"\n" +
    "         translate-values=\"{total: vm.compositeScore }\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"first-row\">\n" +
    "        <div ng-repeat=\"subject in vm.diagnosticSubjects\"\n" +
    "            ng-class=\"subject.subjectNameAlias\"\n" +
    "            class=\"subject-score\">\n" +
    "            <svg-icon class=\"icon-wrapper\" name=\"{{subject.subjectIconName}}\"></svg-icon>\n" +
    "            <div class=\"score-wrapper\">\n" +
    "                <div class=\"score\" translate=\".{{subject.subjectNameAlias | uppercase}}\"></div>\n" +
    "                <span class=\"bold\">{{::vm.userStats[subject.id] || '-'}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapWorkoutInProgress.template.html",
    "<div class=\"workouts-roadmap-workout-in-progress base-workouts-wrapper\"\n" +
    "     translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_IN_PROGRESS\">\n" +
    "    <div class=\"workouts-roadmap-workout-in-progress-wrapper\">\n" +
    "        <div class=\"title-wrapper\">\n" +
    "            <div translate=\".TITLE\"\n" +
    "                 translate-values=\"{workoutOrder: vm.workout.workoutOrder}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <svg-icon class=\"subject-icon\"\n" +
    "                  subject-id-to-attr-drv=\"vm.workout.subjectId\"\n" +
    "                  context-attr=\"name\"\n" +
    "                  suffix=\"icon\">\n" +
    "        </svg-icon>\n" +
    "        <div class=\"subject-title\"\n" +
    "             translate=\"SUBJECTS.{{vm.workout.subjectId}}\">\n" +
    "        </div>\n" +
    "        <div class=\"keep-going-text\" translate=\".KEEP_GOING\"></div>\n" +
    "        <div class=\"answered-text\"\n" +
    "             translate=\".ANSWERED\"\n" +
    "             translate-values=\"{\n" +
    "                answered: vm.exerciseResult.totalAnsweredNum,\n" +
    "                total: vm.exerciseResult.totalQuestionNum\n" +
    "             }\">\n" +
    "        </div>\n" +
    "        <md-button class=\"znk md-primary continue-btn\"\n" +
    "                   ui-sref=\"app.workouts.workout({workout: vm.workout.workoutOrder})\">\n" +
    "            <span translate=\".CONTINUE\"></span>\n" +
    "        </md-button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/workoutsRoadmap/templates/workoutsRoadmapWorkoutIntro.template.html",
    "<div class=\"workouts-roadmap-workout-intro base-workouts-wrapper\"\n" +
    "     translate-namespace=\"WORKOUTS_ROADMAP_WORKOUT_INTRO\">\n" +
    "    <div class=\"workouts-roadmap-intro-wrapper\">\n" +
    "        <div class=\"title-wrapper\">\n" +
    "            <div translate=\".TITLE\"\n" +
    "                 translate-values=\"{workoutOrder: vm.workoutOrder}\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <workout-intro-lock workouts-progress=\"vm.workoutsProgress\">\n" +
    "            <svg-icon class=\"subject-icon\"\n" +
    "                      subject-id-to-attr-drv=\"vm.selectedWorkout.subjectId\"\n" +
    "                      context-attr=\"name\"\n" +
    "                      suffix=\"icon\">\n" +
    "            </svg-icon>\n" +
    "            <div class=\"subject-title\"\n" +
    "                 translate=\"SUBJECTS.{{vm.selectedWorkout.subjectId}}\">\n" +
    "            </div>\n" +
    "            <div class=\"change-subject-container\"\n" +
    "                 ng-class=\"{\n" +
    "                'rotate': vm.rotate\n" +
    "             }\"\n" +
    "                 ng-click=\"vm.rotate = !vm.rotate; vm.changeSubject()\">\n" +
    "                <svg-icon name=\"workouts-roadmap-change-subject\"></svg-icon>\n" +
    "            <span class=\"change-subject-title\"\n" +
    "                  translate=\".CHANGE_SUBJECT\">\n" +
    "            </span>\n" +
    "            </div>\n" +
    "            <div class=\"how-much-time-title\"\n" +
    "                 translate=\".HOW_MUCH_TIME\">\n" +
    "            </div>\n" +
    "            <div class=\"workout-time-selection-container\">\n" +
    "                <div class=\"avail-time-item-wrapper\"\n" +
    "                     ng-disabled=\"!vm.workoutsByTime[workoutAvailTime]\"\n" +
    "                     ng-repeat=\"workoutAvailTime in vm.workoutAvailTimes\">\n" +
    "                    <div class=\"avail-time-item\"\n" +
    "                         ng-class=\"{\n" +
    "                        active: vm.selectedTime === workoutAvailTime\n" +
    "                     }\"\n" +
    "                         ng-click=\"vm.selectTime(workoutAvailTime)\">\n" +
    "                        <svg-icon class=\"workout-icon\"\n" +
    "                                  name=\"{{vm.getWorkoutIcon(workoutAvailTime);}}\">\n" +
    "\n" +
    "                        </svg-icon>\n" +
    "                        <span class=\"avail-time-text\">{{workoutAvailTime}}</span>\n" +
    "                    <span class=\"minutes-text\"\n" +
    "                          translate=\".MINUTES\">\n" +
    "                    </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"start-btn-wrapper\">\n" +
    "                <md-button class=\"md-primary znk\"\n" +
    "                           ng-click=\"vm.startExercise()\"\n" +
    "                           md-no-ink>\n" +
    "                    <span translate=\".START\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </workout-intro-lock>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkExerciseStatesUtility', [
        'ui.router',
        'znk.infra.znkExercise',
        'znk.infra-web-app.infraWebAppZnkExercise'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkExerciseStatesUtility')
        .controller('InfraWebAppExerciseStateCtrl',
            ["$controller", "$scope", "exerciseData", "$filter", "ExerciseTypeEnum", function ($controller, $scope, exerciseData, $filter, ExerciseTypeEnum) {
                'ngInject';

                $scope.vm = this;

                var isSection = exerciseData.exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
                // var isPractice = exerciseData.exerciseTypeId === ExerciseTypeEnum.PRACTICE.enum;
                var isExerciseComplete = exerciseData.exerciseResult.isComplete;
                this.iconClickHandler = exerciseData.iconClickHandler;
                this.iconName = exerciseData.iconName;

                var exerciseSettings = {
                    initPagerDisplay: isExerciseComplete || isSection
                };

                this.onHeaderQuit = function () {
                    exerciseData.headerExitAction();
                };

                $controller('BaseZnkExerciseController', {
                    $scope: $scope,
                    exerciseData: exerciseData,
                    exerciseSettings: exerciseSettings
                });


                this.headerTitle = exerciseData.headerTitle;

                // this.showTimer = (isExerciseComplete) ? false : (isPractice || isSection);

                this.isComplete = isExerciseComplete;
                // tutorial intro
                // if (exerciseData.exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum) {
                //     if (angular.isArray(exerciseData.exercise.content)) {
                //         angular.forEach(exerciseData.exercise.content, function (content) {
                //             content.title = content.title.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                //             content.body = content.body.replace(/font\-family: \'Lato Regular\';/g, 'font-family: Lato;font-weight: 400;');
                //         });
                //     }
                //
                //     this.subjectId = exerciseData.exercise.subjectId;
                //     this.tutorialContent = exerciseData.exercise.content;
                //     var videoSrc = ENV.videosEndPoint + 'videos/tutorials/' + exerciseData.exercise.id + '.mp4';
                //     this.videoSrc = $sce.trustAsResourceUrl(videoSrc);
                //     this.iconName = 'book-icon';
                //     this.iconClickHandler = function () {
                //         vm.showIntro = true;
                //     };
                //
                //     this.goToQuestions = function () {
                //         vm.showIntro = false;
                //     };
                //
                //     this.trustAsHtml = function (html) {
                //         return $sce.trustAsHtml(html);
                //     };
                // }
            }]
        );
})(angular);

angular.module('znk.infra-web-app.znkExerciseStatesUtility').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkExerciseStatesUtility/templates/exercise.template.html",
    "<div class=\"exercise-container base-border-radius\">\n" +
    "    <znk-exercise-header subject-id=\"baseZnkExerciseCtrl.exercise.subjectId\"\n" +
    "                         options=\"{\n" +
    "                            showQuit: true,\n" +
    "                            showNumSlide: true,\n" +
    "                            showDate: vm.showTimer,\n" +
    "                            reviewMode: vm.isComplete\n" +
    "                         }\"\n" +
    "                         total-slide-num=\"{{baseZnkExerciseCtrl.numberOfQuestions}}\"\n" +
    "                         ng-model=\"baseZnkExerciseCtrl.currentIndex\"\n" +
    "                         side-text=\"vm.headerTitle\"\n" +
    "                         timer-data=\"baseZnkExerciseCtrl.timerData\"\n" +
    "                         on-clicked-quit=\"vm.onHeaderQuit()\"\n" +
    "                         icon-name=\"{{vm.iconName}}\"\n" +
    "                         icon-click-handler=\"vm.iconClickHandler()\">\n" +
    "    </znk-exercise-header>\n" +
    "<!--    <znk-progress-linear-exercise ng-if=\"vm.showTimer\"\n" +
    "                                  start-time=\"baseZnkExerciseCtrl.startTime\"\n" +
    "                                  max-time=\"baseZnkExerciseCtrl.maxTime\"\n" +
    "                                  on-finish-time=\"baseZnkExerciseCtrl.onFinishTime()\"\n" +
    "                                  on-change-time=\"baseZnkExerciseCtrl.onChangeTime(passedTime)\">\n" +
    "    </znk-progress-linear-exercise>-->\n" +
    "    <znk-exercise questions=\"baseZnkExerciseCtrl.exercise.questions\"\n" +
    "                  ng-model=\"baseZnkExerciseCtrl.resultsData.questionResults\"\n" +
    "                  settings=\"baseZnkExerciseCtrl.settings\"\n" +
    "                  actions=\"baseZnkExerciseCtrl.actions\">\n" +
    "    </znk-exercise>\n" +
    "    <!--<div ng-if=\"vm.showIntro\" class=\"workout-roadmap-tutorial-intro\"-->\n" +
    "         <!--ng-include-->\n" +
    "         <!--src=\"'app/tutorials/templates/tutorialIntro.template.html'\">-->\n" +
    "    <!--</div>-->\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader',
        ['ngAnimate',
            'ngMaterial',
            'znk.infra.svgIcon',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'ui.router',
            'znk.infra-web-app.purchase',
            'znk.infra-web-app.onBoarding',
            'znk.infra-web-app.userGoalsSelection',
            'znk.infra-web-app.settings',
            'znk.infra.user',
            'znk.infra.general',
            'znk.infra-web-app.invitation',
            'znk.infra-web-app.feedback'])
        .config([
            'SvgIconSrvProvider',
            function(SvgIconSrvProvider){

                var svgMap = {
                    'znkHeader-raccoon-logo-icon': 'components/znkHeader/svg/raccoon-logo.svg',
                    'znkHeader-check-mark-icon': 'components/znkHeader/svg/znk-header-check-mark-icon.svg',
                    'pending-purchase-clock-icon': 'components/znkHeader/svg/pending-purchase-clock-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ZNK_HEADER": {
                            "WORKOUTS": "workouts",
                            "TESTS": "tests",
                            "TUTORIALS": "tips&Tricks",
                            "PERFORMANCE": "performance",
                            "ETUTORING": "Live Lessons",
                            "PROFILE_STATUS_BASIC": "Get Zinkerz Pro",
                            "PROFILE_STATUS_PENDING": "Processing payment...",
                            "PROFILE_STATUS_PRO": "Zinkerz Pro",
                            "PROFILE_GOALS": "my goals",
                            "PROFILE_CHANGE_PASSWORD": "change password",
                            "PROFILE_SUPPORT": "support",
                            "PROFILE_LOGOUT": "log out"
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').controller('znkHeaderCtrl',
        ["$scope", "$window", "purchaseService", "znkHeaderSrv", "OnBoardingService", "SettingsSrv", "$timeout", "UserProfileService", "$injector", "PurchaseStateEnum", "userGoalsSelectionService", "AuthService", "ENV", "feedbackSrv", function ($scope, $window, purchaseService, znkHeaderSrv, OnBoardingService, SettingsSrv, $timeout,
                  UserProfileService, $injector, PurchaseStateEnum, userGoalsSelectionService, AuthService, ENV, feedbackSrv) {
            'ngInject';

            var self = this;
            var pendingPurchaseProm = purchaseService.getPendingPurchase();
            self.expandIcon = 'expand_more';
            self.additionalItems = znkHeaderSrv.getAdditionalItems();
            self.purchaseData = {};

            if (pendingPurchaseProm) {
                self.purchaseState = PurchaseStateEnum.PENDING.enum;
                self.subscriptionStatus = '.PROFILE_STATUS_PENDING';
            } else {
                self.purchaseState = PurchaseStateEnum.NONE.enum;
                self.subscriptionStatus = '.PROFILE_STATUS_BASIC';
            }

            purchaseService.getPurchaseData().then(function (purchaseData) {
                self.purchaseData = purchaseData;
            });

            $scope.$watch(function () {
                return self.purchaseData;
            }, function (newPurchaseState) {
                $timeout(function () {
                    var hasProVersion = !(angular.equals(newPurchaseState, {}));
                    if (hasProVersion){
                        self.purchaseState = PurchaseStateEnum.PRO.enum;
                        self.subscriptionStatus = '.PROFILE_STATUS_PRO';
                    }
                });
            }, true);


            OnBoardingService.isOnBoardingCompleted().then(function (isCompleted) {
                self.isOnBoardingCompleted = isCompleted;
            });

            self.invokeOnClickHandler = function(onClickHandler){
                $injector.invoke(onClickHandler);
            };

            this.showPurchaseDialog = function () {
                purchaseService.showPurchaseDialog();
            };

            this.showChangePassword = function() {
                SettingsSrv.showChangePassword();
            };

            this.showGoalsEdit = function () {
                userGoalsSelectionService.openEditGoalsDialog({
                    clickOutsideToCloseFlag: true
                });
            };

            UserProfileService.getProfile().then(function (profile) {
                self.userProfile = {
                    username: profile.nickname,
                    email: profile.email
                };
            });

            self.showFeedbackDialog = function () {
                feedbackSrv.showFeedbackDialog();
            };

            this.znkOpenModal = function () {
                self.expandIcon = 'expand_less';
            };

            this.logout = function () {
                AuthService.logout();
                $window.location.replace(ENV.redirectLogout);
            };


            $scope.$on('$mdMenuClose', function () {
                self.expandIcon = 'expand_more';
            });

        }]);
})(angular);



(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkHeader').directive('znkHeader', [

        function () {
            return {
                    scope: {},
                    restrict: 'E',
                    templateUrl: 'components/znkHeader/templates/znkHeader.template.html',
                    controller: 'znkHeaderCtrl',
                    controllerAs: 'vm'
            };
        }
    ]);
})(angular);


/**
 *
 *   api:
 *     addAdditionalItems function - set items that will be clickable in the header. need to supply object (or array of
 *                                    objects) with the properties: text and onClickHandler
 */

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkHeader').provider('znkHeaderSrv',

        function () {
            var additionalNavMenuItems = [];

            this.addAdditionalNavMenuItems = function (additionalItems) {
                if (!angular.isArray(additionalItems)) {
                    additionalNavMenuItems.push(additionalItems);
                } else {
                    additionalNavMenuItems = additionalItems;
                }
            };

            this.$get = function () {
                'ngInject';
                var navItemsArray = [];

                function addDefaultNavItem(_text, _goToState, _stateOpt) {

                    var navItem = {
                        text: _text,
                        goToState: _goToState,
                        stateOpt: _stateOpt
                    };

                    navItemsArray.push(navItem);
                }

                addDefaultNavItem('ZNK_HEADER.WORKOUTS', 'app.workouts.roadmap', { reload: true });
                addDefaultNavItem('ZNK_HEADER.TESTS', 'app.tests.roadmap');
                addDefaultNavItem('ZNK_HEADER.TUTORIALS', 'app.tutorials.roadmap');
                addDefaultNavItem('ZNK_HEADER.PERFORMANCE', 'app.performance');
                addDefaultNavItem('ZNK_HEADER.ETUTORING', 'app.eTutoring');

                return {
                    getAdditionalItems: function () {
                        return navItemsArray.concat(additionalNavMenuItems);  // return array of default nav items with additional nav items
                    }
                };
            };

        }
    );
})(angular);


angular.module('znk.infra-web-app.znkHeader').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkHeader/svg/pending-purchase-clock-icon.svg",
    "<svg\n" +
    "    xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "    xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 183 183\"\n" +
    "    style=\"enable-background:new 0 0 183 183;\" xml:space=\"preserve\"\n" +
    "    class=\"pending-purchase-clock-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.pending-purchase-clock-svg .st0{fill:none;stroke:#231F20;stroke-width:10.5417;stroke-miterlimit:10;}\n" +
    "	.pending-purchase-clock-svg .st1{fill:none;stroke:#231F20;stroke-width:12.3467;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "	.pending-purchase-clock-svg .st2{fill:none;stroke:#231F20;stroke-width:11.8313;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<circle class=\"st0\" cx=\"91.5\" cy=\"91.5\" r=\"86.2\"/>\n" +
    "<line class=\"st1\" x1=\"92.1\" y1=\"96\" x2=\"92.1\" y2=\"35.5\"/>\n" +
    "<line class=\"st2\" x1=\"92.1\" y1=\"96\" x2=\"131.4\" y2=\"96\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkHeader/svg/raccoon-logo.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"0 0 237 158\"\n" +
    "    class=\"raccoon-logo-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .raccoon-logo-svg .circle{fill:#000001;}\n" +
    "    </style>\n" +
    "    <g>\n" +
    "        <circle class=\"circle\" cx=\"175\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M118.5,155.9c10.2,0,18.5-8.3,18.5-18.5c0-10.2-8.3-18.5-18.5-18.5c-10.2,0-18.5,8.3-18.5,18.5\n" +
    "		C100,147.6,108.3,155.9,118.5,155.9z\"/>\n" +
    "        <path class=\"circle\" d=\"M172.4,67.5c-15.8-9.7-34.3-15.3-53.9-15.3c-19.6,0-38.2,5.5-53.9,15.3\n" +
    "		c13,1.3,23.1,12.3,23.1,25.6c0,1.8-0.2,3.5-0.5,5.1c9.3-5.2,20-8.1,31.3-8.1c11.3,0,22,2.9,31.4,8.1c-0.3-1.7-0.5-3.4-0.5-5.1\n" +
    "		C149.3,79.8,159.5,68.8,172.4,67.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M36.3,93.5c-8,10.8-14,23.4-17.4,37.2c-1.2,4.9-0.4,10,2.3,14.3c2.6,4.3,6.8,7.3,11.7,8.5\n" +
    "		c1.5,0.4,3,0.5,4.5,0.5c8.8,0,16.3-6,18.4-14.5c1.8-7.7,5-14.7,9.2-20.9c-1,0.1-2,0.2-3,0.2C47.9,118.8,36.5,107.5,36.3,93.5z\"/>\n" +
    "        <path class=\"circle\" d=\"M232.2,92.5c0.6-6.7,6.5-78-4.5-88.4c-9.5-9.1-60.3,16-77.5,24.9\n" +
    "		C185.3,37.8,215,60.9,232.2,92.5z\"/>\n" +
    "        <circle class=\"circle\" cx=\"62\" cy=\"93.1\" r=\"13.7\"/>\n" +
    "        <path class=\"circle\" d=\"M204.1,153.6c10.2-2.4,16.4-12.7,14-22.8c-3.3-13.8-9.3-26.4-17.4-37.2\n" +
    "		c-0.2,14-11.6,25.3-25.7,25.3c-1,0-2-0.1-3-0.2c4.2,6.2,7.4,13.3,9.2,21c2,8.6,9.6,14.5,18.4,14.5\n" +
    "		C201.1,154.1,202.6,153.9,204.1,153.6\"/>\n" +
    "        <path class=\"circle\" d=\"M86.7,29C69.5,20.1,18.8-5,9.2,4.1c-11,10.4-5.1,81.5-4.5,88.4C22,60.8,51.7,37.8,86.7,29z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkHeader/svg/znk-header-check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"znkHeader-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .znkHeader-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkHeader/templates/znkHeader.template.html",
    "<div class=\"app-header\" translate-namespace=\"ZNK_HEADER\">\n" +
    "    <div class=\"main-content-header\" layout=\"row\" layout-align=\"start start\">\n" +
    "        <svg-icon class=\"raccoon-logo-icon\"\n" +
    "                  name=\"znkHeader-raccoon-logo-icon\"\n" +
    "                  ui-sref=\"app.workouts.roadmap\"\n" +
    "                  ui-sref-opts=\"{reload: true}\">\n" +
    "        </svg-icon>\n" +
    "\n" +
    "        <div class=\"app-states-list\">\n" +
    "            <md-list flex=\"grow\" layout=\"row\" layout-align=\"start center\">\n" +
    "                <div ng-repeat=\"headerItem in vm.additionalItems\">\n" +
    "                    <md-list-item md-ink-ripple\n" +
    "                                  ui-sref-active=\"active\">\n" +
    "                        <span class=\"title\" translate=\"{{headerItem.text}}\"></span>\n" +
    "                        <a ui-sref=\"{{headerItem.goToState}}\"\n" +
    "                           ui-sref-opts=\"{{headerItem.stateOpt}}\"\n" +
    "                           class=\"link-full-item\">\n" +
    "                        </a>\n" +
    "                    </md-list-item>\n" +
    "                </div>\n" +
    "            </md-list>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"app-user-area\" layout=\"row\" layout-align=\"center center\">\n" +
    "            <invitation-manager></invitation-manager>\n" +
    "            <div class=\"profile-status\" ng-click=\"vm.showPurchaseDialog()\">\n" +
    "                <div class=\"pending-purchase-icon-wrapper\" ng-if=\"vm.purchaseState === 'pending'\">\n" +
    "                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                </div>\n" +
    "                <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "            </div>\n" +
    "            <md-menu md-offset=\"-61 68\">\n" +
    "                <md-button ng-click=\"$mdOpenMenu($event); vm.znkOpenModal();\"\n" +
    "                           class=\"md-icon-button profile-open-modal-btn\"\n" +
    "                           aria-label=\"Open sample menu\">\n" +
    "                    <div>{{::vm.userProfile.username}}</div>\n" +
    "                    <md-icon class=\"material-icons\">{{vm.expandIcon}}</md-icon>\n" +
    "                </md-button>\n" +
    "                <md-menu-content class=\"md-menu-content-znk-header\">\n" +
    "                    <md-list>\n" +
    "                        <md-list-item class=\"header-modal-item header-modal-item-profile\">\n" +
    "                            <span class=\"username\">{{::vm.userProfile.username}}</span>\n" +
    "                            <span class=\"email\">{{::vm.userProfile.email}}</span>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple class=\"header-modal-item header-modal-item-uppercase links purchase-status\">\n" +
    "                            <span translate=\"{{vm.subscriptionStatus}}\" translate-compile></span>\n" +
    "                            <span class=\"link-full-item\" ng-click=\"vm.showPurchaseDialog()\"></span>\n" +
    "                            <ng-switch on=\"vm.purchaseState\">\n" +
    "                                <div ng-switch-when=\"pending\" class=\"pending-purchase-icon-wrapper\">\n" +
    "                                    <svg-icon name=\"pending-purchase-clock-icon\"></svg-icon>\n" +
    "                                </div>\n" +
    "                                <div ng-switch-when=\"pro\" class=\"check-mark-wrapper\">\n" +
    "                                    <svg-icon name=\"znkHeader-check-mark-icon\"></svg-icon>\n" +
    "                                </div>\n" +
    "                            </ng-switch>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple\n" +
    "                            ng-disabled=\"!vm.isOnBoardingCompleted\"\n" +
    "                            disable-click-drv\n" +
    "                            ng-click=\"vm.showGoalsEdit()\">\n" +
    "                            <div class=\"header-modal-item header-modal-item-uppercase links\"\n" +
    "                                 translate=\".PROFILE_GOALS\"></div>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple\n" +
    "                            ng-click=\"vm.showChangePassword()\">\n" +
    "                            <div class=\"header-modal-item header-modal-item-uppercase links\"\n" +
    "                                 translate=\".PROFILE_CHANGE_PASSWORD\"></div>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item md-ink-ripple>\n" +
    "                            <a ui-sref=\"app.faq\"\n" +
    "                               class=\"header-modal-item header-modal-item-uppercase links\"\n" +
    "                               translate=\".WHAT_IS_THE_THIS_TEST\">\n" +
    "                            </a>\n" +
    "                        </md-list-item>\n" +
    "                        <md-list-item  md-ink-ripple\n" +
    "                                       ng-click=\"vm.showFeedbackDialog()\">\n" +
    "                            <div class=\"header-modal-item header-modal-item-uppercase links\"\n" +
    "                                  translate=\".PROFILE_SUPPORT\"></div>\n" +
    "                        </md-list-item>\n" +
    "                        <div class=\"divider\"></div>\n" +
    "                        <md-list-item md-ink-ripple\n" +
    "                            ng-click=\"vm.logout()\">\n" +
    "                            <div class=\"header-modal-item header-modal-item-uppercase logout\"\n" +
    "                                  translate=\".PROFILE_LOGOUT\"></div>\n" +
    "                        </md-list-item>\n" +
    "                    </md-list>\n" +
    "                </md-menu-content>\n" +
    "            </md-menu>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary', [
        'pascalprecht.translate',
        'chart.js',
        'znk.infra.exerciseUtility',
        'znk.infra-web-app.znkTimelineWebWrapper'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "ZNK_SUMMARY":{
                            "SUCCESS": "success",
                            "CORRECT": "Correct",
                            "AVG": "Avg",
                            "SEC": "sec",
                            "WRONG": "Missed",
                            "SKIPPED": "Skipped",
                            "CATEGORY": "Category",
                            "ESTIMATED_SCORE": "{{subjectName}} Estimated Score",
                            "MASTERY_LEVEL": "Mastery Level",
                            "MASTERY": "mastery",
                            "REVIEW": "REVIEW",
                            "TEST_TITLE": "Test Score:"
                        }
                    }
                );
            }]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary').component('znkSummaryResults', {
        templateUrl: 'components/znkSummary/templates/znkSummaryResults.template.html',
        bindings: {
            exerciseResult: '<'
        },
        controller: function() {
            'ngInject';

            var PERCENTAGE = 100;

            var vm = this;

            var questionsLength = vm.exerciseResult.correctAnswersNum + vm.exerciseResult.wrongAnswersNum + vm.exerciseResult.skippedAnswersNum;

            vm.avgTime = {
                correctAvgTime: Math.round(vm.exerciseResult.correctAvgTime / 1000),
                wrongAvgTime: Math.round(vm.exerciseResult.wrongAvgTime / 1000),
                skippedAvgTime: Math.round(vm.exerciseResult.skippedAvgTime / 1000)
            };

            vm.gaugeSuccessRate = questionsLength > 0 ? Math.round((vm.exerciseResult.correctAnswersNum * PERCENTAGE) / questionsLength) : 0;

            vm.performenceChart = {
                labels: ['Correct', 'Wrong', 'Unanswered'],
                data: [vm.exerciseResult.correctAnswersNum, vm.exerciseResult.wrongAnswersNum, vm.exerciseResult.skippedAnswersNum],
                colours: ['#87ca4d', '#ff6766', '#ebebeb'],
                options: {
                    segmentShowStroke: false,
                    percentageInnerCutout: 85,
                    showTooltips: false,
                    animation: false
                }
            };
        },
        controllerAs: 'vm'
    });
})(angular);



(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkSummary').component('znkSummaryTimeline', {
        templateUrl: 'components/znkSummary/templates/znkSummaryTimeline.template.html',
        bindings: {
            exerciseData: '<'
        },
        controller: ["SubjectEnum", function(SubjectEnum) {
            'ngInject';

            var vm = this;

            vm.seenSummary = vm.exerciseData.exerciseResult.seenSummary;
            vm.currentSubjectId = vm.exerciseData.exercise.subjectId;
            vm.activeExerciseId = vm.exerciseData.exercise.id;

            vm.subjectName = SubjectEnum.getValByEnum(vm.currentSubjectId);
        }],
        controllerAs: 'vm'
    });
})(angular);


angular.module('znk.infra-web-app.znkSummary').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkSummary/templates/znkSummaryResults.template.html",
    "<div class=\"gauge-row-wrapper\" translate-namespace=\"ZNK_SUMMARY\">\n" +
    "    <div class=\"overflowWrap\">\n" +
    "        <div class=\"gauge-wrap\">\n" +
    "            <div class=\"gauge-inner-text\">{{::vm.gaugeSuccessRate}}%\n" +
    "                <div class=\"success-title\" translate=\".SUCCESS\"></div>\n" +
    "            </div>\n" +
    "            <canvas\n" +
    "                id=\"doughnut\"\n" +
    "                class=\"chart chart-doughnut\"\n" +
    "                chart-options=\"vm.performenceChart.options\"\n" +
    "                chart-colours=\"vm.performenceChart.colours\"\n" +
    "                chart-data=\"vm.performenceChart.data\"\n" +
    "                chart-labels=\"vm.performenceChart.labels\"\n" +
    "                chart-legend=\"false\">\n" +
    "            </canvas>\n" +
    "        </div>\n" +
    "        <div class=\"statistics\">\n" +
    "            <div class=\"stat-row\">\n" +
    "                <div class=\"stat-val correct\">{{::vm.exerciseResult.correctAnswersNum}}</div>\n" +
    "                <div class=\"title\" translate=\".CORRECT\"></div>\n" +
    "                <div class=\"avg-score\"><span translate=\".AVG\"></span>. {{::vm.avgTime.correctAvgTime}} <span translate=\".SEC\"></span> </div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"stat-row\">\n" +
    "                <div class=\"stat-val wrong\">{{::vm.exerciseResult.wrongAnswersNum}}</div>\n" +
    "                <div class=\"title\" translate=\".WRONG\"></div>\n" +
    "                <div class=\"avg-score\"><span translate=\".AVG\"></span>. {{::vm.avgTime.wrongAvgTime}} <span translate=\".SEC\"></span></div>\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"stat-row\">\n" +
    "                <div class=\"stat-val skipped\">{{::vm.exerciseResult.skippedAnswersNum}}</div>\n" +
    "                <div class=\"title\" translate=\".SKIPPED\"></div>\n" +
    "                <div class=\"avg-score\"><span translate=\".AVG\"></span>. {{::vm.avgTime.skippedAvgTime}}  <span translate=\".SEC\"></span></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkSummary/templates/znkSummaryTimeline.template.html",
    "<div class=\"time-line-wrapper\" translate-namespace=\"ZNK_SUMMARY\"\n" +
    "     ng-class=\"{'seen-summary': vm.seenSummary}\">\n" +
    "    <div class=\"estimated-score-title\">\n" +
    "        <span translate=\".ESTIMATED_SCORE\"\n" +
    "              translate-values=\"{ subjectName: vm.subjectName  }\">\n" +
    "        </span>\n" +
    "    </div>\n" +
    "    <znk-timeline-web-wrapper\n" +
    "        subject-id=\"{{::vm.currentSubjectId}}\"\n" +
    "        active-exercise-id=\"::vm.activeExerciseId\">\n" +
    "    </znk-timeline-web-wrapper>\n" +
    "</div>\n" +
    "");
}]);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkTimelineWebWrapper', [
        'znk.infra.znkTimeline',
        'znk.infra.estimatedScore',
        'znk.infra-web-app.userGoals',
        'znk.infra.scoring'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkTimelineWebWrapper')
        .config(
            ["$translateProvider", function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "TIMELINE_WEB_WRAPPER": {
                            "POINTS_LEFT": "{{points}} pts to go!"
                        }
                    }
                );
            }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkTimelineWebWrapper').component('znkTimelineWebWrapper', {
        templateUrl: 'components/znkTimelineWebWrapper/templates/znkTimelineWebWrapper.template.html',
        bindings: {
            activeExerciseId: '=?'
        },
        controllerAs: 'vm',
        controller: ["EstimatedScoreSrv", "UserGoalsService", "ScoringService", "SubjectEnum", "$q", "$attrs", "$element", "ExerciseTypeEnum", function (EstimatedScoreSrv, UserGoalsService, ScoringService, SubjectEnum, $q, $attrs, $element, ExerciseTypeEnum) {
            'ngInject';

            var vm = this;
            var estimatedScoresDataProm = EstimatedScoreSrv.getEstimatedScoresData();
            var getGoalsProm = UserGoalsService.getGoals();
            var inProgressProm = false;
            var subjectEnumToValMap = SubjectEnum.getEnumMap();
            var scoringLimits = ScoringService.getScoringLimits();
            var maxScore = (scoringLimits.subjects && scoringLimits.subjects.max) ? scoringLimits.subjects.max : 0;
            var minScore = (scoringLimits.subjects && scoringLimits.subjects.min) ? scoringLimits.subjects.min : 0;
            var currentSubjectId;

            // options
            var optionsPerDevice = {
                width: 705,
                height: 150,
                distance: 90,
                upOrDown: 100,
                yUp: 30,
                yDown: 100
            };

            var subjectIdToIndexMap = {};
            subjectIdToIndexMap[ExerciseTypeEnum.TUTORIAL.enum] = 'tutorial';
            subjectIdToIndexMap[ExerciseTypeEnum.PRACTICE.enum] = 'practice';
            subjectIdToIndexMap[ExerciseTypeEnum.GAME.enum] = 'game';
            subjectIdToIndexMap[ExerciseTypeEnum.SECTION.enum] = 'section';
            subjectIdToIndexMap[ExerciseTypeEnum.DRILL.enum] = 'drill';
            subjectIdToIndexMap.diagnostic = 'diagnostic';


            vm.options = {
                colorId: vm.currentSubjectId,
                isMobile: false,
                width: optionsPerDevice.width,
                height: optionsPerDevice.height,
                isSummery: (vm.activeExerciseId) ? vm.activeExerciseId : false,
                type: 'multi',
                isMax: true,
                max: maxScore,
                min: minScore,
                subPoint: 35,
                distance: optionsPerDevice.distance,
                lineWidth: 2,
                numbers: {
                    font: '200 12px Lato',
                    fillStyle: '#4a4a4a'
                },
                onFinish: function (obj) {
                    var summeryScore = obj.data.summeryScore;
                    var scoreData;

                    if (summeryScore) {
                        scoreData = _getSummaryData(summeryScore);
                    } else {
                        scoreData = _getRegularData(obj.data.lastLine);
                    }

                    vm.timelineMinMaxStyle = { 'top': scoreData.y + 'px', 'left': scoreData.x + 'px' };

                    _getPromsOrValue().then(function (results) {
                        var userGoals = results[1];
                        var points = userGoals[subjectEnumToValMap[currentSubjectId]] - scoreData.score;
                        vm.goalPerSubject = scoreData.score;
                        vm.points = (points > 0) ? points : false;
                    });

                    if (scoreData.score && scoreData.prevScore) {
                        if (scoreData.score > scoreData.prevScore) {
                            vm.timelineLinePlus = '+' + (scoreData.score - scoreData.prevScore);
                            vm.isRed = false;
                        } else if (scoreData.score < scoreData.prevScore) {
                            vm.timelineLinePlus = '-' + (scoreData.prevScore - scoreData.score);
                            vm.isRed = true;
                        }
                    }

                    _scrolling();
                }
            };

            function _getSummaryData(summeryScore) {
                var x = summeryScore.lineTo.x;
                var y = (summeryScore.lineTo.y < optionsPerDevice.upOrDown) ? summeryScore.lineTo.y + optionsPerDevice.yDown : summeryScore.lineTo.y - optionsPerDevice.yUp;
                var angleDeg;
                if (summeryScore.next) {
                    angleDeg = Math.atan2(summeryScore.lineTo.y - summeryScore.next.y, summeryScore.lineTo.x - summeryScore.next.x) * 180 / Math.PI;
                }

                if (angleDeg && angleDeg < -optionsPerDevice.upOrDown && summeryScore.lineTo.y < optionsPerDevice.upOrDown) {
                    x -= 30;
                }

                return {
                    x: x,
                    y: y,
                    score: summeryScore.score,
                    prevScore: summeryScore.prev.score
                };
            }

            function _getRegularData(lastLineObj) {
                var lastLine = lastLineObj[lastLineObj.length - 1];
                var beforeLast = lastLineObj[lastLineObj.length - 2];
                var x = lastLine.lineTo.x - 13;
                var y = (lastLine.lineTo.y < optionsPerDevice.upOrDown) ? lastLine.lineTo.y + optionsPerDevice.yDown : lastLine.lineTo.y - optionsPerDevice.yUp;
                var angleDeg = Math.atan2(lastLine.lineTo.y - beforeLast.lineTo.y, lastLine.lineTo.x - beforeLast.lineTo.x) * 180 / Math.PI;

                if (angleDeg < -40 || angleDeg > 40) {
                    x += 20;
                }

                return {
                    x: x,
                    y: y,
                    score: lastLine.score,
                    prevScore: beforeLast.score
                };
            }


            function _scrolling() {
                var domElement = $element.children()[0];
                if (domElement.scrollWidth > domElement.clientWidth) {
                    domElement.scrollLeft += domElement.scrollWidth - domElement.clientWidth;
                }
            }

            function _getPromsOrValue() {
                if (!inProgressProm) {
                    inProgressProm = $q.all([estimatedScoresDataProm, getGoalsProm]);
                }
                return (angular.isFunction(inProgressProm)) ? inProgressProm : $q.when(inProgressProm);
            }

            function addIconKey(dataPerSubject) {
                var newDataArr = [];
                angular.forEach(dataPerSubject, function (value, index) {
                    var type = subjectIdToIndexMap[value.exerciseType];
                    if (index === 0 && type === 'section') {
                        type = 'diagnostic';
                    }
                    value.iconKey = type || false;
                    newDataArr.push(value);
                });
                return newDataArr;
            }

            function _getRoundScore(estimatedScoresDatePerSubject) {
                return estimatedScoresDatePerSubject.map(function(scoreData) {
                    scoreData.score = Math.round(scoreData.score) || 0;
                    return scoreData;
                });
            }

            $attrs.$observe('subjectId', function (newVal, oldVal) {
                if (newVal === oldVal || newVal === '') {
                    return;
                }
                currentSubjectId = vm.currentSubjectId = newVal;
                _getPromsOrValue().then(function (results) {
                    inProgressProm = results;
                    var estimatedScoresData = results[0];
                    var estimatedScoresDatePerSubject = _getRoundScore(estimatedScoresData[currentSubjectId]);
                    vm.animation = true;
                    vm.timelineLinePlus = false;
                    vm.timeLineData = {
                        data: addIconKey(estimatedScoresDatePerSubject),
                        id: currentSubjectId
                    };
                    vm.points = 0;
                });
            });
        }]
    });
})(angular);

angular.module('znk.infra-web-app.znkTimelineWebWrapper').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkTimelineWebWrapper/templates/znkTimelineWebWrapper.template.html",
    "<div class=\"znk-timeline-web-wrapper znk-scrollbar\" translate-namespace=\"TIMELINE_WEB_WRAPPER\">\n" +
    "    <div class=\"time-line-wrapper\">\n" +
    "        <div class=\"progress-val\"\n" +
    "             ng-style=\"vm.timelineMinMaxStyle\"\n" +
    "             ng-if=\"vm.timeLineData.data.length\">\n" +
    "            <div class=\"goal-wrapper\">{{vm.goalPerSubject}}\n" +
    "                <div class=\"timeline-plus\"\n" +
    "                     ng-if=\"vm.timelineLinePlus\"\n" +
    "                     ng-class=\"{ 'red-point': vm.isRed, 'green-point': !vm.isRed }\">\n" +
    "                    {{vm.timelineLinePlus}}\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"progress-title\"\n" +
    "                 ng-style=\"{ visibility: (vm.points) ? 'visiable' : 'hidden' }\"\n" +
    "                 translate=\".POINTS_LEFT\"\n" +
    "                 translate-values=\"{points: {{vm.points}} }\">\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <canvas znk-timeline\n" +
    "                timeline-data=\"vm.timeLineData\"\n" +
    "                timeline-settings=\"vm.options\">\n" +
    "        </canvas>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
