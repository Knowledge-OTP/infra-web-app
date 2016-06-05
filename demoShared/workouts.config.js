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

    function newWorkoutGetter($q, SubjectEnum){
        return function(subjectToIgnore){
            var keys = SubjectEnum.getEnumArr().map(function(item){
                return item.enum;
            });
            var subjectId;
            keys.forEach(function(key){
                if(angular.isUndefined(subjectId) && subjectToIgnore.indexOf(key) === -1){
                    subjectId = key;
                }
            });
            return $q.when({
                2: {
                    id: 1,
                    subjectId: subjectId
                },
                5: {
                    id: 2,
                    subjectId: subjectId
                },
                10:{
                    id: 3,
                    subjectId: subjectId
                }
            });
        };
    }
    WorkoutsRoadmapSrvProvider.setNewWorkoutGeneratorGetter(newWorkoutGetter);

    WorkoutsRoadmapSrvProvider.setWorkoutAvailTimes([2,5,10]);
});
