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

                this.goToQuestions = function(){
                    var exerciseResult = this.completeExerciseCtrl.exerciseData.exerciseResult;
                    exerciseResult.seenIntro = true;
                    exerciseResult.$save().then(function(){
                        $ctrl .completeExerciseCtrl.changeViewState(CompleteExerciseSrv.VIEW_STATES.EXERCISE);
                    });
                };

                this.getExerciseContent = function(){
                    return this.completeExerciseCtrl.getExerciseContent();
                };

                this.$onInit = function () {
                    this.exerciseTypeId = this.completeExerciseCtrl.exerciseDetails.exerciseTypeId;
                };
            }
        });
})(angular);
