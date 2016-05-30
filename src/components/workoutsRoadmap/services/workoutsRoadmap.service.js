(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv', [
        function () {
            var _newWorkoutGeneratorGetter;
            this.setNewWorkoutGeneratorGetter = function(newWorkoutGeneratorGetter){
                _newWorkoutGeneratorGetter = newWorkoutGeneratorGetter;
            };


            var _workoutAvailTimesGetter;
            this.setWorkoutAvailTimes = function(workoutAvailTimesGetter){
                _workoutAvailTimesGetter = workoutAvailTimesGetter;
            };

            this.$get = function($injector, $log, $q){
                'ngInject';

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function(subjectToIgnoreForNextDaily){
                    if(!_newWorkoutGeneratorGetter){
                        var errMsg = 'WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    var newExerciseGenerator = $injector.invoke(_newWorkoutGeneratorGetter);
                    return $q.when(newExerciseGenerator(subjectToIgnoreForNextDaily));
                };

                WorkoutsRoadmapSrv.getWorkoutAvailTimes = function(){
                    if(!_workoutAvailTimesGetter){
                        var errMsg = 'WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    var workoutAvailTimes;
                    if(angular.isFunction(_workoutAvailTimesGetter)){
                        workoutAvailTimes = $injector.invoke(_workoutAvailTimesGetter);
                    }else{
                        workoutAvailTimes = _workoutAvailTimesGetter;
                    }

                    return $q.when(workoutAvailTimes);
                };

                return WorkoutsRoadmapSrv;
            };
        }
    ]);
})(angular);
