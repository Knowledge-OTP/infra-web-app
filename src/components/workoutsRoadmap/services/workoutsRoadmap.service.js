(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv', [
        function () {
            var _newWorkoutGeneratorGetter;
            this.setNewWorkoutGeneratorGetter = function(newWorkoutGeneratorGetter){
                _newWorkoutGeneratorGetter = newWorkoutGeneratorGetter;
            };

            this.$get = function($injector, $log, $q){
                'ngInject';

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function(subjectToIgnoreForNextDaily){
                    if(!_newWorkoutGeneratorGetter){
                        $log.error('WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!');
                    }

                    var newExerciseGenerator = $injector.invoke(_newWorkoutGeneratorGetter);
                    return $q.when(newExerciseGenerator(subjectToIgnoreForNextDaily));
                };

                return WorkoutsRoadmapSrv;
            };
        }
    ]);
})(angular);
