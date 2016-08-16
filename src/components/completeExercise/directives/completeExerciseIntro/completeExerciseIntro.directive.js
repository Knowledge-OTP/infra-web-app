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


                this.$onInit = function () {
                    this.exerciseContent = this.completeExerciseCtrl.exerciseData.exerciseContent;
                    this.exerciseTypeId = this.completeExerciseCtrl.exerciseDetails.exerciseTypeId;
                    this.VIEW_STATES = CompleteExerciseSrv.VIEW_STATES;
                };
            }
        });
})(angular);
