(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExercise/completeExerciseDirective.template.html',
            bindings: {
                exerciseData: '<'
            },
            controller: function ($log, ExerciseResultSrv, ExerciseTypeEnum, $q, BaseExerciseGetterSrv) {
                'ngInject';

                var exerciseData;

                var $ctrl = this;

                var VIEW_STATES = {
                    NONE: 0,
                    INTRO: 1,
                    EXERCISE: 2,
                    SUMMARY: 3
                };
                $ctrl.currViewState = VIEW_STATES.NONE;

                function _getUid(){

                }
                function _getExerciseResult(){
                    switch(exerciseData.exerciseTypeId){
                        case ExerciseTypeEnum.SECTION.enum:
                            return ExerciseResultSrv.getExerciseResult(exerciseData.exerciseTypeId,exerciseData.exerciseId, exerciseData.parentId);
                        case ExerciseTypeEnum.LECTURE.enum:
                            return _getUid().then(function(uid){
                                return ExerciseResultSrv.getModuleExerciseResult(uid,exerciseData.parentId);
                            });
                    }
                }

                function _rebuildExercise(){
                    $ctrl.currViewState = VIEW_STATES.NONE;

                    var getDataPromMap = {
                        exerciseResult: _getExerciseResult(),
                        exerciseContent: BaseExerciseGetterSrv.getExerciseByTypeAndId(exerciseData.exerciseTypeId,exerciseData.exerciseId)
                    };
                    $q.all(getDataPromMap).then(function(data){
                        angular.extend($ctrl, data);

                        var exerciseTypeId = data.exerciseResult.exerciseTypeId;
                        var isSection = exerciseTypeId  === ExerciseTypeEnum.SECTION.enum;
                        var isTutorial = exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum;

                        if((isSection || isTutorial) && !data.exerciseResult.seenIntro){
                            $ctrl.currViewState = VIEW_STATES.INTRO;
                            return;
                        }
                    });
                }

                this.$onInit = function () {

                };

                this.$onChanges = function (changesObj) {
                    if (!changesObj.exerciseData.currentValue) {
                        $ctrl.currViewState = VIEW_STATES.NONE;
                        return;
                    }

                    var newExerciseData = changesObj.exerciseData.currentValue;

                    if (angular.equals(exerciseData, newExerciseData)) {
                        $log.debug('completeExercise: same exercise data was received.');
                        return;
                    }

                    var isExerciseParentIdNotProvided = angular.isUndefined(newExerciseData.exerciseParentId);
                    var isExerciseTypeIdNotProvided = angular.isUndefined(newExerciseData.exerciseTypeId);
                    var isExerciseIdNotProvided = angular.isUndefined(newExerciseData.exerciseId);
                    if (isExerciseParentIdNotProvided || isExerciseTypeIdNotProvided || isExerciseIdNotProvided) {
                        $log.error('completeExercise: new exerciseData is missing data');
                        return;
                    }

                    exerciseData = newExerciseData;
                    _rebuildExercise();
                };
            }
        });
})(angular);

