(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tutorials').config([
        '$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('app.tutorials', {
                        url: '/tipsAndTricks',
                        templateUrl: 'components/tutorials/templates/tutorialsRoadmap.template.html',
                        controller: 'TutorialsRoadmapController',
                        controllerAs: 'vm',
                        resolve: {
                            tutorials: function tutorials(TutorialsSrv) {
                               return TutorialsSrv.getAllTutorials().then(function(tutorialsArrs){
                                   return tutorialsArrs;
                                });
                            }
                        }
                    }
                );
        }
    ]);
})(angular);
