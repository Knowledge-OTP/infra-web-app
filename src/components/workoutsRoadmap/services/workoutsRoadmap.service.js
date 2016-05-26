(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.workoutsRoadmap').provider('WorkoutsRoadmapSrv', [ 
        function () {
            var _newWorkoutGeneratorGetter;
            this.setNewWorkoutGeneratorGetter = function(newWorkoutGeneratorGetter){
                _newWorkoutGeneratorGetter = newWorkoutGeneratorGetter;
            };

            this.$get = function($injector){
                'ngInject';

                var WorkoutsRoadmapSrv = {};

                WorkoutsRoadmapSrv.generateNewExercise = function(subjectToIgnoreForNextDaily){
                    if(!_newWorkoutGeneratorGetter){
                        $log.error('WorkoutsRoadmapSrv: newWorkoutGeneratorGetter wsa not defined !!!!');
                    }

                    var newExerciseGenerator = $injector.invoke();
                    return $q.when()
                };

                return WorkoutsRoadmapSrv;
            };
        }
    ]);
})(angular);
