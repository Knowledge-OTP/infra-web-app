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
            controller: function ($log, ExerciseResultSrv, ExerciseTypeEnum, $q, BaseExerciseGetterSrv, CompleteExerciseSrv, $translatePartialLoader, ExerciseParentEnum, $timeout) {
                'ngInject';

                var $ctrl = this;

                var VIEW_STATES = CompleteExerciseSrv.VIEW_STATES;

                function _rebuildExercise() {

                    $ctrl.changeViewState(VIEW_STATES.NONE);

                    $timeout(function () {
                        var exerciseDetails = $ctrl.exerciseDetails;

                        var isExam = exerciseDetails.exerciseParentTypeId === ExerciseParentEnum.EXAM.enum;
                        var exerciseParentContent = isExam ? BaseExerciseGetterSrv.getExerciseByNameAndId('exam', exerciseDetails.exerciseParentId) : null;

                        var getDataPromMap = {
                            exerciseResult: CompleteExerciseSrv.getExerciseResult(exerciseDetails),
                            exerciseContent: BaseExerciseGetterSrv.getExerciseByTypeAndId(exerciseDetails.exerciseTypeId, exerciseDetails.exerciseId),
                            exerciseParentContent: exerciseParentContent
                        };
                        $q.all(getDataPromMap).then(function (data) {
                            $ctrl.exerciseData = data;
                            var exerciseTypeId = data.exerciseResult.exerciseTypeId;
                            var isSection = exerciseTypeId === ExerciseTypeEnum.SECTION.enum;
                            var isTutorial = exerciseTypeId === ExerciseTypeEnum.TUTORIAL.enum;
                            if ((isSection || isTutorial) && !data.exerciseResult.seenIntro) {
                                $ctrl.changeViewState(VIEW_STATES.INTRO);
                                return;
                            }

                            var isExerciseCompleted = data.exerciseResult.isComplete;
                            if(isExerciseCompleted){
                                $ctrl.changeViewState(VIEW_STATES.SUMMARY);
                            }else{
                                $ctrl.changeViewState(VIEW_STATES.EXERCISE);
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

                this.changeViewState = function (newViewState) {
                    $ctrl.currViewState = newViewState;
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
                };

                this.$onChanges = function (changesObj) {
                    if (!changesObj.exerciseDetails.currentValue) {
                        $ctrl.changeViewState(VIEW_STATES.NONE);
                        return;
                    }

                    var newExerciseDetails = changesObj.exerciseDetails.currentValue;

                    var isExerciseParentTypeIdNotProvided = angular.isUndefined(newExerciseDetails.exerciseParentTypeId);
                    var isExerciseTypeIdNotProvided = angular.isUndefined(newExerciseDetails.exerciseTypeId);
                    var isExerciseIdNotProvided = angular.isUndefined(newExerciseDetails.exerciseId);
                    if (isExerciseParentTypeIdNotProvided || isExerciseTypeIdNotProvided || isExerciseIdNotProvided) {
                        $log.error('completeExercise: new exerciseDetails is missing data');
                        return;
                    }

                    _rebuildExercise();
                };

                $translatePartialLoader.addPart('completeExercise');
            }
        });
})(angular);