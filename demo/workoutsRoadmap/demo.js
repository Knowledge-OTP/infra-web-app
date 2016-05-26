angular.module('demo', [
    'znk.infra-web-app.workoutsRoadmap',
    'pascalprecht.translate'])
    .config(function ($translateProvider, WorkoutsRoadmapSrvProvider) {
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
    })
    .run(function ($rootScope, $translate) {
        $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
            $translate.refresh();
        })
    })
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            console.error(error.message);
        });
    })
    .run(function ($state) {
        $state.go('workoutsRoadmap');
    });
