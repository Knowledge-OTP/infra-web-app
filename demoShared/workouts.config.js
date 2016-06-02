'use strict';

angular.module('demo').config(function(WorkoutsRoadmapSrvProvider, $stateProvider){
    $stateProvider.state('workoutsRoadmap.diagnostic.summary', {
        template:
            '<div>Diagnostic SUMMARY</div>' +
            '<button ui-sref="workoutsRoadmap.workout">Go To Workout</button>',
        controller: function(){

        }
    }).state('workoutsRoadmap.workout.inProgress', {
        template:
            '<div>Diagnostic SUMMARY</div>' +
            '<button ng-click="vm.continue()">Continue work</button>',
        controller: function(){
            this.continue = function(){
                alert('continue workout');
            };
        },
        controllerAs: 'vm'
    });

    function newWorkoutGetter($q){
        return function(){
            return $q.when({
                2: {
                    id: 1,
                    subjectId: 0
                },
                5: {
                    id: 2,
                    subjectId: 0
                },
                10:{
                    id: 3,
                    subjectId: 0
                }
            });
        };
    }
    WorkoutsRoadmapSrvProvider.setNewWorkoutGeneratorGetter(newWorkoutGetter);

    WorkoutsRoadmapSrvProvider.setWorkoutAvailTimes([2,5,10]);
});
