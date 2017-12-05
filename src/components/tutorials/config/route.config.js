(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.tutorials').config(
        function ($stateProvider) {
            'ngInject';
            $stateProvider
                .state('app.tutorials', {
                    url: '/tipsAndTricks',
                    templateUrl: 'components/tutorials/templates/tutorialsRoadmap.template.html',
                    controller: 'TutorialsRoadmapController',
                    controllerAs: 'vm',
                    resolve: {
                        tutorials: function tutorials(TutorialsSrv) {
                            return TutorialsSrv.getAllTutorials().then(function (tutorialsArrs) {
                                return tutorialsArrs;
                            });
                        }
                    }
                })
                .state('app.tutorial', {
                    url: '/tipsAndTricks/tutorial/:exerciseId',
                    templateUrl: 'components/tutorials/templates/tutorialWorkout.template.html',
                    controller: 'TutorialWorkoutController',
                    controllerAs: 'vm',
                    resolve: {
                        exerciseData: function (TutorialsSrv, $stateParams, $state, ExerciseTypeEnum, ExerciseParentEnum) {
                            var tutorialId = +$stateParams.exerciseId;
                            return TutorialsSrv.getTutorial(tutorialId).then(function () {
                                return {
                                    exerciseId: tutorialId,
                                    exerciseTypeId: ExerciseTypeEnum.TUTORIAL.enum,
                                    exerciseParentTypeId: ExerciseParentEnum.TUTORIAL.enum,
                                    exitAction: function () {
                                        $state.go('app.tutorials');
                                    }
                                };
                            });
                        }
                    }
                });
        });
})(angular);
