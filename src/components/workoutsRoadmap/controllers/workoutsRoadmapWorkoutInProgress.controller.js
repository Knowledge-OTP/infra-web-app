(function (angular) {
    'use strict';
    
    angular.module('znk.infra-web-app.workoutsRoadmap').controller('WorkoutsRoadMapWorkoutInProgressController',
        function (data, ExerciseResultSrv) {
            'ngInject';

            var vm = this;

            vm.workout = data.exercise;

            ExerciseResultSrv.getExerciseResult(vm.workout.exerciseTypeId, vm.workout.exerciseId, null, null, true).then(function(exerciseResult){
                vm.exerciseResult = exerciseResult;
                exerciseResult.totalQuestionNum = exerciseResult.totalQuestionNum || 0;
                exerciseResult.totalAnsweredNum = exerciseResult.totalAnsweredNum || 0;
            });
        }
    );
})(angular);
