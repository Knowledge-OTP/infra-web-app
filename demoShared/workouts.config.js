'use strict';

angular.module('demo').config(function(WorkoutsRoadmapSrvProvider, $stateProvider){
    $stateProvider.state('workoutsRoadmap.diagnostic.summary', {
        template:
            '<div>Diagnostic SUMMARY</div>' +
            '<button ui-sref="workoutsRoadmap.workout">Go To Workout</button>',
        controller: function(){

        }
    }).state('workoutsRoadmap.workout.summary', {
        template: '<div>Workout SUMMARY</div>'
    });

    function newWorkoutGetter($q, SubjectEnum, ExerciseTypeEnum){
        return function(subjectToIgnore){
            var keys = SubjectEnum.getEnumArr().map(function(item){
                return item.enum;
            });
            var subjectId;
            keys.forEach(function(key){
                if(angular.isUndefined(subjectId) && (!angular.isArray(subjectToIgnore) || subjectToIgnore.indexOf(key) === -1)){
                    subjectId = key;
                }
            });
            return $q.when({
                2: {
                    id: 1,
                    subjectId: subjectId,
                    exerciseTypeId: ExerciseTypeEnum.DRILL.enum
                },
                10:{
                    id: 3,
                    subjectId: subjectId,
                    exerciseTypeId: ExerciseTypeEnum.PRACTICE.enum
                }
            });
        };
    }
    WorkoutsRoadmapSrvProvider.setNewWorkoutGeneratorGetter(newWorkoutGetter);

    WorkoutsRoadmapSrvProvider.setWorkoutAvailTimes([2,5,10]);
});