// export const completeExerciseDirective = {
//     restrict: 'E',
//     templateUrl: 'app/components/completeExercise/directives/completeExerciseDirective.template.html',
//     controller: function (ScreenSharingSrv, $q, BaseExerciseGetterSrv, ExerciseResultSrv, $timeout, InfraConfigSrv, UserProfileService, $state) {
//         'ngInject';
//         $state.go('app.eTutoring');
//
//
//         var resultPathBindedToServer, timeoutProm;
//
//         var _getExerciseDataPromMap = () => {
//             var exerciseTypeId = this.activeExercise.exerciseTypeId;
//             var exerciseId = this.activeExercise.exerciseId;
//
//             var exerciseDataPromMap = {
//                 exercise: BaseExerciseGetterSrv.getExerciseByTypeAndId(exerciseTypeId, exerciseId)
//             };
//
//             exerciseDataPromMap.exerciseResult = exerciseDataPromMap.exercise.then(function (exercise) {
//                 return ExerciseResultSrv.getExerciseResult(exerciseTypeId, exerciseId, exercise.examId);
//             });
//
//             return exerciseDataPromMap;
//         };
//
//         var _setSharerName = () => {
//             if (!this.screenSharingData || !this.screenSharingData.sharerId) {
//                 return;
//             }
//
//             UserProfileService.getUserName(this.screenSharingData.sharerId).then((sharerName) => {
//                 this.sharerName = sharerName || '';
//             });
//         };
//
//         var _killResultChangeListener = () => {
//             if (!resultPathBindedToServer) {
//                 return $q.when();
//             }
//             //  was init in order to not be depend on resultPathBindedToServer which may be changed while
//             //  waiting for student storage
//             var pathToKill = resultPathBindedToServer;
//             return InfraConfigSrv.getStudentStorage().then((studentStorage) => {
//                 studentStorage.offEvent('value', pathToKill);
//             });
//         };
//
//         var _bindResultToServer = (result) => {
//             InfraConfigSrv.getStudentStorage().then((studentStorage) => {
//                 resultPathBindedToServer = result.$$path;// eslint-disable-line
//                 studentStorage.onEvent('value', resultPathBindedToServer, function (newResultData) {
//                     var updatedQuestionsResults = result.questionResults;
//                     var newQuestionsResults = newResultData.questionResults;
//
//                     if (!newQuestionsResults) {
//                         return;
//                     }
//
//                     angular.forEach(updatedQuestionsResults, function (questionResult, index) {
//                         var newQuestionResult = newQuestionsResults[index];
//                         angular.extend(questionResult, newQuestionResult);
//                     });
//
//                     angular.extend(result, newResultData);
//
//                     result.questionResults = updatedQuestionsResults;
//                 });
//             });
//         };
//
//         var _screenSharingDataChangeHandler = (newScreenSharingData) => {
//             var addResultChangeListener;
//
//             if (timeoutProm) {
//                 $timeout.cancel(timeoutProm);
//             }
//
//             this.screenSharingData = newScreenSharingData;
//
//             _setSharerName();
//
//             var activeExercise = newScreenSharingData.activeExercise;
//
//             if (!activeExercise) {
//                 this.activeScreen = 'NONE';
//                 _killResultChangeListener();
//                 return;
//             }
//
//             if (this.activeExercise) {
//                 var isDiffExerciseType = activeExercise.exerciseTypeId !== this.activeExercise.exerciseTypeId;
//                 var isDiffExerciseId = activeExercise.exerciseId !== this.activeExercise.exerciseId;
//                 if (isDiffExerciseType || isDiffExerciseId) {
//                     _killResultChangeListener();
//                     addResultChangeListener = true;
//                     this.activeScreen = null;
//                 }
//             } else {
//                 addResultChangeListener = true;
//             }
//             this.activeExercise = activeExercise;
//
//             //  remove current view state
//             timeoutProm = $timeout(() => {
//                 var exerciseDataPromMap = _getExerciseDataPromMap();
//                 $q.all(exerciseDataPromMap).then((exerciseData) => {
//                     this.exerciseData = exerciseData;
//                     this.exerciseData.exerciseTypeId = this.activeExercise.exerciseTypeId;
//                     this.exerciseData.exerciseId = this.activeExercise.exerciseId;
//                     if (addResultChangeListener) {
//                         _bindResultToServer(exerciseData.exerciseResult);
//                     }
//
//                     // InfraConfigSrv.getStudentStorage().then((studentStorage) => {
//                     //     studentStorage.onEvent('value', exerciseData.exerciseResult.$$path, function (newResultData) {// eslint-disable-line
//                     //         debugger;
//                     //         angular.extend(exerciseData.exerciseResult, newResultData);
//                     //     });
//                     // });
//                 }).then(() => {
//                     this.activeScreen = this.activeExercise.activeScreen || 'NONE';
//                 });
//             });
//         };
//         var _registerToScreenSharingDataChanges = () => {
//             ScreenSharingSrv.registerToActiveScreenSharingDataChanges(_screenSharingDataChangeHandler);
//         };
//
//         this.$onInit = () => {
//             _registerToScreenSharingDataChanges();
//         };
//
//         this.$onDestroy = () => {
//             _killResultChangeListener();
//             ScreenSharingSrv.unregisterFromCurrUserScreenSharingStateChanges(_screenSharingDataChangeHandler);
//         };
//
//         this.activeScreen = null;
//     }
// };
