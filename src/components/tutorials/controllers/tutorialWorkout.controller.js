(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tutorials').controller('TutorialWorkoutController',
        function(exerciseData) {
            'ngInject';
            this.completeExerciseDetails = {
            exerciseId: exerciseData.exerciseId,
            exerciseTypeId: exerciseData.exerciseTypeId,
            exerciseParentTypeId: exerciseData.exerciseParentTypeId
        };

        this.completeExerciseSettings = {
            exitAction: exerciseData.exitAction
        };
        }
    );
})(angular);
