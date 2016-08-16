(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseHeader', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseHeader/completeExerciseHeaderDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: function ($translate, $q, ExerciseParentEnum) {
                'ngInject';

                var $ctrl = this;

                function _setLeftTitle(){
                    var exerciseParentTypeId = $ctrl.completeExerciseCtrl.exerciseDetails.exerciseParentTypeId;
                    var titlePrefixTranslateKey = 'COMPLETE_EXERCISE.EXERCISE_PARENT.TYPE_' + exerciseParentTypeId ;
                    var translatePromMap = {
                        leftTitle: $translate(titlePrefixTranslateKey, $ctrl.completeExerciseCtrl)
                    };
                    $q.all(translatePromMap).then(function(translationMap){
                        // var exerciseParentTypeId = $ctrl.completeExerciseCtrl.exerciseDetails.exerciseParentTypeId;
                        // var exerciseParentId = $ctrl.completeExerciseCtrl.exerciseDetails.exerciseParentId;
                        //
                        // var titlePrefix = translationMap.titlePrefix ;
                        // switch(exerciseParentTypeId){
                        //     case ExerciseParentEnum.WORKOUT.enum:
                        //         titlePrefix += exerciseParentId;
                        //         break;
                        //     case ExerciseParentEnum.TUTORIAL.enum:
                        //         break;
                        //     case ExerciseParentEnum.EXAM.enum:
                        //         var exerciseParentContent = $ctrl.completeExerciseCtrl.exerciseData.exerciseParentContent;
                        //         titlePrefix += ' ' + exerciseParentContent.name;
                        //         break;
                        // }
                        // titlePrefix += ': ';

                        $ctrl.leftTitle = translationMap.leftTitle;
                    },function(err){
                        // debugger;
                    });
                }

                this.$onInit = function(){
                    _setLeftTitle();
                    $ctrl.exerciseContent = $ctrl.completeExerciseCtrl.exerciseData.exerciseContent;

                    var propsToCopyFromExerciseData = ['exerciseContent','exerciseResult'];
                    propsToCopyFromExerciseData.forEach(function(propName){
                        $ctrl[propName] = $ctrl.completeExerciseCtrl.exerciseData[propName];
                    });
                };
            }
        });
})(angular);
