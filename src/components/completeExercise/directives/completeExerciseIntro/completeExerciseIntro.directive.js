(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .component('completeExerciseIntro', {
            restrict: 'E',
            templateUrl: 'components/completeExercise/directives/completeExerciseIntro/completeExerciseIntroDirective.template.html',
            require: {
                completeExerciseCtrl: '^completeExercise'
            },
            controller: function (CompleteExerciseSrv) {
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
            }
        });
})(angular);
