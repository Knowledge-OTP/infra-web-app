'use strict';

angular.module('demo', [
    'znk.infra-web-app.workoutsRoadmap',
    'pascalprecht.translate'])
    .config(function ($translateProvider, WorkoutsRoadmapSrvProvider, $stateProvider) {
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: '/{part}/locale/{lang}.json'
        })
        .preferredLanguage('en');

        function newWorkoutGetter($q){
            return function(){
                return $q.when({
                    2: {
                        id: 1
                    },
                    5: {
                        id: 2
                    },
                    10:{
                        id: 3
                    }
                });
            };
        }
        WorkoutsRoadmapSrvProvider.setNewWorkoutGeneratorGetter(newWorkoutGetter);

        $stateProvider.state('workoutsRoadmap.diagnostic.summary', {
            template: '<div>Diagnostic SUMMARY</div><button ui-sref="workoutsRoadmap.workout">Go To Workout</button>',
            controller: function(){

            }
        }).state('workoutsRoadmap.workout.inProgress', {
            template: '<div>Diagnostic SUMMARY</div><button ng-click="vm.continue()">Continue work</button>',
            controller: function(){
                this.continue = function(){
                    alert('continue workout');
                };
            },
            controllerAs: 'vm'
        });
    })
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        });
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error.message);
        });
    })
    .run(function ($state) {
        $state.go('workoutsRoadmap');
    });
