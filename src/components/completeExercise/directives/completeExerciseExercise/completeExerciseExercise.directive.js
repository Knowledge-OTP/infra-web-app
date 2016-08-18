(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseExercise/completeExerciseExerciseDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: function ($controller, CompleteExerciseSrv) {
                'ngInject';

                var $ctrl = this;

                function _initTimersVitalData(){
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();

                    if(angular.isUndefined(exerciseResult.duration)){
                        exerciseResult.duration = 0;
                    }

                    $ctrl.timerConfig = {
                        countDown: true,
                        max: exerciseContent.time
                    };
                }

                function _invokeExerciseCtrl(){
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();

                    var settings = {
                        exerciseContent: exerciseContent,
                        exerciseResult: exerciseResult,
                        actions:{
                            done: function(){
                                $ctrl.completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.SUMMARY);
                            }
                        }
                    };

                    $ctrl.znkExercise = $controller('CompleteExerciseBaseZnkExerciseCtrl',{
                        settings: settings
                    });
                }

                this.$onInit = function () {
                    _initTimersVitalData();

                    _invokeExerciseCtrl();
                };
            }
        });
})(angular);
