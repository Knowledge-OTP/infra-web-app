(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseExercise', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseExercise/completeExerciseExerciseDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: function ($controller) {
                'ngInject';

                var $ctrl = this;

                function _invokeExerciseCtrl(){
                    var exerciseContent = $ctrl.completeExerciseCtrl.getExerciseContent();
                    var exerciseResult = $ctrl.completeExerciseCtrl.getExerciseResult();
                    var exerciseTypeId = $ctrl.completeExerciseCtrl.getExerciseTypeId();

                    $controller('CompleteExerciseBaseZnkExerciseCtrl',{
                        exerciseContent: exerciseContent,
                        exerciseResult: exerciseResult
                    });
                }

                this.$onInit = function () {
                    _invokeExerciseCtrl();

                };
            }
        });
})(angular);
