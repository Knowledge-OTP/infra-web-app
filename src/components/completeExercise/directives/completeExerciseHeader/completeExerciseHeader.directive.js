(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseHeader', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseHeader/completeExerciseHeader.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            transclude:{
                'centerPart': '?centerPart',
                'preRightPart': '?preRightPart'
            },
            controller: function ($translate, $q) {
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

                function _getSubjectId(exerciseData) {
                    var subjectIdToReturn;
                    if (isVarDefined(exerciseData.level1CategoryId)) {
                        subjectIdToReturn = exerciseData.level1CategoryId;
                    } else {
                        subjectIdToReturn = isVarDefined(exerciseData.exerciseResult.subjectId) ?
                            exerciseData.exerciseResult.subjectId : exerciseData.exerciseContent.subjectId;
                    }
                    return subjectIdToReturn;
                }

                function isVarDefined(variable) {
                    return !(typeof variable === 'undefined' || variable === null);
                }

                this.$onInit = function(){
                    _setLeftTitle();

                    $ctrl.exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();
                    $ctrl.exerciseSubjectId = _getSubjectId($ctrl.completeExerciseCtrl.exerciseData);
                };
            }
        });
})(angular);
